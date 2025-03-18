import initKnex from "knex";
import configuration from "../knexfile.js";
import bcrypt from "bcryptjs";

const knex = initKnex(configuration);

//Authentication API
//User registration POST
const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, username, password } = req.body;

    //Validate request body
    if (!first_name || !last_name || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //Check if username already exists
    const existingUser = await knex("users").where({ username }).first();
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "Username alreay exists. Please use a different one" });
    }

    //Hash password before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //Insert user into the database
    const [newUserID] = await knex("users").insert({
      first_name,
      last_name,
      username,
      password: hashedPassword,
    });

    const newUser = await knex("users").where({ user_id: newUserID }).first();

    //Respond with user data (excluding password)
    res.status(201).json({
      id: newUser.user_id,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      username: newUser.username,
      created_at: newUser.created_at,
    });
  } catch (error) {
    console.error("Error registrating user:", error);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try after sometime" });
  }
};

//Existing user login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    // console.log("Received login request:", req.body);

    //Validate request body
    if (!username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    //Check if user exists
    const user = await knex("users").where({ username }).first();
    if (!user) {
      return res.status(401).json({ error: "Denied: User is not registered" });
    }
    // console.log("Stored Hash:", user.password);
    //         console.log("Entered Password:", password);

    //Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ error: "Denied: Credentials do not match" });
    }

    //Store user_id in session
    req.session.user_id = user.user_id;

    //log session data
    console.log("Session after login:", req.session);

    return res.status(200).json({
      message: "User logged in successfully!",
    });
  } catch (error) {
    console.error("Login error", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error. Please try after sometime" });
  }
};

export { registerUser, loginUser };
