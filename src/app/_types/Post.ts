import type { Category } from "./Category";

export type Post = {
  id: string;
  title: string;
  content: string;
  coverImageKey: string | null;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: Category;
  }[];
};
