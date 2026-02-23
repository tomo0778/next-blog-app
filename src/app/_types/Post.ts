import type { Category } from "./Category";

export type Post = {
  id: string;
  title: string;
  content: string;
  coverImageKey: string | null;
  likes: number;
  dislikes: number;
  views: number;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: Category;
  }[];
};
