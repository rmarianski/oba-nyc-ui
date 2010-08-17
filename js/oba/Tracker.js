var OBA = window.OBA || {};

OBA.Tracker = (function() {
    // list of routes displayed on screen
    // kept here so we can reference them when removing overlays from the map
    var routes = OBA.RouteCollection;

    // reference to the map on the screen
    var map = null;

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
      var exampleSearches = jQuery("#example-searches");

      searchForm.submit(function(e) {
        e.preventDefault();

        var formData = jQuery(this).serialize();

        jQuery.getJSON(searchAction, formData, function(json) {
          exampleSearches.remove();

          populateSearchResults(json);
        });
      });
    }

    function populateSearchResults(json) {
      if (!json || !json.searchResults)
        return;

      var anyResults = false;
      var searchResultsList = jQuery("#search-results");

      searchResultsList.empty();

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
            
    function addSearchControlBehavior() {
      jQuery("#search .showOnMap").live("click", handleShowOnMap);
      jQuery("#search .addToMap").live("click", handleAddToMap);
      jQuery("#displayed-routes-list .removeFromMap").live("click", handleRemoveFromMap);
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
            
    function handleShowOnMap(e) {
      var stopMarker = stopMarkers[stopId];
    
      if (!stopMarker)
        return false;

      // showing the popup automatically zooms to it
      stopMarker.showPopup();

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

      jQuery("<li></li>").append(clonedDiv)
        .appendTo(jQuery("#displayed-routes-list"))
        .hide().fadeIn();

      // fetch route from server and display on map
      jQuery.getJSON(OBA.Config.routeShapeUrl, {routeId: routeId}, function(json) {
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

        // update text info on screen
        jQuery("#no-routes-displayed-message").remove();
        jQuery("#n-displayed-routes").text(routes.numberOfRoutes);
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

    // adds bus stops to map
    function addStopsToMap() {
      jQuery.getJSON(OBA.Config.stopsUrl, {}, function(json) {
        var stops = json.stops;

        if (!stops)
          return;

        jQuery.each(stops, function(i, stop) {
          stopMarkers[stop.stopId] = OBA.Marker.create(stop, map);
        });
      });
    }
     
    jQuery(document).ready(function() {
      createMap();
      addSearchBehavior();
      addSearchControlBehavior();
      addExampleSearchBehavior();
      addStopsToMap();
    });
})();

