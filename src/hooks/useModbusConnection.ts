import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ModbusRegister {
  address: number;
  name: string;
  type: 'control' | 'temperature' | 'status' | 'config';
  dataType: 'uint16' | 'int16' | 'bits';
  writable: boolean;
  description: string;
}

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

export const useModbusConnection = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [ervData, setErvData] = useState<ERVData>({
    supplyTemp: 0,
    exhaustTemp: 0,
    supplyHumidity: 0,
    exhaustHumidity: 0,
    supplyFanSpeed: 10,
    exhaustFanSpeed: 10,
    airflow: 150,
    efficiency: 72,
    status: 'stopped',
    modeSetting: 'auto'
  });

  // Read multiple registers from Modbus device
  const readRegisters = useCallback(async (address: number, quantity: number = 1): Promise<number[]> => {
    try {
      const { data, error } = await supabase.functions.invoke('modbus-read', {
        body: { action: 'read', address, quantity }
      });

      if (error) throw error;
      return data.values;
    } catch (error) {
      console.error('Failed to read registers:', error);
      throw error;
    }
  }, []);

  // Write single register to Modbus device
  const writeRegister = useCallback(async (address: number, value: number): Promise<void> => {
    try {
      const { error } = await supabase.functions.invoke('modbus-read', {
        body: { action: 'write', address, value }
      });

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Register ${address} updated to ${value}`,
      });
    } catch (error) {
      console.error('Failed to write register:', error);
      toast({
        title: "Error",
        description: `Failed to update register: ${error.message}`,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Poll ERV data from Modbus device
  const pollERVData = useCallback(async () => {
    try {
      // Read key registers based on Holtop configuration
      // Addresses from modbusConfig.ts
      const [
        systemStatus,
        supplyTemp,
        exhaustTemp,
        supplyHumidity,
        exhaustHumidity,
        supplyFanSpeed,
        exhaustFanSpeed,
      ] = await Promise.all([
        readRegisters(0x0000, 1), // System status
        readRegisters(0x0064, 1), // Supply temp (100)
        readRegisters(0x0065, 1), // Exhaust temp (101)
        readRegisters(0x0066, 1), // Supply humidity (102)
        readRegisters(0x0067, 1), // Exhaust humidity (103)
        readRegisters(0x0001, 1), // Supply fan speed (1)
        readRegisters(0x0002, 1), // Exhaust fan speed (2)
      ]);

      // Convert raw values to meaningful data
      const avgFanSpeed = ((supplyFanSpeed[0] + exhaustFanSpeed[0]) / 2) * 10; // Assuming 0-10 scale
      const calculatedAirflow = (avgFanSpeed / 100) * 1500;
      const calculatedEfficiency = Math.min(95, 70 + (avgFanSpeed / 100) * 20);

      const status = systemStatus[0] === 1 ? 'running' : 'stopped';

      setErvData({
        supplyTemp: supplyTemp[0] / 10, // Convert to degrees
        exhaustTemp: exhaustTemp[0] / 10,
        supplyHumidity: supplyHumidity[0],
        exhaustHumidity: exhaustHumidity[0],
        supplyFanSpeed: supplyFanSpeed[0] * 10, // Convert to percentage
        exhaustFanSpeed: exhaustFanSpeed[0] * 10,
        airflow: calculatedAirflow,
        efficiency: calculatedEfficiency,
        status,
        modeSetting: 'auto'
      });

      if (!isConnected) {
        setIsConnected(true);
        toast({
          title: "Connected",
          description: "Successfully connected to ERV via Modbus TCP",
        });
      }
    } catch (error) {
      console.error('Failed to poll ERV data:', error);
      setIsConnected(false);
    }
  }, [readRegisters, isConnected, toast]);

  // Set fan speed (0-100%)
  const setFanSpeed = useCallback(async (type: 'supply' | 'exhaust', speed: number) => {
    try {
      const address = type === 'supply' ? 0x0001 : 0x0002;
      const modbusValue = Math.round(speed / 10); // Convert percentage to 0-10 scale
      
      await writeRegister(address, modbusValue);
      
      // Update local state immediately for better UX
      setErvData(prev => ({
        ...prev,
        [`${type}FanSpeed`]: speed
      }));
    } catch (error) {
      console.error(`Failed to set ${type} fan speed:`, error);
    }
  }, [writeRegister]);

  // Start/stop system
  const setSystemStatus = useCallback(async (status: 'running' | 'stopped') => {
    try {
      const value = status === 'running' ? 1 : 0;
      await writeRegister(0x0000, value);
      
      setErvData(prev => ({
        ...prev,
        status
      }));
    } catch (error) {
      console.error('Failed to set system status:', error);
    }
  }, [writeRegister]);

  // Poll data every 2 seconds
  useEffect(() => {
    pollERVData(); // Initial poll
    
    const interval = setInterval(pollERVData, 2000);
    return () => clearInterval(interval);
  }, [pollERVData]);

  return {
    ervData,
    isConnected,
    setFanSpeed,
    setSystemStatus,
    readRegisters,
    writeRegister,
  };
};
