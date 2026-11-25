import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Sparkles, Search } from 'lucide-react';

export const SurahList = () => {
  const { surahs, openSurah, loading } = useApp();
  const [filter, setFilter] = useState('all'); // 'all' | 'meccan' | 'medinan'
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSurahs = useMemo(() => {
    return surahs.filter((surah) => {
      const rev = (surah.revelation || surah.revelation_type || '').toLowerCase();
      const isMakki = rev.includes('makk') || surah.is_meccan;

      // Type filter
      if (filter === 'meccan' && !isMakki) return false;
      if (filter === 'medinan' && isMakki) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const sId = String(surah.id || surah.number || '');
        const nameMatch = (surah.name || surah.name_ascii || surah.english_name || '').toLowerCase().includes(q);
        const transMatch = (surah.meaning || surah.english_meaning || surah.translation || '').toLowerCase().includes(q);
        const numMatch = sId === q;
        const arabicMatch = (surah.arabic || surah.arabic_name || '').includes(q);
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
            Meccan (82)
          </button>
          <button
            className={`chip-btn ${filter === 'medinan' ? 'active' : ''}`}
            onClick={() => setFilter('medinan')}
            role="tab"
            aria-selected={filter === 'medinan'}
          >
            Medinan (32)
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
          const sId = surah.id || surah.number;
          const rev = surah.revelation || (surah.is_meccan ? 'Makkan' : 'Madinan');
          const verses = surah.verses_count || surah.verse_count || surah.total_verses;

          return (
            <article
              key={sId}
              className="visual-card"
              onClick={() => openSurah(sId)}
              tabIndex="0"
              role="button"
              aria-label={`Open Surah ${surah.name || surah.english_name}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openSurah(sId);
                }
              }}
            >
              <div className="visual-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="card-num-badge">
                    {sId}
                  </div>
                  <div>
                    <h3 className="card-title">
                      {surah.name || surah.name_ascii || surah.english_name}
                    </h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {surah.meaning || surah.english_meaning || surah.translation}
                    </p>
                  </div>
                </div>

                <div className="card-arabic-title">
                  {surah.arabic || surah.arabic_name}
                </div>
              </div>

              <div className="card-meta-row">
                <span className="meta-pill">
                  {rev}
                </span>
                <span className="meta-pill">
                  {verses} Verses
                </span>
                {surah.stories_count !== undefined && surah.stories_count > 0 && (
                  <span className="meta-pill highlight">
                    📜 {surah.stories_count} Stories
                  </span>
                )}
                {surah.breakdowns_count !== undefined && (
                  <span className="meta-pill">
                    📖 {surah.breakdowns_count} Sections
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
