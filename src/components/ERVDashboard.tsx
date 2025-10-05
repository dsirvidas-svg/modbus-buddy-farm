import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Power, 
  Settings, 
  Activity,
  Gauge
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { StatusIndicator } from './StatusIndicator';
import { ControlPanel } from './ControlPanel';
import { DataChart } from './DataChart';
import { useModbusConnection } from '@/hooks/useModbusConnection';

export const ERVDashboard = () => {
  const { ervData, isConnected, setFanSpeed, setSystemStatus } = useModbusConnection();

  const handleFanSpeedChange = (type: 'supply' | 'exhaust', speed: number[]) => {
    setFanSpeed(type, speed[0]);
  };

  const handleStatusChange = (newStatus: 'running' | 'stopped' | 'maintenance' | 'error') => {
    if (newStatus === 'running' || newStatus === 'stopped') {
      setSystemStatus(newStatus);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">ERV Control System</h1>
            <p className="text-muted-foreground">Energy Recovery Ventilation - Modbus Control</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusIndicator 
              status={isConnected ? 'connected' : 'disconnected'} 
              label="Modbus Connection" 
            />
            <Badge variant={ervData.status === 'running' ? 'default' : 'secondary'}>
              {ervData.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Supply Temperature"
            value={`${ervData.supplyTemp.toFixed(1)}°C`}
            icon={<Thermometer className="h-5 w-5" />}
            status={ervData.supplyTemp > 25 ? 'warning' : 'normal'}
            trend={ervData.supplyTemp > 23 ? 'up' : 'down'}
          />
          <MetricCard
            title="Exhaust Temperature"
            value={`${ervData.exhaustTemp.toFixed(1)}°C`}
            icon={<Thermometer className="h-5 w-5" />}
            status="normal"
            trend="stable"
          />
          <MetricCard
            title="Supply Humidity"
            value={`${ervData.supplyHumidity.toFixed(0)}%`}
            icon={<Droplets className="h-5 w-5" />}
            status={ervData.supplyHumidity > 60 ? 'warning' : 'normal'}
            trend={ervData.supplyHumidity > 50 ? 'up' : 'down'}
          />
          <MetricCard
            title="System Efficiency"
            value={`${ervData.efficiency.toFixed(0)}%`}
            icon={<Activity className="h-5 w-5" />}
            status={ervData.efficiency > 80 ? 'good' : 'warning'}
            trend="up"
          />
        </div>

        {/* Control Panel and Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DataChart ervData={ervData} />
          </div>
          <div>
            <ControlPanel 
              ervData={ervData}
              onFanSpeedChange={handleFanSpeedChange}
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Airflow Rate</CardTitle>
              <Wind className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {ervData.airflow.toFixed(0)} CFM
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Gauge className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Target: 1200-1300 CFM
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fan Speeds</CardTitle>
              <Power className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Supply Fan</span>
                  <span className="font-medium">{ervData.supplyFanSpeed}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Exhaust Fan</span>
                  <span className="font-medium">{ervData.exhaustFanSpeed}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Status</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Operating Mode</span>
                  <Badge variant="outline">{ervData.modeSetting.toUpperCase()}</Badge>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Heat Recovery</span>
                  <span className="font-medium text-status-active">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};