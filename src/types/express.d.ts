declare global {
  namespace Express {
    interface Request {
      sessionID: string;
      user: {
        role: string;
        sessionId?: string;
      };
    }
  }
}
export {};
