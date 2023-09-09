const User = require("../models/userModel");
const generateToken = require("../config/generateToken");

const asyncHandler = require("express-async-handler");

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    console.log(" Please Enter all the details");
    return res.send(" Please Enter all the details");
  }

  const userExits = await User.findOne({ email });

  if (userExits) {
    res.status(400);
    return res.send("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).send("Failed to create the user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("User doesnot exist in the database");
  }

  console.log("USER is :" + user);

  if (user && password != user.password) {
    return res.status(400).send("Email and Password does not match");
  }

  if (user && password == user.password) {
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    return res.status(400).send("Something is wrong with the details");
  }
});

// /app/user?search=piyush
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  return res.status(200).send(users);
});

module.exports = { registerUser, authUser, allUsers };
