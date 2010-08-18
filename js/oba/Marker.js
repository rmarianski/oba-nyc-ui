var OBA = window.OBA || {};

OBA.Marker = function(entityId, latlng, map, popup, icon) {

    var markerOptions = {
        position: new google.maps.LatLng(latlng[0], latlng[1]),
        map: map
    };
    if (typeof icon !== "undefined") {
        markerOptions.icon = icon;
    }

    var marker = new google.maps.Marker(markerOptions);

    var showPopup = function() { popup.show(marker); };
    google.maps.event.addListener(marker, "click", showPopup);

    return {
        showPopup: showPopup,
        hidePopup: function() {
            popup.hide();
        },
        addMarker: function() {
            marker.setMap(map);
        },
        removeMarker: function() {
            marker.setMap(null);
        },
        updatePosition: function(latlng) {
            marker.setPosition(latlng);
        }
    };
};

OBA.StopMarker = function(stopId, latlng, map) {
    return OBA.Marker(stopId, latlng, map,
        OBA.StopPopup(stopId, map));
};

OBA.VehicleMarker = function(vehicleId, latlng, map) {
    return OBA.Marker(vehicleId, latlng, map,
        OBA.VehiclePopup(vehicleId, map),
        "/img/vehicle.png");
};
