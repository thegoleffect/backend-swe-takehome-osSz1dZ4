import { GameService } from '../../../src/services/gameService';
import { GameModel } from '../../../src/models/game';
import { PlayerModel } from '../../../src/models/player';
import { Game, Player, Move, GameStatus } from '../../../src/types';

// Mock the console.log to avoid noise in tests
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

describe('GameService', () => {
  let gameService: GameService;
  let mockGameModel: jest.Mocked<GameModel>;
  let mockPlayerModel: jest.Mocked<PlayerModel>;

  beforeEach(() => {
    mockGameModel = {
      createGame: jest.fn(),
      getGameById: jest.fn(),
      joinGame: jest.fn(),
      makeMove: jest.fn(),
      listGames: jest.fn(),
      getGameStatus: jest.fn(),
      deleteGame: jest.fn(),
      getGameStats: jest.fn(),
      getValidMoves: jest.fn(),
    } as any;

    mockPlayerModel = {
      getPlayerById: jest.fn(),
      createPlayer: jest.fn(),
      updatePlayer: jest.fn(),
      getAllPlayers: jest.fn(),
      recordGameResult: jest.fn(),
    } as any;

    // Create GameService with mocked dependencies
    gameService = new GameService();
    (gameService as any).gameModel = mockGameModel;
    (gameService as any).playerModel = mockPlayerModel;
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockConsoleLog.mockClear();
    mockConsoleError.mockClear();
  });

  afterAll(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  describe('createGame', () => {
    it('should create a new game successfully', async () => {
      const mockGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        status: 'waiting',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.createGame.mockResolvedValue(mockGame);

      const result = await gameService.createGame('Test Game');

      expect(result).toEqual(mockGame);
      expect(mockGameModel.createGame).toHaveBeenCalledWith('Test Game');
      expect(mockConsoleLog).toHaveBeenCalledWith('🎮 Creating new game: Test Game');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Game created: game-1');
    });

    it('should create a game without name', async () => {
      const mockGame: Game = {
        id: 'game-2',
        name: 'Game-1234567890',
        status: 'waiting',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.createGame.mockResolvedValue(mockGame);

      const result = await gameService.createGame();

      expect(result).toEqual(mockGame);
      expect(mockGameModel.createGame).toHaveBeenCalledWith(undefined);
      expect(mockConsoleLog).toHaveBeenCalledWith('🎮 Creating new game: Unnamed');
    });

    it('should throw error for game name too long', async () => {
      const longName = 'a'.repeat(101);
      
      await expect(gameService.createGame(longName)).rejects.toThrow('Game name must be 100 characters or less');
    });

    it('should handle errors when creating game', async () => {
      const error = new Error('Database error');
      mockGameModel.createGame.mockRejectedValue(error);

      await expect(gameService.createGame()).rejects.toThrow('Database error');
    });
  });

  describe('getGameById', () => {
    it('should return game when found', async () => {
      const mockGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        status: 'active',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.getGameById.mockResolvedValue(mockGame);

      const result = await gameService.getGameById('game-1');

      expect(result).toEqual(mockGame);
      expect(mockGameModel.getGameById).toHaveBeenCalledWith('game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('🔍 Fetching game: game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Game found: game-1 (status: active)');
    });

    it('should return null when game not found', async () => {
      mockGameModel.getGameById.mockResolvedValue(null);

      const result = await gameService.getGameById('game-1');

      expect(result).toBeNull();
      expect(mockConsoleLog).toHaveBeenCalledWith('❌ Game not found: game-1');
    });

    it('should throw error for invalid game ID', async () => {
      await expect(gameService.getGameById('')).rejects.toThrow('Game ID must be a valid string');
      await expect(gameService.getGameById(null as any)).rejects.toThrow('Game ID must be a valid string');
    });
  });

  describe('joinGame', () => {
    const mockPlayer: Player = {
      id: 'player-1',
      name: 'Test Player',
      email: 'test@example.com',
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        gamesDrawn: 0,
        totalMoves: 0,
        averageMovesPerWin: 0,
        winRate: 0,
        efficiency: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockGame: Game = {
      id: 'game-1',
      name: 'Test Game',
      status: 'waiting',
      board: [[null, null, null], [null, null, null], [null, null, null]],
      players: [],
      currentPlayerId: null,
      winnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      moves: [],
    };

    it('should join game successfully', async () => {
      mockPlayerModel.getPlayerById.mockResolvedValue(mockPlayer);
      mockGameModel.listGames.mockResolvedValue([]);
      mockGameModel.joinGame.mockResolvedValue(mockGame);

      const result = await gameService.joinGame('game-1', mockPlayer);

      expect(result).toEqual(mockGame);
      expect(mockPlayerModel.getPlayerById).toHaveBeenCalledWith('player-1');
      expect(mockGameModel.listGames).toHaveBeenCalledWith('active');
      expect(mockGameModel.joinGame).toHaveBeenCalledWith('game-1', mockPlayer);
    });

    it('should throw error when player not found', async () => {
      mockPlayerModel.getPlayerById.mockResolvedValue(null);

      await expect(gameService.joinGame('game-1', mockPlayer)).rejects.toThrow('Player not found in database');
    });

    it('should throw error when player already in active game', async () => {
      const activeGame: Game = {
        ...mockGame,
        players: [mockPlayer],
        status: 'active',
      };

      mockPlayerModel.getPlayerById.mockResolvedValue(mockPlayer);
      mockGameModel.listGames.mockResolvedValue([activeGame]);

      await expect(gameService.joinGame('game-1', mockPlayer)).rejects.toThrow('Player is already in an active game');
    });
  });

  describe('makeMove', () => {
    const mockGame: Game = {
      id: 'game-1',
      name: 'Test Game',
      status: 'active',
      board: [[null, null, null], [null, null, null], [null, null, null]],
      players: [
        { id: 'player-1', name: 'Player 1', email: 'p1@test.com', stats: {} as any, createdAt: new Date(), updatedAt: new Date() },
        { id: 'player-2', name: 'Player 2', email: 'p2@test.com', stats: {} as any, createdAt: new Date(), updatedAt: new Date() },
      ],
      currentPlayerId: 'player-1',
      winnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      moves: [],
    };

    const mockMove: Move = {
      id: 'move-1',
      gameId: 'game-1',
      playerId: 'player-1',
      row: 0,
      col: 0,
      timestamp: new Date(),
    };

    it('should make move successfully', async () => {
      const mockResult = { game: mockGame, move: mockMove };
      mockGameModel.makeMove.mockResolvedValue(mockResult);

      const result = await gameService.makeMove('game-1', 'player-1', 0, 0);

      expect(result).toEqual(mockResult);
      expect(mockGameModel.makeMove).toHaveBeenCalledWith('game-1', 'player-1', 0, 0);
      expect(mockConsoleLog).toHaveBeenCalledWith('🎯 Player player-1 making move at (0, 0) in game: game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Move made: move-1 at (0, 0)');
    });

    it('should throw error for invalid coordinates', async () => {
      await expect(gameService.makeMove('game-1', 'player-1', -1, 0)).rejects.toThrow('Move coordinates must be between 0 and 2');
      await expect(gameService.makeMove('game-1', 'player-1', 3, 0)).rejects.toThrow('Move coordinates must be between 0 and 2');
      await expect(gameService.makeMove('game-1', 'player-1', 0, -1)).rejects.toThrow('Move coordinates must be between 0 and 2');
      await expect(gameService.makeMove('game-1', 'player-1', 0, 3)).rejects.toThrow('Move coordinates must be between 0 and 2');
    });

    it('should update player stats when game is completed', async () => {
      const completedGame: Game = {
        ...mockGame,
        status: 'completed',
        winnerId: 'player-1',
      };
      const mockResult = { game: completedGame, move: mockMove };
      
      mockGameModel.makeMove.mockResolvedValue(mockResult);
      mockPlayerModel.recordGameResult.mockResolvedValue(mockGame.players[0]);

      await gameService.makeMove('game-1', 'player-1', 0, 0);

      expect(mockPlayerModel.recordGameResult).toHaveBeenCalledWith('player-1', 'win', 1);
      expect(mockPlayerModel.recordGameResult).toHaveBeenCalledWith('player-2', 'loss', 0);
    });
  });

  describe('getAllGames', () => {
    it('should return all games', async () => {
      const mockGames: Game[] = [
        { id: 'game-1', name: 'Game 1', status: 'waiting', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
        { id: 'game-2', name: 'Game 2', status: 'active', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
      ];

      mockGameModel.listGames.mockResolvedValue(mockGames);

      const result = await gameService.getAllGames();

      expect(result).toEqual(mockGames);
      expect(mockGameModel.listGames).toHaveBeenCalledWith();
      expect(mockConsoleLog).toHaveBeenCalledWith('📋 Fetching all games');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Found 2 games');
    });
  });

  describe('getGamesByStatus', () => {
    it('should return games by status', async () => {
      const mockGames: Game[] = [
        { id: 'game-1', name: 'Game 1', status: 'active', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
      ];

      mockGameModel.listGames.mockResolvedValue(mockGames);

      const result = await gameService.getGamesByStatus('active');

      expect(result).toEqual(mockGames);
      expect(mockGameModel.listGames).toHaveBeenCalledWith('active');
      expect(mockConsoleLog).toHaveBeenCalledWith('📋 Fetching games with status: active');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Found 1 games with status: active');
    });
  });

  describe('getGameStatus', () => {
    it('should return game status', async () => {
      const mockStatus = {
        id: 'game-1',
        status: 'active' as GameStatus,
        board: [[null, null, null], [null, null, null], [null, null, null]],
        currentPlayerId: 'player-1',
        winnerId: null,
        players: [],
        moves: [],
      };

      mockGameModel.getGameStatus.mockResolvedValue(mockStatus);

      const result = await gameService.getGameStatus('game-1');

      expect(result).toEqual(mockStatus);
      expect(mockGameModel.getGameStatus).toHaveBeenCalledWith('game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('📊 Fetching status for game: game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Game game-1 status: active');
    });
  });

  describe('deleteGame', () => {
    it('should delete game successfully', async () => {
      const mockGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        status: 'completed',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: null,
        winnerId: 'player-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.getGameById.mockResolvedValue(mockGame);
      mockGameModel.deleteGame.mockResolvedValue();

      await gameService.deleteGame('game-1');

      expect(mockGameModel.getGameById).toHaveBeenCalledWith('game-1');
      expect(mockGameModel.deleteGame).toHaveBeenCalledWith('game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('🗑️  Deleting game: game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Game deleted: game-1');
    });

    it('should throw error when game not found', async () => {
      mockGameModel.getGameById.mockResolvedValue(null);

      await expect(gameService.deleteGame('game-1')).rejects.toThrow('Game not found');
    });

    it('should throw error when trying to delete active game', async () => {
      const activeGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        status: 'active',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: 'player-1',
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.getGameById.mockResolvedValue(activeGame);

      await expect(gameService.deleteGame('game-1')).rejects.toThrow('Cannot delete an active game');
    });
  });

  describe('getGameStats', () => {
    it('should return game statistics', async () => {
      const mockStats = {
        totalMoves: 5,
        duration: 1000,
        averageMoveTime: 200,
      };

      mockGameModel.getGameStats.mockResolvedValue(mockStats);

      const result = await gameService.getGameStats('game-1');

      expect(result).toEqual(mockStats);
      expect(mockGameModel.getGameStats).toHaveBeenCalledWith('game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('📈 Fetching stats for game: game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Game game-1 stats: 5 moves, 1000ms duration');
    });
  });

  describe('getValidMoves', () => {
    it('should return valid moves for active game', async () => {
      const mockValidMoves = [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
      ];

      const mockGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        status: 'active',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: null,
        winnerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.getGameById.mockResolvedValue(mockGame);
      mockGameModel.getValidMoves.mockReturnValue(mockValidMoves);

      const result = await gameService.getValidMoves('game-1');

      expect(result).toEqual(mockValidMoves);
      expect(mockGameModel.getGameById).toHaveBeenCalledWith('game-1');
      expect(mockGameModel.getValidMoves).toHaveBeenCalledWith(mockGame.board);
      expect(mockConsoleLog).toHaveBeenCalledWith('🎯 Fetching valid moves for game: game-1');
      expect(mockConsoleLog).toHaveBeenCalledWith('✅ Found 3 valid moves for game: game-1');
    });

    it('should throw error when game not found', async () => {
      mockGameModel.getGameById.mockResolvedValue(null);

      await expect(gameService.getValidMoves('game-1')).rejects.toThrow('Game not found');
    });

    it('should throw error when game is not active', async () => {
      const completedGame: Game = {
        id: 'game-1',
        name: 'Test Game',
        status: 'completed',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        players: [],
        currentPlayerId: null,
        winnerId: 'player-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        moves: [],
      };

      mockGameModel.getGameById.mockResolvedValue(completedGame);

      await expect(gameService.getValidMoves('game-1')).rejects.toThrow('Game is not active');
    });
  });

  describe('getActiveGamesCount', () => {
    it('should return count of active games', async () => {
      mockGameModel.listGames.mockResolvedValue([
        { id: 'game-1', name: 'Game 1', status: 'active', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
        { id: 'game-2', name: 'Game 2', status: 'active', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
      ]);

      const result = await gameService.getActiveGamesCount();

      expect(result).toBe(2);
      expect(mockGameModel.listGames).toHaveBeenCalledWith('active');
    });
  });

  describe('getWaitingGamesCount', () => {
    it('should return count of waiting games', async () => {
      mockGameModel.listGames.mockResolvedValue([
        { id: 'game-1', name: 'Game 1', status: 'waiting', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
      ]);

      const result = await gameService.getWaitingGamesCount();

      expect(result).toBe(1);
      expect(mockGameModel.listGames).toHaveBeenCalledWith('waiting');
    });
  });

  describe('getCompletedGamesCount', () => {
    it('should return count of completed games', async () => {
      mockGameModel.listGames.mockResolvedValue([
        { id: 'game-1', name: 'Game 1', status: 'completed', board: [], players: [], currentPlayerId: null, winnerId: 'player-1', createdAt: new Date(), updatedAt: new Date(), moves: [] },
        { id: 'game-2', name: 'Game 2', status: 'completed', board: [], players: [], currentPlayerId: null, winnerId: 'player-2', createdAt: new Date(), updatedAt: new Date(), moves: [] },
        { id: 'game-3', name: 'Game 3', status: 'draw', board: [], players: [], currentPlayerId: null, winnerId: null, createdAt: new Date(), updatedAt: new Date(), moves: [] },
      ]);

      const result = await gameService.getCompletedGamesCount();

      expect(result).toBe(3);
      expect(mockGameModel.listGames).toHaveBeenCalledWith('completed');
    });
  });
});
