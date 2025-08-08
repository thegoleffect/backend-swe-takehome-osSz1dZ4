import { Game, Player, Move, GameStatus } from '../types';
import { GameModel } from '../models/game';
import { PlayerModel } from '../models/player';

export class GameService {
  private gameModel: GameModel;
  private playerModel: PlayerModel;

  constructor() {
    this.gameModel = new GameModel();
    this.playerModel = new PlayerModel();
  }

  /**
   * Create a new game
   */
  async createGame(name?: string): Promise<Game> {
    console.log(`🎮 Creating new game: ${name || 'Unnamed'}`);
    
    if (name && name.trim().length > 100) {
      throw new Error('Game name must be 100 characters or less');
    }
    
    const game = await this.gameModel.createGame(name);
    console.log(`✅ Game created: ${game.id}`);
    
    return game;
  }

  /**
   * Get a game by ID
   */
  async getGameById(gameId: string): Promise<Game | null> {
    if (!gameId || typeof gameId !== 'string') {
      throw new Error('Game ID must be a valid string');
    }
    
    console.log(`🔍 Fetching game: ${gameId}`);
    const game = await this.gameModel.getGameById(gameId);
    
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
    } else {
      console.log(`✅ Game found: ${gameId} (status: ${game.status})`);
    }
    
    return game;
  }

  /**
   * Join a game
   */
  async joinGame(gameId: string, player: Player): Promise<Game> {
    console.log(`👤 Player ${player.name} (${player.id}) joining game: ${gameId}`);
    
    // Validate player exists in database
    const existingPlayer = await this.playerModel.getPlayerById(player.id);
    if (!existingPlayer) {
      throw new Error('Player not found in database');
    }
    
    // Check if player is already in another active game
    const activeGames = await this.gameModel.listGames('active');
    const playerInActiveGame = activeGames.find(game => 
      game.players.some(p => p.id === player.id)
    );
    
    if (playerInActiveGame) {
      throw new Error('Player is already in an active game');
    }
    
    const game = await this.gameModel.joinGame(gameId, player);
    console.log(`✅ Player ${player.name} joined game: ${gameId}`);
    
    return game;
  }

  /**
   * Make a move in the game
   */
  async makeMove(gameId: string, playerId: string, row: number, col: number): Promise<{ game: Game; move: Move }> {
    console.log(`🎯 Player ${playerId} making move at (${row}, ${col}) in game: ${gameId}`);
    
    // Validate move coordinates
    if (row < 0 || row > 2 || col < 0 || col > 2) {
      throw new Error('Move coordinates must be between 0 and 2');
    }
    
    const result = await this.gameModel.makeMove(gameId, playerId, row, col);
    
    console.log(`✅ Move made: ${result.move.id} at (${row}, ${col})`);
    
    // Update player stats if game is completed
    if (result.game.status === 'completed' || result.game.status === 'draw') {
      await this.updatePlayerStats(result.game);
    }
    
    return result;
  }

  /**
   * Get all games
   */
  async getAllGames(): Promise<Game[]> {
    console.log('📋 Fetching all games');
    const games = await this.gameModel.listGames();
    console.log(`✅ Found ${games.length} games`);
    return games;
  }

  /**
   * Get games by status
   */
  async getGamesByStatus(status: GameStatus): Promise<Game[]> {
    console.log(`📋 Fetching games with status: ${status}`);
    const games = await this.gameModel.listGames(status);
    console.log(`✅ Found ${games.length} games with status: ${status}`);
    return games;
  }

  /**
   * Get games by player ID
   */
  async getGamesByPlayerId(playerId: string): Promise<Game[]> {
    if (!playerId || typeof playerId !== 'string') {
      throw new Error('Player ID must be a valid string');
    }
    
    console.log(`📋 Fetching games for player: ${playerId}`);
    
    // Get all games and filter by player
    const allGames = await this.gameModel.listGames();
    const playerGames = allGames.filter(game => 
      game.players.some(player => player.id === playerId)
    );
    
    console.log(`✅ Found ${playerGames.length} games for player: ${playerId}`);
    return playerGames;
  }

  /**
   * Get game status
   */
  async getGameStatus(gameId: string): Promise<{
    id: string;
    status: GameStatus;
    board: any;
    currentPlayerId: string | null;
    winnerId: string | null;
    players: Player[];
    moves: Move[];
  }> {
    console.log(`📊 Fetching status for game: ${gameId}`);
    const status = await this.gameModel.getGameStatus(gameId);
    console.log(`✅ Game ${gameId} status: ${status.status}`);
    return status;
  }

  /**
   * Delete a game
   */
  async deleteGame(gameId: string): Promise<void> {
    console.log(`🗑️  Deleting game: ${gameId}`);
    
    const game = await this.gameModel.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    // Only allow deletion of completed or waiting games
    if (game.status === 'active') {
      throw new Error('Cannot delete an active game');
    }
    
    await this.gameModel.deleteGame(gameId);
    console.log(`✅ Game deleted: ${gameId}`);
  }

  /**
   * Get game statistics
   */
  async getGameStats(gameId: string): Promise<{
    totalMoves: number;
    duration: number;
    averageMoveTime: number;
  }> {
    console.log(`📈 Fetching stats for game: ${gameId}`);
    const stats = await this.gameModel.getGameStats(gameId);
    console.log(`✅ Game ${gameId} stats: ${stats.totalMoves} moves, ${stats.duration}ms duration`);
    return stats;
  }

  /**
   * Get valid moves for a game
   */
  async getValidMoves(gameId: string): Promise<Array<{ row: number; col: number }>> {
    console.log(`🎯 Fetching valid moves for game: ${gameId}`);
    
    const game = await this.gameModel.getGameById(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    
    if (game.status !== 'active') {
      throw new Error('Game is not active');
    }
    
    const validMoves = this.gameModel.getValidMoves(game.board);
    console.log(`✅ Found ${validMoves.length} valid moves for game: ${gameId}`);
    return validMoves;
  }

  /**
   * Update player statistics after game completion
   */
  private async updatePlayerStats(game: Game): Promise<void> {
    console.log(`📊 Updating player stats for completed game: ${game.id}`);
    
    if (game.status !== 'completed' && game.status !== 'draw') {
      return;
    }
    
    const totalMoves = game.moves.length;
    
    for (const player of game.players) {
      const playerMoves = game.moves.filter(move => move.playerId === player.id).length;
      
      let result: 'win' | 'loss' | 'draw';
      if (game.status === 'draw') {
        result = 'draw';
      } else if (game.winnerId === player.id) {
        result = 'win';
      } else {
        result = 'loss';
      }
      
      try {
        await this.playerModel.recordGameResult(player.id, result, playerMoves);
        console.log(`✅ Updated stats for player ${player.name}: ${result}`);
      } catch (error) {
        console.error(`❌ Failed to update stats for player ${player.name}:`, error);
      }
    }
  }

  /**
   * Get active games count
   */
  async getActiveGamesCount(): Promise<number> {
    const activeGames = await this.gameModel.listGames('active');
    return activeGames.length;
  }

  /**
   * Get waiting games count
   */
  async getWaitingGamesCount(): Promise<number> {
    const waitingGames = await this.gameModel.listGames('waiting');
    return waitingGames.length;
  }

  /**
   * Get completed games count
   */
  async getCompletedGamesCount(): Promise<number> {
    const completedGames = await this.gameModel.listGames('completed');
    return completedGames.length;
  }
}
