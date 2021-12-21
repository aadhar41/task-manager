// # Include the Sendinblue library
var SibApiV3Sdk = require('sib-api-v3-sdk');
const sendinblueAPIKey = process.env.SENDINBLUE_API_KEY;
const nodemailer = require("nodemailer");

const host = process.env.SMTP_HOST;
const port = parseInt(process.env.SMTP_PORT);
const secure = (process.env.SMTP_SECURE.toLowerCase() === 'true');
const fromName = process.env.SMTP_FROM_NAME;
const fromEmail = process.env.SMTP_FROM_EMAIL;
const username = process.env.SMTP_USERNAME;
const password = process.env.SMTP_PASSWORD;

// console.log(password);

const sendWelcomeEmail =  (email, name) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure, // true for 465, false for other ports
        auth: {
            user: username,
            pass: password
        },
    });

     // send mail with defined transport object
    let info =  transporter.sendMail({
        from: fromName +' <'+ fromEmail +'>', // sender address
        // from: '"Rohit Sharma 👻" <rs12732@gmail.com>', // sender address
        // to: "aadhar41@gmail.com, rs12732@gmail.com", // list of receivers
        to: email, 
        subject: "Thanks for joining in ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `Welcome to the app, ${name}.  Let me know how you get along with the app.`, // html body
    });

    // console.log("Message sent: %s", info.messageId);
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}


const sendCancelationEmail =  (email, name) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: host,
        port: port,
        secure: secure, // true for 465, false for other ports
        auth: {
            user: username,
            pass: password
        },
    });

     // send mail with defined transport object
    let info =  transporter.sendMail({
        from: fromName +' <'+ fromEmail +'>', // sender address
        to: email, 
        subject: "Sorry to see you go!", // Subject line
        html: `Goodbye, ${name}.  I hope to see you back sometime soon.`, // html body
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancelationEmail
}
