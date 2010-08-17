var OBA = window.OBA || {};

OBA.RouteCollection = (function() {
      var routeIdToShapes = {};
      var routeIdsToVehicleMarkers = {};
      var numberOfRoutes = 0;
      var vehicleMarkers = {};
      var isVehiclePolling = false;

      var requestRoutes = function(routeIds) {
        var routesToSerialize;

        if (typeof routeIds === "undefined") {
          // to be more efficient we can store the list of all route ids
          // separately in memory, yagni now
          routesToSerialize = [];
        
          for (var routeId in routeIdToShapes) {
            routesToSerialize.push(routeId);
          }
        } else {
          routesToSerialize = routeIds;
        }
    
        jQuery.getJSON(OBA.Config.vehiclesUrl, {routeIds: routesToSerialize}, function(json) {
          var vehicles = json.vehicles;

          if (!vehicles)
            return;

          // helper function to add an element to a map where values are lists
          var addVehicleMarkerToRouteMap = function(routeId, vehicleMarker) {
            var vehicles = routeIdsToVehicleMarkers[routeId];

            if (vehicles) {
              vehicles.push(vehicleMarker);
            } else {
              vehicles = [vehicleMarker];
              routeIdsToVehicleMarkers[routeId] = vehicles;
            }
          };

          jQuery.each(vehicles, function(i, vehicleSection) {
            var routeId = vehicleSection.routeId;
    
            jQuery.each(vehicleSection.vehicles, function(i, vehicle) {
              var vehicleMarker = vehicleMarkers[vehicle.vehicleId];
            
              if (vehicleMarker) {
                var latlng = new google.maps.LatLng(vehicle.latlng[0], vehicle.latlng[1]);
    
                vehicleMarker.setPosition(latlng);
        
                if (!vehicleMarker.getMap()) {
                  // route was added, removed, and added back
                  // the markers already exist, but have just been removed from the map
                  // we can reuse them and we only have to set their map reference
                  vehicleMarker.setMap(map);
            
                  addVehicleMarkerToRouteMap(routeId, vehicleMarker);
                }
              } else {
                vehicleMarker = OBA.Marker.create(vehicle);
                vehicleMarkers[vehicle.vehicleId] = vehicleMarker;

                addVehicleMarkerToRouteMap(routeId, vehicleMarker);
              }
            }); // each vehicleSection
          }); // each vehicles
        }); // getJSON
      }; // requestRoutes

      return {
        containsRoute: function(routeId) {
          return routeId in routeIdToShapes;
        },
    
        // add and remove shapes also take care of updating the display
        // if this is a problem we can factor this back out
        addRoute: function(routeId, json) {    
          var coords = json.route && json.route.polyline;
            
          if (! coords)
            return;
            
          var latlngs = jQuery.map(coords, function(x) {
              return new google.maps.LatLng(x[0], x[1]);
          });
            
          var shape = new google.maps.Polyline({
              path: latlngs,
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2
          });
            
          routeIdToShapes[routeId] = shape;
          shape.setMap(OBA.Tracker.getMap());

          numberOfRoutes += 1;

          // always make an initial request just for this route
          requestRoutes([routeId]);

          // update the timer task
          //if (!isVehiclePolling) {
          //}
        },

        removeRoute: function(routeId) {
          var shape = routeIdToShapes[routeId];

          if (shape) {
            delete routeIdToShapes[routeId];
            numberOfRoutes -= 1;
            shape.setMap(null);
          }

          var vehicles = routeIdsToVehicleMarkers[routeId];
    
          if (vehicles) {
            jQuery.each(vehicles, function(i, vehicleMarker) {
              vehicleMarker.setMap(null);
            });

            delete routeIdsToVehicleMarkers[routeId];
          }
        },

        getCount: function() {
            return numberOfRoutes;
        },
        
        anyRoutes: function() {
          return numberOfRoutes > 0;
        },
      };
    })();



