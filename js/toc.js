/**
 * Table of Contents - Dynamic generation and toggle functionality
 * Builds TOC from all h2/h3 headings including shortcode-generated ones
 * If section breaks exist, they become top-level with markdown sections nested underneath
 */
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    var sidebar = document.getElementById('toc-sidebar');
    var toggle = document.getElementById('toc-toggle');
    var tocContainer = document.getElementById('toc-list');

    if (!sidebar || !toggle || !tocContainer) return;

    // Find all headings in the post content
    var postContent = document.querySelector('.post-content');
    if (!postContent) return;

    var headings = postContent.querySelectorAll('h2, h3');
    if (headings.length === 0) {
      // No headings, hide the sidebar entirely
      sidebar.style.display = 'none';
      return;
    }

    // Get article title
    var titleElement = document.querySelector('.post-title');
    var articleTitle = titleElement ? titleElement.textContent.trim() : 'Top';

    // Check for footnotes section
    var footnotesSection = postContent.querySelector('.footnotes');

    // Check if section breaks exist (these have class 'section-break-title')
    var sectionBreaks = postContent.querySelectorAll('h2.section-break-title');
    var hasSectionBreaks = sectionBreaks.length > 0;

    // Build the TOC with hierarchical numbering
    var tocHTML = '<ul>';
    var headingData = [];

    // Add title link at the top
    tocHTML += '<li class="toc-title-link"><a href="#top">' + articleTitle + '</a></li>';
    headingData.push({ element: titleElement || document.body, id: 'top', isTitle: true });

    if (hasSectionBreaks) {
      // Section breaks are top-level, markdown sections are nested
      var sectionCounter = 0;
      var h2Counter = 0;
      var h3Counter = 0;

      headings.forEach(function(heading, index) {
        // Ensure heading has an ID for linking
        if (!heading.id) {
          heading.id = 'heading-' + index;
        }

        var isSectionBreak = heading.classList.contains('section-break-title');
        var level = heading.tagName.toLowerCase();
        var text = heading.textContent.trim();
        var id = heading.id;
        var number = '';
        var cssClass = '';

        if (isSectionBreak) {
          // Section break = top level
          sectionCounter++;
          h2Counter = 0;
          h3Counter = 0;
          number = sectionCounter + '.';
          cssClass = '';
        } else if (level === 'h2') {
          // Regular h2 = secondary level under section break
          h2Counter++;
          h3Counter = 0;
          number = sectionCounter + '.' + h2Counter + '.';
          cssClass = ' class="toc-h3"'; // Use h3 styling for nested appearance
        } else if (level === 'h3') {
          // h3 = tertiary level
          h3Counter++;
          number = sectionCounter + '.' + h2Counter + '.' + h3Counter + '.';
          cssClass = ' class="toc-h4"'; // Deeper nesting
        }

        headingData.push({ element: heading, id: id });
        tocHTML += '<li' + cssClass + '><a href="#' + id + '"><span class="toc-number">' + number + '</span> ' + text + '</a></li>';
      });
    } else {
      // No section breaks - original behavior: h2 is top level, h3 is nested
      var h2Counter = 0;
      var h3Counter = 0;

      headings.forEach(function(heading, index) {
        // Ensure heading has an ID for linking
        if (!heading.id) {
          heading.id = 'heading-' + index;
        }

        var level = heading.tagName.toLowerCase();
        var text = heading.textContent.trim();
        var id = heading.id;
        var number = '';

        if (level === 'h2') {
          h2Counter++;
          h3Counter = 0; // Reset subsection counter
          number = h2Counter + '.';
        } else if (level === 'h3') {
          h3Counter++;
          number = h2Counter + '.' + h3Counter + '.';
        }

        headingData.push({ element: heading, id: id });

        var cssClass = level === 'h3' ? ' class="toc-h3"' : '';
        tocHTML += '<li' + cssClass + '><a href="#' + id + '"><span class="toc-number">' + number + '</span> ' + text + '</a></li>';
      });
    }

    // Add footnotes link at the bottom if footnotes exist
    if (footnotesSection) {
      if (!footnotesSection.id) {
        footnotesSection.id = 'footnotes';
      }
      tocHTML += '<li class="toc-footnotes-link"><a href="#' + footnotesSection.id + '">Footnotes</a></li>';
      headingData.push({ element: footnotesSection, id: footnotesSection.id, isFootnotes: true });
    }

    tocHTML += '</ul>';
    tocContainer.innerHTML = tocHTML;

    // Get the newly created links
    var tocLinks = tocContainer.querySelectorAll('a');

    // Toggle sidebar visibility
    toggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
      document.body.classList.toggle('toc-open');

      // Save preference to localStorage
      var isOpen = sidebar.classList.contains('open');
      localStorage.setItem('toc-open', isOpen ? 'true' : 'false');
    });

    // Restore preference from localStorage
    var savedState = localStorage.getItem('toc-open');
    if (savedState === 'true') {
      sidebar.classList.add('open');
      document.body.classList.add('toc-open');
    }

    // Active section highlighting on scroll
    function updateActiveLink() {
      var scrollPosition = window.scrollY + 120;

      // Find the current section
      var currentIndex = -1;
      for (var i = headingData.length - 1; i >= 0; i--) {
        if (headingData[i].element.offsetTop <= scrollPosition) {
          currentIndex = i;
          break;
        }
      }

      // Update active states
      tocLinks.forEach(function(link, index) {
        if (index === currentIndex) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    // Throttle scroll handler for performance
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });

    // Initial call
    updateActiveLink();

    // Smooth scroll when clicking TOC links
    tocLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var id = this.getAttribute('href');
        if (id && id.startsWith('#')) {
          e.preventDefault();
          if (id === '#top') {
            // Scroll to top of page for title link
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            var target = document.getElementById(id.substring(1));
            if (target) {
              target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
          history.pushState(null, null, id);
        }
      });
    });
  });
})();
