saved.lastPokerusReset = undefined

function assignPokerus(){
    if (areas.vsEliteFourLance.defeated !== true) return

    const now = Date.now()
    const twoHours = 1000 * 60 * 60 * 2
    const currentPokerusRotation = Math.floor(now / twoHours)

    if (saved.lastPokerusReset != currentPokerusRotation){
        saved.lastPokerusReset = currentPokerusRotation

        const eligiblePokemon = []

        for (const i in pkmn){
            if (
                pkmn[i].caught > 0 &&
                pkmn[i].hidden != true &&
                !pkmn[i].pokerus
            ) {
                eligiblePokemon.push(i)
            }
        }

        // Pick 1 per 100 Pokemon without Pokerus
        const pickCount = Math.max(1, Math.floor(eligiblePokemon.length / 100))

        const selectedPokemon = arrayPick(eligiblePokemon, pickCount)

        if (selectedPokemon.length == 0) return

        for (const i of selectedPokemon) {
            pkmn[i].pokerus = true
            pkmn[i].tagPokerus = `pokerus`
        }

        setSearchTags()
    }
}
