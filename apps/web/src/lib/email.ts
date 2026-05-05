import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');

  console.log(`[Email Config] Attempting to initialize with User: ${smtpUser ? 'Defined' : 'UNDEFINED'}, Host: ${smtpHost}:${smtpPort}`);

  if (!smtpUser || !smtpPass) {
    console.error('[Email Config] CRITICAL: SMTP_USER or SMTP_PASS is missing in environment variables.');
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
}



export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  try {
    const transport = getTransporter();
    console.log(`[Email] Attempting to send email to: ${to} with subject: ${subject}`);
    const info = await transport.sendMail({
      from: `"FreightFlow" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Success! Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    throw error;
  }
}



export function getVerificationEmailTemplate(name: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
  
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background: #3b82f6; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">F</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 16px; font-size: 24px;">Verify your email</h2>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">Welcome to FreightFlow! We're excited to have you on board. To get started, please verify your email address by clicking the button below:</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${verifyUrl}" style="background-color: #3b82f6; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);">Verify Email Address</a>
      </div>
      
      <p style="color: #64748b; font-size: 14px; line-height: 1.6;">If you didn't create an account, you can safely ignore this email.</p>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        &copy; 2026 FreightFlow. Manage. Move Ahead.<br>
        This is an automated message, please do not reply.
      </p>
    </div>
  `;
}

export function getConfirmationEmailTemplate(name: string) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-block; padding: 12px; background: #10b981; border-radius: 12px;">
          <span style="color: white; font-size: 24px; font-weight: bold;">✓</span>
        </div>
        <h2 style="color: #0f172a; margin-top: 16px; font-size: 24px;">Email Verified!</h2>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hello ${name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">Your email address has been successfully verified. You can now access all features of the FreightFlow platform.</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Go to Dashboard</a>
      </div>
      
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 32px 0;">
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        &copy; 2026 FreightFlow. Manage. Move Ahead.
      </p>
    </div>
  `;
}

export function getOtpEmailTemplate(otp: string) {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #3b82f6; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">🔐 Password Reset</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">FreightFlow</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="color: #1f2937; font-size: 16px; margin-bottom: 20px;">Hello,</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          We received a request to reset your password. Use the following OTP to proceed:
        </p>
        
        <div style="background-color: #eff6ff; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <p style="color: #1e40af; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 15px 0;">Your OTP Code</p>
          <span style="font-size: 42px; font-weight: 800; color: #2563eb; letter-spacing: 12px; font-family: 'Courier New', Courier, monospace;">${otp}</span>
        </div>
        
        <div style="border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 15px 20px; border-radius: 4px; margin-bottom: 30px;">
          <p style="color: #b91c1c; font-size: 14px; font-weight: bold; margin: 0; display: flex; align-items: center;">
            <span style="margin-right: 8px;">⏰</span> This OTP expires in 10 minutes
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
          If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          For security reasons, do not share this OTP with anyone.
        </p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">This is an automated email from FreightFlow. Please do not reply.</p>
        <p style="color: #3b82f6; font-size: 14px; font-weight: bold; margin: 0;">Powered by FreightFlow</p>
      </div>
    </div>
  `;
}

export function getResetSuccessEmailTemplate(name: string) {
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`;
  
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
      <div style="background-color: #10b981; padding: 40px 20px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">✅ Password Updated</h1>
        <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px; font-weight: 500;">FreightFlow</p>
      </div>
      
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="color: #1f2937; font-size: 16px; margin-bottom: 20px;">Hello ${name},</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
          Your password has been successfully updated. You can now log in to your account with your new password.
        </p>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">Login to Your Account</a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
          If you did not perform this action, please contact support immediately to secure your account.
        </p>
      </div>
      
      <div style="background-color: #f3f4f6; padding: 30px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0 0 10px 0;">This is an automated email from FreightFlow. Please do not reply.</p>
        <p style="color: #10b981; font-size: 14px; font-weight: bold; margin: 0;">FreightFlow Security</p>
      </div>
    </div>
  `;
}

export function getEmployeeWelcomeEmailTemplate({ name, email, password, role }: any) {
  const loginUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`;
  
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05);">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%); padding: 48px 32px; text-align: center;">
        <div style="display: inline-block; padding: 16px; background: rgba(255, 255, 255, 0.1); border-radius: 20px; margin-bottom: 24px;">
           <span style="color: white; font-size: 32px; font-weight: bold;">FF</span>
        </div>
        <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">Welcome to the Team!</h1>
        <p style="color: rgba(255, 255, 255, 0.8); margin: 8px 0 0 0; font-size: 16px;">FreightFlow Digital Workplace</p>
      </div>
      
      <div style="padding: 40px; background-color: #ffffff;">
        <p style="color: #1f2937; font-size: 18px; font-weight: 600; margin-bottom: 16px;">Hello ${name},</p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 32px;">
          Congratulations on joining our organization! We have set up your digital workspace on <b>FreightFlow</b>. You can now access your dashboard using the credentials below:
        </p>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 32px;">
          <div style="margin-bottom: 20px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Login Email</p>
            <p style="color: #0f172a; font-size: 16px; font-weight: 600; margin: 0;">${email}</p>
          </div>
          <div style="margin-bottom: 20px;">
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Temporary Password</p>
            <p style="color: #3b82f6; font-size: 24px; font-weight: 800; margin: 0; font-family: monospace;">${password}</p>
          </div>
          <div>
            <p style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Assigned Role</p>
            <span style="display: inline-block; background-color: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 99px; font-size: 12px; font-weight: 700;">${role?.toUpperCase() || 'STAFF'}</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 32px;">
          <a href="${loginUrl}" style="background-color: #0f172a; color: #ffffff; padding: 18px 36px; border-radius: 14px; text-decoration: none; font-weight: 700; font-size: 16px; display: inline-block; transition: all 0.2s;">Secure Login</a>
        </div>
        
        <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 16px 20px; border-radius: 4px; margin-bottom: 32px;">
          <p style="color: #9a3412; font-size: 14px; font-weight: 600; margin: 0;">
            ⚠️ For security, you will be required to change this password upon your first successful login.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If you have any questions regarding your access or roles, please reach out to the HR department.
        </p>
      </div>
      
      <div style="background-color: #f8fafc; padding: 32px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 12px 0;">FreightFlow Inc. &bull; Manage. Move Ahead.</p>
        <div style="display: flex; justify-content: center; gap: 12px;">
           <span style="color: #cbd5e1; font-size: 14px;">&copy; 2026</span>
        </div>
      </div>
    </div>
  `;
}
