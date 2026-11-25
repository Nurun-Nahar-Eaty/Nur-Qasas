import React, { createContext, useContext, useState, useEffect } from 'react';
import { getStoredTheme, setStoredTheme, getStoredBookmarks, toggleStoredBookmark, getStoredReflections, toggleStoredReflection } from '../utils/storage';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [theme, setThemeState] = useState(getStoredTheme);
  const [activeTab, setActiveTab] = useState('surahs'); // 'surahs' | 'stories' | 'saved' | 'theme'
  const [surahs, setSurahs] = useState([]);
  const [stories, setStories] = useState([]);
  const [searchIndex, setSearchIndex] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & Navigation state
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [selectedSurahDetails, setSelectedSurahDetails] = useState(null);
  const [surahDetailsLoading, setSurahDetailsLoading] = useState(false);

  const [selectedStory, setSelectedStory] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Bookmarks & reflections
  const [bookmarks, setBookmarks] = useState(getStoredBookmarks);
  const [reflections, setReflections] = useState(getStoredReflections);

  // Initialize theme on HTML root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load base data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [surahsRes, storiesRes, searchRes] = await Promise.all([
          fetch('./data/surahs.json').then(r => r.json()),
          fetch('./data/stories.json').then(r => r.json()),
          fetch('./data/search_index.json').then(r => r.json()).catch(() => [])
        ]);
        setSurahs(surahsRes);
        setStories(storiesRes);
        setSearchIndex(searchRes);
      } catch (err) {
        console.error('Failed to load Quran app data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const changeTheme = (newTheme) => {
    setThemeState(newTheme);
    setStoredTheme(newTheme);
  };

  const handleToggleBookmark = (storyId) => {
    const updated = toggleStoredBookmark(storyId);
    setBookmarks(updated);
  };

  const handleToggleReflection = (storyId, lessonIdx) => {
    const updated = toggleStoredReflection(storyId, lessonIdx);
    setReflections(updated);
  };

  const openSurah = async (surahNumber) => {
    const num = Number(surahNumber);
    const surahSummary = surahs.find(s => s.number === num);
    setSelectedSurah(surahSummary || { number: num });
    setSurahDetailsLoading(true);
    try {
      const res = await fetch(`./data/surah_details/${num}.json`);
      if (res.ok) {
        const details = await res.json();
        setSelectedSurahDetails(details);
      } else {
        setSelectedSurahDetails(null);
      }
    } catch (err) {
      console.error(`Failed to load details for Surah ${num}:`, err);
      setSelectedSurahDetails(null);
    } finally {
      setSurahDetailsLoading(false);
    }
  };

  const closeSurah = () => {
    setSelectedSurah(null);
    setSelectedSurahDetails(null);
  };

  const openStory = (story) => {
    if (typeof story === 'string' || typeof story === 'number') {
      const found = stories.find(s => s.id === story || s.id.includes(String(story)));
      if (found) setSelectedStory(found);
    } else {
      setSelectedStory(story);
    }
  };

  const closeStory = () => {
    setSelectedStory(null);
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        changeTheme,
        activeTab,
        setActiveTab,
        surahs,
        stories,
        searchIndex,
        loading,
        selectedSurah,
        selectedSurahDetails,
        surahDetailsLoading,
        openSurah,
        closeSurah,
        selectedStory,
        openStory,
        closeStory,
        isSearchOpen,
        setIsSearchOpen,
        bookmarks,
        toggleBookmark: handleToggleBookmark,
        reflections,
        toggleReflection: handleToggleReflection
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
