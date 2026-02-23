"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link"; // Linkはここからインポート
import Image from "next/image";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "@/utils/supabase";

// 既存の型
type PostDetail = {
  id: string;
  title: string;
  content: string;
  coverImageKey: string;
  createdAt: string;
  updatedAt: string;
  categories: {
    category: {
      id: string;
      name: string;
    };
  }[];
};

// ▼ 関連記事用の簡易的な型を追加
type RelatedPost = {
  id: string;
  title: string;
  coverImageKey: string;
  createdAt: string;
};

const Page: React.FC = () => {
  const [post, setPost] = useState<PostDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]); // ◀ 追加
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const { id } = useParams() as { id: string };

  useEffect(() => {
    const fetchPost = async () => {
      setIsLoading(true);
      try {
        // 1. メインの記事を取得
        const res = await fetch(`/api/posts/${id}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("投稿記事取得に失敗しました");
        }

        const data = (await res.json()) as PostDetail;
        setPost(data);

        // へ閲覧数カウント
        await fetch(`/api/posts/${id}/view`, {
          method: "POST",
        });

        // 2. 関連記事を取得 (メイン記事の取得後に実行)
        const relatedRes = await fetch(`/api/posts/${id}/related`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedPosts(relatedData);
        }
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

  const { data: publicUrlData } = supabase.storage
    .from("cover-image")
    .getPublicUrl(post.coverImageKey);

  const coverImageUrl = publicUrlData.publicUrl;
  const safeHTML = DOMPurify.sanitize(post.content);

  return (
    <main className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold">{post.title}</h1>

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

      <div className="relative aspect-video w-full overflow-hidden rounded-xl">
        <Image
          src={coverImageUrl}
          alt={post.title}
          fill
          priority
          className="object-cover"
        />
      </div>

      <div
        className="border-b pb-12 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />

      {/* ▼ 関連記事セクションを追加 */}
      {relatedPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-6 text-xl font-bold">関連記事</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {relatedPosts.map((rPost) => {
              // 各関連記事の画像URLを取得
              const { data: rPublicUrlData } = supabase.storage
                .from("cover-image")
                .getPublicUrl(rPost.coverImageKey);

              return (
                <a
                  key={rPost.id}
                  href={`/posts/${rPost.id}`}
                  className="group block space-y-2"
                >
                  <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                    <Image
                      src={rPublicUrlData.publicUrl}
                      alt={rPost.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="line-clamp-2 text-sm font-bold group-hover:text-blue-600">
                    {rPost.title}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {dayjs(rPost.createdAt).format("YYYY/MM/DD")}
                  </p>
                </a>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
};

export default Page;
