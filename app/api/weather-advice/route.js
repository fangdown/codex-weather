import { NextResponse } from "next/server";
import { generateAdvice } from "../../../lib/deepseek";
import { fetchRecentWeather, summarizeWeather } from "../../../lib/openMeteo";

function isValidCity(city) {
  return (
    city
    && typeof city.name === "string"
    && Number.isFinite(Number(city.latitude))
    && Number.isFinite(Number(city.longitude))
  );
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json({ error: "请求数据格式不正确" }, { status: 400 });
  }

  const city = payload?.city || payload;
  const rangeMode = payload?.rangeMode === "past" ? "past" : "future";

  if (!isValidCity(city)) {
    return NextResponse.json({ error: "城市信息不完整" }, { status: 400 });
  }

  const normalizedCity = {
    name: city.name,
    country: city.country || "",
    admin1: city.admin1 || "",
    latitude: Number(city.latitude),
    longitude: Number(city.longitude),
    timezone: city.timezone || "auto",
  };

  try {
    const weatherDays = await fetchRecentWeather(normalizedCity, rangeMode);
    const adviceResult = await generateAdvice(normalizedCity, weatherDays, rangeMode);
    const adviceByDate = new Map(adviceResult.advice.map((item) => [item.date, item]));
    const days = weatherDays.map((day) => ({
      ...day,
      clothingAdvice: adviceByDate.get(day.date)?.clothingAdvice || "",
      travelAdvice: adviceByDate.get(day.date)?.travelAdvice || "",
      riskTags: adviceByDate.get(day.date)?.riskTags || [],
    }));

    return NextResponse.json({
      location: normalizedCity,
      dateRange: {
        start: days[0]?.date,
        end: days[days.length - 1]?.date,
      },
      rangeMode,
      summary: summarizeWeather(days),
      adviceSource: adviceResult.source,
      adviceMessage: adviceResult.message,
      days,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "天气查询失败" },
      { status: 502 },
    );
  }
}
