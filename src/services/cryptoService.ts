import { TimeFrame } from '../components/TimeFrameSelector';
import { CandleData } from '../types/crypto';
import { Time } from 'lightweight-charts';

const WS_URL = 'wss://stream.binance.com:9443/ws';

export class CryptoService {
  private ws: WebSocket | null = null;

  connect(symbols: string[], onPrice: (symbol: string, price: number) => void) {
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      const subscribeMsg = {
        method: 'SUBSCRIBE',
        params: symbols.map(s => `${s.toLowerCase()}@trade`),
        id: 1
      };
      this.ws?.send(JSON.stringify(subscribeMsg));
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === 'trade') {
        const symbol = data.s;
        const price = parseFloat(data.p);
        onPrice(symbol, price);
      }
    };
  }

  async fetchHistoricalData(symbol: string, interval: TimeFrame): Promise<CandleData[]> {
    try {
      const startTime = new Date('2017-01-01').getTime();
      const endTime = Date.now();
      const limit = 1000;
      let allData: CandleData[] = [];
      let currentStartTime = startTime;

      while (currentStartTime < endTime) {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${
            interval === '1M' ? '1M' : interval
          }&limit=${limit}&startTime=${currentStartTime}`
        );
        
        if (!response.ok) throw new Error('Network response was not ok');

        const data = await response.json();
        if (data.length === 0) break;

        const formattedData = data.map((d: any[]): CandleData => ({
          time: (d[0] / 1000) as Time,
          open: parseFloat(d[1]),
          high: parseFloat(d[2]),
          low: parseFloat(d[3]),
          close: parseFloat(d[4])
        }));

        allData = [...allData, ...formattedData];
        currentStartTime = data[data.length - 1][0] + 1;

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return allData;

    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
