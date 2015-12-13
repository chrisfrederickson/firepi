var endpoint = "/api/v1/";
function getTemperature(callback) {
    $.get(endpoint+"temp", {}, function(response) {
        callback(response);
    });
}
function setTemperature(newTemp, callback) {
    $.ajax({
        url: endpoint+"temp",
        type: 'PUT',
        data: {temp: newTemp},
        success: function(result) {
            callback(result);
        }
    });
}
function setTemperatureCurve(tempCurve, callback) {
/*    $.post(endpoint+'tempcurve', {temp_curve: tempCurve}, function(response) {
        callback(response);     
    });*/

    $.ajax({
        url: endpoint+"tempcurve",
        type: 'POST',
        data: {temp_curve: tempCurve},
        success: function(result) {
            callback(result);
        }
    });
}   
function switchComPort(port, callback) {
    $.ajax({
        url: endpoint+"reconnect",
        type: 'PUT',
        data: {port: port},
        success: function(result) {
            callback(result);
        }
    }); 
}