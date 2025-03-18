import { CandleData } from '../types/crypto';

interface RiskPoint {
  time: number;
  value: number;
  price: number;
}

interface ATHATLState {
  ath: number;
  atl: number;
}

export const getRiskGradientColor = (value: number): string => {
  if (value < 0.1) return '#0000ff'; // Deep Blue
  if (value < 0.2) return '#000bff'; // Blue
  if (value < 0.3) return '#0090ff'; // Light Blue
  if (value < 0.4) return '#00fbff'; // Cyan
  if (value < 0.5) return '#00ff7e'; // Teal
  if (value < 0.6) return '#00ff37'; // Light Green
  if (value < 0.7) return '#94ff00'; // Yellow-Green
  if (value < 0.8) return '#ffff00'; // Yellow  
  if (value < 0.9) return '#ffb200'; // Orange
  return '#ff0017';                  // Red
};

export const getFillColor = (level: number): string => {
  if (level <= 0.5) {
    const opacity = 0.9 - (level * 0.6);
    return `rgba(0, 85, 85, ${opacity})`;
  } else {
    const opacity = 0.9 - ((1 - level) * 0.6);
    return `rgba(139, 0, 0, ${opacity})`;
  }
};

export const calculateRiskLine = (data: CandleData[]): RiskPoint[] => {
  // Make sure we have enough data
  if (data.length < 374) {
    console.warn(`Not enough data for risk calculation: ${data.length} data points, need at least 374`);
    
    // Return dummy risk data for testing if needed
    if (data.length > 0) {
      return [
        { time: Number(data[0].time), value: 0.3, price: data[0].close },
        { time: Number(data[Math.floor(data.length / 2)].time), value: 0.5, price: data[Math.floor(data.length / 2)].close },
        { time: Number(data[data.length - 1].time), value: 0.7, price: data[data.length - 1].close }
      ];
    }
    return [];
  }

  // Sort data chronologically
  const sortedData = [...data].sort((a, b) => Number(a.time) - Number(b.time));
  
  // Calculate SMA 374
  const sma374Values = calculateSMA(sortedData, 374);
  console.log(`SMA374 calculated. Values: ${sma374Values.length}`);
  
  // Calculate log differences and apply scaling
  const rawValues = sortedData.slice(373).map((candle, i) => {
    const smaValue = sma374Values[i];
    const logDiff = Math.log(candle.close / smaValue);
    const scaleFactor = Math.pow(i + 1, 0.395);
    return { 
      time: candle.time,
      close: candle.close, 
      sma: smaValue,
      scaledValue: logDiff * scaleFactor
    };
  });
  
  // Find min and max for normalization
  const minValue = Math.min(...rawValues.map(v => v.scaledValue));
  const maxValue = Math.max(...rawValues.map(v => v.scaledValue));
  
  console.log('Risk value range:', { minValue, maxValue });
  
  // Normalize to 0-1 range
  const riskPoints = rawValues.map(point => {
    // Ensure we have a valid range to avoid division by zero
    const range = maxValue - minValue;
    const normalizedValue = range > 0
      ? (point.scaledValue - minValue) / range
      : 0.5; // Default to mid-range if no range exists
    
    return {
      time: Number(point.time),
      value: Math.max(0, Math.min(1, normalizedValue)), // Clamp to 0-1
      price: point.close
    };
  });
  
  // Log diagnostic information
  console.log('Risk calculation complete:', {
    dataPoints: riskPoints.length,
    firstPoint: riskPoints[0],
    lastPoint: riskPoints[riskPoints.length - 1],
    averageRisk: riskPoints.reduce((sum, p) => sum + p.value, 0) / riskPoints.length
  });

  return riskPoints;
};

const calculateSMA = (data: CandleData[], period: number): number[] => {
  if (data.length < period) {
    console.warn(`Cannot calculate SMA: not enough data (${data.length}) for period ${period}`);
    return Array(data.length).fill(data[0].close);
  }

  const smaValues: number[] = [];
  let sum = 0;
  
  // Calculate first SMA
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  smaValues.push(sum / period);
  
  // Calculate subsequent SMAs using sliding window
  for (let i = period; i < data.length; i++) {
    sum = sum - data[i - period].close + data[i].close;
    smaValues.push(sum / period);
  }
  
  return smaValues;
};

const color_from_gradient = (value: number, min: number, max: number, colorStart: string, colorEnd: string): string => {
  const ratio = (value - min) / (max - min);
  const hex = (x: number) => Math.round(x).toString(16).padStart(2, '0');
  
  const r1 = parseInt(colorStart.slice(1, 3), 16);
  const g1 = parseInt(colorStart.slice(3, 5), 16);
  const b1 = parseInt(colorStart.slice(5, 7), 16);
  
  const r2 = parseInt(colorEnd.slice(1, 3), 16);
  const g2 = parseInt(colorEnd.slice(3, 5), 16);
  const b2 = parseInt(colorEnd.slice(5, 7), 16);
  
  const r = r1 + (r2 - r1) * ratio;
  const g = g1 + (g2 - g1) * ratio;
  const b = b1 + (b2 - b1) * ratio;
  
  return `#${hex(r)}${hex(g)}${hex(b)}`;
};
