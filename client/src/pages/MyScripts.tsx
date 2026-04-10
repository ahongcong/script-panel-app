/**
 * My Scripts Page — 脚本列表
 */
import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { getMyScripts, runScript, toggleScript, type UserScript } from '@/lib/api';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { Play, Power, RefreshCw, Clock, ChevronRight, Zap } from 'lucide-react';
import { toast } from 'sonner';

export default function MyScripts() {
  const { config } = useConnection();
  const [, navigate] = useLocation();
  const [scripts, setScripts] = useState<UserScript[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchScripts = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const res = await getMyScripts(config);
      if (res.success && res.data) setScripts(res.data);
    } catch {}
    setLoading(false);
  }, [config]);

  useEffect(() => { fetchScripts(); }, [fetchScripts]);

  const handleRun = async (e: React.MouseEvent, script: UserScript) => {
    e.stopPropagation();
    if (!config) return;
    try {
      const res = await runScript(config, script.id);
      if (res.success) {
        toast.success(`${script.script_name} 已开始执行`);
        fetchScripts();
      } else {
        toast.error(res.message || '执行失败');
      }
    } catch (err: any) {
      toast.error(err.message || '执行失败');
    }
  };

  const handleToggle = async (e: React.MouseEvent, script: UserScript) => {
    e.stopPropagation();
    if (!config) return;
    try {
      const res = await toggleScript(config, script.id);
      if (res.success) {
        toast.success(res.message || '操作成功');
        fetchScripts();
      } else {
        toast.error(res.message || '操作失败');
      }
    } catch {}
  };

  return (
    <div className="pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">我的脚本</h1>
        <Button variant="ghost" size="icon" onClick={fetchScripts} className="text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {scripts.length === 0 && !loading ? (
        <div className="text-center py-16">
          <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无订阅的脚本</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/market')}>
            浏览脚本市场
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {scripts.map(script => (
            <div
              key={script.id}
              onClick={() => navigate(`/scripts/${script.id}`)}
              className="panel-card active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">{script.type_icon || '📜'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{script.script_name}</span>
                    <StatusBadge status={script.last_status} />
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] text-muted-foreground mt-1">
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{script.language}</span>
                    <span>v{script.version}</span>
                    {script.type_name && <span>{script.type_name}</span>}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground">
                <span>运行 <strong className="text-foreground font-mono">{script.total_runs}</strong> 次</span>
                <span>成功 <strong className="text-success font-mono">{script.success_runs}</strong></span>
                {script.running_count > 0 && (
                  <span className="text-info flex items-center gap-0.5">
                    <span className="status-dot status-dot-info animate-pulse-glow" />
                    运行中 {script.running_count}
                  </span>
                )}
                {script.cron_enabled ? (
                  <span className="text-warning flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {script.cron_expression}
                  </span>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-2.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs flex-1 gap-1"
                  onClick={(e) => handleRun(e, script)}
                >
                  <Play className="w-3 h-3" /> 执行
                </Button>
                <Button
                  size="sm"
                  variant={script.is_active ? 'outline' : 'secondary'}
                  className={`h-7 text-xs flex-1 gap-1 ${script.is_active ? 'text-success border-success/30' : 'text-muted-foreground'}`}
                  onClick={(e) => handleToggle(e, script)}
                >
                  <Power className="w-3 h-3" /> {script.is_active ? '已启用' : '已禁用'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
