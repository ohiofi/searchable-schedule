/**
* A searchable schedule web app for Hilliard U, The Big Think, etc.
* version 1.32 
* - doesn't require node.js
* - loads saved data from localStorage
* - has two fail-safes: 1. load from localStorage, and 2. load from JSON
* Inspiration: https://twitter.com/hello_anwen/status/996048755228135430
*
* @author Justin Riley
* @version 1.32
* @since 2018-05-16
*
*/
let spreadsheetUrl = 'https://spreadsheets.google.com/feeds/cells/1hUjeRjsjaOpOPHKa6qXBs68KudIIvv3l04j4PG2MccU/1/public/values?alt=json-in-script&callback=doData';
let myList = [];
let fullList = [];
let allCategories = []
let allBestFor = []
//let myList,fullList;
let simpleViewBool = true;
let savedViewBool = false;
let searchViewBool = false;
const LOCAL_STORAGE = 'localSessionList'
const myTable = document.getElementById("excelDataTable");
const searchTextbox = document.getElementById("searchText");
const sortByDropdown = document.getElementById("sortBy-select");
const categoryDropdown = document.getElementById("category-select");
const startTimeDropdown = document.getElementById("startTime-select");
const bestForDropdown = document.getElementById("bestFor-select");
const showAllRadio = document.getElementById("showAllRadio");
const savedOnlyRadio = document.getElementById("savedOnlyRadio");
const simpleRadio = document.getElementById("simpleRadio");
const detailedRadio = document.getElementById("detailedRadio");
// spreadsheet column names
const UNIQUE_ID = "timestamp";
const SESSION_TIME = "sessiontime";
const SESSION_ROOM = "roomnumber";
const SESSION_CATEGORY = "sessioncategory";
const SESSION_PRESENTERS = "sessionteacher(s)";
const SESSION_TITLE = "sessiontitle";
const SESSION_DESCRIPTION = "sessiondescription";
const BEST_FOR = "bestfor";
const LEVEL = "leveloflearner";
const SEATS = "seats";
const BRING = "bringwithyou";
const MILITARY_TIME = "militarytime";
// const PRESENTER_ORGANIZATION = "organization";
const ROW_LENGTH = 20;

// order MUST match spreadsheet order
// let keys = []
// keys[0] = UNIQUE_ID
// keys[1] = false
// keys[2] = SESSION_TIME
// keys[3] = SESSION_ROOM
// keys[4] = SESSION_CATEGORY
// keys[5] = SESSION_PRESENTERS
// keys[6] = false
// keys[7] = false
// keys[8] = false
// keys[9] = SESSION_TITLE
// keys[10] = false
// keys[11] = SESSION_DESCRIPTION
// keys[12] = BEST_FOR
// keys[13] = LEVEL
// keys[14] = false
// keys[15] = false
// keys[16] = SEATS
// keys[17] = false
// keys[18] = BRING
// keys[19] = false 
// order MUST match spreadsheet order

// The callback function the JSONP request will execute to load data from API
function doData(data) {
  //console.log("doData")
  // Final results will be stored here	
  let results = [];
  // Get all entries from spreadsheet
  const entries = data.feed.entry;
  //console.log(entries)
  // Iterate thru all entries
  for (let i = 0; i < entries.length; i++){
    //console.log(i)
    if(parseInt(entries[i].gs$cell.row) == 1){ // skip header row
      continue
    }
    else if(parseInt(entries[i].gs$cell.row-1) > results.length){ // if new row, push in an empty object
       results[parseInt(entries[i].gs$cell.row)-2] = {timestamp:null};
    }
    switch(parseInt(entries[i].gs$cell.col))
    {
      case 1: results[parseInt(entries[i].gs$cell.row)-2][UNIQUE_ID] = entries[i].gs$cell.$t; break
      case 3:
        results[parseInt(entries[i].gs$cell.row)-2][SESSION_TIME] = entries[i].gs$cell.$t; 
        results[parseInt(entries[i].gs$cell.row)-2][MILITARY_TIME] = militaryTime(entries[i].gs$cell.$t);
        break
      case 4: results[parseInt(entries[i].gs$cell.row)-2][SESSION_ROOM] = entries[i].gs$cell.$t; break
      case 5:
        results[parseInt(entries[i].gs$cell.row)-2][SESSION_CATEGORY] = entries[i].gs$cell.$t;
        if(!allCategories.includes(entries[i].gs$cell.$t))allCategories.push(entries[i].gs$cell.$t)
        break
      case 6: results[parseInt(entries[i].gs$cell.row)-2][SESSION_PRESENTERS] = entries[i].gs$cell.$t; break
      case 10: results[parseInt(entries[i].gs$cell.row)-2][SESSION_TITLE] = entries[i].gs$cell.$t; break
      case 12: results[parseInt(entries[i].gs$cell.row)-2][SESSION_DESCRIPTION] = entries[i].gs$cell.$t; break
      case 13: 
        results[parseInt(entries[i].gs$cell.row)-2][BEST_FOR] = entries[i].gs$cell.$t;
        if(!allBestFor.includes(entries[i].gs$cell.$t))allBestFor.push(entries[i].gs$cell.$t)
        break
      case 14: results[parseInt(entries[i].gs$cell.row)-2][LEVEL] = entries[i].gs$cell.$t; break
      case 17: results[parseInt(entries[i].gs$cell.row)-2][SEATS] = entries[i].gs$cell.$t; break
      case 19: results[parseInt(entries[i].gs$cell.row)-2][BRING] = entries[i].gs$cell.$t; break
      
      default: break
    }
    
  }
  buildDropDowns();
  handleResults(results);
}

function buildDropDowns(){
  //build drop-downs
  
  allCategories.sort();
  //console.log(allCategories)
  allCategories = ["Assessment and Data", "Blended Learning / 5 C's", "Classified Session", "Culture", "Diversity & Equity", "Instructional Framework", "Personalization", "Safety & Prevention", "Social  Emotional Learning", "Staff Wellness", "Student Engagement", "Student Needs (EL, Gifted, Special Education)", "Student Well-Being"]
  allBestFor.sort();
  //console.log(allBestFor)
  allBestFor = ["6-8", "9-12", "Administrators", "All Participants Welcome", "Classified", "EL", "Gifted", "Media Center Specialists and Elementary Coaches.", "PreK", "PreK-5", "Related Services (OT, PT, Psychs, Nurses, Speech)", "Resident Educators - 1 and 2", "Special Education"]
  let option = '';
  for (let i=0;i<allCategories.length;i++){
     option += '<option value="'+ allCategories[i] + '">' + allCategories[i] + '</option>';
  }
  $('#category-select').append(option);
  option = '';
  for (let i=0;i<allBestFor.length;i++){
     option += '<option value="'+ allBestFor[i] + '">' + allBestFor[i] + '</option>';
  }
  $('#bestFor-select').append(option);
}

function militaryTime(time){
  let hours = Number(time.match(/^(\d+)/)[1]);
  let minutes = Number(time.match(/:(\d+)/)[1]);
  //let AMPM = time.match(/\s(.*)$/)[1];
  if(hours<7) hours = hours+12;
  //else if(hours==12) hours = hours-12;
  let sHours = hours.toString();
  let sMinutes = minutes.toString();
  if(hours<10) sHours = "0" + sHours;
  if(minutes<10) sMinutes = "0" + sMinutes;
  //alert(sHours + ":" + sMinutes)
  return sHours + ":" + sMinutes;
}

// Look up localStorage and transfer saves
function handleResults(spreadsheetArray) {
  //console.log(spreadsheetArray);
  // look up the localStorage
  let savedList = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE))
  // if localStorage is empty
  if (savedList === null || savedList.length === 0){
    for(let i=0;i<spreadsheetArray.length;i++){
      //console.log(spreadsheetArray[i]);
      spreadsheetArray[i]["save"]=false; // add Save:false to each object
    }
  } else { // if sessions have been saved on this device, transfer saves from localStorage into the newest server data
    // iterate through savedList
    // console.log("found savedList in localStorage")
    // console.log(savedList);
    for(let i=0;i<savedList.length;i++){
      // iterate through new server data myList
      for(let j=0;j<spreadsheetArray.length;j++){
        // if you find a savedList session
        if(savedList[i][UNIQUE_ID] === spreadsheetArray[j][UNIQUE_ID]){
          // copy the saved status for this session from savedList into new server data myList
          spreadsheetArray[j]["save"]=savedList[i]["save"]
          break
        }
      }
    }
  }
  fullList = spreadsheetArray;
  myList = spreadsheetArray;
  myList = shuffle(myList);
  //sort by time
  sortBy();
  //buildHtmlTable('#excelDataTable',spreadsheetArray);
  localStorage.setItem(LOCAL_STORAGE, JSON.stringify(spreadsheetArray)); // save to localStorage for a rainy day
  //console.log(spreadsheetArray);
}

function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;
  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}

// Create JSONP Request to Google Docs API, then execute the callback function doData
$.ajax({
    url: spreadsheetUrl,
    jsonp: 'doData',
    dataType: 'jsonp'
});
$( document ).ajaxError(function( event, jqxhr, settings, thrownError ) { // if ajax fails
  if((myList.length == 0 || myList == null) && window.localStorage.getItem(LOCAL_STORAGE) == null){ // load from json
    console.log("ajaxError: Fail-safe 2. Loading sessions from JSON ");
    console.log(event)
    console.log(jqxhr)
    console.log(settings)
    console.log(thrownError)
    $.getJSON( "hilliardUSessionsFall2018.json", function( data ) {
      console.log(data);
        fullList = data;
        myList = fullList;
        buildDropDowns();
        sortBy();
    });
    // var request = new XMLHttpRequest();
    // request.open("GET", 'hilliardUSessionsFall2018.json', false);
    // request.send(null)
    // var my_JSON_object = JSON.parse(request.responseText);
    // alert (my_JSON_object.result[0]);
    // var request = new XMLHttpRequest();
    // request.open("GET", 'hilliardUSessionsFall2018.json', false);
    // request.send(null);
    // request.onreadystatechange = function() {
    //   if ( request.readyState === 4 && request.status === 200 ) {
    //     var my_JSON_object = JSON.parse(request.responseText);
    //     console.log(my_JSON_object);
    //     fullList = my_JSON_object;
    //     myList = fullList;
    //     buildDropDowns();
    //     sortBy();
    //   }
    // }
    //fullList = JSON.parse('hilliardUSessionsFall2018.json');
    // myList = fullList;
    // buildDropDowns();
    // sortBy();
  }else if(myList.length == 0 || myList == null){
    console.log("ajaxError: Fail-safe 1. Loading sessions from localStorage ");
    console.log(event)
    console.log(jqxhr)
    console.log(settings)
    console.log(thrownError)
    fullList = JSON.parse(window.localStorage.getItem(LOCAL_STORAGE));
    myList = fullList;
    buildDropDowns();
    sortBy();
    //buildHtmlTable('#excelDataTable',myList);
    //$( "body" ).text( "Triggered ajaxError handler." );
  } else {
    console.log("loaded from sheets") // 
  }
});

document.onkeydown = function(e){
  switch (e.keyCode){
    case 13: // enter
      jsonSearch();
      break
  }
}

// toggle simple / detailed
function setSimpleView(myBool){
  simpleViewBool = myBool;
  simpleRadio.checked = myBool;
  detailedRadio.checked = !myBool;
  buildHtmlTable('#excelDataTable',myList);
  $('.navbar-collapse').collapse('hide');
  $("#searchText").blur();
  setTimeout(()=>{simpleRadio.checked = myBool;detailedRadio.checked = !myBool;},50);
}

// toggle show all / saved only
function setSavedView(myBool){
  if(myBool){
    clearSearch();
  }
  savedViewBool = myBool;
  showAllRadio.checked = !myBool;
  savedOnlyRadio.checked = myBool;
  if(!searchViewBool){
    checkForSaved();
  }
  $('.navbar-collapse').collapse('hide');
  $("#searchText").blur();
  setTimeout(()=>{showAllRadio.checked = !myBool;savedOnlyRadio.checked = myBool;},50);
}

// save this session to localStorage
function saveSession(sessionIndex,checkedOrNot){
  myList[sessionIndex]["save"]=checkedOrNot;
  localStorage.setItem(LOCAL_STORAGE, JSON.stringify(myList));
}


function sortBy(){
  let someKey = sortByDropdown.value;
  let newList = [];
  newList = myList.sort(function (a, b) {
    return a[someKey].localeCompare(b[someKey]);
  });
  buildHtmlTable('#excelDataTable',newList);
  $('.navbar-collapse').collapse('hide');
    $("#searchText").blur();
}

function filterByCategory(){
  let thisFilter = categoryDropdown.value;
  if(thisFilter == "false"){
    return
  }
  myList= myList.filter(obj => {
    return obj[SESSION_CATEGORY] === thisFilter
  })
}

function filterByStartTime(){
  let thisFilter = startTimeDropdown.value;
  if(thisFilter == "false"){
    return
  }
  myList = myList.filter(obj => {
    return obj[MILITARY_TIME].includes(thisFilter)
  })
}

function filterByBestFor(){
  let thisFilter = bestForDropdown.value;
  if(thisFilter === "false"){
    return
  }
  myList = myList.filter(obj => {
    return obj[BEST_FOR].includes(thisFilter) 
    // || obj[BEST_FOR].includes("All Participants Welcome")
  })
}

function checkForSaved() {
  let result = [];
  for (let i = 0; i < myList.length; i++){
    for (let key in myList[i]) {
      if (myList[i]["save"]){
          result.push(myList[i]);
          break
      }
    }
  }
  if(savedViewBool && result.length<1){
    $('#savedOnlyModal').modal('show')
    // alert("No sessions have been saved. Click the \"Save box\" next to a session you plan to attend, then click \"Saved Only\" to see your schedule.")
    setTimeout(function(){document.getElementById("showAllRadio").checked=true},150);
    savedViewBool = false;
    buildHtmlTable('#excelDataTable',myList)
  }else{
    buildHtmlTable('#excelDataTable',myList)
  }
}

function checkAllFilters(){
  let filterAlertBoxText = [];
  resetMyList()
  if(startTimeDropdown.value != "false"){
    filterByStartTime()
    filterAlertBoxText.push(startTimeDropdown.value.replace(/\s/g,''));// remove all spaces
  }
  if(categoryDropdown.value != "false"){
    filterByCategory();
    filterAlertBoxText.push(categoryDropdown.value);
  }
  if(bestForDropdown.value != "false"){
    filterByBestFor()
    filterAlertBoxText.push(bestForDropdown.value);
  }
  if(filterAlertBoxText.length > 0){
    document.getElementById("myTitle").style.display = "none";
    document.getElementById("filterAlertBox").style.display = "inline-block";
    document.getElementById("filterAlertText").innerHTML=filterAlertBoxText.join(", ");
  }else{
    document.getElementById("filterAlertBox").style.display = "none";
    if(!searchViewBool)
      document.getElementById("myTitle").style.display = "inline-block";
  }
  buildHtmlTable('#excelDataTable',myList);
}

function clearFilters(){
  document.getElementById("filterAlertBox").style.display = "none";
  categoryDropdown.selectedIndex = 0;
  bestForDropdown.selectedIndex = 0;
  startTimeDropdown.selectedIndex = 0;
  if(searchViewBool){
    resetMyList();
    jsonSearch();
  }else{
    document.getElementById("myTitle").style.display = "inline-block";
    resetMyList();
    buildHtmlTable('#excelDataTable',myList);
  }
}

function resetMyList(){
  myList=fullList; //reset myList
}

function clearSearch(){
  resetMyList();
  searchTextbox.value="";
  jsonSearch();
  $('.navbar-collapse').collapse('hide');
  $("#searchText").blur();
}


function jsonSearch() {
  if(searchTextbox.value.length > 0){
    searchViewBool=true;
    savedViewBool = false;
    showAllRadio.checked = true;
    savedOnlyRadio.checked = false;
    document.getElementById("myTitle").style.display = "none";
    document.getElementById("alertBox").style.display = "inline-block";
    document.getElementById("alertText").innerHTML='"'+searchTextbox.value + '" ';
  }else{
    searchViewBool=false;
    document.getElementById("alertBox").style.display = "none";
    document.getElementById("myTitle").style.display = "inline-block";
  }
  checkAllFilters()
  buildHtmlTable('#excelDataTable',myList)
}

function checkIfObjectContainsQuery(thisObj){
  for (let key in thisObj) { // must use a for...in loop
    if (typeof thisObj[key] === 'string'){
      if (thisObj[key].toLowerCase().indexOf(searchTextbox.value.toLowerCase()) != -1){
        return true
      }
    }
  }
  return false
}

  // Builds the HTML Table out of someArray.
function buildHtmlTable(selector,someArray) {
  let searchCounter = 0;
  myTable.innerHTML=""; // erase entire table
  addAllColumnHeaders(someArray, selector); // create header row
  if(searchViewBool){ // display 0 results if 0 results
    document.getElementById("alertText").innerHTML='"'+searchTextbox.value + '" &nbsp; <small class="text-monospace text-black-50">' + searchCounter + " results</small>";
  }
  for (let i = 0; i < someArray.length; i++) { // loop through myList
    if(savedViewBool && !someArray[i]["save"]){ // skip session if in savedView and session is not saved
      continue
    }else{
      // not in savedView or savedView + not saved
      if(searchViewBool && !checkIfObjectContainsQuery(someArray[i])){ // skip session if searching and session doesn't contain search
        continue
      }else{ // either not searching OR saved OR 
        if(searchViewBool){ // if we are searching and this session DOES contain search, +1 results
          searchCounter++;
          document.getElementById("alertText").innerHTML='"'+searchTextbox.value + '" &nbsp; <small class="text-monospace text-black-50">' + searchCounter + " results</small>";
        }
        buildOneRow(someArray[i],i,selector)
      }
    }
  }
}

function buildOneRow(someObj,i,selector){
  let row$ = $('<tr/>');
  // build the row in 4 easy steps
  for (let tableStep = 0; tableStep < 4; tableStep++) {
    let cellValues = [];
    if (tableStep == 0){ // tableStep 0 = Save
      cellValues.push('<div class="form-check pl-2"><label><input type="checkbox" onmouseover="searchText.blur()" value='+i+' onclick="saveSession('+i+',this.checked)" ');
      if(someObj["save"]){ // check the save box if already saved
        cellValues.push('checked');
      }
      cellValues.push('></label></div>');
      row$.append($('<td/>').html(cellValues.join(''))); // end step 0
    }else if (tableStep == 1){ // tableStep 1 = combine the Time & Room
      let timeArray = someObj[SESSION_TIME].split(" ");
      //console.log(someObj[SESSION_TITLE]+" "+(militaryTime(timeArray[2]).split(":")[0] - militaryTime(timeArray[0]).split(":")[0]))
      if(militaryTime(timeArray[2]).split(":")[0] - militaryTime(timeArray[0]).split(":")[0] == 1){
        cellValues.push(timeArray[0]+" "+someObj[SESSION_ROOM])
      }else{
        cellValues.push(someObj[SESSION_TIME]+" "+someObj[SESSION_ROOM])
      }
      row$.append($('<td/>').html(cellValues.join(''))); // end step 1
    }else if (tableStep == 2){ // tableStep 2 = combine the Title & Description & Bring
      cellValues.push("<details><summary><b>"+someObj[SESSION_TITLE]+"</b></summary>"+someObj[SESSION_DESCRIPTION]+"<br><small>");
      if(someObj[BRING]){
        cellValues.push("<span class='text-primary'> <ins>Please Bring</ins>: "+someObj[BRING]+" </span> &nbsp;");
      }
      // category / best for / level
      cellValues.push("<ins>Time</ins>: "+someObj[SESSION_TIME]+" &nbsp; ");
      cellValues.push("<ins>Room</ins>: "+someObj[SESSION_ROOM]+" &nbsp; ");
      cellValues.push("<ins>Category</ins>: "+someObj[SESSION_CATEGORY]+" &nbsp; ");
      cellValues.push("<ins>Best For</ins>: "+someObj[BEST_FOR]+" &nbsp; ");
      cellValues.push("<ins>Level</ins>: "+someObj[LEVEL]+" &nbsp; ");
      cellValues.push("<ins>Seats</ins>: "+someObj[SEATS]);
      cellValues.push("</small></details>");
      row$.append($('<td/>').html(cellValues.join(''))); // end step 2
    }else if (tableStep == 3 && simpleViewBool == true){ // simple tableStep 3 = Presenters
      cellValues.push(someObj[SESSION_PRESENTERS]);
      row$.append($('<td/>').html(cellValues.join('')));
    } else if (tableStep == 3 && simpleViewBool == false){ // detailed tableStep 3
      cellValues.push(someObj[SESSION_PRESENTERS]);
      row$.append($('<td/>').html(cellValues.join('')));
      cellValues = someObj[SESSION_ROOM]; //room
      row$.append($('<td/>').html(cellValues));
      cellValues = someObj[SESSION_CATEGORY]; //category
      row$.append($('<td/>').html(cellValues));
      cellValues = someObj[BEST_FOR]; //best for
      row$.append($('<td/>').html(cellValues));
      cellValues = someObj[LEVEL]; //level
      row$.append($('<td/>').html(cellValues));
      cellValues = someObj[SEATS]; //seats
      row$.append($('<td/>').html(cellValues));
    }
  }
  $(selector).append(row$);
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(someArray, selector) {
  //let columnSet = [];
  let headerTr$ = $('<tr/>');
  //columnSet.push("Save");
  headerTr$.append($("<th/>").html("Save"));
  //columnSet.push("Session Time");
  headerTr$.append($("<th/>").html("Time"));
  //columnSet.push("Session Title");
  headerTr$.append($("<th style='width:45%' />").html("Title <small class='faded' style='font-size:11px'>(click for description)</small>"));
  //columnSet.push("Session Description");
  //columnSet.push("Presenter(s)");
  headerTr$.append($("<th/>").html("Presenter(s)"));
  //columnSet.push(SESSION_ROOM);

  //if(dropdown0.value === "Detailed"){
  if(simpleViewBool == false){
    headerTr$.append($("<th/>").html("Room"));
    //columnSet.push("Primary Focus");
    headerTr$.append($("<th/>").html("Category"));
    //columnSet.push("Session Audience");
    headerTr$.append($("<th/>").html("Best For"));
    headerTr$.append($("<th/>").html("Level"));
    headerTr$.append($("<th/>").html("Seats"));
    // columnSet.push(PRESENTER_ORGANIZATION);
    // headerTr$.append($("<th/>").html("Organization"));
    // columnSet.push("Prerequisites/Materials Needed");
    // headerTr$.append($("<th/>").html("Materials"));
    // columnSet.push("Level of Learner");
    // headerTr$.append($("<th/>").html("Level"));
    // columnSet.push("Likes");
    // headerTr$.append($("<th/>").html("Likes"));
  } 
  $(selector).append(headerTr$);
}

searchTextbox.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    $('.navbar-collapse').collapse('hide');
    $("#searchText").blur(); 
  }
});
$('form').submit(function(event) {
    event.preventDefault();
  })
// $(function() {
//   //console.log('hello world :o')
//   $("#searchText").on('change keydown paste input', function(){
//       jsonSearch();
//   });
// });


  
  //$.get('/sheetSessions', function(serverData) {
    // look up the localStorage
//     let savedList = JSON.parse(window.localStorage.getItem('savedSessionList'))

//     // if localStorage is empty
//     if (savedList === null || savedList.length === 0)
//     {
//       for(let i=0;i<serverData[0].length;i++){
//         serverData[0][i]["save"]=false; // add Save:false to each object
//       }
//     } else { // if sessions have been saved on this device, transfer saves from localStorage into the newest server data
//       // iterate through savedList
//       // console.log("found savedList in localStorage")
//       // console.log(savedList);
//       for(let i=0;i<savedList.length;i++){
//         // iterate through new server data myList
//         for(let j=0;j<serverData[0].length;j++){
//           // if you find a savedList session
//           if(savedList[i][UNIQUE_ID] === serverData[0][j][UNIQUE_ID]){
//             // copy the saved status for this session from savedList into new server data myList
//             serverData[0][j]["save"]=savedList[i]["save"]
//             break
//           }
//         }
//       }
//     }
//     fullList = serverData[0];
//     myList = serverData[0];
//     //console.log(serverData[0]);
//     buildHtmlTable('#excelDataTable',serverData[0])
//   //})
  
//   $('form').submit(function(event) {
//     event.preventDefault();
//   })

// })
