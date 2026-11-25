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

  const handleShare = async () => {
    const title = `Surah ${selectedSurah.english_name || selectedSurah.name} (${selectedSurah.number})`;
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: `Explore Surah ${selectedSurah.english_name} verse breakdown and stories`,
          url: window.location.href,
        });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(`${title} - ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  // Find related stories from global stories list that mention this surah
  const relatedStories = stories.filter(st => 
    st.referenced_surahs && st.referenced_surahs.includes(selectedSurah.number)
  );

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
              Surah #{selectedSurah.number}
            </span>
            <span className="meta-pill">
              {selectedSurah.revelation_type || (selectedSurah.is_meccan ? 'Makki' : 'Madani')} • {selectedSurah.verse_count || selectedSurah.total_verses} Verses
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
            Verses Breakdown
          </button>
          <button
            className={`surah-tab-btn ${activeTab === 'stories' ? 'active' : ''}`}
            onClick={() => setActiveTab('stories')}
            role="tab"
            aria-selected={activeTab === 'stories'}
          >
            Stories ({relatedStories.length || (selectedSurahDetails?.stories_in_surah?.length || 0)})
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
            Key Insights
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="sheet-body">
          {/* Header Title Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 id="surah-modal-title" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                {selectedSurah.english_name || selectedSurah.name}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {selectedSurah.english_meaning || selectedSurah.translation}
              </p>
            </div>
            {selectedSurah.arabic_name && (
              <div style={{ fontFamily: 'Amiri, serif', fontSize: '2.2rem', color: 'var(--accent-primary)', lineHeight: 1 }}>
                {selectedSurah.arabic_name}
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
              {/* TAB 1: VERSE BREAKDOWN */}
              {activeTab === 'verses' && (
                <section aria-label="Verse by verse breakdown">
                  {selectedSurahDetails?.verse_breakdown && selectedSurahDetails.verse_breakdown.length > 0 ? (
                    selectedSurahDetails.verse_breakdown.map((item, idx) => (
                      <article key={idx} className="verse-breakdown-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span className="verse-num-badge">
                            Verses {item.verse_range || item.range || `#${idx + 1}`}
                          </span>
                        </div>
                        {item.theme && (
                          <h4 className="verse-theme-title">
                            {item.theme}
                          </h4>
                        )}
                        {item.arabic_text && (
                          <p className="verse-arabic-text">
                            {item.arabic_text}
                          </p>
                        )}
                        <p className="verse-explanation">
                          {item.explanation || item.summary || item.text}
                        </p>
                        {item.key_lesson && (
                          <div className="quote-card" style={{ marginTop: '8px' }}>
                            <strong>Reflection:</strong> {item.key_lesson}
                          </div>
                        )}
                      </article>
                    ))
                  ) : (
                    <div className="verse-breakdown-card">
                      <h4 className="verse-theme-title">Surah Overview</h4>
                      <p className="verse-explanation">
                        {selectedSurah.theme_summary || selectedSurah.short_description || 'Contains profound verses encompassing monotheism, righteous character, and Quranic wisdom.'}
                      </p>
                    </div>
                  )}
                </section>
              )}

              {/* TAB 2: STORIES IN SURAH */}
              {activeTab === 'stories' && (
                <section aria-label="Stories featured in this Surah">
                  {relatedStories.length > 0 ? (
                    <div className="cards-list">
                      {relatedStories.map((story) => (
                        <div
                          key={story.id}
                          className="visual-card"
                          onClick={() => {
                            closeSurah();
                            openStory(story);
                          }}
                        >
                          <div className="visual-card-header">
                            <div>
                              <span className="meta-pill highlight" style={{ marginBottom: '6px' }}>
                                {story.badge || story.category_label}
                              </span>
                              <h3 className="card-title">{story.title}</h3>
                            </div>
                            <ArrowRight size={18} color="var(--accent-primary)" />
                          </div>
                          <p className="card-summary">{story.narrative?.slice(0, 160)}...</p>
                          <div className="card-meta-row">
                            {story.location && <span className="meta-pill">📍 {story.location}</span>}
                            {story.timeline_steps && <span className="meta-pill">⚡ {story.timeline_steps.length} Milestones</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : selectedSurahDetails?.stories_in_surah && selectedSurahDetails.stories_in_surah.length > 0 ? (
                    <div className="cards-list">
                      {selectedSurahDetails.stories_in_surah.map((st, idx) => (
                        <div key={idx} className="visual-card">
                          <h3 className="card-title">{st.title || `Story ${idx + 1}`}</h3>
                          <p className="card-summary">{st.summary || st.detail || st.narrative}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
                      <Compass size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                      <p>This Surah focuses primarily on legislative guidance, cosmic reflections, and divine supplications.</p>
                    </div>
                  )}
                </section>
              )}

              {/* TAB 3: NAME ORIGIN & CONTEXT */}
              {activeTab === 'name' && (
                <section aria-label="Surah Name Origin and Revelation Context">
                  <div className="visual-card" style={{ cursor: 'default' }}>
                    <span className="section-heading-pill">
                      <Info size={14} />
                      <span>Why is it named "{selectedSurah.english_name || selectedSurah.name}"?</span>
                    </span>
                    <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                      {selectedSurahDetails?.name_origin || selectedSurah.name_origin || `The Surah is named '${selectedSurah.english_name}' highlighting prominent themes, historical events, or distinctive words revealed within.`}
                    </p>
                  </div>

                  <div className="visual-card" style={{ marginTop: '12px', cursor: 'default' }}>
                    <span className="section-heading-pill">
                      <Sparkles size={14} />
                      <span>Revelation Era &amp; Historical Context</span>
                    </span>
                    <p style={{ fontSize: '0.94rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                      <strong>Classification:</strong> {selectedSurah.revelation_type || (selectedSurah.is_meccan ? 'Meccan (Makki)' : 'Medinan (Madani)')}<br/>
                      {selectedSurah.revelation_order && <><strong>Chronological Revelation Order:</strong> #{selectedSurah.revelation_order}<br/></>}
                      {selectedSurahDetails?.revelation_context && <><strong>Historical Context:</strong> {selectedSurahDetails.revelation_context}</>}
                    </p>
                  </div>
                </section>
              )}

              {/* TAB 4: KEY INSIGHTS & DEEP DIVES */}
              {activeTab === 'insights' && (
                <section aria-label="Deep Dives and Thematic Lessons">
                  {selectedSurahDetails?.deep_dives && selectedSurahDetails.deep_dives.length > 0 ? (
                    selectedSurahDetails.deep_dives.map((dive, idx) => (
                      <article key={idx} className="visual-card" style={{ marginBottom: '12px', cursor: 'default' }}>
                        <h4 className="card-title" style={{ color: 'var(--accent-primary)', marginBottom: '6px' }}>
                          {dive.title || `Key Insight #${idx + 1}`}
                        </h4>
                        <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                          {dive.content || dive.detail || dive.text}
                        </p>
                      </article>
                    ))
                  ) : (
                    <div className="visual-card" style={{ cursor: 'default' }}>
                      <h4 className="card-title" style={{ color: 'var(--accent-primary)', marginBottom: '6px' }}>
                        Core Thematic Lessons
                      </h4>
                      <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'var(--text-main)' }}>
                        {selectedSurah.main_theme || selectedSurah.theme_summary || 'Emphasizes unwavering faith in Allah, mindful ethics in human relationships, and continuous remembrance of the Hereafter.'}
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
