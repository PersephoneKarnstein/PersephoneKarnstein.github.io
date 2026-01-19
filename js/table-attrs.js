// Parse HTML comments before tables and apply attributes
document.addEventListener('DOMContentLoaded', function() {
  var containers = document.querySelectorAll('.table-container[data-table-marker]');

  containers.forEach(function(container) {
    var prev = container.previousSibling;

    // Walk back through previous siblings to find a comment
    while (prev) {
      if (prev.nodeType === 8) { // Comment node
        var comment = prev.textContent.trim();

        // Check if it's a table attributes comment
        if (comment.startsWith('table:')) {
          var attrs = comment.substring(6).trim();

          // Parse wide attribute
          if (/wide\s*=\s*true/i.test(attrs)) {
            container.classList.add('wide');
          }

          // Parse caption attribute
          var captionMatch = attrs.match(/caption\s*=\s*"([^"]+)"/i);
          if (captionMatch) {
            var caption = document.createElement('p');
            caption.className = 'table-caption';
            caption.textContent = captionMatch[1];
            container.appendChild(caption);
          }

          // Remove the comment from DOM
          prev.remove();
          break;
        }
      }

      // Skip whitespace text nodes
      if (prev.nodeType === 3 && prev.textContent.trim() === '') {
        prev = prev.previousSibling;
        continue;
      }

      // Stop if we hit a non-whitespace element
      if (prev.nodeType === 1) {
        break;
      }

      prev = prev.previousSibling;
    }

    // Remove the marker attribute
    container.removeAttribute('data-table-marker');
  });
});
