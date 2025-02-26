import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Grid,
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Typography,
  Link,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { CryptoChart } from "./components/CryptoChart";
import { CryptoService } from "./services/cryptoService";
import { TimeFrame } from "./components/TimeFrameSelector";
import { CandleData } from "./types/crypto";
import "./App.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000",
      paper: "#121212",
    },
    primary: {
      main: "#90caf9",
    },
  },
});

function App() {
  const [btcData, setBtcData] = useState<CandleData[]>([]);
  const [ethData, setEthData] = useState<CandleData[]>([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [btcTimeFrame, setBtcTimeFrame] = useState<TimeFrame>("1d");
  const [ethTimeFrame, setEthTimeFrame] = useState<TimeFrame>("1d");

  const cryptoService = useMemo(() => new CryptoService(), []);

  const loadHistoricalData = useCallback(
    async (symbol: string, timeFrame: TimeFrame) => {
      const data = await cryptoService.fetchHistoricalData(symbol, timeFrame);
      if (symbol === "BTCUSDT") setBtcData(data);
      if (symbol === "ETHUSDT") setEthData(data);
    },
    [cryptoService]
  );

  useEffect(() => {
    cryptoService.connect(["BTCUSDT", "ETHUSDT"], (symbol, price) => {
      if (symbol === "BTCUSDT") setBtcPrice(price);
      if (symbol === "ETHUSDT") setEthPrice(price);
    });

    loadHistoricalData("BTCUSDT", btcTimeFrame);
    loadHistoricalData("ETHUSDT", ethTimeFrame);

    return () => cryptoService.disconnect();
  }, [btcTimeFrame, ethTimeFrame, cryptoService, loadHistoricalData]);

  const handleBtcTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setBtcTimeFrame(newTimeFrame);
    loadHistoricalData("BTCUSDT", newTimeFrame);
  };

  const handleEthTimeFrameChange = (newTimeFrame: TimeFrame) => {
    setEthTimeFrame(newTimeFrame);
    loadHistoricalData("ETHUSDT", newTimeFrame);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        component="div"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100vw',
          maxWidth: '100vw',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <AppBar 
          position="static" 
          elevation={4}
          sx={{ 
            width: '100%',
            position: 'relative'
          }}
        >
          <Container 
            maxWidth={false} 
            disableGutters 
            sx={{ 
              width: '100%',
              px: { xs: 1, sm: 2 }
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                minHeight: { xs: 56, sm: 64 },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%'
              }}
            >
              <Typography
                variant="h6"
                noWrap
                sx={{
                  flexGrow: 1,
                  mr: 2
                }}
              >
                Crypto Analytics Dashboard
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <Link
                  href="https://github.com/abdulhanan1000"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="inherit"
                  underline="none"
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <GitHubIcon sx={{ fontSize: 20 }} />
                  <Typography
                    sx={{
                      display: { xs: 'none', sm: 'block' },
                      whiteSpace: 'nowrap'
                    }}
                  >
                    abdulhanan1000
                  </Typography>
                </Link>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        <Container 
          maxWidth={false} 
          sx={{
            flexGrow: 1,
            width: '100%',
            px: { xs: 1, sm: 2 },
            py: 2,
            overflow: 'auto'
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <CryptoChart
                symbol="BTC/USDT"
                data={btcData}
                currentPrice={btcPrice}
                timeFrame={btcTimeFrame}
                onTimeFrameChange={handleBtcTimeFrameChange}
              />
            </Grid>
            <Grid item xs={6}>
              <CryptoChart
                symbol="ETH/USDT"
                data={ethData}
                currentPrice={ethPrice}
                timeFrame={ethTimeFrame}
                onTimeFrameChange={handleEthTimeFrameChange}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
