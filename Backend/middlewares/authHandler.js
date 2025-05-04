const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

require("detenv").config();

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;
};

try {
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({
    email,
    password: hashedPassword,
    role,
  });
  res.status(201).json({ message: "User registered successfully", userId });
} catch (error) {
  res
    .status(500)
    .json({ message: "Error registering user", error: error.message });
}
