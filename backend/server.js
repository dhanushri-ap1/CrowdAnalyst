require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const Place = require("./models/Place");
const Report = require("./models/Report");

const app = express();

app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

app.get("/", (req, res) => {
  res.send("CrowdPulse API is running...");
});

app.get("/places", async (req, res) => {
  try {
    console.log("GET /places hit");

    const places = await Place.find();

    console.log("Places found:", places);

    res.json(places);
  } catch (error) {
    console.log("Error in /places:", error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/report", async (req, res) => {
  try {
    const { placeId, crowdLevel } = req.body;

    const report = await Report.create({
      placeId,
      crowdLevel
    });

    io.emit("new-report", report);

    res.status(201).json(report);
  } catch (error) {
    console.log("Error in /report:", error);
    res.status(500).json({ error: error.message });
  }
});

app.get("/crowd-data", async (req, res) => {
  try {
    const data = await Report.aggregate([
      {
        $group: {
          _id: "$placeId",
          avgCrowd: { $avg: "$crowdLevel" },
          totalReports: { $sum: 1 }
        }
      }
    ]);

    res.json(data);
  } catch (error) {
    console.log("Error in /crowd-data:", error);
    res.status(500).json({ error: error.message });
  }
});

io.on("connection", (socket) => {
  console.log("User connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log("MongoDB connection error:", err);
  });