// Regression tests for the four native evolution call sites. Run with node _se_test.js.
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { execFileSync } = require('node:child_process')

const root = __dirname
const source = fs.readFileSync(path.join(root, 'scripts/explore.js'), 'utf8')
const android = fs.readFileSync(path.join(root, 'android/app/src/main/assets/pokechill/scripts/explore.js'))
assert.deepEqual(android, fs.readFileSync(path.join(root, 'scripts/explore.js')))
const routes = [
  ['EXP', 'pkmn[team[i].pkmn.id]', '1'],
  ['Evolution item / Mega stone', 'pkmn[i]', 'evo'],
  ['Rare Candy', 'pkmn[i]', '1'],
  ['Level Training', 'pkmn[saved.trainingPokemon]', '1'],
]
const lines = source.split(/\r?\n/)
const snippets = []
for (const [name, origin, branch] of routes) {
  const inheritance = `if (${origin}.shiny === true) pkmn[${origin}.evolve()[${branch}].pkmn.id].shiny = true`
  const matches = lines.map((line, index) => line.trim() === inheritance ? index : -1).filter(index => index >= 0)
  assert.equal(matches.length, 1, name)
  const index = matches[0]
  assert.match(lines[index - 1], /givePkmn\(/)
  snippets.push([name, lines.slice(index - 1, index + 1).join('\n')])
}

let cases = 0
for (const [name, snippet] of snippets) {
  const targets = name.includes('Mega') ? ['evolution', 'megaVenusaur'] : ['evolution']
  for (const id of targets) {
    for (const shiny of [true, false, undefined, 1]) {
      for (const existingShiny of [true, false, undefined]) {
        for (const roll of [true, false]) {
          for (const disabled of [true, false, undefined]) {
            const target = { id, shiny: existingShiny, shinyDisabled: disabled, caught: 0 }
            const origin = { id: 'origin', shiny, shinyDisabled: true, evolve: () => ({ 1: { pkmn: target } }) }
            let calls = 0
            const context = {
              pkmn: { origin, [id]: target }, i: 'origin', evo: 1,
              team: { origin: { pkmn: origin } }, saved: { trainingPokemon: 'origin' },
              // Model givePkmn's existing positive-only independent shiny roll.
              givePkmn(pokemon, level) {
                assert.equal(pokemon, target)
                assert.equal(level, 1)
                calls++
                pokemon.caught++
                if (roll) pokemon.shiny = true
              },
            }
            vm.runInNewContext(snippet, context)
            assert.equal(calls, 1)
            assert.equal(target.caught, 1)
            assert.equal(target.shiny, shiny === true || roll ? true : existingShiny)
            assert.equal(target.shinyDisabled, disabled)
            assert.equal(origin.shiny, shiny)
            assert.equal(origin.shinyDisabled, true)
            cases++
          }
        }
      }
    }
  }
  console.log('PASS ' + name)
}

// Scope regression: removing exactly the four additions reproduces HEAD.
// This also proves givePkmn, switchShiny, eligibility, rewards and timers are untouched.
const baseline = execFileSync('git', ['show', 'HEAD:scripts/explore.js'], { cwd: root, encoding: 'utf8' }).replace(/\r\n/g, '\n')
const stripped = lines.filter(line => !/^\s*if \(pkmn\[.*\.shiny === true\) pkmn\[.*\.shiny = true$/.test(line)).join('\n')
assert.equal(stripped, baseline)
console.log(`PASS ${cases} cases; only four inheritance lines added; Web/Android byte-identical`)
