var OBA = window.OBA || {};

OBA.Popup = function(map, fetchFn, markupFn) {
    var infowindow = null;

    return {
        show: function(marker) {        
            fetchFn(function(json) {
                infowindow = new google.maps.InfoWindow();
    
                // we need to append this node to the map for the size to be calculated properly
                $wrappedContent = jQuery('<div id="popup">' + markupFn(json) + '</div>').appendTo("#map");
                
                // setting the size on the wrapper element allows the maps API to calculate the bubble size properly
                $wrappedContent.css("width", 250).css("height", $wrappedContent.height());
            
                infowindow.setContent($wrappedContent.get(0));                
                infowindow.open(map, marker);
            });
        },

        hide: function() {
            if(infowindow)
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
        
        if (!stop) 
            return "";
        
        var header = '<p class="header">' + stop.name + '</p>' +
                   '<p class="description">Stop ID ' + stop.stopId + '</p>' + 
                   '<p class="meta">Updated <abbr class="timeago">' + stop.lastUpdate + '</abbr>.</p>';
            
        var service = "";           
        var notices = '<ul class="notices">';
        if(typeof stop.routesAvailable !== 'undefined') {
            service += '<p>This stop serves:</p><ul>';       

            jQuery.each(stop.routesAvailable, function(routeId) {
                var route = stop.routesAvailable[routeId];

                if(typeof route.serviceNotice !== 'undefined') {
                    notices += "<li>" + route.serviceNotice + "</li>";
                }
                
                for(var i = 0; i < route.distanceAway.length; i++) {
                    service += '<li><a href="#">' + OBA.Util.truncate(route.description, 30) + '</a> (' + route.distanceAway[i][0] + ' stops, ' + route.distanceAway[i][1] + ' ft.)</li>'; 
                }
           });
           
           service += "</ul>";
        }
    
        notices += "</ul>";
    
        return (header + notices + service);
    };

    return OBA.Popup(
        map,
        makeJsonFetcher(OBA.Config.stopUrl, {stopId: stopId}),
        generateStopMarkup);
}

OBA.VehiclePopup = function(vehicleId, map) {
    var generateVehicleMarkup = function(json) {
        var vehicle = json.vehicle;
        
        if (!vehicle) 
            return "";
        
        return ("<p>" + vehicle.vehicleId + "</p>" +
                "<p>" + vehicle.lastUpdate + "</p>");
    };
    
    return OBA.Popup(
        map,
        makeJsonFetcher(OBA.Config.vehicleUrl, {vehicleId: vehicleId}),
        generateVehicleMarkup);
};
