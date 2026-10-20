/* FonoRP — núcleo de corrección: normalizar, tokenizar, comparar y explicar.
   Sin DOM: lo usan app.js, tests.html y Node (tests.js). */
(function (root) {
  'use strict';

  // ---------- Inventario ----------
  const TABLE = {
    monophthongs: [
      ['iː', 'see'], ['ɪ', 'sit'], ['ʊ', 'book'], ['uː', 'too'],
      ['e', 'bed'], ['ə', 'about'], ['ɜː', 'bird'], ['ɔː', 'saw'],
      ['æ', 'cat'], ['ʌ', 'cup'], ['ɑː', 'car'], ['ɒ', 'hot'],
    ],
    diphthongs: [
      ['ɪə', 'near'], ['eɪ', 'day'], ['ʊə', 'tour'], ['ɔɪ', 'boy'],
      ['əʊ', 'go'], ['eə', 'hair'], ['aɪ', 'my'], ['aʊ', 'now'],
    ],
    consonants: [
      ['p', 'pen'], ['b', 'bad'], ['t', 'tea'], ['d', 'did'],
      ['tʃ', 'chain'], ['dʒ', 'jam'], ['k', 'cat'], ['ɡ', 'get'],
      ['f', 'fall'], ['v', 'van'], ['θ', 'thin'], ['ð', 'this'],
      ['s', 'see'], ['z', 'zoo'], ['ʃ', 'she'], ['ʒ', 'vision'],
      ['m', 'man'], ['n', 'no'], ['ŋ', 'sing'], ['h', 'hat'],
      ['l', 'leg'], ['r', 'red'], ['w', 'wet'], ['j', 'yes'],
    ],
    extra: [['i', 'happy'], ['u', 'into'], ['l̩', 'bottle']],
  };

  const EXAMPLE = {};
  const VOWELS = new Set();
  const CONSONANTS = new Set();
  for (const group of Object.keys(TABLE)) {
    for (const [sym, ex] of TABLE[group]) {
      EXAMPLE[sym] = ex;
      if (group === 'consonants') CONSONANTS.add(sym); else VOWELS.add(sym);
    }
  }
  const PRIMARY = 'ˈ', SECONDARY = 'ˌ', DOT = '.';
  // Coincidencia más larga primero.
  const SYMBOLS = [...VOWELS, ...CONSONANTS, PRIMARY, SECONDARY, DOT]
    .sort((a, b) => b.length - a.length);

  const WEAK = new Set(['ə', 'ɪ', 'i', 'u', 'ʊ', 'l̩']);
  const VOICING = [['p', 'b'], ['t', 'd'], ['k', 'ɡ'], ['f', 'v'], ['θ', 'ð'],
    ['s', 'z'], ['ʃ', 'ʒ'], ['tʃ', 'dʒ']];
  const VOICE_PAIR = {};
  for (const [vl, vd] of VOICING) { VOICE_PAIR[vl] = vd; VOICE_PAIR[vd] = vl; }
  const VOICED = new Set(VOICING.map(p => p[1]));

  // ---------- Normalizar y tokenizar ----------
  function normalize(str) {
    return String(str == null ? '' : str)
      .normalize('NFC')
      .replace(/[\/\[\]\s]/g, '')
      .replace(/g/g, 'ɡ')
      .replace(/['’ʼ]/g, PRIMARY)
      .replace(/,/g, SECONDARY)
      .replace(/:/g, 'ː')
      .replace(/ʧ/g, 'tʃ')
      .replace(/ʤ/g, 'dʒ');
  }

  function kindOf(sym) {
    if (sym === PRIMARY) return 'primary';
    if (sym === SECONDARY) return 'secondary';
    if (sym === DOT) return 'dot';
    if (VOWELS.has(sym)) return 'vowel';
    if (CONSONANTS.has(sym)) return 'consonant';
    return 'unknown';
  }

  function tokenize(str) {
    const s = normalize(str);
    const out = [];
    let i = 0;
    while (i < s.length) {
      const sym = SYMBOLS.find(x => s.startsWith(x, i));
      if (sym) { out.push({ t: sym, kind: kindOf(sym) }); i += sym.length; }
      else {
        // Un carácter desconocido (con sus diacríticos combinantes).
        let j = i + 1;
        while (j < s.length && /\p{M}/u.test(s[j])) j++;
        out.push({ t: s.slice(i, j), kind: 'unknown' });
        i = j;
      }
    }
    return out;
  }

  /* parse: separa fonemas de marcas.
     - phonemes: lista de símbolos (sin ˈ ˌ .)
     - primary / secondary: índices (en phonemes) de la vocal que lleva el acento.
       Una marca se asigna a la siguiente vocal; si no hay ninguna, índice -1.
     - syllables: para cada fonema, número de sílaba según . ˈ ˌ */
  function parse(str) {
    const tokens = tokenize(str);
    const phonemes = [], primary = [], secondary = [], syllableOf = [], unknown = [];
    let pending = [], syl = 0, sawPhoneme = false;
    for (const tok of tokens) {
      if (tok.kind === 'dot' || tok.kind === 'primary' || tok.kind === 'secondary') {
        if (sawPhoneme) { syl++; sawPhoneme = false; }
        if (tok.kind !== 'dot') pending.push(tok.kind);
        continue;
      }
      tok.pIdx = phonemes.length;
      phonemes.push(tok.t);
      syllableOf.push(syl);
      sawPhoneme = true;
      if (tok.kind === 'unknown') unknown.push(tok.t);
      if (tok.kind === 'vowel' && pending.length) {
        for (const m of pending) (m === 'primary' ? primary : secondary).push(tok.pIdx);
        pending = [];
      }
    }
    for (const m of pending) (m === 'primary' ? primary : secondary).push(-1);
    return { raw: str, tokens, phonemes, primary, secondary, syllableOf, unknown };
  }

  const isVowel = s => VOWELS.has(s);
  const vowelOrdinal = (p, idx) => p.phonemes.slice(0, idx + 1).filter(isVowel).length;

  // Texto de la sílaba (según la forma modelo) que contiene el fonema idx.
  function syllableText(p, idx) {
    const s = p.syllableOf[idx];
    return p.phonemes.filter((_, i) => p.syllableOf[i] === s).join('');
  }

  // ---------- Alineación ----------
  function subCost(a, b) {
    if (a === b) return 0;
    const sameClass = isVowel(a) === isVowel(b);
    return sameClass ? 1 : 1.6; // < 2 (borrar + insertar), pero penaliza mezclar vocal/consonante
  }

  /* Devuelve { cost, ops } con ops en orden:
     match / sub (a: usuario, t: modelo) / extra (sobra en el usuario) / missing (falta). */
  function align(user, target) {
    const n = user.length, m = target.length;
    const D = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = 1; i <= n; i++) D[i][0] = i;
    for (let j = 1; j <= m; j++) D[0][j] = j;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        D[i][j] = Math.min(
          D[i - 1][j - 1] + subCost(user[i - 1], target[j - 1]),
          D[i - 1][j] + 1,
          D[i][j - 1] + 1,
        );
      }
    }
    const ops = [];
    let i = n, j = m;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + subCost(user[i - 1], target[j - 1])) {
        ops.push({ op: user[i - 1] === target[j - 1] ? 'match' : 'sub', a: user[i - 1], ai: i - 1, t: target[j - 1], ti: j - 1 });
        i--; j--;
      } else if (i > 0 && D[i][j] === D[i - 1][j] + 1) {
        ops.push({ op: 'extra', a: user[i - 1], ai: i - 1, ti: j });
        i--;
      } else {
        ops.push({ op: 'missing', t: target[j - 1], ti: j - 1, ai: i });
        j--;
      }
    }
    ops.reverse();
    return { cost: D[n][m], ops };
  }

  function mapIndex(ops, ai) {
    const o = ops.find(x => (x.op === 'match' || x.op === 'sub') && x.ai === ai);
    return o ? o.ti : -1;
  }

  const sameSet = (a, b) => a.length === b.length && [...a].sort().join() === [...b].sort().join();

  // ---------- Comparación ----------
  function compareForm(A, P) {
    const { cost, ops } = align(A.phonemes, P.phonemes);
    const mappedPrimary = A.primary.map(i => (i < 0 ? -1 : mapIndex(ops, i)));
    const mappedSecondary = A.secondary.map(i => (i < 0 ? -1 : mapIndex(ops, i)));
    const primaryOK = sameSet(mappedPrimary, P.primary);
    const secondaryOK = sameSet(mappedSecondary, P.secondary);
    return { P, cost, ops, primaryOK, secondaryOK, mappedPrimary, mappedSecondary };
  }

  function check(answer, entry) {
    const A = parse(answer);
    const forms = [{ kind: 'ipa', s: entry.ipa }]
      .concat((entry.variants || []).map(s => ({ kind: 'variant', s })));

    const results = forms.map(f => Object.assign(compareForm(A, parse(f.s)), { form: f }));
    // Exacta: mismos fonemas y mismo acento principal. Preferir la que también acierta ˌ.
    const exact = results.filter(r => r.cost === 0 && r.primaryOK)
      .sort((a, b) => Number(b.secondaryOK) - Number(a.secondaryOK))[0];
    const best = exact || results.slice().sort((a, b) =>
      (a.cost + (a.primaryOK ? 0 : 0.5)) - (b.cost + (b.primaryOK ? 0 : 0.5)))[0];

    let typical = false;
    if (entry.error && !exact && A.phonemes.length) {
      const e = compareForm(A, parse(entry.error));
      typical = e.cost === 0 && e.primaryOK;
    }

    const issues = [], warnings = [];
    if (!A.phonemes.length) {
      issues.push({ type: 'empty', msg: 'Escribe la transcripción con el teclado fonémico.' });
    } else {
      if (A.unknown.length) {
        issues.push({ type: 'unknown', symbols: A.unknown,
          msg: `No reconozco ${A.unknown.map(s => '«' + s + '»').join(', ')} como fonema de RP.` });
      }
      if (typical) {
        issues.push({ type: 'typical', msg: 'Este es el error típico con esta palabra.' });
      }
      explainSegments(A, best, entry, issues);
      explainStress(A, best, issues, warnings);
    }

    return {
      correct: !!exact,
      typical,
      form: best.form,           // forma modelo usada para comparar / mostrar
      formParsed: best.P,
      user: A,
      ops: best.ops,
      issues,
      warnings,
      note: entry.note || '',
    };
  }

  // ---------- Explicaciones ----------
  const ex = s => (EXAMPLE[s] ? ` (como en «${EXAMPLE[s]}»)` : '');

  function explainSegments(A, R, entry, issues) {
    const P = R.P;
    const stressed = new Set([...P.primary, ...P.secondary]);
    const word = String(entry.word || '').toLowerCase();
    const patterns = entry.patterns || [];

    // Fonema siguiente (en la respuesta del usuario) tras la posición ai.
    const nextUser = ai => A.phonemes[ai + 1];

    for (const o of R.ops) {
      if (o.op === 'match') continue;

      if (o.op === 'sub') {
        const base = { type: 'sub', ai: o.ai, ti: o.ti, wrote: o.a, expected: o.t };
        const lastIdx = P.phonemes.length - 1;
        if (isVowel(o.t) && isVowel(o.a) && WEAK.has(o.t) && !stressed.has(o.ti) && !WEAK.has(o.a)) {
          issues.push(Object.assign(base, { type: 'weak-vowel',
            msg: `En sílaba átona la vocal se reduce: aquí va /${o.t}/, no /${o.a}/.` }));
        } else if (VOICE_PAIR[o.a] === o.t) {
          let msg = `/${o.t}/ es ${VOICED.has(o.t) ? 'sonora' : 'sorda'} y /${o.a}/ es ${VOICED.has(o.a) ? 'sonora' : 'sorda'}: ` +
            `cambia solo la vibración de las cuerdas vocales. Aquí va /${o.t}/.`;
          if (o.ti === lastIdx && patterns.includes('terminaciones')) {
            if (/ed$/.test(word)) msg += VOICED.has(o.t) || o.t === 'd'
              ? ' La terminación -ed tras un sonido sonoro se pronuncia /d/.'
              : ' La terminación -ed tras un sonido sordo se pronuncia /t/.';
            else if (/s$/.test(word)) msg += o.t === 'z'
              ? ' La -s tras un sonido sonoro se pronuncia /z/.'
              : ' La -s tras un sonido sordo se pronuncia /s/.';
          }
          issues.push(Object.assign(base, { type: 'voicing', msg }));
        } else if (o.t === 'k' && o.a === 'tʃ' && word.includes('ch')) {
          issues.push(Object.assign(base, { type: 'ch-k',
            msg: 'Aquí la grafía ch suena /k/, no /tʃ/ (palabras de origen griego).' }));
        } else if (o.t === 'ʌ' && o.a === 'ɒ') {
          issues.push(Object.assign(base, { type: 'o-ʌ',
            msg: 'Aquí la letra o suena /ʌ/ (como en «cup»), no /ɒ/ (como en «hot»).' }));
        } else {
          issues.push(Object.assign(base, {
            msg: `Has escrito /${o.a}/${ex(o.a)} donde va /${o.t}/${ex(o.t)}.` }));
        }
        continue;
      }

      if (o.op === 'extra') {
        const base = { type: 'extra', ai: o.ai, wrote: o.a };
        const nxt = nextUser(o.ai);
        if (o.a === 'r' && (nxt === undefined || !isVowel(nxt))) {
          issues.push(Object.assign(base, { type: 'r-rp',
            msg: nxt === undefined
              ? 'En RP la r solo suena delante de vocal; a final de palabra no se pronuncia.'
              : `En RP la r solo suena delante de vocal; aquí va seguida de /${nxt}/, así que no se pronuncia.` }));
        } else if (!isVowel(o.a) && patterns.includes('mudas')) {
          issues.push(Object.assign(base, { type: 'silent',
            msg: `Sobra /${o.a}/: en esta palabra esa letra es muda.` }));
        } else {
          issues.push(Object.assign(base, { msg: `Sobra /${o.a}/.` }));
        }
        continue;
      }

      // missing
      issues.push({ type: 'missing', ti: o.ti, ai: o.ai, expected: o.t,
        msg: `Falta /${o.t}/${ex(o.t)}.` });
    }
  }

  function explainStress(A, R, issues, warnings) {
    const P = R.P;
    const target = P.primary.filter(i => i >= 0);
    const ordinal = i => `${vowelOrdinal(P, i)}ª sílaba`;
    const nVowels = P.phonemes.filter(isVowel).length;

    if (!R.primaryOK) {
      if (!A.primary.length) {
        const where = target.map(i => `/ˈ${syllableText(P, i)}/`).join(', ');
        issues.push({ type: 'stress-missing',
          msg: nVowels <= 1
            ? `Falta el acento principal ˈ: márcalo también en monosílabos (${where}).`
            : `Falta el acento principal ˈ: va en la ${target.map(ordinal).join(', ')}, ${where}.` });
      } else if (A.primary.includes(-1)) {
        issues.push({ type: 'stress-wrong',
          msg: 'La marca de acento ˈ va delante de la sílaba acentuada, y aquí no le sigue ninguna vocal.' });
      } else if (A.primary.length > target.length) {
        issues.push({ type: 'stress-multiple',
          msg: `Sobra un acento principal: solo lleva uno, en la ${target.map(ordinal).join(', ')} (/ˈ${target.map(i => syllableText(P, i)).join('')}/).` });
      } else {
        const userOrd = A.primary.map(i => vowelOrdinal(A, i));
        issues.push({ type: 'stress-wrong',
          msg: `El acento principal va en la ${target.map(ordinal).join(', ')} (/ˈ${target.map(i => syllableText(P, i)).join('')}/), ` +
            `no en la ${userOrd.map(n => n + 'ª').join(', ')}.` });
      }
    }

    if (!R.secondaryOK) {
      const sec = P.secondary.filter(i => i >= 0);
      const w = { type: 'secondary' };
      if (!A.secondary.length) w.msg = `Falta el acento secundario ˌ en /ˌ${sec.map(i => syllableText(P, i)).join('')}/.`;
      else if (!sec.length) w.msg = 'Esta palabra no lleva acento secundario ˌ.';
      else w.msg = `El acento secundario ˌ va en /ˌ${sec.map(i => syllableText(P, i)).join('')}/.`;
      // Con fallos de segmentos, el secundario es un detalle menor: siempre aviso.
      warnings.push(w);
    }
  }

  const Fono = { TABLE, EXAMPLE, VOWELS, CONSONANTS, normalize, tokenize, parse, align, check };
  if (typeof module !== 'undefined' && module.exports) module.exports = Fono;
  root.Fono = Fono;
})(typeof globalThis !== 'undefined' ? globalThis : this);
