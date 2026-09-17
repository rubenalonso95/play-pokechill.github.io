// Harness puntual para el filtro Pokerus (se borra al terminar).
// Replica la lógica exacta añadida a updatePokedex(): la línea de filtro,
// el reset, y el comportamiento con "all".
const fs = require("fs")
const vm = require("vm")

const pokemons = {
  a: { id: "a", type: ["fire"], pokerus: true },
  b: { id: "b", type: ["fire"], pokerus: undefined },
  c: { id: "c", type: ["fire"], pokerus: false },
}

// Simula el select
const selectValues = { "pokedex-filter-pokerus": "all" }
const elements = {
  "pokedex-menu": { style: { display: "flex" } },
  "pokedex-filters-title": { style: {}, innerHTML: "" },
  "pokedex-filters-cancel": { style: {} },
  "pokedex-filters-remove": { style: {} },
  "pokedex-list": { innerHTML: "" },
  "pokedex-filter-pokerus": { get value() { return selectValues["pokedex-filter-pokerus"] }, set value(v) { selectValues["pokedex-filter-pokerus"] = v } },
}

let updatePokedexCalls = 0
const document = {
  getElementById: (id) => {
    if (!elements[id]) elements[id] = { style: {}, value: "all" }
    return elements[id]
  },
  addEventListener: () => {},
  querySelectorAll: () => [],
}
const ctx = { document, pkmn: pokemons, console, updatePokedexCalls, tagSystemTagSearch: [] }
ctx.resetPokedexFilters = function resetPokedexFilters() {
  ctx.tagSystemTagSearch = []
  document.getElementById("pokedex-search").value = ""
  document.getElementById("pokedex-filter-type").value = "all"
  document.getElementById("pokedex-filter-type-2").value = "all"
  document.getElementById("pokedex-filter-level").value = "all"
  document.getElementById("pokedex-filter-division").value = "all"
  document.getElementById("pokedex-filter-evolution").value = "all"
  document.getElementById("pokedex-filter-ability").value = "all"
  document.getElementById("pokedex-filter-shiny").value = "all"
  document.getElementById("pokedex-filter-signature").value = "all"
  document.getElementById("pokedex-filter-ribbon").value = "all"
  document.getElementById("pokedex-filter-pokerus").value = "all"
}
ctx.updatePokedex = function updatePokedex() {
  ctx.updatePokedexCalls++
  const out = []
  for (const i in ctx.pkmn) {
    // ── línea añadida (idéntica a explore.js) ──
    if (document.getElementById(`pokedex-filter-pokerus`).value == "true" && ctx.pkmn[i].pokerus != true) continue
    out.push(i)
  }
  ctx.lastResult = out
}
vm.createContext(ctx)

// Carga solo el listener añadido desde explore.js real (verifica su existencia)
const code = fs.readFileSync("scripts/explore.js", "utf8")
if (!code.includes('pokedex-filter-pokerus").addEventListener')) throw new Error("listener NOT found in explore.js")
if (!code.includes('pokedex-filter-pokerus`).value == "true" && pkmn[i].pokerus != true) continue')) throw new Error("filter line NOT found in explore.js")
if (!code.includes('pokedex-filter-pokerus").value = "all"')) throw new Error("reset line NOT found in explore.js")
console.log("PASS  las 3 líneas existen en explore.js real (listener + filtro + reset)")

let failures = 0
const check = (n, c) => { if (c) console.log("PASS  " + n); else { console.log("FAIL  " + n); failures++ } }

// 1. ALL → sin filtrar (comportamiento anterior intacto)
ctx.updatePokedex()
check("all → muestra los 3 (comportamiento base intacto)", JSON.stringify(ctx.lastResult) === '["a","b","c"]')

// 2. has pokerus → solo los que tienen pokerus === true
selectValues["pokedex-filter-pokerus"] = "true"
ctx.updatePokedex()
check("'has pokerus' → solo 'a' (pokerus===true)", JSON.stringify(ctx.lastResult) === '["a"]')

// 3. Reset → vuelve a all
ctx.resetPokedexFilters()
check("resetPokedexFilters → pokerus vuelve a 'all'", selectValues["pokedex-filter-pokerus"] === "all")
ctx.updatePokedex()
check("tras reset → muestra los 3 otra vez", JSON.stringify(ctx.lastResult) === '["a","b","c"]')

// 4. undefined y false NO cuentan como pokerus (pokerus != true)
selectValues["pokedex-filter-pokerus"] = "true"
ctx.updatePokedex()
check("undefined/false excluidos (pokerus != true)", !ctx.lastResult.includes("b") && !ctx.lastResult.includes("c"))

// 5. valor del select por defecto en HTML
const html = fs.readFileSync("index.html", "utf8")
check("index.html: select con primera opción value=all (default)", /<select id="pokedex-filter-pokerus">\s*<option value="all">pokerus<\/option>\s*<option value=true>has pokerus<\/option>\s*<\/select>/.test(html))
const ahtml = fs.readFileSync("android/app/src/main/assets/pokechill/index.html", "utf8")
check("Android index.html: mismo bloque presente", ahtml.includes('id="pokedex-filter-pokerus"'))

console.log(failures === 0 ? "\nALL POKERUS TESTS PASSED" : `\n${failures} FAILED`)
process.exit(failures ? 1 : 0)
