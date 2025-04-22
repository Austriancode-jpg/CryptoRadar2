import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [prices, setPrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);
  const [pivotData, setPivotData] = useState({});

  // Funktion zur Berechnung der Pivot Points und Fibonacci-Levels
  const calculatePivotPoints = (high, low, close) => {
    const pivot = (high + low + close) / 3;
    const resistance1 = 2 * pivot - low;
    const support1 = 2 * pivot - high;
    const resistance2 = pivot + (resistance1 - support1);
    const support2 = pivot - (resistance1 - support1);

    const fibo23_6 = pivot + (high - low) * 0.236;
    const fibo38_2 = pivot + (high - low) * 0.382;
    const fibo50 = pivot + (high - low) * 0.5;
    const fibo61_8 = pivot + (high - low) * 0.618;

    return {
      pivot,
      resistance1,
      support1,
      resistance2,
      support2,
      fibo23_6,
      fibo38_2,
      fibo50,
      fibo61_8,
    };
  };

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

    // Daten für Pivot Points und Fibonacci-Levels (hier als Beispiel von den letzten 24h, du kannst dies anpassen)
    axios
      .get("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart", {
        params: {
          vs_currency: "usd",
          days: "1", // Holen der Daten für die letzten 24h
        },
      })
      .then((res) => {
        const { high, low, close } = res.data.prices[res.data.prices.length - 1]; // Holen des letzten Wertes
        const pivotPoints = calculatePivotPoints(high, low, close);
        setPivotData(pivotPoints);
      })
      .catch((err) => console.error("Fehler bei CoinGecko Market Chart API", err));
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
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
          <li>
            <strong>Funding & Heatmap:</strong>{" "}
            <a href="https://www.coinglass.com/" target="_blank" className="text-blue-400 underline">
              Live-Daten auf CoinGlass anzeigen
            </a>
          </li>
        </ul>
      </section>

      {/* Pivot Points und Fibonacci-Levels */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-green-400">📊 Pivot Points und Fibonacci-Levels</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li><strong>Pivot Point:</strong> {pivotData.pivot ?? "Lade..."}</li>
          <li><strong>Widerstand 1:</strong> {pivotData.resistance1 ?? "Lade..."}</li>
          <li><strong>Unterstützung 1:</strong> {pivotData.support1 ?? "Lade..."}</li>
          <li><strong>Widerstand 2:</strong> {pivotData.resistance2 ?? "Lade..."}</li>
          <li><strong>Unterstützung 2:</strong> {pivotData.support2 ?? "Lade..."}</li>
          <li><strong>Fibonacci 23,6%:</strong> {pivotData.fibo23_6 ?? "Lade..."}</li>
          <li><strong>Fibonacci 38,2%:</strong> {pivotData.fibo38_2 ?? "Lade..."}</li>
          <li><strong>Fibonacci 50%:</strong> {pivotData.fibo50 ?? "Lade..."}</li>
          <li><strong>Fibonacci 61,8%:</strong> {pivotData.fibo61_8 ?? "Lade..."}</li>
        </ul>
      </section>
    </div>
  );
}
