/**
 * Logs Page — 执行日志列表
 */
import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { getLogs, type ExecutionLog } from '@/lib/api';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/StatusBadge';
import { RefreshCw, FileText, Filter } from 'lucide-react';

export default function Logs() {
  const { config } = useConnection();
  const [, navigate] = useLocation();
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const fetchLogs = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await getLogs(config, params);
      if (res.success && res.data) {
        setLogs(res.data);
        if (res.pagination) setTotalPages(res.pagination.total_pages);
      }
    } catch {}
    setLoading(false);
  }, [config, page, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filters = [
    { label: '全部', value: '' },
    { label: '成功', value: 'success' },
    { label: '失败', value: 'failed' },
    { label: '运行中', value: 'running' },
  ];

  return (
    <div className="pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">执行日志</h1>
        <Button variant="ghost" size="icon" onClick={fetchLogs} className="text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5 text-muted-foreground" />
        {filters.map(f => (
          <button
            key={f.value}
            onClick={() => { setStatusFilter(f.value); setPage(1); }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
              statusFilter === f.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {logs.length === 0 && !loading ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无执行日志</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {logs.map(log => (
            <button
              key={log.id}
              onClick={() => navigate(`/logs/${log.id}`)}
              className="w-full panel-card flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
            >
              <StatusBadge status={log.status} dot />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium truncate">{log.script_name}</span>
                  <StatusBadge status={log.status} />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                  {log.account_name && <span>{log.account_name}</span>}
                  <span>{log.trigger_type === 'manual' ? '手动' : log.trigger_type === 'cron' ? '定时' : log.trigger_type}</span>
                  <span>{formatDateTime(log.created_at)}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                {log.execution_time != null && (
                  <span className="text-[10px] text-muted-foreground font-mono block">{(log.execution_time / 1000).toFixed(1)}s</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button size="sm" variant="outline" className="h-8 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
            上一页
          </Button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <Button size="sm" variant="outline" className="h-8 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}

function formatDateTime(str: string): string {
  if (!str) return '';
  const d = new Date(str);
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
