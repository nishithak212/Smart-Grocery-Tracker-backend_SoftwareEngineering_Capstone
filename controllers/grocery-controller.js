import initKnex from "knex";
import configuration from "../knexfile.js";
// import { triggerNotification } from "../helpers/notifications-helper.js";

const knex = initKnex(configuration);

//Add a new grocery item with notification trigger

const addGroceryItem = async (req, res) => {
  try {
    const user_id = req.user_id;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    let {
      item_name,
      quantity,
      unit,
      category,
      status,
      expiration_date,
      threshold_qty,
      threshold_alert,
    } = req.body;

    console.log("Received request body:", req.body);

    //  Ensure quantity is a number
    quantity = quantity !== undefined ? Number(quantity) : undefined;
    threshold_qty =
      threshold_qty !== undefined ? Number(threshold_qty) : undefined;
    //  console.log("Received quantity:", quantity, "Type:", typeof quantity);

    //Dynamically set the status of an item to low
    if (quantity <= threshold_qty) {
      status = "low";
    }

    // Convert empty strings to NULL for optional date fields
    expiration_date =
      expiration_date && expiration_date.trim() !== "" ? expiration_date : null;
    threshold_alert =
      threshold_alert && threshold_alert.trim() !== "" ? threshold_alert : null;

    //  Check for missing fields properly
    const missingFields = [];
    if (item_name === undefined) missingFields.push("item_name");
    if (quantity === undefined || isNaN(quantity))
      missingFields.push("quantity");
    if (unit === undefined) missingFields.push("unit");
    if (category === undefined) missingFields.push("category");
    //  if (status === undefined) missingFields.push("status");
    if (threshold_qty === undefined) missingFields.push("threshold_qty");

    if (missingFields.length > 0) {
      //console.log("Missing Fields:", missingFields.join(", "));
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    //  Validate quantity rules
    if (quantity < 0) {
      return res.status(400).json({ error: "Quantity cannot be negative" });
    }

    if (quantity === 0 && status !== "out of stock") {
      return res
        .status(400)
        .json({ error: "Only out-of-stock items can have quantity = 0" });
    }

    if (status === "out of stock" && quantity > 0) {
      return res
        .status(400)
        .json({ error: "'Out-of-stock' items must have quantity = 0" });
    }

    let computedStatus = "available";

    const today = new Date();
    const expiryDate = expiration_date ? new Date(expiration_date) : null;
    if (quantity === 0) {
      computedStatus = "out of stock";
    } else if (expiryDate && expiryDate < today) {
      computedStatus = "expired";
    } else if (quantity <= threshold_qty) {
      computedStatus = "low";
    }
    //  Insert into database
    const [id] = await knex("grocery_items").insert({
      user_id,
      item_name,
      quantity,
      unit,
      category,
      status: computedStatus,
      expiration_date: expiration_date || null,
      threshold_qty,
      threshold_alert: threshold_alert || null,
    });

    // Fetch the newly inserted grocery item
    const newItem = await knex("grocery_items").where({ id }).first();

    return res.status(200).json(newItem);
  } catch (error) {
    console.error("Error adding grocery item:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Get all grocery items for the logged in user
const getGroceryItems = async (req, res) => {
  try {
    const user_id = req.user_id;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    //Fetch grocery items
    const items = await knex("grocery_items").where({ user_id });

    //If no grocery items exist, return a message
    if (items.length === 0) {
      return res
        .status(200)
        .json({ message: "Your grocery list is empty. Start adding items!" });
    }

    return res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching grocery items:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//Update an existing grocery item
const updateGroceryItem = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;
    let {
      item_name,
      quantity,
      unit,
      category,
      status,
      expiration_date,
      threshold_qty,
      threshold_alert,
    } = req.body;
    // Convert empty strings to NULL for optional date fields
    expiration_date =
      expiration_date && expiration_date.trim() !== "" ? expiration_date : null;
    threshold_alert =
      threshold_alert && threshold_alert.trim() !== "" ? threshold_alert : null;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    const item = await knex("grocery_items").where({ id, user_id }).first();
    if (!item) {
      return res.status(404).json({ error: "Grocery item not found" });
    }

    quantity = quantity !== undefined ? Number(quantity) : undefined;
    threshold_qty =
      threshold_qty !== undefined ? Number(threshold_qty) : undefined;

    let computedStatus = "available";

    const today = new Date();
    const expiryDate = expiration_date ? new Date(expiration_date) : null;

    if (quantity === 0) {
      computedStatus = "out of stock";
    } else if (expiryDate && expiryDate < today) {
      computedStatus = "expired";
    } else if (quantity <= threshold_qty) {
      computedStatus = "low";
    }

    await knex("grocery_items")
      .where({ id, user_id })
      .update({
        item_name,
        quantity,
        unit,
        category,
        status: computedStatus,
        expiration_date: expiration_date || null,
        threshold_qty,
        threshold_alert: threshold_alert || null,
        updated_at: knex.fn.now(),
      });

    // //Trigger Notifications
    // await triggerNotification(user_id, item_name, status, quantity, unit, expiration_date, threshold_qty, threshold_alert );
    // console.log(`Notification checked for ${item_name}`);

    return res
      .status(201)
      .json({ message: "Grocery item updated successfully" });
  } catch (error) {
    console.error("Error updating grocery item:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//Delete a grocery item
const deleteGroceryItem = async (req, res) => {
  try {
    const user_id = req.user_id;
    const { id } = req.params;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    const item = await knex("grocery_items").where({ id, user_id }).first();
    if (!item) {
      return res.status(404).json({ error: "Grocery item not found" });
    }

    await knex("grocery_items").where({ id, user_id }).del();

    return res
      .status(204)
      .json({ message: "Grocery item deleted successfully" });
  } catch (error) {
    console.error("Error deleting grocery item:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export {
  addGroceryItem,
  getGroceryItems,
  updateGroceryItem,
  deleteGroceryItem,
};
