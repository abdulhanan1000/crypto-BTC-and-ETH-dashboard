import { ToggleButton, ToggleButtonGroup } from '@mui/material';

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

interface TimeFrameSelectorProps {
  timeFrame: TimeFrame;
  onChange: (newTimeFrame: TimeFrame) => void;
}

export const TimeFrameSelector = ({ timeFrame, onChange }: TimeFrameSelectorProps) => {
  return (
    <ToggleButtonGroup
      value={timeFrame}
      exclusive
      onChange={(_, value) => value && onChange(value as TimeFrame)}
      size="small"
      sx={{ mb: 2, backgroundColor: '#1E1E1E' }}
    >
      <ToggleButton value="1m">1M</ToggleButton>
      <ToggleButton value="5m">5M</ToggleButton>
      <ToggleButton value="15m">15M</ToggleButton>
      <ToggleButton value="1h">1H</ToggleButton>
      <ToggleButton value="4h">4H</ToggleButton>
      <ToggleButton value="1d">1D</ToggleButton>
      <ToggleButton value="1w">1W</ToggleButton>
      <ToggleButton value="1M">1MO</ToggleButton>
    </ToggleButtonGroup>
  );
};
