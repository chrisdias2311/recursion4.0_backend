const nodemailer = require('nodemailer')
const fs = require('fs')
const path = require('path')

async function sendBooked(product_name, email) {
    let transporter = nodemailer.createTransport(
        {
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: "jasonsampy88@gmail.com", //add acc
                pass: "pohdsrsqvrvohkzv"//change
            }
        }
    );


    let info = await transporter.sendMail({
        from: 'UniEx <jasonsampy88@gmail.com>',
        to: email,
        subject: "Product Booked",
        attachments: {
            filename: 'Logo.jpeg',
            path: __dirname + '/Logo.jpeg',
            cid: 'logo'
        },
        context: {
            product: product_name,
        },
        html: `
            <body >
            <div >
                <h1 >Your ${product_name} was successfully booked!</h1>
                <h2 >Check your UniEx dashboard for further details. Thanks for choosing UniEx! </h2></div></body>
            `
    })
    console.log("message has been sent: %s", info.messageId);

}



//sendBooked("341JKAD","jasonsampy88@gmail.com")
module.exports = { sendBooked };