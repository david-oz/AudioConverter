/**
 * Created by User on 19/07/2018.
 */

/* to be done- deep clone of json objects */

var localJson = json
// var currentJson=Object.assign({}, json);
var currentJson = jQuery.extend(true, {}, json);

/* session storage
*
* "numOfDevices"= represent the total IOT devices on te board
*
* "numOfUpdatedDevices"= represent the total num of devices that was updated
*
* */

(function ($) {
  $(document).ready(function () {
    // here we want to save the num of the IOT devices on the board,
    // and updated the json file to contain those devices.
    var numOfDevices = 0

    $.get('/getIoTAddresses', function (data) {
      numOfDevices = data.length
      if (sessionStorage.getItem('currentJson') != null) {
        currentJson = JSON.parse(sessionStorage.getItem('currentJson'))
        currentJson = jQuery.extend(true, {}, localJson)
      }

      initJsonVar(data, numOfDevices)
    }).done(function () {
      // alert( "second success" );
      // if we refresh the page we are arriving to document.ready again...
      if (sessionStorage.length == 0) { // first time on the page
        sessionStorage.setItem('numOfDevices', numOfDevices)
        sessionStorage.setItem('numOfUpdatedDevices', 0) // to be changed
        // we want to reload the *localJson* map, according to num of IOT devices that was returned from the server.
      } else {
        // we want to reload the *currentJson* map, according to "numOfDevices" session var.
        sessionStorage.clear() // clear for now for each run.
        sessionStorage.setItem('numOfDevices', numOfDevices)
        sessionStorage.setItem('numOfUpdatedDevices', 0) // to be changed
      }

      numOfDevices = JSON.parse(sessionStorage.getItem('numOfDevices'))
      var numOfUpdatedDevices = JSON.parse(sessionStorage.getItem('numOfUpdatedDevices'))
      updateProgessBarAndHeader(numOfDevices, numOfUpdatedDevices)

      createKBmap('IDofCreatedMap', 'images/dotted_Map.png') // creates map

      IDofCreatedMap.importJSON(currentJson) // import json data into map

      IDofCreatedMap.showAllMapMarkers() // show all markers stored in map object
    })
      .fail(function () {
        alert('error')
      })

    // if we refresh the page we are arriving to document.ready again...
    // if (sessionStorage.length==0){ // first time on the page
    //   sessionStorage.setItem("numOfDevices", numOfDevices);
    //   sessionStorage.setItem("numOfUpdatedDevices", 0); // to be changed
    //   //we want to reload the *localJson* map, according to num of IOT devices that was returned from the server.
    // }
    // else{
    //   //we want to reload the *currentJson* map, according to "numOfDevices" session var.
    //   numOfDevices=JSON.parse(sessionStorage.getItem("numOfDevices"));
    //   sessionStorage.setItem("numOfUpdatedDevices", numOfDevices);
    //
    // }

    // numOfDevices=JSON.parse(sessionStorage.getItem("numOfDevices"));
    // var numOfUpdatedDevices=JSON.parse(sessionStorage.getItem("numOfUpdatedDevices"));
    // updateProgessBarAndHeader(numOfDevices,numOfUpdatedDevices);
    //
    // createKBmap('IDofCreatedMap', 'images/dotted_Map.png'); // creates map
    //
    // IDofCreatedMap.importJSON(currentJson); // import json data into map
    //
    // IDofCreatedMap.showAllMapMarkers(); // show all markers stored in map object
  })
})(jQuery)

function newUpdate (transactionHash, address) {
  console.log('newUpdate: transactionHash =', transactionHash)
  console.log('newUpdate: address =', address)
  updateMapMarkerInCurrJson(transactionHash, address)
  removeCurrMap(sessionStorage.getItem('numOfDevices')) // delete current markers from map
  sessionStorage.setItem('currentJson', JSON.stringify(currentJson))
  IDofCreatedMap.importJSON(currentJson) // import json data into map
  IDofCreatedMap.showAllMapMarkers() // show all markers stored in map object
  var numOfDevices = JSON.parse(sessionStorage.getItem('numOfDevices'))
  var numOfUpdatedDevices = JSON.parse(sessionStorage.getItem('numOfUpdatedDevices')) + 1
  sessionStorage.setItem('numOfUpdatedDevices', numOfUpdatedDevices)
  updateProgessBarAndHeader(numOfDevices, numOfUpdatedDevices)
}

function initJsonVar (data, numOfDevices) {
  var test = {}
  for (var i = 0; i < numOfDevices; i++) {
    Object.values(currentJson)[i].address = data[i]
    var index = i + 1
    var objName = 'mapMarker' + index.toString()
    test[objName] = currentJson[objName]
  }
  currentJson = jQuery.extend(true, {}, test)
}

function updateMapMarkerInCurrJson (transactionHash, address) {
  for (var i = 0; i < sessionStorage.getItem('numOfDevices'); i++) {
    if (Object.values(currentJson)[i].address === address) {
      Object.values(currentJson)[i].markerUrl = 'https://ropsten.etherscan.io/tx/' + transactionHash
      Object.values(currentJson)[i].icon = 'images/Active_icon.png'
      return
    }
  }
}

function removeCurrMap (numOfMarkers) {
  for (i = 1; i <= numOfMarkers; i++) {
    var mapMarkerName = 'mapMarker' + (i)
    IDofCreatedMap.removeMarker(mapMarkerName)
  }
}

function updateProgessBarAndHeader (numOfDevices, numOfUpdatedDevices) {
  var percentage = calculatePercentage(numOfUpdatedDevices, numOfDevices)
  $('.progress-bar').css('width', percentage + '%').attr('aria-valuenow', percentage)
  document.getElementById('updateStatusLabelAmount').innerHTML = numOfUpdatedDevices + '/' + numOfDevices
}

function calculatePercentage (numOfUpdatedDevices, numOfDevices) {
  return (numOfUpdatedDevices / numOfDevices) * 100
}

var connection = new WebSocket("ws://" + location.host)
connection.onmessage = function (message) {
  // try to decode json (I assume that each message
  // from server is json)
  try {
    var json = JSON.parse(message.data)
  } catch (e) {
    console.log('This doesn\'t look like a valid JSON: ',
      message.data)
  }
  console.log('json =', json)
  newUpdate(json.transactionHash, json.returnValues.pko.toLowerCase())
}
