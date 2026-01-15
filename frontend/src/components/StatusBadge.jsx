import { Clock, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    uploaded: {
      variant: 'secondary',
      icon: Clock,
      label: 'Uploaded',
      className: 'bg-gray-100 text-gray-600 hover:bg-gray-100 border-0'
    },
    processing: {
      variant: 'default',
      icon: Loader,
      label: 'Processing',
      className: 'bg-stripe-indigo/10 text-stripe-indigo hover:bg-stripe-indigo/10 border-0'
    },
    completed: {
      variant: 'default',
      icon: CheckCircle,
      label: 'Completed',
      className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0'
    },
    failed: {
      variant: 'destructive',
      icon: AlertCircle,
      label: 'Failed',
      className: 'bg-red-100 text-red-700 hover:bg-red-100 border-0'
    }
  };

  const config = statusConfig[status] || statusConfig.uploaded;
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className={cn('gap-1.5 px-2.5 py-1 font-medium rounded-full', config.className)}>
      <Icon className={cn('w-3.5 h-3.5', status === 'processing' && 'animate-spin')} />
      {config.label}
    </Badge>
  );
};

export default StatusBadge;
