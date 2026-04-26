'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { getArtPortfolio } from '@/lib/api';

interface PortfolioEntry {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export default function ArtPortfolioPage() {
  const { language } = useLanguage();
  const text = getCopy(language);
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const data = await getArtPortfolio();
      setPortfolio(data);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
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
            {text.art.portfolio}
          </h1>
          <p className="text-lg text-stone-600 max-w-2xl mx-auto">
            {text.art.portfolio_desc}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blush-500 border-t-rosewood mb-4" />
              <p className="text-stone-600">Loading portfolio...</p>
            </div>
          </div>
        )}

        {/* Portfolio Grid */}
        {!loading && (
          <>
            {portfolio.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {portfolio.map((entry) => (
                  <div
                    key={entry.id}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-[#FADADD] group"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-square overflow-hidden bg-gray-200">
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="font-semibold text-lg text-rosewood mb-2">
                        {entry.title}
                      </h3>
                      <p className="text-stone-600 text-sm line-clamp-3">
                        {entry.caption}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-stone-600 text-lg mb-6">
                  No portfolio entries yet. Check back soon!
                </p>
                <Link
                  href="/art/post"
                  className="inline-block bg-rosewood text-white px-6 py-3 rounded-full font-medium transition hover:bg-[#58342f]"
                >
                  Share Your Art
                </Link>
              </div>
            )}
          </>
        )}

        {/* Explore User Art */}
        {portfolio.length > 0 && (
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-semibold text-rosewood mb-4">
              {text.art.posts}
            </h2>
            <p className="text-stone-600 mb-6">
              {text.art.posts_desc}
            </p>
            <Link
              href="/art/posts"
              className="inline-block bg-stone-200 text-stone-800 px-6 py-3 rounded-full font-medium transition hover:bg-stone-300"
            >
              View Community Art
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
