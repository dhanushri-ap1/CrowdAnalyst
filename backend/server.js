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
  res.send("FlowGuard API is running...");
});

app.get("/places", async (req, res) => {
  try {
    const places = await Place.find();
    res.json(places);
  } catch (error) {
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
    res.status(500).json({ error: error.message });
  }
});

app.get("/predict-risk", async (req, res) => {
  try {
    const crowdData = await Report.aggregate([
      {
        $group: {
          _id: "$placeId",
          avgCrowd: { $avg: "$crowdLevel" }
        }
      }
    ]);

    const results = [];

    for (const item of crowdData) {
      const place = await Place.findById(item._id);

      if (!place) continue;

      let status = "Stable";
      let recommendation = "No action needed";

      if (item.avgCrowd > 4) {
        status = "High Risk";

        const alternatives = await Place.find({
          name: { $in: place.connections },
          category: place.category
        });

        if (alternatives.length > 0) {
          recommendation = `Redirect users to nearest ${place.category}: ${alternatives
            .map(p => p.name)
            .join(", ")}`;
        } else {
          recommendation = "No nearby alternative available";
        }
      }

      results.push({
        place: place.name,
        category: place.category,
        avgCrowd: item.avgCrowd.toFixed(2),
        status,
        recommendation
      });
    }

    res.json(results);

  } catch (error) {
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