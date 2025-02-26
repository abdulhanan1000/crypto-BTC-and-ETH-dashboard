import { ButtonGroup, Button, Box, useTheme } from '@mui/material';

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

interface TimeFrameSelectorProps {
  timeFrame: TimeFrame;
  onChange: (newTimeFrame: TimeFrame) => void;
}

export const TimeFrameSelector = ({ timeFrame, onChange }: TimeFrameSelectorProps) => {
  const theme = useTheme();

  const buttonStyle = {
    color: theme.palette.text.primary,
    borderColor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.23)' : 'rgba(255, 255, 255, 0.23)',
    '&.Mui-selected, &:hover': {
      backgroundColor: theme.palette.mode === 'light' 
        ? 'rgba(0, 0, 0, 0.08)' 
        : 'rgba(255, 255, 255, 0.08)',
    }
  };

  return (
    <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
      <ButtonGroup variant="outlined" size="small">
        <Button sx={buttonStyle} onClick={() => onChange('1m')} variant={timeFrame === '1m' ? 'contained' : 'outlined'}>1M</Button>
        <Button sx={buttonStyle} onClick={() => onChange('5m')} variant={timeFrame === '5m' ? 'contained' : 'outlined'}>5M</Button>
        <Button sx={buttonStyle} onClick={() => onChange('15m')} variant={timeFrame === '15m' ? 'contained' : 'outlined'}>15M</Button>
        <Button sx={buttonStyle} onClick={() => onChange('1h')} variant={timeFrame === '1h' ? 'contained' : 'outlined'}>1H</Button>
        <Button sx={buttonStyle} onClick={() => onChange('4h')} variant={timeFrame === '4h' ? 'contained' : 'outlined'}>4H</Button>
        <Button sx={buttonStyle} onClick={() => onChange('1d')} variant={timeFrame === '1d' ? 'contained' : 'outlined'}>1D</Button>
        <Button sx={buttonStyle} onClick={() => onChange('1w')} variant={timeFrame === '1w' ? 'contained' : 'outlined'}>1W</Button>
        <Button sx={buttonStyle} onClick={() => onChange('1M')} variant={timeFrame === '1M' ? 'contained' : 'outlined'}>1MO</Button>
      </ButtonGroup>
    </Box>
  );
};
