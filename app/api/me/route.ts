// app/api/me/route.ts
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user from database
  const user = await prisma.appUser.findUnique({
    where: { clerkId: userId },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { clerkId, email, firstName, lastName } = body;

    if (!clerkId) {
      return NextResponse.json({ error: "Missing clerkId" }, { status: 400 });
    }

    // Combine first and last name into name field
    const fullName = `${firstName || ""} ${lastName || ""}`.trim();

    // Upsert user in database
    const user = await prisma.appUser.upsert({
      where: { clerkId },
      update: {
        email: email || undefined,
        name: fullName || undefined,
        updatedAt: new Date(),
      },
      create: {
        clerkId,
        email: email || "",
        name: fullName || "",
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return NextResponse.json({ error: "Failed to sync user" }, { status: 500 });
  }
}
