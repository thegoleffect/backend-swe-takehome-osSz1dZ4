import { Router, Request, Response } from 'express';
import { GameService } from '../services/gameService';
import { PlayerModel } from '../models/player';
import { validationMiddleware } from '../middleware/validation';
import { CreateGameRequest, JoinGameRequest, MakeMoveRequest } from '../types';

const router = Router();
const gameService = new GameService();
const playerModel = new PlayerModel();

/**
 * POST /games
 * Create a new game
 */
router.post('/', 
  validationMiddleware.validateCreateGame,
  async (req: Request<{}, {}, CreateGameRequest>, res: Response) => {
    try {
      const { name } = req.body;
      
      const game = await gameService.createGame(name);
      
      res.status(201).json({
        game,
        message: 'Game created successfully'
      });
    } catch (error) {
      console.error('Error creating game:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Game name must be')) {
          return res.status(400).json({
            error: 'Bad Request',
            message: error.message
          });
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create game'
      });
    }
  }
);

/**
 * GET /games/:id
 * Get game by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid game ID'
      });
    }
    
    const game = await gameService.getGameById(id);
    
    if (!game) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Game not found'
      });
    }
    
    res.status(200).json({ game });
  } catch (error) {
    console.error('Error getting game:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get game'
    });
  }
});

/**
 * GET /games/:id/status
 * Get game status
 */
router.get('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid game ID'
      });
    }
    
    const status = await gameService.getGameStatus(id);
    
    res.status(200).json({ status });
  } catch (error) {
    console.error('Error getting game status:', error);
    
    if (error instanceof Error && error.message.includes('Game not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Game not found'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get game status'
    });
  }
});

/**
 * POST /games/:id/join
 * Join an existing game
 */
router.post('/:id/join',
  validationMiddleware.validateJoinGame,
  async (req: Request<{ id: string }, {}, JoinGameRequest>, res: Response) => {
    try {
      const { id } = req.params;
      const { playerId } = req.body;
      
      // Get player from database
      const player = await playerModel.getPlayerById(playerId);
      if (!player) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Player not found'
        });
      }
      
      const game = await gameService.joinGame(id, player);
      
      res.status(200).json({
        game,
        message: 'Successfully joined game'
      });
    } catch (error) {
      console.error('Error joining game:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            error: 'Not found',
            message: error.message
          });
        }
        if (error.message.includes('not accepting') || 
            error.message.includes('already in') ||
            error.message.includes('full')) {
          return res.status(400).json({
            error: 'Bad Request',
            message: error.message
          });
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to join game'
      });
    }
  }
);

/**
 * POST /games/:id/moves
 * Make a move in the game
 */
router.post('/:id/moves',
  validationMiddleware.validateMakeMove,
  async (req: Request<{ id: string }, {}, MakeMoveRequest>, res: Response) => {
    try {
      const { id } = req.params;
      const { playerId, row, col } = req.body;
      
      const result = await gameService.makeMove(id, playerId, row, col);
      
      res.status(200).json({
        game: result.game,
        move: result.move,
        message: 'Move made successfully'
      });
    } catch (error) {
      console.error('Error making move:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not found')) {
          return res.status(404).json({
            error: 'Not found',
            message: error.message
          });
        }
        if (error.message.includes('not active') ||
            error.message.includes('Not your turn') ||
            error.message.includes('already occupied') ||
            error.message.includes('coordinates must be')) {
          return res.status(400).json({
            error: 'Bad Request',
            message: error.message
          });
        }
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to make move'
      });
    }
  }
);

/**
 * GET /games/:id/moves
 * Get valid moves for a game
 */
router.get('/:id/moves', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid game ID'
      });
    }
    
    const validMoves = await gameService.getValidMoves(id);
    
    res.status(200).json({
      validMoves,
      count: validMoves.length
    });
  } catch (error) {
    console.error('Error getting valid moves:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Game not found'
        });
      }
      if (error.message.includes('not active')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Game is not active'
        });
      }
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get valid moves'
    });
  }
});

/**
 * GET /games/:id/stats
 * Get game statistics
 */
router.get('/:id/stats', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid game ID'
      });
    }
    
    const stats = await gameService.getGameStats(id);
    
    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error getting game stats:', error);
    
    if (error instanceof Error && error.message.includes('Game not found')) {
      return res.status(404).json({
        error: 'Not found',
        message: 'Game not found'
      });
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get game statistics'
    });
  }
});

/**
 * GET /games
 * Get all games with optional filtering
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    
    let games;
    if (status && typeof status === 'string') {
      games = await gameService.getGamesByStatus(status as any);
    } else {
      games = await gameService.getAllGames();
    }
    
    res.status(200).json({
      games,
      count: games.length
    });
  } catch (error) {
    console.error('Error getting games:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get games'
    });
  }
});

/**
 * DELETE /games/:id
 * Delete a game
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid game ID'
      });
    }
    
    await gameService.deleteGame(id);
    
    res.status(200).json({
      message: 'Game deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting game:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return res.status(404).json({
          error: 'Not found',
          message: 'Game not found'
        });
      }
      if (error.message.includes('Cannot delete an active game')) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Cannot delete an active game'
        });
      }
    }
    
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete game'
    });
  }
});

/**
 * GET /games/stats/overview
 * Get overview statistics
 */
router.get('/stats/overview', async (req: Request, res: Response) => {
  try {
    const [activeCount, waitingCount, completedCount] = await Promise.all([
      gameService.getActiveGamesCount(),
      gameService.getWaitingGamesCount(),
      gameService.getCompletedGamesCount()
    ]);
    
    res.status(200).json({
      stats: {
        activeGames: activeCount,
        waitingGames: waitingCount,
        completedGames: completedCount,
        totalGames: activeCount + waitingCount + completedCount
      }
    });
  } catch (error) {
    console.error('Error getting overview stats:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get overview statistics'
    });
  }
});

export { router as gameRoutes };
