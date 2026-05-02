import { getWeatherInfo } from "./weatherCodes";

function getClothingBase(apparentMean) {
  if (apparentMean >= 30) return "穿短袖、透气衣物，外出注意防晒和补水。";
  if (apparentMean >= 24) return "短袖或薄衬衫即可，早晚可备一件轻薄外搭。";
  if (apparentMean >= 18) return "建议长袖、薄外套，早晚温差时更舒服。";
  if (apparentMean >= 10) return "适合卫衣、针织衫或夹克，注意颈部保暖。";
  if (apparentMean >= 0) return "建议厚外套、围巾，久在室外要加强保暖。";
  return "建议羽绒服、手套和保暖鞋，优先选择防滑鞋底。";
}

function getTravelBase(day, weatherText) {
  const tags = [];
  const parts = [];

  if (day.precipitation >= 15 || [65, 82, 95, 96, 99].includes(day.weatherCode)) {
    parts.push("雨势或对流天气明显，减少户外停留，避开低洼和积水路段。");
    tags.push("强降水");
  } else if (day.precipitation >= 1 || day.rain >= 1) {
    parts.push("有降水，带伞出门，路面湿滑时预留通勤时间。");
    tags.push("带伞");
  }

  if (day.snowfall > 0 || [71, 73, 75, 77, 85, 86].includes(day.weatherCode)) {
    parts.push("可能有积雪或结冰，步行和骑行都要放慢。");
    tags.push("防滑");
  }

  if (day.windMax >= 38) {
    parts.push("风力偏强，减少骑行和高处停留。");
    tags.push("大风");
  }

  if ([45, 48].includes(day.weatherCode)) {
    parts.push("能见度偏低，驾车注意车距和灯光。");
    tags.push("低能见度");
  }

  if (day.apparentMean >= 30) {
    parts.push("体感偏热，避开正午长时间暴晒。");
    tags.push("防晒");
  }

  if (!parts.length) {
    parts.push(`${weatherText}为主，适合日常出行，留意早晚温差。`);
    tags.push("适宜出行");
  }

  return { travelAdvice: parts.join(""), riskTags: [...new Set(tags)] };
}

export function buildFallbackAdvice(days) {
  return days.map((day) => {
    const info = getWeatherInfo(day.weatherCode);
    const clothingParts = [getClothingBase(day.apparentMean)];

    if (day.precipitation >= 1 || day.rain >= 1) clothingParts.push("建议搭配防水外套或防水鞋。");
    if (day.snowfall > 0) clothingParts.push("选择保暖防滑鞋，应对湿滑路面。");
    if (day.windMax >= 38) clothingParts.push("加一件防风外套，避免宽松易飘衣物。");

    const travel = getTravelBase(day, info.text);

    return {
      date: day.date,
      clothingAdvice: clothingParts.join(""),
      travelAdvice: travel.travelAdvice,
      riskTags: travel.riskTags,
    };
  });
}
