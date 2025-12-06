export interface Reminder {
  id: string;
  title: string;
  dateTime: string; // ISO string
  completed: boolean;
  notified: boolean;
  category?: 'work' | 'personal' | 'urgent' | 'health';
}

export interface SmartParseResult {
  title: string;
  dateTime: string | null;
  category?: 'work' | 'personal' | 'urgent' | 'health';
}
