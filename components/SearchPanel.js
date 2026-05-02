"use client";

import { Loader2, Search } from "lucide-react";

export default function SearchPanel({
  query,
  onQueryChange,
  onSearch,
  rangeMode,
  onRangeModeChange,
  isLoading,
  error,
}) {
  return (
    <section className="search-panel" aria-labelledby="search-title">
      <div>
        <p className="eyebrow">城市生活天气工作台</p>
        <h1 id="search-title">近10日天气</h1>
      </div>

      <form className="search-form" onSubmit={onSearch}>
        <label htmlFor="city-search">城市名称</label>
        <div className="mode-tabs" aria-label="天气范围">
          <button
            type="button"
            className={rangeMode === "future" ? "active" : ""}
            onClick={() => onRangeModeChange("future")}
            disabled={isLoading}
            aria-pressed={rangeMode === "future"}
          >
            未来10天
          </button>
          <button
            type="button"
            className={rangeMode === "past" ? "active" : ""}
            onClick={() => onRangeModeChange("past")}
            disabled={isLoading}
            aria-pressed={rangeMode === "past"}
          >
            过去10天
          </button>
        </div>
        <div className="search-row">
          <input
            id="city-search"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="例如：上海、北京、杭州"
            autoComplete="off"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Search className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{isLoading ? "查询中" : "搜索"}</span>
          </button>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
      </form>
    </section>
  );
}
