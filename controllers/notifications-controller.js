import initKnex from "knex";
import configuration from "../knexfile.js";


const knex = initKnex(configuration);

//Get unread notification
const getNotifications = async (req,res) => {
    try{
        const user_id = req.user_id;

        if (!user_id) {
          return res
            .status(401)
            .json({ error: "Unauthorized: User is not logged in" });
        }
//Fetch notifications
        const notifications = await knex("alerts").where({user_id, is_read:false}).orderBy("alert_date", "desc");

        //If no notifications exist, return a message
        if(notifications.length===0){
            return res.status(200).json({message:"No notifications!"})
        }

        return res.status(200).json(notifications);
    } catch(error){
        console.error("Error fetching notifications:", error.message);
        return res.status(500).json({error: "Internal Server Error"});
    }
};

const markNotificationsAsRead = async(req,res) => {
    try {
        const user_id = req.user_id;

        if (!user_id) {
          return res
            .status(401)
            .json({ error: "Unauthorized: User is not logged in" });
        }

        await knex("alerts").where({user_id}).update({is_read:true});

        return res.status(200).json({message:"Notification marked as read"});
    } catch(error) {
        console.error("Error updating notifications", error.message);
        return res.status(500).json({error:"Internal Server Error"});
    }
};


//Delete a single notification
const deleteNotification = async (req,res) => {
    try{
        const user_id = req.user_id;
        const {id} = req.params;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    //Check if notification exists
    const notification = await knex("alerts").where({id, user_id}).first();
    if(!notification){
        return res.status(404).json({error:"Notification not found"});
    }

    //Delete the notification
    await knex("alerts").where({id, user_id}).del();

    return res.status(204).send();
    } catch(error){
        console.error("Error deleting notification:", error.message);
        return res.status(500).json({error: "Internal Server Error"});
    }
};
export {getNotifications, markNotificationsAsRead, deleteNotification};