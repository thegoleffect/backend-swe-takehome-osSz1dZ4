# Backend SWE Take-Home Assignment

## Overview

This is a **4-hour take-home assignment** for L2 (SWE2) level candidates. You will implement a Tic-Tac-Toe game backend API with the following features:

- Game creation and management
- Player registration and statistics
- Move validation and game state tracking
- Leaderboard functionality
- Basic API endpoints

## Time Expectations

- **Total Time**: 4 hours
- **Setup & Understanding**: ~30 minutes (reading code, understanding structure)
- **Core Implementation**: ~3 hours (implementing TODOs)
- **Testing & Polish**: ~30 minutes (running tests, basic validation)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm run dev


```

### Running Tests

```bash
npm test


```

### Running the Simulation

```bash
npm run simulation


```

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



## Submission

1. Ensure all tests pass
2. Run the simulation script and verify results
3. Update this README with setup instructions
4. Submit your repository URL

## Support

If you have questions or need clarification, please reach out to the hiring team.

Good luck! 🚀
