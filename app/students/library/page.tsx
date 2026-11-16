// app/student/library/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Library,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  BookOpen,
  Heart,
  Bookmark,
  User,
  TrendingUp,
  Star,
  FileText,
  ChevronLeft,
  Filter,
} from 'lucide-react';
import { studentLibraryAPI } from '@/lib/api/student-portal';
import type { LibraryData, Book } from '@/types/student-portal';
import {
  formatNumber,
} from '@/lib/utils/student-helpers';

type TabType = 'all' | 'favorites' | 'recent';

export default function LibraryPage() {
  const [data, setData] = useState<LibraryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [togglingFav, setTogglingFav] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentLibraryAPI.getLibrary();
      setData(res);
    } catch (err: unknown) {
      console.error(err);
      let message = 'خطا در دریافت کتابخانه';
      if (err && typeof err === 'object' && 'response' in err) {
        const e = err as { response?: { data?: { message?: string } }; message?: string };
        message = e.response?.data?.message || e.message || message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Debounced search
  useEffect(() => {
    if (!search || search.length < 2) {
      setSearchResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await studentLibraryAPI.search(search);
        setSearchResults(res);
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const handleToggleFavorite = async (bookId: number) => {
    try {
      setTogglingFav(bookId);
      const res = await studentLibraryAPI.toggleFavorite(bookId);
      // Update local state
      if (data) {
        setData({
          ...data,
          books: data.books.map((b) =>
            b.id === bookId ? { ...b, isFavorite: res.isFavorite } : b
          ),
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTogglingFav(null);
    }
  };

  // Determine which list to show
  let displayBooks: Book[] = [];
  if (searchResults !== null) {
    displayBooks = searchResults;
  } else if (tab === 'all') {
    displayBooks = data?.books || [];
  } else if (tab === 'favorites') {
    displayBooks = data?.favorites || [];
  } else if (tab === 'recent') {
    displayBooks = data?.recentReads || [];
  }

  // Filter by category
  if (categoryFilter && searchResults === null) {
    displayBooks = displayBooks.filter(
      (b) => String(b.categoryId) === categoryFilter
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Library className="text-indigo-500" size={26} />
            کتابخانه دیجیتال
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            کتاب‌ها، جزوه‌ها و منابع آموزشی
          </p>
        </div>
        <button
          onClick={fetchData}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          بروزرسانی
        </button>
      </div>

      {/* Stats */}
      {data && !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen size={16} className="text-indigo-600" />
              <p className="text-xs text-gray-600">کل کتاب‌ها</p>
            </div>
            <p className="text-2xl font-bold text-indigo-600">
              {formatNumber(data.books.length)}
            </p>
          </div>
          <div className="bg-pink-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Heart size={16} className="text-pink-600" />
              <p className="text-xs text-gray-600">علاقه‌مندی</p>
            </div>
            <p className="text-2xl font-bold text-pink-600">
              {formatNumber(data.favorites.length)}
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={16} className="text-emerald-600" />
              <p className="text-xs text-gray-600">مطالعه اخیر</p>
            </div>
            <p className="text-2xl font-bold text-emerald-600">
              {formatNumber(data.recentReads.length)}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Filter size={16} className="text-amber-600" />
              <p className="text-xs text-gray-600">دسته‌ها</p>
            </div>
            <p className="text-2xl font-bold text-amber-600">
              {formatNumber(data.categories.length)}
            </p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="جستجوی کتاب، نویسنده یا موضوع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searching && (
            <Loader2
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 animate-spin"
            />
          )}
        </div>
        {searchResults !== null && (
          <button
            onClick={() => setSearch('')}
            className="mt-2 text-xs text-gray-500 hover:text-gray-700"
          >
            ← بازگشت به کتابخانه
          </button>
        )}
      </div>

      {/* Tabs (hidden when searching) */}
      {searchResults === null && (
        <div className="bg-white rounded-xl shadow-sm p-2 flex gap-1">
          <button
            onClick={() => setTab('all')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === 'all'
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <BookOpen size={16} />
            همه کتاب‌ها
          </button>
          <button
            onClick={() => setTab('favorites')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === 'favorites'
                ? 'bg-pink-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Heart size={16} />
            علاقه‌مندی
          </button>
          <button
            onClick={() => setTab('recent')}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              tab === 'recent'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <TrendingUp size={16} />
            اخیر
          </button>
        </div>
      )}

      {/* Categories (hidden when searching) */}
      {searchResults === null && data && data.categories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4">
          <p className="text-xs text-gray-500 mb-3">فیلتر بر اساس دسته</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                categoryFilter === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              همه
            </button>
            {data.categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(String(cat.id))}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                  categoryFilter === String(cat.id)
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={
                  categoryFilter === String(cat.id)
                    ? { backgroundColor: cat.color }
                    : {}
                }
              >
                <span>{cat.icon}</span>
                {cat.name}
                <span className="text-xs opacity-70">({cat.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Books grid */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="animate-spin text-indigo-500 mx-auto" size={32} />
          <p className="mt-3 text-gray-500 text-sm">
            در حال بارگذاری کتاب‌ها...
          </p>
        </div>
      ) : displayBooks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <BookOpen className="mx-auto text-gray-300" size={64} />
          <p className="mt-4 text-gray-500">
            {searchResults !== null
              ? 'کتابی با این جستجو یافت نشد'
              : tab === 'favorites'
              ? 'هنوز کتابی را به علاقه‌مندی‌ها اضافه نکرده‌اید'
              : tab === 'recent'
              ? 'هنوز کتابی را مطالعه نکرده‌اید'
              : 'هنوز کتابی در کتابخانه موجود نیست'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onToggleFavorite={() => handleToggleFavorite(book.id)}
              toggling={togglingFav === book.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function BookCard({
  book,
  onToggleFavorite,
  toggling,
}: {
  book: Book;
  onToggleFavorite: () => void;
  toggling: boolean;
}) {
  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
      {/* Cover */}
      <div className="relative aspect-[3/4] bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden">
        {book.coverImage ? (
          <img
            src={book.coverImage}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white">
            <BookOpen size={48} />
          </div>
        )}

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite();
          }}
          disabled={toggling}
          className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur transition-colors ${
            book.isFavorite
              ? 'bg-pink-500 text-white'
              : 'bg-white/80 text-gray-600 hover:bg-white'
          } disabled:opacity-50`}
          title={book.isFavorite ? 'حذف از علاقه‌مندی' : 'افزودن به علاقه‌مندی'}
        >
          {toggling ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Heart
              size={14}
              fill={book.isFavorite ? 'currentColor' : 'none'}
            />
          )}
        </button>

        {/* Reading progress */}
        {book.readingProgress !== undefined && book.readingProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-yellow-400"
              style={{ width: `${book.readingProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex-1 flex flex-col">
        <Link
          href={`/student/library/${book.id}`}
          className="text-sm font-bold text-gray-900 line-clamp-2 group-hover:text-indigo-600 mb-1"
        >
          {book.title}
        </Link>
        <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
          <User size={10} />
          {book.author}
        </p>

        {book.category && (
          <span className="inline-flex self-start items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs mb-2">
            {book.category}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
          {book.pages > 0 && <span>{book.pages} صفحه</span>}
          {book.fileFormat && (
            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded">
              {book.fileFormat}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}