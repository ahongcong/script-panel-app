/**
 * Log Detail Page — 日志详情（含输出内容）
 */
import { useState, useEffect } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { getLogDetail, stopLog, type LogDetail as LogDetailType } from '@/lib/api';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { ArrowLeft, Square, Copy, Clock, Timer, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LogDetail() {
  const { config } = useConnection();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const logId = parseInt(params.id || '0');
  const [log, setLog] = useState<LogDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config || !logId) return;
    setLoading(true);
    getLogDetail(config, logId).then(res => {
      if (res.success && res.data) setLog(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [config, logId]);

  const handleStop = async () => {
    if (!config || !logId) return;
    const res = await stopLog(config, logId);
    toast[res.success ? 'success' : 'error'](res.message || '操作完成');
  };

  const copyOutput = () => {
    if (log?.output) {
      navigator.clipboard.writeText(log.output);
      toast.success('已复制到剪贴板');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">日志不存在</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/logs')}>返回列表</Button>
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/logs')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold truncate">{log.script_name}</h1>
            <StatusBadge status={log.status} />
          </div>
          <span className="text-[10px] text-muted-foreground">日志 #{log.id}</span>
        </div>
        {log.status === 'running' && (
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1 text-destructive border-destructive/30" onClick={handleStop}>
            <Square className="w-3 h-3" /> 停止
          </Button>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-2">
        <InfoCard icon={<User className="w-3.5 h-3.5" />} label="账号" value={log.account_name || '-'} />
        <InfoCard icon={<Clock className="w-3.5 h-3.5" />} label="触发方式" value={log.trigger_type === 'manual' ? '手动执行' : log.trigger_type === 'cron' ? '定时任务' : log.trigger_type} />
        <InfoCard icon={<Timer className="w-3.5 h-3.5" />} label="耗时" value={log.execution_time != null ? `${(log.execution_time / 1000).toFixed(2)}s` : '-'} />
        <InfoCard icon={<Clock className="w-3.5 h-3.5" />} label="开始时间" value={log.started_at || '-'} />
      </div>

      {/* Error message */}
      {log.error_message && (
        <div className="panel-card bg-destructive/5 border-destructive/20">
          <p className="text-[10px] text-destructive font-medium mb-1">错误信息</p>
          <p className="text-xs text-destructive/80 font-mono break-all">{log.error_message}</p>
        </div>
      )}

      {/* Output */}
      <div className="panel-card space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold">执行输出</p>
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1 text-muted-foreground" onClick={copyOutput}>
            <Copy className="w-3 h-3" /> 复制
          </Button>
        </div>
        <div className="bg-background rounded-lg p-3 max-h-[60vh] overflow-auto">
          <pre className="text-[11px] font-mono text-foreground/80 whitespace-pre-wrap break-all leading-relaxed">
            {log.output || '(无输出)'}
          </pre>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="panel-card py-2.5 px-3">
      <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-xs font-medium truncate">{value}</p>
    </div>
  );
}
