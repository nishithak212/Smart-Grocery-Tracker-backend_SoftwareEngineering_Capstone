const authenticateUser = (req, res, next) => {
  console.log("Session in authMiddleware:", req.session);
  if (!req.session || !req.session.user_id) {
    console.log("No user_id is found in session");
    return res
      .status(401)
      .json({ error: "Unauthorized: User is not logged in" });
  }

  console.log("User authenticated:", req.session.user_id);
  req.user_id = req.session.user_id; //to attach user_id to request object
  next();
};

export default authenticateUser;
