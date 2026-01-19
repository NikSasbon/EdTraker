
export interface Editor {
  id: string;
  name: string;
}

export interface WeeklyEntry {
  id: string;
  editorId: string;
  week: string; // Formato YYYY-WW (e.g. 2024-W12)
  minutes: number;
  seconds: number;
}

export interface WinningVideo {
  id: string;
  editorId: string;
  month: string; // Formato YYYY-MM
  name: string;
  link: string;
  spend: number;
  roas: number;
  purchases: number;
  isBestPerformer: boolean;
}

export interface MonthlySummary {
  editorId: string;
  month: string;
  manualWinners: number;
}

export interface Thresholds {
  target: number;
  outstanding: number;
}

export type ViewType = 'tracking' | 'dashboard' | 'settings';

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'error';
