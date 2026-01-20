// Auto-number figures with captions
document.addEventListener('DOMContentLoaded', function() {
  // Find all figures within post content that have figcaptions
  const figures = document.querySelectorAll('.post-content figure');
  let figureNumber = 1;

  figures.forEach(function(figure) {
    const figcaption = figure.querySelector('figcaption');
    if (!figcaption) return; // Skip figures without captions

    const paragraph = figcaption.querySelector('p');
    if (!paragraph) return;

    const text = paragraph.innerHTML;

    // Remove existing "Figure N: " prefix if present (case-insensitive)
    const cleanedText = text.replace(/^Figure\s*\d+\s*:\s*/i, '');

    // Prepend the auto-generated figure number
    paragraph.innerHTML = 'Figure ' + figureNumber + ': ' + cleanedText;

    // Add an id to the figure for potential cross-referencing
    if (!figure.id) {
      figure.id = 'figure-' + figureNumber;
    }

    figureNumber++;
  });
});
