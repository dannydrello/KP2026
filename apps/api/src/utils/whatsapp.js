import 'dotenv/config';
import logger from './logger.js';

const WHATSAPP_ENABLED = process.env.WHATSAPP_INTEGRATION_ENABLED === 'true';
const WHATSAPP_API_KEY = process.env.WHATSAPP_API_KEY;
const WHATSAPP_INSTANCE_ID = process.env.WHATSAPP_INSTANCE_ID;
const KITCHEN_WHATSAPP_NUMBER = process.env.KITCHEN_WHATSAPP_NUMBER;

// Format phone number to include country code if not present
function formatPhoneNumber(phone) {
  // Remove spaces and special characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it doesn't start with country code, assume Nigeria (+234)
  if (!cleaned.startsWith('234') && !cleaned.startsWith('+')) {
    // Remove leading 0 if present
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    cleaned = '234' + cleaned;
  }
  
  return cleaned;
}

// Format receipt message
function formatReceiptMessage(orderData, customerData) {
  const { orderId, amount, currency = 'NGN', items = [] } = orderData;
  const { customerName, customerEmail, phone, street, city } = customerData;
  
  const itemsList = items.map(item => {
    const flavorText = item.selectedFlavor ? ` (${item.selectedFlavor})` : '';
    return `• ${item.name}${flavorText} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}`;
  }).join('\n');
  
  const message = `🎉 *KITCHEN PASTRIES - ORDER RECEIPT*

✅ Payment Successful!

📋 *Order Details*
Order ID: ${orderId}
Date: ${new Date().toLocaleString('en-NG')}

👤 *Customer Info*
Name: ${customerName}
Phone: ${phone}
Email: ${customerEmail}
Address: ${street}, ${city}

🍰 *Order Items*
${itemsList || 'No items'}

💰 *Payment Summary*
Total: ₦${amount.toLocaleString()} ${currency}
Status: ✅ Confirmed

Thank you for your order! We'll prepare and deliver as soon as possible.

For support, reply to this message or contact us.

Kitchen Pastries Team 👨‍🍳`;

  return message;
}

// Send WhatsApp message via API
async function sendWhatsAppMessage(phoneNumber, message) {
  if (!WHATSAPP_ENABLED) {
    logger.warn('WhatsApp integration disabled');
    return { success: false, reason: 'WhatsApp disabled' };
  }

  if (!WHATSAPP_API_KEY || !WHATSAPP_INSTANCE_ID) {
    logger.error('WhatsApp credentials not configured');
    return { success: false, reason: 'WhatsApp not configured' };
  }

  try {
    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    
    logger.info('Sending WhatsApp message', { to: formattedPhone });

    // Using Evolution API or similar WhatsApp service
    // Adjust the endpoint based on your WhatsApp service provider
    const response = await fetch(
      `https://api.greenapi.com/waInstance${WHATSAPP_INSTANCE_ID}/sendMessage/${WHATSAPP_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatId: `${formattedPhone}@c.us`,
          message: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      logger.error('WhatsApp API error', { status: response.status, error: errorData });
      return { success: false, reason: `WhatsApp API error: ${response.status}` };
    }

    const data = await response.json();
    logger.info('WhatsApp message sent successfully', { messageId: data.idMessage });
    
    return { success: true, messageId: data.idMessage };
  } catch (error) {
    logger.error('WhatsApp message send error', error.message);
    return { success: false, reason: error.message };
  }
}

// Send receipt to customer
export async function sendCustomerReceipt(orderData, customerData) {
  try {
    const message = formatReceiptMessage(orderData, customerData);
    const result = await sendWhatsAppMessage(customerData.phone, message);
    
    if (result.success) {
      logger.info('Customer receipt sent successfully', { 
        orderId: orderData.orderId,
        phone: customerData.phone 
      });
    } else {
      logger.warn('Failed to send customer receipt', { 
        orderId: orderData.orderId,
        reason: result.reason 
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Error sending customer receipt', error.message);
    return { success: false, reason: error.message };
  }
}

// Send order notification to kitchen
export async function sendKitchenNotification(orderData, customerData) {
  if (!KITCHEN_WHATSAPP_NUMBER) {
    logger.warn('Kitchen WhatsApp number not configured');
    return { success: false, reason: 'Kitchen number not configured' };
  }

  try {
    const { orderId, amount, items = [] } = orderData;
    const { customerName, phone, street, city } = customerData;
    
    const itemsList = items.map(item => {
      const flavorText = item.selectedFlavor ? ` (${item.selectedFlavor})` : '';
      return `• ${item.name}${flavorText} x${item.quantity}`;
    }).join('\n');
    
    const kitchenMessage = `🔔 *NEW ORDER ALERT!*

📋 Order ID: ${orderId}
👤 Customer: ${customerName}
📞 Phone: ${phone}
📍 Address: ${street}, ${city}

🍰 *Items to Prepare*
${itemsList || 'No items specified'}

💰 Amount: ₦${amount.toLocaleString()}
⏰ Time: ${new Date().toLocaleTimeString('en-NG')}

Status: Ready to prepare ✓`;

    const result = await sendWhatsAppMessage(KITCHEN_WHATSAPP_NUMBER, kitchenMessage);
    
    if (result.success) {
      logger.info('Kitchen notification sent', { orderId: orderData.orderId });
    } else {
      logger.warn('Failed to send kitchen notification', { 
        orderId: orderData.orderId,
        reason: result.reason 
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Error sending kitchen notification', error.message);
    return { success: false, reason: error.message };
  }
}

export default {
  sendCustomerReceipt,
  sendKitchenNotification,
  formatReceiptMessage,
};
