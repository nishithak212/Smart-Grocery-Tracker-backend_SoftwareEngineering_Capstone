import cron from "node-cron";
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

// Function to check grocery items and trigger notifications, update shopping list
const checkGroceryItems = async () => {
  try {
    console.log("Running GroceryGenie Cron Job...");

    const currentDate = new Date().toISOString().split("T")[0];

    // Fetch items that should be in the shopping list
    const shoppingListItems = await knex("grocery_items")
      .select(
        "id",
        "user_id",
        "item_name",
        "quantity",
        "status",
        "expiration_date",
        "threshold_alert"
      )
      .where(function () {
        this.where("status", "low")
          .orWhere("status", "finished")
          .orWhere("status", "expired")
          .orWhereRaw("DATE(threshold_alert) = ?", [currentDate]) // Trigger alert when threshold date arrives
          .orWhereRaw("DATE(expiration_date) < ?", [currentDate]); // Check if item is expired
      });

    if (shoppingListItems.length > 0) {
      console.log("Updating Shopping List with these items:");
      shoppingListItems.forEach((item) => {
        console.log(
          `- ${item.item_name} (Status: ${item.status}, Expiry: ${item.expiration_date})`
        );
      });
    } else {
      console.log("No items need to be added to the shopping list.");
    }

    for (const item of shoppingListItems) {
      const {
        id,
        user_id,
        item_name,
        status,
        expiration_date,
        threshold_alert,
      } = item;
      let alertMessage = "";

      // Notification messages
      if (status === "low") {
        alertMessage = `${item_name} is running low. Restock soon!`;
      } else if (status === "finished") {
        alertMessage = `${item_name} is finished.`;
      } else if (status === "expired") {
        alertMessage = ` ${item_name} has expired. Please discard it!`;
      } else if (threshold_alert === currentDate) {
        alertMessage = `${item_name} will expire soon on ${expiration_date}.`;
      }

      // Avoid duplicate notifications and ignore notifications marked as read
      const existingNotification = await knex("alerts")
        .where({ user_id, item_name, message: alertMessage })
        .andWhere("is_read", 0)
        .first();

      if (!existingNotification) {
        await knex("alerts").insert({
          user_id,
          item_name,
          status,
          message: alertMessage,
          alert_date: knex.fn.now(),
          is_read: 0,
        });

        console.log(`Notification added for ${item_name}: ${alertMessage}`);
      }
    }

    console.log("GroceryGenie Scheduler completed.");
  } catch (error) {
    console.error(" Error in GroceryGenie Cron Job:", error.message);
  }
};

// cron job every 2 minutes for testing
export const scheduler = () => {
  cron.schedule("*/2 * * * *", checkGroceryItems);
  console.log("GroceryGenie Scheduler is running...");
};
