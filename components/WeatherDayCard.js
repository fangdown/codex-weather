import {
  Cloud,
  CloudFog,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Navigation,
  Shirt,
  Sun,
  Thermometer,
  Wind,
  Zap,
} from "lucide-react";

function WeatherIcon({ tone }) {
  const className = "h-5 w-5";
  if (tone === "warm") return <Sun className={className} aria-hidden="true" />;
  if (tone === "rain") return <CloudRain className={className} aria-hidden="true" />;
  if (tone === "storm") return <Zap className={className} aria-hidden="true" />;
  if (tone === "cold") return <CloudSnow className={className} aria-hidden="true" />;
  if (tone === "cool") return <CloudFog className={className} aria-hidden="true" />;
  if (tone === "mild") return <CloudSun className={className} aria-hidden="true" />;
  return <Cloud className={className} aria-hidden="true" />;
}

export default function WeatherDayCard({ day }) {
  return (
    <article className={`day-card tone-${day.weatherTone}`}>
      <div className="day-card-top">
        <div>
          <time dateTime={day.date}>{day.date}</time>
          <div className="weather-name">
            <WeatherIcon tone={day.weatherTone} />
            <span>{day.weatherText}</span>
          </div>
        </div>
        <div className="temperature-chip">
          <Thermometer className="h-4 w-4" aria-hidden="true" />
          <strong>{Math.round(day.tempMax)}°</strong>
          <span>/ {Math.round(day.tempMin)}°</span>
        </div>
      </div>

      <div className="day-stats">
        <span>
          <Droplets className="h-4 w-4" aria-hidden="true" />
          {day.precipitation} mm
        </span>
        <span>
          <Wind className="h-4 w-4" aria-hidden="true" />
          {day.windMax} km/h
        </span>
      </div>

      <div className="advice-block">
        <div>
          <Shirt className="h-4 w-4" aria-hidden="true" />
          <p>{day.clothingAdvice}</p>
        </div>
        <div>
          <Navigation className="h-4 w-4" aria-hidden="true" />
          <p>{day.travelAdvice}</p>
        </div>
      </div>

      {day.riskTags?.length ? (
        <div className="risk-tags" aria-label="风险标签">
          {day.riskTags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
    </article>
  );
}
