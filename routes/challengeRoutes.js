const express = require('express');
const router = express.Router();
const { joinChallenge } = require('../controllers/challengeController'); 
router.post('/:id/join', joinChallenge); 

module.exports = router;