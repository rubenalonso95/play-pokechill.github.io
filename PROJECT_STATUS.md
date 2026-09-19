# PROJECT_STATUS.md — Estado real verificado (2026-09-18)

Verificado con `git log --oneline -5` y `git status --short`.

## HEAD

```text
HEAD = ba79f9f
Commit = Add move presets
origin/main = ba79f9f (HEAD -> main, origin/main, origin/HEAD)
```

Anteriores: `da12543` shiny evolution inheritance, `5bf2958` Pokerus Pokedex filter,
`6501b1c` Speed Battles, `adda188` offline Android app.

## Mods — estado confirmado por el usuario (no re-verificado en código)

### Prioridad alta

- #1 `noMoreMagikarp` — publicado
- #10 `editTeamFightAgain` — PENDIENTE, NO implementado (intentos anteriores descartados)
- #11 `shinyEvolve` — publicado
- #14 `movePresets` — publicado (corresponde a HEAD `ba79f9f`)

### Queremos hacer

- #3 `bulkCandyUse` · #4 `multiHeartScale` · #5 `betterDex`
- #6 `betterMoveSorting` · #7 `IncompleteFamilies`

### Pendientes de análisis

- #2 `fatigueRemover` · #8 `CosmoemEvolves` · #9 `betterGenetics`
- #12 `battleNumbers` · #16 `shinyFamily`

### Más adelante

- #15 `mythos`

### Skip definitivo

- #13 `allStarters` · #17 `saveVault` · #18 `backupMod` · #19 `workshopWelcome`

## Working tree (requiere verificación antes de tocar)

```text
M android/app/src/main/assets/pokechill/scripts/areasDictionary.js
M scripts/areasDictionary.js
?? Fuc a anadir/
?? index.html.backup
?? index.html.pre-android.bak
?? scripts/PR/movesetGenerator.js.pre-android.bak
?? scripts/PR/updateCheck.js.pre-android.bak
?? speedBattles_extracted/
```

- Los cambios en `areasDictionary.js` son AJENOS a la documentación: NO tocarlos.
- Los no trackeados NO deben asumirse parte de ninguna tarea.
- `editTeamFightAgain` NO está implementado: no buscar su código, partir de cero.
