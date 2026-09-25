saved.firstTimePlaying = true //esta flag se tiene que quitar cuando seleccione el pkmn, es lo que hace que no puedas guardar
if (!saved.movePresets || typeof saved.movePresets !== "object" || Array.isArray(saved.movePresets)) saved.movePresets = {}


function saveGame() {
  if (saved.firstTimePlaying == true) return //scary!
  let data = {};

  // Variable suelta
  data.saved = saved;
  data.team = team;

  // Items
  for (const i in item) {
    data[i] = {};
    data[i].got = item[i].got;
    data[i].newItem = item[i].newItem;
  }


  // Shop
  for (const i in shop) {
    data[i] = {};
    data[i].stock = shop[i].stock;
  }

  // Areas
  for (const i in areas) {
    data[i] = {};
    data[i].defeated = areas[i].defeated;
    data[i].hpPercentage = areas[i].hpPercentage;
    if (areas[i].type=="event" && areas[i].encounter) data[i].ticketIndex = areas[i].ticketIndex;

    if (areas[i].type=="frontier") data[i].level = areas[i].level;
    if (areas[i].type=="frontier") data[i].team = areas[i].team;
    if (areas[i].type=="frontier") data[i].difficulty = areas[i].difficulty;
    if (areas[i].type=="frontier") data[i].tier = areas[i].tier;
    if (areas[i].type=="frontier") data[i].reward = areas[i].reward;
    if (areas[i].type=="frontier") data[i].itemReward = areas[i].itemReward;
    if (areas[i].type=="frontier") data[i].background = areas[i].background;
    if (areas[i].type=="frontier") data[i].fieldEffect = areas[i].fieldEffect;
    if (areas[i].id=="training") data[i].tier = areas[i].tier;
    if (areas[i].id=="training") data[i].currentTraining = areas[i].currentTraining;
    if (areas[i].id=="wildlifePark") data[i].spawns = areas[i].spawns;
    if (areas[i].id=="wildlifePark") data[i].icon = areas[i].icon;
    if (areas[i].id==areas.frontierBattleFactory.id) data[i].icon = areas[i].icon;
    if (areas[i].type=="dimension") data[i].spawns = areas[i].spawns;

  }

  // Pokémon
  for (const i in pkmn) {
    if (!data[i]) data[i] = {};
    data[i].caught = pkmn[i].caught;
    data[i].movepool = pkmn[i].movepool;
    data[i].lockedMoves = pkmn[i].lockedMoves;
    data[i].level = pkmn[i].level;
    data[i].moves = pkmn[i].moves;
    data[i].newmoves = pkmn[i].newmoves;
    data[i].ivs = pkmn[i].ivs;
    data[i].exp = pkmn[i].exp;
    data[i].newEvolution = pkmn[i].newEvolution;
    data[i].ability = pkmn[i].ability;
    data[i].shiny = pkmn[i].shiny;
    data[i].shinyDisabled = pkmn[i].shinyDisabled;
    data[i].hiddenAbilityUnlocked = pkmn[i].hiddenAbilityUnlocked;
    data[i].permanentSkills = pkmn[i].permanentSkills;
    data[i].tag = pkmn[i].tag;
    data[i].ribbons = pkmn[i].ribbons;
    data[i].pokerus = pkmn[i].pokerus;
    data[i].recordSpiraling = pkmn[i].recordSpiraling;
    data[i].movepoolMemory = pkmn[i].movepoolMemory;
    data[i].nuzlocked = pkmn[i].nuzlocked;
    data[i].nickname = pkmn[i].nickname;
    data[i].decor = pkmn[i].decor;
    data[i].decorOwned = pkmn[i].decorOwned;
    data[i].starsign = pkmn[i].starsign;
    data[i].starsignList = pkmn[i].starsignList;
    data[i].nature = pkmn[i].nature;
    data[i].tagList = pkmn[i].tagList;
    data[i].favorite = pkmn[i].favorite;

  }

  localStorage.setItem("gameData", JSON.stringify(data));
}

// ---- CARGAR ----
function loadGame() {
  const raw = localStorage.getItem("gameData");
  if (!raw) {
    return;
  } 

  const data = JSON.parse(raw);

  if (data.saved !== undefined) saved = data.saved;
  if (!saved.movePresets || typeof saved.movePresets !== "object" || Array.isArray(saved.movePresets)) saved.movePresets = {}
  // Ability Training target (Phase 2): old saves may not have it; invalid shapes are discarded
  if (saved.pendingAbilityTarget !== undefined) {
    const t = saved.pendingAbilityTarget
    if (t == undefined || typeof t !== "object" || Array.isArray(t) || typeof t.pkmn !== "string" || typeof t.abilityId !== "string") saved.pendingAbilityTarget = undefined
  }
  if (data.team !== undefined) team = data.team;

  for (const i in item) {
    if (data[i]) {
      item[i].got = data[i].got;
      item[i].newItem = data[i].newItem;
    }
  }


  for (const i in shop) {
    if (data[i]) {
      shop[i].stock = data[i].stock;
    }
  }

  for (const i in areas) {
    if (data[i]) {
    areas[i].defeated = data[i].defeated;
    if (areas[i].type=="event" && areas[i].encounter) areas[i].ticketIndex = data[i].ticketIndex;
    if (data[i].hpPercentage!==undefined) areas[i].hpPercentage = data[i].hpPercentage;

    if (areas[i].type=="frontier") areas[i].level = data[i].level;
    if (areas[i].type=="frontier") areas[i].team = data[i].team;
    if (areas[i].type=="frontier") areas[i].difficulty = data[i].difficulty;
    if (areas[i].type=="frontier") areas[i].tier = data[i].tier;
    if (areas[i].type=="frontier") areas[i].reward = data[i].reward;
    if (areas[i].type=="frontier") areas[i].itemReward = data[i].itemReward;
    if (areas[i].type=="frontier") areas[i].background = data[i].background;
    if (areas[i].type=="frontier") areas[i].fieldEffect = data[i].fieldEffect;
    if (areas[i].id=="training") areas[i].tier = data[i].tier;
    if (areas[i].id=="training") areas[i].currentTraining = data[i].currentTraining;
    if (areas[i].id=="wildlifePark") areas[i].spawns = data[i].spawns;
    if (areas[i].id=="wildlifePark") areas[i].icon = data[i].icon;
    if (areas[i].id==areas.frontierBattleFactory.id) areas[i].icon = data[i].icon;
    if (areas[i].type=="dimension") areas[i].spawns = data[i].spawns;

  }
  }

  for (const i in pkmn) {
    if (data[i]) {
      pkmn[i].caught = data[i].caught;
      pkmn[i].movepool = data[i].movepool;
      pkmn[i].lockedMoves = data[i].lockedMoves;
      pkmn[i].level = data[i].level;
      pkmn[i].moves = data[i].moves;
      pkmn[i].newmoves = data[i].newmoves;
      pkmn[i].ivs = data[i].ivs;
      pkmn[i].exp = data[i].exp;
      pkmn[i].newEvolution = data[i].newEvolution;
      pkmn[i].ability = data[i].ability;
      pkmn[i].shiny = data[i].shiny;
      pkmn[i].shinyDisabled = data[i].shinyDisabled;
      pkmn[i].hiddenAbilityUnlocked = data[i].hiddenAbilityUnlocked;
      pkmn[i].permanentSkills = data[i].permanentSkills;
      pkmn[i].tag = data[i].tag;
      pkmn[i].ribbons = data[i].ribbons;
      pkmn[i].pokerus = data[i].pokerus;
      pkmn[i].recordSpiraling = data[i].recordSpiraling;
      pkmn[i].movepoolMemory = data[i].movepoolMemory;
      pkmn[i].nuzlocked = data[i].nuzlocked;
      pkmn[i].nickname = data[i].nickname;
      pkmn[i].decor = data[i].decor;
      pkmn[i].decorOwned = data[i].decorOwned;
      pkmn[i].starsign = data[i].starsign;
      pkmn[i].starsignList = data[i].starsignList;
      pkmn[i].nature = data[i].nature;
      pkmn[i].tagList = data[i].tagList;
      // Favorite: old saves do not have it, anything but true means not favorite
      pkmn[i].favorite = data[i].favorite == true;
    }
  }

  // Move Lock: lockedMoves belongs to the Pokemon; old saves without it fall back to []
  for (const i in pkmn) {
    if (!Array.isArray(pkmn[i].lockedMoves)) pkmn[i].lockedMoves = []
  }

  // Permanent skills: normalise old saves and always keep the current ability unlocked
  for (const i in pkmn) {
    if (!Array.isArray(pkmn[i].permanentSkills)) pkmn[i].permanentSkills = []
    unlockPermanentSkill(i, pkmn[i].ability)
  }
}


function exportData() {
  const raw = localStorage.getItem("gameData");
  if (!raw) return;

  // PokeChill Android (offline): export through the native SAF bridge instead
  // of a blob download (WebView has no download manager). The web version
  // (POKECHILL_OFFLINE === false) keeps its original behaviour below.
  if (window.POKECHILL_OFFLINE && window.AndroidBridge) {
    window.AndroidBridge.saveJson(
      `Pokechill-${new Date().toISOString().split("T")[0]}.json`,
      "application/json",
      raw
    );
    return;
  }

  const blob = new Blob([raw], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Pokechill-${new Date().toISOString().split("T")[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";

  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        localStorage.setItem("gameData", JSON.stringify(data));

        loadGame();

        window.location.reload();
      } catch (err) {
        alert("Error loading data.");
      }
    };

    reader.readAsText(file);
  };

  input.click();
}







function exportToText() {
  const raw = localStorage.getItem("gameData");
  if (!raw) {
    console.log("No save data found");
    return null;
  }
  
  return raw;
}

function loadFromText() {
  const input = document.getElementById("text-data-raw");
  if (!input) {
    alert("Element with id 'text-data-raw' not found");
    return;
  }

  const jsonData = input.value.trim();
  if (!jsonData) {
    alert("No data found in the input");
    return;
  }

  try {
    const data = JSON.parse(jsonData);
    localStorage.setItem("gameData", JSON.stringify(data));
    loadGame();
    window.location.reload();
  } catch (err) {
    alert("Error loading data: " + err.message);
  }
}

// paste from clipboard using the API
async function pasteFromClipboard() {
  const input = document.getElementById("text-data-raw");
  if (!input) {
    alert("Element with id 'text-data-raw' not found");
    return;
  }

  try {
    const text = await navigator.clipboard.readText();
    input.value = text;
    alert("Data pasted successfully!");
  } catch (err) {
    alert("Could not paste from clipboard. Please paste manually or grant clipboard permissions.");
  }
}

function textData() {
  saveGame();
  document.getElementById("tooltipTop").style.display = `none`;
  document.getElementById("tooltipTitle").style.display = `none`;

  const savedData = exportToText();

  if (savedData) {
    document.getElementById("tooltipMid").innerHTML = `
      This is your savefile code<br>You can copy or paste savefile codes here to export or import saves<br>
      <textarea id="text-data-raw" rows="10" style="width:95%; resize:vertical; font-family:monospace; font-size:0.9rem;"></textarea>
    `;
    
    document.getElementById("text-data-raw").value = savedData;

    document.getElementById("tooltipBottom").innerHTML = `
      <div style="display:flex;width:100%; align-items:center;justify-content:center; flex-wrap:wrap;">
        <div onClick='navigator.clipboard.writeText(document.getElementById("text-data-raw").value); alert("Data copied to the Clipboard!");' 
             style="cursor:pointer; font-size:2rem; width:33%; padding:10px;" id="prevent-tooltip-exit">
          Copy
        </div>
        <div onClick='pasteFromClipboard()' 
             style="cursor:pointer; font-size:2rem; width:33%; padding:10px;" id="prevent-tooltip-exit">
          Paste
        </div>
        <div onClick='loadFromText()' 
             style="cursor:pointer; font-size:2rem; width:33%; padding:10px;" id="prevent-tooltip-exit">
          Load
        </div>
      </div>
    `;
  } else {
    document.getElementById("tooltipMid").innerHTML = `
      You can copy or paste savefile codes here to export or import saves<br>
      <textarea id="text-data-raw" rows="10" style="width:95%; resize:vertical; font-family:monospace; font-size:0.9rem;"></textarea>
    `;

    document.getElementById("tooltipBottom").innerHTML = `
      <div style="display:flex;width:100%; align-items:center;justify-content:center;">
        <div onClick='pasteFromClipboard()' 
             style="cursor:pointer; font-size:2rem; width:50%; padding:10px;" id="prevent-tooltip-exit">
          Paste
        </div>
        <div onClick='loadFromText()' 
             style="cursor:pointer; font-size:2rem; width:50%; padding:10px;" id="prevent-tooltip-exit">
          Load
        </div>
      </div>
    `;
  }

  openTooltip();
}





setInterval(saveGame, 1 * 60 * 1000); 

document.addEventListener("keydown", (ev) => {
  if (ev.key.toLowerCase() === "s") {
    saveGame();
  }
});

function clearData() {
  localStorage.clear();
  window.location.reload();
}

function claimExportReward(){


        if (saved.claimedExportReward) return


        if (areas.vsGymLeaderBrock.defeated == false) {
        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").style.display = `none`
        document.getElementById("tooltipBottom").style.display = `none`
        document.getElementById("tooltipMid").innerHTML = `Defeat Gym Leader Brock in VS mode to unlock`
        openTooltip()
        return
        }

        document.getElementById("tooltipTitle").innerHTML = `Reward Received`
        document.getElementById("tooltipMid").style.display = `none`


        const rewardArray = [item.hpUp.id, item.protein.id, item.iron.id, item.calcium.id, item.zinc.id, item.carbos.id]
        const reward = arrayPick(rewardArray)

        const parentDiv = document.createElement("div");
        parentDiv.id = "reward-items-display"
        parentDiv.style.display = "flex"
        parentDiv.style.gap = "1rem"
        parentDiv.style.width = "100%"
        parentDiv.style.justifyContent = "center"


        document.getElementById("tooltipBottom").appendChild(parentDiv);


        const div = document.createElement("div");
        div.dataset.item = reward
        div.innerHTML = `<img style="scale:2; image-rendering: pixelated; cursor:help" src="img/items/${reward}.png">`;
        document.getElementById("reward-items-display").appendChild(div);

        const divCandy = document.createElement("div");
        divCandy.dataset.item = item.timeCandy.id
        divCandy.innerHTML = `<img style="scale:2; image-rendering: pixelated; cursor:help" src="img/items/${item.timeCandy.id}.png">`;
        document.getElementById("reward-items-display").appendChild(divCandy);

        if (item.magazineSubscription.got > 0) {
        const divF = document.createElement("div");
        divF.dataset.item = item.fashionCase.id
        divF.innerHTML = `<img style="scale:2; image-rendering: pixelated; cursor:help" src="img/items/${item.fashionCase.id}.png">`;
        document.getElementById("reward-items-display").appendChild(divF);
        }

        saved.claimedExportReward = true;
        saveGame()
        exportData()
        item[reward].got++
        item.timeCandy.got++
        if (item.magazineSubscription.got > 0) item.fashionCase.got++
        openMenu()


        openTooltip()



}