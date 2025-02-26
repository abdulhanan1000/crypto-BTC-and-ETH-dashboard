import { FormGroup, FormControlLabel, Switch, Box } from '@mui/material';

export interface IndicatorSettings {
  showMA20: boolean;
  showMA50: boolean;
  showMA100: boolean;
  showMA200: boolean;
  showBullBand: boolean;
}

interface IndicatorControlsProps {
  settings: IndicatorSettings;
  onChange: (newSettings: IndicatorSettings) => void;
  timeFrame: string;
}

export const IndicatorControls = ({ settings, onChange, timeFrame }: IndicatorControlsProps) => {
  const handleChange = (key: keyof IndicatorSettings) => {
    onChange({ ...settings, [key]: !settings[key] });
  };

  return (
    <Box sx={{ mb: 1 }}>
      <FormGroup row sx={{ justifyContent: 'center', gap: 1 }}>
        {(timeFrame !== '1w' && timeFrame !== '1d') && (
          <FormControlLabel
            sx={{ mr: 0 }}
            control={<Switch size="small" checked={settings.showMA20} onChange={() => handleChange('showMA20')} />}
            label="MA20"
          />
        )}
        <FormControlLabel
          sx={{ mr: 0 }}
          control={<Switch size="small" checked={settings.showMA50} onChange={() => handleChange('showMA50')} />}
          label="MA50"
        />
        <FormControlLabel
          sx={{ mr: 0 }}
          control={<Switch size="small" checked={settings.showMA100} onChange={() => handleChange('showMA100')} />}
          label="MA100"
        />
        <FormControlLabel
          sx={{ mr: 0 }}
          control={<Switch size="small" checked={settings.showMA200} onChange={() => handleChange('showMA200')} />}
          label="MA200"
        />
        {(timeFrame === '1w' || timeFrame === '1d') && (
          <FormControlLabel
            sx={{ mr: 0 }}
            control={<Switch size="small" checked={settings.showBullBand} onChange={() => handleChange('showBullBand')} />}
            label="Bull Market Band"
          />
        )}
      </FormGroup>
    </Box>
  );
};
