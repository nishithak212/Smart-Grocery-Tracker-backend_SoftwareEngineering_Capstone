const authenticateUser = (req, res, next) => {

const user_id = req.headers.authorization?.split("Bearer ")[1];

if(!user_id){
    return res.status(401).json({error: "Unauthorized: User not logged in"});
}

console.log("User authenticated:", user_id);
req.user_id = user_id;
next();
};

export default authenticateUser;
