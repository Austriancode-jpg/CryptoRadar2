import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [prices, setPrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);
  const [sevenDayData, setSevenDayData] = useState({});
  const [fibonacciData, setFibonacciData] = useState({});

  const coins = [
    { id: "bitcoin", symbol: "BTC" },
    { id: "ethereum", symbol: "ETH" },
    { id: "solana", symbol: "SOL" },
    { id: "polkadot", symbol: "DOT" },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        // Kombinierte Abfrage der Coin-Daten (Preis, 7d High/Low)
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

        coinRes.data.forEach((coin) => {
          const { id, current_price, high_24h, low_24h, high_7d, low_7d, high, low, price_change_percentage_7d_in_currency } = coin;

          const rangeHigh = coin.high_24h;
          const rangeLow = coin.low_24h;
          const support = (rangeLow * 0.99).toFixed(2);
          const resistance = (rangeHigh * 1.01).toFixed(2);

          newPrices[coin.id] = current_price;

          newSevenDay[coin.id] = {
            rangeLow: rangeLow.toFixed(2),
            rangeHigh: rangeHigh.toFixed(2),
            support,
            resistance,
            comment: `${coin.symbol.toUpperCase()} zeigt in dieser Woche eine mögliche Unterstützung bei $${support}. Sollte der Kurs über $${(rangeHigh * 0.985).toFixed(2)} steigen, könnte ein bullischer Ausbruch folgen.`,
          };

          const fib0 = rangeLow;
          const fib1 = rangeHigh;
          const diff = fib1 - fib0;
          newFibonacci[coin.id] = {
            "0.0%": fib1.toFixed(2),
            "23.6%": (fib1 - diff * 0.236).toFixed(2),
            "38.2%": (fib1 - diff * 0.382).toFixed(2),
            "50.0%": (fib1 - diff * 0.5).toFixed(2),
            "61.8%": (fib1 - diff * 0.618).toFixed(2),
            "100.0%": fib0.toFixed(2),
          };
        });

        setPrices(newPrices);
        setSevenDayData(newSevenDay);
        setFibonacciData(newFibonacci);

        // Fear & Greed Index
        const fngRes = await axios.get("https://api.alternative.me/fng/?limit=1");
        setFearGreed(fngRes.data.data[0]);
      } catch (error) {
        console.error("Fehler beim Laden der Daten:", error);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="p-6 space-y-10 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Tagesüberblick */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">📅 Tagesüberblick</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li>
            <strong>Kurse:</strong><br />
            BTC: ${prices.bitcoin ?? "–"}, ETH: ${prices.ethereum ?? "–"}, SOL: ${prices.solana ?? "–"}, DOT: ${prices.polkadot ?? "–"}
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

      {/* 7-Tage Analyse */}
      <section className="bg-gray-850 rounded-2xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-yellow-400">📈 7-Tage-Technische Analyse</h2>
        {coins.map((coin) => {
          const data = sevenDayData[coin.id];
          return data ? (
            <div key={coin.id} className="mb-6">
              <h3 className="text-xl font-semibold text-white">{coin.symbol}</h3>
              <p className="text-gray-200">
                7d Range: ${data.rangeLow} – ${data.rangeHigh}<br />
                Unterstützung: ${data.support}<br />
                Widerstand: ${data.resistance}<br />
                <em className="text-green-400">{data.comment}</em>
              </p>
            </div>
          ) : (
            <p key={coin.id}>Lade Daten für {coin.symbol}...</p>
          );
        })}
      </section>

      {/* Fibonacci-Zonen */}
      <section className="bg-gray-850 rounded-2xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-purple-400">🔢 Fibonacci-Level</h2>
        {coins.map((coin) => {
          const fib = fibonacciData[coin.id];
          return fib ? (
            <div key={coin.id} className="mb-6">
              <h3 className="text-xl font-semibold text-white">{coin.symbol}</h3>
              <ul className="pl-4 list-disc text-gray-300">
                {Object.entries(fib).map(([level, value]) => (
                  <li key={level}>
                    {level}: ${value}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p key={coin.id}>Lade Fibonacci für {coin.symbol}...</p>
          );
        })}
      </section>
    </div>
  );
}
