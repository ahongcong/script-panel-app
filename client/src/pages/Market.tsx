/**
 * Market Page — 脚本市场
 */
import { useState, useEffect, useCallback } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { getMarketScripts, type MarketScript } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { RefreshCw, Store, CheckCircle2, Users, ChevronRight } from 'lucide-react';
import { useLocation } from 'wouter';

export default function Market() {
  const { config } = useConnection();
  const [, navigate] = useLocation();
  const [scripts, setScripts] = useState<MarketScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchScripts = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const res = await getMarketScripts(config, { page, limit: 20 });
      if (res.success && res.data) {
        setScripts(res.data);
        if (res.pagination) setTotalPages(res.pagination.total_pages);
      }
    } catch {}
    setLoading(false);
  }, [config, page]);

  useEffect(() => { fetchScripts(); }, [fetchScripts]);

  return (
    <div className="pb-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">脚本市场</h1>
        <Button variant="ghost" size="icon" onClick={fetchScripts} className="text-muted-foreground">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {scripts.length === 0 && !loading ? (
        <div className="text-center py-16">
          <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">暂无可用脚本</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {scripts.map(script => (
            <div
              key={script.id}
              onClick={() => {
                if (script.user_script_id) {
                  navigate(`/scripts/${script.user_script_id}`);
                } else {
                  // 未订阅的脚本暂时提示
                  // 由于API没有直接的订阅接口，引导用户去面板操作
                  navigate(`/market/${script.id}`);
                }
              }}
              className="panel-card active:scale-[0.98] transition-transform"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-lg">{script.type_icon || '📦'}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold truncate">{script.name}</span>
                    {script.user_script_id && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" /> 已订阅
                      </span>
                    )}
                  </div>
                  {script.description && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{script.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{script.language}</span>
                    <span>v{script.version}</span>
                    {script.type_name && <span>{script.type_name}</span>}
                    <span className="flex items-center gap-0.5">
                      <Users className="w-2.5 h-2.5" /> {script.subscriber_count}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            上一页
          </Button>
          <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs"
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
