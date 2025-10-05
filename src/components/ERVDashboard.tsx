import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { 
  Thermometer, 
  Wind, 
  Droplets, 
  Power, 
  Settings, 
  AlertTriangle,
  Activity,
  Gauge
} from 'lucide-react';
import { MetricCard } from './MetricCard';
import { StatusIndicator } from './StatusIndicator';
import { ControlPanel } from './ControlPanel';
import { DataChart } from './DataChart';

interface ERVData {
  supplyTemp: number;
  exhaustTemp: number;
  supplyHumidity: number;
  exhaustHumidity: number;
  supplyFanSpeed: number;
  exhaustFanSpeed: number;
  airflow: number;
  efficiency: number;
  status: 'running' | 'stopped' | 'maintenance' | 'error';
  modeSetting: 'auto' | 'manual' | 'economizer';
}

export const ERVDashboard = () => {
  const [ervData, setErvData] = useState<ERVData>({
    supplyTemp: 22.5,
    exhaustTemp: 24.2,
    supplyHumidity: 45,
    exhaustHumidity: 52,
    supplyFanSpeed: 10,
    exhaustFanSpeed: 10,
    airflow: 150,
    efficiency: 72,
    status: 'running',
    modeSetting: 'auto'
  });

  const [isConnected, setIsConnected] = useState(true);

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setErvData(prev => {
        // Calculate average fan speed to determine airflow and efficiency
        const avgFanSpeed = (prev.supplyFanSpeed + prev.exhaustFanSpeed) / 2;
        const baseAirflow = (avgFanSpeed / 100) * 1500; // Max airflow at 100% fan speed
        const baseEfficiency = Math.min(95, 70 + (avgFanSpeed / 100) * 20); // Efficiency increases with speed
        
        return {
          ...prev,
          supplyTemp: prev.supplyTemp + (Math.random() - 0.5) * 0.5,
          exhaustTemp: prev.exhaustTemp + (Math.random() - 0.5) * 0.5,
          supplyHumidity: Math.max(0, Math.min(100, prev.supplyHumidity + (Math.random() - 0.5) * 2)),
          exhaustHumidity: Math.max(0, Math.min(100, prev.exhaustHumidity + (Math.random() - 0.5) * 2)),
          airflow: Math.max(0, baseAirflow + (Math.random() - 0.5) * 50),
          efficiency: Math.max(0, Math.min(100, baseEfficiency + (Math.random() - 0.5) * 2))
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleFanSpeedChange = (type: 'supply' | 'exhaust', speed: number[]) => {
    setErvData(prev => ({
      ...prev,
      [`${type}FanSpeed`]: speed[0]
    }));
  };

  const handleStatusChange = (newStatus: ERVData['status']) => {
    setErvData(prev => ({ ...prev, status: newStatus }));
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