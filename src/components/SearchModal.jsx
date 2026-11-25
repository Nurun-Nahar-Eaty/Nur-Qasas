import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, BookOpen, Compass, ArrowRight } from 'lucide-react';

export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, surahs, stories, openSurah, openStory } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsSearchOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsSearchOpen]);

  if (!isSearchOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingSurahs = q ? surahs.filter(s => {
    return (s.english_name || s.name || '').toLowerCase().includes(q) ||
           (s.english_meaning || s.translation || '').toLowerCase().includes(q) ||
           (s.arabic_name || '').includes(q) ||
           String(s.number) === q;
  }).slice(0, 5) : [];

  const matchingStories = q ? stories.filter(st => {
    return (st.title || '').toLowerCase().includes(q) ||
           (st.narrative || '').toLowerCase().includes(q) ||
           (st.lessons || '').toLowerCase().includes(q) ||
           (st.location || '').toLowerCase().includes(q);
  }).slice(0, 5) : [];

  return (
    <div className="modal-overlay" onClick={() => setIsSearchOpen(false)} role="dialog" aria-modal="true" aria-label="Search Quran & Stories">
      <div className="sheet-container" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '80vh' }}>
        <div className="sheet-header">
          <div className="search-input-wrap" style={{ flex: 1, margin: 0 }}>
            <Search size={18} color="var(--text-light)" />
            <input
              ref={inputRef}
              type="search"
              className="search-field"
              placeholder="Search all 114 Surahs & 44 Stories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search Query"
            />
          </div>
          <button
            className="sheet-close-btn"
            style={{ marginLeft: '10px' }}
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </div>

        <div className="sheet-body">
          {q ? (
            <>
              {/* Surah Matches */}
              <div style={{ marginBottom: '20px' }}>
                <span className="section-heading-pill">
                  <BookOpen size={14} />
                  <span>Surahs ({matchingSurahs.length})</span>
                </span>
                {matchingSurahs.length > 0 ? (
                  <div className="cards-list">
                    {matchingSurahs.map(s => (
                      <div
                        key={s.number}
                        className="visual-card"
                        style={{ padding: '12px 14px' }}
                        onClick={() => {
                          setIsSearchOpen(false);
                          openSurah(s.number);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span className="meta-pill" style={{ marginRight: '6px' }}>#{s.number}</span>
                            <strong>{s.english_name || s.name}</strong> ({s.english_meaning || s.translation})
                          </div>
                          <ArrowRight size={16} color="var(--accent-primary)" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No matching Surahs found.</p>
                )}
              </div>

              {/* Story Matches */}
              <div>
                <span className="section-heading-pill">
                  <Compass size={14} />
                  <span>Stories ({matchingStories.length})</span>
                </span>
                {matchingStories.length > 0 ? (
                  <div className="cards-list">
                    {matchingStories.map(st => (
                      <div
                        key={st.id}
                        className="visual-card"
                        style={{ padding: '12px 14px' }}
                        onClick={() => {
                          setIsSearchOpen(false);
                          openStory(st);
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span className="meta-pill highlight" style={{ marginRight: '6px' }}>{st.badge}</span>
                            <strong>{st.title}</strong>
                          </div>
                          <ArrowRight size={16} color="var(--accent-primary)" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No matching Stories found.</p>
                )}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              <p>Type to search across all 114 Surahs, Prophet stories, moral lessons, and verse themes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
