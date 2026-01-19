// Tag Filter functionality
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    const wrapper = document.querySelector('.tag-filter-wrapper');
    const icon = document.querySelector('.tag-filter-icon');
    const dropdown = document.querySelector('.tag-filter-dropdown');
    const items = document.querySelectorAll('.tag-filter-item');
    const catalogue = document.querySelector('.catalogue');

    if (!wrapper || !dropdown) return;

    let currentTag = '';

    // Check for tag parameter in URL on page load (only on home page with catalogue)
    if (catalogue) {
      const urlParams = new URLSearchParams(window.location.search);
      const tagParam = urlParams.get('tag');
      if (tagParam) {
        currentTag = tagParam;
        // Update selection state
        items.forEach(function(item) {
          if (item.getAttribute('data-tag') === tagParam) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
        // Update icon state
        icon.classList.add('filtering');
        // Filter posts
        filterPosts(tagParam);
      }
    }

    // Handle tag selection
    items.forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();

        const tag = this.getAttribute('data-tag');

        // If not on the home page (no catalogue), navigate to home with tag parameter
        if (!catalogue) {
          const baseUrl = window.location.origin + '/';
          if (tag) {
            window.location.href = baseUrl + '?tag=' + encodeURIComponent(tag);
          } else {
            window.location.href = baseUrl;
          }
          return;
        }

        // Update selection state
        items.forEach(function(i) {
          i.classList.remove('selected');
        });
        this.classList.add('selected');

        // Update current tag
        currentTag = tag;

        // Update icon state
        if (tag) {
          icon.classList.add('filtering');
        } else {
          icon.classList.remove('filtering');
        }

        // Filter posts
        filterPosts(tag);

        // Update URL without page reload
        const url = new URL(window.location);
        if (tag) {
          url.searchParams.set('tag', tag);
        } else {
          url.searchParams.delete('tag');
        }
        window.history.replaceState({}, '', url);
      });
    });

    function filterPosts(tag) {
      const posts = catalogue.querySelectorAll('.catalogue-item');
      let visibleCount = 0;

      posts.forEach(function(post) {
        const postTags = (post.getAttribute('data-tags') || '').toLowerCase().split(',').map(function(t) {
          return t.trim();
        });

        if (!tag || postTags.includes(tag.toLowerCase())) {
          post.classList.remove('filtered-out');
          visibleCount++;
        } else {
          post.classList.add('filtered-out');
        }
      });

      // Handle no results
      const existingMsg = catalogue.querySelector('.tag-filter-no-results');
      if (visibleCount === 0 && tag) {
        if (!existingMsg) {
          const msg = document.createElement('div');
          msg.className = 'tag-filter-no-results';
          msg.textContent = 'No posts found with tag "' + tag + '"';
          catalogue.appendChild(msg);
        }
      } else if (existingMsg) {
        existingMsg.remove();
      }
    }

    // Keep dropdown open while interacting with it
    wrapper.addEventListener('mouseleave', function() {
      // Dropdown will close via CSS
    });

    // Close dropdown when clicking outside (for touch devices)
    document.addEventListener('click', function(e) {
      if (!wrapper.contains(e.target)) {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(-8px)';
      }
    });

    // Reset styles when hovering back
    wrapper.addEventListener('mouseenter', function() {
      dropdown.style.opacity = '';
      dropdown.style.visibility = '';
      dropdown.style.transform = '';
    });
  });
})();
