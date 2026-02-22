"use client";

import { useState, useEffect, useCallback } from "react"; // ◀ useCallback を追加
import type { Post } from "@/app/_types/Post";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// カテゴリの型定義
type Category = {
  id: string;
  name: string;
};

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // ◀ 追加
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // ◀ 追加

  // 検索条件用 state ◀ 追加
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // 投稿取得関数 (useCallbackでメモ化) ◀ 修正
  const fetchPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (title) params.append("title", title);
      if (categoryId) params.append("categoryId", categoryId);

      const response = await fetch(`/api/posts?${params.toString()}`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("投稿記事の取得に失敗しました");
      }

      const data = await response.json();
      setPosts(data as Post[]);
    } catch (e) {
      setFetchError(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  }, [title, categoryId]); // 検索条件に依存

  // カテゴリ一覧取得関数 ◀ 追加
  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (res.ok) {
        setCategories(await res.json());
      }
    } catch (e) {
      console.error("カテゴリの取得に失敗しました", e);
    }
  }, []);

  // 初回レンダリング時の実行 ◀ 修正
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  return (
    <main className="space-y-4">
      <div className="mb-2 text-2xl font-bold">Main</div>

      {/* 検索フォーム (管理画面と同じデザイン) ◀ 追加 */}
      <div className="flex flex-wrap gap-4 rounded border bg-slate-50 p-4">
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

      {/* 投稿一覧表示部分 */}
      {isLoading || !posts ? (
        <div className="text-gray-500">
          <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="space-y-3">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostSummary
                key={post.id}
                post={post}
                linkTo={`/posts/${post.id}`}
              />
            ))
          ) : (
            <div className="text-gray-500">
              条件に一致する記事がありません。
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Page;
