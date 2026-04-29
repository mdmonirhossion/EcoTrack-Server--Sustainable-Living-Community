const { ObjectId } = require('mongodb');

exports.joinChallenge = (challengesCollection) => async (req, res) => {
    try {
        const challenge = await challengesCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

       
        const isAlreadyJoined = challenge.participants.includes(req.user._id);

        if (isAlreadyJoined) {
            return res.status(400).json({ message: "Already joined" });
        }

        
        challenge.participants.push(req.user._id);
        await challenge.save();

        res.status(200).json({ message: "Successfully joined!" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};