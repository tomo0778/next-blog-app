import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;

    // 1. 現在の記事のカテゴリIDを取得
    const currentPost = await prisma.post.findUnique({
      where: { id },
      include: {
        categories: true, // ← これが超重要
      },
    });

    if (!currentPost) {
      return NextResponse.json(
        { error: "記事が見つかりません" },
        { status: 404 },
      );
    }

    const categoryIds = currentPost.categories.map((c) => c.categoryId);

    // 2. 同じカテゴリを持つ「他の記事」を3件取得
    const relatedPosts = await prisma.post.findMany({
      where: {
        id: { not: id }, // 自分自身を除外
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        coverImageKey: true,
        createdAt: true,
      },
    });

    return NextResponse.json(relatedPosts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "関連記事の取得に失敗しました" },
      { status: 500 },
    );
  }
};
