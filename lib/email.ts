import nodemailer from "nodemailer";

/**
 * Creates a transporter using a Nodemailer Ethereal test account.
 * This is useful for testing without real SMTP credentials.
 */
async function getTransporter() {
  // Generate test SMTP service account from ethereal.email
  const testAccount = await nodemailer.createTestAccount();

  // Create a reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  return transporter;
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  try {
    const transporter = await getTransporter();
    
    const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`;

    const info = await transporter.sendMail({
      from: '"Job Portal" <no-reply@jobportal.com>', // sender address
      to: email, // list of receivers
      subject: "Verify your email address", // Subject line
      text: `Please verify your email by clicking the following link: ${verificationUrl}`, // plain text body
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to the Job Portal!</h2>
          <p>Please verify your email address to get full access to all features.</p>
          <a href="${verificationUrl}" style="display: inline-block; padding: 10px 20px; color: white; background-color: #007bff; text-decoration: none; border-radius: 5px;">Verify Email</a>
          <p style="margin-top: 20px; color: #555;">If you didn't request this, please ignore this email.</p>
          <hr />
          <p style="font-size: 12px; color: #aaa;">Link not working? Paste this into your browser: <br/> ${verificationUrl}</p>
        </div>
      `, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    
    return true;
  } catch (error) {
    console.error("Error sending verification email:", error);
    return false;
  }
}
