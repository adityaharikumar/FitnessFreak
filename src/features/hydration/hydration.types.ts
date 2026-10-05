export type WaterEntry = {
  id: string;
  amountMl: number;
  recordedAt: string;
  localDate: string;
};

export type HydrationData = {
  version: 1;
  goalMl: number;
  entries: WaterEntry[];
};
