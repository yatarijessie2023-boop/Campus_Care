import nodemailer from 'nodemailer';

function getTransporter() {
  if (!process.env.SMTP_HOST) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined
  });
}

export async function sendStatusEmail({ to, reportNo, status, reply }) {
  const transporter = getTransporter();
  if (!to) throw new Error('通報人 Email 不可為空');
  if (!transporter) return { sent: false, reason: 'smtp_not_configured' };
  await transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: `案件 ${reportNo} 狀態更新`,
    text: `您的通報案件目前狀態為：${status}\n管理員回覆：${reply || '尚無回覆'}`
  });
  return { sent: true };
}
