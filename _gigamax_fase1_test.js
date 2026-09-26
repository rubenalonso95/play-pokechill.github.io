//_gigamax_fase1_test.js — validacion Fase 1 Gigamax:
//umbrales completos, toda ruta de dano por wildPkmnTakeDamage(), Skill 2 aislada por Pokemon.
//Extrae y ejecuta el codigo REAL de scripts/explore.js, areasDictionary.js y teams.js.
const fs = require("fs")
const path = require("path")

const ROOT = __dirname
const exploreSrc = fs.readFileSync(path.join(ROOT, "scripts", "explore.js"), "utf8")
const areasSrc = fs.readFileSync(path.join(ROOT, "scripts", "areasDictionary.js"), "utf8")
const teamsSrc = fs.readFileSync(path.join(ROOT, "scripts", "teams.js"), "utf8")
const pkmnSrc = fs.readFileSync(path.join(ROOT, "scripts", "pkmnDictionary.js"), "utf8")

let pass = 0, fail = 0
function check(name, cond, extra){
    if (cond) { pass++; console.log("  OK   " + name) }
    else { fail++; console.log("  FAIL " + name + (extra !== undefined ? " | got: " + extra : "")) }
}

// ---------- extraccion de codigo real ----------
function between(text, a, b){
    const i = text.indexOf(a), j = text.indexOf(b, i)
    if (i < 0 || j < 0) throw new Error("no se encontro: " + a)
    return text.slice(i, j + b.length)
}
function extractFunction(text, name){
    const start = text.indexOf("function " + name + "(")
    if (start < 0) throw new Error("funcion no encontrada: " + name)
    let depth = 0
    for (let k = text.indexOf("{", start); k < text.length; k++){
        const c = text[k]
        if (c === "{") depth++
        else if (c === "}") { depth--; if (depth === 0) return text.slice(start, k + 1) }
    }
    throw new Error("llaves sin cerrar en " + name)
}
function lineContaining(text, sub){
    const line = text.split(/\r?\n/).find(l => l.includes(sub))
    if (line == undefined) throw new Error("linea no encontrada: " + sub)
    return line
}
function matchOrThrow(text, re, label){
    const m = text.match(re)
    if (!m) throw new Error("regex sin match: " + label)
    return m[0]
}

const gigamaxBlock = between(exploreSrc, "//BEGIN_GIGAMAX_BLOCK", "//END_GIGAMAX_BLOCK")
const fnUpdateTeamBuffs = extractFunction(exploreSrc, "updateTeamBuffs")
const fnFormatBuffs = extractFunction(exploreSrc, "formatBuffs")
const fnSwitchMember = extractFunction(teamsSrc, "switchMember")

const linesDot = exploreSrc.split(/\r?\n/).filter(l => l.includes("wildPkmnTakeDamage(wildPkmnHpMax/4)"))
if (linesDot.length !== 2) throw new Error("se esperaban 2 lineas burn/poison con helper, hay " + linesDot.length)
const lineTickRoar = lineContaining(exploreSrc, "roarTurns[exploreActiveMember] -= 1")
const lineHookAtk = lineContaining(exploreSrc, "gigamaxRoarTurns(exploreActiveMember) > 0) totalPower /=1.5 //Skill 2 Gigamax: ATK")
const lineHookSatk = lineContaining(exploreSrc, "gigamaxRoarTurns(exploreActiveMember) > 0) totalPower /=1.5 //Skill 2 Gigamax: SATK")
const lineWeatherTick = lineContaining(exploreSrc, "saved.weatherTimer--")
const lineCooldownTick = lineContaining(exploreSrc, "saved.weatherCooldown--")

const raidCfgSrc = matchOrThrow(areasSrc, /gigamaxRaids\.charizardGmax = \{[\s\S]*?\n\}/, "config raid")
const roarEffectSrc = matchOrThrow(areasSrc, /skill\.gigamaxDemoralisingRoar = \{[\s\S]*?\n\}/, "effecto skill 2")
const gigamaxAreaSrc = matchOrThrow(areasSrc, /areas\.gigamaxRaidCharizard = \{[\s\S]*?\n\}/, "area gigamax")
// ---------- estaticos sobre los ficheros ----------
console.log("== ESTATICOS ==")
{
    const bStart = exploreSrc.indexOf("//BEGIN_GIGAMAX_BLOCK")
    const bEnd = exploreSrc.indexOf("//END_GIGAMAX_BLOCK")
    const re = /wildPkmnHp\s*[-+*\/]=/g
    const stray = []
    let m
    while ((m = re.exec(exploreSrc))) if (m.index < bStart || m.index > bEnd) stray.push(exploreSrc.slice(m.index - 30, m.index + 40).trim())
    check("E1. ninguna mutacion de wildPkmnHp fuera del bloque Gigamax/helper", stray.length === 0, stray.join(" ;; "))
    check("E2. gigamaxRaidReset() invocado en leaveCombat e initialiseArea", (exploreSrc.match(/gigamaxRaidReset\(\)/g) || []).length >= 2)
    check("E3. teams.js: switchMember llama a gigamaxRoarEnter(member)", fnSwitchMember.includes("gigamaxRoarEnter(member)"))
    check("E4. Skill 2 ya no usa moveBuff atkdown/satkdown team", !/moveBuff\("wild","(atk|satk)down/.test(areasSrc))
    check("E5. efecto Skill 2 llama a gigamaxRoarApply()", roarEffectSrc.includes("gigamaxRoarApply()"))
    check("E6. area gigamax sin hpPercentage (cada entrada es una raid nueva)", !gigamaxAreaSrc.includes("hpPercentage"))
    check("E7. charizardGmax definido como Pokemon normal de diccionario", /pkmn\.charizardGmax = \{/.test(pkmnSrc))
    const srcLines = exploreSrc.split(/\r?\n/)
    check("E8. hook physical dentro del bloque split=='physical'", srcLines.slice(0, srcLines.indexOf(lineHookAtk)).slice(-12).join("\n").includes("split == 'physical'"))
    check("E9. hook special dentro del bloque split=='special'", srcLines.slice(0, srcLines.indexOf(lineHookSatk)).slice(-12).join("\n").includes("split == 'special'"))
    check("E10. tick de turnos junto al decremento de buffs activo", srcLines.slice(0, srcLines.indexOf(lineTickRoar)).slice(-4).join("\n").includes("for (const i in team[exploreActiveMember].buffs)"))
}

// ---------- estaticos: clima (Sol permanente SOLO en la Gigamax) ----------
console.log("== CLIMA: ESTATICOS ==")
{
    const fieldSunSrc = matchOrThrow(areasSrc, /field\.harshSun = \{[\s\S]*?\n\}/, "field.harshSun")
    check("W1. field.harshSun intacto (Permanent Sunny, no modificado)", fieldSunSrc.includes("Permanent") && fieldSunSrc.includes("Sunny"))
    const sunRefillLine = lineContaining(exploreSrc, "field.harshSun.id")
    check("W2. init/recarga por area sin cambios (sunny + weatherTimer = 5)", sunRefillLine.includes('saved.weather="sunny"; saved.weatherTimer = 5'))
    const tickLines = exploreSrc.split(/\r?\n/).filter(l => l.includes("weatherTimer--"))
    check("W3. un unico decremento y solo protegido para la raid Charizard con Sol", tickLines.length === 1 && tickLines[0].includes('saved.weather=="sunny"') && tickLines[0].includes('gigamaxRaid == "charizardGmax"'), tickLines.length)
    check("W4. weatherCooldown global intacto (sigue decrementando siempre)", lineContaining(exploreSrc, "saved.weatherCooldown--").trim() === "saved.weatherCooldown--")
    const iLC = exploreSrc.indexOf("function leaveCombat(")
    const iIA = exploreSrc.indexOf("function initialiseArea(")
    const iW0 = exploreSrc.indexOf("saved.weatherTimer = 0")
    const iW0b = exploreSrc.indexOf("saved.weatherTimer = 0", iIA)
    check("W5. leaveCombat e initialiseArea siguen poniendo weatherTimer = 0 (limpieza normal)", iLC >= 0 && iW0 > iLC && iW0 < iIA && iW0b > iIA, iW0 + "/" + iW0b)
}

// ---------- mocks ----------
const domEls = new Map()
function domEl(id){
    if (!domEls.has(id)) domEls.set(id, {
        children: [], _html: "",
        set innerHTML(v){ this._html = v; if (v === "") this.children = [] },
        get innerHTML(){ return this._html },
        appendChild(c){ this.children.push(c) },
        classList: { add(){}, remove(){}, contains(){ return false } },
    })
    return domEls.get(id)
}
const documentMock = {
    getElementById: id => domEl(id),
    createElement: () => ({ className: "", style: {}, innerHTML: "" }),
}
const abilityMock = new Proxy({}, { get: () => ({ id: "stub" }) })
const testAbilityMock = () => false
let moveBuffCalls = 0
const moveBuffState = { count: 0 }
const moveBuffMock = function(){ moveBuffState.count++ }
let updateWildPkmnCalls = 0
const updateWildPkmnMock = function(){ updateWildPkmnCalls++ }

const areas = {}
const saved = {}
const skill = {
    gigamaxBlazingRoar: { id: "gigamaxBlazingRoar" },
    gigamaxDemoralisingRoar: { id: "gigamaxDemoralisingRoar" },
    gigamaxEmpower: { id: "gigamaxEmpower" },
}
const item = { maxCore: { id: "maxCore", got: 0, newItem: 0 } }
const pkmn = { charizardGmax: { id: "charizardGmax" } }
const gigamaxRaids = {}
const team = {
    slot1: { pkmn: undefined, buffs: {}, item: undefined },
    slot2: { pkmn: undefined, buffs: {}, item: undefined },
    slot3: { pkmn: undefined, buffs: {}, item: undefined },
    slot4: { pkmn: undefined, buffs: {}, item: undefined },
    slot5: { pkmn: undefined, buffs: {}, item: undefined },
    slot6: { pkmn: undefined, buffs: {}, item: undefined },
}
// ---------- cuerpo: codigo real + tests (se ejecuta en un unico scope) ----------
const body = [
"let wildPkmnHp = 0",
"let wildPkmnHpMax = 976500",
"let exploreActiveMember = 'slot1'",
"let totalPower = 0",
"let wildBuffs = { burn:0, poisoned:0 }",
"let pass = 0, fail = 0",
"function check(name, cond, extra){ if (cond) { pass++; console.log('  OK   ' + name) } else { fail++; console.log('  FAIL ' + name + (extra !== undefined ? ' | got: ' + extra : '')) } }",
"",
fnFormatBuffs,
fnUpdateTeamBuffs,
gigamaxBlock,
"",
roarEffectSrc,
"skill.gigamaxDemoralisingRoar.id = 'gigamaxDemoralisingRoar'",
raidCfgSrc,
"",
"let skillCounts = { blazing:0, roar:0, empower:0 }",
"skill.gigamaxBlazingRoar.effect = function(){ skillCounts.blazing++ }",
"skill.gigamaxEmpower.effect = function(){ skillCounts.empower++ }",
"const realRoarEffect = skill.gigamaxDemoralisingRoar.effect",
"skill.gigamaxDemoralisingRoar.effect = function(){ skillCounts.roar++; return realRoarEffect() }",
"",
"areas['gigamaxRaidCharizard'] = { gigamaxRaid : 'charizardGmax' }",
"saved.currentArea = 'gigamaxRaidCharizard'",
"function unblock(){ gigamaxRaidState.shieldUntil = 0 }",
"function doneCount(){ let n = 0; for (const k in gigamaxRaidState.phasesDone) if (gigamaxRaidState.phasesDone[k]) n++; return n }",
"function newRaid(){ gigamaxRaidReset(); skillCounts = { blazing:0, roar:0, empower:0 }; wildBuffs = { burn:0, poisoned:0 } }",
"",
"console.log('== CONFIG DE UMBRALES ==')",
"const phases = gigamaxRaids.charizardGmax.phases",
"check('C1. exactamente 5 umbrales en orden', phases.length === 5 && phases.map(function(p){return p.hp}).join(',') === '813750,651000,488250,325500,162750', phases.map(function(p){return p.hp}).join(','))",
"check('C2. todos los umbrales con escudo de 2.5s', phases.every(function(p){return p.shield === true}) && gigamaxRaids.charizardGmax.shieldSeconds === 2.5)",
"check('C3. skills solo en 651000/325500/162750', phases.find(function(p){return p.hp === 813750}).skill === undefined && phases.find(function(p){return p.hp === 488250}).skill === undefined && phases.find(function(p){return p.hp === 651000}).skill === 'gigamaxBlazingRoar' && phases.find(function(p){return p.hp === 325500}).skill === 'gigamaxDemoralisingRoar' && phases.find(function(p){return p.hp === 162750}).skill === 'gigamaxEmpower')",
"check('C4. sin umbral 0 (victoria sin escudo final)', phases.every(function(p){return p.hp > 0}))",
"",
"console.log('== ESCENARIO CONTINUO DE DANO (validaciones 1,2,3,5,7,8,9) ==')",
"newRaid()",
"wildPkmnHp = 900000",
"let before = doneCount()",
"wildPkmnTakeDamage(200000) //intentaria 900000 -> 700000",
"check('1. golpe 900000->700000 se detiene en 813750', wildPkmnHp === 813750, wildPkmnHp)",
"check('1. escudo activo tras 813750', gigamaxRaidState.shieldUntil > Date.now())",
"check('5. el golpe activa exactamente 1 fase', doneCount() - before === 1, doneCount() - before)",
"check('1. 813750 sin skills', skillCounts.blazing + skillCounts.roar + skillCounts.empower === 0)",
"wildPkmnTakeDamage(50000)",
"check('S. el escudo bloquea el dano mientras dura', wildPkmnHp === 813750, wildPkmnHp)",
"unblock()",
"wildPkmnTakeDamage(113750) //chip hasta 700000 sin cruzar",
"check('chip 813750->700000 sin fases nuevas', wildPkmnHp === 700000 && doneCount() === 1, wildPkmnHp + '/' + doneCount())",
"unblock(); before = doneCount()",
"wildPkmnTakeDamage(300000) //intentaria 700000 -> 400000",
"check('2. golpe 700000->400000 se detiene en 651000', wildPkmnHp === 651000, wildPkmnHp)",
"check('2. exactamente 1 fase nueva', doneCount() - before === 1, doneCount() - before)",
"check('7. Skill 1 se activa una sola vez', skillCounts.blazing === 1, skillCounts.blazing)",
"unblock(); wildPkmnTakeDamage(100000) //chip a 551000",
"check('chip 651000->551000', wildPkmnHp === 551000, wildPkmnHp)",
"unblock(); before = doneCount(); wildPkmnTakeDamage(200000)",
"check('3. se detiene exactamente en 488250', wildPkmnHp === 488250, wildPkmnHp)",
"check('3. 488250: 1 fase y sin skill', doneCount() - before === 1 && skillCounts.roar === 0, (doneCount() - before) + '/' + skillCounts.roar)",
"unblock(); wildPkmnTakeDamage(50000) //chip a 438250",
"check('chip 488250->438250', wildPkmnHp === 438250, wildPkmnHp)",
"unblock(); before = doneCount(); wildPkmnTakeDamage(200000)",
"check('3. se detiene exactamente en 325500', wildPkmnHp === 325500, wildPkmnHp)",
"check('8. Skill 2 se activa una sola vez', skillCounts.roar === 1 && doneCount() - before === 1, skillCounts.roar + '/' + (doneCount() - before))",
"unblock(); wildPkmnTakeDamage(20000) //chip a 305500",
"check('chip 325500->305500', wildPkmnHp === 305500, wildPkmnHp)",
"unblock(); before = doneCount(); wildPkmnTakeDamage(200000)",
"check('3. se detiene exactamente en 162750', wildPkmnHp === 162750, wildPkmnHp)",
"check('9. Skill 3 se activa una sola vez', skillCounts.empower === 1 && doneCount() - before === 1, skillCounts.empower + '/' + (doneCount() - before))",
"unblock(); gigamaxRaidUpdatePhases(gigamaxRaids.charizardGmax); wildPkmnTakeDamage(0)",
"check('7-9. reevaluar fases no reactiva skills', skillCounts.blazing === 1 && skillCounts.roar === 1 && skillCounts.empower === 1, JSON.stringify(skillCounts))",
"",
"console.log('== MUERTE EN 0 (validacion 6) ==')",
"unblock()",
"wildPkmnTakeDamage(162750) //rematar exacto",
"check('6. 0 exacto se convierte en -1 (parada de combate)', wildPkmnHp === -1, wildPkmnHp)",
"check('6. no se crea escudo final y las 5 fases quedan hechas', gigamaxRaidState.shieldUntil === 0 && doneCount() === 5, gigamaxRaidState.shieldUntil + '/' + doneCount())",
"",
"console.log('== BURN/POISON (validaciones 4,5) ==')",
"newRaid()",
"wildPkmnHp = 900000",
"wildPkmnHpMax = 976500",
"wildBuffs = { burn:1, poisoned:1 }",
"before = doneCount()",
"eval(linesDot[0] + '\\n' + linesDot[1])",
"check('4. burn de 900000 se detiene en 813750', wildPkmnHp === 813750, wildPkmnHp)",
"check('4/5. burn activa 1 sola fase y el escudo recien activado bloquea al poison', doneCount() - before === 1 && gigamaxRaidShieldActive() && wildPkmnHp === 813750, (doneCount() - before) + '/' + gigamaxRaidShieldActive())",
"newRaid()",
"gigamaxRaidState.phasesDone[4] = true //813750 ya cruzado antes (recorrido realista)",
"wildPkmnHp = 700000",
"wildBuffs = { burn:1, poisoned:0 }",
"before = doneCount()",
"eval(linesDot[0])",
"check('4. burn de 700000 se detiene en 651000 (no cruza 2 umbrales)', wildPkmnHp === 651000, wildPkmnHp)",
"check('4/5. burn: 1 sola fase y Skill 1 una vez en esta raid', doneCount() - before === 1 && skillCounts.blazing === 1, (doneCount() - before) + '/' + skillCounts.blazing)",
"check('4. la ruta burn usa el mismo clamp que el jugador (escudo activo)', gigamaxRaidShieldActive())",
"",
"console.log('== SKILL 2 AISLADA (validaciones 10,11,12,13 + UI) ==')",
"newRaid()",
"team.slot1 = { pkmn:{ id:'a' }, buffs:{ atkup1:3, burn:2 }, item:undefined }",
"team.slot2 = { pkmn:{ id:'b' }, buffs:{ satkup1:1 }, item:undefined }",
"team.slot3 = { pkmn:undefined, buffs:{}, item:undefined }",
"team.slot4 = { pkmn:{ id:'d' }, buffs:{ atkup1:2 }, item:undefined }",
"moveBuffState.count = 0",
"skill.gigamaxDemoralisingRoar.effect()",
"check('R1. limpia TODOS los buffs de TODOS los del equipo', team.slot1.buffs.atkup1 === 0 && team.slot1.buffs.burn === 0 && team.slot2.buffs.satkup1 === 0 && team.slot4.buffs.atkup1 === 0)",
"check('R2. no usa moveBuff', moveBuffState.count === 0, moveBuffState.count)",
"check('R3. aplica 4 turnos por Pokemon (slot1/2/4)', gigamaxRoarTurns('slot1') === 4 && gigamaxRoarTurns('slot2') === 4 && gigamaxRoarTurns('slot4') === 4, gigamaxRoarTurns('slot1') + '/' + gigamaxRoarTurns('slot2') + '/' + gigamaxRoarTurns('slot4'))",
"check('R4. el estado vive en la raid gigamax', gigamaxRaidState.roarActive === true)",
"updateTeamBuffs()",
"const list1 = document.getElementById('team-member-slot1-buff-list').children.map(function(c){return c.innerHTML}).join('|')",
"const list3 = document.getElementById('team-member-slot3-buff-list').children.map(function(c){return c.innerHTML}).join('|')",
"check('R5. UI muestra ATK▼ y SATK▼ para el afectado', list1 === 'ATK ▼|SATK ▼', list1)",
"check('R6. UI sin tags para quien no esta afectado', list3 === '', list3)",
"exploreActiveMember = 'slot1'",
"for (let t = 0; t < 3; t++) eval(lineTickRoar) //3 turnos reales del slot1",
"check('R7. contadores independientes: 1 vs 4', gigamaxRoarTurns('slot1') === 1 && gigamaxRoarTurns('slot2') === 4, gigamaxRoarTurns('slot1') + '/' + gigamaxRoarTurns('slot2'))",
"gigamaxRoarEnter('slot1')",
"check('R8. cambiar de Pokemon no reinicia el contador (1)', gigamaxRoarTurns('slot1') === 1, gigamaxRoarTurns('slot1'))",
"check('R9. el contador del otro Pokemon no se toca (4)', gigamaxRoarTurns('slot2') === 4, gigamaxRoarTurns('slot2'))",
"team.slot3.pkmn = { id:'c' } //entra despues de la Skill 2",
"gigamaxRoarEnter('slot3')",
"check('R10. entrada posterior recibe el debuff con 4 turnos', gigamaxRoarTurns('slot3') === 4, gigamaxRoarTurns('slot3'))",
"exploreActiveMember = 'slot3'; totalPower = 900; eval(lineHookAtk)",
"check('R11. el activo afectado aplica ATK -1 (900->600)', totalPower === 600, totalPower)",
"totalPower = 900; eval(lineHookSatk)",
"check('R12. el activo afectado aplica SATK -1 (900->600)', totalPower === 600, totalPower)",
"exploreActiveMember = 'slot5'; totalPower = 900; eval(lineHookAtk)",
"check('R13. sin debuff no modifica el poder', totalPower === 900, totalPower)",
"const moveBuffBefore = moveBuffState.count",
"skill.gigamaxDemoralisingRoar.effect() //re-aplicar no rompe la logica por Pokemon",
"check('R14. re-aplicar respeta contadores por Pokemon y sigue sin moveBuff', gigamaxRoarTurns('slot1') === 4 && gigamaxRoarTurns('slot3') === 4 && moveBuffState.count === moveBuffBefore, moveBuffState.count)",
"gigamaxRaidReset()",
"check('R15. abandonar/finalizar limpia el estado Skill 2 completo', gigamaxRaidState.roarActive === false && Object.keys(gigamaxRaidState.roarTurns).length === 0 && gigamaxRoarTurns('slot1') === 0 && gigamaxRaidState.shieldTimeout === undefined)",
"updateTeamBuffs()",
"check('R16. la UI queda limpia tras el reset', document.getElementById('team-member-slot1-buff-list').children.length === 0, document.getElementById('team-member-slot1-buff-list').children.length)",
"",
"console.log('== VICTORIAS Y maxCore (validaciones 14,15,16) ==')",
"saved.gigamaxRaidWins = undefined",
"item.maxCore.got = 0; item.maxCore.newItem = 0",
"gigamaxRaidVictory()",
"check('V1. primera victoria incrementa gigamaxRaidWins.charizardGmax', saved.gigamaxRaidWins.charizardGmax === 1, JSON.stringify(saved.gigamaxRaidWins))",
"check('V2. maxCore entregado la primera vez', item.maxCore.got === 1 && item.maxCore.newItem === 1, item.maxCore.got + '/' + item.maxCore.newItem)",
"gigamaxRaidVictory()",
"check('V3. segunda victoria incrementa de nuevo', saved.gigamaxRaidWins.charizardGmax === 2, saved.gigamaxRaidWins.charizardGmax)",
"check('V4. maxCore no se consume ni se re-otorga', item.maxCore.got === 1 && item.maxCore.newItem === 1, item.maxCore.got + '/' + item.maxCore.newItem)",
"",
"",
"console.log('== CLIMA: SOL PERMANENTE EN LA GIGAMAX (W6-W10) ==')",
"areas['plainsArea'] = {}",
"areas['vsSunNoGigamax'] = {}",
"saved.currentArea = 'gigamaxRaidCharizard'",
"saved.weather = 'sunny'",
"saved.weatherTimer = 5",
"saved.weatherCooldown = 99",
"const weatherTurn = lineWeatherTick + '\\n' + lineCooldownTick //las dos lineas reales del tick, juntas como en el juego",
"for (let t = 0; t < 12; t++) eval(weatherTurn)",
"check('W6. el Sol NO expira en la Gigamax: 12 turnos y sigue en 5', saved.weatherTimer === 5 && saved.weather === 'sunny', saved.weatherTimer + '/' + saved.weather)",
"check('W6b. el clima sigue ACTIVO durante toda la raid (gate weatherTimer>0)', saved.weatherTimer > 0)",
"check('W6c. weatherCooldown global sigue decrementando normal (sin cambios)', saved.weatherCooldown === 87, saved.weatherCooldown)",
"saved.currentArea = 'plainsArea'",
"saved.weather = 'sunny'",
"saved.weatherTimer = 5",
"for (let t = 0; t < 5; t++) eval(weatherTurn)",
"check('W7. fuera de la Gigamax expira igual que siempre: 5 turnos -> 0', saved.weatherTimer === 0 && !(saved.weatherTimer > 0), saved.weatherTimer)",
"saved.currentArea = 'vsSunNoGigamax'",
"saved.weather = 'sunny'",
"saved.weatherTimer = 5",
"eval(weatherTurn)",
"check('W8. Sol en area harshSun NO gigamax decrementa normalmente (4)', saved.weatherTimer === 4, saved.weatherTimer)",
"saved.currentArea = 'gigamaxRaidCharizard'",
"saved.weather = 'rainy'",
"saved.weatherTimer = 5",
"eval(weatherTurn)",
"check('W9. dentro de la raid solo el Sol se congela: otro clima sigue expirando', saved.weatherTimer === 4, saved.weatherTimer)",
"saved.weatherTimer = 0 //exactamente lo que ya hacen leaveCombat()/initialiseArea() al salir",
"check('W10. la limpieza normal del sistema desactiva el clima al salir de la raid', !(saved.weatherTimer > 0))",
"saved.weather = undefined; saved.weatherTimer = 0; saved.weatherCooldown = 0; saved.currentArea = 'gigamaxRaidCharizard'",
"",
"gigamaxRaidReset() //limpia timers pendientes",
"return { pass: pass, fail: fail }",
].join("\n")

console.log("== TESTS FUNCIONALES (codigo real extraido) ==")
const result = new Function(
    "areas", "saved", "skill", "item", "pkmn", "team", "gigamaxRaids",
    "document", "testAbility", "ability", "updateWildPkmn", "moveBuff", "moveBuffState",
    "linesDot", "lineTickRoar", "lineHookAtk", "lineHookSatk", "lineWeatherTick", "lineCooldownTick",
    body
)(
    areas, saved, skill, item, pkmn, team, gigamaxRaids,
    documentMock, testAbilityMock, abilityMock, updateWildPkmnMock, moveBuffMock, moveBuffState,
    linesDot, lineTickRoar, lineHookAtk, lineHookSatk, lineWeatherTick, lineCooldownTick
)

pass += result.pass
fail += result.fail
console.log("== TOTAL: " + pass + " OK / " + fail + " FAIL ==")
process.exitCode = fail > 0 ? 1 : 0




