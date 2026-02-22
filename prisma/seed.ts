import { prisma } from "@/lib/prisma";

const main = async () => {
  // 各テーブルから既存の全レコードを削除
  await prisma.postCategory?.deleteMany();
  await prisma.post?.deleteMany();
  await prisma.category?.deleteMany();

  // カテゴリデータの作成 (レコードのInsert)
  const c1 = await prisma.category.create({ data: { name: "カテゴリ1" } });
  const c2 = await prisma.category.create({ data: { name: "カテゴリ2" } });
  const c3 = await prisma.category.create({ data: { name: "カテゴリ3" } });
  const c4 = await prisma.category.create({ data: { name: "カテゴリ4" } });

  // 投稿記事データの作成 (レコードのInsert)
  const p1 = await prisma.post.create({
    data: {
      title: "投稿1",
      content: "投稿1の本文。<br/>投稿1の本文。投稿1の本文。",
      coverImageKey:
        "private/72b6fe30-69ca-4b40-bfa3-7d719dbd4379/3fedfb5ef969643ef4cfd5fb411b3e94",
      categories: {
        create: [{ categoryId: c1.id }, { categoryId: c2.id }],
      },
    },
  });

  const p2 = await prisma.post.create({
    data: {
      title: "投稿2",
      content: "投稿2の本文。<br/>投稿2の本文。投稿2の本文。",
      coverImageKey:
        "private/72b6fe30-69ca-4b40-bfa3-7d719dbd4379/dc78202403844c73dd85f5a0938baa78",
      categories: {
        create: [{ categoryId: c2.id }, { categoryId: c3.id }],
      },
    },
  });

  const p3 = await prisma.post.create({
    data: {
      title: "投稿3",
      content: "投稿3の本文。<br/>投稿3の本文。投稿3の本文。",
      coverImageKey:
        "private/72b6fe30-69ca-4b40-bfa3-7d719dbd4379/3fedfb5ef969643ef4cfd5fb411b3e94",
      categories: {
        create: [
          { categoryId: c1.id },
          { categoryId: c3.id },
          { categoryId: c4.id },
        ],
      },
    },
  });

  const p4 = await prisma.post.create({
    data: {
      title: "投稿4",
      content: "投稿4の本文。<br/>投稿4の本文。投稿4の本文。",
      coverImageKey:
        "private/72b6fe30-69ca-4b40-bfa3-7d719dbd4379/dc78202403844c73dd85f5a0938baa78",
      categories: {
        create: [],
      },
    },
  });

  console.log(JSON.stringify(p1, null, 2));
  console.log(JSON.stringify(p2, null, 2));
  console.log(JSON.stringify(p3, null, 2));
  console.log(JSON.stringify(p4, null, 2));
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
