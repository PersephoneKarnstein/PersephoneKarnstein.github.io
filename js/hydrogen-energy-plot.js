// Hydrogen atom energy levels plot
document.addEventListener('DOMContentLoaded', function() {
  var n = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  var E = n.map(function(ni) { return -13.6 / (ni * ni); });

  var traces = n.map(function(ni, i) {
    return {
      x: [0, 1],
      y: [E[i], E[i]],
      mode: 'lines',
      name: 'n = ' + ni,
      line: { width: 2 },
      hovertemplate: 'n = ' + ni + '<br>E = ' + E[i].toFixed(3) + ' eV<extra></extra>'
    };
  });

  traces.push({
    x: [0, 1],
    y: [0, 0],
    mode: 'lines',
    name: 'Ionization (E = 0)',
    line: { dash: 'dash', color: '#888', width: 1 }
  });

  var layout = {
    title: { text: 'Hydrogen Atom Energy Levels', font: { family: 'serif', size: 16 } },
    xaxis: { visible: false },
    yaxis: { title: { text: 'Energy (eV)', font: { family: 'serif' } }, range: [-15, 1] },
    showlegend: true,
    legend: { x: 1.02, y: 1, font: { family: 'serif', size: 10 } },
    margin: { l: 60, r: 100, t: 50, b: 30 },
    font: { family: 'serif' }
  };

  var config = { responsive: true };

  Plotly.newPlot('hydrogen-energy-plot', traces, layout, config);
});
