import type { Category } from "./Category";

export type Post = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string | null;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: Category;
  }[];
};
