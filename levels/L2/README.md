# Backend SWE Take-Home Assignment - L2 Level

## Overview

This is a **4-hour take-home assignment** for L2 (SWE2) level candidates. You will implement a Tic-Tac-Toe game backend API with the following features:

- Game creation and management
- Player registration and statistics
- Move validation and game state tracking
- Leaderboard functionality
- Basic API endpoints

## Quick Start with Docker (Recommended)

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd <your-repo-name>

# Start the application with Docker
docker-compose up -d
```

The application will be available at `http://localhost:3000`

### 2. Verify Setup

```bash
# Check if the application is running
curl http://localhost:3000/health

# Should return:
# {"status":"ok","timestamp":"2024-01-01T00:00:00.000Z","uptime":123.456,"memory":{...},"version":"1.0.0"}
```

### 3. Stop the Application

```bash
# Stop the application
docker-compose down
```

## Manual Setup (Alternative)

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The server will be available at `http://localhost:3000`

## Time Expectations

- **Total Time**: 4 hours
- **Setup & Understanding**: ~30 minutes (reading code, understanding structure)
- **Core Implementation**: ~3 hours (implementing TODOs)
- **Testing & Polish**: ~30 minutes (running tests, basic validation)

## Project Structure

```
src/
├── models/          # TODO: Implement game, player models
├── services/        # TODO: Implement business logic services
├── routes/          # TODO: Implement API routes
├── middleware/      # TODO: Implement validation and error handling
└── utils/           # TODO: Implement helper functions
```

**Key Implementation Areas:**
- **Game Logic**: Implement Tic-Tac-Toe game rules and state management
- **Player Management**: Handle player creation, stats, and validation
- **API Endpoints**: Create RESTful endpoints for game operations
- **Error Handling**: Add proper validation and error responses
- **One Middleware**: Implement one of the suggested middleware (logging, rate limiting, or compression)

## What You Need to Implement

### Core TODOs (Focus on these first):

1. **Game Model** (`src/models/game.ts`):
   - Input validation for all methods
   - Win condition checking (rows, columns, diagonals)
   - Draw condition checking
   - Game state transitions

2. **Player Model** (`src/models/player.ts`):
   - Input validation for player creation
   - Email validation
   - Statistics calculation (win rate, efficiency)
   - Game result recording

3. **API Routes** (`src/routes/games.ts`, `src/routes/players.ts`):
   - Implement all CRUD operations
   - Add proper error handling
   - Validate request data

4. **One Middleware** (`src/index.ts`):
   - Choose one: request logging, rate limiting, or compression
   - Follow the example provided in the TODO

5. **Simulation Script** (`scripts/simulation.ts`):
   - Implement API calls to test your endpoints
   - Add basic error handling

### Nice-to-Have (if time permits):
- Additional validation in middleware
- Enhanced error messages
- Basic game statistics
- Leaderboard sorting options

### What's Already Set Up:
- Express server with basic middleware
- Type definitions and interfaces
- Test framework configuration
- In-memory storage (no database setup required)
- Basic project structure
- Health check endpoint
- Error handling middleware
- Docker setup for easy replication

## API Endpoints

### Games
- `POST /games` - Create a new game
- `GET /games/:id` - Get game status
- `POST /games/:id/join` - Join a game
- `POST /games/:id/moves` - Make a move
- `GET /games/:id/status` - Get detailed game status
- `GET /games/:id/stats` - Get game statistics
- `DELETE /games/:id` - Delete a game
- `GET /games` - List games with filtering

### Players
- `POST /players` - Create a new player
- `GET /players/:id` - Get player information
- `GET /players/:id/stats` - Get player statistics
- `PUT /players/:id` - Update player information
- `DELETE /players/:id` - Delete a player
- `GET /players` - List players with pagination
- `GET /players/search` - Search players by name

### Leaderboard
- `GET /leaderboard` - Get leaderboard by wins
- `GET /leaderboard/efficiency` - Get leaderboard by efficiency

### System
- `GET /health` - Health check endpoint

## Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests
npm run test:integration
```

### Run Simulation

```bash
# Run the simulation script
npm run simulation
```

## Docker Commands

### Development

```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

### Production

```bash
# Build the image
docker build -t tictactoe-backend .

# Run the container
docker run -p 3000:3000 tictactoe-backend
```

## Evaluation Criteria

Your submission will be evaluated on:

- **Requirement Fulfilment** (5 points): All core requirements implemented correctly
- **Language Fundamentals** (10 points): Idiomatic code, robust error handling, proper typing
- **Backend Architecture** (10 points): Clear layers, dependency injection, scalable design
- **Data Modeling & SQL** (10 points): Normalized schema, proper indexes, efficient queries
- **Concurrency & Distributed** (10 points): Session isolation, race condition handling
- **Testing & Quality** (10 points): Unit + integration tests, good coverage, reliable tests
- **API Design & Documentation** (10 points): RESTful design, proper status codes, clear docs
- **Code Quality & Maintainability** (10 points): SOLID principles, clean code, maintainable structure
- **Innovation & Creativity** (10 points): Observability, metrics, graceful shutdown, production readiness
- **Culture Fit** (10 points): Humility, integrity, curiosity, thoughtfulness, initiative, urgency

## Important Notes

- **Time Management**: Focus on core functionality first, polish later
- **Eject Capability**: You can remove any scaffold files and start fresh if you prefer
- **TODO Items**: Follow the TODO markers to implement required functionality
- **Testing**: Write tests for the provided structure and ensure good coverage
- **No Database Required**: The scaffold uses in-memory storage for simplicity
- **Docker Setup**: Use Docker for easy replication between candidate and assessor

## Submission

1. Ensure all tests pass
2. Run the simulation script and verify results
3. Update this README with setup instructions
4. Submit your repository URL

## Support

If you have questions or need clarification, please reach out to the hiring team.

Good luck! 🚀
