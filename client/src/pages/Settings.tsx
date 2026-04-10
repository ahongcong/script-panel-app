/**
 * Settings Page — 个人信息 & 连接管理
 */
import { useConnection } from '@/contexts/ConnectionContext';
import { Button } from '@/components/ui/button';
import {
  User, Server, KeyRound, Shield, Clock, LogOut, ExternalLink,
  ChevronRight, Crown, Zap,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Settings() {
  const { config, user, siteName, disconnect } = useConnection();

  const panelUrl = config?.serverUrl?.replace(/\/$/, '') || '';

  return (
    <div className="pb-4 space-y-5">
      <h1 className="text-lg font-bold">设置</h1>

      {/* User Profile Card */}
      {user && (
        <div className="panel-card glow-blue">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{user.username}</span>
                {user.role === 'admin' && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded">
                    <Shield className="w-2.5 h-2.5" /> 管理员
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* User stats */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-border/30">
            <div className="text-center">
              <p className="text-lg font-bold font-mono text-primary">{user.subscribed_count}</p>
              <p className="text-[10px] text-muted-foreground">已订阅</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-mono">{user.effective_max_subscriptions || '∞'}</p>
              <p className="text-[10px] text-muted-foreground">最大订阅</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold font-mono">{user.effective_max_processes || '∞'}</p>
              <p className="text-[10px] text-muted-foreground">最大并发</p>
            </div>
          </div>
        </div>
      )}

      {/* Level info */}
      {user?.level_name && (
        <div className="panel-card flex items-center gap-3">
          <Crown className="w-5 h-5 text-warning" />
          <div className="flex-1">
            <p className="text-xs font-semibold">用户等级</p>
            <p className="text-[11px] text-muted-foreground">{user.level_name}</p>
          </div>
          {user.effective_max_accounts_per_script > 0 && (
            <span className="text-[10px] text-muted-foreground">
              每脚本最多 {user.effective_max_accounts_per_script} 账号
            </span>
          )}
        </div>
      )}

      {/* Expiry info */}
      {user?.expires_at && (
        <div className="panel-card flex items-center gap-3">
          <Clock className="w-5 h-5 text-info" />
          <div className="flex-1">
            <p className="text-xs font-semibold">到期时间</p>
            <p className="text-[11px] text-muted-foreground">{user.expires_at}</p>
          </div>
          {new Date(user.expires_at) < new Date() && (
            <span className="text-[10px] text-destructive font-medium">已到期</span>
          )}
        </div>
      )}

      {/* Connection info */}
      <div className="panel-card space-y-3">
        <h3 className="text-xs font-semibold flex items-center gap-1.5">
          <Server className="w-3.5 h-3.5 text-muted-foreground" />
          连接信息
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between py-1">
            <span className="text-[11px] text-muted-foreground">服务器</span>
            <span className="text-[11px] font-mono truncate max-w-[200px]">{config?.serverUrl}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[11px] text-muted-foreground">站点名称</span>
            <span className="text-[11px]">{siteName}</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-[11px] text-muted-foreground">API Token</span>
            <span className="text-[11px] font-mono">{config?.apiToken ? config.apiToken.substring(0, 8) + '****' : '-'}</span>
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="panel-card space-y-1">
        <h3 className="text-xs font-semibold mb-2">快捷入口</h3>
        {panelUrl && (
          <>
            <LinkItem
              icon={<Zap className="w-4 h-4" />}
              label="打开面板"
              onClick={() => window.open(panelUrl, '_blank')}
            />
            <LinkItem
              icon={<KeyRound className="w-4 h-4" />}
              label="API Token 管理"
              onClick={() => window.open(`${panelUrl}/api-docs`, '_blank')}
            />
          </>
        )}
      </div>

      {/* Logout */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" className="w-full h-10 gap-2 text-destructive border-destructive/30 hover:bg-destructive/10">
            <LogOut className="w-4 h-4" />
            断开连接
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-[320px] bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-sm">确认断开连接？</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              断开后需要重新输入服务器地址和API密钥才能使用
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-xs">取消</AlertDialogCancel>
            <AlertDialogAction onClick={disconnect} className="h-8 text-xs bg-destructive text-destructive-foreground hover:bg-destructive/90">
              断开
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Version */}
      <p className="text-center text-[10px] text-muted-foreground pt-2">
        Script Panel App v1.0.0
      </p>
    </div>
  );
}

function LinkItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 px-1 rounded-lg hover:bg-secondary/50 transition-colors">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-xs font-medium flex-1 text-left">{label}</span>
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
    </button>
  );
}
