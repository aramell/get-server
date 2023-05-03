const cron = require("node-cron");

const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");

const app = express();
const locationId = 8120;

// https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=8120
app.get("/send-email", async (req, res) => {
  try {
    // Make the HTTP request
    const response = await axios.get(
      `ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=${locationId}`
    );

    // Send the email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: PROCESS.ENV.EMAIL_ADDRESS,
        pass: PROCESS.ENV.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: "aramell7788@gmail.com",
      to: "andrew.ramell@gmail.com",
      subject: "Appointments",
      text: `HTTP request response: ${response.data}`,
    };

    await transporter.sendMail(mailOptions);

    res.send("Email sent successfully");
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
