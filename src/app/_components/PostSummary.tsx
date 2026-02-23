"use client";

import { useState } from "react";
import type { Post } from "@/app/_types/Post";
import Link from "next/link";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";

type Props = {
  post: Post;
  linkTo?: string;
};

const PostSummary: React.FC<Props> = ({ post, linkTo }) => {
  const [likes, setLikes] = useState(post.likes);
  const [dislikes, setDislikes] = useState(post.dislikes);
  const [isLoading, setIsLoading] = useState(false);

  const formattedDate = dayjs(post.createdAt).format("YYYY/MM/DD");
  const safeHTML = DOMPurify.sanitize(post.content);

  const handleLike = async () => {
    setIsLoading(true);

    const res = await fetch(`/api/posts/${post.id}/like`, {
      method: "POST",
    });

    const data = await res.json();

    setLikes(data.likes);
    setDislikes(data.dislikes);

    setIsLoading(false);
  };

  const handleDislike = async () => {
    setIsLoading(true);

    const res = await fetch(`/api/posts/${post.id}/dislike`, {
      method: "POST",
    });

    const data = await res.json();

    setLikes(data.likes);
    setDislikes(data.dislikes);

    setIsLoading(false);
  };

  const content = (
    <>
      <div className="mb-1 text-lg font-bold">{post.title}</div>
      <div
        className="line-clamp-3 text-slate-800"
        dangerouslySetInnerHTML={{ __html: safeHTML }}
      />
    </>
  );

  return (
    <div className="space-y-3 border border-slate-400 p-4">
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>投稿日: {formattedDate}</span>

        {/* カテゴリ表示 */}
        <div className="flex gap-2">
          {post.categories.map((item) => (
            <span
              key={item.category.id}
              className="rounded bg-slate-200 px-2 py-0.5 text-xs"
            >
              {item.category.name}
            </span>
          ))}
        </div>
      </div>

      {linkTo ? (
        <Link href={linkTo} className="block hover:opacity-80">
          {content}
        </Link>
      ) : (
        content
      )}

      <div className="flex items-center justify-between pt-2 text-xs text-gray-600">
        <div className="flex gap-2">
          <button
            onClick={handleLike}
            disabled={isLoading}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            👍 {likes}
          </button>

          <button
            onClick={handleDislike}
            disabled={isLoading}
            className="flex items-center gap-1 rounded bg-gray-100 px-2 py-0.5 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            👎 {dislikes}
          </button>
        </div>

        <span>閲覧数 {post.views}</span>
      </div>
    </div>
  );
};

export default PostSummary;
