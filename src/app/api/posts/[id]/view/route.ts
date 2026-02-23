import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const post = await prisma.post.update({
    where: { id },
    data: {
      views: {
        increment: 1,
      },
    },
  });

  return NextResponse.json({ views: post.views });
}
