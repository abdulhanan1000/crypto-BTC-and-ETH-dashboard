import { Time } from 'lightweight-charts';

export interface CandleData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface IndicatorData {
  time: Time;
  value: number;
}
