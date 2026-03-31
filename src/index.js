const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uri = "mongodb+srv://mdmamunh608_db_user:uSpNDK6sGFkJXtdb@ecotrack-server.pnvhcn2.mongodb.net/?appName=Ecotrack-server";
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "*",
    credentials: true,
  })
);
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI || "");

const db = client.db(process.env.DB_NAME || "ecotrack");
const challengesCollection = db.collection("challenges");
const userChallengesCollection = db.collection("userChallenges");
const tipsCollection = db.collection("tips");
const eventsCollection = db.collection("events");

const parseDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const toObjectId = (id) => {
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
};

app.get("/", (_req, res) => {
  res.json({ status: "ok", app: "EcoTrack API" });
});

app.get("/api/challenges", async (req, res) => {
  const { categories, startDate, endDate, minParticipants, maxParticipants } = req.query;

  const filter = {};
  if (categories) {
    const categoryList = categories
      .split(",")
      .map((c) => c.trim())
      .filter(Boolean);
    if (categoryList.length) {
      filter.category = { $in: categoryList };
    }
  }

  const start = parseDate(startDate);
  const end = parseDate(endDate);
  if (start || end) {
    filter.startDate = {};
    if (start) filter.startDate.$gte = start;
    if (end) filter.startDate.$lte = end;
  }

  const min = Number(minParticipants);
  const max = Number(maxParticipants);
  if (!Number.isNaN(min) || !Number.isNaN(max)) {
    filter.participants = {};
    if (!Number.isNaN(min)) filter.participants.$gte = min;
    if (!Number.isNaN(max)) filter.participants.$lte = max;
  }

  const items = await challengesCollection.find(filter).sort({ createdAt: -1 }).toArray();
  res.json(items);
});

app.get("/api/challenges/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid challenge id." });

  const item = await challengesCollection.findOne({ _id });
  if (!item) return res.status(404).json({ message: "Challenge not found." });
  res.json(item);
});

app.post("/api/challenges", async (req, res) => {
  const payload = req.body || {};
  const now = new Date();
  const doc = {
    title: payload.title,
    category: payload.category,
    description: payload.description,
    duration: Number(payload.duration) || 0,
    target: payload.target,
    participants: 0,
    impactMetric: payload.impactMetric,
    createdBy: payload.createdBy,
    startDate: parseDate(payload.startDate),
    endDate: parseDate(payload.endDate),
    imageUrl: payload.imageUrl,
    createdAt: now,
    updatedAt: now,
  };

  if (!doc.title || !doc.category || !doc.description || !doc.createdBy) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const result = await challengesCollection.insertOne(doc);
  res.status(201).json({ insertedId: result.insertedId });
});

app.patch("/api/challenges/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid challenge id." });

  const update = { ...req.body, updatedAt: new Date() };
  delete update._id;
  if (update.startDate) update.startDate = parseDate(update.startDate);
  if (update.endDate) update.endDate = parseDate(update.endDate);

  const result = await challengesCollection.updateOne({ _id }, { $set: update });
  if (!result.matchedCount) return res.status(404).json({ message: "Challenge not found." });
  res.json({ message: "Challenge updated." });
});

app.delete("/api/challenges/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid challenge id." });

  const result = await challengesCollection.deleteOne({ _id });
  if (!result.deletedCount) return res.status(404).json({ message: "Challenge not found." });
  res.json({ message: "Challenge deleted." });
});

app.post("/api/challenges/join/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  const { userId } = req.body || {};
  if (!_id || !userId) return res.status(400).json({ message: "Invalid request." });

  const existing = await userChallengesCollection.findOne({ challengeId: _id, userId });
  if (existing) return res.status(409).json({ message: "Already joined this challenge." });

  const challenge = await challengesCollection.findOne({ _id });
  if (!challenge) return res.status(404).json({ message: "Challenge not found." });

  await userChallengesCollection.insertOne({
    userId,
    challengeId: _id,
    status: "Not Started",
    progress: 0,
    joinDate: new Date(),
    updatedAt: new Date(),
  });

  await challengesCollection.updateOne({ _id }, { $inc: { participants: 1 }, $set: { updatedAt: new Date() } });
  res.status(201).json({ message: "Joined successfully." });
});

app.get("/api/my-activities", async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: "userId is required." });

  const items = await userChallengesCollection
    .aggregate([
      { $match: { userId } },
      {
        $lookup: {
          from: "challenges",
          localField: "challengeId",
          foreignField: "_id",
          as: "challenge",
        },
      },
      { $unwind: "$challenge" },
      { $sort: { joinDate: -1 } },
    ])
    .toArray();

  res.json(items);
});

app.patch("/api/my-activities/:id", async (req, res) => {
  const _id = toObjectId(req.params.id);
  if (!_id) return res.status(400).json({ message: "Invalid activity id." });

  const { progress, status } = req.body || {};
  const update = { updatedAt: new Date() };
  if (typeof progress === "number") update.progress = Math.min(100, Math.max(0, progress));
  if (status) update.status = status;

  const result = await userChallengesCollection.updateOne({ _id }, { $set: update });
  if (!result.matchedCount) return res.status(404).json({ message: "Activity not found." });
  res.json({ message: "Progress updated." });
});

app.get("/api/tips/recent", async (_req, res) => {
  const tips = await tipsCollection.find().sort({ createdAt: -1 }).limit(5).toArray();
  res.json(tips);
});

app.get("/api/events/upcoming", async (_req, res) => {
  const now = new Date();
  const events = await eventsCollection.find({ date: { $gte: now } }).sort({ date: 1 }).limit(4).toArray();
  res.json(events);
});

app.get("/api/stats/live", async (_req, res) => {
  const totalChallenges = await challengesCollection.countDocuments();
  const aggregateParticipants = await challengesCollection
    .aggregate([{ $group: { _id: null, sum: { $sum: "$participants" } } }])
    .toArray();
  res.json({
    totalChallenges,
    totalParticipants: aggregateParticipants[0]?.sum || 0,
  });
});

async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in environment variables.");
    }

    await client.connect();
    app.listen(port, () => {
      console.log(`EcoTrack API running on port ${port}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
