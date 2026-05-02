import { getWeatherInfo } from "./weatherCodes";

const CITY_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";

function asNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function getTodayInTimezone(timezone) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

const cityFeaturePriority = {
  PPLC: 100,
  PPLA: 90,
  PPLA2: 80,
  PPLA3: 70,
  PPLA4: 60,
  PPL: 20,
};

function normalizeCityName(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase()
    .replace(/[市县区镇乡]$/u, "");
}

function getFeatureScore(city) {
  return cityFeaturePriority[city.feature_code] || 0;
}

function scoreCity(city, keyword) {
  const normalizedKeyword = normalizeCityName(keyword);
  const normalizedName = normalizeCityName(city.name);
  const populationScore = city.population ? Math.log10(city.population) * 10 : 0;
  const matchScore = normalizedName === normalizedKeyword
    ? 1000
    : normalizedName.startsWith(normalizedKeyword)
      ? 180
      : 0;

  return matchScore + getFeatureScore(city) + populationScore;
}

function formatCity(city) {
  return {
    id: city.id,
    name: city.name,
    country: city.country,
    admin1: city.admin1 || "",
    admin2: city.admin2 || "",
    latitude: city.latitude,
    longitude: city.longitude,
    timezone: city.timezone || "auto",
  };
}

function getSearchVariants(name) {
  const trimmed = name.trim();
  const variants = [trimmed];
  const isLikelyChinese = /[\u4e00-\u9fff]/u.test(trimmed);

  if (isLikelyChinese && !/[市县区镇乡]$/u.test(trimmed)) {
    variants.push(`${trimmed}市`);
  }

  return [...new Set(variants)];
}

function selectBestCities(results, keyword) {
  const sorted = [...results].sort((a, b) => scoreCity(b, keyword) - scoreCity(a, keyword));
  return sorted.slice(0, 1);
}

export async function searchCities(name) {
  const requests = getSearchVariants(name).map(async (variant) => {
    const params = new URLSearchParams({
      name: variant,
      count: "10",
      language: "zh",
      format: "json",
    });

    const response = await fetch(`${CITY_URL}?${params.toString()}`, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      throw new Error("城市搜索服务暂时不可用");
    }

    return response.json();
  });

  const settledResults = await Promise.allSettled(requests);
  const successfulResults = settledResults
    .filter((result) => result.status === "fulfilled")
    .flatMap((result) => result.value.results || []);

  if (!successfulResults.length && settledResults.some((result) => result.status === "rejected")) {
    throw new Error("城市搜索服务暂时不可用");
  }

  const uniqueResults = [...new Map(successfulResults.map((city) => [city.id, city])).values()];

  return selectBestCities(uniqueResults, name).map(formatCity);
}

export async function fetchRecentWeather(city, rangeMode = "future") {
  const isPastMode = rangeMode === "past";
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    timezone: "auto",
    past_days: isPastMode ? "10" : "0",
    forecast_days: isPastMode ? "1" : "11",
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "temperature_2m_mean",
      "apparent_temperature_mean",
      "precipitation_sum",
      "rain_sum",
      "snowfall_sum",
      "wind_speed_10m_max",
    ].join(","),
  });

  const response = await fetch(`${FORECAST_URL}?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("天气服务暂时不可用");
  }

  const data = await response.json();
  const daily = data.daily || {};
  const today = getTodayInTimezone(city.timezone);
  const days = (daily.time || [])
    .map((date, index) => {
      const weatherCode = asNumber(daily.weather_code?.[index]);
      const weatherInfo = getWeatherInfo(weatherCode);

      return {
        date,
        weatherCode,
        weatherText: weatherInfo.text,
        weatherTone: weatherInfo.tone,
        tempMax: asNumber(daily.temperature_2m_max?.[index]),
        tempMin: asNumber(daily.temperature_2m_min?.[index]),
        tempMean: asNumber(daily.temperature_2m_mean?.[index]),
        apparentMean: asNumber(daily.apparent_temperature_mean?.[index]),
        precipitation: asNumber(daily.precipitation_sum?.[index]),
        rain: asNumber(daily.rain_sum?.[index]),
        snowfall: asNumber(daily.snowfall_sum?.[index]),
        windMax: asNumber(daily.wind_speed_10m_max?.[index]),
      };
    })
    .filter((day) => (isPastMode ? day.date < today : day.date > today))
    .slice(isPastMode ? -10 : 0, isPastMode ? undefined : 10);

  if (days.length < 1) {
    throw new Error(`未获取到可展示的${isPastMode ? "过去" : "未来"}10日天气`);
  }

  return days;
}

export function summarizeWeather(days) {
  const total = days.reduce(
    (acc, day) => ({
      temp: acc.temp + day.tempMean,
      precipitation: acc.precipitation + day.precipitation,
      windMax: Math.max(acc.windMax, day.windMax),
    }),
    { temp: 0, precipitation: 0, windMax: 0 },
  );

  return {
    averageTemp: Number((total.temp / days.length).toFixed(1)),
    totalPrecipitation: Number(total.precipitation.toFixed(1)),
    maxWind: Number(total.windMax.toFixed(1)),
  };
}
