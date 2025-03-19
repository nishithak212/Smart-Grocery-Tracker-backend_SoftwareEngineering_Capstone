import express from "express";
import authenticateUser from "../middleware/authMiddleware.js";
import * as generateShoppingListController from "../controllers/shoppingList-controller.js";

const router = express.Router();


router.route("/").get(authenticateUser, generateShoppingListController.generateShoppingList);
router.route("/:id").delete(authenticateUser, generateShoppingListController.deleteShoppingItem);

export default router;