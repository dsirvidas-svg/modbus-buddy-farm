import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Power, 
  Play, 
  Square, 
  Settings, 
  Fan,
  RotateCcw
} from 'lucide-react';

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

interface ControlPanelProps {
  ervData: ERVData;
  onFanSpeedChange: (type: 'supply' | 'exhaust', speed: number[]) => void;
  onStatusChange: (status: ERVData['status']) => void;
}

export const ControlPanel = ({ ervData, onFanSpeedChange, onStatusChange }: ControlPanelProps) => {
  const handleStart = () => {
    onStatusChange('running');
  };

  const handleStop = () => {
    onStatusChange('stopped');
  };

  const handleReset = () => {
    onStatusChange('stopped');
    // Reset fan speeds to default
    onFanSpeedChange('supply', [50]);
    onFanSpeedChange('exhaust', [50]);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Control Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* System Control */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">System Control</h3>
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleStart}
              disabled={ervData.status === 'running'}
              className="flex items-center gap-2"
              variant={ervData.status === 'running' ? 'secondary' : 'default'}
            >
              <Play className="h-4 w-4" />
              Start
            </Button>
            <Button 
              onClick={handleStop}
              disabled={ervData.status === 'stopped'}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </div>
          <Button 
            onClick={handleReset}
            variant="outline" 
            className="w-full flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset System
          </Button>
        </div>

        {/* Operating Mode */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Operating Mode</h3>
          <Badge variant="outline" className="w-full justify-center py-2">
            {ervData.modeSetting.toUpperCase()} MODE
          </Badge>
        </div>

        {/* Fan Speed Controls */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground">Fan Speed Control</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fan className="h-4 w-4 text-primary" />
                <span className="text-sm">Supply Fan</span>
              </div>
              <span className="text-sm font-medium">{ervData.supplyFanSpeed}%</span>
            </div>
            <Slider
              value={[ervData.supplyFanSpeed]}
              onValueChange={(value) => onFanSpeedChange('supply', value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={ervData.status !== 'running'}
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fan className="h-4 w-4 text-accent" />
                <span className="text-sm">Exhaust Fan</span>
              </div>
              <span className="text-sm font-medium">{ervData.exhaustFanSpeed}%</span>
            </div>
            <Slider
              value={[ervData.exhaustFanSpeed]}
              onValueChange={(value) => onFanSpeedChange('exhaust', value)}
              max={100}
              min={0}
              step={5}
              className="w-full"
              disabled={ervData.status !== 'running'}
            />
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">System Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Power Status</span>
              <Badge variant={ervData.status === 'running' ? 'default' : 'secondary'}>
                {ervData.status === 'running' ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Heat Recovery</span>
              <Switch 
                checked={ervData.status === 'running'} 
                disabled={ervData.status !== 'running'}
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Auto Mode</span>
              <Switch 
                checked={ervData.modeSetting === 'auto'} 
                disabled
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};