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

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Tagesüberblick */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">📅 Tagesüberblick</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li>
            <strong>Kurse:</strong><br />
            BTC: ${prices.bitcoin?.usd ?? "–"}, ETH: ${prices.ethereum?.usd ?? "–"},
            SOL: ${prices.solana?.usd ?? "–"}, DOT: ${prices.polkadot?.usd ?? "–"}
          </li>
          <li>
            <strong>Fear & Greed Index:</strong>{" "}
            {fearGreed ? `${fearGreed.value} – ${fearGreed.value_classification}` : "Lade..."}
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
                  <strong>7d Range:</strong> ${technicalAnalysis[coin].range.min} – ${technicalAnalysis[coin].range.max}
                </p>
                <p>
                  <strong>Unterstützung:</strong> ${technicalAnalysis[coin].support}
                </p>
                <p>
                  <strong>Widerstand:</strong> ${technicalAnalysis[coin].resistance}
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
                  <strong>Pivot Points:</strong> R1: ${pivotPoints[coin].r1}, R2: ${pivotPoints[coin].r2}, R3: ${pivotPoints[coin].r3}
                </p>
                <p>
                  <strong>Fibonacci Levels:</strong> 0.236: ${fibonacciLevels[coin][0.236]}, 0.382: ${fibonacciLevels[coin][0.382]}, 0.5: ${fibonacciLevels[coin][0.5]}, 0.618: ${fibonacciLevels[coin][0.618]}
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
