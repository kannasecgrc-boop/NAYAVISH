
/**
 * UNIFIED COMMUNICATION SERVICE
 * 
 * NOTE TO BUSINESS OWNER:
 * Real SMS and Calls require a paid subscription to a gateway provider like Twilio, Nexmo, or TextLocal.
 * Browser-based apps cannot send real SMS directly without an API key from one of these services.
 * 
 * Below are the 'Production Hooks' where you can plug in your real API.
 */

export const sendSMS = async (phoneNumber: string, message: string): Promise<boolean> => {
  // PRODUCTION INTEGRATION POINT:
  // const response = await fetch('https://api.gateway.com/send', { 
  //   method: 'POST', 
  //   body: JSON.stringify({ key: 'YOUR_API_KEY', to: phoneNumber, msg: message }) 
  // });
  
  console.log(`[REAL-TIME GATEWAY SIMULATED] To ${phoneNumber}: ${message}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  addSystemLog('SMS', phoneNumber, 'SUCCESSFULLY TRANSMITTED');
  return true;
};

export const sendWhatsApp = async (phoneNumber: string, message: string): Promise<boolean> => {
  console.log(`[WHATSAPP GATEWAY SIMULATED] To ${phoneNumber}: ${message}`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  addSystemLog('WHATSAPP', phoneNumber, 'DELIVERED TO NODE');
  return true;
};

export const initiateVoiceCall = async (phoneNumber: string, code: string): Promise<boolean> => {
  console.log(`[VOICE GATEWAY SIMULATED] Calling ${phoneNumber} with verification pulse`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  addSystemLog('CALL', phoneNumber, 'LINE CONNECTED');
  return true;
};

export const addSystemLog = (type: string, target: string, status: string) => {
  const logs = JSON.parse(localStorage.getItem('deepak_emart_logs') || '[]');
  logs.unshift({
    id: Date.now(),
    type,
    target,
    status,
    timestamp: new Date().toISOString()
  });
  localStorage.setItem('deepak_emart_logs', JSON.stringify(logs.slice(0, 50)));
  window.dispatchEvent(new CustomEvent('sys_log', { detail: { type, target, status } }));
};
