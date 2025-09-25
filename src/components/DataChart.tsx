import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

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

interface DataChartProps {
  ervData: ERVData;
}

interface ChartDataPoint {
  time: string;
  supplyTemp: number;
  exhaustTemp: number;
  efficiency: number;
  airflow: number;
}

export const DataChart = ({ ervData }: DataChartProps) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  useEffect(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const newDataPoint: ChartDataPoint = {
      time: timeString,
      supplyTemp: ervData.supplyTemp,
      exhaustTemp: ervData.exhaustTemp,
      efficiency: ervData.efficiency,
      airflow: ervData.airflow / 10 // Scale down for chart visibility
    };

    setChartData(prev => {
      const updated = [...prev, newDataPoint];
      // Keep only last 20 data points
      return updated.slice(-20);
    });
  }, [ervData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{`Time: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value.toFixed(1)}${
                entry.dataKey === 'supplyTemp' || entry.dataKey === 'exhaustTemp' 
                  ? '°C' 
                  : entry.dataKey === 'efficiency' 
                    ? '%' 
                    : ' (CFM/10)'
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Real-Time Performance Data
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="supplyTemp" 
                stroke="hsl(var(--industrial-cyan))" 
                strokeWidth={2}
                name="Supply Temp"
                dot={{ fill: "hsl(var(--industrial-cyan))", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="exhaustTemp" 
                stroke="hsl(var(--industrial-orange))" 
                strokeWidth={2}
                name="Exhaust Temp"
                dot={{ fill: "hsl(var(--industrial-orange))", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="hsl(var(--industrial-green))" 
                strokeWidth={2}
                name="Efficiency"
                dot={{ fill: "hsl(var(--industrial-green))", r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="airflow" 
                stroke="hsl(var(--industrial-blue))" 
                strokeWidth={2}
                name="Airflow (x10)"
                dot={{ fill: "hsl(var(--industrial-blue))", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Supply Temp</div>
            <div className="text-lg font-semibold" style={{ color: "hsl(var(--industrial-cyan))" }}>
              {ervData.supplyTemp.toFixed(1)}°C
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Exhaust Temp</div>
            <div className="text-lg font-semibold" style={{ color: "hsl(var(--industrial-orange))" }}>
              {ervData.exhaustTemp.toFixed(1)}°C
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Efficiency</div>
            <div className="text-lg font-semibold" style={{ color: "hsl(var(--industrial-green))" }}>
              {ervData.efficiency.toFixed(0)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Airflow</div>
            <div className="text-lg font-semibold" style={{ color: "hsl(var(--industrial-blue))" }}>
              {ervData.airflow.toFixed(0)} CFM
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
