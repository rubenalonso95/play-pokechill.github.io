# ARCHITECTURE.md — Mapa compacto pokechill (2026-09-18)

Web = raíz (`index.html` + `scripts/` + `styles.css`).
Android = espejo en `android/app/src/main/assets/pokechill/`. Paridad manual.

Orden JS (`index.html:~1725-1756`): `HackTimer`, `fuse`, `moveDictionary`,
`itemDictionary`, `pkmnDictionary`, `areasDictionary`, `PR/*`, `speedBattles`,
`script.js`, `teams.js`, `explore.js`, `shop.js`, `dictionarySearch`,
`tooltip.js`, `decor.js`, `save.js`.

## `index.html` — UI principal

- `team-menu` (l.135): editor de equipos (header + selectores).
- `training-menu` (l.613), `vs-menu` (l.1062), `explore-menu` (l.1166).
- `area-end` (l.1220): fin de combate. Botones: `exitCombat()` (Save and exit),
  `area-rejoin` → `rejoinArea()`, `area-refight` → `autoRefight()`,
  `battle-summary` → `battleSummary()`. Listas `area-end-item-list/pkmn-list`.
- Sin router: la pantalla visible se controla principalmente con `style.display` desde JS.

## `scripts/explore.js` — exploración y combate (~8400 líneas)

- `leaveCombat()` (l.806): fin de combate. Persiste `hpPercentage`, dispara
  `encounterEffect()` si no hubo KO, muestra/oculta `area-rejoin`, tutorial,
  limpia buffs/clima, muestra `area-end`. NO es toggle de UI.
- `rejoinArea()` (l.1320): revancha. Si `storedAfkSeconds>30` re-entra vía
  `initialiseArea()`; si no, vuelve al menú del área.
- `initialiseArea()` (l.3959): inicializa encuentro. Resetea `battling`, olas
  (`currentTrainingWave=30`), `exploreActiveMember=slot1`, `setPkmnTeam(Hp)`,
  `setWildPkmn`, buffs y clima.
- `exitPkmnTeam()` (l.8376): sale de `team-menu` a `explore-menu`,
  `saved.currentArea=undefined`. Solo UI + reset de contexto.
- `encounterEffect`: callback opcional por área (en `areasDictionary.js`,
  invocado en `explore.js:471,814`). Ej.: consume `pokeflute`/`epochFeather`.
- `transition()` (l.754): cambio visual; se omite en auto-refight.
- Explore: `explore-menu` + `type:"wild"`. VS: `vs-menu` + `type:"vs"`.
- Training: `training-menu`, `areas.training.*` + `training[]`.
- Frontier: `vs-menu`, `type:"frontier"`, `rotationFrontierCurrent` (l.4760).
- AFK: `afkSeconds` (l.7565), `storedAfkSeconds`, `saved.autoRefight`.

## `scripts/teams.js` — equipos

- Edita presets: `saved.previewTeams[saved.currentPreviewTeam]`.
- `injectPreviewTeam()` (l.280): vuelca preset al equipo real al entrar en
  combate. Efectos laterales (Unown -> `secretFight`, limpia slots) y
  validaciones con `return` (Frontier por division, Nuzlocke, restricted moves).
- Destino: `saved.currentAreaBuffer` -> `initialiseArea()`; salida: `exitPkmnTeam()`.

## `scripts/save.js` — persistencia

- `saveGame()` (l.5): guarda `saved` + `team` + `item.got` + `shop.stock` +
  subset de `areas` (defeated, hpPercentage, frontier: level/team/..., training:
  tier/currentTraining) + subset de `pkmn` en `localStorage.gameData`.
- `loadGame()` (l.86), `loadFromText()` (l.241). Normaliza (ej. `movePresets`).

## `scripts/areasDictionary.js` — areas

- `const areas = {}` (l.354). Campos: `id`, `type`, `encounter`,
  `unlockRequirement()`, `encounterEffect()`, `reward`, `trainer`, `defeated`.
- Types vistos: `wild`, `vs`, `frontier`, `event`, `dimension`. NO tocar sin motivo.

## `tooltip.js` / `styles.css`

- `tooltip.js` incluye, entre otras, tooltips, presets de movimientos y editor Pokemon.
- `styles.css`: solo cambios visuales; los `display` los controla JS.

## Android

Web (raiz) replica manual a `android/app/src/main/assets/pokechill/`:
`index.html` -> `index.html`, `scripts/*` -> `scripts/*` (mismo set),
`styles.css` -> `styles.css`. Sin sync automatica.

## Quiero cambiar X -> mirar primero Y

- Final de combate -> `explore.js` `leaveCombat()` (l.806) -> `#area-end`.
- Edicion equipos -> `teams.js` `injectPreviewTeam()` (l.280) -> `exitPkmnTeam()`.
- Training -> `areas.training.*` / `training[]` / `saved.trainingPokemon`.
- Frontier -> `rotationFrontierCurrent` / `type=="frontier"` + divisiones en teams.
- Revancha -> `rejoinArea()` (l.1320) + `#area-rejoin`.
- Inicio encuentro -> `initialiseArea()` (l.3959).
- Persistencia -> `save.js` `saveGame()`/`loadGame()` (subset por tipo).
- Areas/recompensas -> `areasDictionary.js` `const areas` (l.354), `reward`.

