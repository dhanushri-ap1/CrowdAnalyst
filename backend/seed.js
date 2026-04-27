require("dotenv").config();

const mongoose = require("mongoose");
const Place = require("./models/Place");

const seedPlaces = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected for seeding");

    await Place.deleteMany();

    await Place.insertMany([
      {
        name: "Main Library",
        category: "library",
        location: {
          type: "Point",
          coordinates: [80.2206, 13.0827]
        }
      },
      {
        name: "Food Court",
        category: "canteen",
        location: {
          type: "Point",
          coordinates: [80.2212, 13.0830]
        }
      },
      {
        name: "Parking Lot",
        category: "parking",
        location: {
          type: "Point",
          coordinates: [80.2220, 13.0820]
        }
      }
    ]);

    console.log("Sample places inserted");

    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedPlaces();