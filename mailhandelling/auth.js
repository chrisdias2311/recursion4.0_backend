const nodemailer = require('nodemailer')
//const fs = require('fs')
const path = require('path')
async function sendOtp(otp, email) {
    //htmlfile = fs.readFileSync(path.resolve(__dirname,'./emailverif.html'))
    let transporter = nodemailer.createTransport(
        {

            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "jasonsampypvt@gmail.com", //add acc
                pass: "eaockuyawqgmeywj"//change
            }
        }
    );


    try {
        let info = await transporter.sendMail({
            from: 'E-mart <jasonsampypvt@gmail.com>',
            to: email,
            subject: "OTP verification",
            text: "Your otp is " + otp + "do not reply",

            html: `
        <body >
            <div >
            <h3 >Use this verification code to verify your email.</h3>
            <h1 >Your otp is 
        <code>${otp}</code></h1></div></body>
        `
        })
        console.log("message has been sent: %s", info.messageId);
    } catch (err) {
        console.log(err)
    }
}

//sendOtp("341JKAD", "jasonsampy88@gmail.com")
module.exports = { sendOtp };