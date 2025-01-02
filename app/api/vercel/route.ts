import { NextResponse } from "next/server";

const teamId = process.env.VERCEL_TEAM_ID;
const apiToken = process.env.VERCEL_API_TOKEN;

export async function POST(request: Request) {
  try {
    // const { teamId, apiToken } = await request.json();
    
    // if (!teamId || !apiToken) {
    //   return NextResponse.json(
    //     { error: "Team ID and API Token are required" },
    //     { status: 400 }
    //   );
    // }

    const apiEndPoint = `https://api.vercel.com/v6/deployments?teamId=${teamId}&limit=100`;
    
    const response = await fetch(apiEndPoint, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Invalid credentials or API error");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 }
    );
  }
}
