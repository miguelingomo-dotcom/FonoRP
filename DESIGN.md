---
name: FonoRP
description: Transcripción fonémica en RP corregida fonema a fonema, con la papelería de un tribunal de oposición.
colors:
  stamp: "#4a3aa6"
  stamp-hover: "#3c2e8c"
  stamp-ink: "#ffffff"
  pen: "#bf2f1b"
  warn: "#8a5808"
  bg: "#eef1f5"
  surface: "#fbfcfd"
  surface-2: "#dfe5ee"
  ink: "#14171c"
  muted: "#464d58"
  faint: "#59616d"
  rule: "#14171c"
  tray: "#14171c"
  z-vowel: "#d9e1ec"
  z-diph: "#cdc5f3"
  z-cons: "#f6f7f9"
  z-ink: "#14171c"
  z-ex: "#3f4752"
  z-extra-line: "#8a93a1"
  z-extra-ink: "#eef1f5"
  z-mark: "#272c35"
  z-mark-ink: "#c3b9f7"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "64px"
    fontWeight: 850
    lineHeight: 1
    letterSpacing: "-0.025em"
    fontVariation: "'wdth' 70"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "34px"
    fontWeight: 850
    lineHeight: 1.05
    letterSpacing: "-0.02em"
    fontVariation: "'wdth' 72"
  ipa-display:
    fontFamily: "IPA, Noto Sans, Lucida Sans Unicode, Arial Unicode MS, sans-serif"
    fontSize: "clamp(32px, 9.5vw, 44px)"
    fontWeight: 400
    lineHeight: 1.2
  ipa-casilla:
    fontFamily: "IPA, Noto Sans, Lucida Sans Unicode, Arial Unicode MS, sans-serif"
    fontSize: "clamp(22px, 6.6vw, 28px)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.45
    fontVariation: "'wdth' 88"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.45
    fontVariation: "'wdth' 96"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.01em"
    fontVariation: "'wdth' 80"
  stamp:
    fontFamily: "Archivo, ui-sans-serif, system-ui, -apple-system, sans-serif"
    fontSize: "18px"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.04em"
    fontVariation: "'wdth' 72"
rounded:
  mark: "2px"
  box: "3px"
  ctl: "4px"
  stamp: "6px"
spacing:
  key: "4px"
  xs: "6px"
  sm: "8px"
  md: "12px"
  gutter: "16px"
  section: "22px"
  block: "28px"
components:
  button-primary:
    backgroundColor: "{colors.stamp}"
    textColor: "{colors.stamp-ink}"
    typography: "{typography.title}"
    rounded: "{rounded.ctl}"
    padding: "0 20px"
    height: "52px"
  button-primary-hover:
    backgroundColor: "{colors.stamp-hover}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.ctl}"
    padding: "0 20px"
    height: "52px"
  button-secondary-hover:
    backgroundColor: "{colors.surface-2}"
  button-ghost:
    textColor: "{colors.muted}"
    typography: "{typography.title}"
    rounded: "{rounded.ctl}"
    height: "52px"
  icon-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.ctl}"
    size: "44px"
  field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    padding: "8px 12px 12px"
  casilla:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.ipa-casilla}"
    rounded: "{rounded.mark}"
    height: "48px"
    width: "34px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ctl}"
    padding: "0 12px 0 10px"
    height: "44px"
  segmented:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.muted}"
    rounded: "{rounded.ctl}"
    padding: "3px"
  segmented-selected:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.box}"
    height: "38px"
  stamp-apto:
    textColor: "{colors.stamp}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 9px 4px"
  stamp-revisar:
    textColor: "{colors.pen}"
    typography: "{typography.stamp}"
    rounded: "{rounded.stamp}"
    padding: "3px 9px 4px"
  key-vowel:
    backgroundColor: "{colors.z-vowel}"
    textColor: "{colors.z-ink}"
    rounded: "{rounded.box}"
    height: "48px"
  key-diphthong:
    backgroundColor: "{colors.z-diph}"
    textColor: "{colors.z-ink}"
    rounded: "{rounded.box}"
    height: "48px"
  key-consonant:
    backgroundColor: "{colors.z-cons}"
    textColor: "{colors.z-ink}"
    rounded: "{rounded.box}"
    height: "48px"
  key-mark:
    backgroundColor: "{colors.z-mark}"
    textColor: "{colors.z-mark-ink}"
    rounded: "{rounded.box}"
    height: "48px"
---

# Design System: FonoRP

## Overview

**Creative North Star: "Acta del tribunal"**

FonoRP es la papelería de una oposición de Secundaria: papel de oficio frío, filetes de tinta de 1.5px, campos con su etiqueta pequeña y casillas donde se escribe un fonema en cada una. Cada palabra es un ejercicio del examen y cada corrección es el sello del tribunal: el violeta de tampón aprueba (APTO) y el rojo del boli del corrector señala lo que hay que revisar (REVISAR), casilla por casilla, con un número que remite a la explicación.

La densidad es la de un impreso: todo en recuadros con nombre (Ejercicio, Nivel, Patrón, Palabra, Transcripción, Transcripción RP, Nota), sin tarjetas flotantes ni decoración. La tabla fonémica es la excepción material: una bandeja de tinta oscura bajo el formulario con la disposición de Underhill y zonas de color plano. El estado se comunica por forma además de por color (tachado, hueco discontinuo, peso del acento), para que el fallo se lea también en monocromo.

Rechazo confirmado: la tarjeta blanca de flashcard con avisos verdes y rojos. No hay verde en ningún sitio.

**Key Characteristics:**
- Filetes de tinta de 1.5px dibujados como `inset box-shadow`, no como sombras.
- Dos tintas de estado y nada más: violeta de tampón (bien, marca) y rojo de corrector (error); ámbar solo para el aviso del acento secundario.
- Archivo condensada para la palabra, las etiquetas de campo y el sello; Noto Sans recortada a IPA para todo símbolo fonético.
- Esquinas casi rectas en escala estricta; nada en píldora.
- Un único gesto con rebote: el sello que cae al comprobar.

## Colors

Papel de oficio azulado, tinta casi negra y dos tintas de oficina con significado fijo.

### Primary
- **Violeta de tampón** (`stamp`): la marca (sello del logo, barras `/ /` de transcripción, marcas de acento y sílaba en las casillas), el botón principal, el sello APTO, el veredicto correcto, el foco, el cursor y el resaltado de los sonidos de la palabra en la tabla. En oscuro sube a `#ab9ff2` con tinta `#17122f`. Hover: `stamp-hover`.

### Secondary
- **Rojo de corrector** (`pen`): errores y solo errores. Casilla fallada (borde, tinta y fondo `pen-soft` al 10%), su tachado, el número de error, el hueco discontinuo de un fonema que falta, el sello REVISAR, la casilla de progreso de una palabra fallada y la tecla fallada en la revisión. En oscuro `#ff7d61`.

### Tertiary
- **Ámbar de observación** (`warn`): exclusivamente el aviso del acento secundario `ˌ` (respuesta correcta con observación). En oscuro `#e8b04b`. No se usa para ningún otro estado.

### Neutral
- **Papel de oficio** (`bg`): fondo de la app. En oscuro `#111318`.
- **Impreso** (`surface`): interior de campos, casillas, chips y lista del acta.
- **Gris de carpeta** (`surface-2`): pista del control segmentado y fondo de hover/pulsación.
- **Tinta** (`ink`, `rule`): texto y filetes. En oscuro el filete se aclara a `#aeb7c4` para no quemar.
- **Lápiz** (`muted`) y **lápiz suave** (`faint`): texto secundario, etiquetas de campo, contadores, puntos de sílaba.
- **Filete suave** (`rgb(20 23 28 / .16)`): borde de chips sin marcar, de la nota y de la casilla vacía del cursor.
- **Bandeja** (`tray`) y **zonas**: vocales `z-vowel` (gris azulado), diptongos `z-diph` (lavanda), consonantes `z-cons` (papel), marcas y borrar `z-mark` con tinta violeta clara `z-mark-ink`; extras (i, u, l̩) sin relleno con filete discontinuo `z-extra-line`.

### Named Rules
**The Two Inks Rule.** Violeta = correcto y marca; rojo = error. Ningún otro color comunica acierto o fallo, y el verde no existe en este sistema. Una palabra acertada se marca en el progreso con tinta (`ink`), no con un tercer color.

**The Amber Exception Rule.** El ámbar solo aparece para la observación del acento secundario; si un estado nuevo lo necesita, primero hay que justificar por qué no es violeta ni rojo.

## Typography

**Display Font:** Archivo variable (con ui-sans-serif, system-ui), autoalojada, ejes `wght` 100–900 y `wdth` 62–125.
**Body Font:** Archivo a `wdth` 96.
**Label/Mono Font:** IPA = Noto Sans recortada a los rangos fonéticos (U+0250–02FF, ŋ, θ, diacríticos), con Noto Sans latina para el resto del renglón.

**Character:** Archivo condensada y muy pesada tiene la voz de un impreso oficial y de un sello de goma; Noto Sans da al IPA un dibujo neutro y completo, sin glifos de reserva.

### Hierarchy
- **Display** (850, 64px por defecto vía `--word-size`, que app.js reduce en palabras largas; 1; `wdth` 70): la palabra del ejercicio, dentro del campo Palabra. En revisión baja a 40px como máximo.
- **Headline** (850, 34px, 1.05, `wdth` 72): título del resumen, «Acta de la tanda».
- **IPA display** (400, clamp(32px, 9.5vw, 44px), 1.2): la transcripción modelo y el ejemplo de la portada (30–40px).
- **IPA casilla** (400, clamp(22px, 6.6vw, 28px)): un fonema por casilla en la respuesta; teclas de la tabla a 19px (21px en escritorio).
- **Title** (700, 17px, `wdth` 88): botones, veredicto, enlaces de acción (15px).
- **Body** (400, 16px, 1.45, `wdth` 96): explicaciones (15.5px), notas, subtítulo de portada (17px, máx. 34ch).
- **Label** (600, 12.5px, 1.2, 0.01em, `wdth` 80): etiquetas de campo en minúscula de frase, en `muted`; en la Nota pasa a violeta.
- **Sello** (900, 18px, 0.04em, `wdth` 72): APTO / REVISAR; el subtítulo «Tribunal FonoRP» (700, 11px, 0.08em, mayúsculas) solo existe dentro del sello. La puntuación del resumen usa el sello a 64px.

### Named Rules
**The Field Label Rule.** Toda información del formulario lleva su etiqueta de campo pequeña y condensada, en minúscula de frase. Las mayúsculas espaciadas son exclusivas del grabado del sello.

**The Stress Weight Rule.** El acento primario `ˈ` se distingue del secundario `ˌ` por peso (800), nunca duplicando el trazo: un trazo doble se lee como comilla recta.

**The IPA Face Rule.** Todo símbolo fonético, incluidas las barras `/ /` (300, violeta), va en la familia IPA; nunca en Archivo.

## Layout

Móvil primero, a una columna con margen lateral de 16px (`gutter`) y zonas seguras de iOS. La vista de ejercicio es una rejilla de altura completa: cabecera de formulario arriba, escenario desplazable en medio y la bandeja de la tabla anclada abajo. La portada se limita a 560px de ancho con bloques separados 28px y grupos de controles a 22px; el botón Empezar es pegajoso al pie con un margen opaco de 12px del color del papel.

Ritmo: 4px entre teclas y casillas, 6–8px dentro de grupos, 12px entre bloques del escenario, 14px en la corrección. Las teclas miden al menos 48px de alto (44px los controles mínimos). La tabla sigue a Underhill: monoptongos 4 columnas, separador de 3px, diptongos 3 columnas, separador, una columna de extras; consonantes y acciones en 8 columnas, con Comprobar ocupando 4.

En revisión, por debajo de 900px la tabla se compacta (teclas de 25px, sin palabra de ejemplo) para dejar sitio a la corrección. A partir de 900px el ejercicio pasa a dos columnas (formulario flexible + bandeja de 500px, separación 32px, máx. 1180px) con la cabecera a todo el ancho.

## Elevation & Depth

Plano. La profundidad la da la tinta: filetes de 1.5px y el contraste entre el papel claro y la bandeja oscura. Los bordes se pintan como `box-shadow: inset 0 0 0 1.5px` para no alterar el tamaño de las cajas.

### Shadow Vocabulary
- **Bandeja elevada** (`--shadow`: `0 1px 2px rgb(20 23 40 / .06), 0 10px 28px rgb(20 23 40 / .07)`; en oscuro `0 1px 2px rgb(0 0 0 / .35), 0 10px 28px rgb(0 0 0 / .3)`): solo la bandeja de la tabla en escritorio, cuando deja de estar anclada al borde.
- **Resaltado de revisión** (`inset 0 0 0 2.5px` en `stamp` o `pen`): teclas de la palabra o falladas; el resto de la tabla baja al 28% de opacidad.

### Named Rules
**The Ink Not Shadow Rule.** Un campo se delimita con un filete de tinta, nunca con una sombra difusa. La única sombra del sistema es la de la bandeja en escritorio.

## Shapes

Esquinas casi rectas en una escala estricta: marcas y casillas de fonema 2px (también la casilla de verificación y el número de error), campos y teclas 3px, controles (botones, chips, segmentado, botón de audio) 4px, sello 6px con borde de 3px. Nada es una píldora ni un círculo.

Formas recurrentes: la casilla (un fonema por recuadro de 34×48px); la casilla estrecha discontinua en violeta para `ˈ ˌ` dentro de la respuesta; el hueco discontinuo rojo para un fonema que falta; el tachado rojo a −14° sobre la casilla fallada; la casilla de verificación de los chips, que se marca con un aspa violeta; las casillas de progreso de 8px en la cabecera; el sello girado −7°.

## Components

### Buttons
Contundentes y de papelería, sin brillo.
- **Shape:** controles a 4px, 52px de alto (48px en la bandeja).
- **Primary:** relleno violeta de tampón con texto blanco, Archivo 700 a 17px; siempre único por pantalla (Empezar, Comprobar/Siguiente, Repetir). Empezar alinea el texto a la izquierda y el recuento y la flecha a la derecha.
- **Hover / Focus:** hover solo en punteros finos (`stamp-hover`); pulsación `scale(0.97)` en 140ms; foco con contorno violeta de 2px a 2px de distancia. Al cambiar de etiqueta (Comprobar → Siguiente) el texto se funde con desenfoque de 3px.
- **Secondary:** transparente con filete de tinta de 1.5px; en la bandeja el filete pasa a `z-extra-line`.
- **Ghost:** texto en `muted` que se oscurece a tinta.
- **Icon button:** 44px, sin borde, fondo gris de carpeta al pulsar. El botón de audio es un recuadro de 48px con filete de tinta e icono violeta; mientras habla, emite un anillo violeta.

### Chips
- **Style:** casilla de formulario: fondo impreso, filete suave de 1px, casilla de 16px a la izquierda y el recuento en `faint` con cifras tabulares.
- **State:** al marcarse, el filete pasa a tinta de 1.5px y un aspa violeta se dibuja en dos trazos (160ms, el segundo con 60ms de retraso).

### Segmented control
Pista gris de carpeta a 4px con padding de 3px; la opción elegida es un recuadro impreso con filete de tinta que se desliza (240ms). Se usa para modo, nivel y número de palabras.

### Cards / Containers (campos)
- **Corner Style:** 3px.
- **Background:** impreso (`surface`).
- **Shadow Strategy:** ninguna; filete de tinta de 1.5px.
- **Border:** tinta en campos principales (Palabra, Transcripción RP, Ejemplo, lista del acta); filete suave de 1px en la Nota, que es comentario y no campo del examen.
- **Internal Padding:** 8px 12px 12px; etiqueta de campo arriba.

### Inputs / Fields (casillas de transcripción)
- **Style:** fila de casillas de 34×48px, una por fonema, filete de tinta, IPA a 22–28px; marcas de acento en casilla estrecha discontinua violeta; puntos de sílaba sueltos en `faint`. El cursor es una casilla vacía con filete suave y barra violeta parpadeante.
- **Focus:** la escritura apenas se anima (aparición de 150ms con 5px de subida).
- **Error:** en la corrección cada columna apila número de error (rojo, 800), tu casilla y la RP debajo en `muted` sobre la misma línea base. Casilla fallada: filete, tinta y fondo rojos más tachado; fonema que falta: hueco discontinuo rojo; si se intenta comprobar vacío, el cursor se enmarca en rojo.

### Navigation (cabecera de formulario)
Una tira de impreso con celdas separadas por filetes verticales: Ejercicio nn/nn con casillas de progreso, Nivel y Patrón, cada una con su etiqueta de campo y el valor en Archivo 700 al 85% de ancho con cifras tabulares. A la izquierda, un botón de icono para salir. Progreso: actual con borde violeta y fondo `stamp-soft`, acertada rellena de tinta, fallada rellena de rojo.

### El sello (componente de firma)
Recuadro de 6px con borde de 3px en violeta (APTO) o rojo (REVISAR), girado −7°, fondo de papel al 72% y opacidad 0.94, colocado sobre la fila de respuesta. Al comprobar cae: entra desde −12° y escala 1.6 hasta asentarse en 300ms con `cubic-bezier(0.2, 1.3, 0.4, 1)`, mientras la fila de respuesta se hunde 1.5px. En el resumen el mismo sello lleva la puntuación a 64px.

### La bandeja fonémica
Tabla de Underhill sobre bandeja de tinta (`tray`), teclas de 3px en zonas de color plano con el símbolo IPA a 19px y una palabra de ejemplo a 11px debajo. Pulsación `scale(0.93)`. En la corrección, los sonidos de la palabra se encienden con filete violeta de 2.5px, los fallados con rojo y el resto baja al 28%; el encendido se escalona por tecla (`--kd`).

## Do's and Don'ts

### Do:
- **Do** usar el logo siempre desde los SVG de `marca/` (sello `/ˈ/` girado −6° y logotipo en Archivo `wdth` 72 / `wght` 820 convertido a trazos); en oscuro, `fonorp-logo-oscuro.svg`.
- **Do** delimitar cada bloque de información como un campo con etiqueta pequeña condensada y filete de tinta de 1.5px.
- **Do** comunicar cada estado por forma además de por color: tachado, hueco discontinuo, número de error, peso del acento.
- **Do** reservar `cubic-bezier(0.2, 1.3, 0.4, 1)` para el sello; el resto del movimiento usa `cubic-bezier(0.23, 1, 0.32, 1)` entre 140 y 300ms.
- **Do** mantener en movimiento reducido los fundidos (200ms) y quitar todo desplazamiento, escala y tachado animado.
- **Do** declarar cada color nuevo en `:root` con su pareja en el bloque oscuro.

### Don't:
- **Don't** redibujar el logo ni imitarlo con texto en una fuente.
- **Don't** usar verde, ni ningún tercer color de acierto o error.
- **Don't** usar el ámbar para nada que no sea la observación del acento secundario.
- **Don't** marcar el acento primario duplicando el trazo; se distingue por peso 800.
- **Don't** redondear en píldora ni salirse de la escala 2/3/4/6px.
- **Don't** usar sombras difusas en campos o casillas; solo la bandeja de escritorio lleva sombra.
- **Don't** añadir otra curva con rebote ni animar la escritura más allá de la aparición de la casilla.
- **Don't** escribir símbolos IPA en Archivo ni dibujar iconos a mano; los iconos son Phosphor (regular) incrustados como SVG.
