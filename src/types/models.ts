export interface ElectionEvent {
  id: string;
  name: string;
  electionDay: string;
  ocdDivisionId?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface CivicLocation {
  address: {
    locationName?: string;
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  notes?: string;
  pollingHours?: string;
  sources?: Array<{ name: string; official: boolean }>;
  latitude?: number;
  longitude?: number;
  type?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface VoterInfo {
  election?: ElectionEvent;
  pollingLocations?: CivicLocation[];
  earlyVoteSites?: CivicLocation[];
  dropOffLocations?: CivicLocation[];
}
