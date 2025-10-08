// app/api/businesses/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? undefined;
  const rubro = new URL(request.url).searchParams.get("rubro") ?? undefined;

  const where: any = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (rubro) where.rubro = { equals: rubro };

  const businesses = await prisma.business.findMany({
    where,
    include: { products: true },
  });

  return NextResponse.json(businesses);
}

export async function POST(req: Request) {
  const body = await req.json();
  const business = await prisma.business.create({ data: body });
  return NextResponse.json(business);
}
