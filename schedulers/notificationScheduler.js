import initKnex from "knex";
import configuration from "../knexfile.js";
import cron from "node-cron";

const knex = initKnex(configuration);

export const runNotificationScheduler = () => {
    console.log("Notification scheduler started...");

  //  cron.schedule("0 0 * * *", async() => { -- This is run the job at 12 AM everyday

    cron.schedule("*/2 * * * *", async() => { //Job runs for every 2 mins for testing purpose
        try{
            console.log("Scanning grocery items for notifications...");

            const today = new Date().toISOString().split("T")[0];

            // Fetch all users with items that need alerts
            const usersWithItems = await knex("grocery_items")
            .select("user_id", "id", "item_name", "status", "quantity", "unit", "expiration_date", "threshold_qty", "threshold_alert")
                .where(function () {
                    this.where("status", "low")
                        .orWhere("status", "finished")
                        .orWhere("status", "expired")
                        .orWhere("expiration_date", "<=", today)
                        .orWhere("threshold_alert", "<=", today);
                });

                if (usersWithItems.length === 0) {
                    console.log("No new notifications required.");
                    return;
                }
                for (const item of usersWithItems) {
                    const { user_id, item_name, status, quantity, expiration_date, threshold_qty, threshold_alert } = item;
    
                    let message = "";
    
                    if (status === "finished") {
                        message = `Notice: ${item_name} is finished.`;
                    } else if (status === "low" || quantity <= threshold_qty) {
                        message = `Reminder: ${item_name} is running low.`;
                    } else if (status === "expired" && expiration_date && today >= expiration_date) {
                        message = `Alert! ${item_name} has expired.`;
                    } else if (threshold_alert && today >= threshold_alert && today < expiration_date) {
                        message = `Heads up! ${item_name} will expire soon (Exp: ${expiration_date}).`;
                    } 
                    const existingNotification = await knex("alerts")
                    .where({ user_id, item_name, status })
                    .first();

                if (!existingNotification) {
                    // Insert new notification
                    await knex("alerts").insert({
                        user_id,
                        item_name,
                        status,
                        message,
                        alert_date: today,
                    });

                    console.log(`Notification added for ${item_name}: ${message}`);
                }
            }
        } catch (error) {
            console.error("Error in notification scheduler:", error.message);
        }
    });

};
