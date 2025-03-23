import initKnex from "knex";
import configuration from "../knexfile.js";

const knex = initKnex(configuration);

const extractUserID = (req) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  return authHeader.split(" ")[1];
};

//Get unread notification
const getNotifications = async (req, res) => {
  try {
    const user_id = extractUserID(req);

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    console.log(`Checking notification for user ${user_id}`);
    //Fetch notifications
    const notifications = await knex("alerts")
      .where({ user_id, is_read: false })
      .orderBy("alert_date", "desc");

    //If no notifications exist, return a message
    if (notifications.length === 0) {
      return res.status(200).json({ message: "No new notifications!" });
    }

    console.log(`Found ${notifications.length} notifications`);
    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Error fetching notifications:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const markNotificationsAsRead = async (req, res) => {
  try {
    //  Extract user_id from Authorization header
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: No valid token" });
    }

    const user_id = authHeader.split(" ")[1]; // Extract user_id

    const { id } = req.params;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    //  Check if the notification exists and belongs to the user
    const notification = await knex("alerts").where({ id, user_id }).first();
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    //  Mark notification as read
    await knex("alerts").where({ id, user_id }).update({ is_read: 1 });

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const markAllAsRead = async(req,res) => {
    const user_id = extractUserID(req);
try{
    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    await knex("alerts")
    .where({user_id, is_read: 0})
    .update({is_read:1});

    res.status(200).json({message: "All notifications marked as read"});
} catch (error) {
    console.error("Error marking all notifications as read:", error.message);
    res.status(500).json({error:"Internal server error"});
}
};

export { getNotifications, markNotificationsAsRead, markAllAsRead };
