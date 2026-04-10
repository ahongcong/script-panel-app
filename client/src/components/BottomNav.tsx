/**
 * Bottom Navigation — 底部Tab导航栏
 * 工业仪表盘风格，5个主要入口
 */
import { useLocation } from 'wouter';
import { LayoutDashboard, Code2, Store, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', icon: LayoutDashboard, label: '仪表盘' },
  { path: '/scripts', icon: Code2, label: '脚本' },
  { path: '/market', icon: Store, label: '市场' },
  { path: '/logs', icon: FileText, label: '日志' },
  { path: '/settings', icon: Settings, label: '设置' },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    if (path === '/') return location === '/';
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-lg border-t border-border/50 safe-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-1.5">
        {tabs.map(tab => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-all',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'relative p-1 rounded-lg transition-colors',
                active && 'bg-primary/10'
              )}>
                <tab.icon className={cn('w-5 h-5', active && 'drop-shadow-[0_0_4px_theme(--color-primary)]')} />
              </div>
              <span className={cn('text-[10px]', active ? 'font-semibold' : 'font-medium')}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
