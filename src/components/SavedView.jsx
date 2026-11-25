import React from 'react';
import { useApp } from '../context/AppContext';
import { Bookmark, Sparkles, BookOpen, CheckCircle2, ArrowRight } from 'lucide-react';

export const SavedView = () => {
  const { stories, bookmarks, reflections, openStory, setActiveTab } = useApp();

  const bookmarkedStories = stories.filter(s => bookmarks.includes(s.id));

  // Stories where user marked reflections
  const reflectedStoryIds = Object.keys(reflections).filter(id => (reflections[id] || []).length > 0);
  const reflectedStories = stories.filter(s => reflectedStoryIds.includes(s.id));

  const totalReflectionsCount = Object.values(reflections).reduce((acc, curr) => acc + (curr?.length || 0), 0);

  return (
    <section aria-label="Personal Reflections and Bookmarks">
      {/* Overview Stats Card */}
      <div className="story-hero-banner" style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '6px' }}>
          Your Reflection Sanctuary
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
          Track bookmarked narratives and moral lessons you have reflected upon.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="meta-pill highlight" style={{ padding: '6px 12px' }}>
            <Bookmark size={14} />
            <span>{bookmarks.length} Bookmarks</span>
          </div>
          <div className="meta-pill highlight" style={{ padding: '6px 12px' }}>
            <Sparkles size={14} />
            <span>{totalReflectionsCount} Lessons Reflected</span>
          </div>
        </div>
      </div>

      {/* Bookmarked Stories */}
      <div style={{ marginBottom: '24px' }}>
        <span className="section-heading-pill">
          <Bookmark size={14} />
          <span>Bookmarked Stories ({bookmarkedStories.length})</span>
        </span>

        {bookmarkedStories.length > 0 ? (
          <div className="cards-list">
            {bookmarkedStories.map(story => (
              <article
                key={story.id}
                className="visual-card"
                onClick={() => openStory(story)}
                role="button"
                tabIndex="0"
              >
                <div className="visual-card-header">
                  <div>
                    <span className="meta-pill" style={{ marginBottom: '6px' }}>
                      {story.badge || story.category_label}
                    </span>
                    <h3 className="card-title">{story.title}</h3>
                  </div>
                  <ArrowRight size={18} color="var(--accent-primary)" />
                </div>
                <div className="card-meta-row">
                  {story.location && <span className="meta-pill">📍 {story.location}</span>}
                  {story.timeline_steps && <span className="meta-pill">⚡ {story.timeline_steps.length} Milestones</span>}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="visual-card" style={{ textAlign: 'center', padding: '30px', cursor: 'default' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '12px' }}>
              No stories bookmarked yet. Tap the bookmark icon on any story to save it here!
            </p>
            <button
              className="chip-btn active"
              style={{ margin: '0 auto' }}
              onClick={() => setActiveTab('stories')}
            >
              Browse Stories
            </button>
          </div>
        )}
      </div>

      {/* Stories with Active Reflections */}
      {reflectedStories.length > 0 && (
        <div>
          <span className="section-heading-pill">
            <CheckCircle2 size={14} />
            <span>Reflected Narratives ({reflectedStories.length})</span>
          </span>

          <div className="cards-list">
            {reflectedStories.map(story => {
              const checkedCount = (reflections[story.id] || []).length;
              const totalLessons = story.lessons_list?.length || 0;
              return (
                <article
                  key={story.id}
                  className="visual-card"
                  onClick={() => openStory(story)}
                  role="button"
                  tabIndex="0"
                >
                  <div className="visual-card-header">
                    <div>
                      <h3 className="card-title">{story.title}</h3>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                        {checkedCount} of {totalLessons} moral signposts reflected
                      </p>
                    </div>
                    <span className="meta-pill highlight">
                      {Math.round((checkedCount / (totalLessons || 1)) * 100)}%
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
