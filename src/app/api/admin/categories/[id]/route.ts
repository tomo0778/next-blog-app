import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

type RequestBody = {
  name: string;
};

export const PUT = async (req: NextRequest, context: RouteParams) => {
  try {
    const { id } = await context.params;
    const { name }: RequestBody = await req.json();

    const category = await prisma.category.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの名前変更に失敗しました" },
      { status: 500 },
    );
  }
};

export const DELETE = async (req: NextRequest, context: RouteParams) => {
  try {
    const { id } = await context.params;

    const category = await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({
      msg: `「${category.name}」を削除しました。`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "カテゴリの削除に失敗しました" },
      { status: 500 },
    );
  }
};
