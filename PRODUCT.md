# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML + CSS + vanilla JavaScript, no framework and no build step (`index.html`, `app.js`, `styles.css`, `fono.js`, `words.json`). Installable PWA, offline. Hosting on GitHub Pages at zero cost.

## Users

Miguel (filólogo inglés que prepara las oposiciones de Secundaria Inglés en Murcia) y sus amigos y compañeros: opositores, estudiantes de Estudios Ingleses y del Máster de Profesorado. Hispanohablantes que practican la transcripción fonémica en RP, sobre todo desde el iPhone, en ratos sueltos de estudio.

## Product Purpose

Practicar la transcripción fonémica en RP y recibir corrección fonema a fonema que explica el fallo en español (vocal débil, r de RP, sorda/sonora, acento…). Éxito: el usuario deja de cometer los errores típicos de hispanohablante y transcribe con seguridad en el examen.

## Positioning

Corrige la transcripción alineando la respuesta con el modelo y explicando cada fallo con la regla que lo causa, en lugar de dar solo "bien/mal". Admite también la práctica a mano (modo papel) con autoevaluación, que es como se hace en el examen.

## Operating Context

- Se usa en el móvil, en sesiones cortas de 5 o 10 palabras.
- Dos modos: transcribir con la tabla fonémica de la app, o en papel y comparar con la solución.
- Convención de transcripción del Cambridge EPD / Longman PD (/i/ happy, /u/ débil, ˈ obligatorio también en monosílabos, ˌ solo avisa).

## Capabilities and Constraints

- 123 palabras en `words.json` con forma principal, variantes, patrones, nivel 1–3, nota y error típico opcional.
- Uso gratuito y personal (Miguel y amigos). Sin cuentas en v1; progreso en localStorage.
- Sin repetición espaciada Leitner (descartada por el usuario).
- Interfaz en español; contenido fonético en inglés.
- Nombre de la marca abierto: "FonoRP" es el nombre de trabajo y se aceptan propuestas.

## Brand Commitments

Marca independiente de EkkoEnglish: no hereda su logo ni sus tokens.

## Evidence on Hand

Solo el banco de palabras propio. No hay testimonios, métricas ni usuarios que citar; no inventarlos. Las transcripciones están pendientes de revisión contra el Cambridge EPD o el Longman PD.

## Product Principles

1. La corrección explica el porqué, no solo el qué.
2. Fiel a la convención de los diccionarios de referencia (EPD/LPD); nada de simplificaciones propias.
3. Rápido en el móvil: una palabra se resuelve en segundos.
4. Sirve también para practicar a mano, como en el examen.

## Accessibility & Inclusion

Legibilidad de los símbolos IPA a tamaño de móvil (fuente con cobertura IPA completa) y contraste WCAG AA en modo claro y oscuro.
