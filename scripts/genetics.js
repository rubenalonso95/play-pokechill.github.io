saved.geneticHost = undefined;
saved.geneticSample = undefined;
saved.geneticOperation = undefined;
saved.geneticOperationTotal = undefined;




    document.getElementById("genetics-host-div").addEventListener("click", e => {

        if (saved.geneticOperation !== undefined) return

        document.getElementById(`pokedex-menu`).style.display = "flex"
        document.getElementById(`pokedex-menu`).style.zIndex = "200"

        dexHostSelect = true

        updatePokedex()

    })


    document.getElementById("genetics-sample-div").addEventListener("click", e => {

        if (saved.geneticOperation !== undefined) return

        document.getElementById(`pokedex-menu`).style.display = "flex"
        document.getElementById(`pokedex-menu`).style.zIndex = "200"

        dexSampleSelect = true

        updatePokedex()

    })


    document.getElementById("genetics-start").addEventListener("click", e => {

        if (saved.geneticOperation <= 1){
            


        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").innerHTML = `Operation finished!<br>Do you want to use a genetic-aiding item?`
        document.getElementById("tooltipMid").innerHTML = `The item will be consumed on use`
        document.getElementById("tooltipBottom").innerHTML = `
        
        <span style="display:flex; justify-content:center; align-items:center; width:100%">
        
        <div 
        onClick = '
        saved.geneticOperation = undefined;
        setGeneticMenu("end");
        '
        style="cursor:pointer; font-size:2rem; width:40%"> Nope </div>
        
        
        
        <div onClick = '
        document.getElementById("item-menu").style.zIndex = "400";
        document.getElementById("item-menu").style.display = "flex";
        document.getElementById("item-menu-cancel").style.display = "inline";
        geneticItemSelect = true;
        bagCategory = "key";
        updateItemBag();
        closeTooltip()


        ' style="cursor:pointer; font-size:2rem; width:40%" id="prevent-tooltip-exit">Yeah!
        </div>

        </span>
        
        `



        openTooltip()


            return
        }

        if (saved.geneticOperation != undefined){
            


        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").innerHTML = `Are you sure you want to abort the operation?`
        document.getElementById("tooltipMid").innerHTML = `Nothing but time will be lost`
        document.getElementById("tooltipBottom").innerHTML = `<div onClick = "

        saved.geneticOperation = undefined;
        saved.geneticPokerus = false
        setGeneticMenu();
        closeTooltip()

        " style="cursor:pointer; font-size:2rem" id="prevent-tooltip-exit">Yeah!</div>`
        openTooltip()


            return
        }

        if (saved.geneticHost == undefined || saved.geneticSample == undefined) return
        setGeneticMenu("start")
        return

    })




saved.geneticPokerus = false


function setGeneticMenu(mod, itemUsed){

    

const hostPkmn = pkmn[saved.geneticHost];
const samplePkmn = pkmn[saved.geneticSample];
currentGeneticsCompatibility = 0

if (saved.geneticHost != undefined) {
document.getElementById("genetics-host-div").innerHTML = `<img class="sprite-trim" style="z-index: 1; transform-origin: bottom; margin-top: auto; position: absolute; bottom: -4.5rem;" id="genetics-host" src="img/pkmn/sprite/${hostPkmn.id}.png">
<img style="animation: none; position: absolute; opacity: 0.4; width: 4.5rem; z-index: 0; transform: translateY(0.5rem); image-rendering: initial;" src="img/resources/pkmn-shadow.png">`
if (pkmn[saved.geneticHost].shiny) {document.getElementById("genetics-host").src = `img/pkmn/shiny/${saved.geneticHost}.png`;}
} else {
document.getElementById("genetics-host-div").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512c282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0m0 961.008c-247.024 0-448-201.984-448-449.01c0-247.024 200.976-448 448-448s448 200.977 448 448s-200.976 449.01-448 449.01M736 480H544V288c0-17.664-14.336-32-32-32s-32 14.336-32 32v192H288c-17.664 0-32 14.336-32 32s14.336 32 32 32h192v192c0 17.664 14.336 32 32 32s32-14.336 32-32V544h192c17.664 0 32-14.336 32-32s-14.336-32-32-32"/></svg>`
}


if (saved.geneticSample != undefined) {
document.getElementById("genetics-sample-div").innerHTML = `<img class="sprite-trim" style="animation: none; z-index: 1;" id="genetics-sample" src="img/pkmn/sprite/${samplePkmn.id}.png">`
if (pkmn[saved.geneticSample].shiny) {document.getElementById("genetics-sample").src = `img/pkmn/shiny/${samplePkmn.id}.png`; }
} else {
document.getElementById("genetics-sample-div").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 0C229.232 0 0 229.232 0 512c0 282.784 229.232 512 512 512c282.784 0 512-229.216 512-512C1024 229.232 794.784 0 512 0m0 961.008c-247.024 0-448-201.984-448-449.01c0-247.024 200.976-448 448-448s448 200.977 448 448s-200.976 449.01-448 449.01M736 480H544V288c0-17.664-14.336-32-32-32s-32 14.336-32 32v192H288c-17.664 0-32 14.336-32 32s14.336 32 32 32h192v192c0 17.664 14.336 32 32 32s32-14.336 32-32V544h192c17.664 0 32-14.336 32-32s-14.336-32-32-32"/></svg>`
}



if (saved.geneticHost!==undefined) {document.getElementById("genetics-host-div").dataset.pkmnEditor = saved.geneticHost} else {delete document.getElementById("genetics-host-div").dataset.pkmnEditor;}
if (saved.geneticSample!==undefined) {document.getElementById("genetics-sample-div").dataset.pkmnEditor = saved.geneticSample} else {delete document.getElementById("genetics-host-div").dataset.pkmnEditor;}


if (saved.geneticHost== undefined || saved.geneticSample == undefined) powerCost = 0
else {
if (returnPkmnDivision(hostPkmn) === "D")  powerCost = 1
if (returnPkmnDivision(hostPkmn) === "C")  powerCost = 3
if (returnPkmnDivision(hostPkmn) === "B")  powerCost = 4
if (returnPkmnDivision(hostPkmn) === "A")  powerCost = 5
if (returnPkmnDivision(hostPkmn) === "S")  powerCost = 6
if (returnPkmnDivision(hostPkmn) === "SS")  powerCost = 7
if (returnPkmnDivision(hostPkmn) === "SSS")  powerCost = 8
}

let compability = 1;
if (saved.geneticHost== undefined || saved.geneticSample == undefined) compability = 1
else {

const sharedType = hostPkmn.type.filter(type => samplePkmn.type.includes(type) ).length;

if (sharedType === 1) compability = 2;
if (sharedType === 2) compability = 3;

if (samplePkmn.id === "ditto") compability++




document.getElementById("pokerus-warning").style.display = "none"
if (pkmn[saved.geneticHost].pokerus || saved.geneticPokerus==true) compability++
if (pkmn[saved.geneticHost].pokerus || saved.geneticPokerus==true) document.getElementById("pokerus-warning").style.display = "flex"

document.getElementById("genetics-compat-text").innerHTML = `Compatibility <font style="color:#E58FFF; margin-left:0.3rem">[${compability-1}]</font>`


const familyHost = getEvolutionFamily(hostPkmn);
const familySample = getEvolutionFamily(samplePkmn);
if (familyHost.has(samplePkmn) || familySample.has(hostPkmn)) {
    compability = 4;
}




}

currentGeneticsCompatibility = compability


document.getElementById("genetics-bar-compatibility").style.width = `${((compability-1) / 3) * 100}%`


document.getElementById("genetics-bar-power").style.width = `${(powerCost / 8) * 100}%`

if (powerCost >= 6) document.getElementById("genetics-bar-power").style.backgroundColor = `coral`
else {document.getElementById("genetics-bar-power").style.backgroundColor = `rgb(229, 143, 255)`}

let timeNeeded = powerCost * 60
if (item.replicatorUpgradeS.got>0) { timeNeeded = Math.max(10, powerCost * 60 - 30 * 60) }
const [h, m, x] = [
  (timeNeeded / 3600) | 0,
  ((timeNeeded % 3600) / 60) | 0,
  (timeNeeded % 60) | 0
];

document.getElementById("genetics-data-time").innerHTML = `${h}h ${m}m ${x}s`

document.getElementById("genetics-warning").style.display = "none"
if (powerCost>=6) document.getElementById("genetics-warning").style.display = "flex"
if (powerCost==6) document.getElementById("genetics-warning").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="28" d="M12 10l4 7h-8Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"/></path><path d="M12 10l4 7h-8Z" opacity="0"><animate attributeName="d" begin="0.4s" dur="0.8s" keyTimes="0;0.25;1" repeatCount="indefinite" values="M12 10l4 7h-8Z;M12 4l9.25 16h-18.5Z;M12 4l9.25 16h-18.5Z"/><animate attributeName="opacity" begin="0.4s" dur="0.8s" keyTimes="0;0.1;0.75;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></svg>Warning, high Power Cost! Only 5 out of 6 maximum IV's per stat will be inherited!`
if (powerCost==7) document.getElementById("genetics-warning").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="28" d="M12 10l4 7h-8Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"/></path><path d="M12 10l4 7h-8Z" opacity="0"><animate attributeName="d" begin="0.4s" dur="0.8s" keyTimes="0;0.25;1" repeatCount="indefinite" values="M12 10l4 7h-8Z;M12 4l9.25 16h-18.5Z;M12 4l9.25 16h-18.5Z"/><animate attributeName="opacity" begin="0.4s" dur="0.8s" keyTimes="0;0.1;0.75;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></svg>Warning, very high Power Cost! Only 4 out of 6 maximum IV's per stat will be inherited!`
if (powerCost==8) document.getElementById("genetics-warning").innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path stroke-dasharray="28" d="M12 10l4 7h-8Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"/></path><path d="M12 10l4 7h-8Z" opacity="0"><animate attributeName="d" begin="0.4s" dur="0.8s" keyTimes="0;0.25;1" repeatCount="indefinite" values="M12 10l4 7h-8Z;M12 4l9.25 16h-18.5Z;M12 4l9.25 16h-18.5Z"/><animate attributeName="opacity" begin="0.4s" dur="0.8s" keyTimes="0;0.1;0.75;1" repeatCount="indefinite" values="0;1;1;0"/></path></g></svg>Warning, extreme Power Cost! Only 3 out of 6 maximum IV's per stat will be inherited!`



document.getElementById("special-warning").style.display = "none"
if (pkmn[saved.geneticHost]?.hidden) document.getElementById("special-warning").style.display = "flex"


let shinyChance = 1/100
if (saved.geneticHost== undefined || saved.geneticSample == undefined) shinyChance = 0
else {
if (samplePkmn.shiny && compability == 2) shinyChance = 1/5
if (samplePkmn.shiny && compability == 3) shinyChance = 1/2
if (samplePkmn.shiny && compability == 4) shinyChance = 1/1
if (pkmn[saved.geneticHost].hidden) shinyChance = 0
if (pkmn[saved.geneticHost].shiny) shinyChance = 0
}


document.getElementById("genetics-data-shiny").innerHTML = `${(  shinyChance*100  ).toFixed(0)}%`


let moveChance = 0.05
if ( compability == 2) moveChance = 0.30
if ( compability == 3) moveChance = 0.50
if ( compability == 4) moveChance = 0.50
if ( compability == 0) moveChance = 0

document.getElementById("genetics-data-moves").innerHTML = `${(  moveChance*100  ).toFixed(0)}%`


let ivChance = 1/50
if ( compability == 2) ivChance = 1/20
if ( compability == 3) ivChance = 1/6.5
if ( compability == 4) ivChance = 1/2
if ( compability == 0) ivChance = 0

document.getElementById("genetics-data-hp").innerHTML = `${(  ivChance*100  ).toFixed(0)}%`
document.getElementById("genetics-data-atk").innerHTML = `${(  ivChance*100  ).toFixed(0)}%`
document.getElementById("genetics-data-def").innerHTML = `${(  ivChance*100  ).toFixed(0)}%`
document.getElementById("genetics-data-satk").innerHTML = `${(  ivChance*100  ).toFixed(0)}%`
document.getElementById("genetics-data-sdef").innerHTML = `${(  ivChance*100  ).toFixed(0)}%`
document.getElementById("genetics-data-spe").innerHTML = `${(  ivChance*100  ).toFixed(0)}%`

if (mod==="start"){
    afkSecondsGenetics = 0
    saved.geneticOperation = timeNeeded
    saved.geneticOperationTotal = timeNeeded
    if (pkmn[saved.geneticHost].pokerus) saved.geneticPokerus = true
}

if (saved.geneticOperation !== undefined){
    document.getElementById("genetics-start").textContent = "Abort"
    document.getElementById("genetics-start").style.color = "coral"
    document.getElementById("genetics-start").style.outlineColor = "coral"
    document.getElementById("genetics-progress").style.display = "flex"
    document.getElementById("genetics-arrow").style.animation = "genetics-arrow 2s infinite"
    document.getElementById("genetics-host").style.animation = "pkmn-active 0.5s infinite"
    document.getElementById("genetics-progress-time").innerHTML = returnHMS(saved.geneticOperation)
    document.getElementById("genetics-progress-bar").style.width = `${100 - (saved.geneticOperation / saved.geneticOperationTotal) * 100}%`;

} else {
    document.getElementById("genetics-start").textContent = "Start"
    document.getElementById("genetics-start").style.color = "rgb(189, 123, 219)"
    document.getElementById("genetics-start").style.outlineColor = "rgb(189, 123, 219)"
    document.getElementById("genetics-progress").style.display = "none"
    document.getElementById("genetics-arrow").style.animation = "none"
    if (document.getElementById("genetics-host")) document.getElementById("genetics-host").style.animation = "none"
}

if (saved.geneticOperation <= 1){
    document.getElementById("genetics-start").textContent = "Finish"
    document.getElementById("genetics-start").style.color = "lawngreen"
    document.getElementById("genetics-start").style.outlineColor = "lawngreen"
}

if (mod==="end"){

    

    let summaryTags = ""

    pkmn[saved.geneticHost].level = 1
    pkmn[saved.geneticHost].exp = 1

    if (rng(shinyChance)) {pkmn[saved.geneticHost].shiny = true; summaryTags += `<div style="filter:hue-rotate(100deg)">✦ Shiny Mutation!</div>` }

    if (itemUsed == "destinyKnot"){ //ability swap
    const hostAbility = pkmn[saved.geneticHost].ability
    const sampleAbility = pkmn[saved.geneticSample].ability
    setPkmnAbility(saved.geneticHost, sampleAbility)
    setPkmnAbility(saved.geneticSample, hostAbility)
    summaryTags += `<div style="filter:hue-rotate(-50deg)">★ Ability swapped!</div>`
    } else {
    const newAbility = learnPkmnAbility(saved.geneticHost,10) //boosted chance
    if (itemUsed=="everstone") {setPkmnAbility(saved.geneticHost, newAbility); summaryTags += `<div style="filter:hue-rotate(-50deg)">★ New ability: ${format(newAbility)}!</div>`}
    }

    pkmn[saved.geneticHost].movepool = []
    if (pkmn[saved.geneticHost].moves.slot1 !== undefined )pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticHost].moves.slot1)
    if (pkmn[saved.geneticHost].moves.slot2 !== undefined )pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticHost].moves.slot2)
    if (pkmn[saved.geneticHost].moves.slot3 !== undefined )pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticHost].moves.slot3)
    if (pkmn[saved.geneticHost].moves.slot4 !== undefined )pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticHost].moves.slot4)

    //Move Lock: moves locked by the player are kept in the movepool even if they are not equiped right now
    if (!Array.isArray(pkmn[saved.geneticHost].lockedMoves)) pkmn[saved.geneticHost].lockedMoves = []
    pkmn[saved.geneticHost].lockedMoves.forEach(moveID => {
        if (!pkmn[saved.geneticHost].movepool.includes(moveID)) pkmn[saved.geneticHost].movepool.push(moveID)
    })


    //pass moves
    
    pkmn[saved.geneticSample].movepool.forEach(moveID => {
        if (rng(moveChance) && !(pkmn[saved.geneticHost].movepool.includes(moveID)) && (move[moveID].moveset!==undefined ||  (   move[moveID].moveset==undefined && pkmn[saved.geneticHost].eggMove?.id == moveID  )    ||   ( move[moveID].moveset==undefined && ["B", "C", "D"].includes(returnPkmnDivision(pkmn[saved.geneticHost])) && item.replicatorUpgradeE.got>0 && compability>=3   )   ) ) {

            pkmn[saved.geneticHost].movepool.push(moveID);
            if (pkmn[saved.geneticHost].movepoolMemory == undefined) pkmn[saved.geneticHost].movepoolMemory = []
            if (!pkmn[saved.geneticHost].movepoolMemory.includes(moveID)) pkmn[saved.geneticHost].movepoolMemory.push(moveID);
            
            if (move[moveID].moveset==undefined && (pkmn[saved.geneticSample].signature?.id == moveID || pkmn[saved.geneticSample].eggMove?.id == moveID)  ) summaryTags += `<div style="filter:hue-rotate(200deg)">⟐ Egg Move inherited: ${format(moveID)}!</div>`
            else summaryTags += `<div style="filter:hue-rotate(0deg)">◇ Move inherited: ${format(moveID)}!</div>`
        }
    });


    if (itemUsed==`lockCapsule`){
        //Move Lock: locked moves of the sample are never lost (pool and equiped slots)
        if (!Array.isArray(samplePkmn.lockedMoves)) samplePkmn.lockedMoves = []
        const sampleMoveLocked = moveID => samplePkmn.lockedMoves.includes(moveID)
        //transfer moves from sample to host pool
        if (pkmn[saved.geneticSample].moves.slot1 !== undefined && !pkmn[saved.geneticHost].movepool.includes(pkmn[saved.geneticSample].moves.slot1) && move[pkmn[saved.geneticSample].moves.slot1].moveset!==undefined)  pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticSample].moves.slot1)
        if (pkmn[saved.geneticSample].moves.slot2 !== undefined && !pkmn[saved.geneticHost].movepool.includes(pkmn[saved.geneticSample].moves.slot2) && move[pkmn[saved.geneticSample].moves.slot2].moveset!==undefined)  pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticSample].moves.slot2)
        if (pkmn[saved.geneticSample].moves.slot3 !== undefined && !pkmn[saved.geneticHost].movepool.includes(pkmn[saved.geneticSample].moves.slot3) && move[pkmn[saved.geneticSample].moves.slot3].moveset!==undefined)  pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticSample].moves.slot3)
        if (pkmn[saved.geneticSample].moves.slot4 !== undefined && !pkmn[saved.geneticHost].movepool.includes(pkmn[saved.geneticSample].moves.slot4) && move[pkmn[saved.geneticSample].moves.slot4].moveset!==undefined)  pkmn[saved.geneticHost].movepool.push(pkmn[saved.geneticSample].moves.slot4)
        //delete sample pool
        if (move[pkmn[saved.geneticSample].moves.slot1].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot1)) pkmn[saved.geneticSample].movepool.splice(pkmn[saved.geneticSample].movepool.indexOf(pkmn[saved.geneticSample].moves.slot1), 1);
        if (move[pkmn[saved.geneticSample].moves.slot2].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot2)) pkmn[saved.geneticSample].movepool.splice(pkmn[saved.geneticSample].movepool.indexOf(pkmn[saved.geneticSample].moves.slot2), 1);
        if (move[pkmn[saved.geneticSample].moves.slot3].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot3)) pkmn[saved.geneticSample].movepool.splice(pkmn[saved.geneticSample].movepool.indexOf(pkmn[saved.geneticSample].moves.slot3), 1);
        if (move[pkmn[saved.geneticSample].moves.slot4].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot4)) pkmn[saved.geneticSample].movepool.splice(pkmn[saved.geneticSample].movepool.indexOf(pkmn[saved.geneticSample].moves.slot4), 1);
        //remove equiped moves from sample
        if (move[pkmn[saved.geneticSample].moves.slot1].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot1)) pkmn[saved.geneticSample].moves.slot1 = undefined
        if (move[pkmn[saved.geneticSample].moves.slot2].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot2)) pkmn[saved.geneticSample].moves.slot2 = undefined
        if (move[pkmn[saved.geneticSample].moves.slot3].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot3)) pkmn[saved.geneticSample].moves.slot3 = undefined
        if (move[pkmn[saved.geneticSample].moves.slot4].moveset!==undefined && !sampleMoveLocked(pkmn[saved.geneticSample].moves.slot4)) pkmn[saved.geneticSample].moves.slot4 = undefined
        //equip moves from pool into empty slots
        for (const e of pkmn[saved.geneticSample].movepool) {
        if (pkmn[saved.geneticSample].moves.slot1 == undefined && pkmn[saved.geneticSample].moves.slot1!= e && pkmn[saved.geneticSample].moves.slot2!= e && pkmn[saved.geneticSample].moves.slot3!= e && pkmn[saved.geneticSample].moves.slot4!= e) pkmn[saved.geneticSample].moves.slot1 = e
        if (pkmn[saved.geneticSample].moves.slot2 == undefined && pkmn[saved.geneticSample].moves.slot1!= e && pkmn[saved.geneticSample].moves.slot2!= e && pkmn[saved.geneticSample].moves.slot3!= e && pkmn[saved.geneticSample].moves.slot4!= e) pkmn[saved.geneticSample].moves.slot2 = e
        if (pkmn[saved.geneticSample].moves.slot3 == undefined && pkmn[saved.geneticSample].moves.slot1!= e && pkmn[saved.geneticSample].moves.slot2!= e && pkmn[saved.geneticSample].moves.slot3!= e && pkmn[saved.geneticSample].moves.slot4!= e) pkmn[saved.geneticSample].moves.slot3 = e
        if (pkmn[saved.geneticSample].moves.slot4 == undefined && pkmn[saved.geneticSample].moves.slot1!= e && pkmn[saved.geneticSample].moves.slot2!= e && pkmn[saved.geneticSample].moves.slot3!= e && pkmn[saved.geneticSample].moves.slot4!= e) pkmn[saved.geneticSample].moves.slot4 = e
        }

        summaryTags += `<div style="filter:hue-rotate(-200deg)">★ Moves transferred!</div>`

    
    }

    
    let ivChanceHp = ivChance
    if (itemUsed == "powerWeight") ivChanceHp = 1
    if (itemUsed == "machoBrace") ivChanceHp *= 10
    let ivChanceAtk = ivChance
    if (itemUsed == "powerBracer") ivChanceAtk = 1
    if (itemUsed == "machoBrace") ivChanceAtk *= 10
    let ivChanceDef = ivChance
    if (itemUsed == "powerBelt") ivChanceDef = 1
    if (itemUsed == "machoBrace") ivChanceDef *= 10
    let ivChanceSatk = ivChance
    if (itemUsed == "powerLens") ivChanceSatk = 1
    if (itemUsed == "machoBrace") ivChanceSatk *= 10
    let ivChanceSdef = ivChance
    if (itemUsed == "powerBand") ivChanceSdef = 1
    if (itemUsed == "machoBrace") ivChanceSdef *= 10
    let ivChanceSpe = ivChance
    if (itemUsed == "powerAnklet") ivChanceSpe = 1
    if (itemUsed == "machoBrace") ivChanceSpe *= 10

    let ivCap = 6
    if (powerCost==6) ivCap = 5
    if (powerCost==7) ivCap = 4
    if (powerCost==8) ivCap = 3


    if (rng(ivChanceHp) && pkmn[saved.geneticHost].ivs.hp<Math.min(ivCap, pkmn[saved.geneticSample].ivs.hp)) {pkmn[saved.geneticHost].ivs.hp = Math.min(ivCap, pkmn[saved.geneticSample].ivs.hp) ; summaryTags += `<div style="filter:hue-rotate(200deg)">❖ HP Iv's inherited!</div>`}
    if (rng(ivChanceAtk) && pkmn[saved.geneticHost].ivs.atk<Math.min(ivCap, pkmn[saved.geneticSample].ivs.atk)) {pkmn[saved.geneticHost].ivs.atk = Math.min(ivCap, pkmn[saved.geneticSample].ivs.atk) ; summaryTags += `<div style="filter:hue-rotate(200deg)">❖ Attack Iv's inherited!</div>`}
    if (rng(ivChanceDef) && pkmn[saved.geneticHost].ivs.def<Math.min(ivCap, pkmn[saved.geneticSample].ivs.def)) {pkmn[saved.geneticHost].ivs.def = Math.min(ivCap, pkmn[saved.geneticSample].ivs.def) ; summaryTags += `<div style="filter:hue-rotate(200deg)">❖ Defense Iv's inherited!</div>`}
    if (rng(ivChanceSatk) && pkmn[saved.geneticHost].ivs.satk<Math.min(ivCap, pkmn[saved.geneticSample].ivs.satk)) {pkmn[saved.geneticHost].ivs.satk = Math.min(ivCap, pkmn[saved.geneticSample].ivs.satk) ; summaryTags += `<div style="filter:hue-rotate(200deg)">❖ Special Attack Iv's inherited!</div>`}
    if (rng(ivChanceSdef) && pkmn[saved.geneticHost].ivs.sdef<Math.min(ivCap, pkmn[saved.geneticSample].ivs.sdef)) {pkmn[saved.geneticHost].ivs.sdef = Math.min(ivCap, pkmn[saved.geneticSample].ivs.sdef) ; summaryTags += `<div style="filter:hue-rotate(200deg)">❖ Special Defense Iv's inherited!</div>`}
    if (rng(ivChanceSpe) && pkmn[saved.geneticHost].ivs.spe<Math.min(ivCap, pkmn[saved.geneticSample].ivs.spe)) {pkmn[saved.geneticHost].ivs.spe = Math.min(ivCap, pkmn[saved.geneticSample].ivs.spe) ; summaryTags += `<div style="filter:hue-rotate(200deg)">❖ Speed Iv's inherited!</div>`}

    pkmn[saved.geneticHost].dictionaryTagIvSum = pkmn[saved.geneticHost].ivs.hp + pkmn[saved.geneticHost].ivs.atk + pkmn[saved.geneticHost].ivs.satk + pkmn[saved.geneticHost].ivs.spe + pkmn[saved.geneticHost].ivs.sdef + pkmn[saved.geneticHost].ivs.def



    for (const iv in pkmn[saved.geneticHost].ivs){
        const ivId = pkmn[saved.geneticHost].ivs[iv]
        //let maxIv = 3
        let newIv = 0

        if (rng(0.20)) newIv++
        if (rng(0.20)) newIv++
        if (rng(0.20)) newIv++
        if (rng(0.20)) newIv++           
        if (rng(0.20)) newIv++
        if (rng(0.20)) newIv++           
        if (rng(0.20)) newIv++
        if (newIv>6) newIv = 6           
        
        if (newIv>ivId) {
            pkmn[saved.geneticHost].ivs[iv] = newIv
            if (iv === "hp") summaryTags += `<div style="filter:hue-rotate(250deg)">◆ HP Iv's increased!</div>`
            if (iv === "atk") summaryTags += `<div style="filter:hue-rotate(250deg)">◆ Attack Iv's increased!</div>`
            if (iv === "def") summaryTags += `<div style="filter:hue-rotate(250deg)">◆ Defense Iv's increased!</div>`
            if (iv === "satk") summaryTags += `<div style="filter:hue-rotate(250deg)">◆ Special Attack Iv's increased!</div>`
            if (iv === "sdef") summaryTags += `<div style="filter:hue-rotate(250deg)">◆ Special Defense Iv's increased!</div>`
            if (iv === "spe") summaryTags += `<div style="filter:hue-rotate(250deg)">◆ Speed Iv's increased!</div>`
        }
    }


    if (summaryTags == "") summaryTags = "No new genetic changes"
    
    document.getElementById("tooltipTitle").innerHTML = `Operation overview`
    document.getElementById("tooltipTop").style.display = "none"    
    document.getElementById("tooltipMid").innerHTML = `<div class="genetics-overview-tags" id="prevent-tooltip-exit">${summaryTags}</div>`
    document.getElementById("tooltipBottom").innerHTML = `<div style="display:flex;justify-content:center;align-items:center; width:100%; cursor:help"><div class="area-preview" data-pkmn-editor="${saved.geneticHost}"><img   class="sprite-trim" src="img/pkmn/sprite/${saved.geneticHost}.png"> </div></div>`


    saved.geneticHost = undefined
    saved.geneticPokerus = false

    setGeneticMenu()

}




}




setInterval(() => {
    if (saved.geneticOperation==undefined) return
    if (saved.geneticOperation===1)  {saved.geneticOperation--; setGeneticMenu();}
    if (saved.geneticOperation<1 && document.getElementById("genetics-start").textContent == "Abort") setGeneticMenu();
    if (saved.geneticOperation==0) return
    if (saved.geneticOperation<0) saved.geneticOperation=1
    //if (document.visibilityState === "visible") saved.geneticOperation--
    if (saved.geneticOperation>1 && afkSecondsGenetics>0){
        saved.geneticOperation -= afkSecondsGenetics
        afkSecondsGenetics = 0
    }
    document.getElementById("genetics-progress-time").innerHTML = returnHMS(saved.geneticOperation)
    document.getElementById("genetics-progress-bar").style.width = `${100 - (saved.geneticOperation / saved.geneticOperationTotal) * 100}%`;
}, 1000);
