import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

// Function to trigger notifications
export const triggerNotification = async (
  user_id,
  item_name,
  status,
  quantity,
  unit,
  expiration_date,
  threshold_qty,
  threshold_alert
) => {
  try {
    const today = new Date(); // Current date
    const expiryDate = expiration_date ? new Date(expiration_date) : null;
    const alertDate = threshold_alert ? new Date(threshold_alert) : null;

    
    today.setHours(0, 0, 0, 0);
    if (expiryDate) expiryDate.setHours(0, 0, 0, 0);
    if (alertDate) alertDate.setHours(0, 0, 0, 0);

    let notifications = [];

    // Trigger notification if item is expired
    if (expiryDate && expiryDate < today) {
      notifications.push({
        user_id,
        item_name,
        message: `Alert! ${item_name} has expired.`,
        is_read: false,
      });
    }

    // Trigger notification if item is low
    if (quantity <= threshold_qty) {
      notifications.push({
        user_id,
        item_name,
        message: `Alert! ${item_name} is running low (${quantity} ${unit} left).`,
        is_read: false,
      });
    }

    // Trigger notification if item is finished
    if (status === "finished") {
      notifications.push({
        user_id,
        item_name,
        message: `Reminder: ${item_name} is finished. Please restock!`,
        is_read: false,
      });
    }

    //Trigger notification if item is near expiry
    if (alertDate && today >= alertDate) {
      notifications.push({
        user_id,
        item_name,
        message: `Heads up! ${item_name} will expire soon (Exp: ${expiration_date}).`,
        is_read: false,
      });
    }

    // Insert notifications into database
    if (notifications.length > 0) {
      await knex("alerts").insert(notifications);
    }
  } catch (error) {
    console.error("Error triggering notifications:", error.message);
  }
};