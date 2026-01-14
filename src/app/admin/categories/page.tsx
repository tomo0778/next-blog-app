"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faTrash,
  faPlus,
  faFileLines,
} from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type Category = {
  id: string;
  name: string;
};

const Page: React.FC = () => {
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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
    } catch (e) {
      setErrorMsg(
        e instanceof Error
          ? `カテゴリの取得に失敗しました: ${e.message}`
          : "予期せぬエラーが発生しました",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 削除処理
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`カテゴリ「${name}」を削除しますか？`)) return;

    try {
      setIsDeleting(id);
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("削除に失敗しました");
      }

      await fetchCategories();
    } catch (e) {
      window.alert(
        e instanceof Error ? e.message : "予期せぬエラーが発生しました",
      );
    } finally {
      setIsDeleting(null);
    }
  };

  // ローディング
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // エラー
  if (!categories) {
    return <div className="text-red-500">{errorMsg}</div>;
  }

  return (
    <main className="space-y-4">
      {/* タイトル */}
      <h1 className="text-2xl font-bold">カテゴリ一覧（管理）</h1>

      {/* 操作ボタン */}
      <div className="flex gap-2">
        <Link
          href="/admin/categories/new"
          className={twMerge(
            "inline-flex items-center gap-1 rounded-md px-4 py-1 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600",
          )}
        >
          <FontAwesomeIcon icon={faPlus} />
          カテゴリの新規作成
        </Link>

        <Link
          href="/admin/posts"
          className={twMerge(
            "inline-flex items-center gap-1 rounded-md px-4 py-1 font-bold",
            "bg-slate-500 text-white hover:bg-slate-600",
          )}
        >
          <FontAwesomeIcon icon={faFileLines} />
          投稿記事一覧(管理)
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="text-gray-500">
          （カテゴリはまだ作成されていません）
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between rounded-md border border-slate-300 px-3 py-2"
            >
              {/* 編集リンク */}
              <Link
                href={`/admin/categories/${category.id}`}
                className="font-bold text-indigo-600 hover:underline"
              >
                {category.name}
              </Link>

              {/* 削除ボタン */}
              <button
                type="button"
                onClick={() => handleDelete(category.id, category.name)}
                disabled={isDeleting === category.id}
                className={twMerge(
                  "rounded px-3 py-1 text-sm font-bold",
                  "bg-red-500 text-white hover:bg-red-600",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                )}
              >
                <FontAwesomeIcon icon={faTrash} className="mr-1" />
                削除
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default Page;
