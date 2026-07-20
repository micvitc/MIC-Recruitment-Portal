import nodemailer from 'nodemailer';

/**
 * Escape HTML special characters to prevent XSS when embedding
 * user-supplied or admin-supplied strings in HTML email bodies.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}


const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;

// Initialize Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Defaulting to Gmail since "app password" usually implies Gmail
  auth: {
    user: smtpEmail,
    pass: smtpPassword,
  },
});

export async function sendApplicationReceipt(userEmail: string, deptName: string) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping receipt for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: `Quest Accepted: ${deptName} Application Received!`,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 4px solid #000;">
          <h1 style="color: #A93710; text-transform: uppercase;">Application Received!</h1>
          <p>Hello,</p>
          <p>This is a confirmation that your stage 1 application for the <strong>${deptName}</strong> quest at the Microsoft Innovations Club has been successfully submitted.</p>
          <p>Our admins will review your gear and stats. You will receive an update soon!</p>
          <p>Keep checking the portal for your status.</p>
          <br/>
          <p>- MIC Core Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[MAILER] Failed to send receipt:', error);
  }
}

export async function sendStageUpdate(userEmail: string, status: string, notes?: string) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping status update for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  const isAccepted = status === 'passed';
  if (!isAccepted) {
    console.log(`[MAILER] Rejection/failed email blocked for ${userEmail} as per settings.`);
    return;
  }

  const color = '#10b981';
  const title = 'LEVEL UP! Quest Advanced';
  const body = 'Congratulations! You have successfully passed this stage of the recruitment process. Please check the portal for instructions on the next stage.';

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 4px solid ${color};">
          <h1 style="color: ${color}; text-transform: uppercase;">${title}</h1>
          <p>Hello,</p>
          <p>${body}</p>
          ${notes ? `<div style="margin-top: 20px; padding: 15px; background-color: #e2e8f0; border: 2px dashed #000;"><p><strong>Admin Notes:</strong> ${escapeHtml(notes)}</p></div>` : ''}
          <br/>
          <p>- MIC Core Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[MAILER] Failed to send stage update:', error);
  }
}

export async function sendInterviewBookingConfirmation(
  userEmail: string,
  timeString: string,
  locationDetails: string,
  isOnline: boolean,
  meetingLink?: string
) {
  if (!smtpEmail || !smtpPassword) {
    console.warn(`[MAILER] Skipping booking confirmation for ${userEmail}. SMTP credentials are not set.`);
    return;
  }

  const title = "MIC Recruitment - Interview Confirmed!";
  const locationText = isOnline ? `Online (Google Meet)` : `Offline (${locationDetails})`;

  try {
    await transporter.sendMail({
      from: `"MIC Recruitment" <${smtpEmail}>`,
      to: userEmail,
      subject: title,
      html: `
        <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border: 4px solid #14b8a6;">
          <h1 style="color: #14b8a6; text-transform: uppercase;">Interview Confirmed!</h1>
          <p>Hello,</p>
          <p>Your interview slot has been successfully scheduled. Here are the details:</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #ffffff; border: 2px dashed #14b8a6; line-height: 1.6;">
            <p><strong>Time:</strong> ${timeString}</p>
            <p><strong>Format:</strong> ${locationText}</p>
            ${isOnline && meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}" target="_blank" style="color: #14b8a6; font-weight: bold;">Join Meeting</a></p>` : ''}
            ${!isOnline ? `<p><strong>Location:</strong> ${locationDetails}</p>` : ''}
          </div>
          <p>Please make sure to be on time. Good luck!</p>
          <br/>
          <p>- MIC Core Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('[MAILER] Failed to send booking confirmation:', error);
  }
}
