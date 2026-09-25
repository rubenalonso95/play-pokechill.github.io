saved.mysteryGiftClaimed = undefined
saved.wonderTradeClaimed = undefined

const mysteryGift = {
    effect: function() {  
        const id = pkmn.kecleon.id
        if (pkmn[id].caught==0) givePkmn(pkmn[id],1)
        pkmn[id].shiny = true
        giveRibbon(pkmn[id],"souvenir")
      },
    duration: new Date(2026, 3 - 1, 20),
    info: `Long Press/Right click the present below to receive a gift Kecleon!<br>It will be shiny and carrying a Souvenir Ribbon`,
    icon: pkmn.kecleon.id
}

function claimWonderTrade(){


    if (saved.wonderTradeClaimed) return


    if (areas.vsMasterTrainerGeeta.defeated == false) {
        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").style.display = `none`
        document.getElementById("tooltipBottom").style.display = `none`
        document.getElementById("tooltipMid").innerHTML = `Defeat Master Trainer Geeta in VS mode to unlock`
        openTooltip()
        return
    }


    document.getElementById("tooltipTop").style.display = "none"
    document.getElementById("tooltipTitle").innerHTML = `Wonder Trade`
    document.getElementById("tooltipMid").innerHTML = `Every 12h you might receive a random pokemon`
    document.getElementById("tooltipBottom").innerHTML = `

        <div onclick="wonderTrade()" class="custom-challenge-button" style="margin-top:0.5rem">Let's do it!</div>
    
    `
    openTooltip()

}

function wonderTrade(){

    closeTooltip()
    openMenu()

    document.getElementById("wonder-menu").style.display = "flex"

    let chosenPokemon = `magikarp`
    let chosenShiny = false
    let unobtainedPokemon = []
    let obtainedPokemon = []

    for (const i in pkmn){
        if (pkmn[i].caught>0) continue
        if (pkmn[i].tagObtainedIn == "frontier" || pkmn[i].tagObtainedIn == "wild" || pkmn[i].tagObtainedIn == "park") unobtainedPokemon.push(i)
    }

    if (rng(0.5) && unobtainedPokemon.length>0){ //new pokemon
        if (rng(0.15)) chosenShiny = true

        chosenPokemon = arrayPick(unobtainedPokemon)
        givePkmn(pkmn[chosenPokemon],1)

    } else { //not so new
        if (rng(0.50)) chosenShiny = true

        for (const i in pkmn){
            if (pkmn[i].caught==0) continue
            if (pkmn[i].shiny==true) continue
            if (pkmn[i].hidden==true) continue
            obtainedPokemon.push(i)
        }

        chosenPokemon = arrayPick(obtainedPokemon)
        if (obtainedPokemon.length==0) chosenPokemon = pkmn.magikarp.id

    }

    if (chosenShiny) pkmn[chosenPokemon].shiny = true
    document.getElementById("wonder-text").innerHTML = `Thanks for the ${format(chosenPokemon)}!`
    document.getElementById("wonder-pkmn").src = `img/pkmn/sprite/${chosenPokemon}.png`
    if (chosenShiny) document.getElementById("wonder-pkmn").src = `img/pkmn/shiny/${chosenPokemon}.png`

    document.getElementById("wonder-pkmn").oncontextmenu = null;
    document.getElementById("wonder-pkmn").oncontextmenu = (e) => {
    tooltipData('pkmnEditor', chosenPokemon)
    document.getElementById("wonder-menu").style.display = "none"
    }


    saved.wonderTradeClaimed = true


}


function claimMysteryGift(){


        if (areas.vsGymLeaderBrock.defeated == false) {
        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").style.display = `none`
        document.getElementById("tooltipBottom").style.display = `none`
        document.getElementById("tooltipMid").innerHTML = `Defeat Gym Leader Brock in VS mode to unlock`
        openTooltip()
        return
        }

    openMenu()
    document.getElementById("tooltipTop").innerHTML = `<img src="img/pkmn/shiny/${mysteryGift.icon}.png">`
    document.getElementById("tooltipTitle").innerHTML = `Mystery Gift`
    document.getElementById("tooltipMid").innerHTML = `${mysteryGift.info}<br>You have until ${mysteryGift.duration.toLocaleString("en-US", {month: "long",day: "numeric"})} to claim`
    document.getElementById("tooltipBottom").innerHTML = `<span data-pkmn-editor=${mysteryGift.icon} id="mystery-claim-button"><img src="img/items/gift.png" style="scale:4; image-rendering:pixelated; padding: 3rem 0; cursor:help" 
    style="cursor:pointer; font-size:2rem" id="prevent-tooltip-exit"></span>`
    openTooltip()

    document.getElementById("mystery-claim-button").addEventListener("contextmenu", (e) => {
    mysteryGift.effect();
    saved.mysteryGiftClaimed = true
    });

}
