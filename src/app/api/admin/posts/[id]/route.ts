import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RequestBody = {
  title: string;
  content: string;
  coverImageKey: string;
  categoryIds: string[];
};

export const PUT = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await context.params;
    const { title, content, coverImageKey, categoryIds }: RequestBody =
      await req.json();

    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    if (categories.length !== categoryIds.length) {
      throw new Error("指定されたカテゴリが存在しません");
    }

    await prisma.postCategory.deleteMany({
      where: { postId: id },
    });

    const post = await prisma.post.update({
      where: { id },
      data: {
        title,
        content,
        coverImageKey,
      },
    });

    for (const categoryId of categoryIds) {
      await prisma.postCategory.create({
        data: {
          postId: post.id,
          categoryId,
        },
      });
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の変更に失敗しました" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  try {
    const { id } = await context.params;

    const post = await prisma.post.delete({
      where: { id },
    });

    return NextResponse.json({
      msg: `「${post.title}」を削除しました。`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の削除に失敗しました" },
      { status: 500 },
    );
  }
};
