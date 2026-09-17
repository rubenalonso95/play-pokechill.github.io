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
    assert.deepEqual(clone(ctx.saved.movePresets.One), ['a', 'b', 'c', 'd'])
    assert.deepEqual(clone(ctx.pkmn), before)
    assert.equal(ctx.createMovePreset('One', 'partial'), false)
    assert.equal(ctx.createMovePreset(' ', 'partial'), false)
})
test('real saveGame/loadGame round trip', () => {
    ctx.saveGame()
    ctx.saved.movePresets = {}
    ctx.loadGame()
    assert.deepEqual(clone(ctx.saved.movePresets.One), ['a', 'b', 'c', 'd'])
    assert.equal(Object.keys(ctx.saved.movePresets).length, 2)
})
test('apply same Pokemon', () => {
    const before = clone(ctx.pkmn.source.moves)
    assert.equal(ctx.applyMovePreset('One', 'source'), '')
    assert.deepEqual(clone(ctx.pkmn.source.moves), before)
})
test('apply compatible Pokemon', () => {
    assert.equal(ctx.applyMovePreset('One', 'compatible'), '')
    assert.deepEqual(clone(ctx.pkmn.compatible.moves), clone(ctx.pkmn.source.moves))
})
test('incompatible moves omitted; native legal fallback; four slot keys', () => {
    assert.equal(ctx.applyMovePreset('One', 'partial'), '')
    assert.deepEqual(Object.values(ctx.pkmn.partial.moves), ['a', 'e', undefined, undefined])
    assert.deepEqual(Object.keys(ctx.pkmn.partial.moves), slots)
    assert.ok(legal('partial'))
})
test('no illegal assignment over every subset of a five-move pool', () => {
    for (let mask = 0; mask < 32; mask++) {
        const pool = ['a', 'b', 'c', 'd', 'e'].filter((_, i) => mask & (1 << i))
        ctx.pkmn.target = { movepool: pool, moves: moves([]) }
        ctx.saved.movePresets.Mixed = ['illegal', 'a', 'a', 'd']
        assert.equal(ctx.applyMovePreset('Mixed', 'target'), '')
        assert.ok(legal('target'))
        const assigned = Object.values(ctx.pkmn.target.moves).filter(id => id !== undefined)
        assert.equal(new Set(assigned).size, assigned.length)
    }
})
test('battle restrictions remain atomic', () => {
    ctx.saved.currentArea = 'gym'
    ctx.pkmn.compatible.battling = true
    const before = clone(ctx.pkmn.compatible.moves)
    assert.notEqual(ctx.applyMovePreset('Two', 'compatible'), '')
    assert.deepEqual(clone(ctx.pkmn.compatible.moves), before)
    ctx.saved.currentArea = 'wild'
    ctx.pkmn.compatible.movepool.push('r')
    ctx.saved.movePresets.Restricted = ['r', 'a', 'b', 'c']
    assert.notEqual(ctx.applyMovePreset('Restricted', 'compatible'), '')
    assert.deepEqual(clone(ctx.pkmn.compatible.moves), before)
})
test('rename persists and rejects duplicate names', () => {
    assert.equal(ctx.renameMovePreset('One', 'Renamed'), true)
    assert.equal(ctx.renameMovePreset('Renamed', 'Two'), false)
    ctx.loadGame()
    assert.ok(ctx.saved.movePresets.Renamed)
    assert.equal(ctx.saved.movePresets.One, undefined)
})
test('delete persists', () => {
    assert.equal(ctx.deleteMovePreset('Renamed'), true)
    ctx.loadGame()
    assert.equal(ctx.saved.movePresets.Renamed, undefined)
    assert.equal(ctx.deleteMovePreset('Renamed'), false)
})
test('special names are safe own properties', () => {
    assert.equal(ctx.createMovePreset('__proto__', 'source'), true)
    ctx.loadGame()
    assert.ok(Object.prototype.hasOwnProperty.call(ctx.saved.movePresets, '__proto__'))
    assert.equal(ctx.deleteMovePreset('__proto__'), true)
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
    assert.ok(ctx.saved.movePresets['UI preset'])
    ctx.pkmn.source.moves = moves(['d', 'c', 'b', 'a'])
    buttons[1].onclick()
    assert.deepEqual(clone(ctx.pkmn.source.moves), before)
    assert.equal(redraws, 3)
    input.value = 'UI renamed'
    buttons[3].onclick()
    assert.ok(ctx.saved.movePresets['UI renamed'])
    buttons[2].onclick()
    assert.equal(ctx.saved.movePresets['UI renamed'], undefined)
})
console.log(`${passed} tests passed`)
