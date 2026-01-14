"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Category = {
  id: string;
  name: string;
};

const Page: React.FC = () => {
  const router = useRouter();

  // フォーム入力用 state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [coverImageURL, setCoverImageURL] = useState("");
  const [categoryIds, setCategoryIds] = useState<string[]>([]);

  // 状態管理
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  // カテゴリ一覧取得
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setCategories(data);
    } catch (error) {
      const msg =
        error instanceof Error
          ? `カテゴリの取得に失敗しました: ${error.message}`
          : "予期せぬエラーが発生しました";
      console.error(msg);
      setFetchErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // チェックボックス切り替え
  const toggleCategory = (id: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id],
    );
  };

  // 投稿処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/posts", {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          content,
          coverImageURL,
          categoryIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      const post = await res.json();
      router.push(`/posts/${post.id}`);
    } catch (error) {
      const msg =
        error instanceof Error
          ? `投稿に失敗しました: ${error.message}`
          : "予期せぬエラーが発生しました";
      console.error(msg);
      window.alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ローディング中
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // 取得失敗
  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の新規作成</div>

      {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="text-gray-500">処理中...</div>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className={twMerge("space-y-4", isSubmitting && "opacity-50")}
      >
        {/* タイトル */}
        <div className="space-y-1">
          <label className="block font-bold">タイトル</label>
          <input
            type="text"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="タイトルを記入してください"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* 本文 */}
        <div className="space-y-1">
          <label className="block font-bold">本文</label>
          <textarea
            className="w-full rounded-md border-2 px-2 py-1"
            rows={6}
            placeholder="本文を記入してください"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>

        {/* カバー画像URL */}
        <div className="space-y-1">
          <label className="block font-bold">カバーイメージ（URL）</label>
          <input
            type="text"
            className="w-full rounded-md border-2 px-2 py-1"
            placeholder="画像URLを記入してください"
            value={coverImageURL}
            onChange={(e) => setCoverImageURL(e.target.value)}
            required
          />
        </div>

        {/* カテゴリ */}
        <div className="space-y-2">
          <div className="font-bold">タグ</div>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={categoryIds.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={twMerge(
              "rounded-md px-6 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            記事を投稿
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
