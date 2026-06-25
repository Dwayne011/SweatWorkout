import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generateAssets() {
  console.log('⚡ Starting PWA high-fidelity asset rendering...');

  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Define SVG content for the desktop showcase screenshot
  const desktopSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="screenBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#04040a" />
      <stop offset="50%" stop-color="#0e1026" />
      <stop offset="100%" stop-color="#140b24" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181829" />
      <stop offset="100%" stop-color="#0f0f1c" />
    </linearGradient>
  </defs>

  <!-- Big solid dark backdrop -->
  <rect width="1280" height="720" fill="url(#screenBg)" />

  <!-- Grid Pattern Overlay for high-end look -->
  <g opacity="0.07" stroke="#ffffff" stroke-width="1">
    <path d="M 0,80 L 1280,80 M 0,160 L 1280,160 M 0,240 L 1280,240 M 0,320 L 1280,320 M 0,400 L 1280,400 M 0,480 L 1280,480 M 0,560 L 1280,560 M 0,640 L 1280,640" />
    <path d="M 160,0 L 160,720 M 320,0 L 320,720 M 480,0 L 480,720 M 640,0 L 640,720 M 800,0 L 800,720 M 960,0 L 960,720 M 1120,0 L 1120,720" />
  </g>

  <!-- Floating Glowing Spheres -->
  <circle cx="200" cy="500" r="250" fill="#4f46e5" opacity="0.12" />
  <circle cx="1080" cy="200" r="300" fill="#ec4899" opacity="0.08" />

  <!-- Top Hero Header Layout -->
  <g transform="translate(100, 100)">
    <!-- App Logo Icon -->
    <rect width="64" height="64" rx="16" fill="url(#accentGrad)" />
    <!-- Dumbbell icon inside logo -->
    <path d="M 16 32 L 48 32 M 16 22 L 16 42 M 22 24 L 22 40 M 48 22 L 48 42 M 42 24 L 42 40" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" />
    
    <text x="84" y="30" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="900" letter-spacing="-0.5">SW3AT WORKOUTS</text>
    <text x="84" y="52" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" letter-spacing="1">INTELLIGENT ATHLETIC JOURNAL &amp; GEMINI ACTIVE COACH</text>
  </g>

  <!-- Left Stats Card -->
  <g transform="translate(100, 210)">
    <rect width="320" height="420" rx="24" fill="url(#cardGrad)" stroke="#312e81" stroke-width="1.5" />
    
    <text x="32" y="48" fill="#a78bfa" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" font-mono="true" letter-spacing="2">DASHBOARD MODULE</text>
    <text x="32" y="85" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800">Your Milestones</text>
    
    <!-- Streak -->
    <g transform="translate(32, 130)">
      <rect width="256" height="64" rx="16" fill="#1e1b4b" opacity="0.6" />
      <text x="20" y="38" fill="#f43f5e" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900">🔥 12</text>
      <text x="96" y="36" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">Day Streak</text>
    </g>

    <!-- Workout Logs -->
    <g transform="translate(32, 210)">
      <rect width="256" height="64" rx="16" fill="#1e1b4b" opacity="0.6" />
      <text x="20" y="38" fill="#3b82f6" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900">💪 47</text>
      <text x="96" y="36" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">Completed Sessions</text>
    </g>

    <!-- Total Kg Lifted -->
    <g transform="translate(32, 290)">
      <rect width="256" height="64" rx="16" fill="#1e1b4b" opacity="0.6" />
      <text x="20" y="38" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900">🏋️ 192k</text>
      <text x="96" y="36" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">Total volume (kg)</text>
    </g>
  </g>

  <!-- Right Chart and Tracker Card -->
  <g transform="translate(450, 210)">
    <rect width="730" height="420" rx="24" fill="url(#cardGrad)" stroke="#312e81" stroke-width="1.5" />
    <text x="40" y="48" fill="#a78bfa" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" font-mono="true" letter-spacing="2">ACTIVE ANALYTICS ENGINE</text>
    <text x="40" y="85" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="800">Weekly Performance Index</text>

    <!-- Graphic Chart Representation -->
    <g transform="translate(40, 130)">
      <rect width="650" height="230" rx="16" fill="#0c0a1a" stroke="#1e1b4b" stroke-width="1.5" />
      
      <!-- Chart lines -->
      <path d="M 50,180 Q 150,140 250,90 T 450,60 T 600,110" fill="none" stroke="url(#accentGrad)" stroke-width="5" stroke-linecap="round" />
      <path d="M 50,180 Q 150,140 250,90 T 450,60 T 600,110 L 600,200 L 50,200 Z" fill="url(#accentGrad)" opacity="0.1" />

      <!-- Dots on peak -->
      <circle cx="250" cy="90" r="7" fill="#ffffff" stroke="#8b5cf6" stroke-width="3" />
      <circle cx="450" cy="60" r="7" fill="#ffffff" stroke="#ec4899" stroke-width="3" />

      <!-- Labels -->
      <text x="250" y="65" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" text-anchor="middle">Personal Best (+20%)</text>
      
      <!-- Grid Lines Inside Chart -->
      <line x1="50" y1="50" x2="600" y2="50" stroke="#1e1b4b" stroke-dasharray="5 5" />
      <line x1="50" y1="100" x2="600" y2="100" stroke="#1e1b4b" stroke-dasharray="5 5" />
      <line x1="50" y1="150" x2="600" y2="150" stroke="#1e1b4b" stroke-dasharray="5 5" />

      <text x="50" y="215" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">MON</text>
      <text x="150" y="215" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">TUE</text>
      <text x="250" y="215" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">WED</text>
      <text x="350" y="215" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">THU</text>
      <text x="450" y="215" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">FRI</text>
      <text x="550" y="215" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="11">SAT</text>
    </g>
  </g>
</svg>`;

  // Define SVG content for the mobile showcase screenshot
  const mobileSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 1280" width="100%" height="100%">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="screenBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#04040a" />
      <stop offset="50%" stop-color="#0d0e22" />
      <stop offset="100%" stop-color="#150821" />
    </linearGradient>
    <linearGradient id="accentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#4f46e5" />
      <stop offset="50%" stop-color="#8b5cf6" />
      <stop offset="100%" stop-color="#ec4899" />
    </linearGradient>
    <linearGradient id="cardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181829" />
      <stop offset="100%" stop-color="#0f0f1c" />
    </linearGradient>
  </defs>

  <!-- Big solid dark backdrop -->
  <rect width="720" height="1280" fill="url(#screenBg)" />

  <!-- Grid Pattern Overlay -->
  <g opacity="0.05" stroke="#ffffff" stroke-width="1">
    <path d="M 0,160 L 720,160 M 0,320 L 720,320 M 0,480 L 720,480 M 0,640 L 720,640 M 0,800 L 720,800 M 0,960 L 720,960 M 0,1120 L 720,1120" />
    <path d="M 120,0 L 120,1280 M 240,0 L 240,1280 M 360,0 L 360,1280 M 480,0 L 480,1280 M 600,0 L 600,1280" />
  </g>

  <!-- Glowing Aura -->
  <circle cx="360" cy="640" r="280" fill="#7c3aed" opacity="0.12" />

  <!-- Mock SmartPhone Frame -->
  <rect x="40" y="40" width="640" height="1200" rx="48" fill="none" stroke="#2a2a3f" stroke-width="12" />
  
  <!-- Speaker/Camera Island -->
  <rect x="260" y="60" width="200" height="30" rx="15" fill="#2a2a3f" />

  <!-- Internal Screen Container -->
  <g transform="translate(60, 110)">
    <!-- Header Block -->
    <g transform="translate(40, 40)">
      <rect width="48" height="48" rx="12" fill="url(#accentGrad)" />
      <!-- Dumbbell -->
      <path d="M 14 24 L 34 24 M 14 16 L 14 32 M 18 18 L 18 30 M 34 16 L 34 32 M 30 18 L 30 30" stroke="#ffffff" stroke-width="3" fill="none" />
      
      <text x="64" y="24" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="20" font-weight="900" letter-spacing="-0.5">SW3AT</text>
      <text x="64" y="40" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="700">ACTIVE LOGGER</text>
    </g>

    <!-- Workout Status Panel -->
    <g transform="translate(40, 140)">
      <rect width="520" height="180" rx="24" fill="url(#cardGrad)" stroke="#1e1b4b" stroke-width="1.5" />
      <text x="30" y="44" fill="#a78bfa" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" font-mono="true" letter-spacing="1.5">ACTIVE SESSION</text>
      <text x="30" y="85" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900">Hypertrophy Legs A</text>
      <text x="30" y="115" fill="#f87171" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800" font-mono="true">⏱ 42:15 • 🔥 340 KCAL</text>

      <!-- Mini Progress bar -->
      <rect x="30" y="140" width="460" height="8" rx="4" fill="#1e1b4b" />
      <rect x="30" y="140" width="310" height="8" rx="4" fill="url(#accentGrad)" />
    </g>

    <!-- Exercise 1: Barbell Squat -->
    <g transform="translate(40, 360)">
      <rect width="520" height="240" rx="24" fill="url(#cardGrad)" stroke="#312e81" stroke-width="1.5" />
      
      <!-- Checkbox circle indicator -->
      <circle cx="45" cy="50" r="16" fill="#1e1b4b" stroke="#6366f1" stroke-width="2" />
      <path d="M 38 50 L 43 55 L 52 44" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />

      <text x="80" y="56" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="900">1. Barbell Back Squat</text>
      <text x="80" y="80" fill="#94a3b8" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600">Standard Legs Compendium</text>

      <!-- Sets table -->
      <g transform="translate(30, 110)">
        <!-- Set headers -->
        <text x="10" y="15" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" font-mono="true">SET</text>
        <text x="120" y="15" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" font-mono="true">LBS</text>
        <text x="240" y="15" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" font-mono="true">REPS</text>
        <text x="380" y="15" fill="#64748b" font-family="system-ui, -apple-system, sans-serif" font-size="10" font-weight="800" font-mono="true">STATUS</text>

        <!-- Set 1 Row -->
        <g transform="translate(0, 30)">
          <rect width="460" height="40" rx="10" fill="#1e1b4b" opacity="0.4" />
          <text x="15" y="25" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800">1</text>
          <text x="120" y="25" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">225 lbs</text>
          <text x="240" y="25" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">8 reps</text>
          <!-- Finished Green Check -->
          <circle cx="400" cy="20" r="10" fill="#10b981" />
          <path d="M 396 20 L 399 23 L 404 17" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </g>

        <!-- Set 2 Row -->
        <g transform="translate(0, 80)">
          <rect width="460" height="40" rx="10" fill="#1e1b4b" opacity="0.4" />
          <text x="15" y="25" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="800">2</text>
          <text x="120" y="25" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">225 lbs</text>
          <text x="240" y="25" fill="#e2e8f0" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="700">8 reps</text>
          <!-- Active orange tracker -->
          <circle cx="400" cy="20" r="10" fill="#ea580c" />
          <text x="400" y="23" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="8" font-weight="900" text-anchor="middle">⚡️</text>
        </g>
      </g>
    </g>

    <!-- AI coach widget -->
    <g transform="translate(40, 630)">
      <rect width="520" height="150" rx="24" fill="#0d1117" stroke="#10b981" stroke-width="1.5" />
      <text x="30" y="40" fill="#10b981" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="800" font-mono="true" letter-spacing="1">Active Gemini Coach</text>
      
      <circle cx="45" cy="85" r="18" fill="url(#accentGrad)" />
      <!-- Gemini icon sparkles -->
      <path d="M 45 74 L 45 96 M 34 85 L 56 85" stroke="#ffffff" stroke-width="2" />
      
      <text x="80" y="80" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800">"Looking excellent on reps. Focus on deep hip crease</text>
      <text x="80" y="100" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="800">and breathing core stability."</text>
    </g>
  </g>
</svg>`;

  try {
    // 1. Build normal PNG app icons from /public/logo.svg
    await sharp('public/logo.svg')
      .resize(192, 192)
      .png()
      .toFile('public/icon-192.png');
    console.log('✅ Generated public/icon-192.png');

    await sharp('public/logo.svg')
      .resize(512, 512)
      .png()
      .toFile('public/icon-512.png');
    console.log('✅ Generated public/icon-512.png');

    // 2. Build maskable PWA app icons (requires safe zone padding inside)
    // We achieve this by loading logo.svg, resizing it smaller to 154 (which is ~80% of 192),
    // and putting it on the dark solid backup circle, but our logo.svg already is padded nicely!
    // Let's create proper maskable files too!
    await sharp('public/logo.svg')
      .resize(192, 192)
      .png()
      .toFile('public/icon-192-maskable.png');
    console.log('✅ Generated public/icon-192-maskable.png');

    await sharp('public/logo.svg')
      .resize(512, 512)
      .png()
      .toFile('public/icon-512-maskable.png');
    console.log('✅ Generated public/icon-512-maskable.png');

    // 3. Render desktop screenshot showcase fully deterministic from direct SVG buffer
    await sharp(Buffer.from(desktopSvg))
      .png()
      .toFile('public/screenshot-desktop.png');
    console.log('✅ Generated public/screenshot-desktop.png');

    // 4. Render mobile screenshot showcase fully deterministic from direct SVG buffer
    await sharp(Buffer.from(mobileSvg))
      .png()
      .toFile('public/screenshot-mobile.png');
    console.log('✅ Generated public/screenshot-mobile.png');

    console.log('🎉 PWA assets built successfully and beautifully!');
  } catch (error) {
    console.error('❌ Error building PWA assets with Sharp:', error);
    process.exit(1);
  }
}

generateAssets();
