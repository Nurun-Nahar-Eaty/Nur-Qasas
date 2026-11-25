import React from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SurahList } from './components/SurahList';
import { StoryList } from './components/StoryList';
import { SavedView } from './components/SavedView';
import { ThemeSelector } from './components/ThemeSelector';
import { StoryVisualModal } from './components/StoryVisualModal';
import { SurahDetailModal } from './components/SurahDetailModal';
import { SearchModal } from './components/SearchModal';

export const App = () => {
  const { activeTab } = useApp();

  return (
    <div className="app-shell">
      {/* 508 Accessibility Skip Link */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      {/* Sticky Mobile Header */}
      <Header />

      {/* Main Content Area */}
      <main id="main-content" className="main-content" tabIndex="-1">
        {activeTab === 'surahs' && <SurahList />}
        {activeTab === 'stories' && <StoryList />}
        {activeTab === 'saved' && <SavedView />}
        {activeTab === 'theme' && <ThemeSelector />}
      </main>

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav />

      {/* Modals & Slide-over Sheets */}
      <StoryVisualModal />
      <SurahDetailModal />
      <SearchModal />
    </div>
  );
};
