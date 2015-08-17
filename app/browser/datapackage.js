var BrowserWindow = require('browser-window');
var Dialog = require('dialog');
var Fs = require('fs');
var ipc = require('ipc');
var path = require('path');

var exports = module.exports = {};

exports.exportDatapackage = function() {
  var window = BrowserWindow.getFocusedWindow();

  datapackage = new BrowserWindow({width: 450, height: 600, 'always-on-top': true});
  datapackage.loadUrl('file://' + __dirname + '/../comma-chameleon/views/datapackage.html');

  datapackage.on('closed', function() {
    datapackage = null;
  });

  //there follows some horrible async
  //my understanding of why async is as follows - we have no controllers / model structure to control the data mgmt
  //ergo to ensure we are getting the right data for the correct CSV we are reliant on the Browser.getFocusedWindow() method
  //at two points in this long method it is necessary to ensure that this is the intended window, when the header row data is sought
  //and when the CSV to be saved to the package is retrieved by the dialog module

  ipc.once('sendDatapackage', function(e, data, includeHeaders) {
    // data here is the object generated by filling out the form
    //debugger;
    // parse available globals to get suggested names for the data package
    var currentFileName = window.getTitle();
    var suggestedFileName = path.basename(currentFileName).replace('.csv', '');

    var thatData = data;
    // writing this assignment because the logic of the closure below reminds me of 'this' and 'that'

    // issue calls to get the JSON rendering of the header row
    if(includeHeaders === "true"){
      window.webContents.send('schemaFromHeaders');
      ipc.on('jsonHeaders', function(event, json){
        //assign the headers to the JSON datapackage
        console.log("this is the data within includeHeaders conditional async IPC "+JSON.stringify(data));
        var data = datapackageJson(thatData, json);
        console.log("currently executing within the IPC function that retrieves the headers");
        //thatData["fields"] = json["fields"];
        //return data;
      });
    } else {
      var data = datapackageJson(thatData);
      //return data;
    }
    //console.log("this is the data immediately after the includeHeaders conditional "+JSON.stringify(data));
    //var data = datapackageJson(data);

    Dialog.showSaveDialog({
      defaultPath: suggestedFileName+".zip",
      //defaultPath: includeHeaders,
      filters: [
        { name: 'text', extensions: ['zip'] }
      ],
      //defaultPath: 'datapackage.zip'
    }, function (fileName) {
      if (fileName === undefined) return;
      datapackage.close();
      window.webContents.send('getCSV');

      ipc.once('sendCSV', function(e, csv) {
        generateDatapackage(fileName, data, csv)
      });
    });
  });

  ipc.once('datapackageCanceled', function() {
    datapackage.close();
  });
}

function datapackageJson(data, headers) {
  //debugger
  console.log("within schema forming function with params: "+data+"and"+headers);
  data.keywords = data.keywords.split(",");
  //console.log(data.keywords);
  data.resources = [
    {
      "name": data.name,
      "path": "data/" + data.name + ".csv",
      "mediatype": "text/csv",
      "schema": headers
    }
  ]
  console.log("all those assignments went fine, behold the data "+JSON.stringify(data));
  return data
}

function generateDatapackage(fileName, data, csv) {
  // this function is only triggered after the user confirms the name of what they wish to save the package as
  console.log("within async triggered generate data package function "+data);
  zip = new require('node-zip')();
  zip.file('datapackage.json', JSON.stringify(data,null, 2));
  zip.file('data/' + data.name + '.csv', csv);
  zipData = zip.generate({base64:false,compression:'DEFLATE'});
  Fs.writeFileSync(fileName, zipData, 'binary');
}