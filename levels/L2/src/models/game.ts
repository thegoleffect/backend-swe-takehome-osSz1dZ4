import { Game, GameStatus, GameBoard, Move, Player, WinResult, WinCondition } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class GameModel {
  // In-memory storage for L2 candidates (no database setup required)
  private games: Map<string, Game> = new Map();

  // TODO: Add proper error handling for game operations
  // TODO: Add input validation for all methods

  /**
   * Create a new game
   */
  async createGame(name?: string): Promise<Game> {
    // TODO: Validate input parameters
    // TODO: Check for duplicate game names if needed

    const game: Game = {
      id: uuidv4(),
      name: name || `Game-${Date.now()}`,
      status: 'waiting',
      board: this.createEmptyBoard(),
      players: [],
      currentPlayerId: null,
      winnerId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      moves: [],
    };

    this.games.set(game.id, game);
    return game;
  }

  /**
   * Get a game by ID
   */
  async getGameById(gameId: string): Promise<Game | null> {
    // TODO: Add input validation

    return this.games.get(gameId) || null;
  }

  /**
   * Add a player to a game
   */
  async joinGame(gameId: string, player: Player): Promise<Game> {
    // TODO: Validate game exists and is in waiting status
    // TODO: Check if player is already in the game
    // TODO: Check if game is full (max 2 players)
    // TODO: Update game status to 'active' if 2 players join
    // TODO: Set current player to first player

    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'waiting') {
      throw new Error('Game is not accepting new players');
    }

    if (game.players.length >= 2) {
      throw new Error('Game is full');
    }

    game.players.push(player);
    
    if (game.players.length === 2) {
      game.status = 'active';
      game.currentPlayerId = game.players[0].id;
    }

    game.updatedAt = new Date();
    this.games.set(gameId, game);

    return game;
  }

  /**
   * Make a move in the game
   */
  async makeMove(gameId: string, playerId: string, row: number, col: number): Promise<{ game: Game; move: Move }> {
    // TODO: Validate game exists and is active
    // TODO: Validate it's the player's turn
    // TODO: Validate the move is valid (cell is empty, within bounds)
    // TODO: Check for win condition after move
    // TODO: Check for draw condition after move
    // TODO: Update game status accordingly

    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }

    if (game.currentPlayerId !== playerId) {
      throw new Error('Not your turn');
    }

    // TODO: Validate move coordinates
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Move coordinates must be between 0 and 2');
    }

    // TODO: Check if cell is empty
    if (game.board[row][col] !== null) {
      throw new Error('Cell is already occupied');
    }

    // TODO: Make the move
    const player = game.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Player not found in game');
    }

    game.board[row][col] = playerId;
    game.updatedAt = new Date();

    // TODO: Create move record
    const move: Move = {
      id: uuidv4(),
      gameId,
      playerId,
      row,
      col,
      timestamp: new Date(),
    };

    game.moves.push(move);

    // TODO: Check for win condition
    const winResult = this.checkWinCondition(game.board, playerId);
    if (winResult.won) {
      game.status = 'completed';
      game.winnerId = playerId;
    } else if (this.isDraw(game.board)) {
      game.status = 'draw';
    } else {
      // TODO: Switch to next player
      const currentPlayerIndex = game.players.findIndex(p => p.id === playerId);
      const nextPlayerIndex = (currentPlayerIndex + 1) % game.players.length;
      game.currentPlayerId = game.players[nextPlayerIndex].id;
    }

    this.games.set(gameId, game);
    return { game, move };
  }

  /**
   * Get game status
   */
  async getGameStatus(gameId: string): Promise<{
    id: string;
    status: GameStatus;
    board: GameBoard;
    currentPlayerId: string | null;
    winnerId: string | null;
    players: Player[];
    moves: Move[];
  }> {
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    return {
      id: game.id,
      status: game.status,
      board: game.board,
      currentPlayerId: game.currentPlayerId,
      winnerId: game.winnerId,
      players: game.players,
      moves: game.moves,
    };
  }

  /**
   * List all games
   */
  async listGames(status?: GameStatus): Promise<Game[]> {
    // TODO: Add filtering options (status, date range, etc.)
    let games = Array.from(this.games.values());
    
    if (status) {
      games = games.filter(game => game.status === status);
    }

    return games.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: string): Promise<void> {
    // TODO: Add authorization check
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    this.games.delete(gameId);
  }

  /**
   * Create an empty 3x3 board
   */
  private createEmptyBoard(): GameBoard {
    return [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ];
  }

  /**
   * Check if a player has won
   */
  private checkWinCondition(board: GameBoard, playerId: string): WinResult {
    // TODO: Implement win condition checking
    // TODO: Check rows, columns, and diagonals
    // TODO: Return appropriate win result

    // Check rows
    for (let row = 0; row < 3; row++) {
      if (board[row][0] === playerId && board[row][1] === playerId && board[row][2] === playerId) {
        return { won: true, condition: 'row', position: row };
      }
    }

    // Check columns
    for (let col = 0; col < 3; col++) {
      if (board[0][col] === playerId && board[1][col] === playerId && board[2][col] === playerId) {
        return { won: true, condition: 'column', position: col };
      }
    }

    // Check diagonals
    if (board[0][0] === playerId && board[1][1] === playerId && board[2][2] === playerId) {
      return { won: true, condition: 'diagonal', position: 0 };
    }

    if (board[0][2] === playerId && board[1][1] === playerId && board[2][0] === playerId) {
      return { won: true, condition: 'diagonal', position: 1 };
    }

    return { won: false };
  }

  /**
   * Check if the game is a draw
   */
  private isDraw(board: GameBoard): boolean {
    // TODO: Implement draw condition checking
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get valid moves for a player
   */
  getValidMoves(board: GameBoard): Array<{ row: number; col: number }> {
    // TODO: Implement valid moves calculation
    const validMoves: Array<{ row: number; col: number }> = [];
    
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if (board[row][col] === null) {
          validMoves.push({ row, col });
        }
      }
    }
    
    return validMoves;
  }

  /**
   * Get game statistics
   */
  async getGameStats(gameId: string): Promise<{
    totalMoves: number;
    duration: number;
    averageMoveTime: number;
  }> {
    // TODO: Implement game statistics calculation
    const game = await this.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    const totalMoves = game.moves.length;
    const duration = game.updatedAt.getTime() - game.createdAt.getTime();
    const averageMoveTime = totalMoves > 0 ? duration / totalMoves : 0;

    return {
      totalMoves,
      duration,
      averageMoveTime,
    };
  }
}
