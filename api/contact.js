// Vercel serverless 函数：接收联系表单并通过 Gmail SMTP 发送邮件。
// 发件人固定为 SMTP_USER（你的 Gmail）；访客填写的邮箱放入 Reply-To，
// 这样你在收件箱点「回复」就会回到访客的邮箱。
const nodemailer = require("nodemailer");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 去掉换行（防邮件头注入）并限制长度
function sanitizeLine(value, max) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "仅支持 POST 请求" });
  }

  const { SMTP_USER, SMTP_PASS, CONTACT_TO } = process.env;
  if (!SMTP_USER || !SMTP_PASS) {
    console.error("SMTP 凭据未配置：请设置 SMTP_USER 与 SMTP_PASS 环境变量");
    return res.status(500).json({ error: "邮件服务未配置，请稍后再试" });
  }

  // Vercel 通常已自动解析 JSON body，这里兜底处理字符串情形
  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  body = body || {};

  const fullname = sanitizeLine(body.fullname, 100);
  const email = sanitizeLine(body.email, 200);
  const message = String(body.message || "").trim().slice(0, 5000);

  if (!fullname || !email || !message) {
    return res.status(400).json({ error: "请填写姓名、邮箱和留言" });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "邮箱格式不正确" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: { name: "作品集联系表单", address: SMTP_USER },
      to: CONTACT_TO || SMTP_USER,
      replyTo: { name: fullname, address: email },
      subject: `网站留言：来自 ${fullname}`,
      text: `姓名：${fullname}\n邮箱：${email}\n\n留言：\n${message}`,
      html: `<h3>网站联系表单新留言</h3>
        <p><strong>姓名：</strong>${escapeHtml(fullname)}</p>
        <p><strong>邮箱：</strong>${escapeHtml(email)}</p>
        <p><strong>留言：</strong></p>
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>`,
    });
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("邮件发送失败:", error);
    return res.status(502).json({ error: "邮件发送失败，请稍后再试" });
  }
};
