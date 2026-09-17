// ============================================================
// Speed Battles — Game Modifier nativo (sin UltraMods)
// Acelera EXCLUSIVAMENTE los ticks de combate del gameLoop
// (explore.js). El tiempo global del juego (timers 2h/8h,
// rotaciones, dungeons, VS, eventos, cooldowns) sigue a 1x.
// Velocidades: 1x / 2x / 3x / 5x / 10x (máximo intencionado: 10x)
// ============================================================

const SPEED_BATTLES_SPEEDS = [1, 2, 3, 5, 10]

function speedBattlesNormalize() {
  if (typeof saved.speedBattles !== "object" || saved.speedBattles === null) saved.speedBattles = { enabled: false, speed: 2 }
  if (saved.speedBattles.enabled !== true && saved.speedBattles.enabled !== false) saved.speedBattles.enabled = false
  if (!SPEED_BATTLES_SPEEDS.includes(saved.speedBattles.speed)) saved.speedBattles.speed = 2
}

const SpeedBattles = {

  isActive() {
    speedBattlesNormalize()
    return saved.speedBattles.enabled
  },

  // El fast-forward de AFK ya acelera el juego por sí solo: Speed Battles
  // se auto-desactiva mientras afkSeconds > 0 (sin doble aceleración).
  // try/catch cubre el TDZ de `let afkSeconds` si se consultara antes de
  // que explore.js cargue.
  isAfk() {
    try { return afkSeconds > 0 } catch (e) { return false }
  },

  // Factor de aceleración de combate. 1 = comportamiento original exacto.
  // Durante AFK SIEMPRE devuelve 1 (defensa en profundidad en el propio
  // módulo, aunque los call sites de explore.js también lo comprueban)
  factor() {
    return (this.isActive() && !this.isAfk()) ? saved.speedBattles.speed : 1
  },

  // A partir de 5x el desinc visual de las barras de HP es perceptible
  // (varios ticks de combate entre frame y frame) → sync visual activo
  isFast() {
    return this.isActive() && !this.isAfk() && saved.speedBattles.speed >= 5
  },

  toggle(enabled) {
    speedBattlesNormalize()
    saved.speedBattles.enabled = enabled === true
    this.applyBodyClass()
    if (typeof saveGame === "function") saveGame()
  },

  setSpeed(speed) {
    speedBattlesNormalize()
    const n = Number(speed)
    if (SPEED_BATTLES_SPEEDS.includes(n)) saved.speedBattles.speed = n
    else saved.speedBattles.speed = 2
    this.applyBodyClass()
    const select = document.getElementById("settings-speedbattles")
    if (select) select.value = saved.speedBattles.speed
    if (typeof saveGame === "function") saveGame()
  },

  applyBodyClass() {
    document.body.classList.toggle("speed-battles-fast", this.isFast())
  },

  // Sincronización VISUAL de las barras de HP (solo speed >= 5).
  // NO toca lógica: solo escribe style.width/background. Los triggers
  // de skills de área (skillEnemyTriggers) siguen gestionándolos
  // únicamente updateWildPkmn/explore.js.
  // TODO el cuerpo está en try/catch: un fallo visual NUNCA puede
  // propagarse a gameLoop (quebraría la cadena de requestAnimationFrame
  // y detendría el combate — bug ya ocurrido y corregido).
  syncHpVisuals() {
    if (!this.isFast()) return
    try {

    // Barras del equipo (mismo loop/patrones que explore.js:1878-1890)
    for (const i in team) {
      if (team[i].pkmn === undefined) continue
      const bar = document.getElementById(`explore-${i}-hp`)
      if (!bar) continue

      const hp = Number(pkmn[team[i].pkmn.id].playerHp) || 0
      const hpMax = Number(pkmn[team[i].pkmn.id].playerHpMax) || 1
      const percent = Math.max(0, Math.min(100, (hp / hpMax) * 100))

      bar.style.width = percent + "%"
      if (percent > 60) bar.style.background = "rgb(130, 211, 130)"
      else if (percent < 30) bar.style.background = "rgba(219, 112, 112, 1)"
      else bar.style.background = "rgba(221, 168, 99, 1)"
    }

    // Barras del salvaje: derivadas 100% del DOM (sin depender de los
    // bindings `let activeBars` / `const hpBars` de explore.js, que viven
    // en el scope de script y NO son accesibles desde aquí).
    // explore.js pone style.display="flex" solo en las barras activas y
    // usa colores fijos conocidos para los segmentos 2-4.
    const wildBaseBar = document.getElementById("exploe-wild-hp")
    if (!wildBaseBar) return

    const wildBars = [
      { el: wildBaseBar, color: null },
      { el: document.getElementById("exploe-wild-hp-2"), color: "rgb(134, 141, 238)" },
      { el: document.getElementById("exploe-wild-hp-3"), color: "rgb(238, 236, 134)" },
      { el: document.getElementById("exploe-wild-hp-4"), color: "rgb(238, 134, 134)" },
    ]

    let visibleBars = 1
    for (let i = 1; i < wildBars.length; i++) {
      if (wildBars[i].el && wildBars[i].el.style.display !== "none") visibleBars++
    }

    const wildHp = Number(wildPkmnHp)
    const wildHpMax = Number(wildPkmnHpMax)
    if (!Number.isFinite(wildHp) || !Number.isFinite(wildHpMax) || wildHpMax <= 0 || wildHp <= 0) return

    const percent = Math.max(0, Math.min(100, (wildHp / wildHpMax) * 100))
    const seg = 100 / visibleBars

    for (let i = visibleBars - 1; i >= 0; i--) {
      const bar = wildBars[i].el
      if (!bar) continue

      const start = seg * i
      const end = start + seg

      if (percent > start) bar.style.width = percent >= end ? "100%" : ((percent - start) / seg) * 100 + "%"
      else bar.style.width = "0%"

      if (wildBars[i].color) bar.style.background = wildBars[i].color
      else {
        if (percent > 60) bar.style.background = "rgb(130, 211, 130)"
        else if (percent < 30) bar.style.background = "rgba(219, 112, 112, 1)"
        else bar.style.background = "rgba(221, 168, 99, 1)"
      }
    }
    } catch (e) { /* sync visual fail-safe: nunca propagar a gameLoop */ }
  }
}

// CSS propio del mod (inyectado, sin tocar styles.css base):
// a speed >= 5 las transiciones de las barras irían a trompicones
;(function speedBattlesInjectStyles() {
  const style = document.createElement("style")
  style.textContent = `
    body.speed-battles-fast .explore-hp,
    body.speed-battles-fast .explore-hp-wild {
      transition: none !important;
    }
  `
  document.head.appendChild(style)
})()
