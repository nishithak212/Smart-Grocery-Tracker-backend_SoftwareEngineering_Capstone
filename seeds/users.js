// import seed data files, arrays of objects
import usersData from "../seed-data/users.js";
import groceryData from "../seed-data/grocery_items.js";
import alertsData from "../seed-data/alerts.js";

export async function seed(knex) {
  await knex("users").del();
  await knex("grocery_items").del();
  await knex("users").insert(usersData);
  await knex("grocery_items").insert(groceryData);
  await knex("alerts").del();
  await knex("alerts").insert(alertsData);
}
