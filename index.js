const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;

async function connectToDatabase() {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1); // Exit the process if MongoDB connection fails
  }
}

// Define MongoDB Schema and Model
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const UserModel = mongoose.model("User", userSchema);

// API Endpoint to fetch all users
app.get("/api/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    return res.status(200).json(users);
  } catch (err) {
    console.error("Error fetching user data:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
});

// API Endpoint to handle POST request for waitlist
app.post("/api/waitlist", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res.status(400).json({ error: "Email and Name are required fields." });
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ error: "You are already on the waitlist." });
    }

    // If the email is not found, add the user to the waitlist
    const user = new UserModel({ email, name });
    await user.save();
    return res.status(201).json({ message: "User added to the waitlist successfully." });
  } catch (err) {
    console.error("Error saving user:", err);
    return res.status(500).json({ error: "Server error, please try again later." });
  }
});

// Start the server in a function to handle error catching
async function startServer() {
  try {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Error starting the server:", error);
    process.exit(1); // Exit the process if the server fails to start
  }
}

startServer();

// Close the MongoDB connection on process exit
process.on("exit", () => {
  mongoose.disconnect();
});
