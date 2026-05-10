const { app } = require("@azure/functions");
const { TableClient } = require("@azure/data-tables");

const CORS_HEADERS = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

app.http("createSubscription", {
    methods: ["GET", "POST", "OPTIONS"],
    authLevel: "anonymous",
    route: "createSubscription",
    handler: async (request, context) => {
        context.log("🔥 FUNCTION STARTED");
        context.log("METHOD:", request.method);

        if (request.method === "OPTIONS") {
            return { status: 204, headers: CORS_HEADERS };
        }

        try {
            let body;
            try {
                body = await request.json();
            } catch {
                return {
                    status: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: "Invalid or missing JSON body" })
                };
            }

            context.log("PARSED BODY:", body);

            const { email, city, time, days } = body;

            if (!email || !city) {
                return {
                    status: 400,
                    headers: CORS_HEADERS,
                    body: JSON.stringify({ error: "Missing email or city" })
                };
            }

            // Save subscription to Azure Table Storage
            const tableClient = TableClient.fromConnectionString(
                process.env.AzureWebJobsStorage,
                "subscriptions"
            );

            try {
                await tableClient.createTable();
            } catch {
                // Table already exists — ignore
            }

            const entity = {
                partitionKey: "subscription",
                rowKey: email.replace(/[@.]/g, "_"),
                email,
                city,
                time: time || "",
                days: days || ""
            };

            await tableClient.upsertEntity(entity, "Replace");
            context.log("✅ Subscription saved for:", email);

            return {
                status: 200,
                headers: CORS_HEADERS,
                body: JSON.stringify({ message: "Subscription saved! You will receive daily weather updates." })
            };

        } catch (err) {
            context.log("❌ ERROR CAUGHT:", err.message);

            return {
                status: 500,
                headers: CORS_HEADERS,
                body: JSON.stringify({ error: err.message })
            };
        }
    }
});