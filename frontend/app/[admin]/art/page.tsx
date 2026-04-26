'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

import {
  getAdminArtPortfolio,
  createAdminArtPortfolio,
  updateAdminArtPortfolio,
  deleteAdminArtPortfolio,
  getAdminPracticalKhata,
  createAdminPracticalKhata,
  updateAdminPracticalKhata,
  deleteAdminPracticalKhata,
} from '@/lib/api';

interface ShowcaseEntry {
  id: string;
  title: string;
  caption: string;
  imageUrl: string;
  sortOrder: number;
  createdAt: string;
}

type TabKey = 'portfolio' | 'practicalKhata';

const emptyForm = {
  title: '',
  caption: '',
  imageUrl: '',
  sortOrder: 0,
};

export default function AdminArtPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('portfolio');

  const [portfolio, setPortfolio] = useState<ShowcaseEntry[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);
  const [portfolioForm, setPortfolioForm] = useState(emptyForm);
  const [editingPortfolio, setEditingPortfolio] = useState<string | null>(null);

  const [practicalKhata, setPracticalKhata] = useState<ShowcaseEntry[]>([]);
  const [practicalKhataLoading, setPracticalKhataLoading] = useState(true);
  const [practicalKhataForm, setPracticalKhataForm] = useState(emptyForm);
  const [editingPracticalKhata, setEditingPracticalKhata] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
    fetchPracticalKhata();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setPortfolioLoading(true);
      const response = await getAdminArtPortfolio();
      setPortfolio(response.portfolio);
    } catch (error) {
      console.error('Error fetching art portfolio:', error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const fetchPracticalKhata = async () => {
    try {
      setPracticalKhataLoading(true);
      const response = await getAdminPracticalKhata();
      setPracticalKhata(response.practicalKhata);
    } catch (error) {
      console.error('Error fetching practical khata:', error);
    } finally {
      setPracticalKhataLoading(false);
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

      setPortfolioForm(emptyForm);
      setEditingPortfolio(null);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error saving art portfolio entry:', error);
    }
  };

  const handlePracticalKhataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPracticalKhata) {
        await updateAdminPracticalKhata(editingPracticalKhata, practicalKhataForm);
      } else {
        await createAdminPracticalKhata(practicalKhataForm);
      }

      setPracticalKhataForm(emptyForm);
      setEditingPracticalKhata(null);
      await fetchPracticalKhata();
    } catch (error) {
      console.error('Error saving practical khata entry:', error);
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    if (!((globalThis as any).window?.confirm?.('Are you sure?') ?? true)) return;

    try {
      await deleteAdminArtPortfolio(id);
      await fetchPortfolio();
    } catch (error) {
      console.error('Error deleting art portfolio entry:', error);
    }
  };

  const handleDeletePracticalKhata = async (id: string) => {
    if (!((globalThis as any).window?.confirm?.('Are you sure?') ?? true)) return;

    try {
      await deleteAdminPracticalKhata(id);
      await fetchPracticalKhata();
    } catch (error) {
      console.error('Error deleting practical khata entry:', error);
    }
  };

  const renderEditor = (
    title: string,
    form: typeof emptyForm,
    onChange: (next: typeof emptyForm) => void,
    onSubmit: (e: React.FormEvent) => void,
    editingId: string | null,
    onCancel: () => void
  ) => {
    const mode = editingId ? 'Edit' : 'Add';

    return (
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">{mode} {title} Entry</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  onChange({ ...form, title: target.value });
                }}
                placeholder="Entry title"
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Sort Order</label>
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => {
                  const target = e.target as HTMLInputElement;
                  onChange({ ...form, sortOrder: Number.parseInt(target.value || '0', 10) || 0 });
                }}
                className="w-full rounded-lg border border-stone-300 px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => {
                const target = e.target as HTMLInputElement;
                onChange({ ...form, imageUrl: target.value });
              }}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Caption</label>
            <textarea
              value={form.caption}
              onChange={(e) => {
                const target = e.target as HTMLTextAreaElement;
                onChange({ ...form, caption: target.value });
              }}
              placeholder="Entry caption"
              rows={3}
              className="w-full rounded-lg border border-stone-300 px-3 py-2"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-rosewood px-6 py-2 font-medium text-white hover:bg-[#58342f]"
            >
              {mode} Entry
            </button>
            {editingId && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg bg-stone-300 px-6 py-2 font-medium text-stone-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    );
  };

  const renderList = (
    title: string,
    entries: ShowcaseEntry[],
    loading: boolean,
    onEdit: (entry: ShowcaseEntry) => void,
    onDelete: (id: string) => void,
    emptyLabel: string
  ) => (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 text-xl font-semibold">{title} Entries</h2>
      {loading ? (
        <p className="text-stone-600">Loading...</p>
      ) : entries.length > 0 ? (
        <div className="grid gap-4">
          {entries.map((entry) => (
            <div key={entry.id} className="flex gap-4 rounded-lg border border-stone-200 p-4">
              {entry.imageUrl && (
                <div className="relative h-24 w-24 flex-shrink-0">
                  <Image
                    src={entry.imageUrl}
                    alt={entry.title}
                    fill
                    className="rounded object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold">{entry.title}</h3>
                <p className="line-clamp-2 text-sm text-stone-600">{entry.caption}</p>
                <p className="mt-1 text-xs text-stone-500">Sort: {entry.sortOrder}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(entry)}
                  className="rounded bg-blue-500 px-3 py-1 text-sm text-white"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(entry.id)}
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-stone-600">{emptyLabel}</p>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl p-8">
      <h1 className="mb-8 text-3xl font-bold text-rosewood">Showcase Management</h1>

      <div className="mb-8 flex gap-4">
        <button
          onClick={() => setActiveTab('portfolio')}
          className={`rounded-lg px-6 py-2 font-medium transition ${
            activeTab === 'portfolio'
              ? 'bg-rosewood text-white'
              : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
          }`}
        >
          Art Portfolio ({portfolio.length})
        </button>
        <button
          onClick={() => setActiveTab('practicalKhata')}
          className={`rounded-lg px-6 py-2 font-medium transition ${
            activeTab === 'practicalKhata'
              ? 'bg-rosewood text-white'
              : 'bg-stone-200 text-stone-800 hover:bg-stone-300'
          }`}
        >
          Practical Khata ({practicalKhata.length})
        </button>
      </div>

      {activeTab === 'portfolio' && (
        <div className="space-y-8">
          {renderEditor(
            'Art Portfolio',
            portfolioForm,
            setPortfolioForm,
            handlePortfolioSubmit,
            editingPortfolio,
            () => {
              setEditingPortfolio(null);
              setPortfolioForm(emptyForm);
            }
          )}
          {renderList(
            'Art Portfolio',
            portfolio,
            portfolioLoading,
            (entry) => {
              setEditingPortfolio(entry.id);
              setPortfolioForm({
                title: entry.title,
                caption: entry.caption,
                imageUrl: entry.imageUrl,
                sortOrder: entry.sortOrder,
              });
            },
            handleDeletePortfolio,
            'No art portfolio entries yet.'
          )}
        </div>
      )}

      {activeTab === 'practicalKhata' && (
        <div className="space-y-8">
          {renderEditor(
            'Practical Khata',
            practicalKhataForm,
            setPracticalKhataForm,
            handlePracticalKhataSubmit,
            editingPracticalKhata,
            () => {
              setEditingPracticalKhata(null);
              setPracticalKhataForm(emptyForm);
            }
          )}
          {renderList(
            'Practical Khata',
            practicalKhata,
            practicalKhataLoading,
            (entry) => {
              setEditingPracticalKhata(entry.id);
              setPracticalKhataForm({
                title: entry.title,
                caption: entry.caption,
                imageUrl: entry.imageUrl,
                sortOrder: entry.sortOrder,
              });
            },
            handleDeletePracticalKhata,
            'No practical khata entries yet.'
          )}
        </div>
      )}
    </div>
  );
}
