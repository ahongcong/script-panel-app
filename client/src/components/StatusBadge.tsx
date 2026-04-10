import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string | null | undefined;
  dot?: boolean;
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; dotClass: string; bgClass: string }> = {
  success: { label: '成功', color: 'text-success', dotClass: 'status-dot-success', bgClass: 'bg-success/10 text-success' },
  failed: { label: '失败', color: 'text-destructive', dotClass: 'status-dot-error', bgClass: 'bg-destructive/10 text-destructive' },
  running: { label: '运行中', color: 'text-info', dotClass: 'status-dot-info animate-pulse-glow', bgClass: 'bg-info/10 text-info' },
  timeout: { label: '超时', color: 'text-warning', dotClass: 'status-dot-warning', bgClass: 'bg-warning/10 text-warning' },
  stopped: { label: '已停止', color: 'text-muted-foreground', dotClass: 'bg-muted-foreground', bgClass: 'bg-muted text-muted-foreground' },
};

export default function StatusBadge({ status, dot, className }: StatusBadgeProps) {
  const cfg = statusConfig[status || ''] || { label: status || '-', color: 'text-muted-foreground', dotClass: 'bg-muted-foreground', bgClass: 'bg-muted text-muted-foreground' };

  if (dot) {
    return <div className={cn('status-dot shrink-0', cfg.dotClass, className)} />;
  }

  return (
    <span className={cn('inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium', cfg.bgClass, className)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dotClass)} />
      {cfg.label}
    </span>
  );
}
