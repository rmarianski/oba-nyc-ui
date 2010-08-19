var OBA = window.OBA || {};

OBA.Popup = function(map, fetchFn, bubbleNodeFn) {
    var infowindow = null;

    return {
        show: function(marker) {        
            fetchFn(function(json) {
                infowindow = new google.maps.InfoWindow();
    
                // we need to append this node to the map for the size to be calculated properly
                $wrappedContent = jQuery('<div id="popup"></div>')
                                    .append(bubbleNodeFn(json))
                                    .appendTo("#map");
                                                        
                $wrappedContent = $wrappedContent.css("width", 250).css("height", $wrappedContent.height());
                        
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
        
        if (! stop) 
            return null;
        
        var header = '<p class="header">' + stop.name + '</p>' +
                     '<p class="description">Stop ID ' + stop.stopId + '</p>' + 
                     '<p class="meta">Updated ' + stop.lastUpdate + '.</p>';
            
        var service = '';           
        var notices = '<ul class="notices">';
        if(typeof stop.routesAvailable !== 'undefined') {
            service += '<p>This stop serves:</p><ul>';       

            jQuery.each(stop.routesAvailable, function(routeId) {
                var route = stop.routesAvailable[routeId];

                if(typeof route.serviceNotice !== 'undefined') {
                    notices += '<li>' + route.serviceNotice + '</li>';
                }
                
                for(var i = 0; i < route.distanceAway.length; i++) {
                    // routes with a service notice should appear red
                    if(typeof route.serviceNotice !== 'undefined') {
                        service += '<li class="hasNotice">';
                    } else {
                        service += '<li>';
                    }
                    
                    service += '<a href="#" class="searchLink" rel="' + routeId + '">' + OBA.Util.truncate(routeId + ' - ' + route.description, 30) + '</a> (' + route.distanceAway[i][0] + ' stops, ' + route.distanceAway[i][1] + ' ft.)</li>'; 
                }
           });
           
           service += '</ul>';
        }
        
        notices += '</ul>';
    
        bubble = jQuery(header + notices + service);

        bubble.find("a.searchLink").click(function() {
            var id = jQuery(this).attr("rel");
            var searchForm = jQuery("#search form");
            var searchInput = jQuery("#search input[type=text]");
    
            searchInput.val(id);
            searchForm.submit();        
        });

        return bubble;
    };

    return OBA.Popup(
        map,
        makeJsonFetcher(OBA.Config.stopUrl, {stopId: stopId}),
        generateStopMarkup);
}

OBA.VehiclePopup = function(vehicleId, map) {
    var generateVehicleMarkup = function(json) {
        var vehicle = json.vehicle;
        
        if (! vehicle) 
            return null;
        
        var header = '<p class="header' + ((typeof vehicle.serviceNotice !== 'undefined') ? ' hasNotice' : '') + '">' + OBA.Util.truncate(vehicle.routeId + ' - ' + vehicle.description, 35) + '</p>' +
             '<p class="description">Bus #' + vehicle.vehicleId + '</p>' + 
             '<p class="meta">Updated ' + vehicle.lastUpdate + '.</p>';

        var notices = '<ul class="notices">';

        if(typeof vehicle.serviceNotice !== 'undefined') {
            notices += '<li>' + vehicle.serviceNotice + '</li>';
        }

        notices += '</ul>';
            
        var nextStops = '';
        if(typeof vehicle.nextStops !== 'undefined') {
            nextStops += '<p>Next stops:<ul>';       

            jQuery.each(vehicle.nextStops, function(stopId) {
                var stop = vehicle.nextStops[stopId];
               
                nextStops += '<li><a href="#" class="searchLink" rel="' + stopId + '">' + OBA.Util.truncate(stop.name, 30) + '</a> (' + stop.distanceAway[0] + ' stops, ' + stop.distanceAway[1] + ' ft.)</li>';
           });
    
           nextStops += '</ul>';
        }

        bubble = jQuery(header + notices + nextStops);
        
        bubble.find("a.searchLink").click(function() {
            var id = jQuery(this).attr("rel");
            var searchForm = jQuery("#search form");
            var searchInput = jQuery("#search input[type=text]");
    
            searchInput.val(id);
            searchForm.submit();
        });
        
        return bubble;
    };
    
    return OBA.Popup(
        map,
        makeJsonFetcher(OBA.Config.vehicleUrl, {vehicleId: vehicleId}),
        generateVehicleMarkup);
};
