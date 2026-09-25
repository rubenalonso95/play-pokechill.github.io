saved.arenaCard1 = undefined
saved.arenaCard2 = undefined
saved.arenaCard3 = undefined
saved.arenaActiveCard = 1
saved.arenaCurrentTrainer = 1


    function returnFieldHue(id){
        if (field[id].tier==2) return 100
        if (field[id].tier==4) return 200
        if (field[id].tier==3) return 300
    }


function pickArenaCard(number){



    document.getElementById(`arena-card-1`).className = `arena-card`
    document.getElementById(`arena-card-2`).className = `arena-card`
    document.getElementById(`arena-card-3`).className = `arena-card`

    document.getElementById(`arena-card-`+number).classList.add("active-arena-card")

    saved.arenaActiveCard = number









}





function createArenaCards() {


    let fieldt1 = []
    let fieldt2 = []
    let fieldt3 = []
    let fieldt4 = []


    for (const i in field) {
        if (field[i].chance==undefined || ( field[i].chance && rng(field[i].chance) )) {
        if (field[i].tier==1) fieldt1.push(i)
        if (field[i].tier==2) fieldt2.push(i)
        if (field[i].tier==3) fieldt3.push(i)
        if (field[i].tier==4) fieldt4.push(i)
        }

    }

    saved.arenaCard1 = [arrayPick(fieldt2,1)]
    if (rng(0.5)) saved.arenaCard1 = [arrayPick(fieldt1,1)]


    saved.arenaCard2 = [arrayPick(fieldt2,1), arrayPick(fieldt3,1)]


    saved.arenaCard3 = [arrayPick(fieldt1,1), arrayPick(fieldt3,1), arrayPick(fieldt4,1)]
    if (rng(0.5)) saved.arenaCard3 = [...arrayPick(fieldt2,2), arrayPick(fieldt4,1)]


}
