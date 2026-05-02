# Codex Weather

一个基于 Next.js 的城市天气查询应用。用户输入城市名后，应用会查询未来或过去 10 天的天气，并结合 DeepSeek 生成穿衣建议、出行建议和风险标签。

## 功能

- 城市搜索：输入中文城市名，自动匹配最优城市结果。
- 天气范围切换：默认展示未来 10 天，也可切换为过去 10 天。
- 天气数据展示：包含天气描述、最高/最低温、平均温度、体感温度、降水、降雪、最大风速。
- 智能建议：服务端调用 DeepSeek，根据天气生成穿衣建议和出行建议。
- 兜底建议：DeepSeek 未配置、超时或返回异常时，自动使用本地规则建议。
- 响应式 UI：桌面端和移动端都可阅读，使用轻量 SVG 展示温度趋势。

## 技术栈

- Next.js 13 App Router：页面和 API Routes 放在同一个项目中。
- React 18：前端交互状态和组件渲染。
- Tailwind CSS：基础样式编译。
- lucide-react：图标。
- Open-Meteo：城市地理编码和天气数据。
- DeepSeek Chat Completions API：生成穿衣、出行和风险建议。

## 项目结构

```text
.
├── app/
│   ├── api/
│   │   ├── cities/route.js
│   │   └── weather-advice/route.js
│   ├── globals.css
│   ├── layout.js
│   └── page.js
├── components/
│   ├── SearchPanel.js
│   ├── StatusMessage.js
│   ├── TemperatureChart.js
│   ├── WeatherDayCard.js
│   └── WeatherSummary.js
├── lib/
│   ├── adviceFallback.js
│   ├── deepseek.js
│   ├── openMeteo.js
│   └── weatherCodes.js
├── .env.example
├── package.json
└── tailwind.config.js
```

## 快速开始

安装依赖：

```bash
npm install
```

复制环境变量文件：

```bash
cp .env.example .env.local
```

填写 DeepSeek Key：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
```

启动开发服务：

```bash
npm run dev
```

打开：

```text
http://127.0.0.1:3000/codex-weather
```

生产构建：

```bash
npm run build
npm run start
```

## 环境变量

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 否 | DeepSeek API Key。未配置时应用仍可运行，但会使用本地兜底建议。 |
| `DEEPSEEK_MODEL` | 否 | DeepSeek 模型名称，默认 `deepseek-v4-flash`。 |

## 使用示例

### 查询城市

```bash
curl "http://127.0.0.1:3000/codex-weather/api/cities?name=上海"
```

示例响应：

```json
{
  "cities": [
    {
      "id": 1796236,
      "name": "上海",
      "country": "中国",
      "admin1": "上海市",
      "admin2": "上海市",
      "latitude": 31.22222,
      "longitude": 121.45806,
      "timezone": "Asia/Shanghai"
    }
  ]
}
```

### 查询未来 10 天天气和建议

```bash
curl -X POST "http://127.0.0.1:3000/codex-weather/api/weather-advice" \
  -H "Content-Type: application/json" \
  -d '{
    "rangeMode": "future",
    "city": {
      "name": "上海",
      "country": "中国",
      "admin1": "上海市",
      "latitude": 31.22222,
      "longitude": 121.45806,
      "timezone": "Asia/Shanghai"
    }
  }'
```

### 查询过去 10 天天气和建议

```bash
curl -X POST "http://127.0.0.1:3000/codex-weather/api/weather-advice" \
  -H "Content-Type: application/json" \
  -d '{
    "rangeMode": "past",
    "city": {
      "name": "上海",
      "country": "中国",
      "admin1": "上海市",
      "latitude": 31.22222,
      "longitude": 121.45806,
      "timezone": "Asia/Shanghai"
    }
  }'
```

响应会包含：

```json
{
  "location": {},
  "dateRange": {
    "start": "2026-05-03",
    "end": "2026-05-12"
  },
  "rangeMode": "future",
  "summary": {
    "averageTemp": 20.1,
    "totalPrecipitation": 18.2,
    "maxWind": 22.4
  },
  "adviceSource": "deepseek",
  "adviceMessage": "建议由 DeepSeek 根据未来10日天气生成。",
  "days": []
}
```

## API 说明

本项目配置了 Next.js `basePath: "/codex-weather"`，所以部署后页面和 API 都挂在 `/codex-weather` 子路径下。访问根路径 `/` 会临时重定向到 `/codex-weather`。

### `GET /api/cities`

根据城市名搜索最优城市结果。

查询参数：

| 参数 | 必填 | 说明 |
| --- | --- | --- |
| `name` | 是 | 城市名称，例如 `上海`、`北京`、`深圳`。 |

行为：

- 中文城市名会自动追加“市”再做一次查询，例如 `北京` 会同时查询 `北京` 和 `北京市`。
- 服务端会按名称匹配度、城市级别和人口数据排序，只返回最优的 1 个城市。
- Open-Meteo 搜索失败时返回 `502`。
- 未传 `name` 时返回 `400`。

### `POST /api/weather-advice`

查询指定城市的 10 天天气，并生成穿衣和出行建议。

请求体：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `city` | 是 | 城市对象，至少包含 `name`、`latitude`、`longitude`。 |
| `rangeMode` | 否 | `future` 或 `past`，默认 `future`。 |

日期规则：

- `future`：默认模式，展示从明天开始的未来 10 个自然日。
- `past`：展示从昨天往前的过去 10 个完整自然日。
- 日期按城市时区计算。

返回字段：

- `location`：城市信息。
- `dateRange`：结果日期范围。
- `rangeMode`：当前查询模式。
- `summary`：平均温度、总降水、最大风速。
- `adviceSource`：`deepseek` 或 `fallback`。
- `adviceMessage`：建议来源说明。
- `days`：每日天气和建议列表。

## 关键实现说明

- 子路径部署：`next.config.js` 使用 `basePath: "/codex-weather"`，适配 Vercel 默认域名和自定义域名的 `/codex-weather` 访问路径。
- API Key 只在服务端读取：前端只调用本项目的 API Routes，不直接请求 DeepSeek，避免泄露 `DEEPSEEK_API_KEY`。
- 城市搜索做了结果折叠：Open-Meteo 可能返回同名乡镇或地点，`lib/openMeteo.js` 会按主城市特征、人口和匹配度选出 1 个最优结果。
- 天气查询共用 Open-Meteo Forecast API：未来和过去 10 天通过 `forecast_days`、`past_days` 和本地过滤逻辑实现。
- DeepSeek 输出使用 JSON 模式：`lib/deepseek.js` 要求模型返回结构化 JSON，并按日期合并回天气列表。
- 本地兜底建议保证可用性：当 DeepSeek 未配置、超时、请求失败或 JSON 解析失败时，`lib/adviceFallback.js` 会根据温度、降水、降雪和风速生成基础建议。
- 天气码集中管理：`lib/weatherCodes.js` 将 Open-Meteo 天气码映射为中文描述和 UI 色调。

## 开发说明

常用命令：

```bash
npm run dev
npm run build
npm run start
```

主要模块：

- `app/page.js`：页面状态管理、搜索流程、范围切换。
- `components/SearchPanel.js`：城市输入和未来/过去 10 天切换。
- `components/TemperatureChart.js`：SVG 温度趋势图。
- `components/WeatherDayCard.js`：每日天气、建议和风险标签。
- `app/api/cities/route.js`：城市搜索 API。
- `app/api/weather-advice/route.js`：天气与建议聚合 API。
- `lib/openMeteo.js`：Open-Meteo 城市和天气请求。
- `lib/deepseek.js`：DeepSeek 请求、JSON 解析和兜底切换。
- `lib/adviceFallback.js`：本地建议生成规则。

## 故障排查

- 搜索城市无结果：确认城市名拼写，或尝试加上“市”。
- 页面显示“已使用基础建议”：通常是未配置 `DEEPSEEK_API_KEY`、DeepSeek 请求失败或返回内容无法解析。
- 天气查询失败：检查网络是否能访问 Open-Meteo。
- 构建失败：先删除 `.next` 后重新构建。

```bash
rm -rf .next
npm run build
```
