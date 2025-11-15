/**
 * AboutInsights.jsx
 *
 * Expandable educational panel explaining key financial concepts
 * and metrics used throughout the application.
 *
 * Provides plain-language definitions for:
 * - Expected Return
 * - Volatility
 * - Sharpe Ratio
 * - Monte Carlo Percentiles
 * - Diversification
 *
 * Designed to help newer investors understand the analysis results.
 *
 * @returns {JSX.Element} Collapsible educational accordion
 */

import React, { useState } from "react";

function AboutInsights() {
  const [open, setOpen] = useState(false);

  const items = [
    {
      title: "Expected Return",
      body: "This is the average annual gain the simulation thinks your portfolio could earn if markets behave like they have historically. It is not a promise, but it gives you a sense of what “normal” might look like.",
    },
    {
      title: "Volatility",
      body: "Volatility tells you how bumpy the ride is likely to be. A higher number means bigger swings—both up and down—so you should be emotionally and financially prepared for those moves.",
    },
    {
      title: "Sharpe Ratio",
      body: "Sharpe measures how much return you earn for each unit of risk. Above 1.0 is generally considered very efficient; below 0.5 means you may be taking extra risk without enough reward.",
    },
    {
      title: "Monte Carlo Percentiles",
      body: "We simulate thousands of future paths. P10 is the pessimistic case (only 10% of paths were worse), P50 is the middle, and P90 is optimistic. Seeing the spread reminds you that investing always lives inside a range, not a single line.",
    },
    {
      title: "Diversification",
      body: "The app flags concentration because too much money in one asset makes your entire plan depend on a single story. Broad exposure across sectors and asset classes keeps you resilient when headlines turn ugly.",
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-lg shadow-lg transition-colors">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-slate-100">About These Insights</p>
          <p className="text-sm text-gray-600 dark:text-slate-300">Plain-language context for every metric and chart</p>
        </div>
        <span className="text-blue-600 dark:text-blue-300 text-xl">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-6 pb-6 space-y-4 text-sm text-gray-700 dark:text-slate-200">
          <p>
            SmartRisk Lite is more than a calculator—it is a coach. Every section below explains why we measure it and how you can use the information to make calmer decisions.
          </p>
          {items.map((item) => (
            <div key={item.title}>
              <p className="font-semibold text-gray-900 dark:text-slate-100">{item.title}</p>
              <p>{item.body}</p>
            </div>
          ))}
          <p className="italic text-xs text-gray-500 dark:text-slate-400">
            Nothing here is investment advice. We simply give you the vocabulary and context so you can ask sharper questions and stay focused on your plan.
          </p>
        </div>
      )}
    </section>
  );
}

export default AboutInsights;