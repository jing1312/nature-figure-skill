/** FigureForge — SVG Skeleton Templates
 * 10 chart-type + 6 layout templates. Editable elements carry data-edit="true". */
const C={bd:"#484878",bm:"#7884B4",bs:"#B4C0E4",ot:"#E4E4F0",ob:"#E4CCD8",ol:"#F0C0CC",nl:"#D8D8D8",nm:"#A8A8A8",nd:"#606060",up:"#2E9E44",dn:"#E53935",W:"#FFFFFF",gr:"#E6E6E6",ax:"#333333"};
const F="'Arial',sans-serif";
const CHART_TEMPLATES={};

// 1. Bar Chart
CHART_TEMPLATES.bar={name:"Bar Chart",icon:"📊",category:"chart",description:"Grouped or single bars comparing methods",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="60" y1="230" x2="60" y2="60" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="60" y1="230" x2="370" y2="230" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <rect x="80" y="80" width="30" height="150" fill="${C.bd}" data-edit="true" data-role="bar"/>
  <rect x="130" y="110" width="30" height="120" fill="${C.bm}" data-edit="true" data-role="bar"/>
  <rect x="180" y="60" width="30" height="170" fill="${C.bs}" data-edit="true" data-role="bar"/>
  <rect x="230" y="130" width="30" height="100" fill="${C.ot}" data-edit="true" data-role="bar"/>
  <rect x="280" y="95" width="30" height="135" fill="${C.ob}" data-edit="true" data-role="bar"/>
  <rect x="330" y="115" width="30" height="115" fill="${C.ol}" data-edit="true" data-role="bar"/>
  <rect x="100" y="20" width="10" height="10" fill="${C.bd}" data-edit="true" data-role="legend-marker"/>
  <text x="115" y="29" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Method A</text>
  <rect x="175" y="20" width="10" height="10" fill="${C.bm}" data-edit="true" data-role="legend-marker"/>
  <text x="190" y="29" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Method B</text>
  <rect x="250" y="20" width="10" height="10" fill="${C.bs}" data-edit="true" data-role="legend-marker"/>
  <text x="265" y="29" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Method C</text>
  <text x="215" y="265" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="axis-label">Category</text>
  <text x="20" y="145" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" transform="rotate(-90 20 145)" data-edit="true" data-role="axis-label">Accuracy</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Performance Comparison</text>
</svg>`};

// 2. Line / Trend
CHART_TEMPLATES.line={name:"Line / Trend",icon:"📈",category:"chart",description:"Trend lines showing change over time",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="60" y1="230" x2="60" y2="60" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="60" y1="230" x2="370" y2="230" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <polyline points="60,200 120,170 180,140 240,100 300,80 370,65" fill="none" stroke="${C.bd}" stroke-width="1.5" data-edit="true" data-role="line"/>
  <polyline points="60,210 120,195 180,175 240,160 300,140 370,120" fill="none" stroke="${C.bm}" stroke-width="1.5" data-edit="true" data-role="line"/>
  <polyline points="60,220 120,215 180,205 240,195 300,180 370,170" fill="none" stroke="${C.bs}" stroke-width="1.5" data-edit="true" data-role="line"/>
  <circle cx="120" cy="170" r="2.5" fill="${C.bd}" data-edit="true" data-role="marker"/>
  <circle cx="240" cy="100" r="2.5" fill="${C.bd}" data-edit="true" data-role="marker"/>
  <circle cx="370" cy="65" r="2.5" fill="${C.bd}" data-edit="true" data-role="marker"/>
  <text x="215" y="265" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="axis-label">Epoch</text>
  <text x="20" y="145" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" transform="rotate(-90 20 145)" data-edit="true" data-role="axis-label">Loss</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Training Curves</text>
  <text x="340" y="60" font-family="${F}" font-size="7" fill="${C.bd}" data-edit="true" data-role="legend">Ours</text>
  <text x="340" y="115" font-family="${F}" font-size="7" fill="${C.bm}" data-edit="true" data-role="legend">Baseline</text>
</svg>`};

// 3. Heatmap
CHART_TEMPLATES.heatmap={name:"Heatmap",icon:"🔥",category:"chart",description:"2D intensity grid for correlation/attention",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Attention Weights</text>
  <rect x="80" y="40" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="120" y="40" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="160" y="40" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="200" y="40" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="240" y="40" width="40" height="30" fill="${C.ol}" data-edit="true" data-role="cell"/>
  <rect x="80" y="70" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="120" y="70" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="160" y="70" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="200" y="70" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="240" y="70" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="80" y="100" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="120" y="100" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="160" y="100" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="200" y="100" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="240" y="100" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="80" y="130" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="120" y="130" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="160" y="130" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="200" y="130" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="240" y="130" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="80" y="160" width="40" height="30" fill="${C.ol}" data-edit="true" data-role="cell"/>
  <rect x="120" y="160" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="160" y="160" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="200" y="160" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="240" y="160" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="300" y="40" width="15" height="150" fill="url(#hm-grad)" data-edit="true" data-role="colorbar"/>
  <defs><linearGradient id="hm-grad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.ol}"/><stop offset="0.5" stop-color="${C.bm}"/><stop offset="1" stop-color="${C.bd}"/></linearGradient></defs>
  <text x="307" y="205" font-family="${F}" font-size="6" fill="${C.nd}" data-edit="true" data-role="axis-label">0</text>
  <text x="307" y="35" font-family="${F}" font-size="6" fill="${C.nd}" data-edit="true" data-role="axis-label">1</text>
</svg>`};

// 3. Heatmap
CHART_TEMPLATES.heatmap={name:"Heatmap",icon:"🔥",category:"chart",description:"2D intensity grid for correlation/attention",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Attention Weights</text>
  <rect x="80" y="40" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="120" y="40" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="160" y="40" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="200" y="40" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="240" y="40" width="40" height="30" fill="${C.ol}" data-edit="true" data-role="cell"/>
  <rect x="80" y="70" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="120" y="70" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="160" y="70" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="200" y="70" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="240" y="70" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="80" y="100" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="120" y="100" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="160" y="100" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="200" y="100" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="240" y="100" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="80" y="130" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="120" y="130" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="160" y="130" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="200" y="130" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <rect x="240" y="130" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="80" y="160" width="40" height="30" fill="${C.ol}" data-edit="true" data-role="cell"/>
  <rect x="120" y="160" width="40" height="30" fill="${C.ot}" data-edit="true" data-role="cell"/>
  <rect x="160" y="160" width="40" height="30" fill="${C.bs}" data-edit="true" data-role="cell"/>
  <rect x="200" y="160" width="40" height="30" fill="${C.bm}" data-edit="true" data-role="cell"/>
  <rect x="240" y="160" width="40" height="30" fill="${C.bd}" data-edit="true" data-role="cell"/>
  <defs><linearGradient id="hm-grad" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="${C.ol}"/><stop offset="0.5" stop-color="${C.bm}"/><stop offset="1" stop-color="${C.bd}"/></linearGradient></defs>
  <rect x="300" y="40" width="15" height="150" fill="url(#hm-grad)" data-edit="true" data-role="colorbar"/>
  <text x="307" y="205" font-family="${F}" font-size="6" fill="${C.nd}" data-edit="true" data-role="axis-label">0</text>
  <text x="307" y="35" font-family="${F}" font-size="6" fill="${C.nd}" data-edit="true" data-role="axis-label">1</text>
</svg>`};

// 4. Scatter / Bubble
CHART_TEMPLATES.scatter={name:"Scatter / Bubble",icon:"🔵",category:"chart",description:"Point cloud with optional size encoding",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="60" y1="230" x2="60" y2="60" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="60" y1="230" x2="370" y2="230" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <circle cx="100" cy="200" r="4" fill="${C.bd}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="140" cy="180" r="5" fill="${C.bd}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="170" cy="160" r="3" fill="${C.bm}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="200" cy="140" r="6" fill="${C.bm}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="230" cy="120" r="4" fill="${C.bs}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="260" cy="100" r="7" fill="${C.bs}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="290" cy="85" r="5" fill="${C.ot}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="320" cy="70" r="3" fill="${C.ot}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="340" cy="95" r="4" fill="${C.ob}" opacity="0.7" data-edit="true" data-role="marker"/>
  <text x="215" y="265" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="axis-label">Feature X</text>
  <text x="20" y="145" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" transform="rotate(-90 20 145)" data-edit="true" data-role="axis-label">Feature Y</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Feature Distribution</text>
</svg>`};

// 5. Radar / Polar
CHART_TEMPLATES.radar={name:"Radar / Polar",icon:"🕸️",category:"chart",description:"Multi-axis comparison on radial spokes",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <text x="200" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Multi-metric Comparison</text>
  <polygon points="200,50 320,125 275,225 125,225 80,125" fill="none" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <polygon points="200,80 290,125 260,200 140,200 110,125" fill="none" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <polygon points="200,110 260,125 245,175 155,175 140,125" fill="none" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <line x1="200" y1="140" x2="200" y2="50" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <line x1="200" y1="140" x2="320" y2="125" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <line x1="200" y1="140" x2="275" y2="225" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <line x1="200" y1="140" x2="125" y2="225" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <line x1="200" y1="140" x2="80" y2="125" stroke="${C.nl}" stroke-width="0.5" data-edit="true" data-role="grid"/>
  <polygon points="200,70 300,125 250,210 150,200 110,130" fill="${C.bd}" fill-opacity="0.2" stroke="${C.bd}" stroke-width="1.5" data-edit="true" data-role="series"/>
  <polygon points="200,90 280,130 240,190 160,185 130,140" fill="${C.bm}" fill-opacity="0.2" stroke="${C.bm}" stroke-width="1.5" data-edit="true" data-role="series"/>
  <text x="200" y="42" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="axis-label">Speed</text>
  <text x="330" y="125" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="axis-label">Acc</text>
  <text x="285" y="240" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="axis-label">Mem</text>
  <text x="115" y="240" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="axis-label">Power</text>
  <text x="70" y="125" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="axis-label">Cost</text>
</svg>`};

// 4. Scatter / Bubble
CHART_TEMPLATES.scatter={name:"Scatter / Bubble",icon:"🔵",category:"chart",description:"Point cloud with optional size encoding",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="60" y1="230" x2="60" y2="60" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="60" y1="230" x2="370" y2="230" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <circle cx="100" cy="200" r="4" fill="${C.bd}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="140" cy="180" r="5" fill="${C.bd}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="170" cy="160" r="3" fill="${C.bm}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="200" cy="140" r="6" fill="${C.bm}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="230" cy="120" r="4" fill="${C.bs}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="260" cy="100" r="7" fill="${C.bs}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="290" cy="85" r="5" fill="${C.ot}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="320" cy="70" r="3" fill="${C.ot}" opacity="0.7" data-edit="true" data-role="marker"/>
  <circle cx="340" cy="95" r="4" fill="${C.ob}" opacity="0.7" data-edit="true" data-role="marker"/>
  <text x="215" y="265" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="axis-label">Feature X</text>
  <text x="20" y="145" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" transform="rotate(-90 20 145)" data-edit="true" data-role="axis-label">Feature Y</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Feature Distribution</text>
</svg>`};

// 6. Distribution (Box / Violin)
CHART_TEMPLATES.distribution={name:"Distribution",icon:"📦",category:"chart",description:"Box plots or violin plots showing data spread",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="60" y1="230" x2="60" y2="60" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="60" y1="230" x2="370" y2="230" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="100" y1="100" x2="100" y2="200" stroke="${C.bd}" stroke-width="1" data-edit="true" data-role="whisker"/>
  <rect x="85" y="120" width="30" height="60" fill="${C.bd}" fill-opacity="0.3" stroke="${C.bd}" stroke-width="1" data-edit="true" data-role="box"/>
  <line x1="85" y1="150" x2="115" y2="150" stroke="${C.bd}" stroke-width="1.5" data-edit="true" data-role="median"/>
  <line x1="180" y1="80" x2="180" y2="210" stroke="${C.bm}" stroke-width="1" data-edit="true" data-role="whisker"/>
  <rect x="165" y="110" width="30" height="70" fill="${C.bm}" fill-opacity="0.3" stroke="${C.bm}" stroke-width="1" data-edit="true" data-role="box"/>
  <line x1="165" y1="140" x2="195" y2="140" stroke="${C.bm}" stroke-width="1.5" data-edit="true" data-role="median"/>
  <line x1="260" y1="90" x2="260" y2="190" stroke="${C.bs}" stroke-width="1" data-edit="true" data-role="whisker"/>
  <rect x="245" y="115" width="30" height="50" fill="${C.bs}" fill-opacity="0.3" stroke="${C.bs}" stroke-width="1" data-edit="true" data-role="box"/>
  <line x1="245" y1="135" x2="275" y2="135" stroke="${C.bs}" stroke-width="1.5" data-edit="true" data-role="median"/>
  <line x1="340" y1="70" x2="340" y2="180" stroke="${C.ot}" stroke-width="1" data-edit="true" data-role="whisker"/>
  <rect x="325" y="100" width="30" height="55" fill="${C.ot}" fill-opacity="0.3" stroke="${C.ot}" stroke-width="1" data-edit="true" data-role="box"/>
  <line x1="325" y1="125" x2="355" y2="125" stroke="${C.ot}" stroke-width="1.5" data-edit="true" data-role="median"/>
  <text x="215" y="265" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="axis-label">Group</text>
  <text x="20" y="145" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" transform="rotate(-90 20 145)" data-edit="true" data-role="axis-label">Value</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Score Distributions</text>
</svg>`};

// 7. Forest Plot
CHART_TEMPLATES.forest={name:"Forest Plot",icon:"🌲",category:"chart",description:"Meta-analysis effect sizes with confidence intervals",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="200" y1="50" x2="200" y2="240" stroke="${C.nl}" stroke-width="0.5" stroke-dasharray="3,2" data-edit="true" data-role="reference"/>
  <text x="200" y="42" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="axis-label">OR=1</text>
  <line x1="100" y1="70" x2="180" y2="70" stroke="${C.bd}" stroke-width="1.5" data-edit="true" data-role="ci"/>
  <rect x="135" y="67" width="6" height="6" fill="${C.bd}" data-edit="true" data-role="effect"/>
  <text x="80" y="73" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="label">Study A</text>
  <line x1="150" y1="95" x2="250" y2="95" stroke="${C.bm}" stroke-width="1.5" data-edit="true" data-role="ci"/>
  <rect x="195" y="92" width="6" height="6" fill="${C.bm}" data-edit="true" data-role="effect"/>
  <text x="80" y="98" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="label">Study B</text>
  <line x1="170" y1="120" x2="230" y2="120" stroke="${C.bs}" stroke-width="1.5" data-edit="true" data-role="ci"/>
  <rect x="195" y="117" width="6" height="6" fill="${C.bs}" data-edit="true" data-role="effect"/>
  <text x="80" y="123" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="label">Study C</text>
  <line x1="120" y1="145" x2="200" y2="145" stroke="${C.ot}" stroke-width="1.5" data-edit="true" data-role="ci"/>
  <rect x="155" y="142" width="6" height="6" fill="${C.ot}" data-edit="true" data-role="effect"/>
  <text x="80" y="148" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="label">Study D</text>
  <line x1="160" y1="170" x2="240" y2="170" stroke="${C.ob}" stroke-width="1.5" data-edit="true" data-role="ci"/>
  <rect x="195" y="167" width="6" height="6" fill="${C.ob}" data-edit="true" data-role="effect"/>
  <text x="80" y="173" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="label">Study E</text>
  <polygon points="180,210 220,210 200,195" fill="${C.nd}" data-edit="true" data-role="summary"/>
  <line x1="165" y1="205" x2="235" y2="205" stroke="${C.nd}" stroke-width="2" data-edit="true" data-role="summary-ci"/>
  <text x="80" y="208" font-family="${F}" font-size="7" font-weight="bold" fill="${C.nd}" text-anchor="end" data-edit="true" data-role="label">Pooled</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Meta-analysis: Treatment Effect</text>
  <text x="100" y="265" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="axis-label">Favours Treatment</text>
  <text x="300" y="265" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="axis-label">Favours Control</text>
</svg>`};

// 8. Area / Stacked
CHART_TEMPLATES.area={name:"Area / Stacked",icon:"🏔️",category:"chart",description:"Stacked area showing proportional composition",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <line x1="60" y1="230" x2="60" y2="60" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <line x1="60" y1="230" x2="370" y2="230" stroke="${C.ax}" stroke-width="0.8" data-edit="true" data-role="axis"/>
  <path d="M60,230 L60,200 L120,190 L180,175 L240,160 L300,150 L370,140 L370,230 Z" fill="${C.bd}" fill-opacity="0.6" data-edit="true" data-role="area"/>
  <path d="M60,200 L120,190 L180,175 L240,160 L300,150 L370,140 L370,100 L300,95 L240,85 L180,80 L120,90 L60,110 Z" fill="${C.bm}" fill-opacity="0.6" data-edit="true" data-role="area"/>
  <path d="M60,110 L120,90 L180,80 L240,85 L300,95 L370,100 L370,60 L300,65 L240,60 L180,55 L120,65 L60,80 Z" fill="${C.bs}" fill-opacity="0.6" data-edit="true" data-role="area"/>
  <text x="215" y="265" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="axis-label">Time</text>
  <text x="20" y="145" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" transform="rotate(-90 20 145)" data-edit="true" data-role="axis-label">Proportion</text>
  <text x="215" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Component Composition Over Time</text>
  <rect x="280" y="30" width="10" height="8" fill="${C.bd}" fill-opacity="0.6" data-edit="true" data-role="legend-marker"/>
  <text x="295" y="37" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Type A</text>
  <rect x="280" y="42" width="10" height="8" fill="${C.bm}" fill-opacity="0.6" data-edit="true" data-role="legend-marker"/>
  <text x="295" y="49" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Type B</text>
  <rect x="280" y="54" width="10" height="8" fill="${C.bs}" fill-opacity="0.6" data-edit="true" data-role="legend-marker"/>
  <text x="295" y="61" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Type C</text>
</svg>`};

// 9. Image Plate (Microscopy)
CHART_TEMPLATES.imageplate={name:"Image Plate",icon:"🔬",category:"chart",description:"Multi-panel microscopy or image grid",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <text x="200" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Cell Morphology Across Conditions</text>
  <rect x="30" y="30" width="100" height="70" fill="#E8E8E8" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="80" y="115" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="label">Control</text>
  <rect x="150" y="30" width="100" height="70" fill="#D8D8E8" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="200" y="115" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="label">Low Dose</text>
  <rect x="270" y="30" width="100" height="70" fill="#C8C8D8" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="320" y="115" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="label">High Dose</text>
  <rect x="30" y="130" width="100" height="70" fill="#D0D0D0" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="80" y="215" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="label">Day 1</text>
  <rect x="150" y="130" width="100" height="70" fill="#C0C0D0" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="200" y="215" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="label">Day 7</text>
  <rect x="270" y="130" width="100" height="70" fill="#B0B0C0" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="320" y="215" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="label">Day 14</text>
  <text x="200" y="255" font-family="${F}" font-size="8" fill="${C.ax}" text-anchor="middle" data-edit="true" data-role="caption">Scale bar: 50 μm</text>
</svg>`};

// 10. Network / Graph
CHART_TEMPLATES.network={name:"Network / Graph",icon:"🕸️",category:"chart",description:"Node-link diagram for relational data",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <text x="200" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="title">Protein Interaction Network</text>
  <line x1="200" y1="140" x2="120" y2="80" stroke="${C.nm}" stroke-width="1" data-edit="true" data-role="edge"/>
  <line x1="200" y1="140" x2="280" y2="80" stroke="${C.nm}" stroke-width="1" data-edit="true" data-role="edge"/>
  <line x1="200" y1="140" x2="120" y2="200" stroke="${C.nm}" stroke-width="1" data-edit="true" data-role="edge"/>
  <line x1="200" y1="140" x2="280" y2="200" stroke="${C.nm}" stroke-width="1" data-edit="true" data-role="edge"/>
  <line x1="120" y1="80" x2="280" y2="80" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="edge"/>
  <line x1="120" y1="200" x2="280" y2="200" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="edge"/>
  <line x1="120" y1="80" x2="120" y2="200" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="edge"/>
  <line x1="280" y1="80" x2="280" y2="200" stroke="${C.nm}" stroke-width="0.5" data-edit="true" data-role="edge"/>
  <circle cx="200" cy="140" r="14" fill="${C.bd}" data-edit="true" data-role="node"/>
  <text x="200" y="143" font-family="${F}" font-size="7" fill="${C.W}" text-anchor="middle" data-edit="true" data-role="node-label">TP53</text>
  <circle cx="120" cy="80" r="10" fill="${C.bm}" data-edit="true" data-role="node"/>
  <text x="120" y="83" font-family="${F}" font-size="6" fill="${C.W}" text-anchor="middle" data-edit="true" data-role="node-label">MDM2</text>
  <circle cx="280" cy="80" r="10" fill="${C.bm}" data-edit="true" data-role="node"/>
  <text x="280" y="83" font-family="${F}" font-size="6" fill="${C.W}" text-anchor="middle" data-edit="true" data-role="node-label">ATM</text>
  <circle cx="120" cy="200" r="8" fill="${C.bs}" data-edit="true" data-role="node"/>
  <text x="120" y="203" font-family="${F}" font-size="6" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="node-label">BAX</text>
  <circle cx="280" cy="200" r="8" fill="${C.bs}" data-edit="true" data-role="node"/>
  <text x="280" y="203" font-family="${F}" font-size="6" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="node-label">BCL2</text>
</svg>`};

// ═══ Layout Templates ═══
const LAYOUT_TEMPLATES={};

// L1. Hero Panel
LAYOUT_TEMPLATES.hero={name:"Hero Panel",icon:"🏆",category:"layout",description:"One large hero panel + smaller evidence panels below",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <rect x="20" y="20" width="360" height="160" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="200" y="40" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">a — Main Result</text>
  <rect x="20" y="190" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="77" y="205" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">b</text>
  <rect x="142" y="190" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="199" y="205" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">c</text>
  <rect x="265" y="190" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="322" y="205" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">d</text>
</svg>`};

// L2. Legend Panel
LAYOUT_TEMPLATES.legendpanel={name:"Legend Panel",icon:"📋",category:"layout",description:"Data panels + dedicated legend-only panel on right",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <rect x="20" y="20" width="170" height="120" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="105" y="38" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">a</text>
  <rect x="20" y="150" width="170" height="115" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="105" y="168" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">b</text>
  <rect x="200" y="20" width="180" height="245" fill="${C.gr}" fill-opacity="0.3" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="290" y="40" font-family="${F}" font-size="8" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">Legend</text>
  <rect x="215" y="55" width="12" height="10" fill="${C.bd}" data-edit="true" data-role="legend-marker"/>
  <text x="233" y="64" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Method A (n=42)</text>
  <rect x="215" y="72" width="12" height="10" fill="${C.bm}" data-edit="true" data-role="legend-marker"/>
  <text x="233" y="81" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Method B (n=38)</text>
  <rect x="215" y="89" width="12" height="10" fill="${C.bs}" data-edit="true" data-role="legend-marker"/>
  <text x="233" y="98" font-family="${F}" font-size="7" fill="${C.nd}" data-edit="true" data-role="legend">Method C (n=35)</text>
</svg>`};

// L3. Asymmetric
LAYOUT_TEMPLATES.asymmetric={name:"Asymmetric",icon:"⚖️",category:"layout",description:"Hero panel spans all rows on one side",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <rect x="20" y="20" width="200" height="245" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="120" y="40" font-family="${F}" font-size="9" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">a — Overview</text>
  <rect x="230" y="20" width="150" height="78" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="305" y="38" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">b</text>
  <rect x="230" y="105" width="150" height="78" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="305" y="123" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">c</text>
  <rect x="230" y="190" width="150" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="305" y="208" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">d</text>
</svg>`};

// L4. Clinical Triptych
LAYOUT_TEMPLATES.triptych={name:"Clinical Triptych",icon:"🏥",category:"layout",description:"3x3 grid for clinical outcome figures",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <rect x="20" y="20" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="77" y="35" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">a</text>
  <rect x="142" y="20" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="199" y="35" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">b</text>
  <rect x="265" y="20" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="322" y="35" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">c</text>
  <rect x="20" y="102" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="77" y="117" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">d</text>
  <rect x="142" y="102" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="199" y="117" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">e</text>
  <rect x="265" y="102" width="115" height="75" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="322" y="117" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">f</text>
  <rect x="20" y="184" width="115" height="81" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="77" y="199" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">g</text>
  <rect x="142" y="184" width="115" height="81" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="199" y="199" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">h</text>
  <rect x="265" y="184" width="115" height="81" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="322" y="199" font-family="${F}" font-size="7" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">i</text>
</svg>`};

// L5. Dark Plate
LAYOUT_TEMPLATES.darkplate={name:"Dark Plate",icon:"🌑",category:"layout",description:"Dark 3x5 image grid for microscopy",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="#1a1a1a"/>
  <text x="200" y="15" font-family="${F}" font-size="9" font-weight="bold" fill="#E0E0E0" text-anchor="middle" data-edit="true" data-role="title">Volume Rendering</text>
  <rect x="15" y="25" width="70" height="50" fill="#2a2a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="90" y="25" width="70" height="50" fill="#2a3a4a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="165" y="25" width="70" height="50" fill="#3a2a4a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="240" y="25" width="70" height="50" fill="#3a3a2a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="315" y="25" width="70" height="50" fill="#2a3a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="15" y="80" width="70" height="50" fill="#3a2a2a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="90" y="80" width="70" height="50" fill="#2a2a4a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="165" y="80" width="70" height="50" fill="#3a4a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="240" y="80" width="70" height="50" fill="#4a3a2a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="315" y="80" width="70" height="50" fill="#3a3a4a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="15" y="135" width="70" height="50" fill="#2a4a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="90" y="135" width="70" height="50" fill="#4a2a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="165" y="135" width="70" height="50" fill="#3a3a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="240" y="135" width="70" height="50" fill="#2a3a4a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <rect x="315" y="135" width="70" height="50" fill="#4a4a3a" stroke="#555" stroke-width="0.5" data-edit="true" data-role="image-panel"/>
  <text x="200" y="210" font-family="${F}" font-size="7" fill="#888" text-anchor="middle" data-edit="true" data-role="caption">z = 0.2 — 0.8, step 0.2</text>
  <text x="200" y="260" font-family="${F}" font-size="8" fill="#AAA" text-anchor="middle" data-edit="true" data-role="caption">Scale: 1 px = 0.5 μm</text>
</svg>`};

// L6. Quantitative Grid
LAYOUT_TEMPLATES.quantgrid={name:"Quant Grid 2x2",icon:"🔲",category:"layout",description:"2x2 equal panels for quantitative comparisons",svg:`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 280" width="400" height="280" data-template="true">
  <rect x="0" y="0" width="400" height="280" fill="${C.W}"/>
  <rect x="20" y="20" width="175" height="120" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="107" y="38" font-family="${F}" font-size="8" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">a — Accuracy</text>
  <rect x="205" y="20" width="175" height="120" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="292" y="38" font-family="${F}" font-size="8" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">b — Latency</text>
  <rect x="20" y="150" width="175" height="120" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="107" y="168" font-family="${F}" font-size="8" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">c — Memory</text>
  <rect x="205" y="150" width="175" height="120" fill="none" stroke="${C.nm}" stroke-width="0.8" data-edit="true" data-role="panel"/>
  <text x="292" y="168" font-family="${F}" font-size="8" font-weight="bold" fill="${C.nd}" text-anchor="middle" data-edit="true" data-role="panel-title">d — Throughput</text>
</svg>`};

// ═══ Public API ═══
const ALL_TEMPLATES={...CHART_TEMPLATES,...LAYOUT_TEMPLATES};
function getTemplate(key){return ALL_TEMPLATES[key];}
function getAllTemplates(){return ALL_TEMPLATES;}
function getChartTemplates(){return CHART_TEMPLATES;}
function getLayoutTemplates(){return LAYOUT_TEMPLATES;}

window.CHART_TEMPLATES=CHART_TEMPLATES;
window.LAYOUT_TEMPLATES=LAYOUT_TEMPLATES;
window.ALL_TEMPLATES=ALL_TEMPLATES;
window.getTemplate=getTemplate;
window.getAllTemplates=getAllTemplates;
window.getChartTemplates=getChartTemplates;
window.getLayoutTemplates=getLayoutTemplates;
