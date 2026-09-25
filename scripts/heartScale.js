//--Multi Heart Scale (native QoL): native single-move remember extracted verbatim, multi-select reuses it
function applySingleHeartScale(pkmnId, moveId){
                pkmn[pkmnId].movepool.push(moveId)
                item.heartScale.got--
}

function heartScaleRememberableMoves(pkmnId){
    let rememberable = []

    if (pkmn[pkmnId].movepoolMemory == undefined) return rememberable

    for (const e of pkmn[pkmnId].movepoolMemory){

        //native filter: only moves that arent known yet, no duplicates
        if (pkmn[pkmnId].movepool.includes(e)) continue
        if (rememberable.includes(e)) continue

        rememberable.push(e)

    }

    return rememberable
}

function useHeartScales(pkmnId, remember){
    //one heart scale per remembered move, same as the native single use
    let quantity = Math.min(remember.length, item.heartScale.got)

    for (let n = 0; n < quantity; n++){
        applySingleHeartScale(pkmnId, remember[n])
    }

    closeTooltip()
    updateItemBag()
    exitTmTeaching()
}

function openHeartScaleMenu(pkmnId){
    let rememberable = heartScaleRememberableMoves(pkmnId)
    let remember = []

    document.getElementById("tooltipTop").style.display = "none"
    document.getElementById("tooltipTitle").innerHTML = `Select move to remember`
    document.getElementById("tooltipMid").innerHTML = `
                <div id="remember-movelist"></div>
                `
    document.getElementById("tooltipBottom").style.display = "inline"
    document.getElementById("tooltipBottom").innerHTML = `
                <div id="heart-scale-remember" class="remember-move">Select a move</div>
                `

    if (rememberable.length == 0){
        document.getElementById("tooltipMid").innerHTML = `
                No new moves to remember
                `
        document.getElementById("tooltipBottom").style.display = "none"
        openTooltip()
        return
    }

    for (const e of rememberable){

        const movediv = document.createElement(`div`)
        movediv.innerHTML = format(e)
        movediv.className = `remember-move`
        movediv.style.borderColor = returnTypeColor(move[e].type)
        movediv.dataset.move = e
        document.getElementById(`remember-movelist`).appendChild(movediv)

        //native list item, now it toggles the selection instead of spending a heart scale right away
        movediv.addEventListener("click", event => {

            if (remember.includes(e)) remember = remember.filter(a => a !== e)
            else remember.push(e)

            updateHeartScaleMenu(remember)

        })

    }

    document.getElementById("heart-scale-remember").addEventListener("click", event => {

        if (remember.length == 0) return
        if (remember.length > item.heartScale.got) return

        useHeartScales(pkmnId, remember)

    })

    openTooltip()
    updateHeartScaleMenu(remember)
}

function updateHeartScaleMenu(remember){
    const rememberDiv = document.getElementById("heart-scale-remember")

    document.querySelectorAll("#remember-movelist .remember-move").forEach(div => {

        if (remember.includes(div.dataset.move)){
            div.style.background = `var(--light2)`
            div.style.color = `var(--dark1)`
        } else {
            div.style.background = ``
            div.style.color = ``
        }

    })

    if (remember.length == 0){
        rememberDiv.innerHTML = `Select a move`
        rememberDiv.style.opacity = `0.5`
        return
    }

    //more moves selected than heart scales owned: nothing gets spent
    if (remember.length > item.heartScale.got){
        rememberDiv.innerHTML = `Not enough Heart Scales (${item.heartScale.got} left)`
        rememberDiv.style.opacity = `0.5`
        return
    }

    rememberDiv.innerHTML = `Remember ${remember.length} move${remember.length == 1 ? `` : `s`} (${remember.length} Heart Scale${remember.length == 1 ? `` : `s`})`
    rememberDiv.style.opacity = ``
}
