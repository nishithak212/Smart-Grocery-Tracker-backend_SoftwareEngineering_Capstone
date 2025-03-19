import initknex from "knex";
import configuration from "../knexfile.js";

const knex = initknex(configuration);

//Function to trigger notifications
export const triggerNotification = async (user_id, item_name, status, quantity, unit, expiration_date, threshold_qty, threshold_alert) =>{
    try {
        const today = new Date();
        today.setHours(0,0,0,0);

        let message = null;

        //Low Stock Alert

        if(quantity !== undefined && quantity <= threshold_qty ) {
            message = `${item_name} is running low. Only ${quantity}${unit} left!`;
        }

        //Finished Alert
        if(status=== "finished"){
            message =`${item_name} is finished. Time to restock!`;
        }

        //Close to Expiry Alert
        if(expiration_date && threshold_alert) {
            const expiryDate = new Date(expiration_date);
            const alertDate = new Date(expiryDate);
            alertDate.setDate(alertDate.getDate()-threshold_alert); //subtract threshold days

            if(today >= alertDate && today < expiryDate){
                message = `${item_name} is close to expiry on ${expiration_date}. Consider using it soon!`;
            }
        }

        //Expired Item Alert
        if(expiration_date) {
            const expiryDate = new Date(expiration_date);
            if(today > expiryDate){
                message = `${item_name} has expired on ${expiration_date}. Please discard!`;
            }
        }

        //Save notification to alerts table if a message is generated
        if(message) {
            await knex("alerts").insert({user_id, status, message});
        }
    }
        catch(error){
console.error("Error triggering notification:", error.message);
        }
    };
