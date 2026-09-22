// Regression tests for the favorite Pokemon feature (web phase only).
// Run with: node _fav_test.js
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const root = __dirname
const read = file => fs.readFileSync(path.join(root, file), 'utf8').replace(/\r\n/g, '\n')
const explore = read('scripts/explore.js')
const save = read('scripts/save.js')
const tooltip = read('scripts/tooltip.js')
const html = read('index.html')
const dictionary = read('scripts/pkmnDictionary.js')

// Slice the real declarations out of the sources instead of duplicating them.
const favoriteBlock = explore.slice(
    explore.indexOf('// Favorite heart icon (Material Design'),
    explore.indexOf('const starsign = {'))
const saveGameSource = save.slice(save.indexOf('function saveGame()'), save.indexOf('// ---- CARGAR ----'))
const loadGameSource = save.slice(save.indexOf('function loadGame()'), save.indexOf('function exportData()'))

const storage = new Map()
const newContext = pkmn => {
    const ctx = {
        saved: { firstTimePlaying: false }, team: {}, item: {}, shop: {}, areas: {}, pkmn,
        localStorage: { setItem: (k, v) => storage.set(k, v), getItem: k => storage.has(k) ? storage.get(k) : null },
        unlockPermanentSkill: () => {},
    }
    vm.createContext(ctx)
    vm.runInContext(saveGameSource, ctx)
    vm.runInContext(loadGameSource, ctx)
    return ctx
}
const newEditorContext = pkmn => {
    const dom = { favoriteSwitch: { outerHTML: 'none' }, inDom: true }
    const ctx = {
        pkmn, currentEditedPkmn: 'pikachu',
        saves: 0, pokedexUpdates: 0,
        returnTypeColor: () => '#EF90E6',
        saveGame: () => { ctx.saves++ },
        updatePokedex: () => { ctx.pokedexUpdates++ },
        document: { getElementById: id => id == 'pkmn-favorite-switch' && dom.inDom ? dom.favoriteSwitch : null },
    }
    vm.createContext(ctx)
    vm.runInContext(favoriteBlock, ctx)
    ctx.dom = dom
    return ctx
}

let passed = 0
function test(name, fn) { fn(); passed++; console.log('PASS ' + name) }

// ── model ─────────────────────────────────────────────────────────────────────
test('pkmnDictionary: favorite is initialised to false in the base model', () => {
    const initLoop = dictionary.slice(dictionary.indexOf('for (const i in pkmn){'), dictionary.indexOf('for (const name in pkmn) {'))
    assert.match(initLoop, /\n\s+pkmn\[i\]\.favorite = false\n/)
    assert.match(initLoop, /pkmn\[i\]\.caught = 0/)
    assert.match(initLoop, /pkmn\[i\]\.permanentSkills = \[\]/)
})

// ── save / load ───────────────────────────────────────────────────────────────
test('saveGame: favorite saved inside the Pokemon loop', () => {
    assert.match(saveGameSource, /\n\s+data\[i\]\.favorite = pkmn\[i\]\.favorite;\n/)
})

test('loadGame: favorite restored and normalised to boolean', () => {
    assert.match(loadGameSource, /\n\s+pkmn\[i\]\.favorite = data\[i\]\.favorite == true;\n/)
})

test('real saveGame/loadGame round trip keeps favorite per Pokemon', () => {
    const ctx = newContext({ a: { id: 'a', favorite: true }, b: { id: 'b', favorite: false }, c: { id: 'c' } })
    ctx.saveGame()
    const stored = JSON.parse(storage.get('gameData'))
    assert.equal(stored.a.favorite, true)
    assert.equal(stored.b.favorite, false)

    // fresh session: model default is false, loadGame must bring the saved values back
    ctx.pkmn.a.favorite = false
    ctx.pkmn.b.favorite = true
    ctx.loadGame()
    assert.equal(ctx.pkmn.a.favorite, true)
    assert.equal(ctx.pkmn.b.favorite, false)
})

test('old save without favorite loads without errors and means not favorite', () => {
    const ctx = newContext({ a: { id: 'a', favorite: true }, b: { id: 'b' }, c: { id: 'c', favorite: false }, d: { id: 'd', favorite: false } })
    ctx.saveGame()

    // legacy savefile: same entries, no favorite key at all
    const legacy = JSON.parse(storage.get('gameData'))
    for (const id of ['a', 'b', 'c']) delete legacy[id].favorite
    delete legacy.d
    storage.set('gameData', JSON.stringify(legacy))

    ctx.loadGame()
    assert.equal(ctx.pkmn.a.favorite, false)
    assert.equal(ctx.pkmn.b.favorite, false)
    assert.equal(ctx.pkmn.c.favorite, false)
    // Pokemon missing from the savefile keep the model value untouched
    assert.equal(ctx.pkmn.d.favorite, false)
})

// ── editor button ─────────────────────────────────────────────────────────────
test('tooltip.js: heart button rendered on top of #pkmn-edit-buttons', () => {
    const base = tooltip.indexOf('document.getElementById("pkmn-edit-buttons").innerHTML = `')
    const heart = tooltip.indexOf('${pkmnFavoriteButton()}')
    const dictionaryButton = tooltip.indexOf('id="pkmn-edit-dictionary"')
    assert.ok(base >= 0 && heart >= 0 && dictionaryButton >= 0)
    assert.ok(base < heart && heart < dictionaryButton)
    // the existing buttons are untouched
    for (const marker of ['onclick="renamePokemon()"', 'onclick="switchShiny()"', 'onclick="changePkmnStarsign(); openTooltip()"', 'onclick="openDecor()"', "tooltipData('dictionaryPkmn', currentEditedPkmn)"]) {
        assert.ok(tooltip.includes(marker), marker + ' missing')
    }
})

test('heart button reflects favorite right away when the editor opens', () => {
    const ctx = newEditorContext({ pikachu: { id: 'pikachu' }, eevee: { id: 'eevee', favorite: true } })

    // not favorite → empty heart, no colour override
    const empty = vm.runInContext('pkmnFavoriteButton()', ctx)
    assert.match(empty, /id="pkmn-favorite-switch"/)
    assert.match(empty, /onclick="togglePkmnFavorite\(\)"/)
    assert.match(empty, /stroke-width="1.5"/)
    assert.ok(!empty.includes('color:#EF90E6'))

    // already favorite → filled heart highlighted with the fairy colour
    ctx.currentEditedPkmn = 'eevee'
    const filled = vm.runInContext('pkmnFavoriteButton()', ctx)
    assert.match(filled, /fill="currentColor"/)
    assert.match(filled, /color:#EF90E6/)
    assert.ok(!filled.includes('stroke-width'))

    // no editor open: icon still renders, no crash
    ctx.currentEditedPkmn = undefined
    assert.match(vm.runInContext('pkmnFavoriteButton()', ctx), /stroke-width="1.5"/)
})

test('togglePkmnFavorite flips the state, repaints the button and saves', () => {
    const ctx = newEditorContext({ pikachu: { id: 'pikachu' }, eevee: { id: 'eevee', favorite: true } })

    // undefined → true (anything but true means not favorite)
    ctx.togglePkmnFavorite()
    assert.equal(ctx.pkmn.pikachu.favorite, true)
    assert.equal(ctx.saves, 1)
    assert.equal(ctx.pokedexUpdates, 1)
    assert.match(ctx.dom.favoriteSwitch.outerHTML, /color:#EF90E6/)
    assert.ok(!ctx.dom.favoriteSwitch.outerHTML.includes('stroke-width'))

    // true → false
    ctx.togglePkmnFavorite()
    assert.equal(ctx.pkmn.pikachu.favorite, false)
    assert.equal(ctx.saves, 2)
    assert.equal(ctx.pokedexUpdates, 2)
    assert.match(ctx.dom.favoriteSwitch.outerHTML, /stroke-width="1.5"/)
    assert.ok(!ctx.dom.favoriteSwitch.outerHTML.includes('color:#EF90E6'))

    // false → true again; other Pokemon untouched
    ctx.togglePkmnFavorite()
    assert.equal(ctx.pkmn.pikachu.favorite, true)
    assert.equal(ctx.pkmn.eevee.favorite, true)

    // button not in the DOM (editor closed): still toggles, never crashes
    ctx.dom.inDom = false
    ctx.togglePkmnFavorite()
    assert.equal(ctx.pkmn.pikachu.favorite, false)
    assert.equal(ctx.saves, 4)
})

test('Pokedex name marks show the heart of every favorite', () => {
    assert.match(explore, /if \(pkmn\[i\]\.favorite==true\) nameMarks \+= `<strong style="color:\$\{returnTypeColor\("fairy"\)\};[\s\S]{0,80}?\$\{returnPkmnFavoriteIcon\(true, 14\)\}<\/strong>`/)
    // existing marks untouched
    assert.match(explore, /if \(pkmn\[i\]\.shiny\) nameMarks \+= `<strong style="color:\$\{markColor\}; margin-left:0\.2rem">✦<\/strong>`/)
    assert.match(explore, /if \(pkmn\[i\]\.pokerus==true\) nameMarks \+= `<strong style="color:\$\{returnTypeColor\("poison"\)\}/)
})

// ── Pokedex filter ────────────────────────────────────────────────────────────
test('index.html: filter select follows the pokerus structure (all / favorites)', () => {
    assert.match(html, /<select id="pokedex-filter-favorite">\s*<option value="all">favorite<\/option>\s*<option value=true>favorites<\/option>\s*<\/select>/)
    // the other filters are untouched
    for (const id of ['pokedex-filter-type', 'pokedex-filter-type-2', 'pokedex-filter-level', 'pokedex-filter-division', 'pokedex-filter-evolution', 'pokedex-filter-ability', 'pokedex-filter-shiny', 'pokedex-filter-signature', 'pokedex-filter-ribbon', 'pokedex-filter-pokerus', 'pokedex-sort-filter']) {
        assert.ok(html.includes(`id="${id}"`), id + ' missing')
    }
})

test('explore.js: listener + reset + filter condition present', () => {
    assert.match(explore, /document\.getElementById\("pokedex-filter-favorite"\)\.addEventListener\("change", e => \{\n\s+updatePokedex\(\)\n\}\);/)
    const reset = explore.slice(explore.indexOf('function resetPokedexFilters(){'), explore.indexOf('document.getElementById("pokedex-sort-filter")'))
    assert.match(reset, /document\.getElementById\("pokedex-filter-favorite"\)\.value = "all";/)
    assert.match(reset, /document\.getElementById\("pokedex-filter-pokerus"\)\.value = "all";/)
    // inserted right after the pokerus filter inside updatePokedex
    const indent = '        '
    const pokerusLine = 'if (document.getElementById(`pokedex-filter-pokerus`).value == "true" && pkmn[i].pokerus != true) continue'
    const favoriteLine = 'if (document.getElementById(`pokedex-filter-favorite`).value == "true" && pkmn[i].favorite != true) continue'
    assert.ok(explore.includes(indent + pokerusLine + '\n' + indent + favoriteLine), 'favorite filter is not right after the pokerus filter')
    // the other filter conditions are untouched
    assert.match(explore, /pokedex-filter-shiny`\)\.value == "true" && pkmn\[i\]\.shiny != true\) continue/)
    assert.match(explore, /pokedex-filter-ribbon`\)\.value !== "all" && pkmn\[i\]\.ribbons==undefined \) continue/)
})

test('favorite filter keeps every non favorite out (same semantics as pokerus)', () => {
    const selectValues = { 'pokedex-filter-favorite': 'all' }
    const pkmn = {
        a: { id: 'a', favorite: true },
        b: { id: 'b', favorite: false },
        c: { id: 'c' },
        d: { id: 'd' },
    }
    const document = { getElementById: () => ({ get value() { return selectValues['pokedex-filter-favorite'] } }) }
    const run = filter => {
        selectValues['pokedex-filter-favorite'] = filter
        const out = []
        for (const i in pkmn) {
            // real line taken from updatePokedex()
            if (document.getElementById(`pokedex-filter-favorite`).value == "true" && pkmn[i].favorite != true) continue
            out.push(i)
        }
        return out
    }
    assert.deepEqual(run('all'), ['a', 'b', 'c', 'd'])
    assert.deepEqual(run('true'), ['a'])
    assert.ok(!run('true').includes('b'), 'favorite=false is not a favorite')
    assert.ok(!run('true').includes('c'), 'missing favorite is not a favorite')

    // the comparison is intentionally loose, exactly like the pokerus filter:
    // loadGame normalises favorite to boolean, so "1" only shows up on live objects
    pkmn.d.favorite = 1
    assert.deepEqual(run('true'), ['a', 'd'])
    pkmn.d.favorite = "true"
    assert.deepEqual(run('true'), ['a'])
})

console.log('\n' + passed + ' favorite tests passed')



