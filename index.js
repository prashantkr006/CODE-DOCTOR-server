const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Use cors middleware

// Connect to MongoDB
const mongoURI =
  "mongodb+srv://root:9LkxD4pJ5nFqTeNB@cluster0.1d0ukcn.mongodb.net/test?retryWrites=true&w=majority";
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
