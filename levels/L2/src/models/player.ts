import { Player, PlayerStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PlayerModel {
  // In-memory storage for L2 candidates (no database setup required)
  private players: Map<string, Player> = new Map();

  // TODO: Add proper error handling for player operations
  // TODO: Add input validation for all methods

  /**
   * Create a new player
   */
  async createPlayer(name: string, email: string): Promise<Player> {
    // TODO: Validate input parameters
    // TODO: Check for duplicate email
    // TODO: Validate email format

    const player: Player = {
      id: uuidv4(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      stats: this.createEmptyStats(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.players.set(player.id, player);
    return player;
  }

  /**
   * Get a player by ID
   */
  async getPlayerById(playerId: string): Promise<Player | null> {
    // TODO: Add input validation

    return this.players.get(playerId) || null;
  }

  /**
   * Get a player by email
   */
  async getPlayerByEmail(email: string): Promise<Player | null> {
    // TODO: Add input validation

    const normalizedEmail = email.toLowerCase().trim();
    
    for (const player of this.players.values()) {
      if (player.email === normalizedEmail) {
        return player;
      }
    }

    return null;
  }

  /**
   * Update player statistics
   */
  async updatePlayerStats(playerId: string, stats: Partial<PlayerStats>): Promise<Player> {
    // TODO: Validate player exists
    // TODO: Validate stats data

    const player = await this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // TODO: Update stats
    player.stats = { ...player.stats, ...stats };
    
    // TODO: Recalculate derived stats
    player.stats.winRate = this.calculateWinRate(player.stats);
    player.stats.efficiency = this.calculateEfficiency(player.stats);
    player.stats.averageMovesPerWin = this.calculateAverageMovesPerWin(player.stats);
    
    player.updatedAt = new Date();
    this.players.set(playerId, player);

    return player;
  }

  /**
   * Record a game result for a player
   */
  async recordGameResult(playerId: string, result: 'win' | 'loss' | 'draw', moves: number): Promise<Player> {
    // TODO: Implement game result recording
    const player = await this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const stats = { ...player.stats };
    stats.gamesPlayed++;
    stats.totalMoves += moves;

    switch (result) {
      case 'win':
        stats.gamesWon++;
        break;
      case 'loss':
        stats.gamesLost++;
        break;
      case 'draw':
        stats.gamesDrawn++;
        break;
    }

    return this.updatePlayerStats(playerId, stats);
  }

  /**
   * Get all players
   */
  async getAllPlayers(): Promise<Player[]> {
    // TODO: Add filtering options
    // TODO: Add sorting options

    return Array.from(this.players.values()).sort((a, b) => 
      b.stats.gamesWon - a.stats.gamesWon || 
      b.stats.efficiency - a.stats.efficiency
    );
  }

  /**
   * Get players by win count (for leaderboard)
   */
  async getPlayersByWinCount(limit: number = 10): Promise<Player[]> {
    // TODO: Add pagination support
    // TODO: Add caching for leaderboard

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const players = Array.from(this.players.values())
      .filter(player => player.stats.gamesPlayed > 0)
      .sort((a, b) => b.stats.gamesWon - a.stats.gamesWon)
      .slice(0, limit);

    return players;
  }

  /**
   * Get players by efficiency (for leaderboard)
   */
  async getPlayersByEfficiency(limit: number = 10): Promise<Player[]> {
    // TODO: Add pagination support
    // TODO: Add caching for leaderboard

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const players = Array.from(this.players.values())
      .filter(player => player.stats.gamesPlayed > 0)
      .sort((a, b) => b.stats.efficiency - a.stats.efficiency)
      .slice(0, limit);

    return players;
  }

  /**
   * Update player information
   */
  async updatePlayer(playerId: string, updates: Partial<Pick<Player, 'name' | 'email'>>): Promise<Player> {
    // TODO: Implement player information update
    if (!playerId || !updates) {
      throw new Error('Player ID and updates are required');
    }

    const player = await this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (updates.name !== undefined) {
      if (!updates.name || typeof updates.name !== 'string' || updates.name.trim().length === 0) {
        throw new Error('Player name must be a non-empty string');
      }
      player.name = updates.name.trim();
    }

    if (updates.email !== undefined) {
      if (!updates.email || typeof updates.email !== 'string' || !this.isValidEmail(updates.email)) {
        throw new Error('Valid email address is required');
      }

      const normalizedEmail = updates.email.toLowerCase().trim();
      const existingPlayer = await this.getPlayerByEmail(normalizedEmail);
      if (existingPlayer && existingPlayer.id !== playerId) {
        throw new Error('Email is already in use by another player');
      }

      player.email = normalizedEmail;
    }

    player.updatedAt = new Date();
    this.players.set(playerId, player);

    return player;
  }

  /**
   * Delete a player
   */
  async deletePlayer(playerId: string): Promise<void> {
    // TODO: Add authorization check
    // TODO: Check if player has active games

    const player = await this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    this.players.delete(playerId);
  }

  /**
   * Get player statistics
   */
  async getPlayerStats(playerId: string): Promise<PlayerStats> {
    const player = await this.getPlayerById(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    return player.stats;
  }

  /**
   * Search players by name
   */
  async searchPlayersByName(query: string, limit: number = 10): Promise<Player[]> {
    // TODO: Add fuzzy matching
    // TODO: Add pagination support

    if (!query || typeof query !== 'string') {
      throw new Error('Search query must be a valid string');
    }

    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }

    const normalizedQuery = query.toLowerCase().trim();
    const players = Array.from(this.players.values())
      .filter(player => player.name.toLowerCase().includes(normalizedQuery))
      .sort((a, b) => b.stats.gamesWon - a.stats.gamesWon)
      .slice(0, limit);

    return players;
  }

  /**
   * Create empty player statistics
   */
  private createEmptyStats(): PlayerStats {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      gamesLost: 0,
      gamesDrawn: 0,
      totalMoves: 0,
      averageMovesPerWin: 0,
      winRate: 0,
      efficiency: 0,
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    // TODO: Implement email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Calculate win rate
   */
  private calculateWinRate(stats: PlayerStats): number {
    // TODO: Implement win rate calculation
    if (stats.gamesPlayed === 0) return 0;
    return (stats.gamesWon / stats.gamesPlayed) * 100;
  }

  /**
   * Calculate efficiency (wins per move)
   */
  private calculateEfficiency(stats: PlayerStats): number {
    // TODO: Implement efficiency calculation
    if (stats.totalMoves === 0) return 0;
    return stats.gamesWon / stats.totalMoves;
  }

  /**
   * Calculate average moves per win
   */
  private calculateAverageMovesPerWin(stats: PlayerStats): number {
    // TODO: Implement average moves per win calculation
    if (stats.gamesWon === 0) return 0;
    return stats.totalMoves / stats.gamesWon;
  }

  /**
   * Get player count
   */
  async getPlayerCount(): Promise<number> {
    // TODO: Add caching for count

    return this.players.size;
  }

  /**
   * Get active players (played at least one game)
   */
  async getActivePlayers(): Promise<Player[]> {
    return Array.from(this.players.values())
      .filter(player => player.stats.gamesPlayed > 0)
      .sort((a, b) => b.stats.gamesPlayed - a.stats.gamesPlayed);
  }
}
