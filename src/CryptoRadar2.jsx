import React from "react";

export default function CryptoRadar2() {
  return (
    <div className="p-6 space-y-8 bg-gradient-to-b from-gray-900 to-gray-800 text-white min-h-screen">
      {/* Tägliche Übersicht */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-blue-400">📅 Tagesüberblick</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li><strong>Traditionelle Märkte:</strong> Verhalten des S&P 500</li>
          <li><strong>Krypto-Marktindikatoren:</strong> Fear & Greed Index, Funding Rates, BTC Liquidation Heat Map</li>
          <li><strong>Analyse BTC/ETH/SOL/DOT:</strong> Tagesausblick inkl. Preiszonen</li>
          <li><strong>Wirtschaftskalender:</strong> Relevante Termine</li>
          <li><strong>Wichtige News:</strong> Preisbewegungsrelevante Headlines</li>
        </ul>
      </section>

      {/* Wöchentliche Übersicht */}
      <section className="bg-gray-850 shadow-xl rounded-2xl p-6 border border-gray-700">
        <h2 className="text-3xl font-bold mb-4 text-green-400">📊 Wochenüberblick</h2>
        <ul className="list-disc pl-6 space-y-2 text-gray-200">
          <li><strong>Finanzmärkte:</strong> Stimmung & S&P 500 Analyse</li>
          <li><strong>Kryptomarkt:</strong> Fundamentaldaten & On-Chain-Daten</li>
          <li><strong>Coin-Analysen:</strong> BTC, ETH, SOL, DOT</li>
          <li><strong>Risiko-Barometer:</strong> Einschätzung der Woche</li>
          <li><strong>Wirtschaftskalender:</strong> Wichtige Finanzereignisse</li>
        </ul>
      </section>
    </div>
  );
}