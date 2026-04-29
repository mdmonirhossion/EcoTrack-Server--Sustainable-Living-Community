const express = require('express');
const router = express.Router();

module.exports = function(challengesCollection, userChallengesCollection, ObjectId) {
  const joinChallengeHandler = async (req, res) => {
    try {
      const { userId } = req.body || {};
      const challengeId = req.params.id;

      if (!userId) {
        return res.status(400).send({ message: "userId is required" });
      }

      const existing = await userChallengesCollection.findOne({
        userId,
        challengeId,
      });

      if (existing) {
        return res.status(400).send({ message: "Already joined" });
      }

      await userChallengesCollection.insertOne({
        userId,
        challengeId,
        status: "Not Started",
        progress: 0,
        joinDate: new Date(),
        updatedAt: new Date(),
      });

      await challengesCollection.updateOne(
        { _id: new ObjectId(challengeId) },
        { $inc: { participants: 1 } }
      );

      return res.send({ message: "Joined successfully" });
    } catch (err) {
      console.error('POST /api/challenges join failed:', err);
      return res.status(500).send({ message: 'Failed to join challenge' });
    }
  };

  // ── FEATURED CHALLENGES ──
  router.get('/featured', async (req, res) => {
    try {
      const result = await challengesCollection
        .find({ featured: true })
        .limit(3)
        .toArray();
      res.json(result); // Must be an array for the frontend.
    } catch (err) {
      console.error('GET /featured failed:', err);
      res.status(500).json([]); // Prevent frontend crashes, but don't hide failures.
    }
  });

  // ── JOIN CHALLENGE ──
  router.post('/:id/join', joinChallengeHandler);
  // Alias to match common frontend usage / README wording
  router.post('/join/:id', joinChallengeHandler);

  // ── ALL CHALLENGES with Advanced Filtering ──
  router.get('/', async (req, res) => {
    try {
      const { category, minP, maxP, startDate, endDate } = req.query;
      let filter = {};

      if (category && category !== "All") {
        filter.category = { $in: category.split(",") };
      }
      if (minP || maxP) {
        filter.participants = {};
        if (minP) filter.participants.$gte = parseInt(minP);
        if (maxP) filter.participants.$lte = parseInt(maxP);
      }
      if (startDate || endDate) {
        filter.startDate = {};
        if (startDate) filter.startDate.$gte = startDate;
        if (endDate) filter.startDate.$lte = endDate;
      }

      const result = await challengesCollection.find(filter).toArray();
      res.json(result); // Must be an array for the frontend.
    } catch (err) {
      console.error('GET /api/challenges failed:', err);
      res.status(500).json([]); // Prevent frontend crashes, but don't hide failures.
    }
  });

  // ── CHALLENGE BY ID ──
  router.get('/:id', async (req, res) => {
    try {
      const result = await challengesCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      if (!result) return res.status(404).send({ message: "Not found" });
      res.send(result);
    } catch {
      res.status(400).send({ message: "Invalid ID" });
    }
  });

  // ── CREATE CHALLENGE ──
  router.post('/', async (req, res) => {
    const challenge = {
      ...req.body,
      participants: 0,
      co2Saved: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const result = await challengesCollection.insertOne(challenge);
    res.send(result);
  });

  // ── UPDATE CHALLENGE ──
  router.patch('/:id', async (req, res) => {
    try {
      const { _id, ...updateData } = req.body;
      const result = await challengesCollection.updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
      res.send(result);
    } catch (error) {
      console.error("Update failed:", error);
      res.status(400).send({ message: "Update failed" });
    }
  });

  // ── DELETE CHALLENGE ──
  router.delete('/:id', async (req, res) => {
    try {
      const result = await challengesCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    } catch {
      res.status(400).send({ message: "Invalid ID" });
    }
  });

  return router;
};
