//XXX global map for testing in browser
var map;

(function() {

// reference to the map on the screen
//var map;

// urls to fetch various data
var routeShapeUrl = "/route.php";
var stopsUrl = "/stops.php";
var stopUrl = "/stop.php";
var vehiclesUrl = "/vehicles.php";
var vehicleUrl = "/vehicle.php";

// list of routes displayed on screen
// kept here so we can reference them when removing overlays from the map
var routes = (function() {

  var routeIdToShapes = {};
  var routeIdsToVehicleMarkers = {};
  var numberOfRoutes = 0;
  var nDisplayedElement = null;
  var vehicleMarkers = {};
  var isVehiclePolling = false;

  jQuery(document).ready(function() {
    nDisplayedElement = jQuery("#n-displayed-routes");
  });

  var requestRoutes = function(routeIds) {
    var routesToSerialize;
    if (typeof routeIds === "undefined") {
      // to be more efficient we can store the list of all route ids
      // separately in memory, yagni now
      routesToSerialize = [];
      for (var routeId in routeIdToShapes)
        routesToSerialize.push(routeId);
    } else {
      routesToSerialize = routeIds;
    }
    jQuery.getJSON(vehiclesUrl, {routeIds: routesToSerialize}, function(json) {
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
            vehicleMarker = makeVehicleMarker(vehicle.vehicleId, vehicle.latlng);
            vehicleMarkers[vehicle.vehicleId] = vehicleMarker;
            addVehicleListener(vehicleMarker, vehicle.vehicleId);
            vehicleMarker.setMap(map);

            addVehicleMarkerToRouteMap(routeId, vehicleMarker);
          }
        });
      });
    });
  };

  return {
    containsRoute: function(routeId) {
      return routeId in routeIdToShapes;
    },
    // add and remove shapes also take care of updating the display
    // if this is a problem we can factor this back out
    addRoute: function(routeId, routeShape) {
      // update current state
      routeIdToShapes[routeId] = routeShape;
      numberOfRoutes += 1;

      // update text info on screen
      jQuery("#no-routes-displayed-message").remove();
      nDisplayedElement.text(numberOfRoutes);

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
      nDisplayedElement.text(numberOfRoutes);
      var vehicles = routeIdsToVehicleMarkers[routeId];
      if (vehicles) {
        jQuery.each(vehicles, function(i, vehicleMarker) {
          vehicleMarker.setMap(null);
        });
        delete routeIdsToVehicleMarkers[routeId];
      }
    },
    anyRoutes: function() {
      return numberOfRoutes > 0;
    },
  };
})();
// stopid to latlangs map - necessary?
var stopShapes = {};
// stopid to stopMarkers
var stopMarkers = {};

function createMap() {
	var options = {
		zoom: 15,
		mapTypeControl: false,
		center: new google.maps.LatLng(40.714346,-73.995409),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map"), options);

  // for debugging
  google.maps.event.addListener(map, "click", function(e) {
    if (console && console.log)
      console.log(e.latLng.lat() + "," + e.latLng.lng());
  });

  return map;
}

function addExampleSearchBehavior() {
  var searchForm = jQuery("#search form");
  var searchInput = jQuery("#search input[type=text]");
  var exampleSearches = jQuery("#example-searches");
  exampleSearches.find("a").click(function(e) {
    e.preventDefault();
    var exampleText = jQuery(this).text();
    searchInput.val(exampleText);
    searchForm.submit();
    exampleSearches.remove();
  });
}

function addSearchBehavior() {
  var searchForm = jQuery("#search form");
  var searchAction = searchForm.attr("action");
  var searchInput = jQuery("#search input[type=text]");

  searchForm.submit(function(e) {
    e.preventDefault();
    var formData = jQuery(this).serialize();
    jQuery.getJSON(searchAction, formData, function(json) {
      populateSearchResults(json);
    });
  });
}

function addSearchControlBehavior() {
  jQuery("#search .showOnMap").live("click", handleShowOnMap);
  jQuery("#search .addToMap").live("click", handleAddToMap);
  jQuery("#displayed-routes-list .removeFromMap").live("click", handleRemoveFromMap);
}

function handleShowOnMap(e) {
  var stopIdStr = jQuery(this).parent("div").attr("id");
  var stopId = stopIdStr.substring("stop-".length);
  var stopMarker = stopMarkers[stopId];
  if (!stopMarker)
    return false;

  // showing the popup automatically zooms to it
  showStopPopup(stopMarker, stopId);

  return false;
}

function handleAddToMap(e) {
  var resultDiv = jQuery(this).parent("div");
  var routeIdStr = resultDiv.attr("id");
  var routeId = routeIdStr.substring("route-".length);

  // this shouldn't have happened
  // this means that the filter didn't catch a duplicate route
  if (routes.containsRoute(routeId)) {
    return;
  }

  var clonedDiv = resultDiv.clone();
  var controlLink = clonedDiv.find("a.control");
  controlLink.removeClass("addToMap");
  controlLink.addClass("removeFromMap");
  controlLink.html("Remove from map");

  resultDiv.fadeOut("fast", function() { resultDiv.remove(); });
  jQuery("<li></li>").append(clonedDiv)
    .appendTo(jQuery("#displayed-routes-list"))
    .hide().fadeIn();

  // fetch route from server and display on map
  jQuery.getJSON(routeShapeUrl, {routeId: routeId}, function(json) {
    var coords = json.route && json.route.polyline;
    if (!coords)
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

    shape.setMap(map);

    routes.addRoute(routeId, shape);
  });

  return false;
}

function handleRemoveFromMap(e) {
  var resultDiv = jQuery(this).parent("div");
  var routeIdStr = resultDiv.attr("id");
  var routeId = routeIdStr.substring("route-".length);
  resultDiv.fadeOut("fast", function() { resultDiv.remove(); });
  routes.removeRoute(routeId);
  return false;
}

function makeStopElement(record) {
  return jQuery('<div id="stop-' + record.id + '" class="stop"></div>')
    .append('<a class="control showOnMap" href="#">Show on Map</a>')
    .append('<p class="name">' + record.name + '</p>');
}

function makeRouteElement(record) {
  return jQuery('<div id="route-' + record.id + '" class="route"></div>')
    .append('<a class="control addToMap" href="#">Add To Map</a>')
    .append('<p class="name">' + record.name + '</p>')
    .append('<p class="description">' + record.description + '</p>')
    .append('<p class="meta">' + record.lastUpdate + '</p>');
}

function populateSearchResults(json, searchResultsList) {
  if (typeof searchResultsList === "undefined")
    searchResultsList = jQuery("#search-results");

  if (!json || !json.searchResults)
    return;

  searchResultsList.empty();

  var anyResults = false;

  jQuery.each(json.searchResults, function(i, record) {
    if (record.type === "stop") {
      searchResultsList.append(jQuery("<li></li>").append(makeStopElement(record)));
      anyResults = true;
    } else if (record.type === "route") {
      // verify that we don't give a route search result
      // that's already displayed on the map
      if (routes.containsRoute(record.id)) {
        return;
      }
      searchResultsList.append(jQuery("<li></li>").append(makeRouteElement(record)));
      anyResults = true;
    }
  });

  if (!anyResults)
    searchResultsList.append(jQuery("<li>No search results</li>"));

  searchResultsList.hide().fadeIn();
}

function addStopsToMap() {
  jQuery.getJSON(stopsUrl, {}, function(json) {
    var stops = json.stops;
    if (!stops)
      return;
    jQuery.each(stops, function(i, stop) {
      stopShapes[stop.stopId] = stop.latlng
      var stopMarker = makeStopMarker(stop.stopId, stop.latlng);
      stopMarkers[stop.stopId] = stopMarker;
      addStopListener(stopMarker, stop.stopId);
      stopMarker.setMap(map);
    });
  });
}

// XXX we have a lot of duplication for creating stop/vehicle markers
// should factor out the similarities to cut down on the code
function showStopPopup(stopMarker, stopId) {
  jQuery.getJSON(stopUrl, {stopId: stopId}, function(json) {
    var stop = json.stop;
    var stopContent = makeStopPopupContent(stop);
    var popup = new google.maps.InfoWindow({
      content: stopContent
    });
    popup.open(map, stopMarker);
  });
}

function showVehiclePopup(vehicleMarker, vehicleId) {
  jQuery.getJSON(vehicleUrl, {vehicleId: vehicleId}, function(json) {
    var vehicle = json.vehicle;
    var vehicleContent = makeVehiclePopupContent(vehicle);
    var popup = new google.maps.InfoWindow({
      content: vehicleContent
    });
    popup.open(map, vehicleMarker);
  });
}

function addStopListener(stopMarker, stopId) {
  google.maps.event.addListener(stopMarker, "click", function() {
    showStopPopup(stopMarker, stopId);
  });
}

function addVehicleListener(vehicleMarker, vehicleId) {
  google.maps.event.addListener(vehicleMarker, "click", function() {
    showVehiclePopup(vehicleMarker, vehicleId);
  });
}

function makeStopPopupContent(json) {
  return ("<p>" + json.stopId + "</p>" +
          "<p>" + json.lastUpdate + "</p>" +
          "<p>" + json.description + "</p>");
}

function makeVehiclePopupContent(json) {
  return ("<p>" + json.vehicleId + "</p>" +
          "<p>" + json.lastUpdate + "</p>");
}

function makeStopMarker(stopId, latlng) {
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(latlng[0], latlng[1]),
      title: stopId
      });
  return marker;
}

function makeVehicleMarker(vehicleId, latlng) {
  // XXX use vehicle icons
  var marker = new google.maps.Marker({
      position: new google.maps.LatLng(latlng[0], latlng[1]),
      title: vehicleId
      });
  return marker;
}

jQuery(document).ready(function() {
  createMap();
  addSearchBehavior();
  addExampleSearchBehavior();
  addSearchControlBehavior();
  addStopsToMap();

});

})();
