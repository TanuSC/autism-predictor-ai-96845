import { SessionHistory } from '@/types/autism';

const SESSION_HISTORY_KEY = 'autism_screening_history';

export const saveSession = (session: SessionHistory): void => {
  try {
    const history = getSessionHistory();
    history.unshift(session);
    // Keep only last 10 sessions
    const limitedHistory = history.slice(0, 10);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

export const getSessionHistory = (): SessionHistory[] => {
  try {
    const stored = localStorage.getItem(SESSION_HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load session history:', error);
    return [];
  }
};

export const clearSessionHistory = (): void => {
  try {
    localStorage.removeItem(SESSION_HISTORY_KEY);
  } catch (error) {
    console.error('Failed to clear session history:', error);
  }
};

export const deleteSession = (id: string): void => {
  try {
    const history = getSessionHistory();
    const filtered = history.filter(session => session.id !== id);
    localStorage.setItem(SESSION_HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete session:', error);
  }
};
