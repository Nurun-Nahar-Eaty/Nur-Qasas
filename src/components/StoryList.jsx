import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Compass, Sparkles, MapPin, Clock, Bookmark, CheckCircle2, Search } from 'lucide-react';

export const StoryList = () => {
  const { stories, openStory, bookmarks, reflections, loading } = useApp();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All Stories (44)' },
    { id: 'prophet', label: 'Prophets (24)' },
    { id: 'pious_figure', label: 'Righteous Figures (10)' },
    { id: 'nation_or_group', label: 'Nations & Lessons (5)' },
    { id: 'transgressor', label: 'Tyrants & Warnings (5)' }
  ];

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      // Category filter
      if (activeCategory !== 'all' && story.category !== activeCategory) return false;

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = (story.title || '').toLowerCase().includes(q);
        const narrativeMatch = (story.narrative || '').toLowerCase().includes(q);
        const locationMatch = (story.location || '').toLowerCase().includes(q);
        const eraMatch = (story.era || '').toLowerCase().includes(q);
        const lessonsMatch = (story.lessons || '').toLowerCase().includes(q);
        return titleMatch || narrativeMatch || locationMatch || eraMatch || lessonsMatch;
      }
      return true;
    });
  }, [stories, activeCategory, searchQuery]);

  const getCategoryClass = (cat) => {
    switch (cat) {
      case 'prophet': return 'badge-prophet';
      case 'pious_figure': return 'badge-pious';
      case 'transgressor': return 'badge-tyrant';
      case 'nation_or_group': return 'badge-nation';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
        <Sparkles size={36} style={{ animation: 'pulse-glow 1.5s infinite', margin: '0 auto 12px' }} />
        <p>Loading Quranic stories &amp; timelines...</p>
      </div>
    );
  }

  return (
    <section aria-label="Visual Quranic Stories and Historical Timelines">
      {/* Search & Category Filter */}
      <div style={{ marginBottom: '14px' }}>
        <div className="search-input-wrap" style={{ marginBottom: '10px' }}>
          <Search size={18} color="var(--text-light)" />
          <input
            type="search"
            className="search-field"
            placeholder="Search stories, miracles, prophets, lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Filter Quranic Stories"
          />
        </div>

        {/* Horizontal Category Chips */}
        <div className="chip-bar" role="tablist" aria-label="Filter Stories by Category">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`chip-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              role="tab"
              aria-selected={activeCategory === cat.id}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stories Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Showing {filteredStories.length} Visual Stories
        </span>
      </div>

      {/* Stories Cards Feed */}
      <div className="cards-list" role="feed" aria-label="Quranic Stories Feed">
        {filteredStories.map((story) => {
          const isBookmarked = bookmarks.includes(story.id);
          const reflectedLessons = reflections[story.id] || [];
          const totalLessons = story.lessons_list?.length || 0;
          const isCompleted = totalLessons > 0 && reflectedLessons.length === totalLessons;

          return (
            <article
              key={story.id}
              className="visual-card"
              onClick={() => openStory(story)}
              tabIndex="0"
              role="button"
              aria-label={`Open visual story of ${story.title}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  openStory(story);
                }
              }}
            >
              <div className="visual-card-header">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span className={`meta-pill ${getCategoryClass(story.category)}`}>
                      {story.badge || story.category_label}
                    </span>
                    {isCompleted && (
                      <span className="meta-pill highlight">
                        <CheckCircle2 size={12} />
                        <span>Done</span>
                      </span>
                    )}
                    {isBookmarked && (
                      <Bookmark size={14} fill="var(--accent-gold)" color="var(--accent-gold)" />
                    )}
                  </div>
                  <h3 className="card-title">
                    {story.title}
                  </h3>
                </div>

                {story.arabic_name && (
                  <div className="card-arabic-title">
                    {story.arabic_name}
                  </div>
                )}
              </div>

              {/* Story Teaser Narrative */}
              <p className="card-summary">
                {story.timeline_steps?.[0]?.detail || story.narrative}
              </p>

              {/* Visual Badges Row */}
              <div className="card-meta-row">
                {story.location && (
                  <span className="meta-pill">
                    <MapPin size={12} />
                    <span>{story.location}</span>
                  </span>
                )}
                {story.timeline_steps && (
                  <span className="meta-pill highlight">
                    ⚡ {story.timeline_steps.length} Milestones
                  </span>
                )}
                {story.read_time_mins && (
                  <span className="meta-pill">
                    <Clock size={12} />
                    <span>{story.read_time_mins} min</span>
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
