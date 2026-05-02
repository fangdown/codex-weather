"use client";

import { useState } from "react";
import SearchPanel from "../components/SearchPanel";
import StatusMessage from "../components/StatusMessage";
import TemperatureChart from "../components/TemperatureChart";
import WeatherDayCard from "../components/WeatherDayCard";
import WeatherSummary from "../components/WeatherSummary";

async function readJson(response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "请求失败，请稍后再试");
  }
  return data;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [rangeMode, setRangeMode] = useState("future");
  const [selectedCity, setSelectedCity] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  const isBusy = isSearching || isLoadingWeather;

  async function loadWeather(city, mode = rangeMode) {
    setIsLoadingWeather(true);
    setError("");

    try {
      const response = await fetch("/api/weather-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, rangeMode: mode }),
      });
      const data = await readJson(response);
      setResult(data);
      setSelectedCity(city);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoadingWeather(false);
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    const keyword = query.trim();

    if (!keyword) {
      setError("请输入城市名称");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      const response = await fetch(`/api/cities?name=${encodeURIComponent(keyword)}`);
      const data = await readJson(response);

      if (!data.cities?.length) {
        setError("未找到城市，请换个关键词");
        return;
      }

      await loadWeather(data.cities[0]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsSearching(false);
    }
  }

  function handleRangeModeChange(nextMode) {
    setRangeMode(nextMode);

    if (selectedCity && !isBusy) {
      loadWeather(selectedCity, nextMode);
    }
  }

  const rangeLabel = rangeMode === "future" ? "未来10个自然日" : "过去10个完整自然日";

  return (
    <main className="app-shell">
      <div className="page-frame">
        <SearchPanel
          query={query}
          onQueryChange={setQuery}
          onSearch={handleSearch}
          rangeMode={rangeMode}
          onRangeModeChange={handleRangeModeChange}
          isLoading={isBusy}
          error={error}
        />

        {isLoadingWeather ? (
          <StatusMessage
            type="loading"
            title="正在整理天气和建议"
            message={`正在查询${rangeLabel}天气，智能建议失败时会自动使用基础建议。`}
          />
        ) : null}

        {!result && !isLoadingWeather ? (
          <StatusMessage
            title="等待城市查询"
            message={`默认展示${rangeLabel}的天气、穿衣建议和出行建议。`}
          />
        ) : null}

        {result ? (
          <div className="results-stack">
            <WeatherSummary result={result} />

            {result.adviceSource === "fallback" ? (
              <StatusMessage type="error" title="已使用基础建议" message={result.adviceMessage} />
            ) : (
              <StatusMessage title="智能建议已生成" message={result.adviceMessage} />
            )}

            <TemperatureChart days={result.days} />

            <section className="daily-section" aria-labelledby="daily-title">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">每日明细</p>
                  <h2 id="daily-title">天气与生活建议</h2>
                </div>
              </div>
              <div className="daily-grid">
                {result.days.map((day) => (
                  <WeatherDayCard key={day.date} day={day} />
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}
