const nodemailer = require('nodemailer');
const { SmtpConfig } = require('../models');

class EmailService {
  constructor() {
    this.transporter = null;
  }

  // Initialize email transporter with SMTP config
  async initializeTransporter() {
    try {
      const smtpConfig = await SmtpConfig.findOne({
        where: {
          is_active: true,
          is_default: true
        }
      });

      if (!smtpConfig) {
        console.warn('No active SMTP configuration found');
        return false;
      }

      // Create transporter with better error handling
      this.transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        },
        // Add timeout and retry options
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000,
        // Retry options
        pool: false,
        maxConnections: 1,
        maxMessages: 3
      });

      // Verify connection with timeout
      const verifyPromise = this.transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SMTP connection timeout')), 10000)
      );
      
      await Promise.race([verifyPromise, timeoutPromise]);
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      return false;
    }
  }

  // Send email with fallback options
  async sendEmail(to, subject, html, attachments = []) {
    try {
      // Try primary SMTP first
      if (!this.transporter) {
        const initialized = await this.initializeTransporter();
        if (!initialized) {
          throw new Error('Primary SMTP failed to initialize');
        }
      }

      const smtpConfig = await SmtpConfig.findOne({
        where: { is_active: true, is_default: true }
      });

      if (!smtpConfig) {
        throw new Error('SMTP configuration not found');
      }

      const mailOptions = {
        from: `"${smtpConfig.from_name}" <${smtpConfig.from_email}>`,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: html,
        attachments: attachments
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully via primary SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (primaryError) {
      console.error('Primary SMTP failed:', primaryError.message);
      
      // Try fallback email service (Gmail with different settings)
      try {
        console.log('Attempting fallback email service...');
        const fallbackTransporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.GMAIL_USER || 'your-email@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password'
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        const mailOptions = {
          from: process.env.GMAIL_USER || 'your-email@gmail.com',
          to: Array.isArray(to) ? to.join(', ') : to,
          subject: subject,
          html: html,
          attachments: attachments
        };

        const info = await fallbackTransporter.sendMail(mailOptions);
        console.log('Email sent successfully via fallback service:', info.messageId);
        return { success: true, messageId: info.messageId };
      } catch (fallbackError) {
        console.error('Fallback email service also failed:', fallbackError.message);
        return { success: false, error: `Primary: ${primaryError.message}, Fallback: ${fallbackError.message}` };
      }
    }
  }

  // Send welcome email with login credentials
  async sendWelcomeEmail(email, username, password, firstName) {
    console.log(`Attempting to send welcome email to: ${email}`);
    const subject = 'Welcome to Defect Management System - Your Login Credentials';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Defect Management System</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hello <strong>${firstName}</strong>,</p>
          
          <p>Your account has been successfully created! Here are your login credentials:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #667eea; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">🔐 Login Credentials</h3>
            <p><strong>Username:</strong> <span style="background: #e8f4fd; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-weight: bold;">${username}</span></p>
            <p><strong>Password:</strong> <span style="background: #e8f4fd; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-weight: bold;">${password}</span></p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #856404;">⚠️ Important Security Note</h4>
            <p style="margin-bottom: 0;">Please change your password after your first login for security purposes.</p>
          </div>
          
          <p><strong>Login URL:</strong> <a href="http://localhost:3000/login" style="color: #667eea;">http://localhost:3000/login</a></p>
          
          <p>If you have any questions, please contact the system administrator.</p>
          
          <p>Best regards,<br>
          <strong>Defect Management System Team</strong></p>
        </div>
        
        <div style="background: #f1f1f1; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Send login notification email
  async sendLoginNotification(email, username, firstName, loginTime, ipAddress, userAgent) {
    console.log(`Attempting to send login notification to: ${email}`);
    const subject = '🔐 Login Notification - Defect Management System';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <div style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Login Notification</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <p>Hello <strong>${firstName}</strong>,</p>
          
          <p>We detected a new login to your account. Here are the details:</p>
          
          <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">📱 Login Details</h3>
            <p><strong>Username:</strong> <span style="background: #e8f4fd; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-weight: bold;">${username}</span></p>
            <p><strong>Login Time:</strong> <span style="background: #e8f4fd; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-weight: bold;">${loginTime}</span></p>
            <p><strong>IP Address:</strong> <span style="background: #e8f4fd; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-weight: bold;">${ipAddress}</span></p>
            <p><strong>Device/Browser:</strong> <span style="background: #e8f4fd; padding: 5px 10px; border-radius: 3px; font-family: monospace; font-weight: bold;">${userAgent}</span></p>
          </div>
          
          <div style="background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0c5460;">ℹ️ Security Information</h4>
            <p style="margin-bottom: 0;">If this was you, no action is needed. If you don't recognize this login, please contact the system administrator immediately.</p>
          </div>
          
          <p><strong>System URL:</strong> <a href="http://localhost:3000" style="color: #28a745;">http://localhost:3000</a></p>
          
          <p>Thank you for using our system!</p>
          
          <p>Best regards,<br>
          <strong>Defect Management System Team</strong></p>
        </div>
        
        <div style="background: #f1f1f1; padding: 15px; border-radius: 0 0 8px 8px; text-align: center; color: #666; font-size: 12px;">
          <p>This is an automated security notification. Please do not reply to this email.</p>
        </div>
      </div>
    `;

    return await this.sendEmail(email, subject, html);
  }

  // Send defect assignment notification
  async sendDefectAssignmentNotification(defect, assignee, assigner) {
    const subject = `Defect Assigned: ${defect.title}`;
    const html = `
      <h2>Defect Assignment Notification</h2>
      <p>Hello ${assignee.first_name} ${assignee.last_name},</p>
      <p>A defect has been assigned to you by ${assigner.first_name} ${assigner.last_name}.</p>
      
      <h3>Defect Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${defect.title}</li>
        <li><strong>Description:</strong> ${defect.description}</li>
        <li><strong>Priority:</strong> ${defect.priority?.name || 'Not specified'}</li>
        <li><strong>Severity:</strong> ${defect.severity?.name || 'Not specified'}</li>
        <li><strong>Status:</strong> ${defect.defectStatus?.name || 'Not specified'}</li>
        <li><strong>Project:</strong> ${defect.project?.name || 'Not specified'}</li>
      </ul>
      
      <p>Please log in to the system to view and work on this defect.</p>
      <p>Thank you!</p>
    `;

    return await this.sendEmail(assignee.email, subject, html);
  }

  // Send defect status change notification
  async sendDefectStatusChangeNotification(defect, changedBy, oldStatus, newStatus) {
    const subject = `Defect Status Updated: ${defect.title}`;
    const html = `
      <h2>Defect Status Change Notification</h2>
      <p>Hello,</p>
      <p>The status of defect "${defect.title}" has been updated by ${changedBy.first_name} ${changedBy.last_name}.</p>
      
      <h3>Status Change:</h3>
      <ul>
        <li><strong>From:</strong> ${oldStatus}</li>
        <li><strong>To:</strong> ${newStatus}</li>
        <li><strong>Changed By:</strong> ${changedBy.first_name} ${changedBy.last_name}</li>
        <li><strong>Changed At:</strong> ${new Date().toLocaleString()}</li>
      </ul>
      
      <h3>Defect Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${defect.title}</li>
        <li><strong>Priority:</strong> ${defect.priority?.name || 'Not specified'}</li>
        <li><strong>Severity:</strong> ${defect.severity?.name || 'Not specified'}</li>
        <li><strong>Project:</strong> ${defect.project?.name || 'Not specified'}</li>
      </ul>
      
      <p>Please log in to the system to view the updated defect.</p>
      <p>Thank you!</p>
    `;

    // Send to assignee and assigner
    const recipients = [];
    if (defect.assignee) recipients.push(defect.assignee.email);
    if (defect.assigner) recipients.push(defect.assigner.email);

    if (recipients.length > 0) {
      return await this.sendEmail(recipients, subject, html);
    }

    return { success: true, message: 'No recipients found' };
  }

  // Send project assignment notification
  async sendProjectAssignmentNotification(project, user, role, assignedBy) {
    const subject = `Project Assignment: ${project.name}`;
    const html = `
      <h2>Project Assignment Notification</h2>
      <p>Hello ${user.first_name} ${user.last_name},</p>
      <p>You have been assigned to a project by ${assignedBy.first_name} ${assignedBy.last_name}.</p>
      
      <h3>Project Details:</h3>
      <ul>
        <li><strong>Project:</strong> ${project.name}</li>
        <li><strong>Role:</strong> ${role.name}</li>
        <li><strong>Description:</strong> ${project.description || 'No description provided'}</li>
        <li><strong>Start Date:</strong> ${project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not specified'}</li>
        <li><strong>End Date:</strong> ${project.end_date ? new Date(project.end_date).toLocaleDateString() : 'Not specified'}</li>
      </ul>
      
      <p>Please log in to the system to view your project details and responsibilities.</p>
      <p>Welcome to the team!</p>
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  // Send release creation notification
  async sendReleaseCreationNotification(release, projectTeam) {
    const subject = `New Release Created: ${release.name}`;
    const html = `
      <h2>New Release Notification</h2>
      <p>Hello Team,</p>
      <p>A new release has been created for project "${release.project?.name || 'Unknown Project'}".</p>
      
      <h3>Release Details:</h3>
      <ul>
        <li><strong>Name:</strong> ${release.name}</li>
        <li><strong>Version:</strong> ${release.version}</li>
        <li><strong>Type:</strong> ${release.releaseType?.name || 'Not specified'}</li>
        <li><strong>Planned Date:</strong> ${release.planned_date ? new Date(release.planned_date).toLocaleDateString() : 'Not specified'}</li>
        <li><strong>Status:</strong> ${release.status}</li>
        <li><strong>Description:</strong> ${release.description || 'No description provided'}</li>
      </ul>
      
      <p>Please log in to the system to view release details and test cases.</p>
      <p>Thank you!</p>
    `;

    const recipients = projectTeam.map(member => member.email);
    if (recipients.length > 0) {
      return await this.sendEmail(recipients, subject, html);
    }

    return { success: true, message: 'No team members found' };
  }

  // Send general notification
  async sendGeneralNotification(recipients, subject, message) {
    const html = `
      <h2>System Notification</h2>
      <div>${message}</div>
      <p>Thank you!</p>
      <p><em>Defect Management System</em></p>
    `;

    const emails = Array.isArray(recipients) 
      ? recipients.map(r => typeof r === 'string' ? r : r.email)
      : [typeof recipients === 'string' ? recipients : recipients.email];

    return await this.sendEmail(emails, subject, html);
  }

  // Test SMTP connection
  async testConnection(smtpConfig) {
    try {
      const testTransporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      });

      await testTransporter.verify();
      return { success: true, message: 'SMTP connection successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;