// Session management utilities for user authentication
export interface UserSession {
  userId: number;
  phoneNumber: string;
  name?: string;
}

export const setUserSession = (session: UserSession) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('snapfix_session', JSON.stringify(session));
  }
};

export const getUserSession = (): UserSession | null => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('snapfix_session');
    if (session) {
      try {
        return JSON.parse(session);
      } catch {
        return null;
      }
    }
  }
  return null;
};

export const clearUserSession = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('snapfix_session');
  }
};

export const isAuthenticated = (): boolean => {
  return getUserSession() !== null;
};