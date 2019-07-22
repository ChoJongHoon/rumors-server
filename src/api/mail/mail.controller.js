import nodemailer from "nodemailer";
import smtpPool from "nodemailer-smtp-pool";
import {} from "dotenv/config";

exports.sendCode = async ctx => {
  const config = {
    mailer: {
      service: process.env.MAIL_SERVICE,
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      user: process.env.MAIL_USER,
      password: process.env.MAIL_PASSWORD
    }
  };

  const from = "Rumors < huni452@gmail.com >";
  const to = ctx.request.body.id;
  const subject = "Rumors 인증 번호입니다.";
  const html = "인증번호 : " + ctx.request.body.code;
  // const text = 'This is just text.';

  const mailOptions = {
    from,
    to,
    subject,
    html
    // text,
  };
  // 본문에 html이나 text를 사용할 수 있다.

  const transporter = await nodemailer.createTransport(
    smtpPool({
      service: config.mailer.service,
      host: config.mailer.host,
      port: config.mailer.port,
      auth: {
        user: config.mailer.user,
        pass: config.mailer.password
      },
      tls: {
        rejectUnauthorize: false
      },
      maxConnections: 5,
      maxMessages: 10
    })
  );

  // 메일을 전송하는 부분
  transporter.sendMail(mailOptions, (err, res) => {
    if (err) {
      console.log(err);
    } else {
      console.log(res);
    }

    transporter.close();
  });

  ctx.body = {
    id: ctx.request.body.id,
    code: ctx.request.body.code
  };
};
