import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Modbus TCP configuration
const MODBUS_IP = "192.168.8.159";
const MODBUS_PORT = 502;
const UNIT_ID = 1;

// Modbus function codes
const FUNCTION_CODES = {
  READ_HOLDING_REGISTERS: 0x03,
  READ_INPUT_REGISTERS: 0x04,
  WRITE_SINGLE_REGISTER: 0x06,
  WRITE_MULTIPLE_REGISTERS: 0x10,
};

let transactionId = 0;

// Create Modbus TCP request
function createModbusRequest(
  functionCode: number,
  startAddress: number,
  quantity: number,
  unitId: number = UNIT_ID
): Uint8Array {
  transactionId = (transactionId + 1) % 65536;
  
  const buffer = new Uint8Array(12);
  const view = new DataView(buffer.buffer);
  
  // MBAP Header
  view.setUint16(0, transactionId, false); // Transaction ID
  view.setUint16(2, 0, false); // Protocol ID (0 for Modbus)
  view.setUint16(4, 6, false); // Length (6 bytes following)
  view.setUint8(6, unitId); // Unit ID
  
  // PDU
  view.setUint8(7, functionCode); // Function code
  view.setUint16(8, startAddress, false); // Start address
  view.setUint16(10, quantity, false); // Quantity
  
  return buffer;
}

// Create write single register request
function createWriteSingleRegisterRequest(
  address: number,
  value: number,
  unitId: number = UNIT_ID
): Uint8Array {
  transactionId = (transactionId + 1) % 65536;
  
  const buffer = new Uint8Array(12);
  const view = new DataView(buffer.buffer);
  
  // MBAP Header
  view.setUint16(0, transactionId, false);
  view.setUint16(2, 0, false);
  view.setUint16(4, 6, false);
  view.setUint8(6, unitId);
  
  // PDU
  view.setUint8(7, FUNCTION_CODES.WRITE_SINGLE_REGISTER);
  view.setUint16(8, address, false);
  view.setUint16(10, value, false);
  
  return buffer;
}

// Parse Modbus response
function parseModbusResponse(response: Uint8Array): number[] {
  const view = new DataView(response.buffer);
  const functionCode = view.getUint8(7);
  
  if (functionCode & 0x80) {
    const exceptionCode = view.getUint8(8);
    throw new Error(`Modbus exception: ${exceptionCode}`);
  }
  
  const byteCount = view.getUint8(8);
  const values: number[] = [];
  
  for (let i = 0; i < byteCount / 2; i++) {
    values.push(view.getUint16(9 + i * 2, false));
  }
  
  return values;
}

// Send Modbus request and receive response
async function modbusRequest(request: Uint8Array): Promise<Uint8Array> {
  const conn = await Deno.connect({
    hostname: MODBUS_IP,
    port: MODBUS_PORT,
  });
  
  try {
    await conn.write(request);
    
    const buffer = new Uint8Array(1024);
    const bytesRead = await conn.read(buffer);
    
    if (!bytesRead) {
      throw new Error("No response from Modbus device");
    }
    
    return buffer.slice(0, bytesRead);
  } finally {
    conn.close();
  }
}

// Read holding registers
async function readHoldingRegisters(
  startAddress: number,
  quantity: number
): Promise<number[]> {
  const request = createModbusRequest(
    FUNCTION_CODES.READ_HOLDING_REGISTERS,
    startAddress,
    quantity
  );
  
  const response = await modbusRequest(request);
  return parseModbusResponse(response);
}

// Write single register
async function writeSingleRegister(
  address: number,
  value: number
): Promise<void> {
  const request = createWriteSingleRegisterRequest(address, value);
  const response = await modbusRequest(request);
  
  const view = new DataView(response.buffer);
  const functionCode = view.getUint8(7);
  
  if (functionCode & 0x80) {
    throw new Error("Write failed");
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, address, value, quantity = 1 } = await req.json();
    
    console.log(`Modbus ${action} request:`, { address, value, quantity });

    if (action === 'read') {
      const values = await readHoldingRegisters(address, quantity);
      console.log(`Read values:`, values);
      
      return new Response(JSON.stringify({ values }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else if (action === 'write') {
      await writeSingleRegister(address, value);
      console.log(`Write successful: ${value} to address ${address}`);
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      throw new Error('Invalid action. Use "read" or "write"');
    }
  } catch (error) {
    console.error('Modbus error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorDetails = error instanceof Error ? error.toString() : String(error);
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
