import * as nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cidadaoalerta.noreply@gmail.com',
        pass: 'PASS'
    }
});

export const sendMail = (async (destinatary: string, subject: string, content: string) => {
    const mailOptions = {
        from: '"Cidadão Alerta" <no-reply@cidadaoalerta.org>',
        to: destinatary,
        subject: subject,
        html: `<p style="font-size: 16px;">Cidadão Alerta</p>
                <br />
                ${content}
                <br />
                <a href="https://cidadaoalerta.org">https://cidadaoalerta.org</a>
            `,
        'h:Reply-To': 'contato@cidadaoalerta.org',
    };

    await transporter.sendMail(mailOptions);

    return true;
});

