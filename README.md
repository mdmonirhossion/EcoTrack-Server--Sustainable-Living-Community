# EcoTrack Community Server

A Node.js/Express server for the EcoTrack community platform with MongoDB integration.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
DB_NAME=ecotrackDB
CLIENT_URL=http://localhost:5000
```

3. Seed the database:
```
GET http://localhost:5000/seed
```

## Available Scripts

- `npm run dev` - Start with nodemon
- `npm start` - Start production server

## API Endpoints

### Challenges
- `GET /api/challenges` - Get all challenges (supports filtering)
- `GET /api/challenges/featured` - Get featured challenges
- `GET /api/challenges/:id` - Get single challenge
- `POST /api/challenges/join/:id` - Join a challenge (requires userId in body)
- `POST /api/challenges` - Create new challenge
- `PATCH /api/challenges/:id` - Update challenge
- `DELETE /api/challenges/:id` - Delete challenge

### Other
- `GET /api/tips` - Get tips
- `GET /api/events` - Get upcoming events
- `GET /api/stats` - Get platform statistics
- `GET /api/my-activities/:userId` - Get user's joined challenges
- `PATCH /api/my-activities/:id/progress` - Update challenge progress

## Tech Stack
- Express.js
- MongoDB (Native Driver)
- CORS
- dotenv
