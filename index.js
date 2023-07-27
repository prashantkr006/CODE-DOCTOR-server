const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Use cors middleware

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

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

app.get("/api/users", async (req, res) => {
  try {
    const users = await UserModel.find(); // Fetch all user records from the database
    return res.status(200).json(users); // Send the user records as JSON response
  } catch (err) {
    console.error("Error fetching user data:", err);
    return res
      .status(500)
      .json({ error: "Server error, please try again later." });
  }
});

// API Endpoint to handle POST request for waitlist
app.post("/api/waitlist", async (req, res) => {
  const { email, name } = req.body;

  if (!email || !name) {
    return res
      .status(400)
      .json({ error: "Email and Name are required fields." });
  }

  try {
    // Check if the email already exists in the database
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "You are already on the waitlist." });
    }

    // If the email is not found, add the user to the waitlist
    const user = new UserModel({ email, name });
    await user.save();
    return res
      .status(201)
      .json({ message: "User added to the waitlist successfully." });
  } catch (err) {
    console.error("Error saving user:", err);
    return res
      .status(500)
      .json({ error: "Server error, please try again later." });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
