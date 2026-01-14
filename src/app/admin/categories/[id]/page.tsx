"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Category = {
  id: string;
  name: string;
};

const Page: React.FC = () => {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // カテゴリ一覧を取得し、id に一致するカテゴリを探す
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories", { cache: "no-store" });
        if (!res.ok) {
          throw new Error("カテゴリの取得に失敗しました");
        }

        const data: Category[] = await res.json();
        setCategories(data);

        const found = data.find((c) => c.id === id);
        if (!found) {
          setError("指定された id のカテゴリは存在しません。");
        } else {
          setCurrentCategory(found);
          setNewName(found.name);
        }
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [id]);

  // カテゴリ名を更新
  const handleUpdate = async () => {
    if (!newName.trim()) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newName }),
      });

      if (!res.ok) {
        throw new Error("カテゴリ名の変更に失敗しました");
      }

      // ★ 同じ画面のまま、表示だけ更新
      setCurrentCategory((prev) => (prev ? { ...prev, name: newName } : prev));

      // 下の一覧表示も更新しておく（UX向上）
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: newName } : c)),
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "カテゴリ名の変更に失敗しました");
    }
  };

  // カテゴリを削除
  const handleDelete = async () => {
    if (!confirm("このカテゴリを削除しますか？")) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("カテゴリの削除に失敗しました");
      }

      alert("カテゴリを削除しました");
      // 一覧ページはまだ無いのでトップへ退避
      router.push("/");
    } catch (e) {
      alert(e instanceof Error ? e.message : "カテゴリの削除に失敗しました");
    }
  };

  // ローディング中
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // 不正な id
  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!currentCategory) {
    return null;
  }

  return (
    <main className="space-y-6">
      <h1 className="text-xl font-bold">カテゴリの編集・削除</h1>

      <div>
        <div className="mb-1 text-sm text-gray-600">現在のカテゴリの名前</div>
        <div className="font-semibold">{currentCategory.name}</div>
      </div>

      <div>
        <div className="mb-1 text-sm text-gray-600">新しいカテゴリの名前</div>
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full rounded border border-gray-400 px-3 py-2"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleUpdate}
          className="rounded bg-indigo-500 px-4 py-2 text-white"
        >
          カテゴリの名前を変更
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded bg-red-500 px-4 py-2 text-white"
        >
          削除
        </button>
      </div>

      <hr />

      <div>
        <h2 className="mb-2 font-bold">既存のカテゴリの一覧</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => router.push(`/admin/categories/${category.id}`)}
              className="rounded border px-3 py-1 text-sm"
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
};

export default Page;
