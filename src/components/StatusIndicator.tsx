import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'active' | 'warning' | 'error';
  label: string;
}

export const StatusIndicator = ({ status, label }: StatusIndicatorProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
      case 'active':
        return {
          icon: <Wifi className="h-4 w-4" />,
          color: 'text-status-active',
          bgColor: 'bg-status-active/10',
          variant: 'default' as const
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'text-status-warning',
          bgColor: 'bg-status-warning/10',
          variant: 'secondary' as const
        };
      case 'error':
        return {
          icon: <XCircle className="h-4 w-4" />,
          color: 'text-status-error',
          bgColor: 'bg-status-error/10',
          variant: 'destructive' as const
        };
      case 'disconnected':
      default:
        return {
          icon: <WifiOff className="h-4 w-4" />,
          color: 'text-status-idle',
          bgColor: 'bg-status-idle/10',
          variant: 'secondary' as const
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      <div className={`p-2 rounded-full ${config.bgColor}`}>
        <div className={config.color}>
          {config.icon}
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Badge variant={config.variant} className="w-fit">
          {status.toUpperCase()}
        </Badge>
      </div>
    </div>
  );
};