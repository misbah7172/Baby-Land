'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { useAuth } from '@/lib/auth-context';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';
import { submitArtPost, getMyArtPosts } from '@/lib/api';

interface ArtPost {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function PostArtPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { language } = useLanguage();
  const text = getCopy(language);

  const [formData, setFormData] = useState({
    title: '',
    caption: '',
    imageUrl: '',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [myPosts, setMyPosts] = useState<ArtPost[]>([]);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchMyPosts();
    }
  }, [user, authLoading, router]);

  const fetchMyPosts = async () => {
    try {
      setFetchingPosts(true);
      const data = await getMyArtPosts();
      setMyPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setFetchingPosts(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setFormData(prev => ({ ...prev, imageUrl: url }));
    if (url.startsWith('http')) {
      setPreview(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.title.trim() || !formData.caption.trim() || !formData.imageUrl.trim()) {
      setError('All fields are required');
      return;
    }

    // For now, accept data URLs and http(s) URLs
    if (!formData.imageUrl.startsWith('http') && !formData.imageUrl.startsWith('data:')) {
      setError('Please provide a valid image URL or upload an image');
      return;
    }

    try {
      setLoading(true);

      // If it's a data URL, we need to upload it first
      let finalImageUrl = formData.imageUrl;
      if (formData.imageUrl.startsWith('data:')) {
        // For now, we'll just use the data URL directly
        // In production, you'd want to upload this to a service like Firebase or S3
        finalImageUrl = formData.imageUrl;
      }

      const response = await submitArtPost({
        title: formData.title,
        caption: formData.caption,
        imageUrl: finalImageUrl,
      });

      setSuccess(true);
      setFormData({ title: '', caption: '', imageUrl: '' });
      setPreview(null);

      // Refresh posts
      setTimeout(() => {
        fetchMyPosts();
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit art');
      console.error('Error submitting art:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blush-500 border-t-rosewood mb-4" />
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#FFF8F0]">
      <div className="mx-auto max-w-4xl px-4 py-12 md:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-display text-4xl text-rosewood mb-4">
            {text.art.post_art}
          </h1>
          <p className="text-lg text-stone-600">
            Share your creative art with our community
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#FADADD] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Image Preview */}
              {preview && (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                    onError={() => setPreview(null)}
                  />
                </div>
              )}

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">
                  {text.art.image}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-stone-600
                    file:rounded-full file:border-0
                    file:bg-rosewood file:text-white
                    file:px-4 file:py-2 file:cursor-pointer
                    file:font-medium hover:file:bg-[#58342f]"
                />
                <p className="text-xs text-stone-500 mt-2">
                  or enter an image URL below
                </p>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-stone-700 mb-2">
                  {text.art.image} URL
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={formData.imageUrl}
                  onChange={handleImageUrl}
                  className="w-full px-4 py-2 border border-[#FADADD] rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood"
                />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-stone-700 mb-2">
                  {text.art.title}
                </label>
                <input
                  id="title"
                  type="text"
                  placeholder="Give your art a title"
                  maxLength={200}
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-[#FADADD] rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {formData.title.length}/200
                </p>
              </div>

              {/* Caption */}
              <div>
                <label htmlFor="caption" className="block text-sm font-medium text-stone-700 mb-2">
                  {text.art.caption}
                </label>
                <textarea
                  id="caption"
                  placeholder="Describe your art"
                  maxLength={1000}
                  rows={4}
                  value={formData.caption}
                  onChange={(e) => setFormData(prev => ({ ...prev, caption: e.target.value }))}
                  className="w-full px-4 py-2 border border-[#FADADD] rounded-lg focus:outline-none focus:ring-2 focus:ring-rosewood resize-none"
                />
                <p className="text-xs text-stone-500 mt-1">
                  {formData.caption.length}/1000
                </p>
              </div>

              {/* Messages */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
                  Art submitted successfully! Awaiting admin approval.
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rosewood text-white font-medium py-3 rounded-full transition disabled:opacity-50 hover:bg-[#58342f]"
              >
                {loading ? 'Submitting...' : text.art.submit}
              </button>
            </form>
          </div>

          {/* My Posts */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#FADADD] p-8">
            <h2 className="text-2xl font-semibold text-rosewood mb-6">
              {text.art.my_posts}
            </h2>

            {fetchingPosts ? (
              <div className="text-center py-8">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-3 border-blush-500 border-t-rosewood mb-2" />
                <p className="text-stone-600 text-sm">Loading posts...</p>
              </div>
            ) : myPosts.length > 0 ? (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {myPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border border-[#FADADD] rounded-lg p-4 hover:bg-[#FFF8F0] transition"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-stone-900 truncate">
                          {post.title}
                        </h3>
                        <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                          {post.caption}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                          post.status === 'APPROVED'
                            ? 'bg-green-100 text-green-700'
                            : post.status === 'REJECTED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {text.art[`${post.status.toLowerCase()}_approval` as keyof typeof text.art] ||
                          post.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-2">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-stone-600 text-sm">
                  You haven't posted any art yet. Get started above!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
