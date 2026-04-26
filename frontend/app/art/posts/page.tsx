'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { getApprovedArtPosts } from '@/lib/api';

interface UserArtPost {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function UserArtPostsPage() {
  const { language } = useLanguage();
  const text = getCopy(language);
  const [posts, setPosts] = useState<UserArtPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getApprovedArtPosts();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF8F0]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl text-rosewood mb-4">
            {text.art.posts}
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {text.art.posts_desc}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blush-500 border-t-rosewood mb-4" />
              <p className="text-stone-600">Loading posts...</p>
            </div>
          </div>
        )}

        {/* Posts Grid */}
        {!loading && (
          <>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[#FADADD] group"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-200">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"%3E%3Crect fill="%23E5E7EB" width="400" height="400"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239CA3AF" font-size="24" font-family="system-ui"%3EImage Error%3C/text%3E%3C/svg%3E';
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-rosewood mb-2">
                        {post.title}
                      </h3>
                      <p className="text-stone-600 text-sm line-clamp-3 mb-4">
                        {post.caption}
                      </p>

                      {/* Artist Info */}
                      <div className="border-t border-[#FADADD] pt-4">
                        <p className="text-xs text-stone-600">
                          <span className="font-medium text-stone-700">By: </span>
                          {post.user.name}
                        </p>
                        <p className="text-xs text-stone-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-stone-600 text-lg mb-6">
                  No user art posts yet. Be the first to share your creativity!
                </p>
                <Link
                  href="/art/post"
                  className="inline-block bg-rosewood text-white px-6 py-3 rounded-full font-medium transition hover:bg-[#58342f]"
                >
                  Post Your Art
                </Link>
              </div>
            )}
          </>
        )}

        {/* Back Links */}
        {!loading && posts.length > 0 && (
          <div className="mt-16 flex justify-center gap-4 flex-wrap">
            <Link
              href="/art/portfolio"
              className="text-stone-600 hover:text-rosewood font-medium transition"
            >
              ← View Portfolio
            </Link>
            <Link
              href="/art/post"
              className="text-stone-600 hover:text-rosewood font-medium transition"
            >
              Share Your Art →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
