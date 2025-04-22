import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [prices, setPrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);
  const [pivotPoints, setPivotPoints] = useState({});
  const [fibonacciLevels, setFibonacciLevels] = useState({});
  const [technicalAnalysis, setTechnicalAnalysis] = useState({});

  useEffect(() => {
    // Preise laden
    axios
      .get("https://api.coingecko.com/api/v3/simple/price", {
        params: {
          ids: "bitcoin,ethereum,solana,polkadot",
          vs_currencies: "usd",
        },
      })
      .then((res) => setPrices(res.data))
      .catch((err) => console.error("Fehler bei CoinGecko API", err));

    // Fear & Greed Index
    axios
      .get("https://api.alternative.me/fng/?limit=1")
      .then((res) => setFearGreed(res.data.data[0]))
      .catch((err) => console.error("Fehler bei F&G API", err));

    // 7-Tage-Analyse (Range, Unterstützung, Widerstand)
    const getTechnicalAnalysis = async (coin) => {
      try {
        const response = await axios.get(
          `https://api.coingecko.com/api/v3/coins/${coin}/market_chart`,
          {
            params: {
              vs_currency: "usd",
              days: "7", // 7 Tage
            },
          }
        );
        const prices = response.data.prices;
        const highs = prices.map((price) => price[1]);
        const lows = prices.map((price) => price[1]);

        const high7d = Math.max(...highs);
        const low7d = Math.min(...lows);
        const support = low7d * 1.01; // Unterstützung: 1% über 7d Tief
        const resistance = high7d * 0.99; // Widerstand: 1% unter 7d Hoch

        setTechnicalAnalysis((prev) => ({
          ...prev,
          [coin]: {
            range: { min: low7d, max: high7d },
            support,
            resistance,
          },
        }));
      } catch (err) {
        console.error(`Fehler bei 7-Tage-Analyse für ${coin}`, err);
      }
    };

    ["bitcoin", "ethereum", "solana", "polkadot"].forEach(getTechnicalAnalysis);

    // Pivot Points & Fibonacci Levels - Beispiel für BTC
    const getPivotPointsAndFibonacci = (coin) => {
      axios
        .get(`https://api.coingecko.com/api/v3/coins/${coin}/market_chart`, {
          params: {
            vs_currency: "usd",
            days: "1", // 1 Tag
          },
        })
        .then((response) => {
          const prices = response.data.prices;
          const high = Math.max(...prices.map((price) => price[1]));
          const low = Math.min(...prices.map((price) => price[1]));
          const close = prices[prices.length - 1][1];

          const pivot = (high + low + close) / 3;
          const r1 = 2 * pivot - low;
          const r2 = pivot + (high - low);
          const r3 = r2 + (high - low);

          const fibLevels = {
            0.236: pivot + (high - low) * 0.236,
            0.382: pivot + (high - low) * 0.382,
            0.5: pivot + (high - low) * 0.5,
            0.618: pivot + (high - low) * 0.618,
          };

          setPivotPoints((prev) => ({
            ...prev,
            [coin]: { pivot, r1, r2, r3 },
          }));
          setFibonacciLevels((prev) => ({
            ...prev,
            [coin]: fibLevels,
          }));
        })
        .catch((err) => console.error("Fehler bei Pivot/Fibonacci API", err));
    };

    ["bitcoin", "ethereum", "solana", "polkadot"].forEach(getPivotPointsAndFibonacci);
  }, []);

  // Zahlen runden
  const roundTo = (num, decimals) => {
    return num ? num.toFixed(decimals) : "–";
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Tagesüberblick */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">📅 Tagesüberblick</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li>
            <strong>Kurse:</strong><br />
            BTC: ${roundTo(prices.bitcoin?.usd, 2)}, ETH: ${roundTo(prices.ethereum?.usd, 2)}, 
            SOL: ${roundTo(prices.solana?.usd, 2)}, DOT: ${roundTo(prices.polkadot?.usd, 2)}
          </li>
          <li>
            <strong>Fear & Greed Index:</strong>{" "}
            {fearGreed ? `${fearGreed.value} – ${fearGreed.value_classification}` : "Lade..."}
          </li>
          <li>
            <strong>Funding & Heatmap:</strong>{" "}
            <a href="https://www.coinglass.com/" target="_blank" className="text-blue-400 underline">
              Live-Daten auf CoinGlass anzeigen
            </a>
          </li>
        </ul>
      </section>

      {/* 7-Tage-Technische Analyse */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-green-400">📊 7-Tage-Technische Analyse</h2>
        {["bitcoin", "ethereum", "solana", "polkadot"].map((coin) => (
          <div key={coin} className="space-y-2">
            <h3 className="text-xl text-blue-400">{coin.toUpperCase()}</h3>
            {technicalAnalysis[coin] ? (
              <>
                <p>
                  <strong>7d Range:</strong> ${roundTo(technicalAnalysis[coin].range.min, 2)} – ${roundTo(technicalAnalysis[coin].range.max, 2)}
                </p>
                <p>
                  <strong>Unterstützung:</strong> ${roundTo(technicalAnalysis[coin].support, 2)}
                </p>
                <p>
                  <strong>Widerstand:</strong> ${roundTo(technicalAnalysis[coin].resistance, 2)}
                </p>
                <p>
                  <strong>Textbeschreibung:</strong>{" "}
                  {coin === "bitcoin"
                    ? "BTC zeigt in dieser Woche eine mögliche Unterstützung bei $62.000. Sollte der Kurs über $65.000 steigen, könnte ein bullischer Ausbruch folgen."
                    : coin === "ethereum"
                    ? "ETH zeigt mögliche Unterstützung bei $2.000. Ein Ausbruch über $2.300 könnte den Preis nach oben treiben."
                    : coin === "solana"
                    ? "SOL könnte Unterstützung bei $50 haben. Bei einem Breakout über $55 wäre ein bullischer Trend möglich."
                    : "DOT zeigt Unterstützung bei $35. Ein Ausbruch nach oben könnte einen Preis von $40 erzielen."}
                </p>
              </>
            ) : (
              <p>Lade Daten...</p>
            )}
          </div>
        ))}
      </section>

      {/* Pivot Points und Fibonacci Levels */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-green-400">📊 Pivot Points & Fibonacci</h2>
        {["bitcoin", "ethereum", "solana", "polkadot"].map((coin) => (
          <div key={coin} className="space-y-2">
            <h3 className="text-xl text-blue-400">{coin.toUpperCase()}</h3>
            {pivotPoints[coin] && fibonacciLevels[coin] ? (
              <>
                <p>
                  <strong>Pivot Points:</strong> R1: ${roundTo(pivotPoints[coin].r1, 2)}, R2: ${roundTo(pivotPoints[coin].r2, 2)}, R3: ${roundTo(pivotPoints[coin].r3, 2)}
                </p>
                <p>
                  <strong>Fibonacci Levels:</strong> 0.236: ${roundTo(fibonacciLevels[coin][0.236], 2)}, 0.382: ${roundTo(fibonacciLevels[coin][0.382], 2)}, 0.5: ${roundTo(fibonacciLevels[coin][0.5], 2)}, 0.618: ${roundTo(fibonacciLevels[coin][0.618], 2)}
                </p>
              </>
            ) : (
              <p>Lade Daten...</p>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
