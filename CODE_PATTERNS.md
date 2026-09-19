# CODE_PATTERNS.md — Trampas y reglas técnicas (verificado 2026-09-18)

1. Paridad Web ↔ Android: todo cambio en raíz (`index.html`, `scripts/*`,
   `styles.css`) debe replicarse a mano en
   `android/app/src/main/assets/pokechill/`. No hay sync automática.
2. `leaveCombat()` (explore.js:806) tiene efectos de gameplay (persiste
   `hpPercentage`, dispara `encounterEffect()`, decide `area-rejoin` visible).
   No usarlo como simple cierre de UI.
3. `rejoinArea()` (l.1320) inicia revancha: con `storedAfkSeconds>30` salta
   directo a `initialiseArea()`; si no, vuelve al menú. No equivale a "volver".
4. `initialiseArea()` (l.3959) inicializa encuentro (olas, slots, buffs, clima).
   Llamarlo dos veces = encuentro duplicado/reiniciado.
5. `injectPreviewTeam()` (teams.js:280) tiene efectos laterales (Unown →
   `secretFight`, muta slots) y `return` temprano tras validar (Frontier,
   Nuzlocke, restricted). No tratarlo como validador puro ni llamarlo "por si".
6. Regla de `return` tras mutar estado: si una función modifica `saved`, `team`,
   `areas[]` o el DOM y luego hace `return` (ej. `injectPreviewTeam`,
   `leaveCombat`), documentarlo en el PR y no reordenar sin revisar.
7. AFK: `afkSeconds` (l.7565), `storedAfkSeconds` (usado en 777,831,1282,1307;
   declaración `let` no localizada — requiere verificación), `saved.autoRefight`.
   No confundir `afkSeconds=0` (corta AFK) con `storedAfkSeconds=0` (corta refight).
8. Training: `areas.training.currentTraining`, `areas.training.tier`,
   `training[...].condition()`, `saved.trainingPokemon`, `currentTrainingWave`.
   Revisar `condition()` antes de asumir que un entrenamiento es jugable.
9. Frontier: `rotationFrontierCurrent` (l.4760) + `type=="frontier"` + estado por
   área (`level/team/difficulty/tier/reward`, ver save.js:34-41). Las divisiones
   se validan en `teams.js:310-312`.
10. No duplicar lógica: reutilizar `returnPkmnDivision`, `updatePreviewTeam`,
    `saveGame/loadGame`, `transition()` en vez de reimplementar.
11. Sin hooks globales, monkey-patching ni `MutationObserver` salvo autorización.
    Los menús se controlan por `style.display` directo desde JS.
12. No anadir props nuevas a `saved` para estados temporales; preferir `let` en memoria.
    `saved.currentAreaBuffer` es estado existente: solo tocarlo si el flujo nativo lo
    requiere, no usarlo como contenedor generico de contexto.
13. No tocar cambios ajenos: `areasDictionary.js` modificado en working tree es
    de otra tarea; `.bak`, `speedBattles_extracted/` y carpetas con espacios son
    restos no trackeados — ignorarlos.

Requiere verificación: declaración de `storedAfkSeconds`; `autoRefight()` y
`battleSummary()` no leídos en esta pasada; `type` exacto del área training.
