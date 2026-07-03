import nodemailer from 'nodemailer';

export async function sendLeadNotification(lead) {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    console.warn('WARNING: EMAIL_USER and EMAIL_PASS environment variables are not configured on Render. Notification email not sent.');
    console.log('Lead Details:', lead);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for port 465
      logger: true, // Log connection data to console
      debug: true,  // Include SMTP traffic in logs
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    const mailOptions = {
      from: `"Aperio Studio Notification" <${emailUser}>`,
      to: 'aperiostudio92@gmail.com',
      subject: `New Lead Submitted: ${lead.businessName || lead.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; padding: 25px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #fafafa; color: #333;">
          <div style="text-align: center; border-bottom: 2px solid #a14fff; padding-bottom: 15px; margin-bottom: 20px;">
            <h2 style="color: #6f26d9; margin: 0; font-size: 1.5rem; letter-spacing: 0.5px;">New Project Ascent Initialized</h2>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 0.85rem;">Aperio Studio Lead Qualification System</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 0.95rem;">
            <tr>
              <td style="padding: 10px 0; font-weight: bold; width: 140px; border-bottom: 1px solid #eee; color: #555;">Lead Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #eee; color: #555;">Email:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${lead.email}" style="color: #00f2fe; text-decoration: none; font-weight: bold;">${lead.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #eee; color: #555;">Business Name:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${lead.businessName || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #eee; color: #555;">Allocated Budget:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #a14fff; font-weight: bold;">${lead.budget || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; font-weight: bold; border-bottom: 1px solid #eee; color: #555; vertical-align: top;">Project Scope:</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #eee; line-height: 1.6; color: #444;">
                <div style="background: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e0e0e0; min-height: 50px;">
                  ${lead.projectDetails || 'No details provided.'}
                </div>
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 30px; border-top: 1px solid #eaeaea; padding-top: 20px; text-align: center; font-size: 0.75rem; color: #999;">
            <p style="margin: 0;">This notification was automatically dispatched by Aperio Studio CRM.</p>
            <p style="margin: 5px 0 0 0;">Render Application Instance: <strong>https://aperio.onrender.com</strong></p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Lead notification email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending lead notification email:', error);
  }
}
