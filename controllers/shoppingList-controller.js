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

//Generate a shopping list for finished, low and expired items
const generateShoppingList = async (req, res) => {
  try {
    const user_id = extractUserID(req); //Extract user_id from request headers (set in middleware)

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User not logged in" });
    }

    console.log(`Fetching shopping list for user_id: ${user_id}`);

    //Fetch grocery items that are either finished, low on stock or expired
    const shoppingList = await knex("grocery_items")
      .where({ user_id })
      .andWhere(function () {
        this.where(function () {
          this.where("status", "finished").andWhere("quantity", 0);
        })
          .orWhere("status", "expired")
          .orWhere("status", "low");
      })
      .select(
        "id",
        "user_id",
        "item_name",
        "quantity",
        "unit",
        "category",
        "status"
      )
      .orderBy("status", "asc");

    console.log("Shopping list API response:", shoppingList);

    //Check if list is empty
    if (shoppingList.length === 0) {
      return res.status(200).json({
        message:
          "Your shopping list is empty! No low stock, expired or finished items.",
      });
    }
    //Format response
    const formattedList = shoppingList.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit: item.unit,
      status: item.status,
      category: item.category,
      created_at: item.updated_at || new Date().toISOString(),
    }));

    return res.status(200).json(formattedList);
  } catch (error) {
    console.error("Error generating shopping list", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

//Delete a single item from the shopping list
const deleteShoppingItem = async (req, res) => {
  try {
    const user_id = extractUserID(req);
    const { id } = req.params;

    if (!user_id) {
      return res
        .status(401)
        .json({ error: "Unauthorized: User is not logged in" });
    }

    //Check if the item exists and belongs to the user
    const item = await knex("grocery_items").where({ id, user_id }).first();
    if (!item) {
      return res.status(404).json({ error: "Shopping list item not found" });
    }

    //Delete the item from the database
    await knex("grocery_items").where({ id, user_id }).del();
    return res
      .status(204)
      .json({ message: "Item removed from shopping list successfully" });
  } catch (error) {
    console.error("Error deleting shopping list item:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

export { generateShoppingList, deleteShoppingItem };
