import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Palette, Check, Download, Smartphone } from 'lucide-react';

export const ThemeSelector = () => {
  const { theme, changeTheme } = useApp();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice && choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert("Install Nur-Qasas on your phone/tablet:\n\n• On iOS (Safari): Tap Share (⎋) at the bottom, then tap 'Add to Home Screen' (⊞).\n• On Android (Chrome): Tap browser menu (⋮) at top-right, then tap 'Install app' or 'Add to Home screen'.");
    }
  };

  const themes = [
    {
      id: 'emerald-light',
      name: 'Emerald Light',
      desc: 'Classic Islamic emerald green on crisp warm paper',
      bg: '#FBF9F5',
      card: '#FFFFFF',
      accent: '#0F766E',
      gold: '#D97706',
      badge: 'Classic'
    },
    {
      id: 'midnight',
      name: 'Midnight Blue',
      desc: 'Deep indigo & celestial gold, optimized for night reading',
      bg: '#080D1A',
      card: '#0F172A',
      accent: '#38BDF8',
      gold: '#F59E0B',
      badge: 'Popular'
    },
    {
      id: 'dark',
      name: 'Forest Dark',
      desc: 'Deep green-tinted dark mode with emerald accents',
      bg: '#060E0C',
      card: '#0D1E19',
      accent: '#10B981',
      gold: '#FBBF24',
      badge: 'Dark'
    },
    {
      id: 'sepia',
      name: 'Desert Sand',
      desc: 'Warm ancient parchment tones for comfortable reading',
      bg: '#F4EEE1',
      card: '#FDFAF2',
      accent: '#9A3412',
      gold: '#B45309',
      badge: 'Sepia'
    }
  ];

  return (
    <section aria-label="Visual Themes & Appearance">
      <div className="story-hero-banner" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
          Visual Theme &amp; Atmosphere
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
          Choose your reading atmosphere. All palettes meet Section 508 and WCAG AA contrast standards.
        </p>
      </div>

      <div className="theme-grid" role="radiogroup" aria-label="Select Color Theme">
        {themes.map((t) => {
          const isSelected = theme === t.id || (t.id === 'emerald-light' && theme === 'light') || (t.id === 'dark' && theme === 'forest-dark');
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

      {/* PWA Mobile Installation Card */}
      <div className="visual-card" style={{ marginTop: '20px', cursor: 'default' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Smartphone size={20} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
            Install as Mobile App (PWA)
          </h3>
        </div>
        <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '14px' }}>
          {isInstalled 
            ? '✓ Nur-Qasas is installed on this device. You can enjoy full offline access to all 114 Surahs and 44 visual story timelines.'
            : 'Install Nur-Qasas on your phone or tablet home screen for full offline access, instant loading, and fullscreen reading without browser bars.'}
        </p>

        {!isInstalled && (
          <button
            className="chip-btn active"
            onClick={handleInstall}
            style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
          >
            <Download size={16} />
            <span>Install Nur-Qasas on Home Screen</span>
          </button>
        )}
      </div>
    </section>
  );
};
