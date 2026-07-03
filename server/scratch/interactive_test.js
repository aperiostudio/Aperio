import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import nodemailer from 'nodemailer';

async function runDiagnostics() {
  const rl = readline.createInterface({ input, output });
  
  console.log('\n================================================');
  console.log('   APERIO STUDIO EMAIL DIAGNOSTICS CENTER       ');
  console.log('================================================\n');

  const email = await rl.question('Enter your Gmail Address (e.g. aperiostudio92@gmail.com): ');
  const cleanEmail = email.trim();

  const passcode = await rl.question('Enter your 16-letter Google App Password (without spaces): ');
  const cleanPasscode = passcode.trim().replace(/\s/g, '');

  console.log('\n[1/3] Testing connection parameters...');
  console.log(`Sending Email from: ${cleanEmail}`);
  console.log(`Target Recipient: aperiostudio92@gmail.com`);

  rl.close();

  try {
    console.log('[2/3] Connecting to secure Google SMTP server (smtp.gmail.com)...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: cleanEmail,
        pass: cleanPasscode
      }
    });

    // Verify SMTP connection
    await transporter.verify();
    console.log('✔ SMTP connection established successfully!');

    console.log('[3/3] Sending test email...');
    const mailOptions = {
      from: `"Diagnostics Test" <${cleanEmail}>`,
      to: 'aperiostudio92@gmail.com',
      subject: 'Aperio Diagnostics: SMTP Connection Working',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
          <h2 style="color: #00f2fe;">Diagnostics Check: SUCCESS</h2>
          <p>This confirm your Nodemailer settings are 100% correct.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('\n================================================');
    console.log('SUCCESS! The test email has been sent successfully.');
    console.log('Message ID:', info.messageId);
    console.log('================================================\n');
    console.log('If you did not get it, please check your Spam / Updates folder.');
  } catch (error) {
    console.log('\n================================================');
    console.log('❌ CONNECTION FAILED. DIAGNOSTICS DETAILS:');
    console.log('================================================\n');
    console.error(error.message);
    
    console.log('\nPossible reasons for this error:');
    if (error.message.includes('Username and Password not accepted')) {
      console.log('1. The 16-letter App Password you entered is incorrect or has a typo.');
      console.log('2. Make sure you generated an "App Password" inside Google Security, not your regular Gmail password.');
    } else if (error.message.includes('connect ECONNREFUSED')) {
      console.log('1. Your current network/firewall is blocking port 465.');
    } else {
      console.log('1. Google requires 2-Step Verification to be enabled on your account before App Passwords work.');
    }
    console.log('================================================\n');
  }
}

runDiagnostics();
