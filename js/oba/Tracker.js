var OBA = window.OBA || {};

OBA.Tracker = function() {

    // stopid to stopMarkers
    var stopMarkers = {};

    var mapNode = document.getElementById("map");
    var routeCollection = OBA.RouteCollection(mapNode);
    var map = routeCollection.getMap();

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
          if (routeCollection.containsRoute(record.id)) {
            return;
          }

          searchResultsList.append(jQuery("<li></li>").append(makeRouteElement(record)));

          anyResults = true;
        }
      });

      if (!anyResults)
        searchResultsList.append(jQuery("<li>There were no matches for your query.</li>"));

      searchResultsList.hide().fadeIn();
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
      stopMarker.showPopup();

      return false;
    }

    function handleAddToMap(e) {
      var resultDiv = jQuery(this).parent("div");
      var routeIdStr = resultDiv.attr("id");
      var routeId = routeIdStr.substring("route-".length);

      // this shouldn't have happened
      // this means that the filter didn't catch a duplicate route
      if (routeCollection.containsRoute(routeId)) {
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

      jQuery.getJSON(OBA.Config.routeShapeUrl, {routeId: routeId}, function(json) {
        routeCollection.addRoute(routeId, json);
        
        // update text info on screen
        jQuery("#no-routes-displayed-message").hide();
        jQuery("#n-displayed-routes").text(routeCollection.getCount());
      });

      return false;
    }

    function handleRemoveFromMap(e) {
      var resultDiv = jQuery(this).parent("div");
      var routeIdStr = resultDiv.attr("id");
      var routeId = routeIdStr.substring("route-".length);

      resultDiv.fadeOut("fast", function() { resultDiv.remove(); });
      routeCollection.removeRoute(routeId);

      // update text info on screen
      jQuery("#no-routes-displayed-message").show();
      jQuery("#n-displayed-routes").text(routeCollection.getCount());

      return false;
    }

    function addStopsToMap() {
      jQuery.getJSON(OBA.Config.stopsUrl, {}, function(json) {
        var stops = json.stops;

        if (!stops)
          return;

        jQuery.each(stops, function(i, stop) {
          var marker = OBA.StopMarker(stop.stopId, stop.latlng, map);
          stopMarkers[stop.stopId] = marker;
        });
      });
    }
    
    return {
        getMap: function() {
            return map;
        },
        
        initialize: function() {
            addSearchBehavior();
            addSearchControlBehavior();
            addExampleSearchBehavior();

            addStopsToMap();
        }
    };
};

jQuery(document).ready(function() { OBA.Tracker().initialize(); });
