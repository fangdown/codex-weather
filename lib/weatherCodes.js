export const weatherCodeMap = {
  0: { text: "晴", tone: "warm" },
  1: { text: "大部晴朗", tone: "warm" },
  2: { text: "局部多云", tone: "mild" },
  3: { text: "阴", tone: "mild" },
  45: { text: "雾", tone: "cool" },
  48: { text: "霜雾", tone: "cool" },
  51: { text: "小毛毛雨", tone: "rain" },
  53: { text: "毛毛雨", tone: "rain" },
  55: { text: "较强毛毛雨", tone: "rain" },
  56: { text: "冻毛毛雨", tone: "cold" },
  57: { text: "较强冻毛毛雨", tone: "cold" },
  61: { text: "小雨", tone: "rain" },
  63: { text: "中雨", tone: "rain" },
  65: { text: "大雨", tone: "storm" },
  66: { text: "冻雨", tone: "cold" },
  67: { text: "强冻雨", tone: "cold" },
  71: { text: "小雪", tone: "cold" },
  73: { text: "中雪", tone: "cold" },
  75: { text: "大雪", tone: "cold" },
  77: { text: "雪粒", tone: "cold" },
  80: { text: "阵雨", tone: "rain" },
  81: { text: "较强阵雨", tone: "rain" },
  82: { text: "强阵雨", tone: "storm" },
  85: { text: "阵雪", tone: "cold" },
  86: { text: "强阵雪", tone: "cold" },
  95: { text: "雷雨", tone: "storm" },
  96: { text: "雷雨伴冰雹", tone: "storm" },
  99: { text: "强雷雨伴冰雹", tone: "storm" },
};

export function getWeatherInfo(code) {
  return weatherCodeMap[code] || { text: "天气变化", tone: "mild" };
}
