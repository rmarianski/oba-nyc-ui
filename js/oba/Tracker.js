var OBA = window.OBA || {};

OBA.Tracker = function() {
    // elements for the resize handler
    var theWindow = null;
    var headerDiv = null;
    var footerDiv = null;
    var contentDiv = null;
    var sidebarHeaders = null;
    var displayedRoutesDiv = null;
    var searchResultsDiv = null;

    // stopid to stopMarkers
    var stopMarkers = {};

    var mapNode = document.getElementById("map");
    var routeMap = OBA.RouteMap(mapNode);
    var map = routeMap.getMap();
    var state = OBA.State(map, routeMap, makeRouteElement);

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
        var search = jQuery("#search");
        var searchResultsList = jQuery("#search-results");

        jQuery.ajax({
            beforeSend: function(xhr) {
                searchResultsList.empty();
                
                search.addClass("loading");                
            },
            complete: function(xhr, s) {
                search.removeClass("loading");
            },
            success: function(data, s, xhr) {
                exampleSearches.remove();

                populateSearchResults(data);
            },
            dataType: "json",
            data: formData,
            url: searchAction
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
          var routeElement = makeRouteElement(record);
          searchResultsList.append(jQuery("<li></li>").append(routeElement));

          if (routeMap.containsRoute(record.routeId)) {
              // if we already have the route displayed
              // its control should be disabled
              routeElement.find(".controls a").addClass("disabled");
          }

          anyResults = true;
        }
      });
      
      if (!anyResults) {
        searchResultsList.append(jQuery("<li>There were no matches for your query.</li>"));
	  }
	
      searchResultsList.hide().fadeIn();
    }
          
    function makeStopElement(record) {
      var el = jQuery('<div id="stop-' + record.stopId + '" class="stop result"></div>')
                      .append('<p class="name">' + record.name + '</p>');
                         
      var controls = jQuery('<ul></ul>').addClass("controls")
                .append('<li><a class="showOnMap" href="#">Show on Map</a></li>');
      
      el.append(controls);

      // display routes available at this stop
      if(typeof record.routesAvailable !== 'undefined') {
          var description = '<ul class="description">';
          
          jQuery.each(record.routesAvailable, function(routeId) {
            var route = record.routesAvailable[routeId];

            description += '<li>' + routeId + ' - ' + OBA.Util.truncate(route.description, 30) + '</li>';
          });

          description += '</ul>';
          
          el.append(jQuery(description));
      }

      return el;      
    }

    function makeRouteElement(record) {
      var el = jQuery('<div id="route-' + record.routeId + '" class="route result' + ((typeof record.serviceNotice !== 'undefined') ? ' hasNotice' : '') + '"></div>')
                .append('<p class="name">' + record.name + '</p>')
                .append('<p class="description">' + OBA.Util.truncate(record.description, 30) + '</p>')
             
      var controls = jQuery('<ul></ul>').addClass("controls")
                .append('<li><a class="addToMap" href="#">Add To Map</a></li>')
                .append('<li><a class="zoomToExtent" href="#">Zoom To Extent</a></li>')

      el.append(controls);
                
      return el;
    }
      
    function addSearchControlBehavior() {
      jQuery("#search .showOnMap").live("click", handleShowOnMap);
      jQuery("#search .addToMap").live("click", handleAddToMap);
      jQuery("#displayed-routes-list .zoomToExtent").live("click", handleZoomToExtent);
      jQuery("#displayed-routes-list .removeFromMap").live("click", handleRemoveFromMap);
    }
            
    function handleShowOnMap(e) {
	  var controlLink = jQuery(this);
      var stopIdStr = controlLink.parent().parent().parent("div").attr("id");
      var stopId = stopIdStr.substring("stop-".length);
      var stopMarker = stopMarkers[stopId];
      
      if (!stopMarker) {
        return false;
	  }
	
      // showing the popup automatically zooms to it
      stopMarker.showPopup();

      return false;
    }

    function handleZoomToExtent(e) {
        var displayRouteDiv = jQuery(this).parent().parent().parent("div");
        var routeIdStr = displayRouteDiv.attr("id");
        var routeId = routeIdStr.substring("displayedroute-".length);

        var latlngBounds = routeMap.getBounds(routeId);

        if (latlngBounds) {
            map.fitBounds(latlngBounds);
		}
		
        return false;
    }

    function handleAddToMap(e) {
      var controlLink = jQuery(this);
      var resultDiv = controlLink.parent().parent().parent("div");
      var routeIdStr = resultDiv.attr("id");
      var routeId = routeIdStr.substring("route-".length);

      if (routeMap.containsRoute(routeId)) {
        return false;
      }

      // clone the search result element to place in the routes displayed list
      var clonedDiv = resultDiv.clone();

      // we can't have two elements with the same id
      clonedDiv.attr("id", "displayedroute-" + routeId);

      // update the control link class to alter the event fired
      var clonedControlLink = clonedDiv.find(".addToMap");
      clonedControlLink.removeClass("addToMap");
      clonedControlLink.addClass("removeFromMap");
      clonedControlLink.html("Remove from map");

      jQuery("<li></li>").append(clonedDiv)
        .appendTo(jQuery("#displayed-routes-list"))
        .hide().fadeIn();

      // also update the control link on the search result element to prevent the
      // user from clicking on it twice
      controlLink.addClass("disabled");

      jQuery.getJSON(OBA.Config.routeShapeUrl, OBA.Util.serializeArray(new Array(routeId), "routeId"), function(json) {
        routeMap.addRoute(routeId, json.routes[0]);
        
        // update text info on screen
        jQuery("#no-routes-displayed-message").hide();
        jQuery("#n-displayed-routes").text(routeMap.getCount());

	  	// update hash state
        state.saveState();
      });

      return false;
    }

    function handleRemoveFromMap(e) {
	  var controlLink = jQuery(this);
      var displayRouteDiv = controlLink.parent().parent().parent("div");
      var routeIdStr = displayRouteDiv.attr("id");
      var routeId = routeIdStr.substring("displayedroute-".length);

      displayRouteDiv.fadeOut("fast", function() { displayRouteDiv.remove(); });
      routeMap.removeRoute(routeId);

      // find the control link for the matching search result element
      // and re-enable it
      jQuery("#route-" + routeId + " a.disabled").removeClass("disabled");

      // update text info on screen
      var nDisplayedRoutes = routeMap.getCount();

      if (nDisplayedRoutes <= 0) {
          jQuery("#no-routes-displayed-message").show();
      }

      jQuery("#n-displayed-routes").text(nDisplayedRoutes);

	  // update hash state
      state.saveState();

      return false;
    }

    function addStopsToMap() {
      jQuery.getJSON(OBA.Config.stopsUrl, {}, function(json) {
        var stops = json.stops;

        if (!stops) {
          return;
		}
		
        jQuery.each(stops, function(i, stop) {
          var marker = OBA.StopMarker(stop.stopId, stop.latlng, map, stop.name);

          stopMarkers[stop.stopId] = marker;
        });
      });
    }

    function addResizeBehavior() {
		theWindow = jQuery(window);
		headerDiv = jQuery("#header");
		footerDiv = jQuery("#footer");
		contentDiv = jQuery("#content");

		sidebarHeaders = jQuery("#sidebar p.header");
		displayedRoutesDiv = jQuery("#displayed-routes");
		searchResultsDiv = jQuery("#search")
	
		function resize() {
			var h = theWindow.height() - footerDiv.height() - headerDiv.height();

			contentDiv.height(h);

			searchResultsDiv.height(Math.ceil(h * .60 - sidebarHeaders.outerHeight()));
			displayedRoutesDiv.height(Math.floor(h * .40));
		}
	
		// call when the window is resized
		theWindow.resize(resize);

		// call upon initial load
		resize();

		// now that we're resizing, we can hide any body overflow/scrollbars
		jQuery("body").css("overflow", "hidden");
	}

    return {
        initialize: function() {
            addSearchBehavior();
            addSearchControlBehavior();
            addExampleSearchBehavior();
            addStopsToMap();
	    	addResizeBehavior();
        }
    };
};

jQuery(document).ready(function() { OBA.Tracker().initialize(); });
