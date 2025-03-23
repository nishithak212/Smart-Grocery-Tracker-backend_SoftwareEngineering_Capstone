import cron from "node-cron";
import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const checkGroceryItems = async () => {
  try {
    const now = new Date();
    const formattedDisplayDate = `${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(now.getDate()).padStart(2, "0")}/${now.getFullYear()}`;
    const currentDateForDB = now.toISOString().split("T")[0]; // "YYYY-MM-DD"

    console.log(`Running GroceryGenie Cron Job on ${formattedDisplayDate}...`);

    // Fetch items that should be in the shopping list
    const shoppingListItems = await knex("grocery_items")
      .select(
        "id",
        "user_id",
        "item_name",
        "quantity",
        "status",
        "expiration_date",
        "threshold_alert",
        "threshold_qty"
      )
      .where(function () {
        this.where("status", "out of stock")
          .orWhere("status", "expired")
          .orWhereRaw("DATE(threshold_alert) = ?", [currentDateForDB])
          .orWhereRaw("DATE(expiration_date) < ?", [currentDateForDB]);
      });

    if (shoppingListItems.length > 0) {
      console.log("Updating Shopping List with these items:");
      shoppingListItems.forEach((item) => {
        const expDate = item.expiration_date
          ? new Date(item.expiration_date).toLocaleDateString("en-US")
          : "N/A";
        console.log(
          `- ${item.item_name} (Status: ${item.status}, Exp: ${expDate})`
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
        quantity,
        status,
        threshold_qty,
        expiration_date,
        threshold_alert,
      } = item;

      let alertMessage = "";

      // Calculate status dynamically
      const isExpired =
        expiration_date &&
        new Date(expiration_date).toISOString().split("T")[0] <
          currentDateForDB;

      const isExpiringSoon =
        threshold_alert &&
        new Date(threshold_alert).toISOString().split("T")[0] ===
          currentDateForDB;

      if (quantity === 0) {
        alertMessage = `${item_name} : Out-of-Stock`;
        await knex("grocery_items")
          .where({ id })
          .update({ status: "out of stock" });
      } else if (isExpired) {
        alertMessage = `${item_name} : Expired. Please discard!`;
        await knex("grocery_items").where({ id }).update({ status: "expired" });
      } else if (quantity <= threshold_qty) {
        alertMessage = `${item_name} : Running low. Restock soon!`;
        await knex("grocery_items").where({ id }).update({ status: "low" });
      } else if (isExpiringSoon) {
        alertMessage = `${item_name}: Expiring soon on- ${new Date(
          expiration_date
        ).toLocaleDateString("en-US")}.`;
      }

      // Avoid duplicate unread notifications
      const existingNotification = await knex("alerts")
        .where({ user_id, item_name, message: alertMessage })
        .first();

      if (!existingNotification && alertMessage) {
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

    console.log("GroceryGenie Scheduler completed.\n");
  } catch (error) {
    console.error("Error in GroceryGenie Cron Job:", error.message);
  }
};

// Run every 1 minute (for testing)
export const scheduler = () => {
  cron.schedule("*/1 * * * *", checkGroceryItems);
  console.log("GroceryGenie Scheduler is running...");
};
