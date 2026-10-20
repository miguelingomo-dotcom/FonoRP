/* FonoRP — interfaz. La corrección vive en fono.js. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v == null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento */ } },
  };

  const PATTERN_LABEL = {
    schwa: 'Schwa', acento: 'Acento', grafia: 'Grafía engañosa', mudas: 'Letras mudas',
    o_ʌ: 'o = /ʌ/', ch_k: 'ch = /k/', fricativas: 'Fricativas', r_rp: 'La r de RP', terminaciones: '-s y -ed',
  };
  const LEVELS = [['all', 'Todos'], ['1', '1'], ['2', '2'], ['3', '3']];
  const SIZES = [['5', '5'], ['10', '10']];
  const MODES = [['app', 'En la app'], ['paper', 'En papel']];

  const state = {
    data: null,
    settings: Object.assign({ mode: 'app', pattern: 'all', level: 'all', size: '10' }, store.get('fonorp.settings', {})),
    batch: [], idx: 0, results: [],
    input: [], phase: 'input', // input | review | paper | paper-review
    lastResult: null,
  };

  // ---------- Progreso (localStorage) ----------
  // { v: 1, words: { [palabra]: { a: intentos, c: aciertos, last: 'AAAA-MM-DD' } } }
  const PROGRESS_KEY = 'fonorp.progress';
  const progress = {
    load() { const d = store.get(PROGRESS_KEY, null); return d && d.v === 1 && d.words ? d : { v: 1, words: {} }; },
    record(entry, ok) {
      const d = this.load();
      const w = d.words[entry.word] || { a: 0, c: 0, last: '' };
      w.a++; if (ok) w.c++;
      w.last = new Date().toISOString().slice(0, 10);
      d.words[entry.word] = w;
      store.set(PROGRESS_KEY, d);
    },
    clear() { try { localStorage.removeItem(PROGRESS_KEY); } catch { /* sin almacenamiento */ } },
  };

  // ---------- Utilidades IPA ----------
  function ipaHTML(str) {
    return Fono.tokenize(str).map(t => {
      const cls = t.kind === 'primary' ? 'tok-mark tok-primary' : t.kind === 'secondary' ? 'tok-mark' : t.kind === 'dot' ? 'tok-dot' : '';
      return cls ? `<span class="${cls}">${esc(t.t)}</span>` : esc(t.t);
    }).join('');
  }
  const slashed = inner => `<span class="slash">/</span>${inner}<span class="slash">/</span>`;
  // /x/ dentro de los mensajes del corrector: en fuente IPA.
  const richMsg = msg => esc(msg).replace(/\/([^\/\s][^\/]*?)\//g, (_, x) => `<span class="ipa">/${x}/</span>`);

  function shuffle(a) {
    const b = a.slice();
    for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; }
    return b;
  }

  // ---------- Controles segmentados ----------
  function buildSegmented(el, options, value, onChange) {
    el.innerHTML = '<span class="seg-thumb" aria-hidden="true"></span>' + options.map(([v, label]) =>
      `<button type="button" class="seg" role="radio" data-v="${esc(v)}" aria-checked="${v === value}">${esc(label)}</button>`).join('');
    const thumb = el.querySelector('.seg-thumb');
    const place = () => {
      const on = el.querySelector('[aria-checked="true"]');
      if (!on) return;
      thumb.style.width = on.offsetWidth + 'px';
      thumb.style.transform = `translateX(${on.offsetLeft}px)`;
    };
    el.addEventListener('click', e => {
      const b = e.target.closest('.seg');
      if (!b) return;
      el.querySelectorAll('.seg').forEach(s => s.setAttribute('aria-checked', String(s === b)));
      place();
      onChange(b.dataset.v);
    });
    requestAnimationFrame(place);
    el._place = place;
  }

  // ---------- Inicio ----------
  function filteredWords() {
    const { pattern, level } = state.settings;
    return state.data.words.filter(w =>
      (pattern === 'all' || w.patterns.includes(pattern)) && (level === 'all' || String(w.level) === level));
  }

  function saveSettings() { store.set('fonorp.settings', state.settings); }

  function updateStart() {
    const n = filteredWords().length;
    const size = Math.min(n, Number(state.settings.size));
    $('start-count').textContent = n ? `${size} de ${n}` : '';
    $('start-btn').disabled = !n;
    $('setup-empty').hidden = !!n;
    const p = state.settings.pattern;
    $('pattern-desc').textContent = p === 'all' ? 'Todas las palabras mezcladas.' : state.data.patterns[p] || '';
  }

  function buildHome() {
    const words = state.data.words;
    const chips = [['all', 'Todos', words.length]].concat(Object.keys(state.data.patterns).map(k =>
      [k, PATTERN_LABEL[k] || k, words.filter(w => w.patterns.includes(k)).length]));
    const chipsEl = $('pattern-chips');
    chipsEl.innerHTML = chips.map(([k, label, n]) =>
      `<button type="button" class="chip" role="radio" data-v="${esc(k)}" aria-checked="${k === state.settings.pattern}">` +
      `<span class="chip-box" aria-hidden="true"></span><span>${label.replace(/\/[^\/]+\//g, m => `<span class="ipa">${esc(m)}</span>`)}</span><span class="chip-count">${n}</span></button>`).join('');
    chipsEl.addEventListener('click', e => {
      const b = e.target.closest('.chip');
      if (!b) return;
      chipsEl.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-checked', String(c === b)));
      state.settings.pattern = b.dataset.v; saveSettings(); updateStart();
    });
    buildSegmented($('mode-seg'), MODES, state.settings.mode, v => { state.settings.mode = v; saveSettings(); });
    buildSegmented($('level-seg'), LEVELS, state.settings.level, v => { state.settings.level = v; saveSettings(); updateStart(); });
    buildSegmented($('size-seg'), SIZES, state.settings.size, v => { state.settings.size = v; saveSettings(); updateStart(); });
    $('setup').addEventListener('submit', e => {
      e.preventDefault();
      const pool = filteredWords();
      if (pool.length) startBatch(shuffle(pool).slice(0, Number(state.settings.size)));
    });
    updateStart();
  }

  // Espécimen del inicio: una transcripción que se escribe fonema a fonema.
  const specimen = {
    timers: [], i: 0,
    words: ['comfortable', 'photographer', 'chemistry', 'thorough', 'pleasure', 'colonel'],
    clear() { this.timers.forEach(clearTimeout); this.timers = []; },
    later(fn, ms) { this.timers.push(setTimeout(fn, ms)); },
    start() {
      this.clear();
      const list = this.words.map(w => state.data.words.find(x => x.word === w)).filter(Boolean);
      if (!list.length) return;
      const box = document.querySelector('.specimen');
      const wordEl = $('specimen-word'), ipaEl = $('specimen-ipa');
      const show = () => {
        const entry = list[this.i++ % list.length];
        box.classList.remove('is-leaving');
        wordEl.textContent = entry.word;
        const toks = Fono.tokenize(entry.ipa);
        if (reduceMotion()) { ipaEl.innerHTML = ipaHTML(entry.ipa); return; }
        ipaEl.innerHTML = '';
        toks.forEach((t, k) => this.later(() => {
          const cls = t.kind === 'primary' || t.kind === 'secondary' ? 'tok tok-mark' : t.kind === 'dot' ? 'tok tok-dot' : 'tok';
          ipaEl.insertAdjacentHTML('beforeend', `<span class="${cls}">${esc(t.t)}</span>`);
        }, 420 + k * 95));
        const done = 420 + toks.length * 95;
        this.later(() => box.classList.add('is-leaving'), done + 2400);
        this.later(show, done + 2650);
      };
      show();
    },
  };

  // ---------- Vistas ----------
  function go(view) {
    document.body.dataset.view = view;
    if (view === 'stats') renderStats();
    if (view === 'home') { specimen.start(); requestAnimationFrame(() => ['mode-seg', 'level-seg', 'size-seg'].forEach(id => $(id)._place && $(id)._place())); }
    else specimen.clear();
    window.scrollTo(0, 0);
  }

  // ---------- Teclado fonémico ----------
  // Disposición de la tabla de Underhill: [símbolo, columna, clase]
  const VOWEL_LAYOUT = [
    ['iː', 1], ['ɪ', 2], ['ʊ', 3], ['uː', 4], ['ɪə', 6, 'diph'], ['eɪ', 7, 'diph'], ['i', 10, 'extra'],
    ['e', 1], ['ə', 2], ['ɜː', 3], ['ɔː', 4], ['ʊə', 6, 'diph'], ['ɔɪ', 7, 'diph'], ['əʊ', 8, 'diph'], ['u', 10, 'extra'],
    ['æ', 1], ['ʌ', 2], ['ɑː', 3], ['ɒ', 4], ['eə', 6, 'diph'], ['aɪ', 7, 'diph'], ['aʊ', 8, 'diph'], ['l̩', 10, 'extra'],
  ];
  const ROW_STARTS = new Set(['iː', 'e', 'æ']);

  function keyHTML(sym, cls) {
    return `<button type="button" class="key${cls ? ' key-' + cls : ''}" data-sym="${esc(sym)}" aria-label="${esc(sym)}, como en ${esc(Fono.EXAMPLE[sym] || '')}">` +
      `<span class="key-sym">${esc(sym)}</span><span class="key-ex">${esc(Fono.EXAMPLE[sym] || '')}</span></button>`;
  }

  function buildKeyboard() {
    let row = 0;
    $('kb-vowels').innerHTML = VOWEL_LAYOUT.map(([sym, col, cls]) => {
      if (ROW_STARTS.has(sym)) row++;
      return keyHTML(sym, cls).replace('<button ', `<button style="grid-row:${row};grid-column:${col}" `);
    }).join('');
    $('kb-consonants').innerHTML = Fono.TABLE.consonants.map(([sym]) => keyHTML(sym)).join('');

    $('keyboard').addEventListener('click', e => {
      const k = e.target.closest('.key[data-sym]');
      if (!k || state.phase !== 'input') return;
      addSym(k.dataset.sym);
    });
    $('del-btn').addEventListener('click', () => { if (state.phase === 'input') { state.input.pop(); renderAnswer(); } });
    $('clear-btn').addEventListener('click', () => { if (state.phase === 'input') { state.input = []; renderAnswer(); } });
    $('check-btn').addEventListener('click', onPrimary);

    document.addEventListener('keydown', e => {
      if (document.body.dataset.view !== 'drill' || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Enter') { e.preventDefault(); onPrimary(); }
      else if (e.key === 'Backspace' && state.phase === 'input') { e.preventDefault(); state.input.pop(); renderAnswer(); }
    });
  }

  function addSym(sym) {
    state.input.push(sym);
    renderAnswer(true);
    $('answer').classList.remove('is-nudge');
    $('answer-hint').classList.remove('is-nudge');
  }

  function renderAnswer(animateLast) {
    const n = state.input.length;
    $('answer-tokens').innerHTML = state.input.map((s, i) => {
      const cls = ['tok'];
      if (s === 'ˈ' || s === 'ˌ') cls.push('tok-mark');
      if (s === 'ˈ') cls.push('tok-primary');
      if (s === '.') cls.push('tok-dot');
      if (animateLast && i === n - 1) cls.push('tok-new');
      return `<span class="${cls.join(' ')}">${esc(s)}</span>`;
    }).join('');
    $('clear-btn').hidden = !n || state.phase !== 'input';
  }

  // ---------- Audio (voz del sistema en-GB) ----------
  const speech = {
    voice: null, noted: false,
    get ok() { return 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined'; },
    pick() {
      if (!this.ok) return;
      const vs = speechSynthesis.getVoices();
      const gb = vs.filter(v => /^en[-_]GB/i.test(v.lang));
      this.voice = gb.find(v => /Daniel|Serena|Kate|Arthur|Martha|Google UK/i.test(v.name)) || gb[0] || null;
      $('audio-btn').hidden = !this.voice;
    },
    say(text) {
      if (!this.voice) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = this.voice; u.lang = this.voice.lang; u.rate = 0.88;
      const btn = $('audio-btn');
      u.onstart = () => btn.classList.add('is-speaking');
      u.onend = u.onerror = () => btn.classList.remove('is-speaking');
      speechSynthesis.speak(u);
      if (!this.noted) {
        this.noted = true;
        document.querySelector('.prompt').insertAdjacentHTML('beforeend',
          '<p class="voice-note" id="voice-note">Voz del sistema, aproximada. Si no coincide, manda la transcripción.</p>');
      }
    },
  };

  // ---------- Tanda ----------
  const HINT = 'Pulsa los fonemas de la tabla. Marca el acento con <span class="ipa">ˈ</span> delante de la sílaba tónica.';
  function startBatch(entries) {
    state.batch = entries; state.idx = 0; state.results = [];
    $('progress').innerHTML = entries.map(() => '<li></li>').join('');
    go('drill');
    showWord(false);
  }

  function fitWord() {
    const el = $('word');
    const w = el.parentElement.clientWidth - 60;
    const len = Math.max(4, el.textContent.length);
    const size = Math.max(34, Math.min(76, Math.floor(w / (len * 0.5))));
    el.style.setProperty('--word-size', size + 'px');
  }

  function showWord(animate = true) {
    const render = () => {
      const entry = state.batch[state.idx];
      const mode = state.settings.mode;
      state.input = [];
      state.lastResult = null;
      state.phase = mode === 'paper' ? 'paper' : 'input';

      $('word').textContent = entry.word;
      $('word').setAttribute('lang', 'en');
      fitWord();
      $('meta-level').textContent = entry.level;
      $('meta-patterns').textContent = entry.patterns.map(p => PATTERN_LABEL[p] || p).join(', ');
      hideStamp();
      $('answer-hint').innerHTML = HINT;

      $('stage').classList.remove('is-review');
      const feedback = $('feedback');
      feedback.hidden = true; feedback.innerHTML = '';
      $('answer').classList.remove('is-locked', 'is-nudge', 'is-diff');
      $('answer-hint').classList.remove('is-nudge');

      const kb = $('keyboard');
      kb.classList.remove('is-review');
      kb.querySelectorAll('.key').forEach(k => { k.classList.remove('in-word', 'missed'); k.style.removeProperty('--kd'); });
      kb.querySelector('.paper-actions')?.remove();

      if (state.phase === 'paper') {
        $('answer-block').hidden = true;
        $('answer-hint').hidden = true;
        kb.classList.add('is-paper', 'is-collapsed');
        $('check-btn').hidden = true;
        feedback.hidden = false;
        feedback.innerHTML = `<div class="paper-card" style="--d:0"><strong>Escríbela en tu papel.</strong><p>Cuando la tengas, compárala con la solución.</p></div>`;
        kb.insertAdjacentHTML('beforeend', `<div class="paper-actions"><button type="button" class="btn-primary wide" data-act="reveal">Ver solución</button></div>`);
      } else {
        $('answer-block').hidden = false;
        $('answer-hint').hidden = false;
        kb.classList.remove('is-paper', 'is-collapsed');
        $('check-btn').hidden = false;
        setPrimaryLabel('Comprobar', false);
        renderAnswer();
      }
      updateProgress();
      $('stage').scrollTop = 0;
    };

    const inner = $('stage-inner');
    if (!animate || reduceMotion()) { render(); return; }
    inner.classList.add('is-leaving');
    setTimeout(() => {
      render();
      inner.classList.remove('is-leaving');
      inner.classList.add('is-entering');
      inner.addEventListener('animationend', () => inner.classList.remove('is-entering'), { once: true });
    }, 150);
  }

  function updateProgress() {
    const items = $('progress').children;
    [...items].forEach((li, i) => {
      const r = state.results[i];
      li.className = r ? (!r.correct ? 'is-bad' : r.warn ? 'is-warn' : 'is-ok') : i === state.idx ? 'is-current' : '';
    });
    const pad = n => String(n).padStart(2, '0');
    $('progress-count').textContent = `${pad(Math.min(state.idx + 1, state.batch.length))}/${pad(state.batch.length)}`;
  }

  function setPrimaryLabel(text, animate = true) {
    const label = $('check-label');
    if (!animate || reduceMotion() || label.textContent === text) { label.textContent = text; return; }
    label.classList.add('is-swapping');
    setTimeout(() => { label.textContent = text; label.classList.remove('is-swapping'); }, 140);
  }

  function onPrimary() {
    if (state.phase === 'input') return check();
    if (state.phase === 'review' || state.phase === 'paper-review') return next();
    if (state.phase === 'paper') return reveal();
  }

  function next() {
    if (state.phase === 'paper-review' && !state.results[state.idx]) return; // falta autoevaluarse
    state.idx++;
    if (state.idx >= state.batch.length) return showSummary();
    showWord(true);
  }

  // ---------- Corrección (modo app) ----------
  function check() {
    if (!state.input.length) {
      $('answer').classList.add('is-nudge');
      $('answer-hint').classList.add('is-nudge');
      return;
    }
    const entry = state.batch[state.idx];
    const r = Fono.check(state.input.join(''), entry);
    state.lastResult = r;
    state.results[state.idx] = { entry, correct: r.correct, warn: r.correct && r.warnings.length > 0, typical: r.typical, answer: state.input.join('') };
    progress.record(entry, r.correct);
    state.phase = 'review';

    $('stage').classList.add('is-review');
    $('answer').classList.add('is-locked');
    $('clear-btn').hidden = true;
    $('answer-hint').hidden = true;
    highlightKeyboard(r);
    showStamp(r.correct ? 'APTO' : r.typical ? 'ERROR TÍPICO' : 'REVISAR', !r.correct);
    renderFeedback(r, entry);
    setPrimaryLabel(state.idx === state.batch.length - 1 ? 'Ver resumen' : 'Siguiente');
    updateProgress();
  }

  function highlightKeyboard(r, formStr) {
    const kb = $('keyboard');
    const target = r ? r.formParsed.phonemes : Fono.parse(formStr).phonemes;
    const inWord = new Set(target);
    const missed = new Set(r ? r.ops.filter(o => o.op === 'sub' || o.op === 'missing').map(o => o.t) : []);
    kb.classList.add('is-review');
    let i = 0;
    kb.querySelectorAll('.kb-vowels .key, .kb-consonants .key').forEach(k => {
      const s = k.dataset.sym;
      if (inWord.has(s)) { k.classList.add(missed.has(s) ? 'missed' : 'in-word'); k.style.setProperty('--kd', `${120 + i++ * 30}ms`); }
    });
  }

  // El sello del tribunal: el veredicto visible. El texto equivalente va en .verdict para lectores de pantalla.
  function showStamp(text, bad) {
    const st = $('stamp');
    $('stamp-main').textContent = text;
    st.classList.toggle('is-bad', bad);
    st.classList.remove('is-in');
    st.hidden = false;
    void st.offsetWidth; // reinicia la animación
    st.classList.add('is-in');
    $('answer-block').classList.remove('is-stamped');
    void $('answer-block').offsetWidth;
    $('answer-block').classList.add('is-stamped');
  }
  function hideStamp() {
    $('stamp').hidden = true;
    $('stamp').classList.remove('is-in');
    $('answer-block').classList.remove('is-stamped');
  }

  function verdictHTML(kind, text, visuallyHidden) {
    return `<div class="verdict ${kind}${visuallyHidden ? ' sr-only' : ''}" style="--d:0">${esc(text)}</div>`;
  }

  function modelHTML(entry, form, d) {
    const main = form ? form.s : entry.ipa;
    const others = [entry.ipa, ...(entry.variants || [])].filter(s => s !== main);
    const label = form && form.kind === 'variant' ? 'Variante aceptada' : 'Transcripción RP';
    return `<div class="model" style="--d:${d}"><span class="field-label">${label}</span>` +
      `<div class="model-ipa">${slashed(ipaHTML(main))}</div>` +
      (others.length ? `<div class="model-alt">También válido: ${others.map(s => `<span class="ipa">/${ipaHTML(s)}/</span>`).join(', ')}</div>` : '') +
      `</div>`;
  }

  function noteHTML(entry, d) {
    return entry.note ? `<div class="note" style="--d:${d}"><div class="field-label">Nota</div><p>${richMsg(entry.note)}</p></div>` : '';
  }

  // Columnas de la comparación: lo que escribiste encima, el modelo debajo.
  function diffHTML(r, issueNums) {
    const A = r.user, P = r.formParsed;
    const mark = (list2, idx) => (list2[0].includes(idx) ? 'ˈ' : list2[1].includes(idx) ? 'ˌ' : '');
    const cols = r.ops.map((o, i) => {
      const you = o.op === 'missing' ? '' : o.a;
      const rp = o.op === 'extra' ? '' : o.t;
      const ym = o.op === 'missing' ? '' : mark([A.primary, A.secondary], o.ai);
      const rm = o.op === 'extra' ? '' : mark([P.primary, P.secondary], o.ti);
      const markCls = ym === rm ? '' : (ym === 'ˈ' || rm === 'ˈ') ? 'is-bad' : 'is-warn';
      const bad = o.op !== 'match';
      const num = issueNums.get(i);
      return { i, you, rp, ym, rm, markCls, bad, gap: o.op === 'missing', empty: o.op === 'extra', num };
    });
    // Cada columna: número de fallo, tu casilla y, debajo, la casilla RP. Las columnas saltan de línea como la respuesta.
    return cols.map(c =>
      `<span class="dcol" style="--i:${c.i}">` +
      `<span class="dnum">${c.num ? c.num.n : ''}</span>` +
      `<span class="dcell you ${c.bad ? (c.gap ? 'is-gap' : 'is-bad') : ''}">` +
        (c.ym ? `<span class="m ${c.markCls}${c.ym === 'ˈ' ? ' m-primary' : ''}">${c.ym}</span>` : '') + esc(c.you) + `</span>` +
      `<span class="dcell rp ${c.bad ? 'is-need' : ''} ${c.empty ? 'is-empty' : ''}">` +
        (c.rm ? `<span class="m ${c.markCls}${c.rm === 'ˈ' ? ' m-primary' : ''}">${c.rm}</span>` : '') + (c.empty ? '∅' : esc(c.rp)) + `</span>` +
      `</span>`).join('');
  }

  function renderFeedback(r, entry) {
    const fb = $('feedback');
    const parts = [];
    const segIssues = r.issues.filter(i => i.type !== 'typical');

    if (r.correct && !r.warnings.length) parts.push(verdictHTML('ok', 'Apto: transcripción correcta', true));
    else if (r.correct) parts.push(verdictHTML('warn', 'Apto, con una observación', true));
    else if (r.typical) parts.push(verdictHTML('bad', 'Error típico con esta palabra', true));
    else parts.push(verdictHTML('bad', 'Revisar: la transcripción tiene fallos', true));

    parts.push(modelHTML(entry, r.correct ? r.form : null, 1));

    // Numeración de fallos y su columna en la comparación.
    const issueNums = new Map();
    const numbered = [];
    let n = 0;
    const colFor = it => {
      if (it.type === 'missing') return r.ops.findIndex(o => o.op === 'missing' && o.ti === it.ti);
      if (it.type === 'extra' || it.type === 'r-rp' || it.type === 'silent') return r.ops.findIndex(o => o.op === 'extra' && o.ai === it.ai);
      if ('ai' in it && 'ti' in it) return r.ops.findIndex(o => o.op === 'sub' && o.ai === it.ai);
      if (it.type.startsWith('stress')) {
        const ti = r.formParsed.primary[0];
        return r.ops.findIndex(o => (o.op === 'match' || o.op === 'sub') && o.ti === ti);
      }
      return -1;
    };
    for (const it of segIssues) {
      n++;
      const col = colFor(it);
      if (col >= 0 && !issueNums.has(col)) issueNums.set(col, { n });
      numbered.push({ n, it, warn: false });
    }
    for (const w of r.warnings) {
      n++;
      numbered.push({ n, it: w, warn: true });
    }

    if (!r.correct && r.user.phonemes.length) {
      $('answer-tokens').innerHTML = diffHTML(r, issueNums);
      $('answer').classList.add('is-diff');
      $('answer-hint').textContent = 'Arriba, tu transcripción; debajo, la RP. Los números remiten a las explicaciones.';
      $('answer-hint').hidden = false;
    }

    if (numbered.length) {
      const items = numbered.map(({ n: k, it, warn }) =>
        `<li class="issue ${warn ? 'warn' : ''}"><span class="issue-n">${k}</span><span>${richMsg(it.msg)}</span></li>`).join('');
      const collapse = r.typical && numbered.length > 2;
      parts.push(`<div style="--d:3;display:grid;gap:10px">` +
        (collapse ? `<button type="button" class="issues-toggle" data-act="toggle-issues">Ver los ${numbered.length} fallos uno a uno</button>` : '') +
        `<ol class="issues" ${collapse ? 'hidden' : ''}>${items}</ol></div>`);
    }

    parts.push(noteHTML(entry, 4));
    fb.innerHTML = parts.join('');
    fb.hidden = false;
  }

  // ---------- Modo papel ----------
  function reveal() {
    const entry = state.batch[state.idx];
    state.phase = 'paper-review';
    $('stage').classList.add('is-review');
    const fb = $('feedback');
    fb.innerHTML = verdictHTML('neutral', 'Compárala con tu papel') + modelHTML(entry, null, 1) + noteHTML(entry, 2) +
      `<button type="button" class="fix-link" style="--d:3" data-act="fix">Corregir la mía fonema a fonema</button>`;
    const kb = $('keyboard');
    kb.classList.remove('is-collapsed');
    highlightKeyboard(null, entry.ipa);
    kb.querySelector('.paper-actions').innerHTML =
      `<button type="button" class="btn-secondary" data-act="self-bad">Fallé</button>` +
      `<button type="button" class="btn-primary" data-act="self-ok">Acerté</button>`;
  }

  function selfAssess(ok) {
    const entry = state.batch[state.idx];
    state.results[state.idx] = { entry, correct: ok, warn: false, typical: false, self: true };
    progress.record(entry, ok);
    updateProgress();
    next();
  }

  // Pasar del papel a la tabla para esta palabra.
  function fixWithKeyboard() {
    state.phase = 'input';
    const kb = $('keyboard');
    kb.classList.remove('is-paper', 'is-collapsed', 'is-review');
    kb.querySelectorAll('.key').forEach(k => k.classList.remove('in-word', 'missed'));
    kb.querySelector('.paper-actions')?.remove();
    $('check-btn').hidden = false;
    setPrimaryLabel('Comprobar', false);
    $('feedback').hidden = true; $('feedback').innerHTML = '';
    $('stage').classList.remove('is-review');
    hideStamp();
    $('answer-block').hidden = false; $('answer').classList.remove('is-locked', 'is-diff');
    $('answer-hint').hidden = false;
    $('answer-hint').textContent = 'Copia aquí lo que escribiste en el papel.';
    state.input = []; renderAnswer();
  }

  // Acciones delegadas en el feedback y la barra de papel.
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act]');
    if (!b) return;
    const act = b.dataset.act;
    if (act === 'reveal') reveal();
    else if (act === 'self-ok') selfAssess(true);
    else if (act === 'self-bad') selfAssess(false);
    else if (act === 'fix') fixWithKeyboard();
    else if (act === 'toggle-issues') { b.nextElementSibling.hidden = false; b.remove(); }
  });

  // ---------- Resumen ----------
  function showSummary() {
    const res = state.results.filter(Boolean);
    const ok = res.filter(r => r.correct).length;
    const misses = res.filter(r => !r.correct);
    $('summary-ok').textContent = ok;
    $('summary-total').textContent = res.length;
    $('summary-sr').textContent = `${ok} de ${res.length} correctas.`;
    const scoreStamp = document.querySelector('.stamp-score');
    scoreStamp.classList.remove('is-in'); void scoreStamp.offsetWidth; scoreStamp.classList.add('is-in');
    const ratio = res.length ? ok / res.length : 0;
    $('summary-line').textContent =
      ratio === 1 ? 'Ninguna en rojo. Prueba un nivel más alto.' :
      ratio >= 0.7 ? 'Buen ritmo. Repasa las que fallaste mientras están frescas.' :
      'Repite los fallos ahora: la segunda pasada es la que fija el patrón.';

    const count = {};
    misses.forEach(r => r.entry.patterns.forEach(p => { count[p] = (count[p] || 0) + 1; }));
    const top = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 3);
    $('summary-patterns').innerHTML = top.length
      ? top.map(([p, c]) => `<span>${esc(PATTERN_LABEL[p] || p)} · ${c}</span>`).join('') : '';

    $('summary-misses').innerHTML = misses.map((r, i) =>
      `<li style="--i:${i}"><span class="w" lang="en">${esc(r.entry.word)}</span><span class="ipa">/${ipaHTML(r.entry.ipa)}/</span></li>`).join('');
    $('retry-btn').hidden = !misses.length;
    $('again-btn').className = misses.length ? 'btn-secondary' : 'btn-primary';
    go('summary');
  }

  // ---------- Expediente ----------
  const pct = (c, a) => (a ? Math.round((c / a) * 100) : 0);
  const ticks = p => {
    const on = Math.round(p / 10);
    return `<span class="st-ticks" aria-hidden="true">${Array.from({ length: 10 }, (_, i) => `<i class="${i < on ? 'on' : ''}"></i>`).join('')}</span>`;
  };
  let hardWords = [];

  function renderStats() {
    const rec = progress.load().words;
    const all = state.data.words;
    let a = 0, c = 0, practiced = 0;
    for (const w of all) { const r = rec[w.word]; if (r) { a += r.a; c += r.c; practiced++; } }
    $('stats-empty').hidden = a > 0;
    $('stats-body').hidden = a === 0;
    if (!a) return;

    $('st-words').textContent = `${practiced}/${all.length}`;
    $('st-attempts').textContent = a;
    $('st-rate').textContent = `${pct(c, a)} %`;

    // Por patrón: más débil primero; los que no tienen intentos, al final.
    const rows = Object.keys(state.data.patterns).map(k => {
      let pa = 0, pc = 0;
      for (const w of all) if (w.patterns.includes(k) && rec[w.word]) { pa += rec[w.word].a; pc += rec[w.word].c; }
      return { k, pa, pc, p: pct(pc, pa) };
    }).sort((x, y) => (y.pa > 0) - (x.pa > 0) || x.p - y.p);
    $('stats-patterns').innerHTML = rows.map(r =>
      `<li class="${r.pa ? '' : 'is-none'} ${r.pa && r.p < 50 ? 'is-low' : ''}">` +
      `<span class="st-name">${esc(PATTERN_LABEL[r.k] || r.k).replace(/\/[^\/]+\//g, m => `<span class="ipa">${m}</span>`)}</span>` +
      (r.pa ? `${ticks(r.p)}<span class="st-pct">${r.p} %</span><span class="st-n">${r.pc}/${r.pa}</span>`
            : `<span class="st-none">Sin intentos</span>`) +
      `</li>`).join('');

    // Las que más fallas: más fallos absolutos, luego peor proporción.
    hardWords = all.filter(w => rec[w.word] && rec[w.word].a > rec[w.word].c)
      .sort((x, y) => {
        const rx = rec[x.word], ry = rec[y.word];
        return (ry.a - ry.c) - (rx.a - rx.c) || (rx.c / rx.a) - (ry.c / ry.a);
      }).slice(0, 8);
    $('stats-hard-sec').hidden = !hardWords.length;
    $('stats-hard').innerHTML = hardWords.map((w, i) => {
      const r = rec[w.word];
      return `<li style="--i:${i}"><span class="w" lang="en">${esc(w.word)}</span>` +
        `<span class="st-hard-r"><span class="ipa">/${ipaHTML(w.ipa)}/</span><span class="st-n">${r.a - r.c} de ${r.a} mal</span></span></li>`;
    }).join('');
    $('stats-practice-label').textContent = `Practicar estas ${hardWords.length}`;
  }

  $('stats-btn').addEventListener('click', () => go('stats'));
  $('stats-back').addEventListener('click', () => go('home'));
  $('stats-start').addEventListener('click', () => go('home'));
  $('stats-practice').addEventListener('click', () => { if (hardWords.length) startBatch(shuffle(hardWords)); });
  $('stats-reset').addEventListener('click', () => {
    if (window.confirm('¿Borrar todo tu expediente? Se perderán tus intentos y aciertos, y no se puede deshacer.')) {
      progress.clear(); renderStats();
    }
  });

  $('retry-btn').addEventListener('click', () => {
    const misses = state.results.filter(r => r && !r.correct).map(r => r.entry);
    if (misses.length) startBatch(shuffle(misses));
  });
  $('again-btn').addEventListener('click', () => {
    const pool = filteredWords();
    startBatch(shuffle(pool).slice(0, Number(state.settings.size)));
  });
  $('home-btn').addEventListener('click', () => go('home'));
  $('quit-btn').addEventListener('click', () => { speech.ok && speechSynthesis.cancel(); go('home'); });
  $('audio-btn').addEventListener('click', () => speech.say(state.batch[state.idx].word));
  window.addEventListener('resize', () => { if (document.body.dataset.view === 'drill') fitWord(); });

  // ---------- Arranque ----------
  async function init() {
    try {
      const res = await fetch('words.json');
      state.data = await res.json();
    } catch (e) {
      document.querySelector('.home-sub').textContent = 'No se pudieron cargar las palabras. Recarga la página.';
      return;
    }
    buildHome();
    buildKeyboard();
    if (speech.ok) { speech.pick(); speechSynthesis.addEventListener?.('voiceschanged', () => speech.pick()); }
    go('home');
  }
  init();

  // PWA: funciona sin conexión una vez cargada.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { /* sin SW: la app sigue funcionando en línea */ }));
  }
})();
