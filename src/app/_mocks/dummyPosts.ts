import type { Post } from "@/app/_types/Post";

const dummyPosts: Post[] = [
  {
    id: "1d4cbd35-6ec2-4f34-b3e7-4a9b35a60d1a",
    createdAt: "2024-10-26T22:48:30.156Z",
    updatedAt: "2024-10-26T22:48:30.156Z",
    title: "投稿3",
    content:
      "秋は夕暮れ。<br/>夕日のさして山の端いと近うなりたるに、烏の寝どころへ行くとて、三つ四つ、二つ三つなど、飛びいそぐさへあはれなり。",
    coverImageKey: "https://w1980.blob.core.windows.net/pg3/cover-img-red.jpg",
    categories: [
      {
        category: {
          id: "587ac4ab-92de-450c-9423-5e091d16ecb5",
          name: "TypeScript",
        },
      },
      {
        category: {
          id: "f8a4c465-2e7f-455d-aa1d-5098e9d0086d",
          name: "Next.js",
        },
      },
    ],
  },
  {
    id: "24f932b8-231b-429b-b9dc-569f07ba16a7",
    createdAt: "2024-10-24T22:37:17.367Z",
    updatedAt: "2024-10-24T22:37:17.367Z",
    title: "投稿2",
    content: "夏は夜。<br/>月のころはさらなり。",
    coverImageKey:
      "private/72b6fe30-69ca-4b40-bfa3-7d719dbd4379/dc78202403844c73dd85f5a0938baa78",
    categories: [
      {
        category: {
          id: "587ac4ab-92de-450c-9423-5e091d16ecb5",
          name: "TypeScript",
        },
      },
    ],
  },
  {
    id: "36b7c693-4cce-4d73-afa3-acb54a404290",
    createdAt: "2024-10-22T11:22:34.684Z",
    updatedAt: "2024-10-22T11:22:34.684Z",
    title: "投稿1",
    content: "春はあけぼの。",
    coverImageKey:
      "https://w1980.blob.core.windows.net/pg3/cover-img-purple.jpg",
    categories: [
      {
        category: {
          id: "587ac4ab-92de-450c-9423-5e091d16ecb5",
          name: "TypeScript",
        },
      },
      {
        category: {
          id: "5cf22131-bac8-4bd0-be8e-757cec2bcc9a",
          name: "React",
        },
      },
    ],
  },
];

export default dummyPosts;
