var OBA = window.OBA || {};

OBA.Popup = function(map, fetchFn, markupFn) {

    var infowindow = null;

    return {
        show: function(marker) {
            fetchFn(function(json) {
                var markup = markupFn(json);
                infowindow = new google.maps.InfoWindow({
                    content: markup
                });
                infowindow.open(map, marker);
            });
        },
        hide: function() {
            if (infowindow)
                infowindow.close();
        }
    };
};

// utilities? scope wrap to prevent global leak?
function makeJsonFetcher(url, data) {
    return function(callback) {
        jQuery.getJSON(url, data, callback);
    };
}

OBA.StopPopup = function(stopId, map) {

    var generateStopMarkup = function(json) {
        var stop = json.stop;
        if (!stop) return "";
        return ("<p>" + stop.stopId + "</p>" +
                "<p>" + stop.lastUpdate + "</p>" +
                "<p>" + stop.description + "</p>");
    };

    return OBA.Popup(
        map,
        makeJsonFetcher(OBA.Config.stopUrl, {stopId: stopId}),
        generateStopMarkup);
}

OBA.VehiclePopup = function(vehicleId, map) {
    var generateVehicleMarkup = function(json) {
        var vehicle = json.vehicle;
        if (!vehicle) return "";
        return ("<p>" + vehicle.vehicleId + "</p>" +
                "<p>" + vehicle.lastUpdate + "</p>");
    };
    return OBA.Popup(
        map,
        makeJsonFetcher(OBA.Config.vehicleUrl, {vehicleId: vehicleId}),
        generateVehicleMarkup);
};
