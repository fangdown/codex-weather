import { CalendarDays, Droplets, MapPin, Thermometer, Wind } from "lucide-react";

function placeName(location) {
  return [location?.name, location?.admin1, location?.country].filter(Boolean).join(" · ");
}

export default function WeatherSummary({ result }) {
  const rangeText = result.rangeMode === "past" ? "过去10天" : "未来10天";
  const items = [
    {
      label: "平均温度",
      value: `${result.summary.averageTemp}°C`,
      icon: Thermometer,
    },
    {
      label: "总降水",
      value: `${result.summary.totalPrecipitation} mm`,
      icon: Droplets,
    },
    {
      label: "最大风速",
      value: `${result.summary.maxWind} km/h`,
      icon: Wind,
    },
  ];

  return (
    <section className="summary-band" aria-labelledby="summary-title">
      <div className="summary-heading">
        <div className="location-mark">
          <MapPin className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="eyebrow">查询结果</p>
          <h2 id="summary-title">{placeName(result.location)}</h2>
          <p className="date-range">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            {rangeText} · {result.dateRange.start} 至 {result.dateRange.end}
          </p>
        </div>
      </div>

      <div className="summary-metrics">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div className="metric-tile" key={item.label}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}
