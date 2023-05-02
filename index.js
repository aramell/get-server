import https from "https";
import nodemailer from "nodemailer";
import dotenvco from "dotenv";
dotenvco.config();

const locationId = 16277;

// https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=8120
const options = {
  hostname: "ttp.cbp.dhs.gov",
  path: `/schedulerapi/slot-availability?locationId=${locationId}`,
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

function sendRequest() {
  https
    .request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("error", (err) => {
        console.log(err);
      });

      res.on("end", () => {
        const jsonData = JSON.parse(data);
        const appointmentData = jsonData.availableSlots[0].startTimestamp;

        const emailBody = `Global Entry Appointment available at: ${appointmentData}  
        
        - rawData:${JSON.stringify(jsonData)} 
       Book appointment here:  https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP`;
        if (jsonData.availableSlots.length > 0) {
          sendEmail(emailBody);
        } else {
          console.log("no appointments:", new Date());
        }
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
    to: "andrew.ramell@gmail.com ",
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

setInterval(function () {
  console.log("running", new Date());
  sendRequest();
}, 5000);

export default setInterval;
