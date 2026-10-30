
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const apiRoutes = require("./routes/api");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Student Internship Portal Backend Running");
});

app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    const mongoUri = process.env.MONGO_DB_URI;

    console.log("Checking MongoDB configuration...");

    if (!mongoUri) {
      throw new Error("MONGO_DB_URI missing from root .env");
    }

    console.log("MongoDB URI found.");

    await mongoose.connect(mongoUri);

    console.log("MongoDB Connected Successfully");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Backend running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Backend startup error:", error.message);
  }
}

startServer();
