// Local storage keys
const THEME_KEY = 'nur_qasas_theme';
const BOOKMARKS_KEY = 'nur_qasas_bookmarks';
const REFLECTIONS_KEY = 'nur_qasas_reflections';

export const getStoredTheme = () => {
  return localStorage.getItem(THEME_KEY) || 'emerald-light';
};

export const setStoredTheme = (theme) => {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.setAttribute('data-theme', theme);
};

export const getStoredBookmarks = () => {
  try {
    return JSON.parse(localStorage.getItem(BOOKMARKS_KEY) || '[]');
  } catch {
    return [];
  }
};

export const toggleStoredBookmark = (storyId) => {
  const bookmarks = getStoredBookmarks();
  const exists = bookmarks.includes(storyId);
  const updated = exists ? bookmarks.filter(id => id !== storyId) : [...bookmarks, storyId];
  localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  return updated;
};

export const getStoredReflections = () => {
  try {
    return JSON.parse(localStorage.getItem(REFLECTIONS_KEY) || '{}');
  } catch {
    return {};
  }
};

export const toggleStoredReflection = (storyId, lessonIdx) => {
  const reflections = getStoredReflections();
  const list = reflections[storyId] || [];
  const exists = list.includes(lessonIdx);
  const updatedList = exists ? list.filter(i => i !== lessonIdx) : [...list, lessonIdx];
  const updated = { ...reflections, [storyId]: updatedList };
  localStorage.setItem(REFLECTIONS_KEY, JSON.stringify(updated));
  return updated;
};
