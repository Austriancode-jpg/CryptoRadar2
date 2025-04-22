import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [prices, setPrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);
  const [sevenDayData, setSevenDayData] = useState({});
  const [fibonacciData, setFibonacciData] = useState({});
  const [pivotPoints, setPivotPoints] = useState({}); // ✅ Korrekt platziert

  const coins = [
    { id: "bitcoin", symbol: "BTC" },
    { id: "ethereum", symbol: "ETH" },
    { id: "solana", symbol: "SOL" },
    { id: "polkadot", symbol: "DOT" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const coinRes = await axios.get(
          "https://api.coingecko.com/api/v3/coins/markets",
          {
            params: {
              vs_currency: "usd",
              ids: coins.map((c) => c.id).join(","),
            },
          }
        );

        const newPrices = {};
        const newSevenDay = {};
        const newFibonacci = {};
        const newPivotPoints = {};

        coinRes.data.forEach((coin) => {
          const { id, current_price, high_24h, low_24h } = coin;

          const support = (low_24h * 0.99).toFixed(2);
          const resistance = (high_24h * 1.01).toFixed(2);
          const rangeHigh = high_24h.toFixed(2);
          const rangeLow = low_24h.toFixed(2);

          newPrices[id] = current_price;

          newSevenDay[id] = {
            rangeLow,
            rangeHigh,
            support,
            resistance,
            comment: ${coin.symbol.toUpperCase()} zeigt in dieser Woche eine mögliche Unterstützung bei $${support}. Sollte der Kurs über $${(high_24h * 0.985).toFixed(2)} steigen, könnte ein bullischer Ausbruch folgen.,
          };

          const diff = high_24h - low_24h;
          newFibonacci[id] = {
            "0.0%": high_24h.toFixed(2),
            "23.6%": (high_24h - diff * 0.236).toFixed(2),
            "38.2%": (high_24h - diff * 0.382).toFixed(2),
            "50.0%": (high_24h - diff * 0.5).toFixed(2),
            "61.8%": (high_24h - diff * 0.618).toFixed(2),
            "100.0%": low_24h.toFixed(2),
          };

          const P = ((high_24h + low_24h + current_price) / 3).toFixed(2);
          const R1 = (2 * P - low_24h).toFixed(2);
          const S1 = (2 * P - high_24h).toFixed(2);
          const R2 = (parseFloat(P) + (high_24h - low_24h)).toFixed(2);
          const S2 = (parseFloat(P) - (high_24h - low_24h)).toFixed(2);

          newPivotPoints[id] = { P, R1, S1, R2, S2 };
        });

        setPrices(newPrices);
        setSevenDayData(newSevenDay);
        setFibonacciData(newFibonacci);
        setPivotPoints(newPivotPoints);

        const fngRes = await axios.get("https://api.alternative.me/fng/?limit=1");
        setFearGreed(fngRes.data.data[0]);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* 📅 Tagesüberblick */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">📅 Tagesüberblick</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li>
            <strong>Kurse:</strong><br />
            BTC: ${prices.bitcoin ?? "–"}, ETH: ${prices.ethereum ?? "–"},
            SOL: ${prices.solana ?? "–"}, DOT: ${prices.polkadot ?? "–"}
          </li>
          <li>
            <strong>Fear & Greed Index:</strong>{" "}
            {fearGreed ? ${fearGreed.value} – ${fearGreed.value_classification} : "Lade..."}
          </li>
          <li>
            <strong>Funding & Heatmap:</strong>{" "}
            <a href="https://www.coinglass.com/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">
              Live-Daten auf CoinGlass anzeigen
            </a>
          </li>
        </ul>
      </section>

      {/* 📊 7-Tage Analyse */}
      <section className="bg-gray-850 rounded-2xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-green-400">📈 7-Tage Technische Analyse</h2>
        {coins.map((coin) => {
          const data = sevenDayData[coin.id];
          return data ? (
            <div key={coin.id} className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-2">{coin.symbol}</h3>
              <ul className="pl-4 list-disc text-gray-300">
                <li>7d Range: ${data.rangeLow} – ${data.rangeHigh}</li>
                <li>Unterstützung: ${data.support}</li>
                <li>Widerstand: ${data.resistance}</li>
                <li className="text-sm italic text-green-400 mt-1">{data.comment}</li>
              </ul>
            </div>
          ) : (
            <p key={coin.id}>Lade Daten für {coin.symbol}...</p>
          );
        })}
      </section>

      {/* 🔢 Fibonacci + Pivot-Section */}
      <section className="bg-gray-850 rounded-2xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">🔢 Fibonacci-Level & Pivot Points</h2>
        {coins.map((coin) => {
          const fib = fibonacciData[coin.id];
          const pivot = pivotPoints[coin.id];
          return fib ? (
            <div key={coin.id} className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-2">{coin.symbol}</h3>
              <ul className="pl-4 list-disc text-gray-300 mb-2">
                {Object.entries(fib).map(([level, value]) => (
                  <li key={level}>
                    Fibonacci {level}: ${value}
                  </li>
                ))}
              </ul>
              {pivot && (
                <ul className="pl-4 list-disc text-blue-300">
                  <li>Pivot (P): ${pivot.P}</li>
                  <li>R1: ${pivot.R1}</li>
                  <li>S1: ${pivot.S1}</li>
                  <li>R2: ${pivot.R2}</li>
                  <li>S2: ${pivot.S2}</li>
                </ul>
              )}
            </div>
          ) : (
            <p key={coin.id}>Lade technische Levels für {coin.symbol}...</p>
          );
        })}
      </section>
    </div>
  );
}
