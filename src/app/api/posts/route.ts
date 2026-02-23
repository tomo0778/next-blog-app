import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title");
    const categoryId = searchParams.get("categoryId");

    const posts = await prisma.post.findMany({
      where: {
        ...(title && {
          title: {
            contains: title, // ← mode を削除
          },
        }),
        ...(categoryId && {
          categories: {
            some: {
              categoryId,
            },
          },
        }),
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        likes: true,
        views: true,
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};
