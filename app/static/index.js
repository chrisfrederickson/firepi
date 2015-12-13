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
//    window.location.href = '/login';
    dummyAuthenticate();
}
document.getElementById('comnect').onclick = function(event) {
    switchComPort(document.getElementById('comport').value, function(result) {
        console.log(result);
        if(result.error !== undefined)
            alert(result.error);
    }); 
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
var connectedToTemperatureChamber = true;

function updateConnection(isConnected) {
    connectedToTemperatureChamber = isConnected;
    var items = [
        'functionPost',
        'temperature'
    ];
    for(i in items) {
        var item = document.getElementById(items[i]);
        console.log(item, !isConnected);
        if(isConnected) {
            item.removeAttribute('disabled');
        } else {
            item.disabled = !isConnected;
        }
    }
    if(!isConnected) {
        document.getElementById('error_message').innerHTML = "Cannot connect to temperature chamber. Please check your connection and make sure it is turned on."
        document.getElementById('connection').style.display = 'block';
    } else {
        document.getElementById('error_message').innerHTML = "";
        document.getElementById('connection').style.display = 'none';
    }
}

function getTemperatureRequest() {
    getTemperature(function(response) {
        console.log(response.temp);
        if(response.temp == null) {
            document.getElementById('curr_temperature').innerHTML = '<span style="color:#F44336">TEMP NOT FOUND</span>';  
            //Nothing works!
            updateConnection(false);
        }
        else if(response.temp !== undefined) {
            document.getElementById('curr_temperature').innerHTML = response.temp;  
            updateConnection(true);
        }
    });
}

setInterval(function() {
    if(connectedToTemperatureChamber)
        getTemperatureRequest();
}, 1000);
document.getElementById('temperature').onchange = function() {
   /* $.get('/set', {temp: document.getElementById('temperature').value}, function(response) {
        alert(response); 
    });*/
    setTemperature(document.getElementById('temperature').value, function(response) {
        if(response.msg !== undefined)
            alert(response.msg);
    });
}
document.getElementById('functionPost').onclick = function() {
    flush();
    setTemperatureCurve(temperatureProfile.toCsv(), function(response) {
        console.log('post curve', response);
        if(response.msg !== undefined)
            alert(response.msg);
    });
};


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
    out = "Temperature (Celcius): <input class='temperatureInput' type='number' min='-40' max='120' step='0.1' onchange='updateGraph()' value='"+(CSVrow !== undefined?CSVrow.getColumn(0):25)+"'>";
    out += "Duration (seconds): <input class='secondInput' type='number' onchange='updateDuration()' min='0' max='3600' step='1' value='"+(CSVrow !== undefined?CSVrow.getColumn(1):120)+"'>";
    out += "<br>";
    return out;
}
//Manually adds a new element to the piecewise function
function newPiecewiseSegment() {
    flush();
    refreshFunctionGenerator();
    
    //Let's also update the graph at the same time
    updateGraph();
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
    
    //Let's also update the graph at the same time
    updateGraph();
}
function updateGraph() {
    datarray = [];
    timerray = [0];
    //Let's keep things scaled down
    var step = getProfileDuration()/12;
    
    for(i=0;i<temperatureProfile.getRowCount();i++) {
        //Get the row
        var row = temperatureProfile.getRows()[i];
        //Get the time
        var time = row.getColumn(CSVROW.COLUMN_SECONDS);
        for(t=0;t<time;t+=step) {
            datarray.push(row.getColumn(CSVROW.COLUMN_TEMPERATURE));  
            timerray.push(timerray[timerray.length-1]+1)
        }
    }
    
    var data = {
        labels: timerray,
       datasets: [
        {
            label: "Temperature Profile",
            fillColor: "rgba(220,220,220,0.2)",
            strokeColor: "rgba(220,220,220,1)",
            pointColor: "rgba(220,220,220,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(220,220,220,1)",
            data: datarray
        },
       ]
    }
    
    console.log(timerray);
    console.log(datarray);
    
    var ctx = document.getElementById("curve").getContext("2d");
    var myLineChart = new Chart(ctx).Line(data, {
        bezierCurve:true,
        bezierCurveTension:0.6
    });
    a = document.getElementById('curve')
    if(window.innerWidth > 1280)
        a.style.width = 'calc(100% - 36px)'
    else
        a.style.width = '100%'
        
    a.style.height = '240px'
    a.style.display = 'block'
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

//Chartjs
Chart.defaults.global = {
    // Boolean - Whether to animate the chart
    animation: true,

    // Number - Number of animation steps
    animationSteps: 60,

    // String - Animation easing effect
    // Possible effects are:
    // [easeInOutQuart, linear, easeOutBounce, easeInBack, easeInOutQuad,
    //  easeOutQuart, easeOutQuad, easeInOutBounce, easeOutSine, easeInOutCubic,
    //  easeInExpo, easeInOutBack, easeInCirc, easeInOutElastic, easeOutBack,
    //  easeInQuad, easeInOutExpo, easeInQuart, easeOutQuint, easeInOutCirc,
    //  easeInSine, easeOutExpo, easeOutCirc, easeOutCubic, easeInQuint,
    //  easeInElastic, easeInOutSine, easeInOutQuint, easeInBounce,
    //  easeOutElastic, easeInCubic]
    animationEasing: "easeOutQuart",

    // Boolean - If we should show the scale at all
    showScale: true,

    // Boolean - If we want to override with a hard coded scale
    scaleOverride: false,

    // ** Required if scaleOverride is true **
    // Number - The number of steps in a hard coded scale
    scaleSteps: null,
    // Number - The value jump in the hard coded scale
    scaleStepWidth: null,
    // Number - The scale starting value
    scaleStartValue: null,

    // String - Colour of the scale line
    scaleLineColor: "rgba(0,0,0,.1)",

    // Number - Pixel width of the scale line
    scaleLineWidth: 1,

    // Boolean - Whether to show labels on the scale
    scaleShowLabels: true,

    // Interpolated JS string - can access value
    scaleLabel: "<%=value%>",

    // Boolean - Whether the scale should stick to integers, not floats even if drawing space is there
    scaleIntegersOnly: true,

    // Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
    scaleBeginAtZero: false,

    // String - Scale label font declaration for the scale label
    scaleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

    // Number - Scale label font size in pixels
    scaleFontSize: 12,

    // String - Scale label font weight style
    scaleFontStyle: "normal",

    // String - Scale label font colour
    scaleFontColor: "#666",

    // Boolean - whether or not the chart should be responsive and resize when the browser does.
    responsive: false,

    // Boolean - whether to maintain the starting aspect ratio or not when responsive, if set to false, will take up entire container
    maintainAspectRatio: true,

    // Boolean - Determines whether to draw tooltips on the canvas or not
    showTooltips: false,

    // Function - Determines whether to execute the customTooltips function instead of drawing the built in tooltips (See [Advanced - External Tooltips](#advanced-usage-custom-tooltips))
    customTooltips: false,

    // Array - Array of string names to attach tooltip events
    tooltipEvents: ["mousemove", "touchstart", "touchmove"],

    // String - Tooltip background colour
    tooltipFillColor: "rgba(0,0,0,0.8)",

    // String - Tooltip label font declaration for the scale label
    tooltipFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

    // Number - Tooltip label font size in pixels
    tooltipFontSize: 14,

    // String - Tooltip font weight style
    tooltipFontStyle: "normal",

    // String - Tooltip label font colour
    tooltipFontColor: "#fff",

    // String - Tooltip title font declaration for the scale label
    tooltipTitleFontFamily: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif",

    // Number - Tooltip title font size in pixels
    tooltipTitleFontSize: 14,

    // String - Tooltip title font weight style
    tooltipTitleFontStyle: "bold",

    // String - Tooltip title font colour
    tooltipTitleFontColor: "#fff",

    // Number - pixel width of padding around tooltip text
    tooltipYPadding: 6,

    // Number - pixel width of padding around tooltip text
    tooltipXPadding: 6,

    // Number - Size of the caret on the tooltip
    tooltipCaretSize: 8,

    // Number - Pixel radius of the tooltip border
    tooltipCornerRadius: 6,

    // Number - Pixel offset from point x to tooltip edge
    tooltipXOffset: 10,

    // String - Template string for single tooltips
    tooltipTemplate: "<%if (label){%><%=label%>: <%}%><%= value %>",

    // String - Template string for multiple tooltips
    multiTooltipTemplate: "<%= value %>",

    // Function - Will fire on animation progression.
    onAnimationProgress: function(){},

    // Function - Will fire on animation completion.
    onAnimationComplete: function(){}
}
Chart.defaults.global.responsive = true;