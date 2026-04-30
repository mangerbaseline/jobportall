import nodemailer from "nodemailer";

/**
 * Creates a transporter using a Nodemailer Ethereal test account.
 * This is useful for testing without real SMTP credentials.
 */
// async function getTransporter() {
//   // Generate test SMTP service account from ethereal.email
//   const testAccount = await nodemailer.createTestAccount();

//   // Create a reusable transporter object using the default SMTP transport
//   const transporter = nodemailer.createTransport({
//     host: "smtp.ethereal.email",
//     port: 587,
//     secure: false, // true for 465, false for other ports
//     auth: {
//       user: testAccount.user, // generated ethereal user
//       pass: testAccount.pass, // generated ethereal password
//     },
//   });

//   return transporter;
// }

const transpo = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ajeshwork9@gmail.com", // your Gmail address
    pass: "jnvoynpxstebnmwk", // 16-character App Password
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string,
) {
  try {
    const transporter = transpo;

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

/**
 * Sends an interview scheduling email to the candidate.
 */
export async function sendInterviewEmail({
  candidateEmail,
  candidateName,
  jobTitle,
  companyName,
  scheduledDate,
  startTime,
  endTime,
}: {
  candidateEmail: string;
  candidateName: string;
  jobTitle: string;
  companyName: string;
  scheduledDate: Date;
  startTime: string;
  endTime: string;
}) {
  try {
    const transporter = transpo;

    const dateStr = scheduledDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const info = await transporter.sendMail({
      from: '"Job Portal" <no-reply@jobportal.com>',
      to: candidateEmail,
      subject: `🎉 Interview Scheduled — ${jobTitle} at ${companyName}`,
      text: `Hi ${candidateName},\n\nCongratulations! Your application for "${jobTitle}" at ${companyName} has been accepted.\n\nInterview Details:\nDate: ${dateStr}\nTime: ${startTime} – ${endTime}\n\nPlease be prepared and on time. Good luck!\n\n— Job Portal Team`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">🎉 Interview Scheduled!</h1>
            <p style="color: rgba(255,255,255,0.85); margin: 8px 0 0; font-size: 14px;">Your application has been accepted</p>
          </div>

          <!-- Body -->
          <div style="padding: 32px 24px;">
            <p style="color: #334155; font-size: 16px; margin: 0 0 16px;">
              Hi <strong>${candidateName}</strong>,
            </p>
            <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
              Congratulations! Your application for <strong>${jobTitle}</strong> at
              <strong>${companyName}</strong> has been accepted, and an interview has been scheduled.
            </p>

            <!-- Details Card -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #1e293b; margin: 0 0 12px; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
                Interview Details
              </h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px; width: 100px;">📅 Date</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${dateStr}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px;">⏰ Time</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${startTime} – ${endTime}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px;">💼 Position</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${jobTitle}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; color: #64748b; font-size: 13px;">🏢 Company</td>
                  <td style="padding: 6px 0; color: #1e293b; font-size: 14px; font-weight: 600;">${companyName}</td>
                </tr>
              </table>
            </div>

            <p style="color: #475569; font-size: 13px; line-height: 1.6; margin: 0;">
              Please be prepared and on time. We wish you the best of luck!
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              — The Job Portal Team
            </p>
          </div>
        </div>
      `,
    });

    console.log("Interview email sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return true;
  } catch (error) {
    console.error("Error sending interview email:", error);
    return false;
  }
}

interface User {
  name: string;
  email: string;
  role: string;
}
export async function sendRegistrationEmail(user: User) {
  try {
    const transporter = transpo;
    const info = await transporter.sendMail({
      from: '"Job Portal" <ajeshwork9@gmail.com>',
      to: user.email,
      subject: `Welcome to JobPortal !-${user.name}`,
      text: `Successfully Registered in job portal ! Complete your Profile and verify your account .`,
      html: `
    <!DOCTYPE html>
    <html>
    <body style="margin:0; font-family:Arial; background:#f4f6f9;">
        <div style="max-width:500px; margin:40px auto; background:#fff; padding:30px; border-radius:8px; text-align:center;">
            <h2 style="color:#28a745;">✔ Registration Successful</h2>
            <p style="color:#555;">
                Hello <b>${user.name}</b>,<br><br>
                Your account has been created successfully.
            </p>
            <a href="http://localhost:3000/auth/signin"
               style="display:inline-block; margin-top:20px; padding:12px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
               Login Now
            </a>
        </div>
    </body>
    </html>
    `,
    });
    console.log("Interview email sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error("Error sending interview email:", error);
    return false;
  }
}
