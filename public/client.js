// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

let myList;
let simpleViewBool = true;
let savedViewBool = false;
let searchViewBool = false;
const myTable = document.getElementById("excelDataTable");
const searchTextbox = document.getElementById("searchText");
const dropdown1 = document.getElementById("select1");
const showAllRadio = document.getElementById("showAllRadio");
const savedOnlyRadio = document.getElementById("savedOnlyRadio");
const simpleRadio = document.getElementById("simpleRadio");
const detailedRadio = document.getElementById("detailedRadio");

document.onkeydown = function(e){
  switch (e.keyCode){
    case 13: // enter
      jsonSearch();
      break
  }
}

function setSimpleView(myBool){
  simpleViewBool = myBool;
  simpleRadio.checked = myBool;
  detailedRadio.checked = !myBool;
  buildHtmlTable('#excelDataTable',myList);
}

function setSavedView(myBool){
  savedViewBool = myBool;
  showAllRadio.checked = !myBool;
  savedOnlyRadio.checked = myBool;
  checkForSaved();
}

function saveSession(sessionIndex,checkedOrNot){
  myList[sessionIndex]["Save"]=checkedOrNot;
  localStorage.setItem("sessionList", JSON.stringify(myList));
}

function nameCompare(a,b) {
  var aName = a.split(" ");
  var bName = b.split(" ");
  var aLastName = aName[aName.length - 1];
  var bLastName = bName[bName.length - 1];
  if (aLastName < bLastName) return -1;
  if (aLastName > bLastName) return 1;
  return 0;
}



function teacherSort() {
  let tsList = [];
  let teacherArray;
  for (let i = 0; i < myList.length; i++){
    teacherArray = myList[i]["Session Teacher / CoTeacher(s)"].split(", ")
    for (let teacher in teacherArray){
      tsList.push(myList[i])
      tsList[tsList.length-1]["Session Teacher / CoTeacher(s)"] = teacherArray[teacher]
    }
  }
  // for (let i = 0; i < myList.length; i++){ // tried to add js closure but couldn't figure it out
  //   for(let teacher in myList[i]["Session Teacher / CoTeacher(s)"]){
  //     const t = teacher;
  //     (function(thisTeacher){
  //       // duplicate the session info for each teacher in the session
  //       tsList.push(myList[i])
  //       // set only one teacher
  //       console.log("thisTeacher = "+thisTeacher)
  //       console.log(" teacher's name = "+tsList[tsList.length-1]["Session Teacher / CoTeacher(s)"])
  //       tsList[tsList.length-1]["Session Teacher / CoTeacher(s)"] = tsList[tsList.length-1]["Session Teacher / CoTeacher(s)"][thisTeacher]
  //      })(t)
  //   }
  // }
  console.log(tsList)
  tsList = tsList.sort(function (a, b) {
    return nameCompare(a["Session Teacher / CoTeacher(s)"],b["Session Teacher / CoTeacher(s)"]);
  });
  return tsList
}

function sortBy(){
  let someKey = dropdown1.value
  let newList = [];
  if(someKey=="Teacher"){
    newList = teacherSort();
  }else{
    newList = myList.sort(function (a, b) {
      return a[someKey].localeCompare(b[someKey]);
    });
  }
  
  buildHtmlTable('#excelDataTable',newList)
}

// function toggleSaved(){
//   if(radioToBoolean("allOrSaved") == false){
//     // dropdown2text.innerHTML = "Saved Only"
//     showSaved()
//   }else{
//     // dropdown2text.innerHTML = "Show All"
//     buildHtmlTable('#excelDataTable',myList)
//   }
// }

function checkForSaved() {
  let result = [];
  for (let i = 0; i < myList.length; i++){
    for (let key in myList[i]) {
      if (myList[i]["Save"]){
        
          result.push(myList[i]);
          break
        
      }
    }
  }

  if(savedViewBool && result.length<1){
    alert("No sessions have been saved.")
    setTimeout(function(){document.getElementById("showAllRadio").checked=true},100);
    savedViewBool = false;
    buildHtmlTable('#excelDataTable',myList)
  }else{
    buildHtmlTable('#excelDataTable',myList)
  }
}

function clearSearch(){
  searchTextbox.value="";
  jsonSearch();
}

function jsonSearch() {
  if(searchTextbox.value.length > 0){
    searchViewBool=true;
    document.getElementById("myTitle").style.display = "none";
    document.getElementById("alertBox").style.display = "block";
    document.getElementById("alertText").innerHTML=searchTextbox.value;
  }else{
    searchViewBool=false;
    document.getElementById("alertBox").style.display = "none";
    document.getElementById("myTitle").style.display = "block";
    //document.getElementById("alertSpan").innerHTML="<h2>Riley Fest 2018</h2>";
  }
//   let query = searchTextbox.value;
//   let result = [];
//   for (let i = 0; i < myList.length; i++){
    
//       for (let key in myList[i]) {
//         if (key === "Session Teacher / CoTeacher(s)"){
//           for(let teacher in myList[i][key]){
//             if (myList[i][key][teacher].toLowerCase().indexOf(query.toLowerCase()) != -1){
//               result.push(myList[i]);
//               break
//             }
//           }
//         }
//         else if (typeof myList[i][key] === 'string'){
//           if (myList[i][key].toLowerCase().indexOf(query.toLowerCase()) != -1){
//             result.push(myList[i]);
//             break
//           }
//         }
      
//     }
//   }
  //searchTextbox.value="";
  
  buildHtmlTable('#excelDataTable',myList)
}

function checkIfObjectContainsQuery(thisObj){
  for (let key in thisObj) {
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
  myTable.innerHTML=""; // erase entire table
  var columns = addAllColumnHeaders(someArray, selector); // create header row

  for (var i = 0; i < someArray.length; i++) { // loop through myList
    var row$ = $('<tr/>');
    if(savedViewBool && !someArray[i]["Save"]){
      continue
    }else{
      if(searchViewBool && !checkIfObjectContainsQuery(someArray[i])){
        continue
      }else{
        for (var colIndex = 0; colIndex < columns.length; colIndex++) {
          if (colIndex == 0){
            if(someArray[i]["Save"]){
              cellValue = '<div class="form-check"><label><input type="checkbox" value='+i+' onclick="saveSession('+i+',this.checked)" checked></label></div>';
              // cellValue = '<div class="form-check"><input onclick="saveSession(value,this.checked)" class="form-check-input position-static glyphicon glyphicon-heart-empty" type="checkbox" value='+i+' checked></div>';
            }else{
              cellValue = '<div class="form-check"><label><input type="checkbox" value='+i+' onclick="saveSession('+i+',this.checked)"></label></div>';
              // cellValue = '<div class="form-check"><input onclick="saveSession(value,this.checked)" class="form-check-input position-static glyphicon glyphicon-heart-empty" type="checkbox" value='+i+'></div>';
            }
          }else if (colIndex == 3){ // combine the Title & Description
            cellValue = "<details><summary><b>"+someArray[i][columns[colIndex]]+"</b></summary>"+someArray[i][columns[colIndex+1]]+"</details>"
          }else if (colIndex == 4){ // skip the Description column
            continue
          } else { 
            var cellValue = someArray[i][columns[colIndex]];
            if (cellValue == null) cellValue = "";
            if (typeof cellValue === "object"){
              cellValue = cellValue.join(", ")
            }
          }


          row$.append($('<td/>').html(cellValue));
        }
        $(selector).append(row$);
      }
    }
  }
  //myTable.classList.add("table-striped");
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(someArray, selector) {
  var columnSet = [];
  var headerTr$ = $('<tr/>');
  columnSet.push("Save");
  headerTr$.append($("<th/>").html("Save"));
  columnSet.push("Session Time");
  headerTr$.append($("<th/>").html("Time"));
  columnSet.push("Room Number");
  headerTr$.append($("<th/>").html("Room"));
  columnSet.push("Class Title");
  headerTr$.append($("<th/>").html("Title & Description"));
  columnSet.push("Class Description");
  columnSet.push("Session Teacher / CoTeacher(s)");
  headerTr$.append($("<th/>").html("Teacher / CoTeacher(s)"));
  
  //if(dropdown0.value === "Detailed"){
  if(simpleViewBool == false){
    // dropdown0text.innerHTML = "Detailed Info"
    columnSet.push("Session Category");
    headerTr$.append($("<th/>").html("Category"));
    columnSet.push("Best For");
    headerTr$.append($("<th/>").html("Best For"));
    columnSet.push("Seats Available");
    headerTr$.append($("<th/>").html("Seats"));
    columnSet.push("Prerequisites / Materials Needed");
    headerTr$.append($("<th/>").html("Materials"));
    columnSet.push("Level of Learner");
    headerTr$.append($("<th/>").html("Level"));
  } 
  $(selector).append(headerTr$);
  return columnSet;
}

// function makeSaveBoxes(colIndex,someArray,i,cellValue){
//   if (colIndex == 0){
//         if(someArray[i]["Save"]){
//           cellValue = '<div class="form-check"><input onclick="saveSession(value,this.checked)" class="form-check-input position-static" type="checkbox" value='+i+' checked></div>';
//         }else{
//           cellValue = '<div class="form-check"><input onclick="saveSession(value,this.checked)" class="form-check-input position-static" type="checkbox" value='+i+'></div>';
//         }
//       }
// }

searchTextbox.addEventListener("keyup", function(event) {
  // Cancel the default action, if needed
  event.preventDefault();
  // Number 13 is the "Enter" key on the keyboard
  if (event.keyCode === 13) {
    // Trigger the button element with a click
    // $('.btn-navbar').click(); //bootstrap 2.x
    // $('.navbar-toggle').click();
    $('.navbar-collapse').collapse('hide');
    $("#searchText").blur(); 
  }
});

$(function() {
  //console.log('hello world :o')
  
  $("#searchText").on('change keydown paste input', function(){
      jsonSearch();
  });
  
  $.get('/dreams', function(data) {
    myList = JSON.parse(window.localStorage.getItem('sessionList'))

    if (myList === null || myList.length === 0)
    {
      myList = data;
      for(let i=0;i<myList.length;i++){
        myList[i]["Save"]=false;
      }
    }

    
    
    console.log(myList);
    buildHtmlTable('#excelDataTable',myList)
    // dreams.forEach(function(dream) {
    //   $('<li></li>').text(dream).appendTo('ul#dreams')
    // })
  })
  


  $('form').submit(function(event) {
    event.preventDefault();

  })

})
