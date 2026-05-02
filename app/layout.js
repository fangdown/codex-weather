import "./globals.css";

export const metadata = {
  title: "近10日天气",
  description: "查询城市近10日天气，并获取穿衣与出行建议。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
