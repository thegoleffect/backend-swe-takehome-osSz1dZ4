// Game-related types
export interface Game {
  id: string;
  status: GameStatus;
  board: GameBoard;
  players: Player[];
  currentPlayerId: string | null;
  winnerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  moves: Move[];
}

export type GameStatus = 'waiting' | 'active' | 'completed' | 'draw';

export type GameBoard = (number | null)[][]; // 3x3 grid, null = empty, number = player ID

export interface Move {
  id: string;
  gameId: string;
  playerId: string;
  row: number;
  col: number;
  timestamp: Date;
}

// Player-related types
export interface Player {
  id: string;
  name: string;
  email: string;
  stats: PlayerStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  gamesDrawn: number;
  totalMoves: number;
  averageMovesPerWin: number;
  winRate: number;
  efficiency: number; // average moves per win (lower is better)
}

// API Request/Response types
export interface CreateGameRequest {
  name?: string;
}

export interface CreateGameResponse {
  game: Game;
  message: string;
}

export interface JoinGameRequest {
  playerId: string;
}

export interface JoinGameResponse {
  game: Game;
  message: string;
}

export interface MakeMoveRequest {
  playerId: string;
  row: number;
  col: number;
}

export interface MakeMoveResponse {
  game: Game;
  move: Move;
  message: string;
}

export interface GetGameResponse {
  game: Game;
}

export interface GetPlayerResponse {
  player: Player;
}

export interface GetPlayerStatsResponse {
  stats: PlayerStats;
}

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  wins: number;
  efficiency: number;
  winRate: number;
}

export interface GetLeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  type: 'wins' | 'efficiency';
}

// Error types
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  timestamp: string;
}

// Database types
export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

// Validation types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// Game logic types
export type WinCondition = 'row' | 'column' | 'diagonal';

export interface WinResult {
  winner: Player;
  condition: WinCondition;
  positions: Array<{ row: number; col: number }>;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Environment types
export interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
}
