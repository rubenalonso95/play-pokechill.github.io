# AGENTS.md — Reglas permanentes para agentes (pokechill)

1. El agente implementa; otro agente/persona revisa. No auto-aprobar cambios propios.
2. No commit ni push salvo autorización explícita del usuario.
3. No tocar cambios ajenos a la tarea. Verificar `git status --short` antes de editar.
4. No asumir que un archivo modificado o no trackeado pertenece a la tarea actual.
5. Web y Android deben mantenerse funcionalmente equivalentes. Los cambios se
validan primero en Web y despues se replican unicamente en los archivos
Android afectados, sin sincronizaciones masivas innecesarias.
6. Preferir integración nativa frente a UltraMods / monkey-patching.
7. Antes de editar, identificar los puntos de entrada concretos (archivo + función + línea).
8. Después de editar, ejecutar comprobaciones focalizadas (no builds completos salvo pedido).
9. No usar `reset`, `restore`, `clean`, `checkout` destructivo sin autorización explícita.
10. No replicar a Android salvo que la tarea lo pida expresamente (ver regla 5:
solo archivos afectados, sin sync masiva).
11. No instalar dependencias ni hacer builds salvo pedido explícito.
12. Evitar exploración global innecesaria: una búsqueda de entry-points, luego fragmentos.
13. No duplicar lógica existente; reutilizar funciones del codebase.
14. No usar hooks globales, monkey-patching ni `MutationObserver` salvo autorización.
15. No anadir propiedades nuevas a `saved` para estados temporales de UI/combate.
16. `leaveCombat()` tiene efectos de gameplay: no usarlo como simple toggle de UI.
17. `areasDictionary.js` (Web y espejo Android) solo se toca si la tarea lo exige.

Repo web: raíz (`index.html`, `scripts/`, `styles.css`).
Espejo Android: `android/app/src/main/assets/pokechill/`.
