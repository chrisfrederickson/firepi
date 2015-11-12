var loggedIn = false;
function loadFunctionGenerator() {
    if(loggedIn) {
        document.getElementById("auth").style.display = 'block';
        document.getElementById("noauth").style.display = 'none';
        refreshFunctionGenerator();
    }
}   
function dummyAuthenticate() {
    //This will give you access to the UI of a logged in user, 
    // but you won't be able to do anything without a token
    loggedIn = true;
    loadFunctionGenerator();
}
document.getElementById('authenticate').onclick = function(event) {
    window.location.href = '/login';
}
document.getElementById('functionDownload').onclick = function(event) {
    var temperatureRaw = temperatureProfile.toCsv();   
    var downloadOpen = document.createElement("a");
    downloadOpen.download = "temperature_profile.csv";
    downloadOpen.href = "data:text/csv;base64," + btoa(temperatureRaw);
    downloadOpen.click();
}
if (window.File && window.FileReader && window.FileList && window.Blob) {
    console.log("Great success! All the File APIs are supported.");
} else {
    console.error("Error: You cannot do custom file uploading");
    document.getElementById("custom").style.display = 'none';
    document.getElementById("generateHeader").innerHTML = "You can";
}
var temperatureProfile = new CSV();

setInterval(function() {
    //AJAX /GET
    $.get('/get', {}, function(response) {
        document.getElementById('temperature').value = response;
    });
}, 1000);
document.getElementById('temperature').onchange = function() {
    $.get('/set', {temp: document.getElementById('temperature').value}, function(response) {
        alert(response); 
    });
}


//DND - http://www.html5rocks.com/en/tutorials/file/dndfiles/
function handleFileDNDSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    for (var i = 0, f; f = files[i]; i++) {
        handleFile(f);
    }
  }
function handleFileUploadSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    for (var i = 0, f; f = files[i]; i++) {                  
        handleFile(f);
    }
  }
function handleFile(file) {
    document.getElementById('custom').style.borderColor = "black";
    var output = [];
    output.push('<li><strong>', escape(file.name), '</strong> (', file.type || 'n/a', ') - ',
                  file.size, ' bytes, last modified: ',
                  file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a',
                  '</li>');
    document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';
    //TODO Hide the file input

    // TODO Only process csv files.
      if (!file.name.match('.csv')) {
          return;
      }

    //Read the data as a string, turn it into a CSV, do some validation checks

      var reader = new FileReader();
      // Closure to capture the file information.
      reader.onload = (function(theFile) {
        return function(e) {
            // Get CSV
            temperatureRaw = e.target.result;
            console.log(temperatureRaw);
            temperatureProfile = new CSV();
            isValidRegex = new RegExp('([\\S]+,[\\S]+[\\n\\r]+)+');
            if(temperatureRaw.match(isValidRegex).length != 1 && temperatureRaw.match(isValidRegex).length != 2) {
                alert("Invalid format");   
                return;
            }
            rowSplitRegex = new RegExp('[\\S]+,[\\S]+', 'g');
            rows = temperatureRaw.match(rowSplitRegex);
            for(var i = 0, r; r = rows[i]; i++) {
                var row = new CSVRow();
                row.setColumns(r);
                temperatureProfile.addRow(row);
            }
            console.log(temperatureProfile);
            refreshFunctionGenerator();
        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsText(file);
}

  document.getElementById('customcsv').addEventListener('change', handleFileUploadSelect, false);

  function handleDragOver(evt) {
      evt.stopPropagation();
      evt.preventDefault();
      evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
      document.getElementById('custom').style.borderColor = "#09f";
  }

  // Setup the dnd listeners.
  var dropZone = document.getElementById('custom');
  dropZone.addEventListener('dragover', handleDragOver, false);
  dropZone.addEventListener('drop', handleFileDNDSelect, false);

//FUNCTION GENERATOR
function refreshFunctionGenerator() {
    out = "";
    for(var i = 0, r; r = temperatureProfile.getRows()[i]; i++) {
        out += addFunction(r);   
    }
    out += addFunction();
    out += "<button onclick='newPiecewiseSegment()'>Add</button>";

    document.getElementById('functionGenerator').innerHTML = out;

    updateDuration();
}
//Generates UI for another piecewise element
function addFunction(CSVrow) {
    out = "Temperature (Celcius): <input class='temperatureInput' type='number' min='-40' max='120' step='0.1' value='"+(CSVrow !== undefined?CSVrow.getColumn(0):25)+"'>";
    out += "Duration (seconds): <input class='secondInput' type='number' onchange='updateDuration()' min='0' max='3600' step='1' value='"+(CSVrow !== undefined?CSVrow.getColumn(1):120)+"'>";
    out += "<br>";
    return out;
}
//Manually adds a new element to the piecewise function
function newPiecewiseSegment() {
    flush();
    refreshFunctionGenerator();
}
//Turns all inputs into a CSV object and sets that to the global temperatureProfile
function flush() {
    temperatureProfile = new CSV();
    for(var i = 0, temp; temp = document.getElementsByClassName('temperatureInput')[i]; i++) {
        var second = document.getElementsByClassName('secondInput')[i];
        console.log(temp);
        console.log(second);
        var row = new CSVRow();
        row.setColumn(CSVROW.COLUMN_TEMPERATURE, temp.value);
        row.setColumn(CSVROW.COLUMN_SECONDS, second.value);
        temperatureProfile.addRow(row);
    }
}
function updateDuration() {
    console.log("B");
    document.getElementById('functionDuration').innerHTML = "Your function will run for "+Math.floor(getProfileDuration()/60)+"m "+getProfileDuration()%60+"s";   
}
function getProfileDuration() {
    flush();
    var rows = temperatureProfile.getRows();
    var sum = 0;
    for(var i = 0; i < rows.length; i++) {
        sum += parseInt(rows[i].getColumn(CSVROW.COLUMN_SECONDS));   
    }
    return sum;
}

//MODELS            
function CSV() {
    this.rows = [];   
    this.addRow = function(row) {
        this.rows[this.rows.length] = row;   
    }
    this.getRowCount = function() {
        return this.rows.length;
    }   
    this.isEmpty = function() {
        return this.getRowCount() == 0;   
    }
    this.getRows = function() {
        return this.rows;   
    }
    this.toCsv = function() {
        //Iterate through the CSV object and generate a CSV input
        flush();
        var out = "";
        var rows = temperatureProfile.getRows();
        for(var i = 0; i < rows.length; i++) {
            //Ignore any null operations
            if(rows[i].getColumn(CSVROW.COLUMN_SECONDS) > 0)
                out += rows[i].getColumn(CSVROW.COLUMN_TEMPERATURE)+","+rows[i].getColumn(CSVROW.COLUMN_SECONDS)+"\n";
        }
        return out;
    }
}
CSVROW = {COLUMN_TEMPERATURE: 0, COLUMN_SECONDS: 1};
function CSVRow() {
    this.columns = [];
    this.setColumns = function(string) {
        newLineRegex = new RegExp('[\n\r]+', 'g');
        string = string.replace(newLineRegex, "");
        this.columns = string.split(',');   
    }
    this.setColumn = function(pos, input) {
        this.columns[pos] = input;   
    }
    this.getColumns = function() {
        return this.columns;   
    }
    this.getColumnsSize = function() {
        return this.columns.length;   
    }
    this.getColumn = function(int) {
        return this.columns[int];   
    }
}