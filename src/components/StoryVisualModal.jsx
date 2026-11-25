import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { StoryTimeline } from './StoryTimeline';
import {
  X, Bookmark, CheckCircle2, Circle, MapPin, Clock, BookOpen,
  Lightbulb, Share2, Compass, Sparkles
} from 'lucide-react';

export const StoryVisualModal = () => {
  const {
    selectedStory,
    closeStory,
    openSurah,
    surahs,
    bookmarks,
    toggleBookmark,
    reflections,
    toggleReflection
  } = useApp();

  const modalRef = useRef(null);

  // Keyboard escape handler for accessibility (508)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeStory();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeStory]);

  if (!selectedStory) return null;

  const isBookmarked = bookmarks.includes(selectedStory.id);
  const storyReflections = reflections[selectedStory.id] || [];
  const lessons = selectedStory.lessons_list || [];
  const completionRate = lessons.length > 0 ? Math.round((storyReflections.length / lessons.length) * 100) : 0;

  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'prophet': return 'badge-prophet';
      case 'pious_figure': return 'badge-pious';
      case 'transgressor': return 'badge-tyrant';
      case 'nation_or_group': return 'badge-nation';
      default: return '';
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: selectedStory.title,
          text: `Read about ${selectedStory.title} in the Holy Quran`,
          url: window.location.href,
        });
      } catch (err) {
        // user cancelled share
      }
    } else {
      navigator.clipboard.writeText(`${selectedStory.title} - ${window.location.href}`);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="modal-overlay" onClick={closeStory} role="dialog" aria-modal="true" aria-labelledby="story-modal-title">
      <div
        className="sheet-container"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
        tabIndex="-1"
      >
        {/* Sticky Sheet Header */}
        <div className="sheet-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`meta-pill ${getCategoryClass(selectedStory.category)}`}>
              {selectedStory.badge || selectedStory.category_label}
            </span>
            {completionRate === 100 && (
              <span className="meta-pill highlight">
                <CheckCircle2 size={12} />
                <span>Reflected</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              className="sheet-close-btn"
              onClick={() => toggleBookmark(selectedStory.id)}
              aria-label={isBookmarked ? 'Remove Bookmark' : 'Bookmark Story'}
              title={isBookmarked ? 'Bookmarked' : 'Add to Bookmarks'}
            >
              <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} color={isBookmarked ? 'var(--accent-gold)' : 'currentColor'} />
            </button>

            <button
              className="sheet-close-btn"
              onClick={handleShare}
              aria-label="Share Story"
              title="Share"
            >
              <Share2 size={16} />
            </button>

            <button
              className="sheet-close-btn"
              onClick={closeStory}
              aria-label="Close dialog"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="sheet-body">
          {/* Hero Banner */}
          <section className="story-hero-banner" aria-label="Story Overview">
            {selectedStory.arabic_name && (
              <div className="hero-arabic-watermark" aria-hidden="true">
                {selectedStory.arabic_name}
              </div>
            )}

            <div className="story-meta-tags">
              {selectedStory.location && (
                <span className="meta-pill">
                  <MapPin size={12} />
                  <span>{selectedStory.location}</span>
                </span>
              )}
              {selectedStory.era && (
                <span className="meta-pill">
                  <Clock size={12} />
                  <span>{selectedStory.era}</span>
                </span>
              )}
              {selectedStory.read_time_mins && (
                <span className="meta-pill">
                  <span>⏱ {selectedStory.read_time_mins} min read</span>
                </span>
              )}
            </div>

            <h2 id="story-modal-title" className="story-main-title">
              {selectedStory.title}
            </h2>

            {selectedStory.surah_citations && (
              <p className="story-sub-citations">
                <strong>Quranic Citations:</strong> {selectedStory.surah_citations}
              </p>
            )}
          </section>

          {/* Key Quranic Quotes (if any) */}
          {selectedStory.key_quotes && selectedStory.key_quotes.length > 0 && (
            <section style={{ marginBottom: '20px' }} aria-label="Key Quranic Quotes">
              <span className="section-heading-pill">
                <Sparkles size={14} />
                <span>Featured Quranic Verse</span>
              </span>
              {selectedStory.key_quotes.map((q, qIdx) => (
                <blockquote key={qIdx} className="quote-card" style={{ marginTop: '8px' }}>
                  "{q}"
                </blockquote>
              ))}
            </section>
          )}

          {/* Interactive Visual Timeline */}
          <section aria-label="Timeline of Events">
            <span className="section-heading-pill">
              <Compass size={14} />
              <span>Visual Journey &amp; Milestones ({selectedStory.timeline_steps?.length || 0} Steps)</span>
            </span>

            <StoryTimeline steps={selectedStory.timeline_steps} />
          </section>

          {/* Lessons & Reflections Interactive Section */}
          {lessons.length > 0 && (
            <section className="moral-section" aria-label="Key Lessons & Personal Reflection">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="section-heading-pill">
                  <Lightbulb size={14} />
                  <span>Moral Signposts &amp; Reflections</span>
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  {storyReflections.length}/{lessons.length} Reflected
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'var(--border-subtle)', borderRadius: '999px', overflow: 'hidden', marginBottom: '14px' }}>
                <div
                  style={{
                    width: `${completionRate}%`,
                    height: '100%',
                    background: 'var(--accent-gold)',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>

              <div role="list" aria-label="Lessons checklist">
                {lessons.map((lesson, idx) => {
                  const isChecked = storyReflections.includes(idx);
                  return (
                    <div
                      key={idx}
                      className="lesson-card"
                      onClick={() => toggleReflection(selectedStory.id, idx)}
                      role="checkbox"
                      aria-checked={isChecked}
                      tabIndex="0"
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          toggleReflection(selectedStory.id, idx);
                        }
                      }}
                    >
                      <button
                        className="lesson-check-btn"
                        aria-hidden="true"
                        tabIndex="-1"
                      >
                        {isChecked ? <CheckCircle2 size={20} color="var(--accent-gold)" /> : <Circle size={20} color="var(--text-light)" />}
                      </button>
                      <span style={{ textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.8 : 1 }}>
                        {lesson}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Cross-Referenced Surahs */}
          {selectedStory.referenced_surahs && selectedStory.referenced_surahs.length > 0 && (
            <section style={{ marginTop: '24px' }} aria-label="Referenced Quranic Chapters">
              <span className="section-heading-pill">
                <BookOpen size={14} />
                <span>Mentioned in These Surahs</span>
              </span>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Tap any Surah below to open its verse breakdown and revelation context:
              </p>
              <div className="linked-surahs-row">
                {selectedStory.referenced_surahs.map((surahNum) => {
                  const sInfo = surahs.find(s => s.id === Number(surahNum) || s.number === Number(surahNum));
                  return (
                    <button
                      key={surahNum}
                      className="surah-link-chip"
                      onClick={() => {
                        closeStory();
                        openSurah(surahNum);
                      }}
                      title={sInfo ? `Open Surah ${surahNum}: ${sInfo.name} (${sInfo.meaning})` : `Go to Surah ${surahNum}`}
                      aria-label={sInfo ? `Open Surah ${surahNum} ${sInfo.name}` : `Open Surah ${surahNum}`}
                    >
                      <BookOpen size={12} />
                      <span>Surah {surahNum}{sInfo ? ` • ${sInfo.name}` : ''}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
