cron.schedule("*/1 * * * *", async () => {
  try {
    // Call the rout
    const response = await axios.get("http://localhost:3000/send-email");
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
});
