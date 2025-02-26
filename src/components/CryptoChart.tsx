import { useEffect, useRef, useState } from "react";
import { createChart, ColorType, Time } from "lightweight-charts";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { TimeFrame, TimeFrameSelector } from "./TimeFrameSelector";
import { CandleData, IndicatorData } from "../types/crypto";
import { IndicatorControls, IndicatorSettings } from "./IndicatorControls";

interface CryptoChartProps {
  symbol: string;
  data: CandleData[];
  currentPrice: number;
  timeFrame: TimeFrame;
  onTimeFrameChange: (newTimeFrame: TimeFrame) => void;
}

const calculateSMA = (data: CandleData[], period: number): IndicatorData[] => {
  const smaData: IndicatorData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val.close, 0);
    smaData.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return smaData;
};

const calculateEMA = (data: CandleData[], period: number): IndicatorData[] => {
  const smoothing = 2 / (period + 1);
  const emaData: IndicatorData[] = [];

  // Initialize first EMA with SMA
  const firstSMA =
    data.slice(0, period).reduce((sum, price) => sum + price.close, 0) / period;
  emaData.push({
    time: data[period - 1].time,
    value: firstSMA,
  });

  // Calculate subsequent EMAs
  for (let i = period; i < data.length; i++) {
    const previousEMA = emaData[emaData.length - 1].value;
    const currentValue =
      (data[i].close - previousEMA) * smoothing + previousEMA;
    emaData.push({
      time: data[i].time,
      value: currentValue,
    });
  }

  return emaData;
};

const calculateMA = (data: CandleData[], period: number): IndicatorData[] => {
  const maData: IndicatorData[] = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data
      .slice(i - period + 1, i + 1)
      .reduce((acc, val) => acc + val.close, 0);
    maData.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return maData;
};

const calculateMovingAverages = (data: CandleData[]) => {
  return {
    ma20: calculateMA(data, 20),
    ma50: calculateMA(data, 50),
    ma100: calculateMA(data, 100),
    ma200: calculateMA(data, 200),
  };
};

const calculateWeeklyData = (data: CandleData[]): CandleData[] => {
  const weeklyData: CandleData[] = [];
  let currentWeek: CandleData[] = [];

  // Sort data first
  const sortedData = [...data].sort((a, b) => Number(a.time) - Number(b.time));

  sortedData.forEach((candle) => {
    const date = new Date(Number(candle.time) * 1000);
    // If this is the first candle of a new week or the array is empty
    if (currentWeek.length === 0) {
      currentWeek.push(candle);
    } else {
      const firstCandleDate = new Date(Number(currentWeek[0].time) * 1000);
      // Check if candle belongs to the same week as the first candle
      if (isSameWeek(date, firstCandleDate)) {
        currentWeek.push(candle);
      } else {
        // Create weekly candle and start new week
        weeklyData.push(createWeeklyCandle(currentWeek));
        currentWeek = [candle];
      }
    }
  });

  // Don't forget the last week
  if (currentWeek.length > 0) {
    weeklyData.push(createWeeklyCandle(currentWeek));
  }

  return weeklyData;
};

const isSameWeek = (date1: Date, date2: Date): boolean => {
  const getWeekNumber = (date: Date) => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  };

  return (
    date1.getFullYear() === date2.getFullYear() &&
    getWeekNumber(date1) === getWeekNumber(date2)
  );
};

const createWeeklyCandle = (candles: CandleData[]): CandleData => ({
  time: candles[0].time,
  open: candles[0].open,
  high: Math.max(...candles.map((c) => c.high)),
  low: Math.min(...candles.map((c) => c.low)),
  close: candles[candles.length - 1].close,
});

const processTimeStamp = (timestamp: number): Time => {
  return timestamp as Time;
};

export const CryptoChart = ({
  symbol,
  data,
  currentPrice,
  timeFrame,
  onTimeFrameChange,
}: CryptoChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showMA20: true,
    showMA50: true,
    showMA100: true,
    showMA200: true,
    showBullBand: true,
  });

  useEffect(() => {
    if (!chartContainerRef.current || !data.length) return;

    const handleResize = () => {
      if (chartContainerRef.current) {
        const width = chartContainerRef.current.clientWidth;
        const height = Math.min(500, width * 0.75); // Make height responsive
        chart.applyOptions({ 
          width,
          height
        });
      }
    };

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme.palette.background.paper 
        },
        textColor: theme.palette.text.primary,
      },
      grid: {
        vertLines: { 
          color: theme.palette.mode === 'dark' ? '#232323' : '#e0e0e0' 
        },
        horzLines: { 
          color: theme.palette.mode === 'dark' ? '#232323' : '#e0e0e0' 
        },
      },
      width: chartContainerRef.current.clientWidth,
      height: Math.min(500, chartContainerRef.current.clientWidth * 0.75),
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#26a69a",
      downColor: "#ef5350",
      borderVisible: false,
      wickUpColor: "#26a69a",
      wickDownColor: "#ef5350",
    });

    const sortedData = [...data].sort((a, b) => Number(a.time) - Number(b.time));
    candlestickSeries.setData(sortedData);

    const maData = calculateMovingAverages(sortedData);

    // Add MA indicators based on settings
    if (indicators.showMA50) {
      const ma50 = chart.addLineSeries({
        color: "#2E7D32",
        lineWidth: 2,
        title: "MA50",
      });
      ma50.setData(
        maData.ma50.map((d) => ({
          time: processTimeStamp(d.time as number),
          value: d.value,
        }))
      );
    }

    if (indicators.showMA100) {
      const ma100 = chart.addLineSeries({
        color: "#ED6C02",
        lineWidth: 2,
        title: "MA100",
      });
      ma100.setData(
        maData.ma100.map((d) => ({
          time: processTimeStamp(d.time as number),
          value: d.value,
        }))
      );
    }

    if (indicators.showMA200) {
      const ma200 = chart.addLineSeries({
        color: "#D32F2F",
        lineWidth: 2,
        title: "MA200",
      });
      ma200.setData(
        maData.ma200.map((d) => ({
          time: processTimeStamp(d.time as number),
          value: d.value,
        }))
      );
    }

    // Only add MA20 if not showing bull market support band and it's enabled
    if (timeFrame !== "1w" && timeFrame !== "1d" && indicators.showMA20) {
      const ma20 = chart.addLineSeries({
        color: "#2962FF",
        lineWidth: 2,
        title: "MA20",
      });
      ma20.setData(
        maData.ma20.map((d) => ({
          time: processTimeStamp(d.time as number),
          value: d.value,
        }))
      );
    }

    // Add Bull Market Support Band if enabled
    if ((timeFrame === "1w" || timeFrame === "1d") && indicators.showBullBand) {
      console.log("Adding bull market support band"); // Debug log

      // Always calculate based on weekly data
      const weeklyData = calculateWeeklyData(sortedData);

      // Calculate the indicators based on weekly data
      const sma20wData = calculateSMA(weeklyData, 20);
      const ema21wData = calculateEMA(weeklyData, 21);

      // Add the lines with increased visibility
      const sma20w = chart.addLineSeries({
        color: "rgb(255, 82, 82)",
        lineWidth: 3,
        title: "20W SMA",
        priceLineVisible: true,
      });

      sma20w.setData(
        sma20wData.map((d) => ({
          time: processTimeStamp(d.time as number),
          value: d.value,
        }))
      );

      const ema21w = chart.addLineSeries({
        color: "rgb(76, 175, 80)",
        lineWidth: 3,
        title: "21W EMA",
        priceLineVisible: true,
      });

      ema21w.setData(
        ema21wData.map((d) => ({
          time: processTimeStamp(d.time as number),
          value: d.value,
        }))
      );

      // Ensure proper scaling
      chart.timeScale().fitContent();
    }

    // Fit content
    chart.timeScale().fitContent();

    // Add legend
    chart.applyOptions({
      crosshair: {
        mode: 1,
        vertLine: {
          labelBackgroundColor: theme.palette.background.paper,
        },
        horzLine: {
          labelBackgroundColor: theme.palette.background.paper,
        },
      },
    });

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [data, timeFrame, indicators, theme.palette.mode]);

  return (
    <Paper
      elevation={theme.palette.mode === 'dark' ? 3 : 1}
      sx={{
        p: { xs: 1, sm: 2 },
        height: "100%",
        bgcolor: "background.paper",
        color: "text.primary",
      }}
    >
      <Typography variant="h5" gutterBottom>
        {symbol} Chart
      </Typography>
      <Typography variant="h4" color="primary" gutterBottom>
        ${currentPrice.toLocaleString()}
      </Typography>
      <TimeFrameSelector timeFrame={timeFrame} onChange={onTimeFrameChange} />
      <IndicatorControls
        settings={indicators}
        onChange={setIndicators}
        timeFrame={timeFrame}
      />
      <Box ref={chartContainerRef} />
    </Paper>
  );
};
