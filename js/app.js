/**
 * Quran Kareem – Surahs, Verse Breakdowns & Stories PWA
 * Multi-Theme System · Zero Duplication Across Tabs · 508 Compliant
 */

(function () {
  'use strict';

  // Application State
  const state = {
    surahs: [],
    stories: [],
    searchIndex: [],
    surahDetailCache: new Map(),
    currentView: 'surahs',
    currentFilter: 'all',
    currentStoryFilter: 'all',
    currentSurahId: null,
    currentStoryId: null,
    bookmarks: { surahs: [], stories: [] },
    theme: 'emerald-light',
    fontScaleIdx: 0,
    fontScales: ['16px', '18px', '20px']
  };

  // DOM Elements Cache
  const elements = {
    // Nav
    navSurahs: document.getElementById('navSurahs'),
    navStories: document.getElementById('navStories'),
    navBookmarks: document.getElementById('navBookmarks'),
    navAbout: document.getElementById('navAbout'),
    filterNav: document.getElementById('filterNav'),
    filterChipsContainer: document.getElementById('filterChipsContainer'),
    headerLogoBtn: document.getElementById('headerLogoBtn'),

    // Views
    surahsView: document.getElementById('surahsView'),
    storiesView: document.getElementById('storiesView'),
    bookmarksView: document.getElementById('bookmarksView'),
    aboutView: document.getElementById('aboutView'),
    surahDetailView: document.getElementById('surahDetailView'),
    storyDetailView: document.getElementById('storyDetailView'),

    // Search
    globalSearchInput: document.getElementById('globalSearchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    searchResultsTray: document.getElementById('searchResultsTray'),

    // Grids & Containers
    surahGrid: document.getElementById('surahGrid'),
    storiesGrid: document.getElementById('storiesGrid'),
    bookmarksList: document.getElementById('bookmarksList'),
    themesSummaryChart: document.getElementById('themesSummaryChart'),

    // Surah Detail
    surahBackBtn: document.getElementById('surahBackBtn'),
    bookmarkSurahBtn: document.getElementById('bookmarkSurahBtn'),
    surahBookmarkIcon: document.getElementById('surahBookmarkIcon'),
    surahDetailHero: document.getElementById('surahDetailHero'),
    breakdownCardsContainer: document.getElementById('breakdownCardsContainer'),
    surahStoriesContainer: document.getElementById('surahStoriesContainer'),
    surahWhyContainer: document.getElementById('surahWhyContainer'),
    surahDivesContainer: document.getElementById('surahDivesContainer'),

    // Story Detail
    storyBackBtn: document.getElementById('storyBackBtn'),
    bookmarkStoryBtn: document.getElementById('bookmarkStoryBtn'),
    storyBookmarkIcon: document.getElementById('storyBookmarkIcon'),
    storyDetailHero: document.getElementById('storyDetailHero'),
    storyCitationsRaw: document.getElementById('storyCitationsRaw'),
    storySurahChipsContainer: document.getElementById('storySurahChipsContainer'),
    storyNarrativeContainer: document.getElementById('storyNarrativeContainer'),
    storyLessonsContainer: document.getElementById('storyLessonsContainer'),
    storyLessonsSection: document.getElementById('storyLessonsSection'),
    storyTheoContainer: document.getElementById('storyTheoContainer'),
    storyTheoSection: document.getElementById('storyTheoSection'),

    // Controls & Modals
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    themeModalBackdrop: document.getElementById('themeModalBackdrop'),
    closeThemeModalBtn: document.getElementById('closeThemeModalBtn'),
    fontSizeBtn: document.getElementById('fontSizeBtn'),
    toastNotice: document.getElementById('toastNotice')
  };

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------
  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatMarkdownText(raw) {
    if (!raw) return '';
    let text = String(raw).trim();
    // Convert bold **text** to <strong>
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Convert italic *text* to <em>
    text = text.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
    
    // Convert markdown bullet points to HTML lists
    const lines = text.split('\n');
    let inList = false;
    let html = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.startsWith('* ') || line.startsWith('- ') || line.startsWith('• ')) {
        if (!inList) {
          html += '<ul style="margin: 8px 0 14px 20px;">';
          inList = true;
        }
        const cleanBullet = line.replace(/^[*\-•]\s*/, '');
        html += `<li style="margin-bottom: 6px;">${cleanBullet}</li>`;
      } else {
        if (inList) {
          html += '</ul>';
          inList = false;
        }
        if (line.length > 0) {
          if (line.startsWith('### ')) {
            html += `<h4 style="margin: 16px 0 6px; color: var(--accent-heading); font-size: 1.1rem;">${line.substring(4)}</h4>`;
          } else if (line.startsWith('## ')) {
            html += `<h3 style="margin: 20px 0 8px; color: var(--accent-heading); font-size: 1.25rem;">${line.substring(3)}</h3>`;
          } else {
            html += `<p style="margin-bottom: 12px; line-height: 1.7;">${line}</p>`;
          }
        }
      }
    }
    if (inList) html += '</ul>';
    return html;
  }

  function showToast(message) {
    if (!elements.toastNotice) return;
    elements.toastNotice.textContent = message;
    elements.toastNotice.classList.add('show');
    setTimeout(() => {
      elements.toastNotice.classList.remove('show');
    }, 2800);
  }

  // --------------------------------------------------------------------------
  // Initialization & Data Loading
  // --------------------------------------------------------------------------
  async function init() {
    loadLocalSettings();
    setupEventListeners();
    registerServiceWorker();

    try {
      const [surahsRes, storiesRes, searchRes] = await Promise.all([
        fetch('data/surahs.json'),
        fetch('data/stories.json'),
        fetch('data/search_index.json')
      ]);

      state.surahs = await surahsRes.json();
      state.stories = await storiesRes.json();
      state.searchIndex = await searchRes.json();

      renderSurahsList();
      renderStoriesList();
      renderAboutChart();
      handleHashChange();
    } catch (err) {
      console.error('Error initializing Quran App:', err);
      showToast('Offline Mode Active. Loaded cached data.');
    }
  }

  function loadLocalSettings() {
    // Theme preference
    const savedTheme = localStorage.getItem('quran_theme') || 'emerald-light';
    setTheme(savedTheme);

    // Font Scale
    const savedScale = parseInt(localStorage.getItem('quran_font_idx'), 10);
    if (!isNaN(savedScale) && savedScale >= 0 && savedScale < state.fontScales.length) {
      state.fontScaleIdx = savedScale;
      document.documentElement.style.fontSize = state.fontScales[savedScale];
    }

    // Bookmarks
    try {
      const savedBookmarks = JSON.parse(localStorage.getItem('quran_bookmarks'));
      if (savedBookmarks && Array.isArray(savedBookmarks.surahs)) {
        state.bookmarks = savedBookmarks;
      }
    } catch (e) {
      state.bookmarks = { surahs: [], stories: [] };
    }
  }

  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('quran_theme', theme);

    // Theme color meta tag
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      const headerColors = {
        'emerald-light': '#064e3b',
        'midnight': '#0b1528',
        'dark': '#071512',
        'sepia': '#5c2c10'
      };
      metaTheme.setAttribute('content', headerColors[theme] || '#064e3b');
    }

    // Update modal active state
    document.querySelectorAll('[data-theme-choice]').forEach(btn => {
      const isChoice = btn.getAttribute('data-theme-choice') === theme;
      btn.classList.toggle('active', isChoice);
      btn.setAttribute('aria-pressed', isChoice ? 'true' : 'false');
    });
  }

  // --------------------------------------------------------------------------
  // Navigation & Routing
  // --------------------------------------------------------------------------
  function switchView(viewName) {
    state.currentView = viewName;
    const views = [
      elements.surahsView,
      elements.storiesView,
      elements.bookmarksView,
      elements.aboutView,
      elements.surahDetailView,
      elements.storyDetailView
    ];

    views.forEach(v => {
      if (v) {
        v.classList.remove('active');
        v.style.display = 'none';
      }
    });

    [elements.navSurahs, elements.navStories, elements.navBookmarks, elements.navAbout].forEach(btn => {
      if (btn) btn.classList.remove('active');
    });

    if (viewName === 'surahs') {
      elements.surahsView.style.display = 'block';
      elements.surahsView.classList.add('active');
      elements.navSurahs.classList.add('active');
      elements.filterNav.style.display = 'block';
      document.title = 'All 114 Surahs – Quran Kareem';
    } else if (viewName === 'stories') {
      elements.storiesView.style.display = 'block';
      elements.storiesView.classList.add('active');
      elements.navStories.classList.add('active');
      elements.filterNav.style.display = 'none';
      document.title = 'Quranic Stories (Prophets & Righteous Figures) – Quran Kareem';
    } else if (viewName === 'bookmarks') {
      elements.bookmarksView.style.display = 'block';
      elements.bookmarksView.classList.add('active');
      elements.navBookmarks.classList.add('active');
      elements.filterNav.style.display = 'none';
      renderBookmarks();
      document.title = 'Saved Bookmarks – Quran Kareem';
    } else if (viewName === 'about') {
      elements.aboutView.style.display = 'block';
      elements.aboutView.classList.add('active');
      elements.navAbout.classList.add('active');
      elements.filterNav.style.display = 'none';
      document.title = 'About & 114 Surahs Themes Guide – Quran Kareem';
    } else if (viewName === 'surah-detail') {
      elements.surahDetailView.style.display = 'block';
      elements.surahDetailView.classList.add('active');
      elements.filterNav.style.display = 'none';
    } else if (viewName === 'story-detail') {
      elements.storyDetailView.style.display = 'block';
      elements.storyDetailView.classList.add('active');
      elements.filterNav.style.display = 'none';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleHashChange() {
    const hash = window.location.hash || '#surahs';
    if (hash.startsWith('#surah/')) {
      const id = parseInt(hash.replace('#surah/', ''), 10);
      if (!isNaN(id) && id >= 1 && id <= 114) {
        openSurahDetail(id);
      } else {
        switchView('surahs');
      }
    } else if (hash.startsWith('#story/')) {
      const storyId = hash.replace('#story/', '');
      openStoryDetail(storyId);
    } else if (hash === '#stories') {
      switchView('stories');
    } else if (hash === '#bookmarks') {
      switchView('bookmarks');
    } else if (hash === '#about') {
      switchView('about');
    } else {
      switchView('surahs');
    }
  }

  // --------------------------------------------------------------------------
  // Rendering Surahs & Stories
  // --------------------------------------------------------------------------
  function renderSurahsList(filter = state.currentFilter, searchQuery = '') {
    if (!elements.surahGrid) return;
    const query = searchQuery.trim().toLowerCase();

    const filtered = state.surahs.filter(s => {
      if (filter === 'meccan' && s.revelation !== 'Meccan') return false;
      if (filter === 'medinan' && s.revelation !== 'Medinan') return false;
      if (filter === 'grp-1-7' && (s.id < 1 || s.id > 7)) return false;
      if (filter === 'grp-17-25' && (s.id < 17 || s.id > 25)) return false;
      if (filter === 'grp-26-33' && (s.id < 26 || s.id > 33)) return false;
      if (filter === 'grp-78-114' && (s.id < 78 || s.id > 114)) return false;

      if (query) {
        const matchName = s.name.toLowerCase().includes(query) || (s.name_ascii && s.name_ascii.toLowerCase().includes(query));
        const matchArabic = s.arabic.includes(query);
        const matchMeaning = s.meaning.toLowerCase().includes(query);
        const matchTheme = (s.theme && s.theme.toLowerCase().includes(query)) || (s.core_theme && s.core_theme.toLowerCase().includes(query));
        const matchNum = s.id.toString() === query;
        return matchName || matchArabic || matchMeaning || matchTheme || matchNum;
      }
      return true;
    });

    if (filtered.length === 0) {
      elements.surahGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>No matching Surahs found</h3>
          <p>Try searching for a different Surah name, number, or keyword.</p>
        </div>
      `;
      return;
    }

    elements.surahGrid.innerHTML = filtered.map(s => `
      <article class="surah-card" tabindex="0" role="button" data-surah-id="${s.id}" aria-label="Surah ${s.id}: ${s.name}, ${s.meaning}, ${s.revelation}, ${s.verses_count} verses">
        <div class="surah-number-badge" aria-hidden="true">
          <span>${s.id}</span>
        </div>
        <div class="surah-info">
          <div class="surah-title-row">
            <h3 class="surah-english-name">${escapeHTML(s.name)}</h3>
            <span class="surah-arabic-name">${escapeHTML(s.arabic)}</span>
          </div>
          <div class="surah-meta-row">
            <span class="badge-tag ${s.revelation === 'Meccan' ? 'badge-meccan' : 'badge-medinan'}">${escapeHTML(s.revelation)}</span>
            <span>•</span>
            <span>${s.verses_count} Verses</span>
            ${s.stories_count > 0 ? `<span>•</span><span style="color: var(--accent-gold); font-weight: 700;">${s.stories_count} Stories</span>` : ''}
          </div>
          <p class="surah-theme-preview" title="${escapeHTML(s.theme)}">${escapeHTML(s.meaning)}: ${escapeHTML(s.theme)}</p>
        </div>
      </article>
    `).join('');
  }

  function renderStoriesList(category = state.currentStoryFilter, searchQuery = '') {
    if (!elements.storiesGrid) return;
    const query = searchQuery.trim().toLowerCase();

    const filtered = state.stories.filter(st => {
      if (category !== 'all' && st.category !== category) return false;
      if (query) {
        const matchTitle = st.title.toLowerCase().includes(query) || st.display_title.toLowerCase().includes(query);
        const matchArabic = st.arabic_name.includes(query);
        const matchCit = st.surah_citations.toLowerCase().includes(query);
        return matchTitle || matchArabic || matchCit;
      }
      return true;
    });

    if (filtered.length === 0) {
      elements.storiesGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>No matching Stories found</h3>
          <p>Try switching the story category filter or clearing the search query.</p>
        </div>
      `;
      return;
    }

    elements.storiesGrid.innerHTML = filtered.map(st => `
      <article class="story-card" tabindex="0" role="button" data-story-id="${st.id}" aria-label="Story: ${st.display_title}">
        <div class="story-card-header">
          <span class="story-badge badge-${st.category}">${escapeHTML(st.badge)}</span>
          <span style="font-size: 0.8rem; color: var(--text-light); font-weight: 700;">Part ${st.part}</span>
        </div>
        <h3 class="story-card-title">${escapeHTML(st.display_title)}</h3>
        ${st.arabic_name ? `<div class="story-card-arabic">${escapeHTML(st.arabic_name)}</div>` : ''}
        <p class="story-snippet">${escapeHTML(st.narrative.substring(0, 180))}...</p>
        <div class="story-citations-pills">
          <strong>Surahs:</strong> ${escapeHTML(st.surah_citations ? st.surah_citations.replace(/\*/g, '') : 'Mentioned across Quran')}
        </div>
      </article>
    `).join('');
  }

  // --------------------------------------------------------------------------
  // Surah Detail View (Zero Duplication Between Tabs)
  // --------------------------------------------------------------------------
  async function openSurahDetail(surahId) {
    state.currentSurahId = surahId;
    window.location.hash = `#surah/${surahId}`;
    switchView('surah-detail');

    let detail = state.surahDetailCache.get(surahId);
    if (!detail) {
      try {
        const res = await fetch(`data/surah_details/${surahId}.json`);
        detail = await res.json();
        state.surahDetailCache.set(surahId, detail);
      } catch (err) {
        console.error('Failed to load surah detail:', err);
        showToast('Error loading Surah details');
        return;
      }
    }

    document.title = `Surah ${detail.name} (${detail.meaning}) – Verse Breakdown & Stories`;

    // Hero Banner
    elements.surahDetailHero.innerHTML = `
      <div class="hero-detail-arabic">${escapeHTML(detail.arabic)}</div>
      <h2 class="hero-detail-title">Surah ${escapeHTML(detail.name)}</h2>
      <p class="hero-detail-meaning">${escapeHTML(detail.meaning)}</p>
      <div class="hero-tags-row">
        <span class="hero-tag">${escapeHTML(detail.revelation)}</span>
        <span class="hero-tag">${detail.verses_count} Verses</span>
        <span class="hero-tag gold">Surah #${detail.id}</span>
        ${detail.group ? `<span class="hero-tag">${escapeHTML(detail.group)}</span>` : ''}
      </div>
      <p style="margin-top: 14px; font-size: 0.95rem; color: rgba(255,255,255,0.92); line-height: 1.6;">
        <strong>Core Theme:</strong> ${escapeHTML(detail.core_theme || detail.theme)}
      </p>
    `;

    updateSurahBookmarkIcon();

    // 1. Verse Breakdowns Tab (Verses Only)
    if (detail.verse_breakdowns && detail.verse_breakdowns.length > 0) {
      elements.breakdownCardsContainer.innerHTML = detail.verse_breakdowns.map((vb, idx) => {
        let pointsHTML = '';
        if (vb.points && Array.isArray(vb.points) && vb.points.length > 0) {
          pointsHTML = `
            <div class="verse-points-list" style="margin: 14px 0 10px;">
              ${vb.points.map(p => {
                if (typeof p === 'object' && p !== null) {
                  return `
                    <div style="margin-bottom: 10px; padding: 10px 14px; background: var(--bg-card-subtle); border-radius: var(--radius-sm); border-left: 3px solid var(--accent-heading);">
                      <strong style="color: var(--accent-heading); display: block; margin-bottom: 3px;">${escapeHTML(p.label)}</strong>
                      <span style="color: var(--text-muted); line-height: 1.6;">${escapeHTML(p.detail)}</span>
                    </div>
                  `;
                }
                return `<div style="margin-bottom: 6px;">• ${escapeHTML(String(p))}</div>`;
              }).join('')}
            </div>
          `;
        }

        const contentHTML = vb.content_markdown ? formatMarkdownText(vb.content_markdown) : (vb.content ? formatMarkdownText(vb.content) : '');
        const refl = vb.reflection ? vb.reflection.trim() : '';
        const vRange = vb.verse_range || vb.verses || `Part ${idx + 1}`;
        const sTitle = vb.section_title || vb.title || `Passage ${idx + 1}`;

        return `
          <article class="verse-breakdown-card">
            <div class="verse-header-row">
              <span class="verse-range-badge">Verses ${escapeHTML(vRange)}</span>
              <span style="font-size: 0.825rem; color: var(--text-light); font-weight: 700;">Section ${idx + 1} of ${detail.verse_breakdowns.length}</span>
            </div>
            <h3 class="verse-section-title">${escapeHTML(sTitle)}</h3>
            ${contentHTML ? `<div class="verse-content-body">${contentHTML}</div>` : ''}
            ${pointsHTML}
            ${refl ? `
              <aside class="reflection-callout" role="note" aria-label="Reflection on Verses ${escapeHTML(vRange)}">
                <div class="reflection-callout-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                  <span>Spiritual &amp; Practical Reflection</span>
                </div>
                <div class="reflection-callout-text">
                  ${formatMarkdownText(refl)}
                </div>
              </aside>
            ` : ''}
          </article>
        `;
      }).join('');
    } else {
      elements.breakdownCardsContainer.innerHTML = `
        <div class="content-card-section">
          <h3>Full Surah Exegesis &amp; Overview</h3>
          <p class="formatted-prose">${escapeHTML(detail.core_theme || detail.theme)}</p>
        </div>
      `;
    }

    // 2. Stories in this Surah Tab (Stories Only)
    const storiesList = detail.stories_in_surah || detail.stories_mentioned || [];
    if (storiesList.length > 0) {
      elements.surahStoriesContainer.innerHTML = storiesList.map(st => {
        if (st.source === 'global') {
          return `
            <div class="story-chip-link" tabindex="0" role="button" data-story-id="${escapeHTML(st.id)}" aria-label="Open story: ${escapeHTML(st.title)}">
              <div style="flex: 1; padding-right: 12px;">
                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                  <span class="story-badge badge-${escapeHTML(st.category || 'prophet')}">${escapeHTML(st.badge || 'Story')}</span>
                  <strong style="font-size: 1.05rem; color: var(--text-main);">${escapeHTML(st.title)}</strong>
                </div>
                ${st.arabic_name ? `<span class="surah-arabic-name" style="font-size: 1.2rem; display: block; margin-top: 2px;">${escapeHTML(st.arabic_name)}</span>` : ''}
                ${st.snippet ? `<p style="font-size: 0.88rem; color: var(--text-muted); margin-top: 6px; line-height: 1.5;">${escapeHTML(st.snippet)}</p>` : ''}
              </div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          `;
        } else {
          // Surah-specific narrative section
          return `
            <article class="content-card-section" style="border-left: 4px solid var(--accent-gold);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <span class="badge-tag" style="background: var(--accent-gold-soft); color: var(--accent-gold-text); font-weight: 700;">Story in this Surah</span>
                ${st.verse_reference ? `<span class="badge-tag badge-medinan">${escapeHTML(st.verse_reference)}</span>` : ''}
              </div>
              <h3 style="color: var(--accent-heading);">${escapeHTML(st.title)}</h3>
              <div class="formatted-prose">${formatMarkdownText(st.content)}</div>
            </article>
          `;
        }
      }).join('');
    } else {
      elements.surahStoriesContainer.innerHTML = `
        <div class="empty-state">
          <h3>No Extended Historical Narratives in This Surah</h3>
          <p>This chapter focuses on legal principles, inner spiritual discipline, or apocalyptic reminders.</p>
        </div>
      `;
    }

    // 3. Why Named & Revelation Context Tab (Name & Revelation Only)
    let whyHTML = '';
    if (detail.name_origin) {
      whyHTML += `
        <article class="content-card-section">
          <h3>Origin of the Name &amp; Significance</h3>
          <div class="formatted-prose">${formatMarkdownText(detail.name_origin)}</div>
        </article>
      `;
    }
    if (detail.revelation_details) {
      whyHTML += `
        <article class="content-card-section">
          <h3>Circumstances of Revelation (Asbab al-Nuzul)</h3>
          <div class="formatted-prose">${formatMarkdownText(detail.revelation_details)}</div>
        </article>
      `;
    }
    if (detail.why_named_sections && detail.why_named_sections.length > 0) {
      detail.why_named_sections.forEach(sec => {
        whyHTML += `
          <article class="content-card-section">
            <h3>${escapeHTML(sec.title)}</h3>
            <div class="formatted-prose">${formatMarkdownText(sec.content)}</div>
          </article>
        `;
      });
    }
    if (!whyHTML) {
      whyHTML = `
        <article class="content-card-section">
          <h3>Surah Background</h3>
          <p class="formatted-prose">${escapeHTML(detail.core_theme || detail.theme)}</p>
        </article>
      `;
    }
    elements.surahWhyContainer.innerHTML = whyHTML;

    // 4. Deep Dives Tab (Theological & Structural Reflections Only)
    if (detail.deep_dives && detail.deep_dives.length > 0) {
      elements.surahDivesContainer.innerHTML = detail.deep_dives.map(dd => `
        <article class="content-card-section">
          ${dd.verse_reference ? `<span class="verse-range-badge" style="margin-bottom: 10px; display: inline-block;">${escapeHTML(dd.verse_reference)}</span>` : ''}
          <h3>${escapeHTML(dd.title)}</h3>
          <div class="formatted-prose">${formatMarkdownText(dd.content)}</div>
        </article>
      `).join('');
    } else {
      elements.surahDivesContainer.innerHTML = `
        <div class="empty-state">
          <h3>Key Reflections Covered in Verse Breakdown</h3>
          <p>Explore the "Verse Breakdown" tab above for detailed reflections on every passage of this Surah.</p>
        </div>
      `;
    }

    // Switch default internal tab to Verse Breakdown
    switchInternalSurahTab('tab-breakdown');
  }

  function switchInternalSurahTab(tabId) {
    const tabs = document.querySelectorAll('.segmented-tab');
    const panels = document.querySelectorAll('.tab-panel');

    tabs.forEach(tab => {
      const isActive = tab.getAttribute('data-tab') === tabId;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    panels.forEach(panel => {
      const isActive = panel.id === tabId;
      panel.classList.toggle('active', isActive);
      panel.style.display = isActive ? 'block' : 'none';
    });
  }

  // --------------------------------------------------------------------------
  // Story Detail View
  // --------------------------------------------------------------------------
  function openStoryDetail(storyId) {
    const story = state.stories.find(s => s.id === storyId);
    if (!story) {
      showToast('Story not found');
      switchView('stories');
      return;
    }

    state.currentStoryId = storyId;
    window.location.hash = `#story/${storyId}`;
    switchView('story-detail');
    document.title = `${story.display_title} – Quranic Stories`;

    // Hero Card
    elements.storyDetailHero.innerHTML = `
      ${story.arabic_name ? `<div class="hero-detail-arabic">${escapeHTML(story.arabic_name)}</div>` : ''}
      <h2 class="hero-detail-title">${escapeHTML(story.display_title)}</h2>
      <p class="hero-detail-meaning">${escapeHTML(story.category_label)}</p>
      <div class="hero-tags-row">
        <span class="hero-tag gold">Part ${story.part}</span>
        <span class="hero-tag">${escapeHTML(story.badge)}</span>
        <span class="hero-tag">Story #${story.num_in_part}</span>
      </div>
    `;

    updateStoryBookmarkIcon();

    // Citations & Surah Chips
    elements.storyCitationsRaw.textContent = story.surah_citations ? story.surah_citations.replace(/\*/g, '') : '';
    if (story.referenced_surahs && story.referenced_surahs.length > 0) {
      elements.storySurahChipsContainer.innerHTML = story.referenced_surahs.map(sId => {
        const surah = state.surahs.find(s => s.id === sId);
        const name = surah ? surah.name : `Surah ${sId}`;
        return `
          <button type="button" class="chip-btn" data-jump-surah="${sId}" title="Read Surah ${name}">
            <span>Surah ${sId}: ${escapeHTML(name)}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
        `;
      }).join('');
    } else {
      elements.storySurahChipsContainer.innerHTML = '<span style="font-size: 0.85rem; color: var(--text-light);">Citations detailed in narrative text.</span>';
    }

    // Detailed Narrative (Using structured narrative_points if present)
    let narrativeHTML = '';
    if (story.narrative_points && Array.isArray(story.narrative_points) && story.narrative_points.length > 0) {
      narrativeHTML = story.narrative_points.map(p => {
        if (typeof p === 'object' && p !== null) {
          return `
            <div style="margin-bottom: 16px; padding: 14px 18px; background: var(--bg-card-subtle); border-radius: var(--radius-sm); border-left: 3px solid var(--accent-heading);">
              <h4 style="color: var(--accent-heading); font-size: 1.05rem; margin-bottom: 4px;">${escapeHTML(p.label)}</h4>
              <p style="color: var(--text-muted); line-height: 1.7; margin: 0;">${escapeHTML(p.detail)}</p>
            </div>
          `;
        }
        return `<p style="margin-bottom: 12px;">${formatMarkdownText(String(p))}</p>`;
      }).join('');
    } else if (story.narrative) {
      narrativeHTML = formatMarkdownText(story.narrative);
    }
    elements.storyNarrativeContainer.innerHTML = narrativeHTML;

    // Lessons
    if (story.lessons) {
      elements.storyLessonsSection.style.display = 'block';
      elements.storyLessonsContainer.innerHTML = formatMarkdownText(story.lessons);
    } else {
      elements.storyLessonsSection.style.display = 'none';
    }

    // Theological Significance
    if (story.theological_significance) {
      elements.storyTheoSection.style.display = 'block';
      elements.storyTheoContainer.innerHTML = formatMarkdownText(story.theological_significance);
    } else {
      elements.storyTheoSection.style.display = 'none';
    }
  }

  // --------------------------------------------------------------------------
  // Bookmarks Management
  // --------------------------------------------------------------------------
  function toggleSurahBookmark() {
    if (!state.currentSurahId) return;
    const id = state.currentSurahId;
    const idx = state.bookmarks.surahs.indexOf(id);
    if (idx > -1) {
      state.bookmarks.surahs.splice(idx, 1);
      showToast(`Removed Surah ${id} from Bookmarks`);
    } else {
      state.bookmarks.surahs.push(id);
      showToast(`Saved Surah ${id} to Bookmarks`);
    }
    saveBookmarks();
    updateSurahBookmarkIcon();
  }

  function toggleStoryBookmark() {
    if (!state.currentStoryId) return;
    const id = state.currentStoryId;
    const idx = state.bookmarks.stories.indexOf(id);
    if (idx > -1) {
      state.bookmarks.stories.splice(idx, 1);
      showToast('Removed story from Bookmarks');
    } else {
      state.bookmarks.stories.push(id);
      showToast('Saved story to Bookmarks');
    }
    saveBookmarks();
    updateStoryBookmarkIcon();
  }

  function saveBookmarks() {
    localStorage.setItem('quran_bookmarks', JSON.stringify(state.bookmarks));
  }

  function updateSurahBookmarkIcon() {
    const isBookmarked = state.bookmarks.surahs.includes(state.currentSurahId);
    elements.surahBookmarkIcon.setAttribute('fill', isBookmarked ? 'currentColor' : 'none');
    elements.surahBookmarkIcon.style.color = isBookmarked ? 'var(--accent-gold)' : 'currentColor';
  }

  function updateStoryBookmarkIcon() {
    const isBookmarked = state.bookmarks.stories.includes(state.currentStoryId);
    elements.storyBookmarkIcon.setAttribute('fill', isBookmarked ? 'currentColor' : 'none');
    elements.storyBookmarkIcon.style.color = isBookmarked ? 'var(--accent-gold)' : 'currentColor';
  }

  function renderBookmarks() {
    if (!elements.bookmarksList) return;
    const savedSurahs = state.surahs.filter(s => state.bookmarks.surahs.includes(s.id));
    const savedStories = state.stories.filter(st => state.bookmarks.stories.includes(st.id));

    if (savedSurahs.length === 0 && savedStories.length === 0) {
      elements.bookmarksList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          <h3>No Bookmarks Saved Yet</h3>
          <p>Tap the star icon on any Surah or Quranic story to bookmark it for quick access.</p>
        </div>
      `;
      return;
    }

    let html = '';
    if (savedSurahs.length > 0) {
      html += '<h3 style="grid-column: 1 / -1; margin: 12px 0 6px; color: var(--accent-heading);">Saved Surahs</h3>';
      html += savedSurahs.map(s => `
        <article class="surah-card" tabindex="0" role="button" data-surah-id="${s.id}">
          <div class="surah-number-badge"><span>${s.id}</span></div>
          <div class="surah-info">
            <div class="surah-title-row">
              <h4 class="surah-english-name">${escapeHTML(s.name)}</h4>
              <span class="surah-arabic-name">${escapeHTML(s.arabic)}</span>
            </div>
            <p class="surah-theme-preview">${escapeHTML(s.meaning)}</p>
          </div>
        </article>
      `).join('');
    }

    if (savedStories.length > 0) {
      html += '<h3 style="grid-column: 1 / -1; margin: 20px 0 6px; color: var(--accent-heading);">Saved Stories</h3>';
      html += savedStories.map(st => `
        <article class="story-card" tabindex="0" role="button" data-story-id="${st.id}">
          <div class="story-card-header">
            <span class="story-badge badge-${st.category}">${escapeHTML(st.badge)}</span>
          </div>
          <h4 class="story-card-title">${escapeHTML(st.display_title)}</h4>
          <p class="story-snippet">${escapeHTML(st.narrative.substring(0, 120))}...</p>
        </article>
      `).join('');
    }

    elements.bookmarksList.innerHTML = html;
  }

  function renderAboutChart() {
    if (!elements.themesSummaryChart || state.surahs.length === 0) return;
    elements.themesSummaryChart.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; margin-top: 14px;">
        ${state.surahs.map(s => `
          <div style="background: var(--bg-card-subtle); padding: 14px; border-radius: var(--radius-sm); border: 1.5px solid var(--border-light);">
            <strong style="color: var(--accent-heading);">${s.id}. ${escapeHTML(s.name)}</strong> (${escapeHTML(s.arabic)})
            <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px; line-height: 1.5;">${escapeHTML(s.theme)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // Instant Search Engine
  // --------------------------------------------------------------------------
  function handleSearchInput(e) {
    const val = e.target.value.trim().toLowerCase();
    elements.clearSearchBtn.classList.toggle('visible', val.length > 0);

    if (val.length < 2) {
      elements.searchResultsTray.classList.remove('open');
      elements.searchResultsTray.innerHTML = '';
      if (state.currentView === 'surahs') renderSurahsList(state.currentFilter, '');
      if (state.currentView === 'stories') renderStoriesList(state.currentStoryFilter, '');
      return;
    }

    const results = state.searchIndex.filter(item => {
      return item.keywords.toLowerCase().includes(val) || item.title.toLowerCase().includes(val);
    }).slice(0, 10);

    if (results.length === 0) {
      elements.searchResultsTray.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-light);">No results found</div>';
      elements.searchResultsTray.classList.add('open');
      return;
    }

    elements.searchResultsTray.innerHTML = results.map(item => `
      <div class="search-result-item" tabindex="0" role="option" data-search-type="${item.type}" data-search-id="${item.id}">
        <div>
          <div style="font-weight: 700; color: var(--text-main); font-size: 0.95rem;">${escapeHTML(item.title)}</div>
          <div style="font-size: 0.8rem; color: var(--text-light);">${escapeHTML(item.subtitle)}</div>
          ${item.snippet ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${escapeHTML(item.snippet)}</div>` : ''}
        </div>
        ${item.arabic ? `<span class="surah-arabic-name" style="font-size: 1.2rem;">${escapeHTML(item.arabic)}</span>` : ''}
      </div>
    `).join('');
    elements.searchResultsTray.classList.add('open');

    if (state.currentView === 'surahs') renderSurahsList(state.currentFilter, val);
    if (state.currentView === 'stories') renderStoriesList(state.currentStoryFilter, val);
  }

  // --------------------------------------------------------------------------
  // Event Listeners
  // --------------------------------------------------------------------------
  function setupEventListeners() {
    window.addEventListener('hashchange', handleHashChange);

    elements.navSurahs.addEventListener('click', () => { window.location.hash = '#surahs'; });
    elements.navStories.addEventListener('click', () => { window.location.hash = '#stories'; });
    elements.navBookmarks.addEventListener('click', () => { window.location.hash = '#bookmarks'; });
    elements.navAbout.addEventListener('click', () => { window.location.hash = '#about'; });
    elements.headerLogoBtn.addEventListener('click', () => { window.location.hash = '#surahs'; });

    elements.surahBackBtn.addEventListener('click', () => { window.location.hash = '#surahs'; });
    elements.storyBackBtn.addEventListener('click', () => { window.location.hash = '#stories'; });

    elements.bookmarkSurahBtn.addEventListener('click', toggleSurahBookmark);
    elements.bookmarkStoryBtn.addEventListener('click', toggleStoryBookmark);

    // Theme Switcher Modal Controls
    elements.themeToggleBtn.addEventListener('click', () => {
      elements.themeModalBackdrop.classList.add('open');
    });

    elements.closeThemeModalBtn.addEventListener('click', () => {
      elements.themeModalBackdrop.classList.remove('open');
    });

    elements.themeModalBackdrop.addEventListener('click', (e) => {
      if (e.target === elements.themeModalBackdrop) {
        elements.themeModalBackdrop.classList.remove('open');
      }
    });

    // Theme Choices (4 themes)
    document.querySelectorAll('[data-theme-choice]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const choice = e.currentTarget.getAttribute('data-theme-choice');
        setTheme(choice);
        const labels = {
          'emerald-light': 'Emerald Light',
          'midnight': 'Midnight Blue',
          'dark': 'Forest Dark',
          'sepia': 'Desert Sepia'
        };
        showToast(`Theme: ${labels[choice] || choice}`);
        setTimeout(() => {
          elements.themeModalBackdrop.classList.remove('open');
        }, 150);
      });
    });

    elements.fontSizeBtn.addEventListener('click', () => {
      state.fontScaleIdx = (state.fontScaleIdx + 1) % state.fontScales.length;
      document.documentElement.style.fontSize = state.fontScales[state.fontScaleIdx];
      localStorage.setItem('quran_font_idx', state.fontScaleIdx);
      const labels = ['Standard', 'Comfortable (+12%)', 'Large (+25%)'];
      showToast(`Font Size: ${labels[state.fontScaleIdx]}`);
    });

    elements.globalSearchInput.addEventListener('input', handleSearchInput);
    elements.clearSearchBtn.addEventListener('click', () => {
      elements.globalSearchInput.value = '';
      elements.clearSearchBtn.classList.remove('visible');
      elements.searchResultsTray.classList.remove('open');
      if (state.currentView === 'surahs') renderSurahsList();
      if (state.currentView === 'stories') renderStoriesList();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-container')) {
        elements.searchResultsTray.classList.remove('open');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        elements.searchResultsTray.classList.remove('open');
        elements.themeModalBackdrop.classList.remove('open');
      }
    });

    elements.filterChipsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.chip-btn');
      if (!btn) return;
      document.querySelectorAll('#filterChipsContainer .chip-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      state.currentFilter = btn.getAttribute('data-filter');
      renderSurahsList(state.currentFilter, elements.globalSearchInput.value);
    });

    document.querySelectorAll('[data-story-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('[data-story-filter]').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        e.currentTarget.classList.add('active');
        e.currentTarget.setAttribute('aria-selected', 'true');
        state.currentStoryFilter = e.currentTarget.getAttribute('data-story-filter');
        renderStoriesList(state.currentStoryFilter, elements.globalSearchInput.value);
      });
    });

    document.querySelectorAll('.segmented-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        const tabId = e.currentTarget.getAttribute('data-tab');
        switchInternalSurahTab(tabId);
      });
    });

    document.addEventListener('click', (e) => {
      const card = e.target.closest('[data-surah-id]');
      if (card) {
        const id = parseInt(card.getAttribute('data-surah-id'), 10);
        openSurahDetail(id);
        return;
      }

      const storyCard = e.target.closest('[data-story-id]');
      if (storyCard) {
        const id = storyCard.getAttribute('data-story-id');
        openStoryDetail(id);
        return;
      }

      const jumpChip = e.target.closest('[data-jump-surah]');
      if (jumpChip) {
        const sId = parseInt(jumpChip.getAttribute('data-jump-surah'), 10);
        openSurahDetail(sId);
        return;
      }

      const searchItem = e.target.closest('[data-search-type]');
      if (searchItem) {
        const type = searchItem.getAttribute('data-search-type');
        const id = searchItem.getAttribute('data-search-id');
        elements.searchResultsTray.classList.remove('open');
        elements.globalSearchInput.value = '';
        elements.clearSearchBtn.classList.remove('visible');
        if (type === 'surah') {
          openSurahDetail(parseInt(id, 10));
        } else {
          openStoryDetail(id);
        }
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const btnRole = e.target.closest('[role="button"]');
        if (btnRole && btnRole.tagName !== 'BUTTON') {
          e.preventDefault();
          btnRole.click();
        }
      }
    });
  }

  // --------------------------------------------------------------------------
  // Service Worker Registration (PWA Offline)
  // --------------------------------------------------------------------------
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then((registration) => {
            console.log('ServiceWorker registered:', registration.scope);
          })
          .catch((error) => {
            console.warn('ServiceWorker registration skipped:', error);
          });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
