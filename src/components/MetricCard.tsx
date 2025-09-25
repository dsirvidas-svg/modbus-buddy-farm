import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  status: 'normal' | 'warning' | 'error' | 'good';
  trend: 'up' | 'down' | 'stable';
}

export const MetricCard = ({ title, value, icon, status, trend }: MetricCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-status-active';
      case 'warning':
        return 'text-status-warning';
      case 'error':
        return 'text-status-error';
      default:
        return 'text-foreground';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-status-active" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-status-error" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border transition-all duration-300 hover:bg-card/70">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${getStatusColor(status)}`}>
          {value}
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {getTrendIcon(trend)}
            <span className="text-xs text-muted-foreground">
              {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
            </span>
          </div>
          {status !== 'normal' && (
            <Badge 
              variant={status === 'good' ? 'default' : 'destructive'}
              className="text-xs"
            >
              {status.toUpperCase()}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};