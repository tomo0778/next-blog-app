"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Category = {
  id: string;
  name: string;
};

type PostDetail = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  categories: {
    category: Category;
  }[];
};

const Page: React.FC = () => {
  const { id } = useParams() as { id: string };
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // カテゴリ一覧取得
  const fetchCategories = async () => {
    const res = await fetch("/api/categories", { cache: "no-store" });
    if (!res.ok) throw new Error("カテゴリの取得に失敗しました");
    return (await res.json()) as Category[];
  };

  // 投稿詳細取得
  const fetchPost = async () => {
    const res = await fetch(`/api/posts/${id}`, { cache: "no-store" });
    if (!res.ok) throw new Error("投稿記事の取得に失敗しました");
    return (await res.json()) as PostDetail;
  };

  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);

        const [categoriesData, postData] = await Promise.all([
          fetchCategories(),
          fetchPost(),
        ]);

        setCategories(categoriesData);
        setTitle(postData.title);
        setContent(postData.content);
        setCoverImageURL(postData.coverImageURL);
        setCategoryIds(postData.categories.map((item) => item.category.id));
      } catch (e) {
        setErrorMsg(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, [id]);

  // チェックボックス切り替え
  const toggleCategory = (categoryId: string) => {
    setCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  // 更新処理
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          content,
          coverImageURL,
          categoryIds,
        }),
      });

      if (!res.ok) {
        throw new Error("更新に失敗しました");
      }

      router.push(`/admin/posts/${id}`);
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 削除処理
  const handleDelete = async () => {
    if (!window.confirm("この記事を削除しますか？")) return;

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      router.push("/admin/posts");
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました",
      );
    }
  };

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!categories || errorMsg) {
    return <div className="text-red-500">{errorMsg}</div>;
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の編集</div>

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

        {/* 操作ボタン */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded bg-red-500 px-4 py-1 font-bold text-white hover:bg-red-600"
          >
            <FontAwesomeIcon icon={faTrash} className="mr-1" />
            削除
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className={twMerge(
              "rounded-md px-6 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            更新
          </button>
        </div>
      </form>
    </main>
  );
};

export default Page;
