import React from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Compass, BookmarkCheck, Palette } from 'lucide-react';

export const BottomNav = () => {
  const { activeTab, setActiveTab, bookmarks } = useApp();

  const navItems = [
    { id: 'surahs', label: 'Surahs', icon: BookOpen, count: 114 },
    { id: 'stories', label: 'Stories', icon: Compass, count: 44 },
    { id: 'saved', label: 'Reflections', icon: BookmarkCheck, count: bookmarks.length || undefined },
    { id: 'theme', label: 'Theme', icon: Palette }
  ];

  return (
    <nav className="bottom-nav safe-bottom" role="navigation" aria-label="Main Navigation">
      {navItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(item.id)}
            aria-selected={isActive}
            role="tab"
            aria-label={`${item.label} tab`}
          >
            <IconComponent size={20} className="nav-icon" aria-hidden="true" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
