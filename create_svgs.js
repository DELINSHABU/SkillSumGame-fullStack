const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, 'svg_icons');

const strokeColor = "#31162B"; // Dark, rich purple-black
const strokeWidth = 5;

// Helper to wrap SVG and include sparkles
const wrapSVG = (content, sparkles = []) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100%" height="100%">
  <defs>
    <style>
      .outline { fill: none; stroke: ${strokeColor}; stroke-width: ${strokeWidth}; stroke-linecap: round; stroke-linejoin: round; }
      .filled { stroke: ${strokeColor}; stroke-width: ${strokeWidth}; stroke-linecap: round; stroke-linejoin: round; }
      .highlight { fill: #FFFFFF; }
      .accent { fill: ${strokeColor}; }
    </style>
  </defs>
  ${sparkles.map(s => `
    <g transform="translate(${s.x}, ${s.y}) scale(${s.scale})">
      <path d="M0 -10 Q0 0 10 0 Q0 0 0 10 Q0 0 -10 0 Q0 0 0 -10 Z" fill="${s.color}"/>
      ${s.dot ? `<circle cx="${s.dx || 15}" cy="${s.dy || -15}" r="3" fill="${s.color}"/>` : ''}
    </g>
  `).join('')}
  ${content}
</svg>`;

const svgs = {
  "star.svg": wrapSVG(`
    <!-- Base Layer -->
    <path class="filled" fill="#FFD166" d="M50 20 L58 40 L80 43 L63 58 L68 80 L50 68 L32 80 L37 58 L20 43 L42 40 Z" />
    <!-- Shadow Layer -->
    <path fill="#F4A261" d="M50 68 L32 80 L37 58 L20 43 L42 40 L50 20 L50 68 Z" opacity="0.6"/>
    <!-- Highlight -->
    <path class="highlight" d="M43 32 Q46 32 45 37 Q44 42 41 42 Q38 42 39 37 Q40 32 43 32 Z" transform="rotate(-20 42 37)"/>
    <circle class="highlight" cx="37" cy="48" r="2.5"/>
    <!-- Accents -->
    <line x1="58" y1="65" x2="62" y2="70" class="outline" stroke-width="4"/>
    <line x1="65" y1="61" x2="68" y2="65" class="outline" stroke-width="4"/>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="2s" repeatCount="indefinite" />
  `, [
    {x: 20, y: 20, scale: 0.8, color: '#FFD166', dot: true},
    {x: 85, y: 30, scale: 0.5, color: '#FFD166'}
  ]),

  "fire.svg": wrapSVG(`
    <g>
      <!-- Base Flame -->
      <path class="filled" fill="#EF476F" d="M50 15 C50 15, 25 40, 25 65 C25 80, 35 90, 50 90 C65 90, 75 80, 75 65 C75 40, 50 15, 50 15 Z" />
      <!-- Shadow Flame -->
      <path fill="#C1121F" d="M50 90 C65 90, 75 80, 75 65 C75 40, 50 15, 50 15 C50 15, 60 40, 60 65 C60 80, 55 90, 50 90 Z" />
      <!-- Inner Flame -->
      <path class="filled" fill="#FFD166" d="M50 40 C50 40, 35 55, 35 70 C35 80, 42 85, 50 85 C58 85, 65 80, 65 70 C65 55, 50 40, 50 40 Z" />
      <!-- Highlight -->
      <path class="highlight" d="M35 55 C33 60 33 65 35 70 C37 65 38 60 35 55 Z" />
      <circle class="highlight" cx="32" cy="75" r="2.5"/>
      <!-- Accents -->
      <line x1="60" y1="75" x2="65" y2="80" class="outline" stroke-width="4"/>
      <animateTransform attributeName="transform" type="scale" values="1; 1.02; 1" dur="1.5s" repeatCount="indefinite" />
    </g>
  `, [
    {x: 25, y: 25, scale: 0.7, color: '#EF476F', dot: true},
    {x: 80, y: 40, scale: 0.5, color: '#FFD166'}
  ]),

  "brain.svg": wrapSVG(`
    <!-- Brain Base -->
    <path class="filled" fill="#F4A261" d="M50 85 C20 85, 15 65, 15 50 C15 30, 30 15, 50 15 C70 15, 85 30, 85 50 C85 65, 80 85, 50 85 Z" />
    <!-- Brain Shadow -->
    <path fill="#E76F51" d="M50 85 C80 85, 85 65, 85 50 C85 30, 70 15, 50 15 C70 20, 75 40, 75 55 C75 75, 60 80, 50 85 Z" />
    <!-- Middle Line -->
    <path class="outline" d="M50 15 V85" />
    <!-- Brain Folds -->
    <path class="outline" d="M25 40 Q40 30 50 40" />
    <path class="outline" d="M20 55 Q35 45 50 55" />
    <path class="outline" d="M28 70 Q40 65 50 70" />
    <path class="outline" d="M75 40 Q60 30 50 40" />
    <path class="outline" d="M80 55 Q65 45 50 55" />
    <path class="outline" d="M72 70 Q60 65 50 70" />
    <!-- Highlights -->
    <path class="highlight" d="M22 35 Q28 25 38 22 Q35 28 26 38 Z" />
    <circle class="highlight" cx="22" cy="45" r="2.5"/>
  `, [
    {x: 18, y: 20, scale: 0.6, color: '#F4A261', dot: true},
    {x: 85, y: 25, scale: 0.8, color: '#E76F51'}
  ]),

  "100.svg": wrapSVG(`
    <g transform="rotate(-5 50 50)">
      <text x="50" y="70" font-family="Arial, sans-serif" font-weight="900" font-size="55" fill="#EF476F" stroke="${strokeColor}" stroke-width="${strokeWidth}" text-anchor="middle" stroke-linejoin="round">100</text>
      <!-- Highlights manually drawn -->
      <path class="highlight" d="M18 35 L22 35 L22 45 L18 45 Z" rx="2" />
      <path class="highlight" d="M42 35 Q48 35 48 42 Q48 38 42 38 Z" />
      <path class="highlight" d="M72 35 Q78 35 78 42 Q78 38 72 38 Z" />
      <line x1="20" y1="80" x2="80" y2="80" class="outline" stroke-width="6"/>
      <animateTransform attributeName="transform" type="scale" values="1; 1.05; 1" dur="1.2s" repeatCount="indefinite" />
    </g>
  `, [
    {x: 15, y: 15, scale: 0.9, color: '#EF476F', dot: true, dx: 70, dy: 10},
    {x: 85, y: 20, scale: 0.5, color: '#EF476F'}
  ]),

  "check.svg": wrapSVG(`
    <circle class="filled" cx="50" cy="50" r="40" fill="#06D6A0" />
    <path fill="#04A77B" d="M50 90 A40 40 0 0 0 90 50 A40 40 0 0 1 50 85 A40 40 0 0 1 10 50 A40 40 0 0 0 50 90 Z" />
    <path class="outline" stroke-width="8" stroke="#FFFFFF" d="M30 50 L45 65 L70 35" />
    <path class="highlight" d="M22 35 A30 30 0 0 1 40 15 A32 32 0 0 0 22 40 Z" />
    <circle class="highlight" cx="20" cy="50" r="2.5"/>
    <line x1="65" y1="70" x2="70" y2="75" class="outline" stroke-width="4"/>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="2s" repeatCount="indefinite" />
  `, [
    {x: 15, y: 20, scale: 0.8, color: '#06D6A0', dot: true, dx: 70, dy: 60},
    {x: 85, y: 25, scale: 0.6, color: '#06D6A0'}
  ]),

  "target.svg": wrapSVG(`
    <!-- Outer Red -->
    <circle class="filled" cx="50" cy="50" r="40" fill="#EF476F" />
    <path fill="#C1121F" d="M50 90 A40 40 0 0 0 90 50 A40 40 0 0 1 50 85 A40 40 0 0 1 10 50 A40 40 0 0 0 50 90 Z" />
    <!-- Middle White -->
    <circle class="filled" cx="50" cy="50" r="25" fill="#FFFFFF" />
    <path fill="#E5E5E5" d="M50 75 A25 25 0 0 0 75 50 A25 25 0 0 1 50 70 A25 25 0 0 1 25 50 A25 25 0 0 0 50 75 Z" />
    <!-- Inner Red -->
    <circle class="filled" cx="50" cy="50" r="10" fill="#EF476F" />
    <!-- Arrow -->
    <path class="filled" fill="#FFD166" d="M75 15 L55 35 L50 30 L45 45 L60 40 L55 35 L75 15 Z" />
    <path class="filled" fill="#118AB2" d="M85 5 L75 15 L85 25 L95 15 Z" />
    <!-- Highlight -->
    <path class="highlight" d="M20 35 A30 30 0 0 1 40 15 A32 32 0 0 0 20 40 Z" />
    <circle class="highlight" cx="18" cy="50" r="2.5"/>
    <animateTransform attributeName="transform" type="rotate" values="-2 50 50; 2 50 50; -2 50 50" dur="1.5s" repeatCount="indefinite" />
  `, [
    {x: 20, y: 15, scale: 0.7, color: '#EF476F', dot: true, dx: -5, dy: 60},
    {x: 80, y: 80, scale: 0.5, color: '#118AB2'}
  ]),

  "calendar.svg": wrapSVG(`
    <rect class="filled" x="15" y="30" width="70" height="55" rx="8" fill="#FFFFFF" />
    <rect class="filled" x="15" y="25" width="70" height="25" rx="8" fill="#EF476F" />
    <!-- Shadow on red header -->
    <path fill="#C1121F" d="M15 45 L85 45 L85 50 C85 54.4 81.4 58 77 58 L23 58 C18.6 58 15 54.4 15 50 Z" />
    
    <line x1="30" y1="12" x2="30" y2="35" class="outline" stroke-width="6"/>
    <line x1="70" y1="12" x2="70" y2="35" class="outline" stroke-width="6"/>
    
    <!-- Shadow on white body -->
    <path fill="#E5E5E5" d="M15 75 L85 75 L85 85 C85 89.4 81.4 93 77 93 L23 93 C18.6 93 15 89.4 15 85 Z" />
    
    <!-- Dates -->
    <circle cx="35" cy="60" r="5" fill="#118AB2" class="filled" stroke-width="3"/>
    <circle cx="50" cy="60" r="5" fill="#FFD166" class="filled" stroke-width="3"/>
    <circle cx="65" cy="60" r="5" fill="#06D6A0" class="filled" stroke-width="3"/>
    
    <!-- Highlight -->
    <path class="highlight" d="M20 30 L35 30 L35 35 L20 35 Z" rx="2" />
    <circle class="highlight" cx="22" cy="40" r="2"/>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-3; 0,0" dur="2s" repeatCount="indefinite" />
  `, [
    {x: 10, y: 15, scale: 0.6, color: '#EF476F', dot: true, dx: 80, dy: 10},
    {x: 85, y: 70, scale: 0.4, color: '#118AB2'}
  ]),

  "medal.svg": wrapSVG(`
    <!-- Ribbons -->
    <path class="filled" fill="#118AB2" d="M30 10 L45 45 L50 40 L55 45 L70 10 Z" />
    <path fill="#0B525B" d="M50 40 L55 45 L70 10 L60 10 Z" opacity="0.4"/>
    <!-- Medal -->
    <circle class="filled" cx="50" cy="65" r="28" fill="#FFD166" />
    <path fill="#F4A261" d="M50 93 A28 28 0 0 0 78 65 A28 28 0 0 1 50 85 A28 28 0 0 1 22 65 A28 28 0 0 0 50 93 Z" />
    <circle class="filled" cx="50" cy="65" r="15" fill="#FFF3B0" stroke-width="4"/>
    <!-- Highlight -->
    <path class="highlight" d="M30 55 A20 20 0 0 1 45 42 A22 22 0 0 0 30 60 Z" />
    <circle class="highlight" cx="28" cy="68" r="2.5"/>
    <animateTransform attributeName="transform" type="rotate" values="-3 50 50; 3 50 50; -3 50 50" dur="1.5s" repeatCount="indefinite" />
  `, [
    {x: 18, y: 65, scale: 0.7, color: '#FFD166', dot: true, dx: 70, dy: -50},
    {x: 80, y: 80, scale: 0.5, color: '#FFD166'}
  ]),

  "lock.svg": wrapSVG(`
    <!-- Shackle -->
    <path class="outline" stroke-width="8" d="M35 50 V35 C35 25, 65 25, 65 35 V50" />
    <!-- Body -->
    <rect class="filled" x="25" y="45" width="50" height="40" rx="8" fill="#FFD166" />
    <path fill="#F4A261" d="M25 75 L75 75 L75 85 C75 89.4 71.4 93 67 93 L33 93 C28.6 93 25 89.4 25 85 Z" />
    <!-- Keyhole -->
    <circle class="accent" cx="50" cy="60" r="5" />
    <path class="accent" d="M48 60 L47 70 L53 70 L52 60 Z" />
    <!-- Highlight -->
    <path class="highlight" d="M30 50 L40 50 L40 55 L30 55 Z" rx="2" />
    <circle class="highlight" cx="30" cy="62" r="2.5"/>
  `, [
    {x: 15, y: 30, scale: 0.6, color: '#FFD166', dot: true, dx: 70, dy: 20},
    {x: 80, y: 70, scale: 0.4, color: '#FFD166'}
  ]),

  "rocket.svg": wrapSVG(`
    <g transform="rotate(45 50 50)">
      <!-- Fins -->
      <path class="filled" fill="#EF476F" d="M30 60 L15 75 L35 80 Z" />
      <path class="filled" fill="#EF476F" d="M70 60 L85 75 L65 80 Z" />
      <!-- Body -->
      <path class="filled" fill="#118AB2" d="M50 15 C70 15, 75 40, 75 60 L65 85 L35 85 L25 60 C25 40, 30 15, 50 15 Z" />
      <path fill="#073B4C" d="M50 85 L75 60 C75 40, 70 15, 50 15 C60 25, 65 45, 65 60 L55 85 Z" opacity="0.3"/>
      <!-- Window -->
      <circle class="filled" cx="50" cy="45" r="12" fill="#FFFFFF" />
      <circle class="filled" cx="50" cy="45" r="8" fill="#06D6A0" stroke-width="3"/>
      <!-- Flame -->
      <path class="filled" fill="#FFD166" d="M40 85 Q50 115 60 85 Z">
        <animate attributeName="d" values="M40 85 Q50 115 60 85 Z; M42 85 Q50 105 58 85 Z; M40 85 Q50 115 60 85 Z" dur="0.3s" repeatCount="indefinite"/>
      </path>
      <!-- Highlight -->
      <path class="highlight" d="M35 30 A20 20 0 0 1 45 20 A22 22 0 0 0 35 35 Z" />
      <circle class="highlight" cx="33" cy="40" r="2"/>
    </g>
    <animateTransform attributeName="transform" type="translate" values="0,0; 3,-3; 0,0" dur="1s" repeatCount="indefinite" />
  `, [
    {x: 20, y: 20, scale: 0.8, color: '#118AB2', dot: true, dx: -10, dy: 60},
    {x: 80, y: 15, scale: 0.5, color: '#EF476F'}
  ]),

  "crown.svg": wrapSVG(`
    <!-- Crown Body -->
    <path class="filled" fill="#FFD166" d="M15 75 L10 30 L35 45 L50 15 L65 45 L90 30 L85 75 Z" />
    <path fill="#F4A261" d="M15 75 L85 75 L90 30 L65 45 L50 15 L50 75 Z" opacity="0.4"/>
    <!-- Jewels -->
    <circle class="filled" cx="10" cy="30" r="6" fill="#EF476F" stroke-width="3"/>
    <circle class="filled" cx="50" cy="15" r="8" fill="#118AB2" stroke-width="3"/>
    <circle class="filled" cx="90" cy="30" r="6" fill="#06D6A0" stroke-width="3"/>
    <!-- Base -->
    <rect class="filled" x="20" y="75" width="60" height="10" rx="5" fill="#F4A261" />
    <!-- Highlights -->
    <path class="highlight" d="M22 65 L28 65 L28 70 L22 70 Z" rx="2" />
    <circle class="highlight" cx="48" cy="12" r="2"/>
    <animateTransform attributeName="transform" type="translate" values="0,0; 0,-4; 0,0" dur="2s" repeatCount="indefinite" />
  `, [
    {x: 25, y: 15, scale: 0.7, color: '#FFD166', dot: true, dx: 60, dy: 10},
    {x: 85, y: 55, scale: 0.5, color: '#118AB2'}
  ]),

  "plus.svg": wrapSVG(`
    <rect class="filled" x="38" y="15" width="24" height="70" rx="12" fill="#06D6A0" />
    <rect class="filled" x="15" y="38" width="70" height="24" rx="12" fill="#06D6A0" />
    <path fill="#04A77B" d="M15 62 L85 62 L85 50 L62 50 L62 85 L38 85 L38 50 L15 50 Z" opacity="0.4"/>
    <path class="highlight" d="M42 22 L46 22 L46 32 L42 32 Z" rx="2" />
    <path class="highlight" d="M22 42 L32 42 L32 46 L22 46 Z" rx="2" />
    <circle class="highlight" cx="24" cy="52" r="2.5"/>
    <animateTransform attributeName="transform" type="scale" values="1; 1.05; 1" dur="2s" repeatCount="indefinite" />
  `, [
    {x: 18, y: 18, scale: 0.7, color: '#06D6A0', dot: true, dx: 70, dy: 60},
    {x: 82, y: 22, scale: 0.4, color: '#06D6A0'}
  ]),

  "minus.svg": wrapSVG(`
    <rect class="filled" x="15" y="38" width="70" height="24" rx="12" fill="#EF476F" />
    <path fill="#C1121F" d="M15 62 L85 62 A12 12 0 0 0 85 50 L15 50 A12 12 0 0 0 15 62 Z" opacity="0.4"/>
    <path class="highlight" d="M22 42 L32 42 L32 46 L22 46 Z" rx="2" />
    <circle class="highlight" cx="24" cy="52" r="2.5"/>
  `, [
    {x: 20, y: 20, scale: 0.8, color: '#EF476F', dot: true, dx: 60, dy: 50},
    {x: 80, y: 75, scale: 0.5, color: '#EF476F'}
  ]),

  "multiply.svg": wrapSVG(`
    <g transform="rotate(45 50 50)">
      <rect class="filled" x="38" y="15" width="24" height="70" rx="12" fill="#118AB2" />
      <rect class="filled" x="15" y="38" width="70" height="24" rx="12" fill="#118AB2" />
      <path fill="#073B4C" d="M15 62 L85 62 L85 50 L62 50 L62 85 L38 85 L38 50 L15 50 Z" opacity="0.3"/>
      <path class="highlight" d="M42 22 L46 22 L46 32 L42 32 Z" rx="2" />
      <path class="highlight" d="M22 42 L32 42 L32 46 L22 46 Z" rx="2" />
      <circle class="highlight" cx="24" cy="52" r="2.5"/>
    </g>
  `, [
    {x: 15, y: 50, scale: 0.7, color: '#118AB2', dot: true, dx: 65, dy: -30},
    {x: 85, y: 50, scale: 0.5, color: '#118AB2'}
  ]),

  "divide.svg": wrapSVG(`
    <rect class="filled" x="15" y="42" width="70" height="16" rx="8" fill="#9D4EDD" />
    <path fill="#5A189A" d="M15 58 L85 58 A8 8 0 0 0 85 50 L15 50 A8 8 0 0 0 15 58 Z" opacity="0.4"/>
    <circle class="filled" cx="50" cy="20" r="10" fill="#9D4EDD" />
    <path fill="#5A189A" d="M40 20 A10 10 0 0 0 60 20 Z" opacity="0.4"/>
    <circle class="filled" cx="50" cy="80" r="10" fill="#9D4EDD" />
    <path fill="#5A189A" d="M40 80 A10 10 0 0 0 60 80 Z" opacity="0.4"/>
    <path class="highlight" d="M22 45 L32 45 L32 48 L22 48 Z" rx="1.5" />
    <circle class="highlight" cx="46" cy="15" r="2"/>
    <circle class="highlight" cx="46" cy="75" r="2"/>
  `, [
    {x: 20, y: 20, scale: 0.7, color: '#9D4EDD', dot: true, dx: 60, dy: 60},
    {x: 80, y: 20, scale: 0.4, color: '#9D4EDD'}
  ])
};

// Generate missing icons by reusing shapes or mapping conceptually
const allEmojis = {
  "muscle.svg": "star.svg", // Fallbacks if not fully detailed to save script size for now
  "zap.svg": "star.svg",
  "home.svg": "calendar.svg",
  "map.svg": "calendar.svg",
  "refresh.svg": "check.svg",
  "lightbulb.svg": "star.svg",
  "user.svg": "brain.svg",
  "question.svg": "brain.svg",
  "globe.svg": "target.svg",
  "shuffle.svg": "multiply.svg",
  "gear.svg": "target.svg",
  "controller.svg": "target.svg",
  "swords.svg": "multiply.svg",
  "diamond.svg": "star.svg",
  "gift.svg": "calendar.svg",
  "party.svg": "fire.svg",
  "sad.svg": "brain.svg"
};

for (const [filename, content] of Object.entries(svgs)) {
  fs.writeFileSync(path.join(outDir, filename), content);
}
// Generate placeholders for the rest with the same premium style just copied for now so the user can see
for (const [filename, ref] of Object.entries(allEmojis)) {
  if (svgs[ref]) {
    fs.writeFileSync(path.join(outDir, filename), svgs[ref]);
  }
}
console.log('Premium SVGs created in svg_icons/');
