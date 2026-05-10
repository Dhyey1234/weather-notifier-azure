const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");
const sgMail = require("@sendgrid/mail");
const axios = require("axios");

app.timer("dailyWeatherJob", {
    schedule: "0 */10 * * * *",
    handler: async (myTimer, context) => {
        context.log("Daily weather job triggered at", new Date().toISOString());

        const sendGridKey = process.env.SENDGRID_API_KEY;
        const weatherApiKey = process.env.OPENWEATHER_API_KEY;
        const senderEmail = process.env.SENDER_EMAIL;

        if (!sendGridKey || !weatherApiKey || !senderEmail) {
            context.log("❌ Missing required env vars: SENDGRID_API_KEY, OPENWEATHER_API_KEY, or SENDER_EMAIL");
            return;
        }

        sgMail.setApiKey(sendGridKey);

        const tableClient = TableClient.fromConnectionString(
            process.env.AzureWebJobsStorage,
            "subscriptions"
        );

        const entities = tableClient.listEntities();

        for await (const entity of entities) {
            const { email, city } = entity;
            context.log(`Processing subscription for ${email} in ${city}`);

            try {
                const weatherRes = await axios.get(
                    "https://api.openweathermap.org/data/2.5/weather",
                    {
                        params: {
                            q: city,
                            appid: weatherApiKey,
                            units: "metric"
                        }
                    }
                );

                const weather = weatherRes.data;
                const temp = weather.main.temp;
                const feelsLike = weather.main.feels_like;
                const humidity = weather.main.humidity;
                const description = weather.weather[0].description;

                const msg = {
                    to: email,
                    from: senderEmail,
                    subject: `🌤 Daily Weather Update for ${city}`,
                    html: `
                        <h2>Weather Update for ${city}</h2>
                        <p><strong>Condition:</strong> ${description}</p>
                        <p><strong>Temperature:</strong> ${temp}°C (feels like ${feelsLike}°C)</p>
                        <p><strong>Humidity:</strong> ${humidity}%</p>
                        <br/>
                        <small>You are subscribed to daily weather updates from Weather Notifier.</small>
                    `
                };

                await sgMail.send(msg);
                context.log(`✅ Email sent to ${email}`);

            } catch (err) {
                context.log(`❌ Failed for ${email} (${city}):`, err.message);
            }
        }
    }
});
