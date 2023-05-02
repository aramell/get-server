const https = require("https");
const nodemailer = require("nodemailer");

// https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=8120
const options = {
  hostname: "https://ttp.cbp.dhs.gov",
  path: "/schedulerapi/slot-availability?locationId=8120",
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

// Create a function to send the HTTPS request
function sendRequest() {
  https
    .request(options, (res) => {
      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        const jsonData = JSON.parse(data);
        console.log(data, "<----data");
        console.log(jsonData, "<----JSONData");
        const emailBody = `The response data is ${JSON.stringify(jsonData)}`;
        sendEmail(emailBody);
      });
    })
    .end();
}

// Create a function to send the email
function sendEmail(body) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: "andrew.ramell@gmail.com",
    to: "andrew.ramell@gmail.com",
    subject: "Global Entry Data",
    text: body,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
}

setInterval(() => {
  sendRequest();
}, 900000);
