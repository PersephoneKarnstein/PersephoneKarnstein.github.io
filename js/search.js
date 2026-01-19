(function() {
  'use strict';

  let searchIndex = null;
  let searchData = null;
  let selectedIndex = -1;

  let searchInput = null;
  let searchResults = null;
  let searchWrapper = null;

  function init() {
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    searchWrapper = document.querySelector('.search-wrapper');

    if (!searchInput || !searchResults) return;

    loadSearchIndex();

    searchInput.addEventListener('input', debounce(handleSearch, 150));
    searchInput.addEventListener('keydown', handleKeydown);
    searchInput.addEventListener('focus', handleFocus);
    document.addEventListener('click', handleClickOutside);

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape' && searchResults.classList.contains('visible')) {
        closeResults();
        searchInput.blur();
      }
    });
  }

  function loadSearchIndex() {
    fetch('/index.json')
      .then(function(response) {
        if (!response.ok) throw new Error('Search index not found');
        return response.json();
      })
      .then(function(data) {
        searchData = data;
        searchIndex = lunr(function() {
          this.ref('permalink');
          this.field('title', { boost: 10 });
          this.field('tags', { boost: 5 });
          this.field('summary', { boost: 2 });
          this.field('content');

          data.forEach(function(doc) {
            this.add(doc);
          }, this);
        });
      })
      .catch(function(error) {
        console.error('Error loading search index:', error);
      });
  }

  function handleSearch() {
    const query = searchInput.value.trim();

    if (query.length < 2) {
      closeResults();
      return;
    }

    if (!searchIndex) {
      showMessage('Search is loading...');
      return;
    }

    let results;
    try {
      results = searchIndex.search(query);
      if (results.length === 0) {
        results = searchIndex.search(query + '*');
      }
      if (results.length === 0) {
        results = searchIndex.search(query + '~1');
      }
    } catch (e) {
      results = [];
    }

    if (results.length === 0) {
      showMessage('No results found');
      return;
    }

    displayResults(results.slice(0, 8));
  }

  function positionResults() {
    if (!searchWrapper || !searchResults) return;
    const rect = searchWrapper.getBoundingClientRect();
    searchResults.style.top = (rect.bottom + 4) + 'px';
    searchResults.style.right = (window.innerWidth - rect.right) + 'px';
  }

  function displayResults(results) {
    selectedIndex = -1;

    const html = results.map(function(result, index) {
      const item = searchData.find(function(d) {
        return d.permalink === result.ref;
      });
      if (!item) return '';

      return '<li class="search-result-item" data-index="' + index + '">' +
        '<a href="' + item.permalink + '">' +
          '<span class="search-result-title">' + escapeHtml(item.title) + '</span>' +
          '<span class="search-result-date">' + item.date + '</span>' +
          '<span class="search-result-summary">' + escapeHtml(item.summary || '') + '</span>' +
        '</a>' +
      '</li>';
    }).join('');

    searchResults.innerHTML = '<ul>' + html + '</ul>';
    positionResults();
    searchResults.classList.add('visible');

    const items = searchResults.querySelectorAll('.search-result-item');
    items.forEach(function(item, index) {
      item.addEventListener('mouseenter', function() {
        setSelected(index);
      });
    });
  }

  function showMessage(message) {
    searchResults.innerHTML = '<div class="search-message">' + message + '</div>';
    positionResults();
    searchResults.classList.add('visible');
  }

  function closeResults() {
    searchResults.classList.remove('visible');
    selectedIndex = -1;
  }

  function handleKeydown(e) {
    const items = searchResults.querySelectorAll('.search-result-item');

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelected(Math.min(selectedIndex + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelected(Math.max(selectedIndex - 1, -1));
        break;
      case 'Enter':
        if (selectedIndex >= 0 && items[selectedIndex]) {
          e.preventDefault();
          const link = items[selectedIndex].querySelector('a');
          if (link) window.location.href = link.href;
        }
        break;
      case 'Escape':
        closeResults();
        searchInput.blur();
        break;
    }
  }

  function setSelected(index) {
    const items = searchResults.querySelectorAll('.search-result-item');
    items.forEach(function(item, i) {
      item.classList.toggle('selected', i === index);
    });
    selectedIndex = index;

    if (index >= 0 && items[index]) {
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  function handleFocus() {
    if (searchInput.value.trim().length >= 2) {
      handleSearch();
    }
  }

  function handleClickOutside(e) {
    if (searchWrapper && !searchWrapper.contains(e.target) && !searchResults.contains(e.target)) {
      closeResults();
    }
  }

  function debounce(fn, delay) {
    let timeout;
    return function() {
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        fn.apply(null, args);
      }, delay);
    };
  }

  function decodeHtml(text) {
    const div = document.createElement('div');
    div.innerHTML = text;
    return div.textContent;
  }

  function escapeHtml(text) {
    const decoded = decodeHtml(text);
    const div = document.createElement('div');
    div.textContent = decoded;
    return div.innerHTML;
  }

  document.addEventListener('DOMContentLoaded', init);
})();
