import https from "https";
import nodemailer from "nodemailer";
import dotenvco from "dotenv";
dotenvco.config();

const locationId = 8120;

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
  console.log("running:", new Date());
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

        if (jsonData.availableSlots.length > 0) {
          const appointmentData = jsonData.availableSlots[0].startTimestamp;
          const emailBody = `Global Entry Appointment available at: ${appointmentData}  
            
            - rawData:${JSON.stringify(jsonData)} 
            Book appointment here:  https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP`;
          sendEmail(emailBody);
        } else {
          sendEmail("no appointments available");
        }
      });
    })
    .end();
  return true;
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

setInterval(sendRequest, 5000);

export default sendEmail;
