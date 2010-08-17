var OBA = window.OBA || {};

OBA.Popup = (function() {
    function makeStopPopupContent(json) {
          return ("<p>" + json.stopId + "</p>" +
                  "<p>" + json.lastUpdate + "</p>" +
                  "<p>" + json.description + "</p>");
    }

    function makeVehiclePopupContent(json) {
          return ("<p>" + json.vehicleId + "</p>" +
                  "<p>" + json.lastUpdate + "</p>");
    }

    function showStopPopup(stopMarker, stopId) {
        jQuery.getJSON(OBA.Config.stopUrl, {stopId: stopId}, function(json) {
            var stop = json.stop;
            var stopContent = makeStopPopupContent(stop);

            var popup = new google.maps.InfoWindow({
              content: stopContent
            });

            popup.open(marker.getMap(), stopMarker);
         });
    }

    function showVehiclePopup(vehicleMarker, vehicleId) {
        jQuery.getJSON(OBA.Config.vehicleUrl, {vehicleId: vehicleId}, function(json) {
            var vehicle = json.vehicle;
            var vehicleContent = makeVehiclePopupContent(vehicle);

            var popup = new google.maps.InfoWindow({
              content: vehicleContent
            });
    
            popup.open(marker.getMap(), vehicleMarker);
        });
    }

    return {
        create: function(marker) {
            if(marker.getType() === 'vehicle') {
                showVehiclePopup(marker, marker.getEntityId());

            } else if(marker.getType() === 'stop') {
                showStopPopup(marker, marker.getEntityId());
            }
        }
    };
})();