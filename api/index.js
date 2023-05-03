const cron = require("node-cron");

const express = require("express");
const axios = require("axios");
const nodemailer = require("nodemailer");
const { getLogger } = require("nodemailer/lib/shared");
const PORT = process.env.PORT || 3001;

require("dotenv").config();

const app = express();
const locationId = 8120;
app.get("/api", (req, res) => {
  const path = `/api/item/${v4()}`;
  res.setHeader("Content-Type", "text/html");
  res.setHeader("Cache-Control", "s-max-age=1, stale-while-revalidate");
  res.end(`Hello! Go to item: <a href="${path}">${path}</a>`);
});

app.get("/api/item/:slug", (req, res) => {
  const { slug } = req.params;
  res.end(`Item: ${slug}`);
});

// https://ttp.cbp.dhs.gov/schedulerapi/slot-availability?locationId=8120

app.get("/", (req, res) => res.send("Main page"));

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
        subject: "Global Entry not available",
      };
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error sending email");
  }
});

app.listen(PORT);
