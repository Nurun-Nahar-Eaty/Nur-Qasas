import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { X, BookOpen, Compass, Info, Sparkles, Share2, ArrowRight } from 'lucide-react';

export const SurahDetailModal = () => {
  const { 
    selectedSurah, 
    selectedSurahDetails, 
    surahDetailsLoading, 
    closeSurah, 
    openStory,
    stories 
  } = useApp();

  const [activeTab, setActiveTab] = useState('verses'); // 'verses' | 'stories' | 'name' | 'insights'
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeSurah();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeSurah]);

  if (!selectedSurah) return null;

  const surahId = selectedSurah.id || selectedSurah.number;
  const surahName = selectedSurah.name || selectedSurah.english_name;
  const surahMeaning = selectedSurah.meaning || selectedSurah.english_meaning || selectedSurah.translation;
  const surahArabic = selectedSurah.arabic || selectedSurah.arabic_name;
  const surahVersesCount = selectedSurah.verses_count || selectedSurah.verse_count || selectedSurah.total_verses;
  const surahRev = selectedSurah.revelation || (selectedSurah.is_meccan ? 'Makkan' : 'Madinan');

  const handleShare = async () => {
    const title = `Surah ${surahName} (${surahId})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Explore Surah ${surahName} verse breakdown, stories, and deep insights`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${title} - ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  // Combine stories_in_surah from detail file with any matching stories from global list
  const detailStories = selectedSurahDetails?.stories_in_surah || [];
  const globalMatchingStories = stories.filter(st => 
    st.referenced_surahs && st.referenced_surahs.includes(surahId)
  );

  // De-duplicate stories
  const combinedStoryMap = new Map();
  detailStories.forEach(s => {
    if (s.id) combinedStoryMap.set(s.id, s);
  });
  globalMatchingStories.forEach(s => {
    if (s.id && !combinedStoryMap.has(s.id)) {
      combinedStoryMap.set(s.id, {
        id: s.id,
        title: s.title,
        arabic_name: s.arabic_name,
        badge: s.badge || s.category_label,
        category: s.category,
        snippet: s.narrative?.slice(0, 160) + '...',
        location: s.location,
        timeline_steps: s.timeline_steps
      });
    }
  });
  const allSurahStories = Array.from(combinedStoryMap.values());

  const verseBreakdowns = selectedSurahDetails?.verse_breakdowns || selectedSurahDetails?.verse_breakdown || [];
  const deepDives = selectedSurahDetails?.deep_dives || [];
  const nameOrigin = selectedSurahDetails?.name_origin || selectedSurah.name_origin || '';
  const coreTheme = selectedSurahDetails?.core_theme || selectedSurah.core_theme || selectedSurah.theme || '';
  const revDetails = selectedSurahDetails?.revelation_details || selectedSurahDetails?.revelation_context || selectedSurah.revelation_details || '';

  return (
    <div className="modal-overlay" onClick={closeSurah} role="dialog" aria-modal="true" aria-labelledby="surah-modal-title">
      <div 
        className="sheet-container" 
        onClick={(e) => e.stopPropagation()} 
        ref={modalRef}
        tabIndex="-1"
      >
        {/* Sticky Sheet Header */}
        <div className="sheet-header">
          <div>
            <span className="meta-pill highlight" style={{ marginRight: '6px' }}>
              Surah #{surahId}
            </span>
            <span className="meta-pill">
              {surahRev} • {surahVersesCount} Verses
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="sheet-close-btn"
              onClick={handleShare}
              aria-label="Share Surah"
              title="Share"
            >
              <Share2 size={16} />
            </button>
            <button
              className="sheet-close-btn"
              onClick={closeSurah}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation (Zero Duplication) */}
        <div className="surah-tabs" role="tablist" aria-label="Surah Sections">
          <button
            className={`surah-tab-btn ${activeTab === 'verses' ? 'active' : ''}`}
            onClick={() => setActiveTab('verses')}
            role="tab"
            aria-selected={activeTab === 'verses'}
          >
            Verses ({verseBreakdowns.length})
          </button>
          <button
            className={`surah-tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => setActiveTab('stories')}
            role="tab"
            aria-selected={activeTab === 'stories'}
          >
            Stories ({allSurahStories.length})
          </button>
          <button
            className={`surah-tab-btn ${activeTab === 'name' ? 'active' : ''}`}
            onClick={() => setActiveTab('name')}
            role="tab"
            aria-selected={activeTab === 'name'}
          >
            Name Origin &amp; Context
          </button>
          <button
            className={`surah-tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
            onClick={() => setActiveTab('insights')}
            role="tab"
            aria-selected={activeTab === 'insights'}
          >
            Deep Dives ({deepDives.length})
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="sheet-body">
          {/* Header Title Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', gap: '12px' }}>
            <div>
              <h2 id="surah-modal-title" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {surahName}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {surahMeaning}
              </p>
            </div>
            {surahArabic && (
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '2.2rem', color: 'var(--accent-primary)', lineHeight: 1 }}>
                {surahArabic}
              </div>
            )}
          </div>

          {surahDetailsLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
              <Sparkles size={32} style={{ animation: 'pulse-glow 1.5s infinite', margin: '0 auto 10px' }} />
              <p>Loading Surah content...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: VERSE BREAKDOWNS */}
              {activeTab === 'verses' && (
                <section aria-label="Verse by verse breakdown">
                  {verseBreakdowns.length > 0 ? (
                    verseBreakdowns.map((item, idx) => (
                      <article key={idx} className="verse-breakdown-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span className="verse-num-badge">
                            Verses {item.verse_range || `${item.start_verse}-${item.end_verse}` || `#${idx + 1}`}
                          </span>
                        </div>
                        {item.section_title && (
                          <h4 className="verse-theme-title">
                            {item.section_title}
                          </h4>
                        )}

                        {/* If breakdown has points list */}
                        {item.points && item.points.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '10px 0' }}>
                            {item.points.map((p, pIdx) => (
                              <div key={pIdx} style={{ fontSize: '0.92rem', lineHeight: 1.6 }}>
                                <strong style={{ color: 'var(--accent-primary)' }}>• {p.label}: </strong>
                                <span style={{ color: 'var(--text-main)' }}>{p.detail}</span>
                              </div>
                            ))}
                          </div>
                        ) : item.content_markdown ? (
                          <div style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-main)', margin: '10px 0', whiteSpace: 'pre-line' }}>
                            {item.content_markdown}
                          </div>
                        ) : null}

                        {/* Reflection Card */}
                        {item.reflection && (
                          <div className="quote-card" style={{ marginTop: '10px' }}>
                            <strong>Reflection: </strong>{item.reflection}
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="verse-breakdown-card">
                      <h4 className="verse-theme-title">Surah Overview</h4>
                      <p className="verse-explanation">
                        {coreTheme || 'Contains guidance, cosmic signs, and Quranic wisdom.'}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* TAB 2: STORIES IN SURAH */}
              {activeTab === 'stories' && (
                <section aria-label="Stories featured in this Surah">
                  {allSurahStories.length > 0 ? (
                    <div className="cards-list">
                      {allSurahStories.map((story) => (
                        <div
                          key={story.id}
                          className="visual-card"
                          onClick={() => {
                            closeSurah();
                            openStory(story.id);
                          }}
                        >
                          <div className="visual-card-header">
                            <div>
                              <span className="meta-pill highlight" style={{ marginBottom: '6px' }}>
                                {story.badge || 'Prophet / Righteous'}
                              </span>
                              <h3 className="card-title">{story.title}</h3>
                            </div>
                            <ArrowRight size={18} color="var(--accent-primary)" />
                          </div>
                          <p className="card-summary">{story.snippet || story.narrative}</p>
                          <div className="card-meta-row">
                            <span className="meta-pill highlight">⚡ Tap to view Visual Timeline</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                      <Compass size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                      <p>This Surah focuses on legislative guidance, supplications, and core faith rather than historical Prophet narratives.</p>
                    </div>
                  )}
                </section>
              )}

              {/* TAB 3: NAME ORIGIN & CONTEXT */}
              {activeTab === 'name' && (
                <section aria-label="Surah Name Origin and Revelation Context">
                  {nameOrigin && (
                    <div className="visual-card" style={{ cursor: 'default' }}>
                      <span className="section-heading-pill">
                        <Info size={14} />
                        <span>Why is it named "{surahName}"?</span>
                      </span>
                      <div style={{ fontSize: '0.94rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                        {nameOrigin}
                      </div>
                    </div>
                  )}

                  {revDetails && (
                    <div className="visual-card" style={{ marginTop: '12px', cursor: 'default' }}>
                      <span className="section-heading-pill">
                        <Sparkles size={14} />
                        <span>Revelation Details &amp; Occasion</span>
                      </span>
                      <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        {revDetails}
                      </p>
                    </div>
                  )}

                  {coreTheme && (
                    <div className="visual-card" style={{ marginTop: '12px', cursor: 'default' }}>
                      <span className="section-heading-pill">
                        <BookOpen size={14} />
                        <span>Core Theme &amp; Essence</span>
                      </span>
                      <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        {coreTheme}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* TAB 4: DEEP DIVES */}
              {activeTab === 'insights' && (
                <section aria-label="Deep Dives and Thematic Lessons">
                  {deepDives.length > 0 ? (
                    deepDives.map((dive, idx) => (
                      <article key={idx} className="visual-card" style={{ marginBottom: '12px', cursor: 'default' }}>
                        <h4 className="card-title" style={{ color: 'var(--accent-primary)', marginBottom: '6px' }}>
                          {dive.title}
                        </h4>
                        {dive.verse_reference && (
                          <span className="meta-pill" style={{ marginBottom: '8px' }}>
                            Verse: {dive.verse_reference}
                          </span>
                        )}
                        <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                          {dive.content}
                        </div>
                      </article>
                    ))
                  ) : (
                    <div className="visual-card" style={{ cursor: 'default' }}>
                      <h4 className="card-title" style={{ color: 'var(--accent-primary)', marginBottom: '6px' }}>
                        Core Thematic Lessons
                      </h4>
                      <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        {coreTheme || 'Emphasizes unwavering faith in Allah, mindful ethics in human relationships, and continuous remembrance of the Hereafter.'}
                      </p>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
