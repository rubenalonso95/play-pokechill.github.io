function applySingleRareCandy(pkmnId, applyPokedex = true){
                pkmn[pkmnId].level++
                let learntMove = learnPkmnMove(pkmn[pkmnId].id, pkmn[pkmnId].level)
                if (learntMove != undefined) {
                if (pkmn[ pkmnId ].level % 7 === 0) pkmn[ pkmnId ].movepool.push(learntMove)
        //this really should be a function huh
        if (pkmn[ pkmnId ].evolve && pkmn[pkmnId].evolve()[1].level>0){ // if it evolves by level up
        if (pkmn[ pkmnId ].level >= pkmn[pkmnId].evolve()[1].level && pkmn[ pkmn[pkmnId].evolve()[1].pkmn.id ].caught===0) {
        inheritPermanentSkills(pkmnId, pkmn[pkmnId].evolve()[1].pkmn.id); givePkmn(pkmn[ pkmn[pkmnId].evolve()[1].pkmn.id ],1)
        if (pkmn[pkmnId].shiny === true) pkmn[pkmn[pkmnId].evolve()[1].pkmn.id].shiny = true
        }
        }
                }
                item.rareCandy.got--
                if (applyPokedex) updatePokedex()
                return true
}

function bulkCandyMaxUse(pkmnId){
    return Math.min(item.rareCandy.got, 100 - pkmn[pkmnId].level)
}

function useBulkCandy(pkmnId, amount){
    let quantity = Math.min(Math.max(1, Math.floor(Number(amount) || 1)), item.rareCandy.got, 100 - pkmn[pkmnId].level)
    for (let n = 0; n < quantity; n++){
        if (pkmn[pkmnId].level >= 100) break
        applySingleRareCandy(pkmnId, false)
    }
    updatePokedex()
    closeTooltip()
    if (item.rareCandy.got<=0){
        updateItemBag()
        exitTmTeaching()
    }
}

function openBulkCandyMenu(pkmnId){
    let maxUse = bulkCandyMaxUse(pkmnId)
    if (maxUse <= 0) return
    let options = [1, 10, 25, 50, maxUse].map(a => Math.min(a, maxUse)).filter((a, idx, arr) => a > 0 && arr.indexOf(a) === idx)
    document.getElementById("tooltipTop").style.display = "none"
    document.getElementById("tooltipTitle").innerHTML = `Rare Candy`
    document.getElementById("tooltipMid").innerHTML = `
                <div><strong>${format(pkmnId)}</strong></div>
                <div>Level ${pkmn[pkmnId].level} &rarr; ${Math.min(100, pkmn[pkmnId].level + maxUse)} &middot; Rare Candy: x${item.rareCandy.got}</div>
                `
    document.getElementById("tooltipBottom").innerHTML = `
                <div id="remember-movelist"></div>
                <span id="prevent-tooltip-exit"></span>
                `
    for (const amount of options){
        const label = amount === maxUse ? `Max x${amount}` : `x${amount}`
        const movediv = document.createElement(`div`)
        movediv.innerHTML = label
        movediv.className = `remember-move`
        movediv.addEventListener("click", event => {
            useBulkCandy(pkmnId, amount)
        })
        document.getElementById(`remember-movelist`).appendChild(movediv)
    }
    openTooltip()
}
