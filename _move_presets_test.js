// Run with Node; exercises the actual native preset operations and save/load code.
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const assert = require('node:assert/strict')
const root = __dirname
const tooltip = fs.readFileSync(path.join(root, 'scripts/tooltip.js'), 'utf8').replace(/\r\n/g, '\n')
const save = fs.readFileSync(path.join(root, 'scripts/save.js'), 'utf8')
const clone = value => JSON.parse(JSON.stringify(value))
const slots = ['slot1', 'slot2', 'slot3', 'slot4']
const moves = ids => Object.fromEntries(slots.map((slot, i) => [slot, ids[i]]))
const storage = new Map()
const ctx = vm.createContext({
    saved: {}, team: {}, item: {}, shop: {},
    areas: { training: { id: 'training' }, frontierBattleFactory: { id: 'factory' }, gym: { trainer: true }, wild: {} },
    pkmn: {
        source: { moves: moves(['a', 'b', 'c', 'd']), movepool: ['a', 'b', 'c', 'd'] },
        compatible: { moves: moves(['d', 'c', 'b', 'a']), movepool: ['d', 'c', 'b', 'a'] },
        partial: { moves: moves(['e', 'a']), movepool: ['a', 'e'] }
    },
    move: { a: { power: 10 }, b: { power: 20 }, c: { power: 30 }, d: { power: 40 }, e: { power: 50 }, r: { power: 60, restricted: true } },
    localStorage: { setItem: (k, v) => storage.set(k, v), getItem: k => storage.get(k) }
})
vm.runInContext(tooltip.split('// End native move preset operations.')[0], ctx)
// Only declarations for the real persistence functions, not save.js startup UI.
vm.runInContext(save.slice(0, save.indexOf('function exportData()')), ctx)
ctx.saved.firstTimePlaying = false
let passed = 0
function test(name, fn) { fn(); passed++; console.log('PASS ' + name) }
const legal = id => Object.values(ctx.pkmn[id].moves).every(m => m === undefined || ctx.pkmn[id].movepool.includes(m))

test('old save without movePresets loads automatically', () => {
    storage.set('gameData', JSON.stringify({ saved: { firstTimePlaying: false } }))
    ctx.loadGame()
    assert.deepEqual(clone(ctx.saved.movePresets), {})
})
test('create named presets from slot1-slot4; no editor mutation', () => {
    const before = clone(ctx.pkmn)
    assert.equal(ctx.createMovePreset(' One ', 'source'), true)
    assert.equal(ctx.createMovePreset('Two', 'compatible'), true)
    assert.deepEqual(clone(ctx.saved.movePresets.source.One), ['a', 'b', 'c', 'd'])
    assert.deepEqual(clone(ctx.pkmn), before)
    // the same name on another Pokemon is a different preset, not a duplicate
    assert.equal(ctx.createMovePreset('One', 'partial'), true)
    assert.deepEqual(clone(ctx.saved.movePresets.partial.One), ['e', 'a', null, null])
    assert.equal(ctx.createMovePreset('One', 'source'), false)
    assert.equal(ctx.createMovePreset(' ', 'partial'), false)
})
test('real saveGame/loadGame round trip', () => {
    ctx.saveGame()
    ctx.saved.movePresets = {}
    ctx.loadGame()
    assert.deepEqual(clone(ctx.saved.movePresets.source.One), ['a', 'b', 'c', 'd'])
    assert.deepEqual(clone(ctx.saved.movePresets.compatible.Two), ['d', 'c', 'b', 'a'])
    assert.equal(Object.keys(ctx.saved.movePresets).length, 3)
})
test('apply same Pokemon', () => {
    const before = clone(ctx.pkmn.source.moves)
    assert.equal(ctx.applyMovePreset('One', 'source'), '')
    assert.deepEqual(clone(ctx.pkmn.source.moves), before)
})
test('presets are per Pokemon: foreign presets are not listed or applicable', () => {
    assert.equal(ctx.applyMovePreset('One', 'compatible'), 'Invalid preset or Pokemon')
    assert.deepEqual(clone(ctx.pkmn.compatible.moves), moves(['d', 'c', 'b', 'a']))
    assert.deepEqual(Object.keys(ctx.saved.movePresets.source), ['One'])
    assert.deepEqual(Object.keys(ctx.saved.movePresets.compatible), ['Two'])
    assert.deepEqual(Object.keys(ctx.getMovePresets('compatible')), ['Two'])
    assert.equal(ctx.deleteMovePreset('One', 'compatible'), false)
    assert.equal(ctx.renameMovePreset('One', 'X', 'compatible'), false)
    assert.deepEqual(Object.keys(ctx.saved.movePresets.source), ['One'])
})
test('incompatible moves omitted; native legal fallback; four slot keys', () => {
    ctx.saved.movePresets.partial = { One: ['a', 'b', 'c', 'd'] }
    assert.equal(ctx.applyMovePreset('One', 'partial'), '')
    assert.deepEqual(Object.values(ctx.pkmn.partial.moves), ['a', 'e', undefined, undefined])
    assert.deepEqual(Object.keys(ctx.pkmn.partial.moves), slots)
    assert.ok(legal('partial'))
})
test('no illegal assignment over every subset of a five-move pool', () => {
    for (let mask = 0; mask < 32; mask++) {
        const pool = ['a', 'b', 'c', 'd', 'e'].filter((_, i) => mask & (1 << i))
        ctx.pkmn.target = { movepool: pool, moves: moves([]) }
        ctx.saved.movePresets.target = { Mixed: ['illegal', 'a', 'a', 'd'] }
        assert.equal(ctx.applyMovePreset('Mixed', 'target'), '')
        assert.ok(legal('target'))
        const assigned = Object.values(ctx.pkmn.target.moves).filter(id => id !== undefined)
        assert.equal(new Set(assigned).size, assigned.length)
    }
})
test('battle restrictions remain atomic', () => {
    ctx.saved.currentArea = 'gym'
    ctx.pkmn.compatible.battling = true
    // current moves must differ from the preset, otherwise there is nothing to switch
    ctx.pkmn.compatible.moves = moves(['a', 'b', 'c', 'd'])
    const before = clone(ctx.pkmn.compatible.moves)
    assert.notEqual(ctx.applyMovePreset('Two', 'compatible'), '')
    assert.deepEqual(clone(ctx.pkmn.compatible.moves), before)
    ctx.saved.currentArea = 'wild'
    ctx.pkmn.compatible.movepool.push('r')
    ctx.saved.movePresets.compatible.Restricted = ['r', 'a', 'b', 'c']
    assert.notEqual(ctx.applyMovePreset('Restricted', 'compatible'), '')
    assert.deepEqual(clone(ctx.pkmn.compatible.moves), before)
})
test('rename persists and rejects duplicate names', () => {
    assert.equal(ctx.createMovePreset('Two', 'source'), true)
    assert.equal(ctx.renameMovePreset('One', 'Renamed', 'source'), true)
    assert.equal(ctx.renameMovePreset('Renamed', 'Two', 'source'), false)
    ctx.loadGame()
    assert.ok(ctx.saved.movePresets.source.Renamed)
    assert.equal(ctx.saved.movePresets.source.One, undefined)
})
test('delete persists', () => {
    assert.equal(ctx.deleteMovePreset('Renamed', 'source'), true)
    ctx.loadGame()
    assert.equal(ctx.saved.movePresets.source.Renamed, undefined)
    assert.equal(ctx.deleteMovePreset('Renamed', 'source'), false)
})
test('special names are safe own properties', () => {
    assert.equal(ctx.createMovePreset('__proto__', 'source'), true)
    ctx.loadGame()
    assert.ok(Object.prototype.hasOwnProperty.call(ctx.saved.movePresets.source, '__proto__'))
    assert.equal(ctx.deleteMovePreset('__proto__', 'source'), true)
})
test('editor controls: opening does not change moves; save/apply/rename/delete', () => {
    const select = { options: [], value: '', replaceChildren() { this.options = []; this.value = '' }, appendChild(option) { this.options.push(option); if (this.options.length === 1) this.value = option.value } }
    const input = { value: '' }
    const status = { textContent: '' }
    const buttons = [{}, {}, {}, {}]
    const elements = {
        'pkmn-editor-current-moves': { innerHTML: '', before() {} },
        'pkmn-editor-movepool': { innerHTML: '' },
        'explore-team': { innerHTML: '' }
    }
    let redraws = 0
    ctx.document = {
        getElementById: id => elements[id] || null,
        createElement: tag => tag === 'option' ? {} : {
            querySelector: query => query === 'select' ? select : query === 'input' ? input : status,
            querySelectorAll: () => buttons
        }
    }
    ctx.ttdata = 'source'
    ctx.updateMoves = ctx.updateMovepool = ctx.setPkmnTeam = () => { redraws++ }
    const before = clone(ctx.pkmn.source.moves)
    const start = tooltip.indexOf('    // Recreate controls for the currently opened Pokemon;')
    const end = tooltip.indexOf('    refreshMovePresets()\n', tooltip.indexOf('    presetRename.onclick', start))
    assert.ok(start >= 0 && end > start)
    vm.runInContext(tooltip.slice(start, end + '    refreshMovePresets()\n'.length), ctx)
    assert.deepEqual(clone(ctx.pkmn.source.moves), before)
    assert.equal(redraws, 0)
    input.value = 'UI preset'
    buttons[0].onclick()
    assert.ok(ctx.saved.movePresets.source['UI preset'])
    ctx.pkmn.source.moves = moves(['d', 'c', 'b', 'a'])
    buttons[1].onclick()
    assert.deepEqual(clone(ctx.pkmn.source.moves), before)
    assert.equal(redraws, 3)
    input.value = 'UI renamed'
    buttons[3].onclick()
    assert.ok(ctx.saved.movePresets.source['UI renamed'])
    buttons[2].onclick()
    assert.equal(ctx.saved.movePresets.source['UI renamed'], undefined)
})
test('legacy global presets are migrated once and preserved, never shown per Pokemon', () => {
    storage.set('gameData', JSON.stringify({ saved: { firstTimePlaying: false, movePresets: { Legacy: ['a', 'b', 'c', 'd'] } } }))
    ctx.loadGame()
    // old save still loads: shape guard accepts the flat legacy map
    assert.deepEqual(clone(ctx.saved.movePresets), { Legacy: ['a', 'b', 'c', 'd'] })
    // first per-Pokemon access performs the one-time migration
    assert.deepEqual(Object.keys(ctx.getMovePresets('source')), [])
    assert.deepEqual(clone(ctx.saved.movePresets), {})
    assert.deepEqual(clone(ctx.saved.movePresetsLegacy), { Legacy: ['a', 'b', 'c', 'd'] })
    // legacy presets are not visible nor applicable anywhere
    assert.equal(ctx.applyMovePreset('Legacy', 'source'), 'Invalid preset or Pokemon')
    assert.equal(ctx.deleteMovePreset('Legacy', 'source'), false)
    assert.equal(ctx.renameMovePreset('Legacy', 'Other', 'source'), false)
    // migration is idempotent and survives a save/load round trip
    assert.deepEqual(Object.keys(ctx.getMovePresets('compatible')), [])
    ctx.saveGame()
    ctx.loadGame()
    assert.deepEqual(clone(ctx.saved.movePresetsLegacy), { Legacy: ['a', 'b', 'c', 'd'] })
    assert.deepEqual(clone(ctx.saved.movePresets), {})
})
console.log(`${passed} tests passed`)
