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

      this.transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.username,
          pass: smtpConfig.password
        }
      });

      // Verify connection
      await this.transporter.verify();
      console.log('SMTP connection verified successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize email transporter:', error);
      return false;
    }
  }

  // Send email
  async sendEmail(to, subject, html, attachments = []) {
    try {
      if (!this.transporter) {
        const initialized = await this.initializeTransporter();
        if (!initialized) {
          throw new Error('Email service not initialized');
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
      console.log('Email sent successfully:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error: error.message };
    }
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