import express from "express";
import * as groceryController from "../controllers/grocery-controller.js";
import authenticateUser from "../middleware/authMiddleware.js";

const router = express.Router();

//Add a new grocery item - user must be authenticated
router.route("/add").post(authenticateUser, groceryController.addGroceryItem);

//Get all grocery items for the logged-in user
router.route("/").get(authenticateUser, groceryController.getGroceryItems);


router
.route("/:id")
.put(authenticateUser, groceryController.updateGroceryItem) //Update a grocery item
.delete(authenticateUser, groceryController.deleteGroceryItem); //Delete a grocery item


export default router;