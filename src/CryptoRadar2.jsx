import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [prices, setPrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);
  const [coinData, setCoinData] = useState({});
  const coins = ["bitcoin", "ethereum", "solana", "polkadot"];

  useEffect(() => {
    // Live-Kurse laden (einfach)
    axios
      .get("https://api.coingecko.com/api/v3/simple/price", {
        params: {
          ids: coins.join(","),
          vs_currencies: "usd",
        },
      })
      .then((res) => setPrices(res.data))
      .catch((err) => console.error("Fehler bei CoinGecko API (Simple Price)", err));

    // Fear & Greed Index
    axios
      .get("https://api.alternative.me/fng/?limit=1")
      .then((res) => setFearGreed(res.data.data[0]))
      .catch((err) => console.error("Fehler bei F&G API", err));

    // Erweiterte Kursdaten (für 7d Analyse)
    async function fetchExtendedData() {
      try {
        const res = await axios.get("https://api.coingecko.com/api/v3/coins/markets", {
          params: {
            vs_currency: "usd",
            ids: coins.join(","),
            price_change_percentage: "24h,7d",
          },
        });

        const structuredData = {};
        res.data.forEach((coin) => {
          const low = coin.low_24h;
          const high = coin.high_24h;
          const support = (low * 0.99).toFixed(2);
          const resistance = (high * 1.01).toFixed(2);
          structuredData[coin.id] = {
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            range7d: `$${low.toLocaleString()} – $${high.toLocaleString()}`,
            support,
            resistance,
            comment: `${coin.symbol.toUpperCase()} zeigt in dieser Woche eine mögliche Unterstützung bei $${support}. Sollte der Kurs über $${resistance} steigen, könnte ein bullischer Ausbruch folgen.`,
          };
        });

        setCoinData(structuredData);
      } catch (err) {
        console.error("Fehler bei CoinGecko API (Marktdaten)", err);
      }
    }

    fetchExtendedData();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      
      {/* 📅 Tagesüberblick */}
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

      {/* 📊 Technische Analyse */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-yellow-400">📊 Technische Analyse (7 Tage)</h2>
        {coins.map((id) => {
          const coin = coinData[id];
          return coin ? (
            <div key={id} className="mb-6">
              <h3 className="text-2xl text-yellow-300 font-semibold">{coin.symbol}</h3>
              <ul className="list-disc pl-6 text-gray-200">
                <li><strong>7d Range:</strong> {coin.range7d}</li>
                <li><strong>Unterstützung:</strong> ${coin.support}</li>
                <li><strong>Widerstand:</strong> ${coin.resistance}</li>
                <li className="text-green-400 mt-1">{coin.comment}</li>
              </ul>
            </div>
          ) : (
            <p key={id} className="text-gray-400">Lade Daten für {id}...</p>
          );
        })}
      </section>
    </div>
  );
}
