/**
 * Script Detail Page — 脚本详情、环境变量配置、定时任务
 */
import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import {
  getScriptDetail, runScript, stopAllScript, toggleScript,
  updateScriptEnv, updateScriptCron,
  type ScriptDetail as ScriptDetailType, type Account,
} from '@/lib/api';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import StatusBadge from '@/components/StatusBadge';
import {
  ArrowLeft, Play, Square, Power, Clock, Save, Plus, Trash2,
  ChevronDown, ChevronUp, Settings2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ScriptDetail() {
  const { config } = useConnection();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const scriptId = parseInt(params.id || '0');

  const [detail, setDetail] = useState<ScriptDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cronExpr, setCronExpr] = useState('');
  const [cronEnabled, setCronEnabled] = useState(false);
  const [expandedAccounts, setExpandedAccounts] = useState<Set<number>>(new Set([0]));

  const fetchDetail = useCallback(async () => {
    if (!config || !scriptId) return;
    setLoading(true);
    try {
      const res = await getScriptDetail(config, scriptId);
      if (res.success && res.data) {
        setDetail(res.data);
        setAccounts(res.data.accounts || []);
        setCronExpr(res.data.cron_expression || '');
        setCronEnabled(!!res.data.cron_enabled);
      }
    } catch {}
    setLoading(false);
  }, [config, scriptId]);

  useEffect(() => { fetchDetail(); }, [fetchDetail]);

  const handleRun = async () => {
    if (!config) return;
    const res = await runScript(config, scriptId);
    if (res.success) {
      toast.success('脚本已开始执行');
      fetchDetail();
    } else {
      toast.error(res.message || '执行失败');
    }
  };

  const handleStopAll = async () => {
    if (!config) return;
    const res = await stopAllScript(config, scriptId);
    toast[res.success ? 'success' : 'error'](res.message || '操作完成');
    fetchDetail();
  };

  const handleToggle = async () => {
    if (!config) return;
    const res = await toggleScript(config, scriptId);
    if (res.success) {
      toast.success(res.message);
      fetchDetail();
    }
  };

  const handleSaveEnv = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await updateScriptEnv(config, scriptId, accounts);
      toast[res.success ? 'success' : 'error'](res.message || '保存完成');
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const handleSaveCron = async () => {
    if (!config) return;
    setSaving(true);
    try {
      const res = await updateScriptCron(config, scriptId, cronExpr, cronEnabled);
      toast[res.success ? 'success' : 'error'](res.message || '保存完成');
      fetchDetail();
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const addAccount = () => {
    const newAcc: Account = { name: `账号${accounts.length + 1}`, enabled: true, vars: {} };
    if (detail?.required_env_vars) {
      detail.required_env_vars.forEach(v => { newAcc.vars[v.name] = ''; });
    }
    setAccounts([...accounts, newAcc]);
    setExpandedAccounts(prev => { const next = new Set(prev); next.add(accounts.length); return next; });
  };

  const removeAccount = (idx: number) => {
    if (accounts.length <= 1) { toast.error('至少保留一个账号'); return; }
    setAccounts(accounts.filter((_, i) => i !== idx));
  };

  const updateAccountField = (idx: number, field: string, value: any) => {
    const updated = [...accounts];
    if (field === 'name') updated[idx] = { ...updated[idx], name: value };
    else if (field === 'enabled') updated[idx] = { ...updated[idx], enabled: value };
    else updated[idx] = { ...updated[idx], vars: { ...updated[idx].vars, [field]: value } };
    setAccounts(updated);
  };

  const toggleExpand = (idx: number) => {
    const next = new Set(expandedAccounts);
    next.has(idx) ? next.delete(idx) : next.add(idx);
    setExpandedAccounts(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">脚本不存在</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/scripts')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/scripts')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold truncate">{detail.script_name}</h1>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
            <span>{detail.language}</span>
            <span>v{detail.version}</span>
            {detail.type_name && <span>{detail.type_name}</span>}
            <StatusBadge status={detail.last_status} />
          </div>
        </div>
      </div>

      {/* Description */}
      {detail.script_description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{detail.script_description}</p>
      )}

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button size="sm" className="flex-1 h-9 gap-1.5" onClick={handleRun}>
          <Play className="w-3.5 h-3.5" /> 执行
        </Button>
        <Button size="sm" variant="outline" className="h-9 gap-1.5 text-destructive border-destructive/30" onClick={handleStopAll}>
          <Square className="w-3.5 h-3.5" /> 停止全部
        </Button>
        <Button
          size="sm"
          variant="outline"
          className={`h-9 gap-1.5 ${detail.is_active ? 'text-success border-success/30' : 'text-muted-foreground'}`}
          onClick={handleToggle}
        >
          <Power className="w-3.5 h-3.5" /> {detail.is_active ? '启用' : '禁用'}
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="panel-card text-center">
          <p className="text-[10px] text-muted-foreground">上次执行</p>
          <p className="text-xs font-mono mt-1">{detail.last_run_at || '-'}</p>
        </div>
        <div className="panel-card text-center">
          <p className="text-[10px] text-muted-foreground">下次执行</p>
          <p className="text-xs font-mono mt-1">{detail.next_run_at || '-'}</p>
        </div>
      </div>

      {/* Cron Settings */}
      <div className="panel-card space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-warning" />
          <h3 className="text-sm font-semibold">定时任务</h3>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="*/30 * * * * (每30分钟)"
            value={cronExpr}
            onChange={e => setCronExpr(e.target.value)}
            className="bg-secondary/50 border-border/50 h-9 text-xs font-mono flex-1"
          />
          <Switch checked={cronEnabled} onCheckedChange={setCronEnabled} />
        </div>
        <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1" onClick={handleSaveCron} disabled={saving}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          保存定时设置
        </Button>
      </div>

      {/* Environment Variables / Accounts */}
      <div className="panel-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">账号配置</h3>
            <span className="text-[10px] text-muted-foreground">({accounts.length} 个账号)</span>
          </div>
          <Button size="sm" variant="ghost" className="h-7 text-xs gap-1 text-primary" onClick={addAccount}>
            <Plus className="w-3 h-3" /> 添加
          </Button>
        </div>

        {accounts.map((acc, idx) => (
          <div key={idx} className="rounded-lg border border-border/50 overflow-hidden">
            {/* Account header */}
            <button
              onClick={() => toggleExpand(idx)}
              className="w-full flex items-center gap-2 px-3 py-2 bg-secondary/30 text-left"
            >
              <span className={`w-2 h-2 rounded-full ${acc.enabled ? 'bg-success' : 'bg-muted-foreground'}`} />
              <span className="text-xs font-medium flex-1">{acc.name}</span>
              {expandedAccounts.has(idx) ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>

            {/* Account body */}
            {expandedAccounts.has(idx) && (
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Input
                    value={acc.name}
                    onChange={e => updateAccountField(idx, 'name', e.target.value)}
                    className="bg-secondary/50 border-border/50 h-8 text-xs flex-1"
                    placeholder="账号名称"
                  />
                  <Switch
                    checked={acc.enabled}
                    onCheckedChange={v => updateAccountField(idx, 'enabled', v)}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-destructive"
                    onClick={() => removeAccount(idx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>

                {/* Env vars */}
                {detail.required_env_vars.map(envVar => (
                  <div key={envVar.name} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                      {envVar.label || envVar.name}
                      {envVar.required && <span className="text-destructive">*</span>}
                    </Label>
                    <Input
                      type={envVar.type === 'password' ? 'password' : 'text'}
                      placeholder={envVar.placeholder || envVar.description || envVar.name}
                      value={acc.vars[envVar.name] || ''}
                      onChange={e => updateAccountField(idx, envVar.name, e.target.value)}
                      className="bg-secondary/50 border-border/50 h-8 text-xs"
                    />
                  </div>
                ))}

                {/* Custom vars not in required list */}
                {Object.keys(acc.vars).filter(k => !detail.required_env_vars.find(v => v.name === k)).map(key => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{key}</Label>
                    <Input
                      value={acc.vars[key] || ''}
                      onChange={e => updateAccountField(idx, key, e.target.value)}
                      className="bg-secondary/50 border-border/50 h-8 text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        <Button size="sm" className="w-full h-9 gap-1.5" onClick={handleSaveEnv} disabled={saving}>
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          保存环境变量
        </Button>
      </div>
    </div>
  );
}
