// // utils/email.ts
// import nodemailer from 'nodemailer';

// interface EmailOptions {
//   email: string;
//   subject: string;
//   message: string;
// }

// export class Email {
//   private to: string;
//   private firstName: string;
//   private url: string;
//   private from: string;

//   constructor(user: any, url: string) {
//     this.to = user.email;
//     this.firstName = user.username || 'User';
//     this.url = url;
//     this.from = `NexaHomes <${process.env.EMAIL_FROM}>`;
//   }

//   private newTransport() {
//     return nodemailer.createTransport({
//       host: process.env.EMAIL_HOST,
//       port: Number(process.env.EMAIL_PORT),
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD,
//       },
//     });
//   }

//   private async send(subject: string, html: string) {
//     const mailOptions = {
//       from: this.from,
//       to: this.to,
//       subject,
//       html,
//     };

//     await this.newTransport().sendMail(mailOptions);
//   }

//   async sendWelcome() {
//     const html = `
//       <h1>Welcome, ${this.firstName}!</h1>
//       <p>Thank you for signing up. Visit your profile here: <a href="${this.url}">${this.url}</a></p>
//     `;
//     await this.send('Welcome to NexaHomes!', html);
//   }

//   async sendPasswordReset() {
//     const html = `
//       <p>Hello ${this.firstName},</p>
//       <p>You requested a password reset. Click the link below to reset your password:</p>
//       <a href="${this.url}">Reset Password</a>
//       <p>This link is only valid for 10 minutes.</p>
//     `;
//     await this.send('Your password reset token (valid for 10 minutes)', html);
//   }
// }
