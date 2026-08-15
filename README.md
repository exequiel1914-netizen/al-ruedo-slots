# Al Ruedo Slots - MVP

Esta rama contiene una versión MVP jugable en navegador (optimizada para iPhone) con 5 rodillos x 3 filas, créditos virtuales y detección básica de premios.

Cómo probar (rápido):
- Abrir index.html desde la rama `feature/mvp-al-ruedo-slots`.
- Usar RawGit/RawGithack para servir el HTML: https://raw.githack.com/exequiel1914-netizen/al-ruedo-slots/feature/mvp-al-ruedo-slots/index.html

Notas técnicas:
- Implementado con JavaScript puro (ES modules).
- Símbolos como SVG placeholder en `assets/symbols/`.
- Sonidos generados por WebAudio (no requiere archivos externos).
- Controles: SPIN, apuesta +/-, MUTE.
