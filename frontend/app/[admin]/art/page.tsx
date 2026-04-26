'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
  getAdminArtPortfolio,
  createAdminArtPortfolio,
  updateAdminArtPortfolio,
  deleteAdminArtPortfolio,
  getAdminArtPosts,
  updateAdminArtPostStatus,
  deleteAdminArtPost
} from '@/lib/api';
import { useLanguage } from '@/lib/language-context';
import { getCopy } from '@/lib/i18n';

interface PortfolioEntry {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

interface ArtPost {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function AdminArtPage() {
  const { language } = useLanguage();
  const text = getCopy(language);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'posts'>('portfolio');

  // Portfolio state
  const [portfolio, setPortfolio] = useState<PortfolioEntry[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioForm, setPortfolioForm] = useState({
    title: '',
    caption: '',
    imageUrl: '',
    sortOrder: 0,
  });
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);

  // Posts state
  const [posts, setPosts] = useState<ArtPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
    fetchPosts();
  }, []);

  // Portfolio Functions
  const fetchPortfolio = async () => {
    try {
      setPortfolioLoading(true);
      const response = await getAdminArtPortfolio();
      setPortfolio(response.portfolio);
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handlePortfolioSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPortfolio) {
        await updateAdminArtPortfolio(editingPortfolio, portfolioForm);
      } else {
        await createAdminArtPortfolio(portfolioForm);
      }

      setPortfolioForm({ title: '', caption: '', imageUrl: '', sortOrder: 0 });
      setEditingPortfolio(null);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error saving portfolio:', error);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    // Use globalThis to get window
    if (!((globalThis as any).window?.confirm?.('Are you sure?') ?? true)) return;

    try {
      await deleteAdminArtPortfolio(id);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
    }
  };

  // Posts Functions
  const fetchPosts = async () => {
    try {
      setPostsLoading(true);
      const response = await getAdminArtPosts();
      setPosts(response.posts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleUpdatePostStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await updateAdminArtPostStatus(id, status);
      await fetchPosts();
    } catch (error) {
      console.error('Error updating post status:', error);
    }
  };

  const handleDeletePost = async (id: string) => {
    // Use globalThis to get window
    if (!((globalThis as any).window?.confirm?.('Are you sure?') ?? true)) return;

    try {
      await deleteAdminArtPost(id);
      await fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-rosewood mb-8">Art Management</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'portfolio'
              ? 'bg-rosewood text-white'
              : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
          }`}
        >
          Portfolio ({portfolio.length})
        </button>
        <button
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-2 rounded-lg font-medium transition ${
            activeTab === 'posts'
              ? 'bg-rosewood text-white'
              : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
          }`}
        >
          User Posts ({posts.length})
        </button>
      </div>

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-8">
          {/* Add/Edit Portfolio Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingPortfolio ? 'Edit' : 'Add'} Portfolio Entry
            </h2>
            <form onSubmit={handlePortfolioSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={portfolioForm.title}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      setPortfolioForm(prev => ({ ...prev, title: target.value }))
                    }}
                    placeholder="Portfolio title"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Sort Order</label>
                  <input
                    type="number"
                    value={portfolioForm.sortOrder}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      setPortfolioForm(prev => ({
                        ...prev,
                        sortOrder: parseInt(target.value),
                      }))
                    }}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="url"
                  value={portfolioForm.imageUrl}
                    onChange={(e) => {
                      const target = e.target as HTMLInputElement;
                      setPortfolioForm(prev => ({ ...prev, imageUrl: target.value }))
                    }}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Caption</label>
                <textarea
                  value={portfolioForm.caption}
                    onChange={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      setPortfolioForm(prev => ({ ...prev, caption: target.value }))
                    }}
                  placeholder="Portfolio caption"
                  rows={3}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-rosewood text-white px-6 py-2 rounded-lg font-medium hover:bg-[#58342f]"
                >
                  {editingPortfolio ? 'Update' : 'Add'} Entry
                </button>
                {editingPortfolio && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPortfolio(null);
                      setPortfolioForm({ title: '', caption: '', imageUrl: '', sortOrder: 0 });
                    }}
                    className="bg-stone-300 text-stone-800 px-6 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Portfolio List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Portfolio Entries</h2>
            {portfolioLoading ? (
              <p className="text-stone-600">Loading...</p>
            ) : portfolio.length > 0 ? (
              <div className="grid gap-4">
                {portfolio.map((entry) => (
                  <div
                    key={entry.id}
                    className="border border-stone-200 rounded-lg p-4 flex gap-4"
                  >
                    {entry.imageUrl && (
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={entry.imageUrl}
                          alt={entry.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold">{entry.title}</h3>
                      <p className="text-sm text-stone-600 line-clamp-2">
                        {entry.caption}
                      </p>
                      <p className="text-xs text-stone-500 mt-1">
                        Sort: {entry.sortOrder}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingPortfolio(entry.id);
                          setPortfolioForm({
                            title: entry.title,
                            caption: entry.caption,
                            imageUrl: entry.imageUrl,
                            sortOrder: entry.sortOrder,
                          });
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeletePortfolio(entry.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-stone-600">No portfolio entries yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {postsLoading ? (
            <p className="text-stone-600">Loading...</p>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg shadow p-6 border border-stone-200"
              >
                <div className="flex gap-6 mb-4">
                  {post.imageUrl && (
                    <div className="relative w-32 h-32 flex-shrink-0">
                      <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-stone-600 line-clamp-2">{post.caption}</p>
                    <div className="mt-3 text-sm text-stone-600">
                      <p>
                        <strong>By:</strong> {post.user.name} ({post.user.email})
                      </p>
                      <p>
                        <strong>Submitted:</strong>{' '}
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-sm font-semibold px-3 py-1 rounded-full block mb-4 ${
                        post.status === 'APPROVED'
                          ? 'bg-green-100 text-green-700'
                          : post.status === 'REJECTED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  {post.status !== 'APPROVED' && (
                    <button
                      onClick={() => handleUpdatePostStatus(post.id, 'APPROVED')}
                      className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600"
                    >
                      Approve
                    </button>
                  )}
                  {post.status !== 'REJECTED' && (
                    <button
                      onClick={() => handleUpdatePostStatus(post.id, 'REJECTED')}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-stone-600">No user posts yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
