import React from 'react';
import { useApp } from '../context/AppContext';
import { Palette, Check } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, changeTheme } = useApp();

  const themes = [
    {
      id: 'midnight',
      name: 'Midnight Blue',
      desc: 'Deep indigo & celestial gold, optimized for night reading',
      bg: '#080D1A',
      card: '#0F172A',
      accent: '#38BDF8',
      gold: '#FBBF24',
      badge: 'Popular'
    },
    {
      id: 'emerald-light',
      name: 'Emerald Oasis',
      desc: 'Classic Islamic emerald green on crisp paper white',
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#059669',
      gold: '#D97706',
      badge: 'Light'
    },
    {
      id: 'dark',
      name: 'Obsidian Dark',
      desc: 'Pure contrast dark mode for OLED screens',
      bg: '#090D16',
      card: '#121826',
      accent: '#10B981',
      gold: '#F59E0B',
      badge: 'OLED'
    },
    {
      id: 'sepia',
      name: 'Desert Sand',
      desc: 'Warm ancient parchment tones for comfortable reading',
      bg: '#FAF6F0',
      card: '#FFFDF9',
      accent: '#B45309',
      gold: '#D97706',
      badge: 'Warm'
    }
  ];

  return (
    <section aria-label="Visual Themes & Appearance">
      <div className="story-hero-banner" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
          Visual Theme &amp; Atmosphere
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Choose a palette tailored for your eyes. All themes meet Section 508 and WCAG AA contrast standards.
        </p>
      </div>

      <div className="theme-grid" role="radiogroup" aria-label="Select Color Theme">
        {themes.map((t) => {
          const isSelected = theme === t.id;
          return (
            <div
              key={t.id}
              className={`theme-card ${isSelected ? 'active' : ''}`}
              onClick={() => changeTheme(t.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex="0"
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  changeTheme(t.id);
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="meta-pill highlight" style={{ fontSize: '0.72rem' }}>
                  {t.badge}
                </span>
                {isSelected && <Check size={18} color="var(--accent-gold)" />}
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                  {t.name}
                </h3>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {t.desc}
                </p>
              </div>

              {/* Color dots preview */}
              <div className="theme-preview-dots">
                <span className="preview-dot" style={{ background: t.bg, border: '1px solid rgba(0,0,0,0.1)' }} />
                <span className="preview-dot" style={{ background: t.card, border: '1px solid rgba(0,0,0,0.1)' }} />
                <span className="preview-dot" style={{ background: t.accent }} />
                <span className="preview-dot" style={{ background: t.gold }} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
