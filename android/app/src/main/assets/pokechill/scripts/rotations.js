let onDailyRotationHook = () => {};
let onEventRotationHook = () => {};

let rotationEventCurrent = 1;
let rotationWildCurrent = 1;
let rotationDungeonCurrent = 1;
let rotationFrontierCurrent = 1;
let rotationDimensionCurrent = 1;

let dailySeed = 0

function rotationBag(bagId, max) {
  const rng = mulberry32((bagId * 0x9e3779b9) ^ (max * 0x85ebca6b))
  const arr = []
  for (let i = 0; i < max; i++) arr.push(i + 1)
  for (let i = max - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const temp = arr[i]
    arr[i] = arr[j]
    arr[j] = temp
  }
  return arr
}

function rotationShuffleValue(cycle, max) {
  if (max == undefined || max < 1) max = 1
  const bagIndex = ((cycle % max) + max) % max
  const bagId = Math.floor(cycle / max)
  if (max == 1) return 1
  const arr = rotationBag(bagId, max)
  if (max == 2) {
    const anchor = rotationBag(0, 2)
    return anchor[bagIndex]
  }
  if (arr[0] == rotationBag(bagId - 1, max)[max - 1]) {
    const swap = arr[0]
    arr[0] = arr[1]
    arr[1] = swap
  }
  return arr[bagIndex]
}

function getSeed() {


  if (areas.vsUltraEntityLusamine.defeated) {rotationFrontierMax = 4} else {rotationFrontierMax = 3}

  const now = new Date();
  const utcTime = now.getTime(); 
  const halfDayNumber = Math.floor(utcTime / (1000 * 60 * 60 * 2));
  const dayNumber = Math.floor(utcTime / (1000 * 60 * 60 * 24));
  dailySeed = dayNumber


  rotationWildCurrent = rotationShuffleValue(halfDayNumber - 6, rotationWildMax);

  rotationDungeonCurrent = rotationShuffleValue(halfDayNumber, rotationDungeonMax);

  const period = Math.floor(utcTime / (1000 * 60 * 60 * 8));
  rotationEventCurrent = rotationShuffleValue(period - 3, rotationEventMax);
  rotationFrontierCurrent = rotationShuffleValue(period, rotationFrontierMax);
  rotationDimensionCurrent = rotationShuffleValue(period, rotationDimensionMax);

  return dayNumber;
}

function setWildAreas() {


    let currentWildRotation = rotationWildCurrent
    if (saved.alternateWildRotation=="true") {
        currentWildRotation = rotationWildCurrent-1
        if (currentWildRotation<=0) currentWildRotation = rotationWildMax
    } 

    document.getElementById("event-banner").style.display = "none"
    document.getElementById("event-banner-category").style.display = "none"


    document.getElementById("explore-selector").innerHTML = `
            <div style="background: #967546; outline: solid 1px #FF9E3D; color: white; z-index: 2;" onclick="setWildAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m17.861 3.163l.16.054l1.202.4c.463.155.87.29 1.191.44c.348.162.667.37.911.709s.341.707.385 1.088c.04.353.04.781.04 1.27v8.212c0 .698 0 1.287-.054 1.753c-.056.484-.182.962-.535 1.348a2.25 2.25 0 0 1-.746.538c-.478.212-.971.18-1.448.081c-.46-.096-1.018-.282-1.68-.503l-.043-.014c-1.12-.374-1.505-.49-1.877-.477a2.3 2.3 0 0 0-.441.059c-.363.085-.703.299-1.686.954l-1.382.922l-.14.093c-1.062.709-1.8 1.201-2.664 1.317c-.863.116-1.705-.165-2.915-.57l-.16-.053l-1.202-.4c-.463-.155-.87-.29-1.191-.44c-.348-.162-.667-.37-.911-.71c-.244-.338-.341-.706-.385-1.088c-.04-.353-.04-.78-.04-1.269V8.665c0-.699 0-1.288.054-1.753c.056-.484.182-.962.535-1.348a2.25 2.25 0 0 1 .746-.538c.478-.213.972-.181 1.448-.081c.46.095 1.018.282 1.68.503l.043.014c1.12.373 1.505.49 1.878.477a2.3 2.3 0 0 0 .44-.059c.363-.086.703-.3 1.686-.954l1.382-.922l.14-.094c1.062-.708-1.8-1.2 2.663-1.316c.864-.116 1.706.165 2.916.57m-2.111.943V16.58c.536.058 1.1.246 1.843.494l.125.042c.717.239 1.192.396 1.555.472c.356.074.477.04.532.016a.75.75 0 0 0 .249-.179c.04-.044.11-.149.152-.51c.043-.368.044-.869.044-1.624V7.163c0-.54-.001-.88-.03-1.138c-.028-.239-.072-.328-.112-.382c-.039-.054-.109-.125-.326-.226c-.236-.11-.56-.218-1.07-.389l-1.165-.388c-.887-.296-1.413-.464-1.797-.534m-1.5 12.654V4.434c-.311.18-.71.441-1.276.818l-1.382.922l-.11.073c-.688.46-1.201.802-1.732.994v12.326c.311-.18.71-.442 1.276-.819l1.382-.921l.11-.073c.688-.46 1.201-.802 1.732-.994m-6 3.135V7.42c-.536-.058-1.1-.246-1.843-.494l-.125-.042c-.717-.239-1.192-.396-1.556-.472c-.355-.074-.476-.041-.53-.017a.75.75 0 0 0-.25.18c-.04.043-.11.148-.152.509c-.043.368-.044.87-.044 1.625v8.128c0 .54.001.88.03 1.138c.028.239.072.327.112.382c.039.054.109.125.326.226c.236.11.56.218 1.07.389l1.165.388c.887.295 1.412.463 1.797.534" clip-rule="evenodd"/></svg>                Wild Areas</div>
            <div onclick="setDungeonAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M4 10a8 8 0 1 1 16 0v8.667c0 1.246 0 1.869-.268 2.333a2 2 0 0 1-.732.732c-.464.268-1.087.268-2.333.268H7.333C6.087 22 5.464 22 5 21.732A2 2 0 0 1 4.268 21C4 20.536 4 19.913 4 18.667z"/><path d="M20 18H9c-.943 0-1.414 0-1.707.293S7 19.057 7 20v2m13-8h-7c-.943 0-1.414 0-1.707.293S11 15.057 11 16v2m9-8h-3c-.943 0-1.414 0-1.707.293S15 11.057 15 12v2"/></g></svg>
                Dungeons</div>
            <div onclick="setEventAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m5.658 11.002l-1.47 3.308c-1.856 4.174-2.783 6.261-1.77 7.274s3.098.085 7.272-1.77L13 18.342c2.517-1.119 3.776-1.678 3.976-2.757s-.774-2.053-2.722-4l-1.838-1.839c-1.947-1.948-2.921-2.922-4-2.721c-1.079.2-1.638 1.459-2.757 3.976M6.5 10.5l7 7m-9-2l4 4M16 8l3-3m-4.803-3c.4.667.719 2.4-1.197 4m9 3.803c-.667-.4-2.4-.719-4 1.197m0-9v.02M22 6v.02M21 13v.02M11 3v.02"/></svg>
                Events</div>
    `



    document.getElementById("explore-listing").innerHTML = ""
    document.getElementById("explore-menu-header").innerHTML = `
    <div style="display:flex; gap:0.2rem" >
    <span >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m17.861 3.163l.16.054l1.202.4c.463.155.87.29 1.191.44c.348.162.667.37.911.709s.341.707.385 1.088c.04.353.04.781.04 1.27v8.212c0 .698 0 1.287-.054 1.753c-.056.484-.182.962-.535 1.348a2.25 2.25 0 0 1-.746.538c-.478.212-.971.18-1.448.081c-.46-.096-1.018-.282-1.68-.503l-.043-.014c-1.12-.374-1.505-.49-1.877-.477a2.3 2.3 0 0 0-.441.059c-.363.085-.703.299-1.686.954l-1.382.922l-.14.093c-1.062.709-1.8 1.201-2.664 1.317c-.863.116-1.705-.165-2.915-.57l-.16-.053l-1.202-.4c-.463-.155-.87-.29-1.191-.44c-.348-.162-.667-.37-.911-.71c-.244-.338-.341-.706-.385-1.088c-.04-.353-.04-.78-.04-1.269V8.665c0-.699 0-1.288.054-1.753c.056-.484.182-.962.535-1.348a2.25 2.25 0 0 1 .746-.538c.478-.213.972-.181 1.448-.081c.46.095 1.018.282 1.68.503l.043.014c1.12.373 1.505.49 1.878.477a2.3 2.3 0 0 0 .44-.059c.363-.086.703-.3 1.686-.954l1.382-.922l.14-.094c1.062-.708-1.8-1.2 2.663-1.316c.864-.116 1.706.165 2.916.57m-2.111.943V16.58c.536.058 1.1.246 1.843.494l.125.042c.717.239 1.192.396 1.555.472c.356.074.477.04.532.016a.75.75 0 0 0 .249-.179c.04-.044.11-.149.152-.51c.043-.368.044-.869.044-1.624V7.163c0-.54-.001-.88-.03-1.138c-.028-.239-.072-.328-.112-.382c-.039-.054-.109-.125-.326-.226c-.236-.11-.56-.218-1.07-.389l-1.165-.388c-.887-.296-1.413-.464-1.797-.534m-1.5 12.654V4.434c-.311.18-.71.441-1.276.818l-1.382.922l-.11.073c-.688.46-1.201.802-1.732.994v12.326c.311-.18.71-.442 1.276-.819l1.382-.921l.11-.073c.688-.46 1.201-.802 1.732-.994m-6 3.135V7.42c-.536-.058-1.1-.246-1.843-.494l-.125-.042c-.717-.239-1.192-.396-1.556-.472c-.355-.074-.476-.041-.53-.017a.75.75 0 0 0-.25.18c-.04.043-.11.148-.152.509c-.043.368-.044.87-.044 1.625v8.128c0 .54.001.88.03 1.138c.028.239.072.327.112.382c.039.054.109.125.326.226c.236.11.56.218 1.07.389l1.165.388c.887.295 1.412.463 1.797.534" clip-rule="evenodd"/></svg>    Wild Areas
    </span>
    <span class="header-help" data-help="Wild Areas"><svg  style="opacity:0.8; pointer-events:none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="currentColor"><g opacity="0.2"><path d="M12.739 17.213a2 2 0 1 1-4 0a2 2 0 0 1 4 0"/><path fill-rule="evenodd" d="M10.71 5.765c-.67 0-1.245.2-1.65.486c-.39.276-.583.597-.639.874a1.45 1.45 0 0 1-2.842-.574c.227-1.126.925-2.045 1.809-2.67c.92-.65 2.086-1.016 3.322-1.016c2.557 0 5.208 1.71 5.208 4.456c0 1.59-.945 2.876-2.169 3.626a1.45 1.45 0 1 1-1.514-2.474c.57-.349.783-.794.783-1.152c0-.574-.715-1.556-2.308-1.556" clip-rule="evenodd"/><path fill-rule="evenodd" d="M10.71 9.63c.8 0 1.45.648 1.45 1.45v1.502a1.45 1.45 0 1 1-2.9 0V11.08c0-.8.649-1.45 1.45-1.45" clip-rule="evenodd"/><path fill-rule="evenodd" d="M14.239 8.966a1.45 1.45 0 0 1-.5 1.99l-2.284 1.367a1.45 1.45 0 0 1-1.49-2.488l2.285-1.368a1.45 1.45 0 0 1 1.989.5" clip-rule="evenodd"/></g><path d="M11 16.25a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0"/><path fill-rule="evenodd" d="M9.71 4.065c-.807 0-1.524.24-2.053.614c-.51.36-.825.826-.922 1.308a.75.75 0 1 1-1.47-.297c.186-.922.762-1.696 1.526-2.236c.796-.562 1.82-.89 2.919-.89c2.325 0 4.508 1.535 4.508 3.757c0 1.292-.768 2.376-1.834 3.029a.75.75 0 0 1-.784-1.28c.729-.446 1.118-1.093 1.118-1.749c0-1.099-1.182-2.256-3.008-2.256m0 5.265a.75.75 0 0 1 .75.75v1.502a.75.75 0 1 1-1.5 0V10.08a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12.638 8.326a.75.75 0 0 1-.258 1.029l-2.285 1.368a.75.75 0 1 1-.77-1.287l2.285-1.368a.75.75 0 0 1 1.028.258" clip-rule="evenodd"/></g></svg></span>
    </div>

    <div class="rotation-timer">
    <strong><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 2c.416 0 .753.324.753.724v1.46c.668-.012 1.417-.012 2.26-.012h4.015c.842 0 1.591 0 2.259.013v-1.46c0-.4.337-.725.753-.725s.753.324.753.724V4.25c1.445.111 2.394.384 3.09 1.055c.698.67.982 1.582 1.097 2.972L22 9H2v-.724c.116-1.39.4-2.302 1.097-2.972s1.645-.944 3.09-1.055V2.724c0-.4.337-.724.753-.724"/><path fill="currentColor" d="M22 14v-2c0-.839-.004-2.335-.017-3H2.01c-.013.665-.01 2.161-.01 3v2c0 3.771 0 5.657 1.172 6.828S6.228 22 10 22h4c3.77 0 5.656 0 6.828-1.172S22 17.772 22 14" opacity="0.5"/><path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0"/></svg>
    Rotation ${currentWildRotation}/${rotationWildMax}</strong>
    <div class="time-counter-daily"></div>
    </div>
    `

    document.getElementById("explore-menu-header").style.backgroundImage = "url(img/bg/forest.png)"

    let ticketIndex = 0




    //seasonal events
    for (const i in season) {

    if (saved.currentSeason !== i) continue

    const div = document.createElement("div");
    div.className = "explore-ticket frontier-ticket";
    div.style.filter = `hue-rotate(${season[i].hue}deg)`



    let seasonTimer = `Limited Area Until ${season[saved.currentSeason].end.month}/${season[saved.currentSeason].end.day}`
    if (saved.temporalSeason != undefined) seasonTimer = `Limited Area Until ${saved.temporalSeason.end.month}/${saved.temporalSeason.end.day}`


    div.innerHTML = `
        <span class="hitbox"></span>
        <div style="width: 100%;">
        ${season[i].svg}
        <span class="explore-ticket-left">
        <span style="font-size:1.2rem">${season[i].name}</span>
        <span><strong style="background:#964646ff">${seasonTimer}</strong><span></span></span>
        </span>
        </div>
        <div style="width: 8rem;" class="explore-ticket-right">
        <span class="explore-ticket-bg" style="filter:hue-rotate(-${season[i].hue}deg); background-image: url(img/bg/${season[i].background}.png);"></span>
        <img class="explore-ticket-sprite sprite-trim" style="z-index: 10;  filter:hue-rotate(-${season[i].hue}deg)" src="img/pkmn/sprite/${season[i].icon.id}.png">
        </div>
    `;

    document.getElementById("explore-listing").appendChild(div);

    div.addEventListener("click", e => { 
        tooltipData('seasonPreview', i)
    })




    }






    //generate the wildlife park pokemon
    if (saved.lastWildlifeRotation != rotationWildCurrent && document.getElementById("explore-menu").style.display == "flex" ) {
        
        saved.lastWildlifeRotation = rotationWildCurrent

        const uncommonPick = [].concat(arrayPick(wildlifePoolUncommon, 1)).map(name => pkmn[name])

        areas.wildlifePark.spawns.common = arrayPick(wildlifePoolCommon,3).map(name => pkmn[name]);
        areas.wildlifePark.spawns.uncommon = uncommonPick
        areas.wildlifePark.spawns.rare = [].concat(arrayPick(wildlifePoolRare, 1)).map(name => pkmn[name])
        areas.wildlifePark.icon = arrayPick(uncommonPick)
        
    }


    let completionMark = true
    let shinyMark = true
    for (const i in areas.wildlifePark.spawns){
        for (const e in areas.wildlifePark.spawns[i]){
        if (pkmn[areas.wildlifePark.spawns[i][e].id].caught<=0) completionMark = false
        if (pkmn[areas.wildlifePark.spawns[i][e].id].shiny!=true) shinyMark = false
        }
    }

    let completedFlair = ""
    if (completionMark==true) completedFlair = `<svg style="color: rgb(105, 118, 175); opacity: 0.7" class="completed-flair" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" d="M14 1v1.5c-.75 0-.75 1.5 0 1.5v1.25c-.75 0-.75 1.5 0 1.5v1.5c-.75 0-.75 1.5 0 1.5V11c-.75 0-.75 1.5 0 1.5V14h-1.5c0-.75-1.5-.75-1.5 0H9.75c0-.75-1.5-.75-1.5 0h-1.5c0-.75-1.5-.75-1.5 0H4c0-.75-1.5-.75-1.5 0H1v-1.5c.75 0 .75-1.5 0-1.5V9.75c.75 0 .75-1.5 0-1.5v-1.5c.75 0 .75-1.5 0-1.5V4c.75 0 .75-1.5 0-1.5V1h1.5c0 .75 1.5.75 1.5 0h1.25c0 .75 1.5.75 1.5 0h1.5c0 .75 1.5.75 1.5 0H11c0 .75 1.5.75 1.5 0zm-2 2H3v9h9zm-1 1v7H4V4z"/></svg>`
    if (shinyMark==true) completedFlair = `<svg style="color: rgb(209, 130, 11); opacity: 0.7" class="completed-flair" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" d="M14 1v1.5c-.75 0-.75 1.5 0 1.5v1.25c-.75 0-.75 1.5 0 1.5v1.5c-.75 0-.75 1.5 0 1.5V11c-.75 0-.75 1.5 0 1.5V14h-1.5c0-.75-1.5-.75-1.5 0H9.75c0-.75-1.5-.75-1.5 0h-1.5c0-.75-1.5-.75-1.5 0H4c0-.75-1.5-.75-1.5 0H1v-1.5c.75 0 .75-1.5 0-1.5V9.75c.75 0 .75-1.5 0-1.5v-1.5c.75 0 .75-1.5 0-1.5V4c.75 0 .75-1.5 0-1.5V1h1.5c0 .75 1.5.75 1.5 0h1.25c0 .75 1.5.75 1.5 0h1.5c0 .75 1.5.75 1.5 0H11c0 .75 1.5.75 1.5 0zm-2 2H3v9h9zm-1 1v7H4V4z"/></svg>`



    const divPark = document.createElement("div");
    divPark.className = "explore-ticket";
    divPark.innerHTML = `
                <span class="hitbox"></span>
                <div style="width: 100%;">
                <svg class="barcode-flair" xmlns="http://www.w3.org/2000/svg" width="236" height="144"><svg id="barcodeSVG" role="img" aria-label="Barcode preview" width="234px" height="142px" x="0px" y="0px" viewBox="0 0 234 142" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)"><rect x="0" y="0" width="234" height="142" style="fill:none;"/><g transform="translate(10, 10)" style="fill:#000000;"><text style="font: 20px Roboto" text-anchor="start" x="0" y="122">5</text></g><g transform="translate(34, 10)" style="fill:#000000;"><rect x="0" y="0" width="2" height="112"/><rect x="4" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="3" y="134"></text></g><g transform="translate(40, 10)" style="fill:#000000;"><rect x="6" y="0" width="2" height="100"/><rect x="10" y="0" width="4" height="100"/><rect x="16" y="0" width="2" height="100"/><rect x="22" y="0" width="6" height="100"/><rect x="30" y="0" width="4" height="100"/><rect x="38" y="0" width="4" height="100"/><rect x="46" y="0" width="2" height="100"/><rect x="52" y="0" width="4" height="100"/><rect x="58" y="0" width="8" height="100"/><rect x="68" y="0" width="2" height="100"/><rect x="74" y="0" width="6" height="100"/><rect x="82" y="0" width="2" height="100"/><text style="font: 20px Roboto" text-anchor="middle" x="42" y="122">901234</text></g><g transform="translate(124, 10)" style="fill:#000000;"><rect x="2" y="0" width="2" height="112"/><rect x="6" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="5" y="134"></text></g><g transform="translate(134, 10)" style="fill:#000000;"><rect x="0" y="0" width="4" height="100"/><rect x="8" y="0" width="4" height="100"/><rect x="14" y="0" width="4" height="100"/><rect x="20" y="0" width="4" height="100"/><rect x="28" y="0" width="2" height="100"/><rect x="38" y="0" width="2" height="100"/><rect x="42" y="0" width="2" height="100"/><rect x="46" y="0" width="6" height="100"/><r...[486 bytes truncated]
                <span class="explore-ticket-left">
                ${completedFlair}
                <span class="ticket-flair">
                #0000
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M25.719 4.781a2.9 2.9 0 0 0-1.125.344l-4.719 2.5L13.5 6.062l-.375-.093l-.375.187l-2.156 1.25l-1.281.75l1.187.906l2.719 2.063l-3.406 1.813l-3.657-1.657l-.437-.187l-.438.219l-1.75.937l-1.156.625l.875.938l5.406 5.812l.5.594l.688-.375L15 17.094l-1.031 5.687l-.344 1.813l1.719-.719l2.562-1.094l.375-.156l.157-.375l3.718-9.031l5.25-2.813c1.446-.777 2.028-2.617 1.25-4.062a3 3 0 0 0-1.781-1.438a3.1 3.1 0 0 0-1.156-.125m.187 2c.125-.008.254-.004.375.032a.979.979 0 0 1 .188 1.812l-5.594 3.031l-.313.156l-.125.344l-3.718 8.938l-.438.187l1.063-5.906l.375-2.031l-1.813.969l-6.312 3.406l-3.969-4.313l.156-.094l3.657 1.626l.468.218l.406-.25l15.22-8.031a.9.9 0 0 1 .374-.094M13.375 8.094l3.844.937l-2.063 1.063l-2.25-1.719zM3 26v2h26v-2z"/></svg>
                </span>
                        <span style="font-size:1.2rem">${format(areas.wildlifePark.id)}</span>
                        <span><strong style="background:#B18451">Level: ${Math.max(1,areas.wildlifePark.level-10)}-${areas.wildlifePark.level}</strong><span></span></span>
                    </span>
                </div>
                <div style="width: 8rem;" class="explore-ticket-right">
                    <span class="explore-ticket-bg" style="background-image: url(img/bg/${areas.wildlifePark.background}.png);"></span>
                    <img class="explore-ticket-sprite sprite-trim" style="z-index: 10;" src="img/pkmn/sprite/${areas.wildlifePark.icon.id}.png">
                </div>
        `;
    document.getElementById("explore-listing").appendChild(divPark);
    divPark.dataset.area = areas.wildlifePark.id

    divPark.addEventListener("click", e => { 
            saved.currentAreaBuffer = areas.wildlifePark.id
            document.getElementById(`preview-team-exit`).style.display = "flex"
            document.getElementById(`team-menu`).style.zIndex = `50`
            document.getElementById(`team-menu`).style.display = `flex`
            document.getElementById("menu-button-parent").style.display = "none"
            updatePreviewTeam()
            afkSeconds = 0
            document.getElementById(`explore-menu`).style.display = `none`
        })






    for (const i in areas) {
        if (areas[i].type !== "wild") continue;
        if (areas[i].rotation !== currentWildRotation) continue;

        const divAreas = document.createElement("div");
        divAreas.className = "explore-ticket";

        divAreas.dataset.area = i

        if ( areas[i].unlockRequirement == undefined || areas[i].unlockRequirement() ) {
        divAreas.addEventListener("click", e => { 
            saved.currentAreaBuffer = i
            document.getElementById(`preview-team-exit`).style.display = "flex"
            document.getElementById(`team-menu`).style.zIndex = `50`
            document.getElementById(`team-menu`).style.display = `flex`
            document.getElementById("menu-button-parent").style.display = "none"
            updatePreviewTeam()
            afkSeconds = 0
            document.getElementById(`explore-menu`).style.display = `none`
        })
        }


        let unlockRequirement = ""
        if (areas[i].unlockRequirement && !areas[i].unlockRequirement()) unlockRequirement =`<span class="ticket-unlock">
       
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity="0.5"/><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/></svg>
       <span>${areas[i].unlockDescription}</span>
       </span>`
        ticketIndex++


    let completionMark = true
    let shinyMark = true
    for (const e in areas[i].spawns){
        for (const x in areas[i].spawns[e]){
        if (pkmn[areas[i].spawns[e][x].id].caught<=0) completionMark = false
        if (pkmn[areas[i].spawns[e][x].id].shiny!=true) shinyMark = false
        }
    }
    

    let completedFlair = ""
    if (completionMark==true) completedFlair = `<svg style="color: rgb(105, 118, 175); opacity: 0.7" class="completed-flair" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" d="M14 1v1.5c-.75 0-.75 1.5 0 1.5v1.25c-.75 0-.75 1.5 0 1.5v1.5c-.75 0-.75 1.5 0 1.5V11c-.75 0-.75 1.5 0 1.5V14h-1.5c0-.75-1.5-.75-1.5 0H9.75c0-.75-1.5-.75-1.5 0h-1.5c0-.75-1.5-.75-1.5 0H4c0-.75-1.5-.75-1.5 0H1v-1.5c.75 0 .75-1.5 0-1.5V9.75c.75 0 .75-1.5 0-1.5v-1.5c.75 0 .75-1.5 0-1.5V4c.75 0 .75-1.5 0-1.5V1h1.5c0 .75 1.5.75 1.5 0h1.25c0 .75 1.5.75 1.5 0h1.5c0 .75 1.5.75 1.5 0H11c0 .75 1.5.75 1.5 0zm-2 2H3v9h9zm-1 1v7H4V4z"/></svg>`
    if (shinyMark==true) completedFlair = `<svg style="color: rgb(209, 130, 11); opacity: 0.7" class="completed-flair" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"><path fill="currentColor" d="M14 1v1.5c-.75 0-.75 1.5 0 1.5v1.25c-.75 0-.75 1.5 0 1.5v1.5c-.75 0-.75 1.5 0 1.5V11c-.75 0-.75 1.5 0 1.5V14h-1.5c0-.75-1.5-.75-1.5 0H9.75c0-.75-1.5-.75-1.5 0h-1.5c0-.75-1.5-.75-1.5 0H4c0-.75-1.5-.75-1.5 0H1v-1.5c.75 0 .75-1.5 0-1.5V9.75c.75 0 .75-1.5 0-1.5v-1.5c.75 0 .75-1.5 0-1.5V4c.75 0 .75-1.5 0-1.5V1h1.5c0 .75 1.5.75 1.5 0h1.25c0 .75 1.5.75 1.5 0h1.5c0 .75 1.5.75 1.5 0H11c0 .75 1.5.75 1.5 0zm-2 2H3v9h9zm-1 1v7H4V4z"/></svg>`



        divAreas.innerHTML = `
                ${unlockRequirement}
                <span class="hitbox"></span>
                <div style="width: 100%;">
                <svg class="barcode-flair" xmlns="http://www.w3.org/2000/svg" width="236" height="144"><svg id="barcodeSVG" role="img" aria-label="Barcode preview" width="234px" height="142px" x="0px" y="0px" viewBox="0 0 234 142" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)"><rect x="0" y="0" width="234" height="142" style="fill:none;"/><g transform="translate(10, 10)" style="fill:#000000;"><text style="font: 20px Roboto" text-anchor="start" x="0" y="122">5</text></g><g transform="translate(34, 10)" style="fill:#000000;"><rect x="0" y="0" width="2" height="112"/><rect x="4" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="3" y="134"></text></g><g transform="translate(40, 10)" style="fill:#000000;"><rect x="6" y="0" width="2" height="100"/><rect x="10" y="0" width="4" height="100"/><rect x="16" y="0" width="2" height="100"/><rect x="22" y="0" width="6" height="100"/><rect x="30" y="0" width="4" height="100"/><rect x="38" y="0" width="4" height="100"/><rect x="46" y="0" width="2" height="100"/><rect x="52" y="0" width="4" height="100"/><rect x="58" y="0" width="8" height="100"/><rect x="68" y="0" width="2" height="100"/><rect x="74" y="0" width="6" height="100"/><rect x="82" y="0" width="2" height="100"/><text style="font: 20px Roboto" text-anchor="middle" x="42" y="122">901234</text></g><g transform="translate(124, 10)" style="fill:#000000;"><rect x="2" y="0" width="2" height="112"/><rect x="6" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="5" y="134"></text></g><g transform="translate(134, 10)" style="fill:#000000;"><rect x="0" y="0" width="4" height="100"/><rect x="8" y="0" width="4" height="100"/><rect x="14" y="0" width="4" height="100"/><rect x="20" y="0" width="4" height="100"/><rect x="28" y="0" width="2" height="100"/><rect x="38" y="0" width="2" height="100"/><rect x="42" y="0" width="2" height="100"/><rect x="46" y="0" width="6" height="100"/><r...[486 bytes truncated]
                <span class="explore-ticket-left">
                ${completedFlair}
                <span class="ticket-flair">
                #000${ticketIndex}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M25.719 4.781a2.9 2.9 0 0 0-1.125.344l-4.719 2.5L13.5 6.062l-.375-.093l-.375.187l-2.156 1.25l-1.281.75l1.187.906l2.719 2.063l-3.406 1.813l-3.657-1.657l-.437-.187l-.438.219l-1.75.937l-1.156.625l.875.938l5.406 5.812l.5.594l.688-.375L15 17.094l-1.031 5.687l-.344 1.813l1.719-.719l2.562-1.094l.375-.156l.157-.375l3.718-9.031l5.25-2.813c1.446-.777 2.028-2.617 1.25-4.062a3 3 0 0 0-1.781-1.438a3.1 3.1 0 0 0-1.156-.125m.187 2c.125-.008.254-.004.375.032a.979.979 0 0 1 .188 1.812l-5.594 3.031l-.313.156l-.125.344l-3.718 8.938l-.438.187l1.063-5.906l.375-2.031l-1.813.969l-6.312 3.406l-3.969-4.313l.156-.094l3.657 1.626l.468.218l.406-.25l15.22-8.031a.9.9 0 0 1 .374-.094M13.375 8.094l3.844.937l-2.063 1.063l-2.25-1.719zM3 26v2h26v-2z"/></svg>
                </span>
                        <span style="font-size:1.2rem">${format(i)}</span>
                        <span><strong style="background:#B18451">Level: ${Math.max(1,areas[i].level-10)}-${areas[i].level}</strong><span></span></span>
                    </span>
                </div>
                <div style="width: 8rem;" class="explore-ticket-right">
                    <span class="explore-ticket-bg" style="background-image: url(img/bg/${areas[i].background}.png);"></span>
                    <img class="explore-ticket-sprite sprite-trim" style="z-index: 10;" src="img/pkmn/sprite/${areas[i].icon.id}.png">
                </div>
        `;
        document.getElementById("explore-listing").appendChild(divAreas);

    }
    updateDailyCounters()

}

function setDungeonAreas() {



        document.getElementById("event-banner").style.display = "none"
    document.getElementById("event-banner-category").style.display = "none"


    document.getElementById("explore-selector").innerHTML = `
            <div onclick="setWildAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m17.861 3.163l.16.054l1.202.4c.463.155.87.29 1.191.44c.348.162.667.37.911.709s.341.707.385 1.088c.04.353.04.781.04 1.27v8.212c0 .698 0 1.287-.054 1.753c-.056.484-.182.962-.535 1.348a2.25 2.25 0 0 1-.746.538c-.478.212-.971.18-1.448.081c-.46-.096-1.018-.282-1.68-.503l-.043-.014c-1.12-.374-1.505-.49-1.877-.477a2.3 2.3 0 0 0-.441.059c-.363.085-.703.299-1.686.954l-1.382.922l-.14.093c-1.062.709-1.8 1.201-2.664 1.317c-.863.116-1.705-.165-2.915-.57l-.16-.053l-1.202-.4c-.463-.155-.87-.29-1.191-.44c-.348-.162-.667-.37-.911-.71c-.244-.338-.341-.706-.385-1.088c-.04-.353-.04-.78-.04-1.269V8.665c0-.699 0-1.288.054-1.753c.056-.484.182-.962.535-1.348a2.25 2.25 0 0 1 .746-.538c.478-.213.972-.181 1.448-.081c.46.095 1.018.282 1.68.503l.043.014c1.12.373 1.505.49 1.878.477a2.3 2.3 0 0 0 .44-.059c.363-.086.703-.3 1.686-.954l1.382-.922l.14-.094c1.062-.708-1.8-1.2 2.663-1.316c.864-.116 1.706.165 2.916.57m-2.111.943V16.58c.536.058 1.1.246 1.843.494l.125.042c.717.239 1.192.396 1.555.472c.356.074.477.04.532.016a.75.75 0 0 0 .249-.179c.04-.044.11-.149.152-.51c.043-.368.044-.869.044-1.624V7.163c0-.54-.001-.88-.03-1.138c-.028-.239-.072-.328-.112-.382c-.039-.054-.109-.125-.326-.226c-.236-.11-.56-.218-1.07-.389l-1.165-.388c-.887-.296-1.413-.464-1.797-.534m-1.5 12.654V4.434c-.311.18-.71.441-1.276.818l-1.382.922l-.11.073c-.688.46-1.201.802-1.732.994v12.326c.311-.18.71-.442 1.276-.819l1.382-.921l.11-.073c.688-.46 1.201-.802 1.732-.994m-6 3.135V7.42c-.536-.058-1.1-.246-1.843-.494l-.125-.042c-.717-.239-1.192-.396-1.556-.472c-.355-.074-.476-.041-.53-.017a.75.75 0 0 0-.25.18c-.04.043-.11.148-.152.509c-.043.368-.044.87-.044 1.625v8.128c0 .54.001.88.03 1.138c.028.239.072.327.112.382c.039.054.109.125.326-.226c.236.11.56.218 1.07.389l1.165.388c.887.295 1.412.463 1.797.534" clip-rule="evenodd"/></svg>                Wild Areas</div>
            <div style="background: #58644bff; outline: solid 1px #82df60ff; color: white; z-index: 2;" onclick="setDungeonAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M4 10a8 8 0 1 1 16 0v8.667c0 1.246 0 1.869-.268 2.333a2 2 0 0 1-.732.732c-.464.268-1.087.268-2.333.268H7.333C6.087 22 5.464 22 5 21.732A2 2 0 0 1 4.268 21C4 20.536 4 19.913 4 18.667z"/><path d="M20 18H9c-.943 0-1.414 0-1.707.293S7 19.057 7 20v2m13-8h-7c-.943 0-1.414 0-1.707.293S11 15.057 11 16v2m9-8h-3c-.943 0-1.414 0-1.707.293S15 11.057 15 12v2"/></g></svg>
                Dungeons</div>
            <div onclick="setEventAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m5.658 11.002l-1.47 3.308c-1.856 4.174-2.783 6.261-1.77 7.274s3.098.085 7.272-1.77L13 18.342c2.517-1.119 3.776-1.678 3.976-2.757s-.774-2.053-2.722-4l-1.838-1.839c-1.947-1.948-2.921-2.922-4-2.721c-1.079.2-1.638 1.459-2.757 3.976M6.5 10.5l7 7m-9-2l4 4M16 8l3-3m-4.803-3c.4.667.719 2.4-1.197 4m9 3.803c-.667-.4-2.4-.719-4 1.197m0-9v.02M22 6v.02M21 13v.02M11 3v.02"/></svg>
                Events</div>
    `

    document.getElementById("explore-listing").innerHTML = ""
    document.getElementById("explore-menu-header").innerHTML = `
    <div style="display:flex; gap:0.2rem" >
    <span >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M4 10a8 8 0 1 1 16 0v8.667c0 1.246 0 1.869-.268 2.333a2 2 0 0 1-.732.732c-.464.268-1.087.268-2.333.268H7.333C6.087 22 5.464 22 5 21.732A2 2 0 0 1 4.268 21C4 20.536 4 19.913 4 18.667z"/><path d="M20 18H9c-.943 0-1.414 0-1.707.293S7 19.057 7 20v2m13-8h-7c-.943 0-1.414 0-1.707.293S11 15.057 11 16v2m9-8h-3c-.943 0-1.414 0-1.707.293S15 11.057 15 12v2"/></g></svg>
    Dungeons
    </span>
    <span class="header-help" data-help="Dungeons"><svg  style="opacity:0.8; pointer-events:none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="currentColor"><g opacity="0.2"><path d="M12.739 17.213a2 2 0 1 1-4 0a2 2 0 0 1 4 0"/><path fill-rule="evenodd" d="M10.71 5.765c-.67 0-1.245.2-1.65.486c-.39.276-.583.597-.639.874a1.45 1.45 0 0 1-2.842-.574c.227-1.126.925-2.045 1.809-2.67c.92-.65 2.086-1.016 3.322-1.016c2.557 0 5.208 1.71 5.208 4.456c0 1.59-.945 2.876-2.169 3.626a1.45 1.45 0 1 1-1.514-2.474c.57-.349.783-.794.783-1.152c0-.574-.715-1.556-2.308-1.556" clip-rule="evenodd"/><path fill-rule="evenodd" d="M10.71 9.63c.8 0 1.45.648 1.45 1.45v1.502a1.45 1.45 0 1 1-2.9 0V11.08c0-.8.649-1.45 1.45-1.45" clip-rule="evenodd"/><path fill-rule="evenodd" d="M14.239 8.966a1.45 1.45 0 0 1-.5 1.99l-2.284 1.367a1.45 1.45 0 0 1-1.49-2.488l2.285-1.368a1.45 1.45 0 0 1 1.989.5" clip-rule="evenodd"/></g><path d="M11 16.25a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0"/><path fill-rule="evenodd" d="M9.71 4.065c-.807 0-1.524.24-2.053.614c-.51.36-.825.826-.922 1.308a.75.75 0 1 1-1.47-.297c.186-.922.762-1.696 1.526-2.236c.796-.562 1.82-.89 2.919-.89c2.325 0 4.508 1.535 4.508 3.757c0 1.292-.768 2.376-1.834 3.029a.75.75 0 0 1-.784-1.28c.729-.446 1.118-1.093 1.118-1.749c0-1.099-1.182-2.256-3.008-2.256m0 5.265a.75.75 0 0 1 .75.75v1.502a.75.75 0 1 1-1.5 0V10.08a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12.638 8.326a.75.75 0 0 1-.258 1.029l-2.285 1.368a.75.75 0 1 1-.77-1.287l2.285-1.368a.75.75 0 0 1 1.028.258" clip-rule="evenodd"/></g></svg></span>
    </div>

    <div class="rotation-timer">
    <strong><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 2c.416 0 .753.324.753.724v1.46c.668-.012 1.417-.012 2.26-.012h4.015c.842 0 1.591 0 2.259.013v-1.46c0-.4.337-.725.753-.725s.753.324.753.724V4.25c1.445.111 2.394.384 3.09 1.055c.698.67.982 1.582 1.097 2.972L22 9H2v-.724c.116-1.39.4-2.302 1.097-2.972s1.645-.944 3.09-1.055V2.724c0-.4.337-.724.753-.724"/><path fill="currentColor" d="M22 14v-2c0-.839-.004-2.335-.017-3H2.01c-.013.665-.01 2.161-.01 3v2c0 3.771 0 5.657 1.172 6.828S6.228 22 10 22h4c3.77 0 5.656 0 6.828-1.172S22 17.772 22 14" opacity="0.5"/><path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0"/></svg>
    Rotation ${rotationDungeonCurrent}/${rotationDungeonMax}</strong>
    <div class="time-counter-daily"></div>
    </div>



    `
    document.getElementById("explore-menu-header").style.backgroundImage = "url(img/bg/cave.png)" 
    let ticketIndex = 0

    for (const i in areas) {
        if (areas[i].type !== "dungeon") continue;
        if (areas[i].rotation !== rotationDungeonCurrent) continue;


        const divAreas = document.createElement("div");
        divAreas.className = "explore-ticket";
        divAreas.dataset.area = i

        if ( areas[i].unlockRequirement == undefined || areas[i].unlockRequirement() ) {
        divAreas.addEventListener("click", e => { 

            saved.currentAreaBuffer = i
            document.getElementById(`preview-team-exit`).style.display = "flex"
            document.getElementById(`team-menu`).style.zIndex = `50`
            document.getElementById(`team-menu`).style.display = `flex`
            document.getElementById("menu-button-parent").style.display = "none"
            updatePreviewTeam()
            afkSeconds = 0
            document.getElementById(`explore-menu`).style.display = `none`

        })
    }

        let unlockRequirement = ""
        if (areas[i].unlockRequirement && !areas[i].unlockRequirement()) unlockRequirement =`<span class="ticket-unlock">
       
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity="0.5"/><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/></svg>
       <span>${areas[i].unlockDescription}</span>
       </span>`
        ticketIndex++

        divAreas.innerHTML = `
                ${unlockRequirement}
                <span class="hitbox"></span>

                
                <div style="width: 100%;">


                <svg class="barcode-flair" xmlns="http://www.w3.org/2000/svg" width="236" height="144"><svg id="barcodeSVG" role="img" aria-label="Barcode preview" width="234px" height="142px" x="0px" y="0px" viewBox="0 0 234 142" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)"><rect x="0" y="0" width="234" height="142" style="fill:none;"/><g transform="translate(10, 10)" style="fill:#000000;"><text style="font: 20px Roboto" text-anchor="start" x="0" y="122">5</text></g><g transform="translate(34, 10)" style="fill:#000000;"><rect x="0" y="0" width="2" height="112"/><rect x="4" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="3" y="134"></text></g><g transform="translate(40, 10)" style="fill:#000000;"><rect x="6" y="0" width="2" height="100"/><rect x="10" y="0" width="4" height="100"/><rect x="16" y="0" width="2" height="100"/><rect x="22" y="0" width="6" height="100"/><rect x="30" y="0" width="4" height="100"/><rect x="38" y="0" width="4" height="100"/><rect x="46" y="0" width="2" height="100"/><rect x="52" y="0" width="4" height="100"/><rect x="58" y="0" width="8" height="100"/><rect x="68" y="0" width="2" height="100"/><rect x="74" y="0" width="6" height="100"/><rect x="82" y="0" width="2" height="100"/><text style="font: 20px Roboto" text-anchor="middle" x="42" y="122">901234</text></g><g transform="translate(124, 10)" style="fill:#000000;"><rect x="2" y="0" width="2" height="112"/><rect x="6" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="5" y="134"></text></g><g transform="translate(134, 10)" style="fill:#000000;"><rect x="0" y="0" width="4" height="100"/><rect x="8" y="0" width="4" height="100"/><rect x="14" y="0" width="4" height="100"/><rect x="20" y="0" width="4" height="100"/><rect x="28" y="0" width="2" height="100"/><rect x="38" y="0" width="2" height="100"/><rect x="42" y="0" width="2" height="100"/><rect x="46" y="0" width="6" height="100"/><r...[486 bytes truncated]



                    <span class="explore-ticket-left">

                    
                <span class="ticket-flair">
                #000${ticketIndex}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M25.719 4.781a2.9 2.9 0 0 0-1.125.344l-4.719 2.5L13.5 6.062l-.375-.093l-.375.187l-2.156 1.25l-1.281.75l1.187.906l2.719 2.063l-3.406 1.813l-3.657-1.657l-.437-.187l-.438.219l-1.75.937l-1.156.625l.875.938l5.406 5.812l.5.594l.688-.375L15 17.094l-1.031 5.687l-.344 1.813l1.719-.719l2.562-1.094l.375-.156l.157-.375l3.718-9.031l5.25-2.813c1.446-.777 2.028-2.617 1.25-4.062a3 3 0 0 0-1.781-1.438a3.1 3.1 0 0 0-1.156-.125m.187 2c.125-.008.254-.004.375.032a.979.979 0 0 1 .188 1.812l-5.594 3.031l-.313.156l-.125.344l-3.718 8.938l-.438.187l1.063-5.906l.375-2.031l-1.813.969l-6.312 3.406l-3.969-4.313l.156-.094l3.657 1.626l.468.218l.406-.25l15.22-8.031a.9.9 0 0 1 .374-.094M13.375 8.094l3.844.937l-2.063 1.063l-2.25-1.719zM3 26v2h26v-2z"/></svg>
                </span>

                        <span style="font-size:1.2rem">${format(i)}</span>
                        <span><strong style="background:#6BBC77">Level: ${Math.max(1,areas[i].level-10)}-${areas[i].level}</strong><span></span></span>
                    </span>
                </div>
                <div style="width: 8rem;" class="explore-ticket-right">
                    <span class="explore-ticket-bg" style="background-image: url(img/bg/${areas[i].background}.png);"></span>
                    <img class="explore-ticket-sprite" style="z-index: 10; scale: 2; image-rendering:pixelated; filter:drop-shadow(rgba(0,0,0,0.4) 2px 2px)" src="img/items/${areas[i].icon.id}.png">
                </div>
        `;
        document.getElementById("explore-listing").appendChild(divAreas);

    }

    updateDailyCounters()

}

let eventCategory = 1

function setEventAreas() {


    if (saved.tutorialStep !== "none") {
        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").style.display = `none`
        document.getElementById("tooltipBottom").style.display = `none`
        document.getElementById("tooltipMid").innerHTML = `Complete the tutorial to access events`
        openTooltip()
        return
    }



    if (eventCategory==2 && areas.vsTeamLeaderGiovanni.defeated!=true){
        eventCategory=1
        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").style.display = `none`
        document.getElementById("tooltipBottom").style.display = `none`
        document.getElementById("tooltipMid").innerHTML = `Defeat Team Leader Giovanni in VS mode to unlock`
        openTooltip()
        return
    }

    if (eventCategory==3){
        eventCategory=1
        document.getElementById("tooltipTop").style.display = `none`
        document.getElementById("tooltipTitle").style.display = `none`
        document.getElementById("tooltipBottom").style.display = `none`
        document.getElementById("tooltipMid").innerHTML = `Not yet implemented`
        openTooltip()
        return
    }



    document.getElementById("event-banner").style.display = "flex"
    document.getElementById("event-banner-category").style.display = "flex"
    let eventTitle = ""

    if (rotationEventCurrent==1) eventTitle = `Return To Kanto`
    if (rotationEventCurrent==2) eventTitle = `Primeval Wilds`
    if (rotationEventCurrent==3) eventTitle = `Ancients Awoken`
    if (rotationEventCurrent==4) eventTitle = `Aether Takeover`
    if (rotationEventCurrent==5) eventTitle = `Science Future`
    if (rotationEventCurrent==6) eventTitle = `Sinnoh Expedition`

    if (rotationEventCurrent==1) document.getElementById("event-banner").style.backgroundImage = "url(img/bg/event/kanto.png)"
    if (rotationEventCurrent==2) document.getElementById("event-banner").style.backgroundImage = "url(img/bg/event/past.png)"
    if (rotationEventCurrent==3) document.getElementById("event-banner").style.backgroundImage = "url(img/bg/event/ancient.png)"
    if (rotationEventCurrent==4) document.getElementById("event-banner").style.backgroundImage = "url(img/bg/event/aether.jpg)"
    if (rotationEventCurrent==5) document.getElementById("event-banner").style.backgroundImage = "url(img/bg/event/future.jpg)"
    if (rotationEventCurrent==6) document.getElementById("event-banner").style.backgroundImage = "url(img/bg/event/sinnoh.jpg)"

    document.getElementById("event-banner").innerHTML = `<span>- ${eventTitle} -</span>`

    document.getElementById("event-selector-1").style = `initial`
    document.getElementById("event-selector-2").style = `initial`
    //document.getElementById("event-selector-3").style = `initial`
    document.getElementById("event-selector-"+eventCategory).style = `background: #91718B; outline: solid 1px #F97DFF; color: white`



    document.getElementById("explore-selector").innerHTML = `
            <div onclick="setWildAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="m17.861 3.163l.16.054l1.202.4c.463.155.87.29 1.191.44c.348.162.667.37.911.709s.341.707.385 1.088c.04.353.04.781.04 1.27v8.212c0 .698 0 1.287-.054 1.753c-.056.484-.182.962-.535 1.348a2.25 2.25 0 0 1-.746.538c-.478.212-.971.18-1.448.081c-.46-.096-1.018-.282-1.68-.503l-.043-.014c-1.12-.374-1.505-.49-1.877-.477a2.3 2.3 0 0 0-.441.059c-.363.085-.703.299-1.686.954l-1.382.922l-.14.093c-1.062.709-1.8 1.201-2.664 1.317c-.863.116-1.705-.165-2.915-.57l-.16-.053l-1.202-.4c-.463-.155-.87-.29-1.191-.44c-.348-.162-.667.37-.911-.71c-.244-.338-.341-.706-.385-1.088c-.04-.353-.04-.78-.04-1.269V8.665c0-.699 0-1.288.054-1.753c.056-.484.182-.962.535-1.348a2.25 2.25 0 0 1 .746-.538c.478-.213.972-.181 1.448-.081c.46.095 1.018.282 1.68.503l.043.014c1.12.373 1.505.49 1.878.477a2.3 2.3 0 0 0 .44-.059c.363-.086.703-.3 1.686-.954l1.382-.922l.14-.094c1.062-.708-1.8-1.2 2.663-1.316c.864-.116 1.706.165 2.916.57m-2.111.943V16.58c.536.058 1.1.246 1.843.494l.125.042c.717.239 1.192.396 1.555.472c.356.074.477.04.532.016a.75.75 0 0 0 .249-.179c.04-.044.11-.149.152-.51c.043-.368.044-.869.044-1.624V7.163c0-.54-.001-.88-.03-1.138c-.028-.239-.072-.328-.112-.382c-.039-.054-.109-.125-.326-.226c-.236-.11-.56-.218-1.07-.389l-1.165-.388c-.887-.296-1.413-.464-1.797-.534m-1.5 12.654V4.434c-.311.18-.71.441-1.276.818l-1.382.922l-.11.073c-.688.46-1.201.802-1.732.994v12.326c.311-.18.71-.442 1.276-.819l1.382-.921l.11-.073c.688-.46 1.201-.802 1.732-.994m-6 3.135V7.42c-.536-.058-1.1-.246-1.843-.494l-.125-.042c-.717-.239-1.192-.396-1.556-.472c-.355-.074-.476-.041-.53-.017a.75.75 0 0 0-.25.18c-.04.043-.11.148-.152.509c-.043.368-.044.87-.044 1.625v8.128c0 .54.001.88.03 1.138c.028.239.072.327.112.382c.039.054.109.125.326-.226c.236.11.56.218 1.07.389l1.165.388c.887.295 1.412.463 1.797.534" clip-rule="evenodd"/></svg>                Wild Areas</div>
            <div  onclick="setDungeonAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M4 10a8 8 0 1 1 16 0v8.667c0 1.246 0 1.869-.268 2.333a2 2 0 0 1-.732.732c-.464.268-1.087.268-2.333.268H7.333C6.087 22 5.464 22 5 21.732A2 2 0 0 1 4.268 21C4 20.536 4 19.913 4 18.667z"/><path d="M20 18H9c-.943 0-1.414 0-1.707.293S7 19.057 7 20v2m13-8h-7c-.943 0-1.414 0-1.707.293S11 15.057 11 16v2m9-8h-3c-.943 0-1.414 0-1.707.293S15 11.057 15 12v2"/></g></svg>
                Dungeons</div>
            <div style="background: #91718B; outline: solid 1px #F97DFF; color: white; z-index: 2;" onclick="setEventAreas()">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m5.658 11.002l-1.47 3.308c-1.856 4.174-2.783 6.261-1.77 7.274s3.098.085 7.272-1.77L13 18.342c2.517-1.119 3.776-1.678 3.976-2.757s-.774-2.053-2.722-4l-1.838-1.839c-1.947-1.948-2.921-2.922-4-2.721c-1.079.2-1.638 1.459-2.757 3.976M6.5 10.5l7 7m-9-2l4 4M16 8l3-3m-4.803-3c.4.667.719 2.4-1.197 4m9 3.803c-.667-.4-2.4-.719-4 1.197m0-9v.02M22 6v.02M21 13v.02M11 3v.02"/></svg>
                Events</div>
    `



    document.getElementById("explore-listing").innerHTML = ""
    document.getElementById("explore-menu-header").innerHTML = `


    <div style="display:flex; gap:0.2rem" >
    <span >
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m5.658 11.002l-1.47 3.308c-1.856 4.174-2.783 6.261-1.77 7.274s3.098.085 7.272-1.77L13 18.342c2.517-1.119 3.776-1.678 3.976-2.757s-.774-2.053-2.722-4l-1.838-1.839c-1.947-1.948-2.921-2.922-4-2.721c-1.079.2-1.638 1.459-2.757 3.976M6.5 10.5l7 7m-9-2l4 4M16 8l3-3m-4.803-3c.4.667.719 2.4-1.197 4m9 3.803c-.667-.4-2.4-.719-4 1.197m0-9v.02M22 6v.02M21 13v.02M11 3v.02"/></svg>
    Events
    </span>
    <span class="header-help" data-help="Events"><svg  style="opacity:0.8; pointer-events:none" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><g fill="currentColor"><g opacity="0.2"><path d="M12.739 17.213a2 2 0 1 1-4 0a2 2 0 0 1 4 0"/><path fill-rule="evenodd" d="M10.71 5.765c-.67 0-1.245.2-1.65.486c-.39.276-.583.597-.639.874a1.45 1.45 0 0 1-2.842-.574c.227-1.126.925-2.045 1.809-2.67c.92-.65 2.086-1.016 3.322-1.016c2.557 0 5.208 1.71 5.208 4.456c0 1.59-.945 2.876-2.169 3.626a1.45 1.45 0 1 1-1.514-2.474c.57-.349.783-.794.783-1.152c0-.574-.715-1.556-2.308-1.556" clip-rule="evenodd"/><path fill-rule="evenodd" d="M10.71 9.63c.8 0 1.45.648 1.45 1.45v1.502a1.45 1.45 0 1 1-2.9 0V11.08c0-.8.649-1.45 1.45-1.45" clip-rule="evenodd"/><path fill-rule="evenodd" d="M14.239 8.966a1.45 1.45 0 0 1-.5 1.99l-2.284 1.367a1.45 1.45 0 0 1-1.49-2.488l2.285-1.368a1.45 1.45 0 0 1 1.989.5" clip-rule="evenodd"/></g><path d="M11 16.25a1.25 1.25 0 1 1-2.5 0a1.25 1.25 0 0 1 2.5 0"/><path fill-rule="evenodd" d="M9.71 4.065c-.807 0-1.524.24-2.053.614c-.51.36-.825.826-.922 1.308a.75.75 0 1 1-1.47-.297c.186-.922.762-1.696 1.526-2.236c.796-.562 1.82-.89 2.919-.89c2.325 0 4.508 1.535 4.508 3.757c0 1.292-.768 2.376-1.834 3.029a.75.75 0 0 1-.784-1.28c.729-.446 1.118-1.093 1.118-1.749c0-1.099-1.182-2.256-3.008-2.256m0 5.265a.75.75 0 0 1 .75.75v1.502a.75.75 0 1 1-1.5 0V10.08a.75.75 0 0 1 .75-.75" clip-rule="evenodd"/><path fill-rule="evenodd" d="M12.638 8.326a.75.75 0 0 1-.258 1.029l-2.285 1.368a.75.75 0 1 1-.77-1.287l2.285-1.368a.75.75 0 0 1 1.028.258" clip-rule="evenodd"/></g></svg></span>
    </div>

    <div class="rotation-timer">
    <strong><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M6.94 2c.416 0 .753.324.753.724v1.46c.668-.012 1.417-.012 2.26-.012h4.015c.842 0 1.591 0 2.259.013v-1.46c0-.4.337-.725.753-.725s.753.324.753.724V4.25c1.445.111 2.394.384 3.09 1.055c.698.67.982 1.582 1.097 2.972L22 9H2v-.724c.116-1.39.4-2.302 1.097-2.972s1.645-.944 3.09-1.055V2.724c0-.4.337-.724.753-.724"/><path fill="currentColor" d="M22 14v-2c0-.839-.004-2.335-.017-3H2.01c-.013.665-.01 2.161-.01 3v2c0 3.771 0 5.657 1.172 6.828S6.228 22 10 22h4c3.77 0 5.656 0 6.828-1.172S22 17.772 22 14" opacity="0.5"/><path fill="currentColor" d="M18 17a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m-5 4a1 1 0 1 1-2 0a1 1 0 0 1 2 0m0-4a1 1 0 1 1-2 0a1 1 0 0 1 2 0"/></svg>
    Rotation ${rotationEventCurrent}/${rotationEventMax}</strong>
    <div class="time-counter-event"></div>
    </div>
    `
    document.getElementById("explore-menu-header").style.backgroundImage = "url(img/bg/mini/special6.png)" 
    let ticketIndex = 0

  for (const i in areas) {
        if (areas[i].type !== "event") continue;
        if (areas[i].category !== eventCategory) continue;
        
        if (!Array.isArray(areas[i].rotation) && areas[i].rotation !== rotationEventCurrent) continue;    
        if (Array.isArray(areas[i].rotation) && !areas[i].rotation.includes(rotationEventCurrent)) continue;    

        const divAreas = document.createElement("div");
        divAreas.className = "explore-ticket";
        divAreas.dataset.area = i

        if ( areas[i].unlockRequirement == undefined || areas[i].unlockRequirement() ) {



        divAreas.addEventListener("click", e => { 
            
            if (areas[i].encounter && areas[i].difficulty===tier2difficulty && areas.vsEliteFourLance.defeated!=true) return
            if (areas[i].encounter && areas[i].difficulty===tier4difficulty && areas.vsUltraEntityLusamine.defeated!=true) return
            saved.currentAreaBuffer = i
            document.getElementById(`preview-team-exit`).style.display = "flex"
            document.getElementById(`team-menu`).style.zIndex = `50`
            document.getElementById(`team-menu`).style.display = `flex`
            document.getElementById("menu-button-parent").style.display = "none"
            updatePreviewTeam()
            afkSeconds = 0
            document.getElementById(`explore-menu`).style.display = `none`

        })
    }


       let unlockRequirement = ""
       if (areas[i].unlockRequirement && !areas[i].unlockRequirement()) unlockRequirement =`<span class="ticket-unlock">
       
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity="0.5"/><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/></svg>
       <span>${areas[i].unlockDescription}</span>
       </span>`

       if (areas[i].encounter && areas[i].difficulty===tier2difficulty && areas.vsEliteFourLance.defeated!=true) unlockRequirement =`<span class="ticket-unlock">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity="0.5"/><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/></svg>
       Defeat Elite Four Lance in VS to unlock</span>`

       if (areas[i].encounter && areas[i].difficulty===tier4difficulty && areas.vsUltraEntityLusamine.defeated!=true) unlockRequirement =`<span class="ticket-unlock">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M2 16c0-2.828 0-4.243.879-5.121C3.757 10 5.172 10 8 10h8c2.828 0 4.243 0 5.121.879C22 11.757 22 13.172 22 16s0 4.243-.879 5.121C20.243 22 18.828 22 16 22H8c-2.828 0-4.243 0-5.121-.879C2 20.243 2 18.828 2 16" opacity="0.5"/><path fill="currentColor" d="M6.75 8a5.25 5.25 0 0 1 10.5 0v2.004c.567.005 1.064.018 1.5.05V8a6.75 6.75 0 0 0-13.5 0v2.055a24 24 0 0 1 1.5-.051z"/></svg>
       Defeat Ultra Entity Lusamine in VS to unlock</span>`


       let eventTag ;
       eventTag = `<strong class="event-tag">Wild Zone ✦</strong>`
       if (areas[i].uncatchable) eventTag = `<strong style="filter:hue-rotate(140deg)" class="event-tag">Collection ◈</strong>`
       if (areas[i].encounter && areas[i].difficulty===tier1difficulty) eventTag = `<strong style="filter:hue-rotate(50deg)" class="event-tag">Tier I Raid ❖</strong>`
       if (areas[i].encounter && areas[i].difficulty===tier2difficulty) eventTag = `<strong style="filter:hue-rotate(200deg)" class="event-tag">Tier II Raid ❖</strong>`
       if (areas[i].encounter && areas[i].difficulty===tier3difficulty) eventTag = `<strong style="filter:hue-rotate(300deg)" class="event-tag">Tier III Raid ❖</strong>`
       if (areas[i].encounter && areas[i].difficulty===tier4difficulty) eventTag = `<strong style="filter:hue-rotate(100deg)" class="event-tag">Tier IV Raid ❖</strong>`

       let nameTag = ""
       if (areas[i].encounter) nameTag = `<svg class="event-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="m21.838 11.126l-.229 2.436c-.378 4.012-.567 6.019-1.75 7.228C18.678 22 16.906 22 13.36 22h-2.72c-3.545 0-5.317 0-6.5-1.21s-1.371-3.216-1.749-7.228l-.23-2.436c-.18-1.912-.27-2.869.058-3.264a1 1 0 0 1 .675-.367c.476-.042 1.073.638 2.268 1.998c.618.704.927 1.055 1.271 1.11a.92.92 0 0 0 .562-.09c.319-.16.53-.595.955-1.464l2.237-4.584C10.989 2.822 11.39 2 12 2s1.011.822 1.813 2.465l2.237 4.584c.424.87.636 1.304.955 1.464c.176.089.37.12.562.09c.344-.055.653-.406 1.271-1.11c1.195-1.36 1.792-2.04 2.268-1.998a1 1 0 0 1 .675.367c.327.395.237 1.352.057 3.264" opacity="0.5"/><path fill="currentColor" d="m12.952 12.699l-.098-.176c-.38-.682-.57-1.023-.854-1.023s-.474.34-.854 1.023l-.098.176c-.108.194-.162.29-.246.354c-.085.064-.19.088-.4.135l-.19.044c-.738.167-1.107.25-1.195.532s.164.577.667 1.165l.13.152c.143.167.215.25.247.354s.021.215 0 .438l-.02.203c-.076.785-.114 1.178.115 1.352c.23.174.576.015 1.267-.303l.178-.082c.197-.09.295-.136.399-.136s.202.046.399.136l.178.082c.691.319 1.037.477 1.267.303s.191-.567.115-1.352l-.02-.203c-.021-.223-.032-.334 0-.438s.104-.187.247-.354l.13-.152c.503-.588.755-.882.667-1.165c-.088-.282-.457-.365-1.195-.532l-.19-.044c-.21-.047-.315-.07-.4-.135c-.084-.064-.138-.16-.246-.354"/></svg>`

       let eventName = format(i)
       if (areas[i].name) eventName = areas[i].name


        let levelrange = `${Math.max(1,areas[i].level-10)}-${areas[i].level}`
        if (areas[i].encounter) levelrange = areas[i].level
        ticketIndex++

        //this is used to determine apricorn drops
        areas[i].ticketIndex = ticketIndex

        divAreas.innerHTML = `









                        ${unlockRequirement}
                <span class="hitbox"></span>

                
                <div style="width: 100%;">


                <svg class="barcode-flair" xmlns="http://www.w3.org/2000/svg" width="236" height="144"><svg id="barcodeSVG" role="img" aria-label="Barcode preview" width="234px" height="142px" x="0px" y="0px" viewBox="0 0 234 142" xmlns="http://www.w3.org/2000/svg" version="1.1" style="transform: translate(0,0)"><rect x="0" y="0" width="234" height="142" style="fill:none;"/><g transform="translate(10, 10)" style="fill:#000000;"><text style="font: 20px Roboto" text-anchor="start" x="0" y="122">5</text></g><g transform="translate(34, 10)" style="fill:#000000;"><rect x="0" y="0" width="2" height="112"/><rect x="4" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="3" y="134"></text></g><g transform="translate(40, 10)" style="fill:#000000;"><rect x="6" y="0" width="2" height="100"/><rect x="10" y="0" width="4" height="100"/><rect x="16" y="0" width="2" height="100"/><rect x="22" y="0" width="6" height="100"/><rect x="30" y="0" width="4" height="100"/><rect x="38" y="0" width="4" height="100"/><rect x="46" y="0" width="2" height="100"/><rect x="52" y="0" width="4" height="100"/><rect x="58" y="0" width="8" height="100"/><rect x="68" y="0" width="2" height="100"/><rect x="74" y="0" width="6" height="100"/><rect x="82" y="0" width="2" height="100"/><text style="font: 20px Roboto" text-anchor="middle" x="42" y="122">901234</text></g><g transform="translate(124, 10)" style="fill:#000000;"><rect x="2" y="0" width="2" height="112"/><rect x="6" y="0" width="2" height="112"/><text style="font: 20px Roboto" text-anchor="middle" x="5" y="134"></text></g><g transform="translate(134, 10)" style="fill:#000000;"><rect x="0" y="0" width="4" height="100"/><rect x="8" y="0" width="4" height="100"/><rect x="14" y="0" width="4" height="100"/><rect x="20" y="0" width="4" height="100"/><rect x="28" y="0" width="2" height="100"/><rect x="38" y="0" width="2" height="100"/><rect x="42" y="0" width="2" height="100"/><rect x="46" y="0" width="6" height="100"/><r...[486 bytes truncated]



                    <span class="explore-ticket-left">

                    
                <span class="ticket-flair">
                #000${ticketIndex}
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path fill="currentColor" d="M25.719 4.781a2.9 2.9 0 0 0-1.125.344l-4.719 2.5L13.5 6.062l-.375-.093l-.375.187l-2.156 1.25l-1.281.75l1.187.906l2.719 2.063l-3.406 1.813l-3.657-1.657l-.437-.187l-.438.219l-1.75.937l-1.156.625l.875.938l5.406 5.812l.5.594l.688-.375L15 17.094l-1.031 5.687l-.344 1.813l1.719-.719l2.562-1.094l.375-.156l.157-.375l3.718-9.031l5.25-2.813c1.446-.777 2.028-2.617 1.25-4.062a3 3 0 0 0-1.781-1.438a3.1 3.1 0 0 0-1.156-.125m.187 2c.125-.008.254-.004.375.032a.979.979 0 0 1 .188 1.812l-5.594 3.031l-.313.156l-.125.344l-3.718 8.938l-.438.187l1.063-5.906l.375-2.031l-1.813.969l-6.312 3.406l-3.969-4.313l.156-.094l3.657 1.626l.468.218l.406-.25l15.22-8.031a.9.9 0 0 1 .374-.094M13.375 8.094l3.844.937l-2.063 1.063l-2.25-1.719zM3 26v2h26v-2z"/></svg>
                </span>

                        <span style="font-size:1.1rem">${eventName}${nameTag}</span>
                        <span><strong style="background:#D57392">Level: ${levelrange}</strong>${eventTag}<span></span></span>
                    </span>
                </div>
                <div style="width: 8rem;" class="explore-ticket-right">
                    <span class="explore-ticket-bg" style="background-image: url(img/bg/${areas[i].background}.png);"></span>
                    <img class="explore-ticket-sprite sprite-trim" style="z-index: 10;" src="img/pkmn/sprite/${areas[i].icon.id}.png">
                </div>





        `;

        if (areas[i].encounter) {
        delete divAreas.dataset.area;
        divAreas.dataset.trainer = i
        //divAreas.classList.add("encounter-ticket")
        }


        document.getElementById("explore-listing").appendChild(divAreas);




    }


    updateEventCounters()


}


let lastHalfDayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 2));

function updateDailyCounters() {
  const contadores = document.querySelectorAll('.time-counter-daily');

  const ahora = Date.now();
  const halfDayNumber = Math.floor(ahora / (1000 * 60 * 60 * 2));

  if (halfDayNumber !== lastHalfDayNumber) {
    lastHalfDayNumber = halfDayNumber;

    getSeed();
    setWildAreas();
    setDungeonAreas();
    onDailyRotationHook();
  }

  const nextHalfDayStart = (halfDayNumber + 1) * (1000 * 60 * 60 * 2);
  const diff = nextHalfDayStart - ahora;

  const horas = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const minutos = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const segundos = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

  contadores.forEach(c => {
    c.textContent = `${horas}:${minutos}:${segundos}`;
  });
}

let lastEventPeriod = Math.floor(
  Date.now() / (1000 * 60 * 60 * 8)
);

function updateEventCounters() {
  const contadores = document.querySelectorAll('.time-counter-event');

  const ahora = Date.now();
  const currentPeriod = Math.floor(ahora / (1000 * 60 * 60 * 8));

  if (currentPeriod !== lastEventPeriod) {
    lastEventPeriod = currentPeriod;

    getSeed();
    setEventAreas();
    onEventRotationHook();

  }

  const nextPeriodStart = (currentPeriod + 1) * (1000 * 60 * 60 * 8);
  const diff = nextPeriodStart - ahora;

  const horas = String(Math.floor(diff / 3600000)).padStart(2, '0');
  const minutos = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
  const segundos = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');

  contadores.forEach(c => {
    c.textContent = `${horas}:${minutos}:${segundos}`;
  });
}

setInterval(updateDailyCounters, 1000);
setInterval(updateEventCounters, 1000);
