"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// APIレスポンス用の型（PostSummary と合わせない）
type PostDetail = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

const Page: React.FC = () => {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { id } = useParams() as { id: string };

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/posts/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("投稿記事の取得に失敗しました");
        }

        const data = (await res.json()) as PostDetail;
        setPost(data);
      } catch (e) {
        setFetchError(
          e instanceof Error ? e.message : "予期せぬエラーが発生しました",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  if (!post) {
    return <div>指定された投稿は存在しません。</div>;
  }

  const safeHTML = DOMPurify.sanitize(post.content);

  return (
    <main className="space-y-6">
      {/* タイトル */}
      <h1 className="text-2xl font-bold">{post.title}</h1>

      {/* 投稿日 & カテゴリ */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>投稿日: {dayjs(post.createdAt).format("YYYY/MM/DD")}</span>

        <div className="flex gap-2">
          {post.categories.map((item) => (
            <span
              key={item.category.id}
              className="rounded bg-slate-200 px-2 py-0.5"
            >
              {item.category.name}
            </span>
          ))}
        </div>
      </div>

      {/* カバー画像 */}
      <Image
        src={post.coverImageURL}
        alt={post.title}
        width={800}
        height={450}
        priority
        className="rounded-xl"
      />

      {/* 本文 */}
      <div
        className="leading-relaxed"
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />
    </main>
  );
};

export default Page;
