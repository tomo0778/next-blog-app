import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    const title = searchParams.get("title");
    const categoryId = searchParams.get("categoryId");
    const sort = searchParams.get("sort") ?? "latest";
    const period = searchParams.get("period") ?? "all";

    // ソート条件を動的に作成
    let orderBy: Prisma.PostOrderByWithRelationInput;

    switch (sort) {
      case "likes":
        orderBy = { likes: "desc" };
        break;
      case "dislikes":
        orderBy = { dislikes: "desc" };
        break;
      case "views":
        orderBy = { views: "desc" };
        break;
      default:
        orderBy = { createdAt: "desc" };
    }

    let dateFilter = {};

    if (period === "week") {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      dateFilter = {
        createdAt: {
          gte: oneWeekAgo,
        },
      };
    }

    if (period === "month") {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      dateFilter = {
        createdAt: {
          gte: oneMonthAgo,
        },
      };
    }

    const posts = await prisma.post.findMany({
      where: {
        ...dateFilter,

        ...(title && {
          title: {
            contains: title,
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
        dislikes: true,
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
      orderBy,
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
