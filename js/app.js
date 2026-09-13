// Main Interactive AI Journey Application Logic
const CONTINENTS = [
  { id: 'departure', name: 'נקודת היציאה', weather: 'תמונת מצב', icon: 'sunrise' },
  { id: 'horizon', name: 'אזור היערכות ל-AI', weather: 'מבט רחב', icon: 'wind' },
  { id: 'human', name: 'אזור האדם והערך', weather: 'חשיבה פתוחה', icon: 'trees' },
  { id: 'strategy', name: 'אזור האסטרטגיה', weather: 'קבלת החלטות', icon: 'compass' },
  { id: 'summit', name: 'נקודת הפסגה', weather: 'תוכנית פעולה', icon: 'mountain' }
];

const PLACES = [
  ['departure', 'נקודת פתיחה'],
  ['horizon', 'הערכת המצב'],
  ['horizon', 'התמונה הארגונית'],
  ['human', 'ערך אנושי'],
  ['human', 'שאלות ניהוליות'],
  ['human', 'תשתית ארגונית'],
  ['strategy', 'בחירת מהלכים'],
  ['strategy', 'בדיקת הנחות'],
  ['strategy', 'בחינת חלופות'],
  ['summit', 'תוכנית יישום'],
  ['summit', 'צעדים הבאים']
];

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('main-stations-container');
  if (!container || typeof STATIONS_DATA === 'undefined') return;

  // Render all stations dynamically
  renderStations(STATIONS_DATA, container);
  renderContinentNav();

  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // Setup intersection observer, navigation, and map transitions.
  setupScrollObserver();
  setupStationReveals();
  setupControls();
  setupScrollTransitionPreference();
  setupMapInteractions();

  // Setup Station-Specific Interactive Components
  setupStationInteractivity();
});

function renderStations(data, parent) {
  parent.innerHTML = '';

  data.forEach((station, idx) => {
    const [continentId] = PLACES[idx];
    if (idx > 0 && continentId !== PLACES[idx - 1][0]) {
      renderContinentMap(parent, continentId);
    }

    const section = document.createElement('section');
    section.className = 'station-section';
    section.id = station.id;
    section.dataset.index = idx;
    section.dataset.continent = PLACES[idx][0];
    section.style.setProperty('--place-index', idx + 1);

    let innerContent = '';

    // Station 0: Hero / Intro
    if (station.id === 'hero') {
      innerContent = `
        <div class="station-content-card final-hero-card">
          <div class="place-kicker"><span>${CONTINENTS.find(c => c.id === PLACES[idx][0]).name}</span><i data-lucide="map-pin"></i> ${PLACES[idx][1]}</div>
          <div class="station-badge"><i data-lucide="compass" class="opening-compass"></i> ${station.badge}</div>
          <h1 class="station-title">${station.title}</h1>
          <h2 class="station-subtitle" style="margin-bottom: 1rem;">${station.subtitle}</h2>
          <p class="station-tagline hero-description">${station.description}</p>
          
          <div class="start-controls">
            <button class="finish-badge-box" id="start-journey-btn">
              <i data-lucide="play"></i> התחל
            </button>
            <label class="scroll-transition-toggle">
              <input type="checkbox" id="scroll-transition-toggle" checked>
              <span class="toggle-check" aria-hidden="true"><i data-lucide="check"></i></span>
              <span>הצג מעבר בין מקטעים בגלילה</span>
            </label>
          </div>
          <p style="font-size: 0.9rem; color: var(--accent-cyan); font-weight: 600;">${station.author}</p>
        </div>
      `;
    } 
    // Generic Stations with Cards or Quotes
    else {
      let quoteHtml = station.quote ? `
        <div class="quote-box">
          <div class="quote-text">${station.quote}</div>
          ${station.quoteAuthor ? `<span class="quote-author">— ${station.quoteAuthor}</span>` : ''}
        </div>
      ` : '';

      let cardsHtml = '';
      if (station.cards) {
        cardsHtml = `
          <div class="cards-grid">
            ${station.cards.map(c => `
              <div class="feature-card">
                ${c.icon ? `<div class="feature-icon"><i data-lucide="${c.icon}"></i></div>` : ''}
                ${c.num ? `<div class="roadmap-num">${c.num}</div>` : ''}
                <h3 class="feature-title">${c.title || c.question}</h3>
                <p class="feature-text">${c.text || c.detail}</p>
              </div>
            `).join('')}
          </div>
        `;
      }

      // Station 1: Dilemma
      let dilemmaHtml = station.dilemma ? `
        <div class="dilemma-container">
          <div class="dilemma-question"><i data-lucide="help-circle"></i> ${station.dilemma.question}</div>
          <div class="dilemma-options">
            ${station.dilemma.options.map((opt, i) => `
              <button class="dilemma-opt-btn" data-idx="${i}" data-score="${opt.score}" aria-expanded="false">
                <span>${opt.text}</span><i data-lucide="plus" class="expand-icon" aria-hidden="true"></i>
              </button>
            `).join('')}
          </div>
          <div class="dilemma-feedback" id="dilemma-fb"></div>
        </div>
      ` : '';

      // Station 2: Altitude Visualizer
      let altitudeHtml = station.interactiveAltitude ? `
        <div class="altitude-visualizer">
          <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">גובה תצפית אסטרטגי:</div>
          <div class="altitude-display" id="alt-val">30,000 רגל</div>
          <input type="range" min="0" max="30000" step="1000" value="30000" class="altitude-slider" id="alt-slider">
          <div class="altitude-perspective-text" id="alt-persp-text">
            ראייה כוללת: להמריא מעל הפרטים הטכניים ולבנות מסגרת אסטרטגית ארגונית מלאה
          </div>
        </div>
      ` : '';

      // Station 3: Comparison Grid
      let compHtml = station.comparison ? `
        <div class="comparison-grid">
          <div class="comp-box left">
            <span class="comp-badge">${station.comparison.left.badge}</span>
            <h3 class="feature-title">${station.comparison.left.title}</h3>
            <ul class="comp-list">
              ${station.comparison.left.items.map(it => `<li><i data-lucide="check-circle-2" style="color: var(--text-secondary);"></i> ${it}</li>`).join('')}
            </ul>
          </div>
          <div class="comp-box right">
            <span class="comp-badge">${station.comparison.right.badge}</span>
            <h3 class="feature-title">${station.comparison.right.title}</h3>
            <ul class="comp-list">
              ${station.comparison.right.items.map(it => `<li><i data-lucide="sparkles" style="color: var(--accent-magenta);"></i> ${it}</li>`).join('')}
            </ul>
          </div>
        </div>
      ` : '';

      // Station 4: Question Era Builder
      let qBuilderHtml = station.questionEraBuilder ? `
        <div class="question-era-game">
          <h3 class="feature-title"><i data-lucide="cpu"></i> בחירת שאלה אסטרטגית</h3>
          <p class="feature-text">בחרו שאלה אחת שתעזור למקד את הדיון הארגוני:</p>
          <div class="q-tokens" id="q-token-list">
            <button class="q-token-btn" data-question="מהו הדבר הברור מאליו שאנחנו מפספסים?" aria-pressed="false">מהו הדבר הברור מאליו שאנחנו מפספסים?</button>
            <button class="q-token-btn" data-question="כיצד יכול AI להגדיל פי עשרה את הערך ללקוח?" aria-pressed="false">כיצד יכול AI להגדיל פי עשרה את הערך ללקוח?</button>
            <button class="q-token-btn" data-question="איזה מודל עסקי יכול לשנות את כללי התחרות בענף שלנו?" aria-pressed="false">איזה מודל עסקי יכול לשנות את כללי התחרות בענף שלנו?</button>
          </div>
          <div class="built-question-box" id="built-q-box">
            בחרו שאלה כדי למקד את השיחה.
          </div>
        </div>
      ` : '';

      // Station 6: Flywheel Simulator
      let flywheelHtml = station.flywheelInteractive ? `
        <div class="flywheel-container">
          <div class="flywheel-wheel" id="flywheel-btn">
            <i data-lucide="rotate-cw" style="width: 48px; height: 48px; color: var(--accent-cyan);"></i>
          </div>
          <div class="spin-speed-display" id="flywheel-rpm">מהירות גלגל התנופה: 0 RPM</div>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">לחצו שוב ושוב להאצת גלגל התנופה האסטרטגי!</p>
        </div>
        ${station.bezosRule ? `<div class="bezos-rule-box"><i data-lucide="zap"></i> ${station.bezosRule}</div>` : ''}
      ` : '';

      // Station 8: Quiz
      let quizHtml = station.quizInteractive ? `
        <div class="quiz-wrapper">
          ${station.questions.map((q, qIdx) => `
            <div class="quiz-card" data-qidx="${qIdx}">
              <div class="quiz-q-title"><i data-lucide="help-circle"></i> ${q.title}</div>
              <p class="quiz-q-text">${q.text}</p>
              <div class="quiz-opts">
                ${q.options.map((opt, oIdx) => `
                  <button class="quiz-opt-btn" data-qidx="${qIdx}" data-oidx="${oIdx}" data-score="${opt.score}">
                    <span>${opt.text}</span>
                    <span class="quiz-tag">${opt.tag}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
          <div class="quiz-score-report" id="quiz-report">
            <h3>ציוד האסטרטגיה הארגונית שלכם:</h3>
            <div class="score-num" id="score-val">0</div>
            <p id="score-desc" style="margin-top: 0.5rem;"></p>
          </div>
        </div>
      ` : '';

      // Station 9: Roadmap
      let roadmapHtml = station.principles ? `
        <div class="roadmap-grid">
          ${station.principles.map(p => `
            <div class="roadmap-card">
              <div class="roadmap-num">${p.num}</div>
              <h3 class="roadmap-title">${p.title}</h3>
              <p class="roadmap-desc">${p.desc}</p>
            </div>
          `).join('')}
        </div>
      ` : '';

      // Station 10: Final Summit
      let finalHtml = station.takeaways ? `
        <div class="final-hero-card station-content-card" style="margin-top: 1rem;">
          <div class="station-badge"><i data-lucide="flag"></i> ${station.badge}</div>
          <h2 class="station-title">${station.title}</h2>
          <p class="station-subtitle" style="margin-bottom: 1.5rem;">${station.subtitle}</p>
          
          <ul class="takeaways-list">
            ${station.takeaways.map(t => `<li><i data-lucide="check" style="color: var(--accent-cyan);"></i> ${t}</li>`).join('')}
          </ul>

          <div class="final-statement">
            ${station.finalQuote}
          </div>
          <p style="color: var(--accent-cyan); font-weight: 700; margin-bottom: 2rem;">${station.finalAuthor}</p>

          <button class="finish-badge-box" id="restart-journey-btn">
            <i data-lucide="rotate-ccw"></i> התחל את המסע מחדש
          </button>
        </div>
      ` : '';

      let pointsHtml = station.points ? `
        <div class="cards-grid" style="margin-top: 1.5rem;">
          ${station.points.map(p => `
            <div class="feature-card">
              <h3 class="feature-title">${p.title}</h3>
              <p class="feature-text">${p.text}</p>
            </div>
          `).join('')}
        </div>
      ` : '';

      innerContent = `
          <div class="station-content-card">
          <div class="place-kicker"><span>${CONTINENTS.find(c => c.id === PLACES[idx][0]).name}</span><i data-lucide="map-pin"></i> ${PLACES[idx][1]}</div>
          <div class="station-signal" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="station-telemetry" aria-label="מקטע ${station.number} מתוך המסע">
            <span>מקטע ${station.number}</span><div class="telemetry-line"><b></b></div><span>${PLACES[idx][1]}</span>
          </div>
          <div class="station-number">${station.number}</div>
          <div class="station-header">
            ${station.badge ? `<div class="station-badge"><i data-lucide="${station.icon}"></i> ${station.badge}</div>` : ''}
            <h2 class="station-title">${station.title}</h2>
            <h3 class="station-subtitle">${station.subtitle}</h3>
            ${station.description ? `<p class="station-tagline">${station.description}</p>` : ''}
          </div>

          ${quoteHtml}
          ${cardsHtml}
          ${pointsHtml}
          ${dilemmaHtml}
          ${altitudeHtml}
          ${compHtml}
          ${qBuilderHtml}
          ${flywheelHtml}
          ${quizHtml}
          ${roadmapHtml}
          ${finalHtml}
        </div>
      `;
    }

    section.innerHTML = innerContent;
    parent.appendChild(section);
  });
}

function renderContinentMap(parent, currentContinentId) {
  const continent = CONTINENTS.find(item => item.id === currentContinentId);
  const section = document.createElement('section');
  section.className = 'continent-map-section';
  section.dataset.continent = currentContinentId;
  section.innerHTML = `
    <div class="world-map-panel">
      <div class="map-eyebrow"><i data-lucide="map"></i> מבט על המסע</div>
      <h2>מפת המסע</h2>
      <p class="map-subtitle">${continent.name} נמצאת לפניכם</p>
      <div class="world-map-surface" aria-label="מפת אזורי המסע">
        ${CONTINENTS.map(item => `
          <button class="map-continent ${item.id === currentContinentId ? 'current' : ''}" data-map-target="${item.id}">
            <i data-lucide="${item.icon}"></i>
            <span>${item.name}</span>
          </button>
        `).join('')}
        <div class="map-route" aria-hidden="true"></div>
      </div>
      <button class="enter-continent-btn" data-enter-continent="${currentContinentId}">
        <i data-lucide="move-down"></i> כניסה ל${continent.name}
      </button>
    </div>
  `;
  parent.appendChild(section);
}

function renderContinentNav() {
  const nav = document.getElementById('continent-nav');
  if (!nav) return;

  nav.innerHTML = CONTINENTS.map(continent => `
    <button class="continent-nav-item" data-continent="${continent.id}" title="${continent.name}">
      <i data-lucide="${continent.icon}"></i><span>${continent.name.replace('אזור ', '').replace('נקודת ', '')}</span>
    </button>
  `).join('');

  nav.addEventListener('click', (event) => {
    const button = event.target.closest('[data-continent]');
    if (!button) return;
    const target = document.querySelector(`.continent-map-section[data-continent="${button.dataset.continent}"], .station-section[data-continent="${button.dataset.continent}"]`);
    if (target) travelTo(target, CONTINENTS.find(item => item.id === button.dataset.continent)?.name);
  });
}

function setupScrollObserver() {
  const sections = document.querySelectorAll('.station-section');
  const progressFill = document.getElementById('progress-fill');
  const hudLabel = document.getElementById('hud-station-label');
  const hudContinent = document.getElementById('hud-continent');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index, 10);
        const previousIdx = window.currentStationIdx;
        window.currentStationIdx = idx;
        const [continentId, place] = PLACES[idx];
        const continent = CONTINENTS.find(item => item.id === continentId);
        if (typeof previousIdx === 'number' && previousIdx !== idx && !window.isTraveling && window.scrollTransitionsEnabled !== false) {
          showTravelTransition(PLACES[previousIdx][1], place);
        }
        document.body.dataset.continent = continentId;
        document.querySelectorAll('.continent-nav-item').forEach(button => {
          button.classList.toggle('active', button.dataset.continent === continentId);
        });

        // Update HUD
        const total = STATIONS_DATA.length;
        const progressPct = ((idx) / (total - 1)) * 100;
        if (progressFill) progressFill.style.width = `${progressPct}%`;
        if (hudLabel) hudLabel.textContent = place;
        if (hudContinent && continent) hudContinent.textContent = `${continent.name} · ${continent.weather}`;
      }
    });
  }, { threshold: 0.5 });

  sections.forEach(sec => observer.observe(sec));
}

function setupStationReveals() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.station-content-card, .world-map-panel').forEach(element => observer.observe(element));
}

function setupScrollTransitionPreference() {
  const toggle = document.getElementById('scroll-transition-toggle');
  if (!toggle) return;

  const savedPreference = localStorage.getItem('scrollTransitionsEnabled');
  toggle.checked = savedPreference !== 'false';
  window.scrollTransitionsEnabled = toggle.checked;
  toggle.addEventListener('change', () => {
    window.scrollTransitionsEnabled = toggle.checked;
    localStorage.setItem('scrollTransitionsEnabled', String(toggle.checked));
  });
}

function setupControls() {
  const prevBtn = document.getElementById('hud-prev');
  const nextBtn = document.getElementById('hud-next');

  const navigateStation = (dir) => {
    let targetIdx = (window.currentStationIdx || 0) + dir;
    targetIdx = Math.max(0, Math.min(STATIONS_DATA.length - 1, targetIdx));
    const currentContinent = PLACES[window.currentStationIdx || 0][0];
    const nextContinent = PLACES[targetIdx][0];
    if (dir > 0 && currentContinent !== nextContinent) {
      const map = document.querySelector(`.continent-map-section[data-continent="${nextContinent}"]`);
      if (map) {
        travelTo(map, CONTINENTS.find(item => item.id === nextContinent)?.name);
        return;
      }
    }
    const targetSection = document.getElementById(STATIONS_DATA[targetIdx].id);
    if (targetSection) {
      travelTo(targetSection, PLACES[targetIdx][1]);
    }
  };

  if (prevBtn) prevBtn.addEventListener('click', () => navigateStation(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigateStation(1));

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'PageDown') {
      navigateStation(1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
      navigateStation(-1);
    }
  });

  // Start journey button
  document.addEventListener('click', (e) => {
    if (e.target.closest('#start-journey-btn')) {
      navigateStation(1);
    } else if (e.target.closest('#restart-journey-btn')) {
      navigateStation(-10);
    }
  });
}

function setupMapInteractions() {
  document.addEventListener('click', (event) => {
    const continentId = event.target.closest('[data-map-target], [data-enter-continent]')?.dataset.mapTarget
      || event.target.closest('[data-enter-continent]')?.dataset.enterContinent;
    if (!continentId) return;
    const target = document.querySelector(`.station-section[data-continent="${continentId}"]`);
    if (target) travelTo(target, PLACES.find(place => place[0] === continentId)?.[1]);
  });
}

function travelTo(target, destination) {
  const transition = document.getElementById('travel-transition');
  const from = document.getElementById('travel-from');
  const to = document.getElementById('travel-to');
  if (!transition || !target) {
    target?.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  window.isTraveling = true;
  showTravelTransition(document.getElementById('hud-station-label')?.textContent || 'נקודת פתיחה', destination || 'היעד הבא');

  window.setTimeout(() => target.scrollIntoView({ behavior: 'auto', block: 'start' }), 700);
  window.setTimeout(() => {
    window.isTraveling = false;
  }, 1400);
}

function showTravelTransition(fromName, destination) {
  const transition = document.getElementById('travel-transition');
  const from = document.getElementById('travel-from');
  const to = document.getElementById('travel-to');
  if (!transition || !from || !to) return;

  from.textContent = fromName;
  to.textContent = destination;
  transition.setAttribute('aria-hidden', 'false');
  transition.classList.remove('in-flight');
  transition.classList.add('visible');
  requestAnimationFrame(() => transition.classList.add('in-flight'));
  window.clearTimeout(window.travelTransitionTimer);
  window.travelTransitionTimer = window.setTimeout(() => {
    transition.classList.remove('visible', 'in-flight');
    transition.setAttribute('aria-hidden', 'true');
  }, 950);
}

function setupStationInteractivity() {
  // Station 1: Dilemma
  const dilemmaBtns = document.querySelectorAll('.dilemma-opt-btn');
  const dilemmaFb = document.getElementById('dilemma-fb');

  dilemmaBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const wasSelected = btn.classList.contains('selected');
      dilemmaBtns.forEach(b => b.classList.remove('selected'));
      dilemmaBtns.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        const icon = b.querySelector('.expand-icon');
        if (icon) icon.setAttribute('data-lucide', 'plus');
      });
      if (wasSelected) {
        if (dilemmaFb) dilemmaFb.style.display = 'none';
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
      }
      btn.classList.add('selected');
      btn.setAttribute('aria-expanded', 'true');
      const selectedIcon = btn.querySelector('.expand-icon');
      if (selectedIcon) selectedIcon.setAttribute('data-lucide', 'minus');
      if (typeof lucide !== 'undefined') lucide.createIcons();
      const idx = parseInt(btn.dataset.idx, 10);
      const opt = STATIONS_DATA[1].dilemma.options[idx];
      if (dilemmaFb && opt) {
        dilemmaFb.textContent = opt.feedback;
        dilemmaFb.style.display = 'block';
      }
    });
  });

  // Station 2: Altitude Slider
  const altSlider = document.getElementById('alt-slider');
  const altVal = document.getElementById('alt-val');
  const altText = document.getElementById('alt-persp-text');

  if (altSlider) {
    altSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (altVal) altVal.textContent = `${val.toLocaleString()} רגל`;

      if (val < 10000) {
        if (altText) altText.textContent = "גובה טקטי נמוך: עיסוק אובססיבי במודל ה-AI האחרון ובכלים נקודתיים בלבד";
      } else if (val < 25000) {
        if (altText) altText.textContent = "גובה ביניים: בניית תהליכי עבודה מקומיים אך ללא חזון ארגוני רחב";
      } else {
        if (altText) altText.textContent = "גובה 30,000 רגל: ראייה אסטרטגית כוללת, עיצוב מחדש של היתרון העסקי והאנושי!";
      }
    });
  }

  // Station 4: Question Era Builder
  const qTokens = document.querySelectorAll('.q-token-btn');
  const builtQBox = document.getElementById('built-q-box');

  qTokens.forEach(btn => {
    btn.addEventListener('click', () => {
      const wasActive = btn.classList.contains('active');
      qTokens.forEach(token => {
        token.classList.remove('active');
        token.setAttribute('aria-pressed', 'false');
      });
      if (!wasActive) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      }
      if (builtQBox) {
        builtQBox.textContent = wasActive
          ? 'בחרו שאלה כדי למקד את השיחה.'
          : `״${btn.dataset.question}״`;
      }
    });
  });

  // Station 6: Flywheel Simulator
  const flywheelBtn = document.getElementById('flywheel-btn');
  const flywheelRpm = document.getElementById('flywheel-rpm');
  let currentRotation = 0;
  let rpm = 0;

  if (flywheelBtn) {
    flywheelBtn.addEventListener('click', () => {
      rpm += 120;
      currentRotation += 90;
      flywheelBtn.style.transform = `rotate(${currentRotation}deg)`;
      if (flywheelRpm) flywheelRpm.textContent = `מהירות גלגל התנופה: ${rpm} RPM`;
    });

    // Slow down flywheel continuously over time
    setInterval(() => {
      if (rpm > 0) {
        rpm = Math.max(0, rpm - 5);
        if (flywheelRpm) flywheelRpm.textContent = `מהירות גלגל התנופה: ${rpm} RPM`;
      }
    }, 200);
  }

  // Station 8: Strategic Mirror Quiz
  const quizBtns = document.querySelectorAll('.quiz-opt-btn');
  const quizScores = { q0: 0, q1: 0, q2: 0, q3: 0 };
  const quizReport = document.getElementById('quiz-report');
  const scoreVal = document.getElementById('score-val');
  const scoreDesc = document.getElementById('score-desc');

  quizBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const qIdx = btn.dataset.qidx;
      const score = parseInt(btn.dataset.score, 10);

      // Deselect sibling buttons in same question card
      document.querySelectorAll(`.quiz-opt-btn[data-qidx="${qIdx}"]`).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      quizScores[`q${qIdx}`] = score;

      // Calculate total
      const totalScore = Object.values(quizScores).reduce((a, b) => a + b, 0);

      if (quizReport && scoreVal && scoreDesc) {
        quizReport.style.display = 'block';
        scoreVal.textContent = `${totalScore} / 40`;

        if (totalScore >= 30) {
          scoreDesc.textContent = "ארגון חלוץ ופורץ דרך! אתם מובילים את מהפכת ה-AI בעוצמה ובראייה אסטרטגית חדה.";
        } else if (totalScore >= 15) {
          scoreDesc.textContent = "ארגון בתנופה! יש יסודות חזקים, אך עליכם להעמיק את החשיבה המשבשת ולהעז יותר.";
        } else {
          scoreDesc.textContent = "זמן לאתחל תפיסה! הארגון נמצא בלולאת אופטימיזציה שולית. זה הזמן לעבור לקפיצות מדרגה.";
        }
      }

    });
  });
}
