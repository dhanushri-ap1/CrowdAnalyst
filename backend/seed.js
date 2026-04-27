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
        name: "Main Canteen",
        category: "canteen",
        location: {
          type: "Point",
          coordinates: [76.9043074498533, 10.901428180909283]
        },
        connections: ["IT Canteen", "Library"]
      },
      {
        name: "IT Canteen",
        category: "canteen",
        location: {
          type: "Point",
          coordinates: [76.89811962393252, 10.90508918779489]
        },
        connections: ["Main Canteen", "MBA Canteen"]
      },
      {
        name: "MBA Canteen",
        category: "canteen",
        location: {
          type: "Point",
          coordinates: [76.89811962393252, 10.90508918779489]
        },
        connections: ["IT Canteen"]
      },
      {
        name: "Sports Ground",
        category: "sports",
        location: {
          type: "Point",
          coordinates: [76.90293988666609, 10.902890933488104]
        },
        connections: ["Auditorium"]
      },
      {
        name: "Library",
        category: "library",
        location: {
          type: "Point",
          coordinates: [76.89908367646774, 10.904479269169551]
        },
        connections: ["Main Canteen", "Auditorium"]
      },
      {
        name: "Auditorium",
        category: "auditorium",
        location: {
          type: "Point",
          coordinates: [76.90296576726746, 10.903951942680145]
        },
        connections: ["Library", "Sports Ground"]
      }
    ]);

    console.log("FlowGuard places inserted");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

seedPlaces();