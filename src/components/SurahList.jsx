import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Sparkles, Filter, Search } from 'lucide-react';

export const SurahList = () => {
  const { surahs, openSurah, loading } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'meccan' | 'medinan'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      // Type filter
      if (filter === 'meccan' && !surah.is_meccan && surah.revelation_type !== 'Meccan') return false;
      if (filter === 'medinan' && (surah.is_meccan || surah.revelation_type === 'Meccan')) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const nameMatch = (surah.english_name || surah.name || '').toLowerCase().includes(q);
        const transMatch = (surah.english_meaning || surah.translation || '').toLowerCase().includes(q);
        const numMatch = String(surah.number) === q;
        const arabicMatch = (surah.arabic_name || '').includes(q);
        return nameMatch || transMatch || numMatch || arabicMatch;
      }
      return true;
    });
  }, [surahs, filter, searchQuery]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <Sparkles size={36} style={{ animation: 'pulse-glow 1.5s infinite', margin: '0 auto 12px' }} />
        <p>Loading the 114 Surahs...</p>
      </div>
    );
  }

  return (
    <section aria-label="114 Holy Quran Surahs">
      {/* Search & Filter Controls */}
      <div style={{ marginBottom: '14px' }}>
        <div className="search-input-wrap" style={{ marginBottom: '10px' }}>
          <Search size={18} color="var(--text-light)" />
          <input
            type="search"
            className="search-field"
            placeholder="Search by name, meaning, or number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter Surahs"
          />
        </div>

        {/* Horizontal filter chips */}
        <div className="chip-bar" role="tablist" aria-label="Filter Surahs by Revelation">
          <button
            className={`chip-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
            role="tab"
            aria-selected={filter === 'all'}
          >
            All (114)
          </button>
          <button
            className={`chip-btn ${filter === 'meccan' ? 'active' : ''}`}
            onClick={() => setFilter('meccan')}
            role="tab"
            aria-selected={filter === 'meccan'}
          >
            Meccan (Makki)
          </button>
          <button
            className={`chip-btn ${filter === 'medinan' ? 'active' : ''}`}
            onClick={() => setFilter('medinan')}
            role="tab"
            aria-selected={filter === 'medinan'}
          >
            Medinan (Madani)
          </button>
        </div>
      </div>

      {/* Surahs Count Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Showing {filteredSurahs.length} Surahs
        </span>
      </div>

      {/* Cards List */}
      <div className="cards-list" role="feed" aria-label="Surahs Feed">
        {filteredSurahs.map((surah) => {
          const isMakki = surah.is_meccan || surah.revelation_type === 'Meccan';
          return (
            <article
              key={surah.number}
              className="visual-card"
              onClick={() => openSurah(surah.number)}
              tabIndex="0"
              role="button"
              aria-label={`Open Surah ${surah.english_name || surah.name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openSurah(surah.number);
                }
              }}
            >
              <div className="visual-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="card-num-badge">
                    {surah.number}
                  </div>
                  <div>
                    <h3 className="card-title">
                      {surah.english_name || surah.name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {surah.english_meaning || surah.translation}
                    </p>
                  </div>
                </div>

                <div className="card-arabic-title">
                  {surah.arabic_name}
                </div>
              </div>

              <div className="card-meta-row">
                <span className="meta-pill">
                  {isMakki ? 'Makki' : 'Madani'}
                </span>
                <span className="meta-pill">
                  {surah.verse_count || surah.total_verses} Verses
                </span>
                {surah.revelation_order && (
                  <span className="meta-pill">
                    Order #{surah.revelation_order}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
