import { NextResponse } from "next/server";
import { searchCities } from "../../../lib/openMeteo";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name")?.trim();

  if (!name) {
    return NextResponse.json({ error: "请输入城市名称" }, { status: 400 });
  }

  try {
    const cities = await searchCities(name);
    return NextResponse.json({ cities });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "城市搜索失败" },
      { status: 502 },
    );
  }
}
