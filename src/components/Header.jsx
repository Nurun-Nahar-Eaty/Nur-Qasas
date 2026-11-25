import React from 'react';
import { useApp } from '../context/AppContext';
import { Search, Palette, Sparkles, BookOpen } from 'lucide-react';

export const Header = () => {
  const { setActiveTab, setIsSearchOpen, bookmarks, reflections } = useApp();
  
  // Calculate total reflections completed
  const totalReflections = Object.values(reflections).reduce((acc, curr) => acc + (curr?.length || 0), 0);

  return (
    <header className="app-header safe-top" role="banner">
      <div className="header-inner">
        <button
          className="header-brand"
          onClick={() => setActiveTab('surahs')}
          aria-label="Nur-Qasas Quran App Home"
        >
          {/* Animated 8-Pointed Rub el Hizb SVG */}
          <svg className="brand-icon" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <rect x="25" y="25" width="50" height="50" rx="8" stroke="currentColor" strokeWidth="6" fill="rgba(255,255,255,0.1)"/>
            <rect x="25" y="25" width="50" height="50" rx="8" stroke="currentColor" strokeWidth="6" fill="rgba(255,255,255,0.1)" transform="rotate(45 50 50)"/>
            <circle cx="50" cy="50" r="10" fill="currentColor"/>
          </svg>
          <div>
            <h1 className="brand-title">Nur-Qasas</h1>
            <p className="brand-subtitle">114 Surahs &amp; Visual Stories</p>
          </div>
        </button>

        <div className="header-actions">
          {totalReflections > 0 && (
            <button
              className="meta-pill highlight"
              style={{ border: 'none', cursor: 'pointer', padding: '6px 10px' }}
              onClick={() => setActiveTab('saved')}
              title={`${totalReflections} reflections completed`}
            >
              <Sparkles size={14} />
              <span>{totalReflections}</span>
            </button>
          )}

          <button
            className="header-btn"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open Search"
            title="Search Surahs, Verses, and Stories"
          >
            <Search size={18} />
          </button>

          <button
            className="header-btn"
            onClick={() => setActiveTab('theme')}
            aria-label="Theme Settings"
            title="Change Theme & Appearance"
          >
            <Palette size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
