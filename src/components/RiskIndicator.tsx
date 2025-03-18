import { useEffect, useRef, useMemo, useState } from 'react';
import { Box, Typography, useTheme, Chip, Stack } from '@mui/material';
import { createChart, ColorType, Time } from 'lightweight-charts';
import { CandleData } from '../types/crypto';
import { calculateRiskLine, getRiskGradientColor } from '../services/riskLineService';

interface RiskIndicatorProps {
  data: CandleData[];
}

export const RiskIndicator = ({ data }: RiskIndicatorProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const [currentRisk, setCurrentRisk] = useState<number | null>(null);
  
  // Calculate risk data from the price data
  const riskData = useMemo(() => {
    try {
      const result = calculateRiskLine(data);
      if (result.length > 0) {
        // Get the most recent risk value
        setCurrentRisk(result[result.length - 1].value);
      }
      return result;
    } catch (error) {
      console.error('Error calculating risk data:', error);
      return [];
    }
  }, [data]);

  useEffect(() => {
    if (!chartContainerRef.current || !riskData || riskData.length === 0) {
      return;
    }

    // Create chart with fixed height for risk indicator
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 120,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: theme.palette.text.primary,
      },
      grid: {
        horzLines: {
          color: theme.palette.mode === 'dark' ? '#232323' : '#e0e0e0',
        },
        vertLines: {
          visible: false,
        },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
      },
      leftPriceScale: {
        visible: true,
        autoScale: false,
        entireTextOnly: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
        borderVisible: true,
      },
      rightPriceScale: {
        visible: false,
      },
    });
    
    // Add background areas first (bottom to top)
    const colorBands = [
      { min: 0.0, max: 0.2, color: 'rgba(0, 200, 83, 0.1)', label: 'Low' },
      { min: 0.2, max: 0.4, color: 'rgba(0, 230, 118, 0.1)', label: 'Low-Med' },
      { min: 0.4, max: 0.6, color: 'rgba(255, 235, 59, 0.1)', label: 'Medium' },
      { min: 0.6, max: 0.8, color: 'rgba(255, 145, 0, 0.1)', label: 'Med-High' },
      { min: 0.8, max: 1.0, color: 'rgba(255, 23, 68, 0.1)', label: 'High' },
    ];
    
    const allSeries = [];
    
    colorBands.forEach(band => {
      const areaSeries = chart.addAreaSeries({
        topColor: band.color.replace('0.1', '0.4'),
        bottomColor: band.color,
        lineColor: 'transparent',
        priceScaleId: 'left',
        lastValueVisible: false,
      });
      allSeries.push(areaSeries);
      
      // Map time range with constant values for top and bottom of band
      areaSeries.setData(
        riskData.map(point => ({
          time: point.time as Time,
          value: band.max,
          value2: band.min
        }))
      );
    });

    // Add grid lines
    [0, 0.2, 0.4, 0.6, 0.8, 1].forEach(level => {
      const gridLine = chart.addLineSeries({
        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
        lineWidth: 1,
        lineStyle: 1, // Solid line
        priceScaleId: 'left',
        lastValueVisible: false,
      });
      allSeries.push(gridLine);
      
      gridLine.setData([
        { time: riskData[0].time as Time, value: level },
        { time: riskData[riskData.length - 1].time as Time, value: level }
      ]);
    });

    // Add main risk line on top
    const mainSeries = chart.addLineSeries({
      lineWidth: 3,
      priceScaleId: 'left',
      lastValueVisible: true,
      priceLineVisible: false,
      title: 'Risk',
    });
    allSeries.push(mainSeries);
    
    // Set data with colors
    mainSeries.setData(
      riskData.map(point => ({
        time: point.time as Time, 
        value: point.value,
        color: getRiskGradientColor(point.value)
      }))
    );
    
    // Force scale to 0-1
    chart.priceScale('left').applyOptions({
      autoScale: false,
      scaleMargins: {
        top: 0,
        bottom: 0,
      },
    });

    // Fit time scale to content
    chart.timeScale().fitContent();
    
    // Handle window resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [riskData, theme]);

  // Get risk level text
  const getRiskLevelText = (value: number) => {
    if (value < 0.2) return 'Very Low';
    if (value < 0.4) return 'Low';
    if (value < 0.6) return 'Medium';
    if (value < 0.8) return 'High';
    return 'Extreme';
  };

  // Get color for the risk chip
  const getRiskChipColor = (value: number) => {
    if (value < 0.2) return 'success';
    if (value < 0.4) return 'info';
    if (value < 0.6) return 'warning';
    return 'error';
  };

  if (!riskData || riskData.length === 0) {
    return null; // Don't render anything if there's no data
  }

  return (
    <Box sx={{ mt: 2, p: 1, border: 1, borderColor: 'divider', borderRadius: 1 }}>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ mb: 1 }}
      >
        <Typography variant="subtitle2">Risk Indicator</Typography>
        {currentRisk !== null && (
          <Chip
            label={`${getRiskLevelText(currentRisk)} Risk (${Math.round(currentRisk * 100)}%)`}
            color={getRiskChipColor(currentRisk) as any}
            size="small"
            variant="outlined"
          />
        )}
      </Stack>
      <Box ref={chartContainerRef} sx={{ height: 120, width: '100%' }} />
    </Box>
  );
};
