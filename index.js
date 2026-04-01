const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");

    const db = client.db("ecotrackDB");
    const challengesCollection = db.collection("challenges");
    const tipsCollection = db.collection("tips");
    const eventsCollection = db.collection("events");
    const userChallengesCollection = db.collection("userChallenges");

    // ── SEED ──
    app.get("/seed", async (req, res) => {
      await challengesCollection.deleteMany({});
      await tipsCollection.deleteMany({});
      await eventsCollection.deleteMany({});

      await challengesCollection.insertMany([
        {
          title: "Plastic-Free July",
          category: "Waste Reduction",
          description: "Avoid single-use plastic for one full month and help reduce ocean pollution.",
          duration: 30,
          target: "Reduce plastic waste by 100%",
          participants: 245,
          impactMetric: "kg plastic saved",
          co2Saved: 120,
          createdBy: "admin@ecotrack.com",
          startDate: "2025-07-01",
          endDate: "2025-07-31",
          imageUrl: "https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=800",
          featured: true,
        },
        {
          title: "30-Day Energy Saver",
          category: "Energy Conservation",
          description: "Reduce your household energy consumption by 20% over 30 days.",
          duration: 30,
          target: "Save 20% on electricity bill",
          participants: 189,
          impactMetric: "kWh saved",
          co2Saved: 200,
          createdBy: "admin@ecotrack.com",
          startDate: "2025-08-01",
          endDate: "2025-08-31",
          imageUrl: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800",
          featured: true,
        },
        {
          title: "Cycle to Work Week",
          category: "Sustainable Transport",
          description: "Replace your daily commute with cycling for one full week.",
          duration: 7,
          target: "Zero car trips for 7 days",
          participants: 312,
          impactMetric: "kg CO2 saved",
          co2Saved: 85,
          createdBy: "admin@ecotrack.com",
          startDate: "2025-09-01",
          endDate: "2025-09-07",
          imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800",
          featured: true,
        },
        {
          title: "Water Conservation Month",
          category: "Water Conservation",
          description: "Track and reduce your daily water usage by 30% this month.",
          duration: 30,
          target: "Save 30% water daily",
          participants: 134,
          impactMetric: "liters water saved",
          co2Saved: 50,
          createdBy: "admin@ecotrack.com",
          startDate: "2025-10-01",
          endDate: "2025-10-31",
          imageUrl: "https://images.unsplash.com/photo-1538300342682-cf57afb97285?w=800",
          featured: false,
        },
        {
          title: "Home Composting Challenge",
          category: "Green Living",
          description: "Start composting your kitchen waste at home this month.",
          duration: 21,
          target: "Compost all kitchen waste",
          participants: 98,
          impactMetric: "kg food waste composted",
          co2Saved: 40,
          createdBy: "admin@ecotrack.com",
          startDate: "2025-11-01",
          endDate: "2025-11-21",
          imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
          featured: false,
        },
        {
          title: "Go Vegan for a Week",
          category: "Green Living",
          description: "Try a 100% plant-based diet for 7 days to cut your carbon footprint.",
          duration: 7,
          target: "100% plant-based meals",
          participants: 280,
          impactMetric: "kg CO2 reduced",
          co2Saved: 95,
          createdBy: "admin@ecotrack.com",
          startDate: "2025-12-01",
          endDate: "2025-12-07",
          imageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",
          featured: false,
        },
      ]);

      await tipsCollection.insertMany([
        {
          title: "Compost your kitchen waste",
          content: "Turn vegetable peels and food scraps into rich compost for your garden.",
          category: "Waste Management",
          author: "eco@user.com",
          authorName: "Green User",
          upvotes: 42,
          createdAt: new Date().toISOString(),
        },
        {
          title: "Switch to LED bulbs",
          content: "LED bulbs use 75% less energy and last 25x longer than incandescent bulbs.",
          category: "Energy Conservation",
          author: "eco2@user.com",
          authorName: "Energy Saver",
          upvotes: 35,
          createdAt: new Date().toISOString(),
        },
        {
          title: "Use reusable shopping bags",
          content: "A single reusable bag can replace hundreds of plastic bags over its lifetime.",
          category: "Waste Reduction",
          author: "eco3@user.com",
          authorName: "Zero Waste",
          upvotes: 28,
          createdAt: new Date().toISOString(),
        },
        {
          title: "Fix leaky faucets immediately",
          content: "A dripping tap can waste over 3,000 liters of water per year.",
          category: "Water Conservation",
          author: "eco4@user.com",
          authorName: "Water Watch",
          upvotes: 19,
          createdAt: new Date().toISOString(),
        },
        {
          title: "Cycle to work once a week",
          content: "Replacing one car trip per week with cycling cuts your carbon footprint significantly.",
          category: "Sustainable Transport",
          author: "eco5@user.com",
          authorName: "Cycle Hero",
          upvotes: 54,
          createdAt: new Date().toISOString(),
        },
      ]);

      await eventsCollection.insertMany([
        {
          title: "Community Clean-up Day",
          description: "Join our neighborhood clean-up event to make our streets greener.",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Central Park, Dhaka",
          organizer: "admin@ecotrack.com",
          maxParticipants: 50,
          currentParticipants: 18,
        },
        {
          title: "Tree Plantation Drive",
          description: "Plant 500 trees with fellow eco-warriors this weekend.",
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Botanical Garden, Mirpur",
          organizer: "admin@ecotrack.com",
          maxParticipants: 100,
          currentParticipants: 63,
        },
        {
          title: "Solar Energy Workshop",
          description: "Learn how to set up solar panels for your home.",
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
          location: "BUET Auditorium, Dhaka",
          organizer: "admin@ecotrack.com",
          maxParticipants: 80,
          currentParticipants: 45,
        },
        {
          title: "Zero Waste Cooking Class",
          description: "Cook delicious meals using every part of your vegetables.",
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          location: "Community Center, Gulshan",
          organizer: "admin@ecotrack.com",
          maxParticipants: 30,
          currentParticipants: 12,
        },
      ]);

      res.send({ message: "✅ Seed data inserted successfully!" });
    });

    // ── STATS ──
    app.get("/api/stats", async (req, res) => {
      const challenges = await challengesCollection.find().toArray();
      const totalParticipants = challenges.reduce((a, c) => a + (c.participants || 0), 0);
      const totalCo2Saved = challenges.reduce((a, c) => a + (c.co2Saved || 0), 0);
      res.send({
        totalChallenges: challenges.length,
        totalParticipants,
        totalCo2Saved,
      });
    });

    // ── CHALLENGES ──
    app.get("/api/challenges/featured", async (req, res) => {
      const result = await challengesCollection
        .find({ featured: true }).limit(3).toArray();
      res.send(result);
    });

    app.get("/api/challenges", async (req, res) => {
      const { category, minP, maxP } = req.query;
      let filter = {};
      if (category) filter.category = { $in: category.split(",") };
      if (minP || maxP) {
        filter.participants = {};
        if (minP) filter.participants.$gte = parseInt(minP);
        if (maxP) filter.participants.$lte = parseInt(maxP);
      }
      const result = await challengesCollection.find(filter).toArray();
      res.send(result);
    });

    app.get("/api/challenges/:id", async (req, res) => {
      const result = await challengesCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.post("/api/challenges", async (req, res) => {
      const challenge = {
        ...req.body,
        participants: 0,
        co2Saved: 0,
        createdAt: new Date(),
      };
      const result = await challengesCollection.insertOne(challenge);
      res.send(result);
    });

    app.patch("/api/challenges/:id", async (req, res) => {
      const result = await challengesCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...req.body, updatedAt: new Date() } }
      );
      res.send(result);
    });

    app.delete("/api/challenges/:id", async (req, res) => {
      const result = await challengesCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    app.post("/api/challenges/join/:id", async (req, res) => {
      const { userId } = req.body;
      const challengeId = req.params.id;
      const existing = await userChallengesCollection.findOne({
        userId,
        challengeId,
      });
      if (existing)
        return res.status(400).send({ message: "Already joined" });
      await userChallengesCollection.insertOne({
        userId,
        challengeId,
        status: "Not Started",
        progress: 0,
        joinDate: new Date(),
      });
      await challengesCollection.updateOne(
        { _id: new ObjectId(challengeId) },
        { $inc: { participants: 1 } }
      );
      res.send({ message: "Joined successfully" });
    });

    // ── TIPS ──
    app.get("/api/tips", async (req, res) => {
      const result = await tipsCollection
        .find()
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();
      res.send(result);
    });

    // ── EVENTS ──
    app.get("/api/events", async (req, res) => {
      const result = await eventsCollection
        .find({ date: { $gte: new Date().toISOString() } })
        .sort({ date: 1 })
        .limit(4)
        .toArray();
      res.send(result);
    });

    // ── MY ACTIVITIES ──
    app.get("/api/my-activities/:userId", async (req, res) => {
      const result = await userChallengesCollection
        .find({ userId: req.params.userId })
        .toArray();
      res.send(result);
    });

    app.patch("/api/my-activities/:id/progress", async (req, res) => {
      const { progress, status } = req.body;
      const result = await userChallengesCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { progress, status, updatedAt: new Date() } }
      );
      res.send(result);
    });

    app.get("/", (req, res) => res.send("🌿 EcoTrack Server Running!"));

    app.listen(port, () =>
      console.log(`🚀 Server running on port ${port}`)
    );
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
}

run();

