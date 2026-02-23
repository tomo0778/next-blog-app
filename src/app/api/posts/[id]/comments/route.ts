import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  const comments = await prisma.comment.findMany({
    where: { postId: id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comments);
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const { name, content } = await req.json();

  if (!name || !content) {
    return NextResponse.json(
      { error: "名前とコメントは必須です" },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      postId: id,
      name,
      content,
    },
  });

  return NextResponse.json(comment);
}
