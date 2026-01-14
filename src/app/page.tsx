"use client";

import { useState, useEffect } from "react";
import type { Post } from "@/app/_types/Post";
import PostSummary from "@/app/_components/PostSummary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

const Page: React.FC = () => {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 🔽 自作APIから投稿一覧を取得
        const response = await fetch("/api/posts", {
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
      }
    };

    fetchPosts();
  }, []);

  if (fetchError) {
    return <div className="text-red-500">{fetchError}</div>;
  }

  if (!posts) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  return (
    <main>
      <div className="mb-2 text-2xl font-bold">Main</div>
      <div className="space-y-3">
        {posts.map((post) => (
          <PostSummary key={post.id} post={post} linkTo={`/posts/${post.id}`} />
        ))}
      </div>
    </main>
  );
};

export default Page;
