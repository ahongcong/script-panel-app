/**
 * Dashboard Page — Instrument Panel Style
 * 展示统计概览、最近日志、快捷操作
 */
import { useState, useEffect } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { getStats, getMyScripts, getLogs, type Stats, type UserScript, type ExecutionLog } from '@/lib/api';
import { Activity, CheckCircle2, XCircle, Clock, Zap, Timer, RefreshCw, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';

export default function Dashboard() {
  const { config, user, siteName } = useConnection();
  const [, navigate] = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [scripts, setScripts] = useState<UserScript[]>([]);
  const [recentLogs, setRecentLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!config) return;
    setLoading(true);
    try {
      const [statsRes, scriptsRes, logsRes] = await Promise.all([
        getStats(config),
        getMyScripts(config),
        getLogs(config, { limit: 5 }),
      ]);
      if (statsRes.success && statsRes.data) setStats(statsRes.data);
      if (scriptsRes.success && scriptsRes.data) setScripts(scriptsRes.data);
      if (logsRes.success && logsRes.data) setRecentLogs(logsRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [config]);

  const statCards = stats ? [
    { label: '已订阅', value: stats.subscribed_scripts, icon: Zap, color: 'text-primary' },
    { label: '运行中', value: stats.active_scripts, icon: Activity, color: 'text-success' },
    { label: '今日执行', value: stats.executions_today, icon: Timer, color: 'text-info' },
    { label: '今日成功', value: stats.success_today, icon: CheckCircle2, color: 'text-success' },
    { label: '今日失败', value: stats.failed_today, icon: XCircle, color: 'text-destructive' },
    { label: '定时任务', value: stats.cron_enabled, icon: Clock, color: 'text-warning' },
  ] : [];

  return (
    <div className="pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">{siteName}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.username && `欢迎回来，${user.username}`}
            {user?.level_name && <span className="ml-1.5 text-primary">· {user.level_name}</span>}
          </p>
        </div>
        <Button variant="ghost" size="icon" onClick={fetchData} className="text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-3 gap-3">
          {statCards.map((item) => (
            <div key={item.label} className="panel-card flex flex-col items-center py-3 px-2">
              <item.icon className={`w-5 h-5 ${item.color} mb-1.5`} />
              <span className="text-xl font-bold font-mono animate-count-up">{item.value}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* My Scripts Quick Access */}
      {scripts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-semibold">我的脚本</h2>
            <button onClick={() => navigate('/scripts')} className="text-xs text-primary flex items-center gap-0.5">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {scripts.slice(0, 5).map(script => (
              <button
                key={script.id}
                onClick={() => navigate(`/scripts/${script.id}`)}
                className="panel-card w-full text-left flex items-center gap-3 active:scale-[0.98] transition-transform"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-base">{script.type_icon || '📜'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{script.script_name}</span>
                    <StatusBadge status={script.last_status} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                    <span>{script.language}</span>
                    <span>运行 {script.total_runs} 次</span>
                    {script.cron_enabled ? (
                      <span className="text-warning flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" /> 定时
                      </span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent Logs */}
      {recentLogs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-sm font-semibold">最近执行</h2>
            <button onClick={() => navigate('/logs')} className="text-xs text-primary flex items-center gap-0.5">
              查看全部 <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1.5">
            {recentLogs.map(log => (
              <button
                key={log.id}
                onClick={() => navigate(`/logs/${log.id}`)}
                className="w-full flex items-center gap-3 py-2 px-3 rounded-lg bg-card/50 hover:bg-card transition-colors text-left"
              >
                <StatusBadge status={log.status} dot />
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium truncate block">{log.script_name}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {log.account_name && `${log.account_name} · `}
                    {formatTime(log.created_at)}
                  </span>
                </div>
                {log.execution_time != null && (
                  <span className="text-[10px] text-muted-foreground font-mono">{(log.execution_time / 1000).toFixed(1)}s</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && scripts.length === 0 && (
        <div className="text-center py-12">
          <Zap className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无脚本</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/market')}>
            浏览脚本市场
          </Button>
        </div>
      )}
    </div>
  );
}

function formatTime(str: string): string {
  if (!str) return '';
  const d = new Date(str);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return '刚刚';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}
