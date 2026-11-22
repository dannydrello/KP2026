const WHATSAPP_ENABLED = Deno.env.get('WHATSAPP_INTEGRATION_ENABLED') === 'true';
const WHATSAPP_API_KEY = Deno.env.get('WHATSAPP_API_KEY');
const WHATSAPP_INSTANCE_ID = Deno.env.get('WHATSAPP_INSTANCE_ID');
const KITCHEN_WHATSAPP_NUMBER = Deno.env.get('KITCHEN_WHATSAPP_NUMBER');

interface OrderData {
  orderId: string;
  amount: number;
  currency?: string;
  needsReview?: boolean;
  items?: Array<{ name: string; selectedFlavor?: string | null; cakeComment?: string; quantity: number; price: number }>;
}

interface CustomerData {
  customerName?: string;
  customerEmail?: string;
  phone?: string;
  street?: string;
  city?: string;
}

function formatPhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  let cleaned = phone.replace(/\D/g, '');

  // "+234 (0) 806..." - drop the trunk zero
  if (cleaned.startsWith('2340')) cleaned = '234' + cleaned.substring(4);

  if (!cleaned.startsWith('234')) {
    if (cleaned.startsWith('0')) cleaned = cleaned.substring(1);
    cleaned = '234' + cleaned;
  }

  if (cleaned.length < 13) {
    console.warn('Phone number too short, skipping WhatsApp', phone, cleaned);
    return null;
  }

  return cleaned;
}

function formatReceiptMessage(orderData: OrderData, customerData: CustomerData): string {
  const { orderId, amount, currency = 'NGN', items = [] } = orderData;
  const {
    customerName = 'Unknown',
    customerEmail = 'Not provided',
    phone = 'Not provided',
    street = 'Unknown',
    city = 'Unknown',
  } = customerData;

  const itemsList = items
    .map((item) => {
      const flavorText = item.selectedFlavor ? ` (${item.selectedFlavor})` : '';
      const commentText = item.cakeComment ? `\n   Message: "${item.cakeComment}"` : '';
      return `• ${item.name}${flavorText} x${item.quantity} = ₦${(item.price * item.quantity).toLocaleString()}${commentText}`;
    })
    .join('\n');

  return `🎉 *KITCHEN PASTRIES - ORDER RECEIPT*

✅ Payment Successful!

📋 *Order Details*
Order ID: ${orderId}
Date: ${new Date().toLocaleString('en-NG', { timeZone: 'Africa/Lagos' })}

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
}

async function sendWhatsAppMessage(phoneNumber: string | undefined, message: string) {
  if (!WHATSAPP_ENABLED) {
    console.warn('WhatsApp integration disabled');
    return { success: false, reason: 'WhatsApp disabled' };
  }

  if (!WHATSAPP_API_KEY || !WHATSAPP_INSTANCE_ID) {
    console.error('WhatsApp credentials not configured');
    return { success: false, reason: 'WhatsApp not configured' };
  }

  try {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    if (!formattedPhone) {
      return { success: false, reason: 'Invalid phone number' };
    }

    const payload = {
      chatId: `${formattedPhone}@c.us`,
      message,
    };

    const response = await fetch(
      `https://api.green-api.com/waInstance${WHATSAPP_INSTANCE_ID}/sendMessage/${WHATSAPP_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WhatsApp API error', response.status, formattedPhone, errorText);
      return { success: false, reason: `WhatsApp API error: ${response.status}`, details: errorText };
    }

    const data = await response.json();
    return { success: true, messageId: data.idMessage };
  } catch (error) {
    console.error('WhatsApp message send error', (error as Error).message);
    return { success: false, reason: (error as Error).message };
  }
}

export async function sendCustomerReceipt(orderData: OrderData, customerData: CustomerData) {
  const message = formatReceiptMessage(orderData, customerData);
  return await sendWhatsAppMessage(customerData.phone, message);
}

export async function sendKitchenNotification(orderData: OrderData, customerData: CustomerData) {
  if (!KITCHEN_WHATSAPP_NUMBER) {
    console.warn('Kitchen WhatsApp number not configured');
    return { success: false, reason: 'Kitchen number not configured' };
  }

  const { orderId, amount, items = [] } = orderData;
  const { customerName = 'Unknown', phone = 'Not provided', street = 'Unknown', city = 'Unknown' } = customerData;

  const itemsList = items
    .map((item) => {
      const flavorText = item.selectedFlavor ? ` (${item.selectedFlavor})` : '';
      const commentText = item.cakeComment ? `\n   Message: "${item.cakeComment}"` : '';
      return `• ${item.name}${flavorText} x${item.quantity}${commentText}`;
    })
    .join('\n');

  const kitchenMessage = `🔔 *NEW ORDER ALERT!*

📋 Order ID: ${orderId}
👤 Customer: ${customerName}
📞 Phone: ${phone}
📍 Address: ${street}, ${city}

🍰 *Items to Prepare*
${itemsList || 'No items specified'}

💰 Amount: ₦${amount.toLocaleString()}
⏰ Time: ${new Date().toLocaleTimeString('en-NG', { timeZone: 'Africa/Lagos' })}

Status: ${orderData.needsReview ? '⚠️ DO NOT PREPARE YET - check the payment in Paystack' : 'Ready to prepare ✓'}`;

  return await sendWhatsAppMessage(KITCHEN_WHATSAPP_NUMBER, kitchenMessage);
}
