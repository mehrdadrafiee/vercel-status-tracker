import { NextResponse } from "next/server";

type VercelAPIError = {
  error: {
    message: string;
    code: string;
  };
}

export async function POST(request: Request) {
  try {
    const { teamId, apiToken } = await request.json();
    
    if (!teamId || !apiToken) {
      return NextResponse.json(
        { error: "Team ID and API Token are required" },
        { status: 400 }
      );
    }

    const apiEndPoint = `https://api.vercel.com/v6/deployments?teamId=${teamId}&limit=100`;
    
    const response = await fetch(apiEndPoint, {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    });

    const data = await response.json();

    // Handle Vercel API specific errors
    if (!response.ok) {
      const errorData = data as VercelAPIError;
      throw new Error(errorData.error?.message || "Invalid credentials or API error");
    }

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch deployments";
    return NextResponse.json(
      { error: errorMessage },
      { status: error instanceof Error && error.message.includes("credentials") ? 401 : 500 }
    );
  }
}
