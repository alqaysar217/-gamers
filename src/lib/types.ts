import { Timestamp } from "firebase/firestore";

export type GameSession = {
  id: string;
  playerProfileId: string;
  playerName: string;
  totalPointsEarned: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type PlayerProfile = {
  id: string;
  playerName: string;
  firstSessionDate: Timestamp;
  lastSessionDate: Timestamp;
  totalGamesPlayed: number;
  highestSessionScore: number;
  initialSurveyScore?: number;
  completedChallenges?: string[];
};

export type SurveyAnswerRecord = {
  question: string;
  answer: string;
  points: number;
};

export type SurveyResponse = {
  id: string;
  playerProfileId: string;
  playerName: string;
  createdAt: Timestamp;
  answers: SurveyAnswerRecord[];
};
