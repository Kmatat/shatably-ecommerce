/**
 * OTP Service
 * Supports: Email (FREE), Console (dev), SMS Misr (paid), Unifonic (paid), Advansys (paid)
 *
 * Recommended setup:
 * - Development: console (logs OTP to terminal)
 * - Production: email (free with Gmail/Brevo) or SMS (paid)
 */

import nodemailer from 'nodemailer';

interface OtpProvider {
  sendOtp(recipient: string, code: string): Promise<boolean>;
  type: 'email' | 'sms' | 'console';
}

// Console provider for development
class ConsoleOtpProvider implements OtpProvider {
  type: 'console' = 'console';

  async sendOtp(recipient: string, code: string): Promise<boolean> {
    console.log('================================');
    console.log('🔐 OTP (Console Provider)');
    console.log(`📧 To: ${recipient}`);
    console.log(`🔑 Code: ${code}`);
    console.log('================================');
    return true;
  }
}

// Email provider (FREE with Gmail, Brevo, or any SMTP)
class EmailOtpProvider implements OtpProvider {
  type: 'email' = 'email';
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    const host = process.env.SMTP_HOST;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465',
        auth: { user, pass },
      });
    }
  }

  async sendOtp(email: string, code: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email SMTP not configured, falling back to console');
      return new ConsoleOtpProvider().sendOtp(email, code);
    }

    try {
      const mailOptions = {
        from: `"Shatably شطابلي" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
        to: email,
        subject: `رمز التحقق - Verification Code: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: rtl;">
            <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0;">شطابلي</h1>
              <p style="color: white; margin: 10px 0 0;">Shatably</p>
            </div>
            <div style="padding: 30px; background: #f9fafb;">
              <h2 style="color: #1f2937; text-align: center;">رمز التحقق الخاص بك</h2>
              <h2 style="color: #1f2937; text-align: center; direction: ltr;">Your Verification Code</h2>
              <div style="background: white; border-radius: 10px; padding: 30px; text-align: center; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #f97316;">${code}</span>
              </div>
              <p style="color: #6b7280; text-align: center;">
                هذا الرمز صالح لمدة 5 دقائق
                <br/>
                This code is valid for 5 minutes
              </p>
              <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                إذا لم تطلب هذا الرمز، يرجى تجاهل هذا البريد
                <br/>
                If you didn't request this code, please ignore this email
              </p>
            </div>
            <div style="background: #1f2937; padding: 20px; text-align: center;">
              <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                © ${new Date().getFullYear()} Shatably - شطابلي لمواد البناء
              </p>
            </div>
          </div>
        `,
        text: `رمز التحقق الخاص بك في شطابلي: ${code}\nYour Shatably verification code is: ${code}\n\nThis code is valid for 5 minutes.`,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Email OTP error:', error);
      return false;
    }
  }
}

// SMS Misr provider (Egypt - paid)
class SmsMisrOtpProvider implements OtpProvider {
  type: 'sms' = 'sms';
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
    this.environment = process.env.SMSMISR_ENVIRONMENT || '2';
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (!this.username || !this.password) {
      console.warn('SMS Misr not configured, falling back to console');
      return new ConsoleOtpProvider().sendOtp(phone, code);
    }

    try {
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('20')) {
        formattedPhone = formattedPhone.substring(2);
      }
      if (formattedPhone.startsWith('0')) {
        formattedPhone = formattedPhone.substring(1);
      }

      const params = new URLSearchParams({
        environment: this.environment,
        username: this.username,
        password: this.password,
        sender: this.senderToken,
        mobile: formattedPhone,
        template: this.templateToken,
        otp: code.substring(0, 10),
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

// Unifonic provider (Egypt - paid)
class UnifonicOtpProvider implements OtpProvider {
  type: 'sms' = 'sms';
  private appSid: string;
  private senderId: string;

  constructor() {
    this.appSid = process.env.UNIFONIC_APP_SID || '';
    this.senderId = process.env.UNIFONIC_SENDER_ID || 'Shatably';
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (!this.appSid) {
      console.warn('Unifonic APP_SID not configured, falling back to console');
      return new ConsoleOtpProvider().sendOtp(phone, code);
    }

    try {
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '2' + formattedPhone;
      }
      if (!formattedPhone.startsWith('20')) {
        formattedPhone = '20' + formattedPhone;
      }

      const message = `رمز التحقق الخاص بك في شطابلي: ${code}\nYour Shatably verification code is: ${code}`;

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

// Advansys SMS provider (Egypt - paid)
class AdvansysOtpProvider implements OtpProvider {
  type: 'sms' = 'sms';
  private apiKey: string;
  private senderId: string;

  constructor() {
    this.apiKey = process.env.ADVANSYS_API_KEY || '';
    this.senderId = process.env.ADVANSYS_SENDER_ID || 'Shatably';
  }

  async sendOtp(phone: string, code: string): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('Advansys API key not configured, falling back to console');
      return new ConsoleOtpProvider().sendOtp(phone, code);
    }

    try {
      // Format phone for Egypt (should be like 201XXXXXXXXX)
      let formattedPhone = phone.replace(/\D/g, '');
      if (formattedPhone.startsWith('0')) {
        formattedPhone = '2' + formattedPhone;
      }
      if (!formattedPhone.startsWith('20')) {
        formattedPhone = '20' + formattedPhone;
      }

      const message = `رمز التحقق الخاص بك في شطابلي: ${code}\nYour Shatably verification code is: ${code}`;

      const response = await fetch('https://hubapi.advansystelecom.com/api/bulkSMS/ForwardSMS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
        },
        body: JSON.stringify({
          senderName: this.senderId,
          mobileNumber: formattedPhone,
          message: message,
        }),
      });

      const data = await response.json() as { success?: boolean; status?: string; message?: string };

      if (response.ok && (data.success === true || data.status === 'success' || response.status === 200)) {
        console.log(`✅ SMS sent to ${phone} via Advansys`);
        return true;
      } else {
        console.error('❌ Advansys SMS failed:', data);
        return false;
      }
    } catch (error) {
      console.error('❌ Advansys SMS error:', error);
      return false;
    }
  }
}

// Factory function to get the appropriate provider
const getOtpProvider = (): OtpProvider => {
  const provider = process.env.OTP_PROVIDER || 'console';

  switch (provider.toLowerCase()) {
    case 'email':
      return new EmailOtpProvider();
    case 'smsmisr':
      return new SmsMisrOtpProvider();
    case 'unifonic':
      return new UnifonicOtpProvider();
    case 'advansys':
      return new AdvansysOtpProvider();
    case 'console':
    default:
      return new ConsoleOtpProvider();
  }
};

// Main OTP service
class OtpService {
  private provider: OtpProvider;

  constructor() {
    this.provider = getOtpProvider();
  }

  /**
   * Get the provider type (email, sms, or console)
   */
  getProviderType(): 'email' | 'sms' | 'console' {
    return this.provider.type;
  }

  /**
   * Send OTP verification code
   * @param recipient - Email address or phone number depending on provider
   * @param code - The OTP code to send
   */
  async sendOtp(recipient: string, code: string): Promise<boolean> {
    return this.provider.sendOtp(recipient, code);
  }

  /**
   * Send order confirmation notification
   */
  async sendOrderConfirmation(recipient: string, orderNumber: string): Promise<boolean> {
    if (this.provider.type === 'email') {
      // For email provider, send a proper email
      const emailProvider = this.provider as EmailOtpProvider;
      // Use the sendOtp method with order info (we'd need to extend this for proper emails)
      console.log(`📧 Order ${orderNumber} confirmation would be sent to ${recipient}`);
      return true;
    }

    // For SMS providers
    const message = `تم تأكيد طلبك رقم ${orderNumber}. شكراً لاختيارك شطابلي!`;
    return this.provider.sendOtp(recipient, message);
  }

  /**
   * Send order shipped notification
   */
  async sendOrderShipped(recipient: string, orderNumber: string, driverPhone?: string): Promise<boolean> {
    let message = `طلبك رقم ${orderNumber} في الطريق إليك.`;
    if (driverPhone) {
      message += ` السائق: ${driverPhone}`;
    }

    if (this.provider.type === 'email') {
      console.log(`📧 Order ${orderNumber} shipped notification would be sent to ${recipient}`);
      return true;
    }

    return this.provider.sendOtp(recipient, message);
  }

  /**
   * Send order delivered notification
   */
  async sendOrderDelivered(recipient: string, orderNumber: string): Promise<boolean> {
    const message = `تم توصيل طلبك رقم ${orderNumber}. شكراً لتعاملك معنا!`;

    if (this.provider.type === 'email') {
      console.log(`📧 Order ${orderNumber} delivered notification would be sent to ${recipient}`);
      return true;
    }

    return this.provider.sendOtp(recipient, message);
  }

  /**
   * Send material list ready notification
   */
  async sendMaterialListReady(recipient: string): Promise<boolean> {
    const message = `قائمة المواد الخاصة بك جاهزة! تم إضافة المنتجات لسلة التسوق.`;

    if (this.provider.type === 'email') {
      console.log(`📧 Material list ready notification would be sent to ${recipient}`);
      return true;
    }

    return this.provider.sendOtp(recipient, message);
  }
}

export const otpService = new OtpService();
export default otpService;
