// Test harness temporal para speedBattles.js (se borra al terminar)
const fs = require("fs")
const path = require("path")
const vm = require("vm")

// --- Stubs de globals del juego ---
const saved = {}            // simulación de partida vieja: sin speedBattles
let afkSeconds = 0          // global mutable
const team = {
  slot1: { pkmn: { id: "pikachu" } },
  slot2: { pkmn: undefined },
}
const pkmn = { pikachu: { playerHp: 50, playerHpMax: 100 } }
let wildPkmnHp = 80, wildPkmnHpMax = 100
const bodyClasses = new Set()
const wildBarEls = {
  "exploe-wild-hp": { style: { display: "flex" } },
  "exploe-wild-hp-2": { style: { display: "flex" } },
  "exploe-wild-hp-3": { style: { display: "none" } },
  "exploe-wild-hp-4": { style: { display: "none" } },
}
const teamBarEl = { style: {} }
const document = {
  body: { classList: { toggle(c, v) { v ? bodyClasses.add(c) : bodyClasses.delete(c) } } },
  head: { appendChild() {} },
  createElement: () => ({}),
  getElementById: (id) => {
    if (id === "explore-slot1-hp") return teamBarEl
    return wildBarEls[id] || null
  },
}
let saveCalls = 0
const saveGame = () => { saveCalls++ }

const ctx = { saved, team, pkmn, wildPkmnHp, wildPkmnHpMax, document, saveGame, console }
Object.defineProperty(ctx, "afkSeconds", { get: () => afkSeconds, set: (v) => { afkSeconds = v } })
vm.createContext(ctx)

const code = fs.readFileSync(path.join(__dirname, "scripts", "speedBattles.js"), "utf8")
vm.runInContext(code + "\nthis.SpeedBattles = SpeedBattles; this.SPEED_BATTLES_SPEEDS = SPEED_BATTLES_SPEEDS;", ctx)
const SB = ctx.SpeedBattles

let failures = 0
function check(name, cond) {
  if (cond) console.log("PASS  " + name)
  else { console.log("FAIL  " + name); failures++ }
}


// 1. Partida antigua sin saved.speedBattles → default desactivado, 1x
check("old-save: factor() === 1 (disabled default)", SB.factor() === 1)
check("old-save: self-heal crea saved.speedBattles", saved.speedBattles && saved.speedBattles.enabled === false && saved.speedBattles.speed === 2)

// 2. Toggle ON con speed por defecto 2x
SB.toggle(true)
check("toggle ON: factor() === 2 (default speed)", SB.factor() === 2)
check("toggle ON: isActive() true", SB.isActive() === true)
check("toggle ON: body class speed-battles-fast NO (2 < 5)", !bodyClasses.has("speed-battles-fast"))

// 3. Cambios de velocidad 1/2/3/5/10
for (const s of [1, 2, 3, 5, 10]) {
  SB.setSpeed(s)
  check(`setSpeed(${s}) → factor ${s}`, SB.factor() === s)
}
check("setSpeed(5) activa clase fast", bodyClasses.has("speed-battles-fast"))
check("setSpeed persiste con saveGame()", saveCalls > 0)

// 4. Valores inválidos → clamp a default 2 (nunca 50x ni basura)
SB.setSpeed(50)
check("setSpeed(50) → clamp a 2 (¡NO 50x!)", SB.factor() === 2 && saved.speedBattles.speed === 2)
SB.setSpeed("10")
check("setSpeed('10' string) → factor 10", SB.factor() === 10)
SB.setSpeed(999)
check("setSpeed(999) → clamp a 2", SB.factor() === 2)

// 5. AFK: sin doble aceleración
SB.setSpeed(10)
afkSeconds = 30
check("AFK activo → factor() === 1 (sin doble aceleración)", SB.factor() === 1)
check("AFK activo → isFast() false", SB.isFast() === false)
afkSeconds = 0
check("AFK terminado → factor() vuelve a 10", SB.factor() === 10)

// 6. 1x = comportamiento idéntico al original
SB.setSpeed(1)
check("1x → factor() === 1 (bit a bit original)", SB.factor() === 1)
check("1x → body sin clase fast", !bodyClasses.has("speed-battles-fast"))

// 7. REGRESIÓN CLAVE (bug del dispositivo): syncHpVisuals NUNCA lanza
SB.toggle(false)
let threwOFF = false
try { SB.syncHpVisuals() } catch (e) { threwOFF = true }
check("REGRESIÓN: syncHpVisuals con mod OFF no lanza excepción", threwOFF === false)

SB.toggle(true)
SB.setSpeed(10)
let threwON = false
try { SB.syncHpVisuals() } catch (e) { threwON = true }
check("REGRESIÓN: syncHpVisuals con mod ON 10x no lanza excepción", threwON === false)

// 8. Sync visual a 10x escribe estilos correctos (2 barras visibles, 80%)
check("10x: barra equipo 50%", teamBarEl.style.width === "50%")
check("10x: barra wild base 100% (80% > segmento 50-100)", wildBarEls["exploe-wild-hp"].style.width === "100%")
check("10x: barra wild -2 al 60% del segmento", wildBarEls["exploe-wild-hp-2"].style.width === "60%")
check("10x: color fijo segmento 2", wildBarEls["exploe-wild-hp-2"].style.background === "rgb(134, 141, 238)")

// 9. 1x / 2x / 3x → syncHpVisuals es no-op (early return por isFast)
SB.setSpeed(3)
const before = wildBarEls["exploe-wild-hp"].style.width
SB.syncHpVisuals()
check("3x: no-op (barras intactas desde último sync 10x)", wildBarEls["exploe-wild-hp"].style.width === before)
SB.setSpeed(2)
SB.syncHpVisuals()
check("2x: no-op", wildBarEls["exploe-wild-hp"].style.width === before)

// 10. 2x/5x/10x: factor correcto en cada nivel + sync sin excepción
for (const s of [2, 5, 10]) {
  SB.setSpeed(s)
  check(`regresión ${s}x: factor ${s}`, SB.factor() === s)
}

// 11. AFK durante sync: sin excepción y sin doble aceleración
afkSeconds = 5
let threwAFK = false
try { SB.syncHpVisuals() } catch (e) { threwAFK = true }
check("AFK activo: sync no lanza (isFast false → early return)", threwAFK === false && SB.factor() === 1)
afkSeconds = 0

// 12. Salvaje muerto (hp 0) → no escribe barras, no lanza
wildPkmnHp = 0
let threwDead = false
try { SB.syncHpVisuals() } catch (e) { threwDead = true }
check("wild hp=0: no lanza", threwDead === false)
wildPkmnHp = 80

// 13. Toggle OFF → todo vuelve a original
SB.toggle(false)
check("toggle OFF: factor() === 1", SB.factor() === 1)
check("toggle OFF: body sin clases", !bodyClasses.has("speed-battles-fast") && !bodyClasses.has("speed-battles-active"))

// 14. Partida con speedBattles corrupto → autoreparación
saved.speedBattles = "garbage"
check("estado corrupto (string) → autoreparado a default", SB.factor() === 1 && saved.speedBattles.enabled === false)
saved.speedBattles = { enabled: true, speed: 50 }
check("estado corrupto (50x legacy) → clamp speed a 2", SB.factor() === 2 && saved.speedBattles.speed === 2)

// 15. Velocidades permitidas exactas
check("SPEEDS exactas [1,2,3,5,10]", JSON.stringify(ctx.SPEED_BATTLES_SPEEDS) === JSON.stringify([1, 2, 3, 5, 10]))

console.log(failures === 0 ? "\nALL TESTS PASSED" : `\n${failures} TEST(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)

