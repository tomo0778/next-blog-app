"use client";

import type { Post } from "@/app/_types/Post";
import Link from "next/link";
import dayjs from "dayjs";
import DOMPurify from "isomorphic-dompurify";

type Props = {
  post: Post;
  linkTo?: string; // ← 追加（省略可）
};

const PostSummary: React.FC<Props> = ({ post, linkTo }) => {
  const formattedDate = dayjs(post.createdAt).format("YYYY/MM/DD");
  const safeHTML = DOMPurify.sanitize(post.content);

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
      {/* 投稿日 & カテゴリ */}
      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
        <span>投稿日: {formattedDate}</span>

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

      {/* タイトル + 本文 */}
      {linkTo ? (
        <Link href={linkTo} className="block hover:opacity-80">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
};

export default PostSummary;
