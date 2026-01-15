import { Clock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    uploaded: {
      variant: 'secondary',
      icon: Clock,
      label: 'Uploaded',
      className: 'bg-slate-100 text-slate-700 hover:bg-slate-100 border border-slate-200'
    },
    processing: {
      variant: 'default',
      icon: Loader,
      label: 'Processing',
      className: 'bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200'
    },
    completed: {
      variant: 'default',
      icon: CheckCircle,
      label: 'Completed',
      className: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
    },
    failed: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'Failed',
      className: 'bg-red-50 text-red-700 hover:bg-red-50 border border-red-200'
    }
  };

  const config = statusConfig[status] || statusConfig.uploaded;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1.5 px-2.5 py-1 font-medium', config.className)}>
      <Icon className={cn('w-3.5 h-3.5', status === 'processing' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
