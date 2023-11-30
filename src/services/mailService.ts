import { Resend } from 'resend';
import { User } from '../models/User';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendSignInEmail(receiver: User, token: string): Promise<boolean> {
  if (receiver.email) {
    const r = await resend.emails.send({
      from: 'support@teemio.dk',
      to: receiver.email,
      subject: 'Log ind til din Teemio bruger!',
      html: '<html><head><style>.email-container{font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;text-align:center;border:1px solid #ddd;border-radius:8px;background-color:#f8f8f8}.email-header{color:#333;margin-bottom:20px}.email-content{color:#555;margin-bottom:20px}.login-button{padding:10px 20px;background-color:#f86655;color:#fff;text-decoration:none;border-radius:5px;font-size:16px}.footer-text{color:#777;font-size:12px;margin-top:20px}</style></head><body><div class="email-container"><h1 class="email-header">Velkommen til Teemio!</h1><p class="email-content">Du er kun et klik væk fra at få adgang til din konto. Brug venligst linket nedenfor for at logge ind:</p><a href="[Magic Link URL]" class="login-button">Log Ind</a><p class="footer-text">Hvis du ikke anmodede om denne e-mail, bedes du ignorere den.</p></div></body></html>'.replace(
        '[Magic Link URL]',
        `https://localhost:3000/signin?token=${token}`
      ),
    });

    if (r.error) {
      throw new Error('Unable to send email!');
    }

    // Return if all is good
    return true;
  }
  throw new Error('No email on the account!');
}
