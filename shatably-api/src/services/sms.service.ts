/**
 * SMS Service
 * Supports: Unifonic (recommended for Egypt), Twilio, Console (dev)
 * 
 * Cost-effective setup:
 * - Unifonic: ~0.02 EGP per SMS in Egypt
 * - Start with console logging in development
 */

interface SmsProvider {
  sendSms(phone: string, message: string): Promise<boolean>;
}

// Console provider for development
class ConsoleSmsProvider implements SmsProvider {
  async sendSms(phone: string, message: string): Promise<boolean> {
    console.log('================================');
    console.log('📱 SMS (Console Provider)');
    console.log(`📞 To: ${phone}`);
    console.log(`📝 Message: ${message}`);
    console.log('================================');
    return true;
  }
}

// SMS Misr provider (Egypt)
class SmsMisrProvider implements SmsProvider {
  private username: string;
  private password: string;
  private senderToken: string;
  private templateToken: string;
  private environment: string;

  constructor() {
    this.username = process.env.SMSMISR_USERNAME || '';
    this.password = process.env.SMSMISR_PASSWORD || '';
    this.senderToken = process.env.SMSMISR_SENDER_TOKEN || '';
    this.templateToken = process.env.SMSMISR_TEMPLATE_TOKEN || '';
    this.environment = process.env.SMSMISR_ENVIRONMENT || '2'; // 1=Live, 2=Test
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    if (!this.username || !this.password) {
      console.warn('SMS Misr not configured, falling back to console');
      return new ConsoleSmsProvider().sendSms(phone, message);
    }

    try {
      // Format Egyptian phone number (remove leading 0, use format 2011XXXXXXX)
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('20')) {
        formattedPhone = formattedPhone.substring(2); // Remove country code for SMS Misr
      }
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1); // Remove leading 0
      }

      const params = new URLSearchParams({
        environment: this.environment,
        username: this.username,
        password: this.password,
        sender: this.senderToken,
        mobile: formattedPhone,
        template: this.templateToken,
        otp: message.substring(0, 10), // SMS Misr OTP max 10 chars
      });

      const response = await fetch(`https://smsmisr.com/api/OTP/?${params.toString()}`, {
        method: 'POST',
      });

      const data = await response.json() as { code?: string | number };

      if (data.code === '1901' || data.code === 1901) {
        console.log(`✅ SMS sent to ${phone} via SMS Misr`);
        return true;
      } else {
        console.error('❌ SMS Misr failed:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ SMS Misr error:', error);
      return false;
    }
  }
}

// Unifonic provider (alternative for Egypt)
class UnifonicSmsProvider implements SmsProvider {
  private appSid: string;
  private senderId: string;

  constructor() {
    this.appSid = process.env.UNIFONIC_APP_SID || '';
    this.senderId = process.env.UNIFONIC_SENDER_ID || 'Shatably';
  }

  async sendSms(phone: string, message: string): Promise<boolean> {
    if (!this.appSid) {
      console.warn('Unifonic APP_SID not configured, falling back to console');
      return new ConsoleSmsProvider().sendSms(phone, message);
    }

    try {
      // Format Egyptian phone number for international
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '2' + formattedPhone; // Add Egypt country code
      }
      if (!formattedPhone.startsWith('20')) {
        formattedPhone = '20' + formattedPhone;
      }

      const response = await fetch('https://el.cloud.unifonic.com/rest/SMS/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          AppSid: this.appSid,
          Recipient: formattedPhone,
          Body: message,
          SenderID: this.senderId,
        }),
      });

      const data = await response.json() as { success?: string; Status?: string };

      if (data.success === 'true' || data.Status === 'Sent') {
        console.log(`✅ SMS sent to ${phone}`);
        return true;
      } else {
        console.error('❌ SMS failed:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ SMS error:', error);
      return false;
    }
  }
}

// Factory function to get the appropriate provider
const getSmsProvider = (): SmsProvider => {
  const provider = process.env.SMS_PROVIDER || 'console';

  switch (provider.toLowerCase()) {
    case 'smsmisr':
      return new SmsMisrProvider();
    case 'unifonic':
      return new UnifonicSmsProvider();
    case 'console':
    default:
      return new ConsoleSmsProvider();
  }
};

// Main SMS service
class SmsService {
  private provider: SmsProvider;

  constructor() {
    this.provider = getSmsProvider();
  }

  /**
   * Send OTP verification code
   */
  async sendOtp(phone: string, code: string): Promise<boolean> {
    const message = `رمز التحقق الخاص بك في شطابلي: ${code}\nYour Shatably verification code is: ${code}`;
    return this.provider.sendSms(phone, message);
  }

  /**
   * Send order confirmation
   */
  async sendOrderConfirmation(phone: string, orderNumber: string): Promise<boolean> {
    const message = `تم تأكيد طلبك رقم ${orderNumber} بنجاح. شكراً لاختيارك شطابلي!\nOrder ${orderNumber} confirmed. Thank you for choosing Shatably!`;
    return this.provider.sendSms(phone, message);
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShipped(phone: string, orderNumber: string, driverPhone?: string): Promise<boolean> {
    let message = `طلبك رقم ${orderNumber} في الطريق إليك.\nOrder ${orderNumber} is on its way.`;
    if (driverPhone) {
      message += `\nالسائق: ${driverPhone}\nDriver: ${driverPhone}`;
    }
    return this.provider.sendSms(phone, message);
  }

  /**
   * Send order delivered notification
   */
  async sendOrderDelivered(phone: string, orderNumber: string): Promise<boolean> {
    const message = `تم توصيل طلبك رقم ${orderNumber}. شكراً لتعاملك معنا!\nOrder ${orderNumber} delivered. Thank you!`;
    return this.provider.sendSms(phone, message);
  }

  /**
   * Send material list ready notification
   */
  async sendMaterialListReady(phone: string): Promise<boolean> {
    const message = `قائمة المواد الخاصة بك جاهزة! تم إضافة المنتجات لسلة التسوق.\nYour material list is ready! Products added to cart.`;
    return this.provider.sendSms(phone, message);
  }

  /**
   * Send custom message
   */
  async send(phone: string, message: string): Promise<boolean> {
    return this.provider.sendSms(phone, message);
  }
}

export const smsService = new SmsService();
export default smsService;
