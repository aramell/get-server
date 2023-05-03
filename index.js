const cron = require("node-cron");

const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");

require("dotenv").config();

const app = express();
const locationId = 8120;

// https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=8120
app.get("/send-email", async (req, res) => {
  try {
    // Make the HTTP request
    const response = await axios.get(
      `https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=${locationId}`
    );

    console.log(response.data);
    // Send the email

    if (response.data.availableSlots.length > 0) {
      console.log("Slots available");
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const mailOptions = {
        from: "aramell7788@gmail.com",
        to: "andrew.ramell@gmail.com",
        subject: "Global Entry appointment available!",
        text: `Next available appointment: ${response.data.availableSlots[0].startTimestamp} rawData: ${response.data.availableSlots}
        
        sign up here: https://ttp.cbp.dhs.gov/schedulerui/schedule-interview/location?lang=en&vo=true&returnUrl=ttp-external&service=UP
        `,
      };

      await transporter.sendMail(mailOptions);

      res.send("Email sent successfully");
    } else {
      console.log("No slots available");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email");
  }
});

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});

cron.schedule("*/1 * * * *", async () => {
  try {
    // Call the route
    const response = await axios.get("http://localhost:3000/send-email");
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
});
