"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faPlus, faTags } from "@fortawesome/free-solid-svg-icons";

type Category = {
  id: string;
  name: string;
};

type AdminPost = {
  id: string;
  title: string;
  createdAt: string;
  categories: {
    category: Category;
  }[];
};

const Page: React.FC = () => {
  const [posts, setPosts] = useState<AdminPost[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 検索条件
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // 投稿取得
  const fetchPosts = async () => {
    setIsLoading(true);

    const params = new URLSearchParams();
    if (title) params.append("title", title);
    if (categoryId) params.append("categoryId", categoryId);

    const res = await fetch(`/api/posts?${params.toString()}`, {
      cache: "no-store",
    });

    const data = await res.json();
    setPosts(data);
    setIsLoading(false);
  };

  // カテゴリ取得
  const fetchCategories = async () => {
    const res = await fetch("/api/categories", { cache: "no-store" });
    setCategories(await res.json());
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, []);

  return (
    <main className="space-y-4">
      {/* タイトル */}
      <h1 className="text-2xl font-bold">投稿記事一覧(管理)</h1>

      {/* 操作ボタン */}
      <div className="flex gap-2">
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-1 rounded bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-600"
        >
          <FontAwesomeIcon icon={faPlus} />
          記事の新規作成
        </Link>

        <Link
          href="/admin/categories"
          className="flex items-center gap-1 rounded bg-slate-500 px-3 py-1 text-white hover:bg-slate-600"
        >
          <FontAwesomeIcon icon={faTags} />
          カテゴリ一覧(管理)
        </Link>
      </div>

      {/* 検索フォーム */}
      <div className="flex flex-wrap gap-4 rounded border p-4">
        <input
          type="text"
          placeholder="タイトルで検索"
          className="rounded border px-2 py-1"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="rounded border px-2 py-1"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">すべてのカテゴリ</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={fetchPosts}
          className="rounded bg-slate-600 px-4 py-1 text-white hover:bg-slate-700"
        >
          検索
        </button>
      </div>

      {/* 一覧 */}
      {isLoading ? (
        <div className="text-gray-500">
          <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
              className="block rounded border p-4 hover:bg-slate-50"
            >
              <div className="font-bold">{post.title}</div>
              <div className="text-sm text-slate-500">
                {dayjs(post.createdAt).format("YYYY/MM/DD")}
              </div>
              <div className="mt-1 flex gap-2">
                {post.categories.map((c) => (
                  <span
                    key={c.category.id}
                    className="rounded bg-slate-200 px-2 py-0.5 text-sm"
                  >
                    {c.category.name}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
