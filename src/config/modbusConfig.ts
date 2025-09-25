// Holtop ERV Modbus Register Configuration
// Based on official Holtop manual page 25

export interface ModbusRegister {
  address: number;
  name: string;
  description: string;
  type: 'read' | 'write' | 'readwrite';
  dataType: 'uint16' | 'int16' | 'bool' | 'bitfield';
  unit?: string;
  range?: string;
  default?: number | string;
}

export const HOLTOP_MODBUS_REGISTERS: ModbusRegister[] = [
  // Control Registers
  {
    address: 8,
    name: 'modbusAddress',
    description: 'ModBus address',
    type: 'readwrite',
    dataType: 'uint16',
    range: '1-16',
    default: 1
  },
  {
    address: 9,
    name: 'ervPower',
    description: 'ERV ON/OFF',
    type: 'readwrite',
    dataType: 'bool',
    range: '0=OFF, 1=ON'
  },
  {
    address: 10,
    name: 'supplyFanSpeed',
    description: 'Supply fan speed',
    type: 'readwrite',
    dataType: 'uint16',
    range: '0=stop, 2=speed1, 3=speed2, 5=speed3, 8=speed4, 9=speed5, 10=speed6, 11=speed7, 12=speed8, 13=speed9, 14=speed10'
  },
  {
    address: 11,
    name: 'exhaustFanSpeed',
    description: 'Exhaust fan speed',
    type: 'readwrite',
    dataType: 'uint16',
    range: '0=stop, 2=speed1, 3=speed2, 5=speed3, 8=speed4, 9=speed5, 10=speed6, 11=speed7, 12=speed8, 13=speed9, 14=speed10'
  },

  // Temperature Sensors (Read Only)
  {
    address: 12,
    name: 'roomTemperature',
    description: 'Room temperature',
    type: 'read',
    dataType: 'int16',
    unit: '°C'
  },
  {
    address: 13,
    name: 'outdoorTemperature',
    description: 'Outdoor temperature',
    type: 'read',
    dataType: 'int16',
    unit: '°C'
  },
  {
    address: 14,
    name: 'exhaustAirTemperature',
    description: 'Exhaust air temperature',
    type: 'read',
    dataType: 'int16',
    unit: '°C'
  },
  {
    address: 15,
    name: 'defrostingTemperature',
    description: 'Defrosting temperature',
    type: 'read',
    dataType: 'int16',
    unit: '°C'
  },

  // Status and Signal Registers
  {
    address: 16,
    name: 'externalOnOffSignal',
    description: 'External ON/OFF signal',
    type: 'read',
    dataType: 'bool'
  },
  {
    address: 17,
    name: 'co2OnOffSignal',
    description: 'CO2 ON/OFF signal',
    type: 'read',
    dataType: 'bool'
  },
  {
    address: 18,
    name: 'systemStatusBits',
    description: 'Fire alarm/bypass/defrosting signals',
    type: 'read',
    dataType: 'bitfield',
    range: 'B0=fire alarm, B1=bypass on, B2=bypass off, B3=defrosting'
  },
  {
    address: 19,
    name: 'electricalHeaterStage',
    description: 'Electrical heater stage',
    type: 'read',
    dataType: 'uint16'
  },
  {
    address: 20,
    name: 'errorBits',
    description: 'Error symbol',
    type: 'read',
    dataType: 'bitfield',
    range: 'B2=OA temp error, B3=Fr temp error, B4=RA temp error, B5=EEPROM error'
  },

  // Configuration Parameters
  {
    address: 2,
    name: 'bypassOpeningTemp',
    description: 'Bypass opening temperature X',
    type: 'readwrite',
    dataType: 'uint16',
    unit: '°C',
    range: '5-30',
    default: 19
  },
  {
    address: 3,
    name: 'bypassTempRange',
    description: 'Bypass opening temperature range Y',
    type: 'readwrite',
    dataType: 'uint16',
    unit: '°C',
    range: '2-15',
    default: 3
  },
  {
    address: 4,
    name: 'defrostingInterval',
    description: 'Defrosting interval',
    type: 'readwrite',
    dataType: 'uint16',
    unit: 'minutes',
    range: '15-99',
    default: 30
  },
  {
    address: 5,
    name: 'defrostingEnterTemp',
    description: 'Defrosting enter temperature',
    type: 'readwrite',
    dataType: 'int16',
    unit: '°C',
    range: '-9 to 5',
    default: -1
  },
  {
    address: 6,
    name: 'defrostDuration',
    description: 'Defrost duration time',
    type: 'readwrite',
    dataType: 'uint16',
    unit: 'minutes',
    range: '2-20',
    default: 10
  },
  {
    address: 7,
    name: 'co2SensorThreshold',
    description: 'CO2 sensor threshold',
    type: 'readwrite',
    dataType: 'uint16',
    unit: 'ppm',
    range: '392-1960 (hex 28-C8)',
    default: 1020 // hex 66 * 10 + 360
  }
];

// Fan speed mapping helper
export const FAN_SPEED_MAP = {
  0: { name: 'Stop', percentage: 0 },
  2: { name: 'Speed 1', percentage: 10 },
  3: { name: 'Speed 2', percentage: 20 },
  5: { name: 'Speed 3', percentage: 30 },
  8: { name: 'Speed 4', percentage: 40 },
  9: { name: 'Speed 5', percentage: 50 },
  10: { name: 'Speed 6', percentage: 60 },
  11: { name: 'Speed 7', percentage: 70 },
  12: { name: 'Speed 8', percentage: 80 },
  13: { name: 'Speed 9', percentage: 90 },
  14: { name: 'Speed 10', percentage: 100 }
};

// Convert percentage to modbus fan speed value
export const percentageToModbusSpeed = (percentage: number): number => {
  const speedEntries = Object.entries(FAN_SPEED_MAP);
  const closest = speedEntries.reduce((prev, curr) => {
    return Math.abs(curr[1].percentage - percentage) < Math.abs(prev[1].percentage - percentage) ? curr : prev;
  });
  return parseInt(closest[0]);
};

// Convert modbus fan speed value to percentage
export const modbusSpeedToPercentage = (modbusValue: number): number => {
  return FAN_SPEED_MAP[modbusValue as keyof typeof FAN_SPEED_MAP]?.percentage || 0;
};

// System status bit helpers
export const parseSystemStatusBits = (value: number) => ({
  fireAlarm: !!(value & 0x01),      // B0
  bypassOn: !!(value & 0x02),       // B1
  bypassOff: !!(value & 0x04),      // B2
  defrosting: !!(value & 0x08)      // B3
});

// Error bit helpers
export const parseErrorBits = (value: number) => ({
  oaTemperatureError: !!(value & 0x04),    // B2
  frTemperatureError: !!(value & 0x08),    // B3
  raTemperatureError: !!(value & 0x10),    // B4
  eepromError: !!(value & 0x20)            // B5
});