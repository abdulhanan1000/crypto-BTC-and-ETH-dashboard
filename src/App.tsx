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
  IconButton,
} from "@mui/material";
import GitHubIcon from "@mui/icons-material/GitHub";
import { Brightness4, Brightness7 } from "@mui/icons-material";
import { CryptoChart } from "./components/CryptoChart";
import { CryptoService } from "./services/cryptoService";
import { TimeFrame } from "./components/TimeFrameSelector";
import { CandleData } from "./types/crypto";
import "./App.css";

function App() {
  const [btcData, setBtcData] = useState<CandleData[]>([]);
  const [ethData, setEthData] = useState<CandleData[]>([]);
  const [btcPrice, setBtcPrice] = useState(0);
  const [ethPrice, setEthPrice] = useState(0);
  const [btcTimeFrame, setBtcTimeFrame] = useState<TimeFrame>("1d");
  const [ethTimeFrame, setEthTimeFrame] = useState<TimeFrame>("1d");
  const [mode, setMode] = useState<"light" | "dark">("dark");

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          background: {
            default: mode === "dark" ? "#000000" : "#f5f5f5",
            paper: mode === "dark" ? "#121212" : "#ffffff",
          },
          primary: {
            main: mode === "dark" ? "#90caf9" : "#1976d2",
          },
          text: {
            primary: mode === "dark" ? "#ffffff" : "#000000",
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

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
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          bgcolor: "background.default",
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            boxShadow: 1,
            bgcolor: mode === "light" ? "#ffffff" : "#121212",
            color: mode === "light" ? "#000000" : "#ffffff",
          }}
        >
          <Toolbar
            sx={{
              width: "100%",
              px: { xs: 1, sm: 2 },
              minHeight: { xs: 48, sm: 64 },
              gap: 1,
            }}
          >
            <Typography
              variant="h6"
              noWrap
              sx={{
                flexGrow: 1,
                fontSize: { xs: "1rem", sm: "1.25rem" },
                color: "inherit",
              }}
            >
              Crypto Analytics
            </Typography>
            <IconButton
              onClick={toggleTheme}
              sx={{ color: "inherit" }}
              size="small"
            >
              {mode === "dark" ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
            <Link
              href="https://github.com/abdulhanan1000"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                minWidth: "auto",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              <GitHubIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />
              <Typography
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontSize: "0.875rem",
                  color: "inherit",
                }}
              >
                abdulhanan1000
              </Typography>
            </Link>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: "100%",
            height: { xs: "calc(100vh - 48px)", sm: "calc(100vh - 64px)" },
            overflow: "auto",
            WebkitOverflowScrolling: "touch", // For smooth scrolling on iOS
          }}
        >
          <Container
            maxWidth={false}
            sx={{
              px: { xs: 1, sm: 2 },
              py: { xs: 1, sm: 2 },
              pb: { xs: 16, sm: 4 }, 
            }}
          >
            <Grid
              container
              spacing={{ xs: 1, sm: 2 }}
              sx={{
                width: "100%",
                mx: 0,
              }}
            >
              <Grid item xs={12} md={6}>
                <CryptoChart
                  symbol="BTC/USDT"
                  data={btcData}
                  currentPrice={btcPrice}
                  timeFrame={btcTimeFrame}
                  onTimeFrameChange={handleBtcTimeFrameChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
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
      </Box>
    </ThemeProvider>
  );
}

export default App;
