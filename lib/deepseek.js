import { buildFallbackAdvice } from "./adviceFallback";

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";

function safeParseJson(content) {
  const cleaned = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

function normalizeAdvice(days, payload) {
  const items = Array.isArray(payload?.days) ? payload.days : [];
  const byDate = new Map(items.map((item) => [item.date, item]));
  const fallback = buildFallbackAdvice(days);

  return days.map((day, index) => {
    const modelItem = byDate.get(day.date);
    const fallbackItem = fallback[index];

    return {
      date: day.date,
      clothingAdvice: modelItem?.clothingAdvice || fallbackItem.clothingAdvice,
      travelAdvice: modelItem?.travelAdvice || fallbackItem.travelAdvice,
      riskTags: Array.isArray(modelItem?.riskTags) && modelItem.riskTags.length
        ? modelItem.riskTags.slice(0, 4)
        : fallbackItem.riskTags,
    };
  });
}

export async function generateAdvice(city, days, rangeMode = "future") {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";
  const rangeText = rangeMode === "past" ? "过去10日复盘" : "未来10日出行规划";

  if (!apiKey) {
    return {
      source: "fallback",
      message: "未配置 DeepSeek API Key，已使用基础建议。",
      advice: buildFallbackAdvice(days),
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 16000);

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        response_format: { type: "json_object" },
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content: [
              "你是中文生活天气建议助手。",
              "根据天气码、温度、体感温度、降水、降雪和风速生成实用建议。",
              "只返回 JSON，不要 Markdown。",
              "建议必须具体、简短、适合天气卡片展示。",
              "不要给医疗诊断，不要做绝对安全承诺。",
            ].join(""),
          },
          {
            role: "user",
            content: JSON.stringify({
              city: `${city.name}${city.admin1 ? `，${city.admin1}` : ""}${city.country ? `，${city.country}` : ""}`,
              range: rangeText,
              units: "摄氏度、毫米、公里/小时",
              requirement: "为每个日期输出 clothingAdvice、travelAdvice、riskTags。riskTags 最多4个短标签。",
              days,
              outputShape: {
                days: [
                  {
                    date: "YYYY-MM-DD",
                    clothingAdvice: "中文短句",
                    travelAdvice: "中文短句",
                    riskTags: ["短标签"],
                  },
                ],
              },
            }),
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`DeepSeek 请求失败：${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("DeepSeek 未返回建议内容");
    }

    return {
      source: "deepseek",
      message: `建议由 DeepSeek 根据${rangeMode === "past" ? "过去" : "未来"}10日天气生成。`,
      advice: normalizeAdvice(days, safeParseJson(content)),
    };
  } catch (error) {
    return {
      source: "fallback",
      message: "智能建议暂不可用，已使用基础建议。",
      advice: buildFallbackAdvice(days),
    };
  }
}
