'use server';

import { sendEmail } from '@/lib/email';

interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactMessageAction(data: ContactInput) {
  try {
    const adminEmail = process.env.SMTP_EMAIL || 'support@libsphere.com';

    // 1. Send beautiful HTML email to Admin/Library Manager
    await sendEmail({
      to: adminEmail,
      subject: `[Contact Form] ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Inquiry Received</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 40px 10px 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6;">
                  
                  <!-- Header Logo Banner -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
                            LibSphere
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="color: #e0e7ff; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding-top: 8px;">
                            New Contact Form Submission
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content Section -->
                  <tr>
                    <td style="padding: 40px 32px 32px 32px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        
                        <!-- Greeting -->
                        <tr>
                          <td style="color: #1e293b; font-size: 18px; font-weight: 700; padding-bottom: 20px;">
                            Hello Administrator,
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="color: #475569; font-size: 15px; line-height: 1.6; padding-bottom: 24px;">
                            A visitor has submitted a new inquiry using the contact form on your LibSphere portal. Below are the details of the message:
                          </td>
                        </tr>

                        <!-- Sender Details Card -->
                        <tr>
                          <td style="padding-bottom: 28px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px;">
                              <tr>
                                <td style="padding-bottom: 12px; font-size: 14px;">
                                  <span style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; tracking: 0.5px; display: block; margin-bottom: 2px;">Sender Name</span>
                                  <strong style="color: #0f172a; font-size: 14px;">${data.name}</strong>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 12px; font-size: 14px;">
                                  <span style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; tracking: 0.5px; display: block; margin-bottom: 2px;">Email Address</span>
                                  <a href="mailto:${data.email}" style="color: #4f46e5; text-decoration: none; font-weight: 600;">${data.email}</a>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding-bottom: 12px; font-size: 14px;">
                                  <span style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; tracking: 0.5px; display: block; margin-bottom: 2px;">Subject</span>
                                  <span style="color: #0f172a; font-weight: 600;">${data.subject}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="font-size: 14px;">
                                  <span style="color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 11px; tracking: 0.5px; display: block; margin-bottom: 2px;">Submitted On</span>
                                  <span style="color: #334155;">${new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Message Content Section -->
                        <tr>
                          <td style="color: #0f172a; font-size: 15px; font-weight: 700; padding-bottom: 10px;">
                            Message:
                          </td>
                        </tr>
                        <tr>
                          <td style="background-color: #ffffff; border-left: 4px solid #4f46e5; padding: 16px 20px; border-radius: 0 8px 8px 0; background-color: #f5f3ff; color: #334155; font-size: 15px; line-height: 1.7; white-space: pre-wrap;">${data.message}</td>
                        </tr>

                      </table>
                    </td>
                  </tr>

                  <!-- Footer Section -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #edf2f7; text-align: center;">
                      <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                        This is an automated administrative notification generated by the LibSphere Portal.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    // 2. Send beautiful Receipt/Confirmation HTML email to the visitor
    await sendEmail({
      to: data.email,
      subject: `Inquiry Received: ${data.subject}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>We Received Your Message</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
            <tr>
              <td align="center" style="padding: 40px 10px 40px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #eef2f6;">
                  
                  <!-- Header Logo Banner -->
                  <tr>
                    <td align="center" style="background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%); padding: 32px 20px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        <tr>
                          <td align="center" style="color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">
                            LibSphere
                          </td>
                        </tr>
                        <tr>
                          <td align="center" style="color: #e0e7ff; font-size: 13px; font-weight: 500; text-transform: uppercase; letter-spacing: 1.5px; padding-top: 8px;">
                            Message Successfully Received
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Main Content Section -->
                  <tr>
                    <td style="padding: 40px 32px 32px 32px;">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%">
                        
                        <!-- Greeting -->
                        <tr>
                          <td style="color: #1e293b; font-size: 18px; font-weight: 700; padding-bottom: 16px;">
                            Dear ${data.name},
                          </td>
                        </tr>
                        
                        <tr>
                          <td style="color: #475569; font-size: 15px; line-height: 1.6; padding-bottom: 24px;">
                            Thank you for reaching out to us. We wanted to let you know that we have successfully received your message regarding <strong>"${data.subject}"</strong>. 
                            Our support desk and library administration team are reviewing it, and we will get back to you within 24 hours.
                          </td>
                        </tr>

                        <!-- Summary Card of what they wrote -->
                        <tr>
                          <td style="padding-bottom: 28px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 20px;">
                              <tr>
                                <td style="font-size: 14px; font-weight: bold; color: #1e293b; padding-bottom: 8px;">
                                  Your Message Summary:
                                </td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; font-size: 10px; tracking: 0.5px; display: block; margin-bottom: 2px;">Subject</td>
                                <td style="color: #0f172a; font-size: 14px; font-weight: 600; padding-bottom: 12px;">${data.subject}</td>
                              </tr>
                              <tr>
                                <td style="color: #64748b; font-size: 13px; font-weight: 600; text-transform: uppercase; font-size: 10px; tracking: 0.5px; display: block; margin-bottom: 2px;">Message</td>
                                <td style="color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap; font-style: italic;">"${data.message}"</td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <tr>
                          <td style="color: #475569; font-size: 15px; line-height: 1.6; padding-bottom: 12px;">
                            If you have any urgent queries, you can also connect with us during library operational hours at:
                          </td>
                        </tr>

                        <tr>
                          <td style="color: #475569; font-size: 14px; line-height: 1.6;">
                            • <strong>Phone:</strong> +1 (555) 019-2834<br>
                            • <strong>Location:</strong> 123 Library Lane, Knowledge Hub, NY 10001
                          </td>
                        </tr>

                      </table>
                    </td>
                  </tr>

                  <!-- Footer Section -->
                  <tr>
                    <td style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #edf2f7; text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">
                        The LibSphere Team
                      </p>
                      <p style="margin: 0; color: #94a3b8; font-size: 11px; line-height: 1.5;">
                        This is an automated reply. Please do not reply directly to this email.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return { success: true, message: 'Message sent successfully!' };
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to send contact message.' };
  }
}
