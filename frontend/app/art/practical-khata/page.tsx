'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { getPracticalKhata } from '@/lib/api';

interface PracticalKhataEntry {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

export default function PracticalKhataPage() {
  const { language } = useLanguage();
  const text = getCopy(language);
  const [entries, setEntries] = useState<PracticalKhataEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const data = await getPracticalKhata();
      setEntries(data);
    } catch (error) {
      console.error('Error fetching practical khata entries:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF8F0]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 font-display text-4xl text-rosewood">{text.art.practical_khata}</h1>
          <p className="mx-auto max-w-2xl text-lg text-stone-600">{text.art.practical_khata_desc}</p>
        </div>

        {loading && (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blush-500 border-t-rosewood" />
              <p className="text-stone-600">Loading practical khata entries...</p>
            </div>
          </div>
        )}

        {!loading && (
          <>
            {entries.length > 0 ? (
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="group overflow-hidden rounded-2xl border border-[#FADADD] bg-white shadow-sm transition-shadow hover:shadow-lg"
                  >
                    <div className="relative aspect-square overflow-hidden bg-gray-200">
                      <Image
                        src={entry.imageUrl}
                        alt={entry.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="mb-2 text-lg font-semibold text-rosewood">{entry.title}</h3>
                      <p className="line-clamp-3 text-sm text-stone-600">{entry.caption}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <p className="text-lg text-stone-600">No practical khata entries yet. Check back soon!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
