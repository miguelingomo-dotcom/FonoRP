# FonoRP — App para practicar transcripción fonémica en RP

## Qué es
Web app (PWA) para que opositores y estudiantes de inglés hispanohablantes practiquen la transcripción fonémica en RP (Received Pronunciation). El usuario ve una palabra, la transcribe pulsando en una tabla de fonemas y recibe corrección detallada: qué fonema ha fallado y por qué.

Público: opositores de Secundaria Inglés, estudiantes de Estudios Ingleses y del Máster de Profesorado. Interfaz en español; contenido fonético en inglés.

## Restricciones
- Coste cero: GitHub Pages para el hosting. Sin servicios de pago.
- Stack: HTML + CSS + JavaScript vanilla, sin framework ni build step. Un `index.html`, `app.js`, `styles.css`, `words.json`.
- Mobile-first (se usará sobre todo en iPhone). Diseño limpio estilo iOS. Modo claro y oscuro.
- PWA instalable (manifest + service worker) que funcione offline.
- v1 sin cuentas: el progreso se guarda en `localStorage` (con try/catch). Firebase (plan gratuito) queda para una v2 con cuentas y sincronización.

## Datos: `words.json`
Ya existe, con 123 palabras. Cada entrada:
```json
{"word": "economic", "ipa": "ˌiː.kəˈnɒm.ɪk", "variants": ["ˌek.əˈnɒm.ɪk"],
 "patterns": ["acento", "schwa"], "level": 2, "note": "...", "error": "eˈkɒ.nɒ.mɪk"}
```
- `ipa`: forma principal, con `ˈ` `ˌ` y `.` de sílaba.
- `variants`: otras formas aceptadas como correctas.
- `patterns`: claves del objeto `patterns` (schwa, acento, grafia, mudas, o_ʌ, ch_k, fricativas, r_rp, terminaciones).
- `level`: 1–3. `note`: explicación en español. `error` (opcional): error típico.

## Teclado fonémico
La transcripción se introduce pulsando botones, no con el teclado del sistema. Organizado como la tabla RP de 44 fonemas:
- Monoptongos (12): iː ɪ ʊ uː e ə ɜː ɔː æ ʌ ɑː ɒ
- Diptongos (8): ɪə eɪ ʊə ɔɪ əʊ eə aɪ aʊ
- Consonantes (24): p b t d tʃ dʒ k ɡ f v θ ð s z ʃ ʒ m n ŋ h l r w j
- Extra: i (happy), u (débil), l̩ (l silábica), ˈ, ˌ, `.`, borrar, limpiar.

Cada botón muestra el símbolo y una palabra de ejemplo pequeña debajo (see, sit, book…). Botones de al menos 44 px de alto.

## Corrección (lo más importante)
1. **Tokenizar** respuesta y soluciones en fonemas. Los símbolos multicarácter (iː, tʃ, dʒ, eɪ, aɪ, əʊ, l̩…) cuentan como un solo token; buscar siempre la coincidencia más larga primero.
2. **Normalizar**: `g`→`ɡ`, `'`→`ˈ`, `:`→`ː`, quitar `/` y espacios.
3. **Comparar** contra `ipa` y cada `variant`, ignorando los puntos de sílaba. Si coincide con alguna (fonemas + marcas de acento), es correcta.
4. Si no coincide, elegir la forma más cercana (distancia de edición sobre tokens) y alinear token a token para marcar:
   - fonema sustituido (ej. escribió /ɒ/ donde va /ʌ/)
   - fonema que sobra o que falta
   - acento en sílaba equivocada o ausente
5. **Explicar el fallo** con reglas en español según el tipo de error:
   - vocal fuerte en lugar de /ə/ o /ɪ/ en sílaba átona → "en sílaba átona la vocal se reduce a schwa"
   - /r/ ante consonante o al final → "en RP la r solo suena delante de vocal"
   - acento mal colocado → mostrar dónde va y la `note` de la palabra
   - /ʃ/↔/ʒ/, /θ/↔/ð/, /s/↔/z/ → explicar sorda/sonora
   - coincidencia con `error` → "este es el error típico" + `note`
6. La división silábica no puntúa: se muestra la del modelo como referencia.

### Decisiones tomadas (2026-10-20)
- **Acento primario `ˈ` obligatorio siempre, también en monosílabos.** Todos los monosílabos de `words.json` llevan `ˈ`.
- **Acento secundario `ˌ`**: si es lo único que falla, la respuesta es correcta pero con un aviso (`warnings`).
- El acento se evalúa por la **vocal** que sigue a la marca, no por la posición exacta de `ˈ` en el ataque (`kəmˈpjuː` = `kəˈmpjuː`), coherente con que la silabificación no puntúa.
- **Audio**: botón para oír la palabra con `speechSynthesis` en `en-GB` (gratis, offline en iPhone). Avisar en la interfaz de que la voz es aproximada y la transcripción manda.
- La lógica de corrección vive en `fono.js` (sin DOM), que usan `app.js`, `tests.html` y `node tests.js`.
- **Modo "En papel"** (además de "En la app"): el alumno transcribe a mano, pulsa "Ver solución", ve modelo + variantes + nota + tabla resaltada y se autoevalúa (Acerté / Fallé). Opción "Corregir la mía fonema a fonema" para copiar su respuesta con la tabla y obtener el diagnóstico.

### Marca e identidad (2026-10-20)
- Marca independiente de EkkoEnglish, de uso personal (Miguel y amigos). Nombre: **FonoRP**.
- Mundo visual: **«Acta del tribunal»**, la papelería de las oposiciones (contrato en `.impeccable/surfaces/index-html.md`; producto en `PRODUCT.md`). Cada palabra es un ejercicio del examen y cada corrección, el sello del tribunal.
- Logo: sello de tampón con `/ˈ/` (barras de transcripción + acento). Archivos en `marca/`, iconos de la PWA en `icons/`, `favicon.svg`. El logo se usa siempre desde esos SVG, nunca se redibuja.
- Color: papel de oficio (#eef1f5), tinta (#14171c), **violeta de tampón (#4a3aa6) = marca y sello APTO**, **rojo de corrector (#bf2f1b) = error y sello REVISAR**. Sin verde. Tokens en `:root` de `styles.css`, con versión oscura.
- Tipografía autoalojada en `fonts/` (OFL): Archivo (variable, condensada para titulares y etiquetas de campo) y Noto Sans recortada a IPA para los símbolos.
- Formas: casillas y campos 3px, controles 4px, sello 6px; filetes de tinta de 1.5px. Nada en píldora.
- Tabla fonémica = tabla de Underhill sobre una bandeja de tinta con zonas de color plano (vocales, diptongos, consonantes, extras discontinuas). En la corrección resalta los sonidos de la palabra (violeta) y los fallados (rojo).
- Iconos: Phosphor (regular), SVG oficiales incrustados en `index.html`. No dibujar iconos a mano.
- Movimiento de firma: el sello que cae al comprobar. Escribir apenas se anima. `prefers-reduced-motion` conserva los fundidos y quita los desplazamientos.

Mostrar la solución en grande, la respuesta del usuario con los fallos coloreados, la tabla de fonemas con los sonidos de la palabra resaltados y la `note`.

## Modos
- **Práctica por patrón**: elige un patrón (o todos) y nivel; tandas de 5 o 10 palabras.
- **Resumen de tanda**: aciertos, patrones donde más falla, botón para repetir los fallos.

## Progreso (localStorage)
Hecho. Clave `fonorp.progress` = `{ v: 1, words: { palabra: { a: intentos, c: aciertos, last: 'AAAA-MM-DD' } } }`. Cuentan las respuestas del modo app (al comprobar) y las autoevaluaciones del modo papel. Pantalla **Expediente** (botón en el inicio): palabras practicadas, intentos y % de acierto; acierto por patrón (más débil primero, con 10 casillas, en rojo por debajo del 50 %); las 8 que más fallas con "Practicar estas"; "Borrar expediente" con confirmación. Sin repetición espaciada Leitner (descartada).

## Orden de trabajo sugerido
1. Tokenizador + normalizador + comparador con tests (una página `tests.html` con casos de `words.json`: la forma principal y todas las variantes deben dar correcto; casos de error conocidos deben detectar el fallo exacto).
2. Teclado fonémico y pantalla de ejercicio.
3. Feedback detallado.
4. Progreso y estadísticas (sin Leitner). Hecho.
5. PWA y despliegue en GitHub Pages. Hecho.

## Publicación (PWA + GitHub Pages)
- Repo público `miguelingomo-dotcom/FonoRP`, servido por GitHub Pages desde la rama `main` (raíz). URL: https://miguelingomo-dotcom.github.io/FonoRP/
- `sw.js` precarga la app (caché primero y refresco en segundo plano). **Al publicar cambios, sube `VERSION` en `sw.js`** (fonorp-v1 → v2…) y añade a `SHELL` cualquier archivo nuevo que necesite la app sin conexión.
- Rutas siempre relativas (la app vive en `/FonoRP/`).

## Pendiente
Revisar todas las transcripciones de `words.json` contra el Cambridge English Pronouncing Dictionary o el Longman Pronunciation Dictionary. Se publicó sin esta revisión por decisión de Miguel (uso personal y amigos).
