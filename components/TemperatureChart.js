import { TrendingUp } from "lucide-react";

function buildPolyline(days, key, width, height, padding, minTemp, maxTemp) {
  const usableWidth = width - padding * 2;
  const usableHeight = height - padding * 2;
  const range = Math.max(maxTemp - minTemp, 1);

  return days
    .map((day, index) => {
      const x = padding + (usableWidth * index) / Math.max(days.length - 1, 1);
      const y = padding + usableHeight - ((day[key] - minTemp) / range) * usableHeight;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function TemperatureChart({ days }) {
  const width = 720;
  const height = 220;
  const padding = 28;
  const temps = days.flatMap((day) => [day.tempMax, day.tempMin]);
  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);
  const maxLine = buildPolyline(days, "tempMax", width, height, padding, minTemp, maxTemp);
  const minLine = buildPolyline(days, "tempMin", width, height, padding, minTemp, maxTemp);

  return (
    <section className="chart-panel" aria-labelledby="chart-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">温度走势</p>
          <h2 id="chart-title">最高 / 最低温</h2>
        </div>
        <TrendingUp className="h-5 w-5" aria-hidden="true" />
      </div>

      <div className="chart-wrap">
        <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="近10日最高温和最低温趋势图">
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="axis" />
          <line x1={padding} y1={padding} x2={padding} y2={height - padding} className="axis" />
          <polyline points={maxLine} className="line line-max" />
          <polyline points={minLine} className="line line-min" />
          {days.map((day, index) => {
            const x = padding + ((width - padding * 2) * index) / Math.max(days.length - 1, 1);
            return (
              <g key={day.date}>
                <line x1={x} y1={padding} x2={x} y2={height - padding} className="grid-line" />
                <text x={x} y={height - 8} textAnchor="middle" className="chart-date">
                  {day.date.slice(5)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="chart-legend">
        <span><i className="legend-max" />最高温</span>
        <span><i className="legend-min" />最低温</span>
      </div>
    </section>
  );
}
