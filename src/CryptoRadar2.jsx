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
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function CryptoRadar2() {
  const [macroEvents, setMacroEvents] = useState([]);

  useEffect(() => {
    const today = new Date();
    const startDate = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Montag
    const endDate = new Date(today.setDate(startDate.getDate() + 6)); // Sonntag

    const formatDate = (date) => date.toISOString().split("T")[0];

    axios
      .get(
        `https://financialmodelingprep.com/api/v3/economic_calendar?from=${formatDate(startDate)}&to=${formatDate(
          endDate
        )}&apikey=FypZuRL0mJYdJHjnTBBickKPaDe96eAi`
      )
      .then((res) => setMacroEvents(res.data))
      .catch((err) => console.error("Makro-Daten Fehler", err));
  }, []);

  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* ... andere Abschnitte ... */}

      {/* 📆 Makro Wochenkalender */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-yellow-300">📆 Makro-Kalender (Woche)</h2>
        {macroEvents.length > 0 ? (
          <ul className="list-disc pl-6 space-y-2 text-gray-200">
            {macroEvents.map((event, index) => (
              <li key={index}>
                <strong>{event.date}</strong> – <span className="text-blue-300">{event.event}</span> ({event.country}) –{" "}
                {event.time} Uhr ({event.actual || "?"} / {event.consensus || "?"})
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">Keine Makro-Termine gefunden.</p>
        )}
      </section>
    </div>
  );
}
