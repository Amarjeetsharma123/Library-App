import nodemailer from 'nodemailer';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD;
  const from = process.env.SMTP_FROM || user || 'noreply@library.com';

  console.log(`----------------------------------------`);
  console.log(`Email Subject: "${subject}"`);
  console.log(`To: ${to}`);
  
  // Extract OTP or links for easy terminal reading
  const otpMatch = html.match(/>\s*(\d{6})\s*</) || html.match(/>(\d{6})</);
  if (otpMatch) {
    console.log(`[TERMINAL DEBUG] OTP Code: ${otpMatch[1]}`);
  }
  const linkMatch = html.match(/href="([^"]+)"/);
  if (linkMatch) {
    console.log(`[TERMINAL DEBUG] Link: ${linkMatch[1]}`);
  }
  console.log(`----------------------------------------`);

  if (!user || !pass) {
    console.log("SMTP credentials missing. Email preview logged above.");
    return { success: true, mocked: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      auth: {
        user,
        pass,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully: ${info.messageId}`);
    return { success: true, info };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
