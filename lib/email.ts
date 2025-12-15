import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Organization email to receive notifications
const ORG_EMAIL = process.env.ORG_NOTIFICATION_EMAIL || 'info@getfund.org';
const FROM_EMAIL = process.env.FROM_EMAIL || 'GETFund <notifications@getfund.org>';

interface PledgeData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_country_code: string;
  phone_number: string;
  country: string;
  address?: string;
  donation_description: string;
  created_at: string;
}

export async function sendPledgeNotification(pledge: PledgeData): Promise<boolean> {
  // Skip if no API key configured
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping notification - RESEND_API_KEY not configured');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [ORG_EMAIL],
      subject: `New Pledge to Support from ${pledge.first_name} ${pledge.last_name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #16a34a, #15803d); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; }
            .field { margin-bottom: 15px; }
            .label { font-weight: bold; color: #374151; font-size: 14px; }
            .value { color: #111827; margin-top: 4px; }
            .description-box { background: white; padding: 15px; border-radius: 6px; border: 1px solid #d1d5db; margin-top: 10px; }
            .footer { background: #f3f4f6; padding: 15px 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; }
            .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Pledge to Support Received</h1>
            </div>
            <div class="content">
              <p style="margin-top: 0;"><span class="badge">New Submission</span></p>

              <div class="field">
                <div class="label">Full Name</div>
                <div class="value">${pledge.first_name} ${pledge.last_name}</div>
              </div>

              <div class="field">
                <div class="label">Email Address</div>
                <div class="value"><a href="mailto:${pledge.email}">${pledge.email}</a></div>
              </div>

              <div class="field">
                <div class="label">Phone Number</div>
                <div class="value">${pledge.phone_country_code} ${pledge.phone_number}</div>
              </div>

              <div class="field">
                <div class="label">Country</div>
                <div class="value">${pledge.country}</div>
              </div>

              ${pledge.address ? `
              <div class="field">
                <div class="label">Address</div>
                <div class="value">${pledge.address}</div>
              </div>
              ` : ''}

              <div class="field">
                <div class="label">Donation Description / Pledge Details</div>
                <div class="description-box">${pledge.donation_description.replace(/\n/g, '<br>')}</div>
              </div>
            </div>
            <div class="footer">
              <p style="margin: 0;">Submitted on ${new Date(pledge.created_at).toLocaleString('en-GB', {
                dateStyle: 'full',
                timeStyle: 'short'
              })}</p>
              <p style="margin: 8px 0 0 0;">Reference ID: ${pledge.id}</p>
              <p style="margin: 8px 0 0 0;">View all pledges in the <a href="${process.env.CMS_URL || 'https://cms.getfund.org'}/admin/pledges">CMS Admin Panel</a></p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
New Pledge to Support Received

Full Name: ${pledge.first_name} ${pledge.last_name}
Email: ${pledge.email}
Phone: ${pledge.phone_country_code} ${pledge.phone_number}
Country: ${pledge.country}
${pledge.address ? `Address: ${pledge.address}` : ''}

Donation Description:
${pledge.donation_description}

---
Submitted: ${new Date(pledge.created_at).toLocaleString()}
Reference ID: ${pledge.id}
      `.trim(),
    });

    if (error) {
      console.error('[Email] Failed to send pledge notification:', error);
      return false;
    }

    console.log('[Email] Pledge notification sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Error sending pledge notification:', error);
    return false;
  }
}

// Generic email sending function for future use
export async function sendEmail(options: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] Skipping email - RESEND_API_KEY not configured');
    return false;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error('[Email] Failed to send email:', error);
      return false;
    }

    console.log('[Email] Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}
