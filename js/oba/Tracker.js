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
        if (typeof record.stopId !== 'undefined') {
          searchResultsList.append(jQuery("<li></li>").append(makeStopElement(record)));

          anyResults = true;
        } else if (typeof record.routeId !== 'undefined') {
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
      var $wrapper = jQuery('<div id="stop-' + record.stopId + '" class="stop result"></div>');
      
      $wrapper.append('<a class="control showOnMap" href="#">Show on Map</a>')
         .append('<p class="name">' + record.name + '</p>');
        
      if(typeof record.routesAvailable !== 'undefined') {
          var description = '<ul class="description">';
          
          jQuery.each(record.routesAvailable, function(routeId) {
            var route = record.routesAvailable[routeId];

            description += '<li>' + routeId + ' - ' + OBA.Util.truncate(route.description, 30) + '</li>';
          });

          description += '</ul>';
          
          $wrapper.append(jQuery(description));
      }

      return $wrapper;      
    }

    function makeRouteElement(record) {
      return jQuery('<div id="route-' + record.routeId + '" class="route result"></div>')
        .append('<a class="control addToMap" href="#">Add To Map</a>')
        .append('<a class="control zoomToExtent" href="#">Zoom To Extent</a>')
        .append('<p class="name">' + record.name + '</p>')
        .append('<p class="description">' + OBA.Util.truncate(record.description, 30) + '</p>');
    }
      
    function addSearchControlBehavior() {
      jQuery("#search .showOnMap").live("click", handleShowOnMap);
      jQuery("#search .addToMap").live("click", handleAddToMap);
      jQuery("#search .zoomToExtent").live("click", handleZoomToExtent);
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

    function handleZoomToExtent(e) {
        // XXX FIXME

        return false;
    }

    function handleAddToMap(e) {
      var resultDiv = jQuery(this).parent("div");
      var routeIdStr = resultDiv.attr("id");
      var routeId = routeIdStr.substring("route-".length);

      // this shouldn't have happened
      // this means that the filter didn't catch a duplicate route
      if (routeCollection.containsRoute(routeId)) {
        var alreadyExistsMessage = '<p class="error">Route already added to map</p>';
        var errNode = jQuery(alreadyExistsMessage);
        errNode.appendTo(resultDiv).hide().fadeIn();
        setTimeout(function() { errNode.hide(function() { errNode.remove(); }); },
                   1000);
        return false;
      }

      var clonedDiv = resultDiv.clone();
      var controlLink = clonedDiv.find("a.control.addToMap");
    
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
      if(OBA.RouteCollection.getCount() === 0) {
          jQuery("#no-routes-displayed-message").show();
      }
    
      jQuery("#n-displayed-routes").text(OBA.RouteCollection.getCount());

      return false;
    }

    function addStopsToMap() {
      jQuery.getJSON(OBA.Config.stopsUrl, {}, function(json) {
        var stops = json.stops;

        if (!stops)
          return;

        jQuery.each(stops, function(i, stop) {
          var marker = OBA.StopMarker(stop.stopId, stop.latlng, map, stop.name);

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
