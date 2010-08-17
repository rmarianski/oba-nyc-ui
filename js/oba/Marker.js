var OBA = window.OBA || {};

OBA.Marker = (function() {
    var marker = null;

    var entityId = null;

    // 1 = stop, 2 = vehicle
    var type = null;
    
    
    
    function makeStopMarker(stopId, latlng) {
      marker = new google.maps.Marker({
          position: new google.maps.LatLng(latlng[0], latlng[1]),
          title: stopId
      });
          
      type = 1;
      entityId = stopId;
   }

   function makeVehicleMarker(vehicleId, latlng) {
      marker = new google.maps.Marker({
          position: new google.maps.LatLng(latlng[0], latlng[1]),
          title: vehicleId
      });
          
      type = 2;
      entityId = vehicleId;
   }

    return {
       getType: function() {
            return type;
       },
       
       getMap: function() {
            return marker.getMap();
       },
       
       getEntityId: function() {
            return entityId;
       },
    
       showPopup: function() {
        
       },

       create: function(json, map) {
            if(typeof json.stopId !== 'undefined') {
                makeStopMarker(json.stopId, json.latlng);
            } else if(typeof json.vehicleId !== 'undefined') {
                makeVehicleMarker(json.vehicleId, json.latlng);
            }
            
            if(marker !== null) {                
                google.maps.event.addListener(marker, "click", function() {
                    showPopup();
                });
            
                marker.setMap(map);
            }
            
            return marker;
       }
     }
})();