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
  likes: number;
  dislikes: number;
  views: number;
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
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [views, setViews] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [commentText, setCommentText] = useState("");

  const { id } = useParams() as { id: string };

  const handleLike = async () => {
    const res = await fetch(`/api/posts/${id}/like`, {
      method: "POST",
    });

    const data = await res.json();
    setLikes(data.likes);
    setDislikes(data.dislikes);
  };

  const handleDislike = async () => {
    const res = await fetch(`/api/posts/${id}/dislike`, {
      method: "POST",
    });

    const data = await res.json();
    setLikes(data.likes);
    setDislikes(data.dislikes);
  };

  const handleCommentSubmit = async () => {
    if (!name || !commentText) return;

    const res = await fetch(`/api/posts/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        content: commentText,
      }),
    });

    const newComment = await res.json();

    setComments([newComment, ...comments]);
    setName("");
    setCommentText("");
  };

  const convertYoutubeLinks = (html: string) => {
    const youtubeRegex = /https?:\/\/(www\.)?youtube\.com\/watch\?v=([\w-]+)/g;

    return html.replace(youtubeRegex, (_, __, videoId) => {
      return `
      <div class="aspect-video my-4">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allowfullscreen
          class="w-full h-full rounded-lg"
        ></iframe>
      </div>
    `;
    });
  };

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

        setLikes(data.likes);
        setDislikes(data.dislikes);

        // 閲覧数カウント
        const viewRes = await fetch(`/api/posts/${id}/view`, {
          method: "POST",
        });

        const viewData = await viewRes.json();
        setViews(viewData.views);

        // 2. 関連記事を取得 (メイン記事の取得後に実行)
        const relatedRes = await fetch(`/api/posts/${id}/related`);
        if (relatedRes.ok) {
          const relatedData = await relatedRes.json();
          setRelatedPosts(relatedData);
        }

        const commentRes = await fetch(`/api/posts/${id}/comments`);
        const commentData = await commentRes.json();
        setComments(commentData);
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
  const safeHTML = DOMPurify.sanitize(convertYoutubeLinks(post.content), {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: ["allow", "allowfullscreen", "frameborder", "scrolling"],
  });

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
        <div className="flex items-center gap-4 pt-2 text-sm">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700 hover:bg-gray-200"
          >
            👍 {likes}
          </button>

          <button
            onClick={handleDislike}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-sm text-gray-700 hover:bg-gray-200"
          >
            👎 {dislikes}
          </button>

          <span className="text-gray-500">閲覧数 {views}</span>
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

      {/* 関連記事セクション */}
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

      {/* コメントセクション */}
      <section className="mt-12 space-y-4">
        <h2 className="text-xl font-bold">コメント</h2>

        {/* フォーム */}
        <div className="space-y-2">
          <input
            type="text"
            placeholder="名前"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-2 py-1"
          />

          <textarea
            placeholder="コメントを書く"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full rounded border px-2 py-1"
          />

          <button
            onClick={handleCommentSubmit}
            className="rounded bg-slate-700 px-4 py-1 text-white"
          >
            投稿する
          </button>
        </div>

        {/* 一覧 */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded border p-3">
              <div className="text-sm font-bold">{comment.name}</div>
              <div className="text-xs text-slate-500">
                {dayjs(comment.createdAt).format("YYYY/MM/DD HH:mm")}
              </div>
              <p className="mt-1 text-sm">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};

export default Page;
