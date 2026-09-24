
    document.getElementById("training-sprite-div").addEventListener("click", e => {

        document.getElementById(`pokedex-menu`).style.display = "flex"
        document.getElementById(`pokedex-menu`).style.zIndex = "200"

        dexTrainSelect = true

        updatePokedex()

    })


const training = {}

training.level = {
    name: `Level Training`,
    info: `Fully max a Pokemon's level. Can only be done with less than Level 100`,
    tier: 2,
    color: `#dfc969`,
    errorText: `Defeat Elite Trainer Cynthia in VS mode to unlock, or alread max level reached`,
    condition: function() { if (pkmn[saved.trainingPokemon].level<100 && areas.vsEliteTrainerCynthia.defeated == true) return true },
    effect: function() {

        

        for (let i = 0; i < 101; i++) {
        if (pkmn[saved.trainingPokemon].level >= 100) continue
        pkmn[saved.trainingPokemon].level++

        let learntMove = learnPkmnMove(pkmn[saved.trainingPokemon].id, pkmn[saved.trainingPokemon].level)
        if (learntMove != undefined) {
        if (pkmn[ saved.trainingPokemon ].level % 7 === 0) pkmn[ saved.trainingPokemon ].movepool.push(learntMove)

        }
        }


        //this really should be a function huh 2.0
        if (pkmn[ saved.trainingPokemon ].evolve && pkmn[saved.trainingPokemon].evolve()[1].level>0){ // if it evolves by level up
        if (pkmn[ saved.trainingPokemon ].level >= pkmn[saved.trainingPokemon].evolve()[1].level && pkmn[ pkmn[saved.trainingPokemon].evolve()[1].pkmn.id ].caught===0) {
        inheritPermanentSkills(saved.trainingPokemon, pkmn[saved.trainingPokemon].evolve()[1].pkmn.id); givePkmn(pkmn[ pkmn[saved.trainingPokemon].evolve()[1].pkmn.id ],1)
        if (pkmn[saved.trainingPokemon].shiny === true) pkmn[pkmn[saved.trainingPokemon].evolve()[1].pkmn.id].shiny = true
        } 
        }



        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = `${format(saved.trainingPokemon)} is now level ${pkmn[saved.trainingPokemon].level}!`
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.iv1 = { //disapears if you have more than x ivs
    name: `IV Training I`,
    info: `Gain 2 random IV stars. Can only be done with less than 10 IV stars`,
    tier: 1,
    color: `#699edf`,
    condition: function() {
        const id = pkmn[saved.trainingPokemon]
        const totalSum = id.ivs.hp + id.ivs.atk + id.ivs.satk + id.ivs.def + id.ivs.sdef + id.ivs.spe
        if (totalSum<10) return true
    },
    errorText: `You must have less than 10 IV stars, or alread max IVs reached`,
    effect: function() {
        
    const i = saved.trainingPokemon
    const cap = 2
    const stats = Object.keys(pkmn[i].ivs);
    const increases = {};
    let points = 2;

    while (points > 0) {
        const available = stats.filter(
            s =>
                pkmn[i].ivs[s] < 6 &&
                (increases[s] || 0) < cap
        );

        if (available.length === 0) break;

        const stat = available[Math.floor(Math.random() * available.length)];

        pkmn[i].ivs[stat]++;
        increases[stat] = (increases[stat] || 0) + 1;
        points--;
    }

    const parts = Object.entries(increases).map(
        ([stat, n]) => `${stat} ${n} point${n > 1 ? "s" : ""}`
    );

    let text = `Increased ${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}!`
    if (parts.length === 1) text = `Increased ${parts[0]}!`;
    pkmn[i].dictionaryTagIvSum = pkmn[i].ivs.hp + pkmn[i].ivs.atk + pkmn[i].ivs.satk + pkmn[i].ivs.spe + pkmn[i].ivs.sdef + pkmn[i].ivs.def

        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = text
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.iv2 = { //doesnt appear until you have more than x ivs
    name: `IV Training II`,
    info: `Gain 2 random IV stars. Can only be done with less than 22 IV stars`,
    tier: 2,
    color: `#699edf`,
    condition: function() {
        const id = pkmn[saved.trainingPokemon]
        const totalSum = id.ivs.hp + id.ivs.atk + id.ivs.satk + id.ivs.def + id.ivs.sdef + id.ivs.spe
        if (totalSum<22) return true
    },
    errorText: `You must have less than 22 IV stars, or alread max IVs reached`,
    effect: function() {
        
    const i = saved.trainingPokemon
    const cap = 4
    const stats = Object.keys(pkmn[i].ivs);
    const increases = {};
    let points = 2;

    while (points > 0) {
        const available = stats.filter(
            s =>
                pkmn[i].ivs[s] < 6 &&
                (increases[s] || 0) < cap
        );

        if (available.length === 0) break;

        const stat = available[Math.floor(Math.random() * available.length)];

        pkmn[i].ivs[stat]++;
        increases[stat] = (increases[stat] || 0) + 1;
        points--;
    }

    const parts = Object.entries(increases).map(
        ([stat, n]) => `${stat} ${n} point${n > 1 ? "s" : ""}`
    );

    let text = `Increased ${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}!`
    if (parts.length === 1) text = `Increased ${parts[0]}!`;
    pkmn[i].dictionaryTagIvSum = pkmn[i].ivs.hp + pkmn[i].ivs.atk + pkmn[i].ivs.satk + pkmn[i].ivs.spe + pkmn[i].ivs.sdef + pkmn[i].ivs.def

        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = text
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.iv3 = { //doesnt appear until you have more than x ivs
    name: `IV Training III`,
    info: `Gain 2 random IV stars`,
    tier: 3,
    color: `#699edf`,
    condition: function() {
        const id = pkmn[saved.trainingPokemon]
        const totalSum = id.ivs.hp + id.ivs.atk + id.ivs.satk + id.ivs.def + id.ivs.sdef + id.ivs.spe
        if (totalSum<36) return true
    },
    errorText: `You already have the maximum possible IVs`,
    effect: function() {
        
    const i = saved.trainingPokemon
    const cap = 6
    const stats = Object.keys(pkmn[i].ivs);
    const increases = {};
    let points = 2;

    while (points > 0) {
        const available = stats.filter(
            s =>
                pkmn[i].ivs[s] < 6 &&
                (increases[s] || 0) < cap
        );

        if (available.length === 0) break;

        const stat = available[Math.floor(Math.random() * available.length)];

        pkmn[i].ivs[stat]++;
        increases[stat] = (increases[stat] || 0) + 1;
        points--;
    }

    const parts = Object.entries(increases).map(
        ([stat, n]) => `${stat} ${n} point${n > 1 ? "s" : ""}`
    );

    let text = `Increased ${parts.slice(0, -1).join(", ")} and ${parts.at(-1)}!`
    if (parts.length === 1) text = `Increased ${parts[0]}!`;
    pkmn[i].dictionaryTagIvSum = pkmn[i].ivs.hp + pkmn[i].ivs.atk + pkmn[i].ivs.satk + pkmn[i].ivs.spe + pkmn[i].ivs.sdef + pkmn[i].ivs.def

        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = text
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.ability = {
    name: `Ability Training`,
    info: `Rerolls the Pokemon Ability`,
    tier: 1,
    color: `#69df96`,
    effect: function() {
        const pityTarget = (saved.pendingAbilityTarget && saved.pendingAbilityTarget.pkmn == saved.trainingPokemon) ? saved.pendingAbilityTarget.abilityId : undefined
        const newAbility = (pityTarget != undefined) ? pickAbilityWithTargetPity(saved.trainingPokemon, pityTarget) : learnPkmnAbility(saved.trainingPokemon)
        setPkmnAbility(saved.trainingPokemon, newAbility)

        if (
            saved.pendingAbilityTarget &&
            saved.pendingAbilityTarget.pkmn == saved.trainingPokemon &&
            newAbility == saved.pendingAbilityTarget.abilityId
        ) {
            saved.autoRefight = false
            saved.pendingAbilityTarget = undefined
            resetAbilityPity()
        } else if (pityTarget != undefined) {
            abilityPityFails++
        }

        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = `${format(saved.trainingPokemon)} now has ${format(newAbility)}!`
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.hiddenAbility = {
    name: `Hidden Ability Training`,
    info: `Unlocks the Pokemon Hidden Ability`,
    tier: 2,
    color: `#69df96`,
    condition: function() { if (pkmn[saved.trainingPokemon].hiddenAbility && pkmn[saved.trainingPokemon].hiddenAbilityUnlocked!=true) return true },
    errorText: `You already unlocked the Pokemon hidden ability`,
    effect: function() {
        pkmn[saved.trainingPokemon].hiddenAbilityUnlocked = true

        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = `${format(saved.trainingPokemon)} now has ${format(pkmn[saved.trainingPokemon].hiddenAbility.id)}!`
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.move = { //disapears if you have 20+ moves or smth
    name: `Move Training`,
    info: `Learn a new Pokemon Move. Can only be done with less than 20 moves, or when a new move is available`,
    tier: 1,
    color: `#cf79c1`,
    condition: function() { if (learnPkmnMove(pkmn[saved.trainingPokemon].id, pkmn[saved.trainingPokemon].level)!=undefined && pkmn[saved.trainingPokemon].movepool.length<20) return true },
    errorText: `You already learnt more than 20 moves, or there is no more learnable moves at this level`,
    effect: function() {
        let learntMove = learnPkmnMove(pkmn[saved.trainingPokemon].id, pkmn[saved.trainingPokemon].level)

        pkmn[saved.trainingPokemon].movepool.push(learntMove)

        setTimeout(() => {
        const div = document.createElement("span");
        div.innerHTML = `${format(saved.trainingPokemon)} learnt ${format(learntMove)}!`
        document.getElementById("area-end-moves-title").appendChild(div);
        document.getElementById("area-end-moves-title").style.display = "flex"
        document.getElementById("area-end-item-title").style.display = "none"
        }, 10);

    }
}

training.nature = {
    name: `Nature Training`,
    info: `Grants a chosen nature, which modifies BST Stars: <br><br>Adamant: Atk ▲, S.Atk ▼<br>Modest: S.Atk ▲, Atk ▼<br>Jolly: Spe ▲, Def ▼, S.Def ▼<br>Relaxed: HP ▲, Spe ▼<br>Quiet: HP ▲, Atk ▼, S.Atk ▼<br>Bold: Def ▲, S.Def ▲, HP ▼<br><br>Any nature except the Pokemon's current one can be chosen`,
    tier: 3,
    color: `#DF7A69`,
    condition: function() { if (areas.vsLegendTrainerBrendan.defeated == true) return true },
    errorText: `Defeat Legend Trainer Brendan in VS mode to unlock`,
    effect: function() {
        

        //every Pokemon can freely choose any nature, except the one it already has
        const natureList = ["adamant", "modest", "jolly", "relaxed", "quiet", "bold", "serious"]
        .filter(e => pkmn[saved.trainingPokemon].nature != e)

        //degenerate native case (no valid nature) keeps the original instant behaviour
        if (natureList.length == 0) {
            let pickedNature = arrayPick(natureList)
            pkmn[saved.trainingPokemon].nature = pickedNature

            setTimeout(() => {
            const div = document.createElement("span");
            div.innerHTML = `${format(saved.trainingPokemon)} now has a ${format(pickedNature)} nature!`
            document.getElementById("area-end-moves-title").appendChild(div);
            document.getElementById("area-end-moves-title").style.display = "flex"
            document.getElementById("area-end-item-title").style.display = "none"
            }, 10);
            return
        }

        //instead of a random roll, the player picks one of the valid natures
        saved.pendingNatureChoice = { pkmn: saved.trainingPokemon, options: natureList.slice() }

    }
}

function openNatureChoiceMenu() {
    const pending = saved.pendingNatureChoice
    if (pending == undefined || !Array.isArray(pending.options)) return
    if (pkmn[pending.pkmn] == undefined) { saved.pendingNatureChoice = undefined; return }

    document.getElementById("tooltipTop").style.display = "none"
    document.getElementById("tooltipTitle").innerHTML = `Select a nature for ${format(pending.pkmn)}`
    document.getElementById("tooltipMid").innerHTML = `
                <div id="nature-choicelist"></div>
                `
    document.getElementById("tooltipBottom").style.display = "none"

    const statNames = { hp: `HP`, atk: `Atk`, def: `Def`, satk: `S.Atk`, sdef: `S.Def`, spe: `Spe` }

    for (const e of pending.options) {
        if (nature[e] == undefined) continue

        const up = Object.keys(nature[e]).filter(s => nature[e][s] > 0).map(s => statNames[s]).join(", ")
        const down = Object.keys(nature[e]).filter(s => nature[e][s] < 0).map(s => statNames[s]).join(", ")

        const naturediv = document.createElement(`div`)
        naturediv.className = `remember-move`
        naturediv.style.flexDirection = `column`
        naturediv.style.height = `auto`
        naturediv.style.padding = `0.35rem 0`
        if (up == "" && down == "") naturediv.innerHTML = `<b style="display:block">${format(e)}</b><span style="display:block">Sin cambios de stats</span>`
        else naturediv.innerHTML = `<b style="display:block">${format(e)}</b><div style="display:flex; gap:0.3rem; white-space:nowrap"><span style="color:#29A1E5">↑ ${up}</span><span style="color:#DF7A69">↓ ${down}</span></div>`
        naturediv.dataset.nature = e
        document.getElementById(`nature-choicelist`).appendChild(naturediv)

        naturediv.addEventListener("click", event => {
            applyNatureChoice(e)
        })
    }

    openTooltip()
}

function applyNatureChoice(pickedNature) {
    const pending = saved.pendingNatureChoice
    if (pending == undefined || !Array.isArray(pending.options)) return
    if (pkmn[pending.pkmn] == undefined || nature[pickedNature] == undefined) return
    if (!pending.options.includes(pickedNature)) return

    const trainedId = pending.pkmn
    pkmn[trainedId].nature = pickedNature
    saved.pendingNatureChoice = undefined

    closeTooltip()
    saveGame()

    //native completion message, same as the original random flow
    const div = document.createElement("span");
    div.innerHTML = `${format(trainedId)} now has a ${format(pickedNature)} nature!`
    document.getElementById("area-end-moves-title").appendChild(div);
    document.getElementById("area-end-moves-title").style.display = "flex"
    document.getElementById("area-end-item-title").style.display = "none"

    
    setTrainingMenu()
}

//--Ability Training target (Phase 2): selectable abilities reuse the same type
//--compatibility filter as learnPkmnAbility(), without duplicating its probabilities
function getTrainableAbilityPool(pkmnId) {
    if (pkmn[pkmnId] == undefined) return []
    const types = pkmn[pkmnId].type
    const hiddenId = pkmn[pkmnId].hiddenAbility?.id
    return Object.keys(ability).filter(a => {
        const ab = ability[a]
        if (ab.type == undefined) return false
        if (a == hiddenId) return false
        if (a == pkmn[pkmnId].ability) return false
        return ab.type.includes("all") || ab.type.some(t => types.includes(t))
    })
}

function getSelectableAbilityTargets(pkmnId) {
    if (pkmn[pkmnId] == undefined) return []
    const unlocked = Array.isArray(pkmn[pkmnId].permanentSkills) ? pkmn[pkmnId].permanentSkills : []
    return getTrainableAbilityPool(pkmnId).filter(a => !unlocked.includes(a))
}

function normalisePendingAbilityTarget() {
    const t = saved.pendingAbilityTarget
    if (t == undefined) return
    if (typeof t !== "object" || Array.isArray(t) || typeof t.pkmn !== "string" || typeof t.abilityId !== "string") { saved.pendingAbilityTarget = undefined; return }
    if (pkmn[t.pkmn] == undefined || ability[t.abilityId] == undefined) { saved.pendingAbilityTarget = undefined; return }
    if (t.pkmn != saved.trainingPokemon) { saved.pendingAbilityTarget = undefined; return }
    if (!getTrainableAbilityPool(t.pkmn).includes(t.abilityId)) { saved.pendingAbilityTarget = undefined; return }
}

function clearPendingAbilityTarget() {
    if (saved.pendingAbilityTarget == undefined) return
    saved.pendingAbilityTarget = undefined
    saveGame()
}

let abilityPityFails = 0
let abilityPityKey = undefined

function abilityPityKeyFor(pkmnId, abilityId) {
    return pkmnId + "|" + abilityId
}

function resetAbilityPity() {
    abilityPityFails = 0
    abilityPityKey = undefined
}

function syncAbilityPity(pkmnId, targetId) {
    const key = abilityPityKeyFor(pkmnId, targetId)
    if (abilityPityKey != key) {
        abilityPityFails = 0
        abilityPityKey = key
    }
}

function getAbilityPoolByTierForPity(pkmnId, tier) {
    if (pkmn[pkmnId] == undefined) return []
    const types = pkmn[pkmnId].type
    const hiddenId = pkmn[pkmnId].hiddenAbility?.id
    return Object.keys(ability).filter(a => {
        const ab = ability[a]
        if (ab.rarity !== tier) return false
        if (ab.type == undefined) return false
        if (a == hiddenId) return false
        if (a == pkmn[pkmnId].ability) return false
        return ab.type.includes("all") || ab.type.some(t => types.includes(t))
    })
}

function pickAbilityWithTargetPity(pkmnId, targetId) {
    syncAbilityPity(pkmnId, targetId)
    const fails = abilityPityFails
    const pools = [getAbilityPoolByTierForPity(pkmnId, 1), getAbilityPoolByTierForPity(pkmnId, 2), getAbilityPoolByTierForPity(pkmnId, 3)]
    const tierMassBase = [0.752, 0.188, 0.060]
    //tiers vacios: su masa se redistribuye proporcionalmente entre los tiers no vacios
    //(misma probabilidad condicional que el two-stage original dado que el tier elegido tenga pool)
    let liveMass = 0
    for (let t = 0; t < 3; t++) if (pools[t].length > 0) liveMass += tierMassBase[t]
    const entries = []
    if (liveMass > 0) {
        for (let t = 0; t < 3; t++) {
            if (pools[t].length == 0) continue
            const w = (tierMassBase[t] / liveMass) / pools[t].length
            for (const a of pools[t]) entries.push({ id: a, base: w })
        }
    }
    if (entries.length == 0) return learnPkmnAbility(pkmnId)
    if (entries.length == 1) {
        return entries[0].id
    }
    const targetEntry = entries.find(e => e.id == targetId)
    if (targetEntry == undefined) return learnPkmnAbility(pkmnId)
    const baseTarget = targetEntry.base
    if (baseTarget >= 1) {
        return targetId
    }
    const bonus = fails * 0.002
    let newTarget = baseTarget + bonus
    if (newTarget >= 1) {
        return targetId
    }
    if (newTarget < 0) newTarget = 0
    const scale = (1 - newTarget) / (1 - baseTarget)
    let roll = Math.random()
    for (const e of entries) {
        const w = (e.id == targetId) ? newTarget : e.base * scale
        if (w <= 0) continue
        roll -= w
        if (roll < 0) return e.id
    }
    return targetId
}

function startTrainingModule(trainKey, trainDiv) {
    if (training[trainKey].condition && training[trainKey].condition()!=true) return
    if (trainKey != "ability") { saved.pendingAbilityTarget = undefined; resetAbilityPity() }
    areas.training.tier = training[trainKey].tier
    areas.training.currentTraining = trainKey
    afkSeconds = 0
    document.getElementById(`explore-menu`).style.display = `none`

    if (trainDiv) trainDiv.style.pointerEvents = "none"


    for ( const slot in team){
    team[slot].pkmn = undefined
    team[slot].item = undefined
    }

    team.slot1.pkmn = pkmn[saved.trainingPokemon]


    voidAnimation(`explore-transition`, `exploreTransition 1s 1`)
    document.getElementById(`explore-transition`).style.display = `flex`


    setTimeout(() => {
        saved.currentArea = areas.training.id
        saved.lastAreaJoined = areas.training.id
        document.getElementById("content-explore").style.display = "flex"
        document.getElementById(`training-menu`).style.display = `none`;
        initialiseArea()
    }, 500);
}

function openAbilityTargetMenu(trainKey, trainDiv) {
    if (trainKey == undefined) trainKey = "ability"
    if (saved.trainingPokemon == undefined || pkmn[saved.trainingPokemon] == undefined) return
    const options = getSelectableAbilityTargets(saved.trainingPokemon)
    if (options.length == 0) { startTrainingModule(trainKey, trainDiv); return }

    document.getElementById("tooltipTop").style.display = "none"
    document.getElementById("tooltipTitle").innerHTML = `Select a target ability for ${format(saved.trainingPokemon)}`
    document.getElementById("tooltipMid").innerHTML = `
                <div id="ability-target-choicelist"></div>
                `
    document.getElementById("tooltipBottom").style.display = "none"

    for (const e of options) {
        if (ability[e] == undefined) continue

        const abilitydiv = document.createElement(`div`)
        abilitydiv.className = `remember-move`
        abilitydiv.style.flexDirection = `column`
        abilitydiv.style.height = `auto`
        abilitydiv.style.padding = `0.35rem 0`
        if (ability[e].rarity == 2) abilitydiv.classList.add("ability-uncommon")
        if (ability[e].rarity == 3) abilitydiv.classList.add("ability-rare")
        abilitydiv.innerHTML = `<b style="display:block">${format(e)}</b>`
        abilitydiv.dataset.ability = e
        document.getElementById(`ability-target-choicelist`).appendChild(abilitydiv)

        abilitydiv.addEventListener("click", event => {
            applyAbilityTarget(e, trainKey, trainDiv)
        })
    }

    openTooltip()
}

function applyAbilityTarget(pickedAbility, trainKey, trainDiv) {
    if (trainKey == undefined) trainKey = "ability"
    if (saved.trainingPokemon == undefined || pkmn[saved.trainingPokemon] == undefined) return
    if (ability[pickedAbility] == undefined) return
    if (!getSelectableAbilityTargets(saved.trainingPokemon).includes(pickedAbility)) return

    saved.pendingAbilityTarget = { pkmn: saved.trainingPokemon, abilityId: pickedAbility }
    abilityPityFails = 0
    abilityPityKey = abilityPityKeyFor(saved.trainingPokemon, pickedAbility)

    closeTooltip()
    saveGame()
    saved.autoRefight = true

    if (trainDiv == undefined) trainDiv = document.querySelector('[data-training="ability"]')
    startTrainingModule(trainKey, trainDiv)
}

function setTrainingMenu() {

    //a pending nature choice (completion interrupted) reopens its selector
    if (saved.pendingNatureChoice != undefined) openNatureChoiceMenu()





    if (saved.trainingPokemon != undefined) {
        document.getElementById("training-sprite-div").innerHTML = `<img class="sprite-trim" style="z-index: 1; transform-origin: bottom; margin-top: auto; position: absolute; bottom: 0rem;" id="training-host" src="img/pkmn/sprite/${saved.trainingPokemon}.png">`
        if (pkmn[saved.trainingPokemon].shiny) {document.getElementById("training-host").src = `img/pkmn/shiny/${saved.trainingPokemon}.png`;}
        if (pkmn[saved.trainingPokemon].starsign){
        document.getElementById("training-host").style.filter = `hue-rotate(${starsign[pkmn[saved.trainingPokemon].starsign].hue}deg)`
        }

        voidAnimation("training-sack", "train-sack 1.5s infinite")
    } else {
        document.getElementById("training-sprite-div").innerHTML = `<svg style="color:white; scale:2; opacity:0.8; margin-bottom:-2rem;" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><defs><mask id="SVGjidSMeWm"><g fill="none" stroke="#fff" stroke-linejoin="round" stroke-width="4"><path fill="#555555" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path stroke-linecap="round" d="M24 16v16m-8-8h16"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#SVGjidSMeWm)"/></svg>`
        voidAnimation("training-sack", "none")
    }




    if (saved.trainingPokemon!==undefined) {document.getElementById("training-sprite-div").dataset.pkmnEditor = saved.trainingPokemon} else {delete document.getElementById("training-sprite-div").dataset.pkmnEditor;}

    document.getElementById("training-list").innerHTML = ""
    
    function returnStars(n,color) {
        if (color!=undefined){
            if (color==1) return -80
            if (color==2) return 0
            if (color==3) return 150
            if (color==4) return 100
            if (color==5) return 50
        }
        return '★'.repeat(n);
    }


    for (const i in training){

    if (saved.trainingPokemon==undefined) continue

    const div = document.createElement("div");
    div.className = "training-module";
    div.style.borderColor = training[i].color
    div.dataset.training = i
    if (training[i].condition && training[i].condition()!=true) div.style.filter = "brightness(0.5)"

    div.innerHTML = `
    <span>${training[i].name}</span>
    <strong style="outline-color: ${training[i].color}; color: ${training[i].color}" >Difficulty: ${returnStars(training[i].tier)}</strong>
    `
    div.style.pointerEvents = "initial"


    document.getElementById("training-list").appendChild(div);




    div.addEventListener("click", e => { 


    if (training[i].condition && training[i].condition()!=true && training[i].errorText) {
        document.getElementById("tooltipTop").style.display = "none"
        document.getElementById("tooltipBottom").style.display = "none"
        document.getElementById("tooltipTitle").style.display = "none"
        document.getElementById("tooltipMid").innerHTML = `${training[i].errorText}`
        openTooltip()
        return
    }





        let restrictedError = false
        let restricedActive = 0

    for (const activeMoves in pkmn[saved.trainingPokemon].moves) {
        if (pkmn[saved.trainingPokemon].moves[activeMoves] == undefined) continue
        if (move[pkmn[saved.trainingPokemon].moves[activeMoves]].restricted) restricedActive++
    }

    if (restricedActive>1) restrictedError = true
    

    const restrictedIcon = `<svg style="color:${returnTypeColor("normal")}; margin: -0.3rem 0rem" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12.832 21.801c3.126-.626 7.168-2.875 7.168-8.69c0-5.291-3.873-8.815-6.658-10.434c-.619-.36-1.342.113-1.342.828v1.828c0 1.442-.606 4.074-2.29 5.169c-.86.559-1.79-.278-1.894-1.298l-.086-.838c-.1-.974-1.092-1.565-1.87-.971C4.461 8.46 3 10.33 3 13.11C3 20.221 8.289 22 10.933 22q.232 0 .484-.015c.446-.056 0 .099 1.415-.185" opacity="0.5"/><path fill="currentColor" d="M8 18.444c0 2.62 2.111 3.43 3.417 3.542c.446-.056 0 .099 1.415-.185C13.871 21.434 15 20.492 15 18.444c0-1.297-.819-2.098-1.46-2.473c-.196-.115-.424.03-.441.256c-.056.718-.746 1.29-1.215.744c-.415-.482-.59-1.187-.59-1.638v-.59c0-.354-.357-.59-.663-.408C9.495 15.008 8 16.395 8 18.445"/></svg>`

    if (restrictedError) {
        document.getElementById("tooltipTop").style.display = "none"
        document.getElementById("tooltipBottom").style.display = "none"
        document.getElementById("tooltipTitle").innerHTML = `Restricted Moves`
        document.getElementById("tooltipMid").innerHTML = `The training Pokemon has multiple restricted moves (${restrictedIcon}) equipped!`
        openTooltip()
        return
    }





        if (i == "ability") { openAbilityTargetMenu(i, div); return }
        startTrainingModule(i, div);

    })
        
    }




}

setTrainingMenu()
