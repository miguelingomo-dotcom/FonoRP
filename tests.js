/* Tests del núcleo de corrección. Navegador: tests.html. Terminal: node tests.js */
(function (root) {
  'use strict';

  function runTests(Fono, data) {
    const results = [];
    const t = (group, name, fn) => {
      try { const r = fn(); results.push({ group, name, ok: r === true, detail: r === true ? '' : String(r) }); }
      catch (e) { results.push({ group, name, ok: false, detail: e.stack || String(e) }); }
    };
    const words = data.words;
    const byWord = Object.fromEntries(words.map(w => [w.word, w]));
    const types = r => r.issues.map(i => i.type);
    const show = r => `correct=${r.correct} issues=${JSON.stringify(r.issues.map(i => i.type + ':' + i.msg))} warnings=${JSON.stringify(r.warnings.map(w => w.msg))}`;

    // --- Tokenizador / normalizador ---
    const toks = s => Fono.tokenize(s).map(x => x.t).join(' ');
    t('tokenizador', 'multicarácter como un solo token', () =>
      toks('tʃeɪndʒ') === 'tʃ eɪ n dʒ' || toks('tʃeɪndʒ'));
    t('tokenizador', 'coincidencia más larga primero (əʊ, ɪə, uː)', () =>
      toks('ɡəʊ.hɪə.tuː') === 'ɡ əʊ . h ɪə . t uː' || toks('ɡəʊ.hɪə.tuː'));
    t('tokenizador', 'l silábica es un token', () => toks('ˈbɒt.l̩') === 'ˈ b ɒ t . l̩' || toks('ˈbɒt.l̩'));
    t('normalizador', "g→ɡ, '→ˈ, :→ː, quita / y espacios", () =>
      Fono.normalize("/'dɒg i: /") === 'ˈdɒɡiː' || Fono.normalize("/'dɒg i: /"));
    t('normalizador', 'ligaduras ʧ ʤ', () => Fono.normalize('ʧʤ') === 'tʃdʒ');
    t('normalizador', 'entrada en ASCII se corrige igual', () =>
      Fono.check("'dOg", byWord.dogs).correct === false && Fono.check("'dɒgz", byWord.dogs).correct === true || 'falla');

    // --- Todas las formas de words.json dan correcto ---
    for (const w of words) {
      for (const f of [w.ipa, ...(w.variants || [])]) {
        t('words.json correctas', `${w.word} /${f}/`, () => {
          const r = Fono.check(f, w);
          return (r.correct && !r.warnings.length && !r.issues.length) || show(r);
        });
      }
      t('words.json correctas', `${w.word}: sin puntos de sílaba`, () => {
        const r = Fono.check(w.ipa.replace(/\./g, ''), w);
        return r.correct || show(r);
      });
      t('words.json correctas', `${w.word}: solo símbolos del teclado`, () => {
        const forms = [w.ipa, ...(w.variants || []), ...(w.error ? [w.error] : [])];
        const bad = forms.flatMap(f => Fono.parse(f).unknown);
        return !bad.length || `símbolos desconocidos: ${bad.join(' ')}`;
      });
      if (w.error) {
        t('errores típicos', `${w.word} /${w.error}/`, () => {
          const r = Fono.check(w.error, w);
          return (!r.correct && r.typical && types(r)[0] === 'typical') || show(r);
        });
      }
    }

    // --- Casos de error concretos ---
    const expect = (word, answer, check) => t('diagnóstico', `${word} → /${answer}/`, () => {
      const r = Fono.check(answer, byWord[word]);
      const res = check(r);
      return res === true ? true : `${res} | ${show(r)}`;
    });
    const has = (r, type, pred = () => true) => r.issues.some(i => i.type === type && pred(i));

    expect('doctor', 'ˈdɒk.tər', r => (!r.correct && has(r, 'r-rp')) || 'esperaba r-rp');
    expect('bird', 'ˈbɜːrd', r => (has(r, 'r-rp', i => /\/d\//.test(i.msg))) || 'esperaba r-rp ante /d/');
    expect('banana', 'bæˈnɑː.nə', r => has(r, 'weak-vowel', i => i.wrote === 'æ' && i.expected === 'ə') || 'esperaba weak-vowel æ→ə');
    expect('support', 'sʌˈpɔːt', r => has(r, 'weak-vowel') || 'esperaba weak-vowel');
    expect('police', 'ˈpəˌliːs', r => has(r, 'stress-wrong') || 'esperaba stress-wrong');
    expect('police', 'ˈpə.liːs', r => (has(r, 'stress-wrong', i => /2ª/.test(i.msg) && /1ª/.test(i.msg))) || 'esperaba 2ª vs 1ª');
    expect('police', 'pəliːs', r => has(r, 'stress-missing') || 'esperaba stress-missing');
    expect('car', 'kɑː', r => (!r.correct && has(r, 'stress-missing', i => /monosílabo/.test(i.msg))) || 'monosílabo sin ˈ');
    expect('car', 'ˈkɑː', r => r.correct || 'debería ser correcto');
    expect('police', 'ˈpəˈliːs', r => has(r, 'stress-multiple') || 'esperaba stress-multiple');
    expect('police', 'pəliːsˈ', r => has(r, 'stress-wrong') || 'marca sin vocal detrás');
    expect('dogs', 'ˈdɒɡs', r => has(r, 'voicing', i => /sonora/.test(i.msg) && /-s/.test(i.msg)) || 'esperaba voicing -s');
    expect('watched', 'ˈwɒtʃd', r => has(r, 'voicing', i => /-ed/.test(i.msg)) || 'esperaba voicing -ed');
    expect('pleasure', 'ˈpleʃ.ə', r => has(r, 'voicing', i => i.wrote === 'ʃ' && i.expected === 'ʒ') || 'esperaba ʃ→ʒ');
    expect('breathe', 'ˈbriːθ', r => has(r, 'voicing') || 'esperaba θ→ð');
    expect('chemistry', 'ˈtʃem.ɪ.stri', r => has(r, 'ch-k') || 'esperaba ch-k');
    expect('love', 'ˈlɒv', r => has(r, 'o-ʌ') || 'esperaba o-ʌ');
    expect('debt', 'ˈdebt', r => has(r, 'silent', i => i.wrote === 'b') || 'esperaba silent b');
    expect('about', 'əˈbaʊ', r => has(r, 'missing', i => i.expected === 't') || 'esperaba missing t');
    expect('cats', 'ˈkætz', r => has(r, 'voicing') || 'esperaba voicing');
    expect('school', 'ˈskul', r => (!r.correct && r.issues.length === 1 && r.issues[0].type === 'sub') || 'una sola sustitución');
    expect('economic', 'iː.kəˈnɒm.ɪk', r => (r.correct && r.warnings.length === 1 && /ˌ/.test(r.warnings[0].msg)) || 'correcta con aviso de ˌ');
    expect('economic', 'ˌiː.kəˈnɒm.ɪk', r => (r.correct && !r.warnings.length) || 'correcta sin avisos');
    expect('economic', 'ˌek.əˈnɒm.ɪk', r => (r.correct && r.form.kind === 'variant') || 'variante');
    expect('economic', 'ˈiː.kəˌnɒm.ɪk', r => (!r.correct && has(r, 'stress-wrong')) || 'primario mal colocado');
    expect('photographer', 'fətˈɒɡrəfə', r => r.correct || 'la posición de ˈ antes de la vocal no puntúa');
    expect('family', 'ˈfæmli', r => (r.correct && r.form.kind === 'variant') || 'variante sin puntos');
    expect('family', 'ˈfæmɪli', r => r.correct || 'variante');
    expect('comfortable', 'ˈkʌmf.tə.bl̩', r => r.correct || 'variante con l̩');
    expect('about', '', r => has(r, 'empty') || 'esperaba empty');
    expect('about', 'əˈbaʊtx', r => has(r, 'unknown') || 'esperaba unknown');

    return results;
  }

  root.runTests = runTests;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = runTests;
    if (require.main === module) {
      const path = require('path');
      const Fono = require(path.join(__dirname, 'fono.js'));
      const data = JSON.parse(require('fs').readFileSync(path.join(__dirname, 'words.json'), 'utf8'));
      const res = runTests(Fono, data);
      const fails = res.filter(r => !r.ok);
      for (const f of fails) console.log(`✗ [${f.group}] ${f.name}\n    ${f.detail}`);
      console.log(`\n${res.length - fails.length}/${res.length} OK`);
      process.exitCode = fails.length ? 1 : 0;
    }
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
