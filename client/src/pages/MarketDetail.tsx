/**
 * Market Script Detail — 脚本市场详情（未订阅的脚本）
 * 由于API v1不提供直接订阅接口，引导用户去面板操作
 */
import { useState, useEffect } from 'react';
import { useConnection } from '@/contexts/ConnectionContext';
import { getMarketScripts, type MarketScript } from '@/lib/api';
import { useLocation, useParams } from 'wouter';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Users } from 'lucide-react';

export default function MarketDetail() {
  const { config } = useConnection();
  const [, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const scriptId = parseInt(params.id || '0');
  const [script, setScript] = useState<MarketScript | null>(null);

  useEffect(() => {
    if (!config) return;
    getMarketScripts(config, { limit: 100 }).then(res => {
      if (res.success && res.data) {
        const found = res.data.find(s => s.id === scriptId);
        if (found) setScript(found);
      }
    });
  }, [config, scriptId]);

  if (!script) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground text-sm">加载中...</p>
      </div>
    );
  }

  const panelUrl = config?.serverUrl ? `${config.serverUrl.replace(/\/$/, '')}/market/${scriptId}` : '';

  return (
    <div className="pb-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/market')} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-bold truncate">{script.name}</h1>
      </div>

      <div className="panel-card space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">{script.type_icon || '📦'}</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">{script.name}</h2>
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
              <span>{script.language}</span>
              <span>v{script.version}</span>
              <span className="flex items-center gap-0.5"><Users className="w-2.5 h-2.5" /> {script.subscriber_count} 人订阅</span>
            </div>
          </div>
        </div>

        {script.description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{script.description}</p>
        )}

        {script.user_script_id ? (
          <Button className="w-full h-10" onClick={() => navigate(`/scripts/${script.user_script_id}`)}>
            查看我的订阅
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground text-center">
              订阅脚本需要在面板网页端操作
            </p>
            {panelUrl && (
              <Button
                variant="outline"
                className="w-full h-10 gap-2"
                onClick={() => window.open(panelUrl, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
                前往面板订阅
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
