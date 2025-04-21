import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [prices, setPrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);

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
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function CryptoRadar2() {
  const [macroEvents, setMacroEvents] = useState([]);

  useEffect(() => {
    async function fetchMacroData() {
      try {
        const response = await axios.get(
          'https://date.nager.at/api/v3/PublicHolidays/2025/US'
        );
        setMacroEvents(response.data.slice(0, 7)); // Zeigt die nächsten 7 Termine
      } catch (err) {
        console.error('Fehler beim Laden des Kalenders:', err);
      }
    }

    fetchMacroData();
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gray-900 text-white min-h-screen">
      {/* ... dein bestehender Tages- und Wochenüberblick bleibt hier ... */}

      {/* 📆 Makro-Wochenkalender */}
      <section className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-blue-400">📆 Makro-Wochenkalender</h2>
        {macroEvents.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            {macroEvents.map((event, index) => (
              <li key={index}>
                <strong>{event.date}:</strong> {event.localName} ({event.name})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-green-400">✅ Kalender-Komponente wird angezeigt!</p>
        )}
      </section>
    </div>
  );
}
