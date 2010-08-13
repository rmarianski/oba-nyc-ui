//XXX global map for testing in browser
var map;

//XXX debugging
//var latLngs = [];

(function() {

// reference to the map on the screen
//var map;

// url to query to fetch shapes for routes
var routeShapeUrl = "/route.php";

// list of routes displayed on screen
// kept here so we can reference them when removing overlays from the map
var routeShapes = {};

function createMap() {
	var options = {
		zoom: 15,
		mapTypeControl: false,
		center: new google.maps.LatLng(40.714346,-73.995409),
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	map = new google.maps.Map(document.getElementById("map"), options);

  // for debugging
//  google.maps.event.addListener(map, "click", function(e) {
//    latLngs.push(e.latLng);
//  });

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
  var stopId = jQuery(this).parent("div").attr("id");
  return false;
}

function handleAddToMap(e) {
  var resultDiv = jQuery(this).parent("div");
  var routeIdStr = resultDiv.attr("id");
  var routeId = routeIdStr.substring("route-".length);
  var clonedDiv = resultDiv.clone();
  var controlLink = clonedDiv.find("a.control");
  controlLink.removeClass("addToMap");
  controlLink.addClass("removeFromMap");
  controlLink.html("Remove from map");

  resultDiv.fadeOut("fast", function() { resultDiv.remove(); });
  jQuery("<li></li>").append(clonedDiv)
    .appendTo(jQuery("#displayed-routes-list"))
    .hide().fadeIn();

  var nDisplayed = incrementDisplayedRoutes();
  if (nDisplayed === 0)
    jQuery("#no-routes-displayed-message").remove();

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

    routeShapes[routeId] = shape;
  });

  return false;
}

function handleRemoveFromMap(e) {
  var resultDiv = jQuery(this).parent("div");
  var routeIdStr = resultDiv.attr("id");
  var routeId = routeIdStr.substring("route-".length);
  resultDiv.fadeOut("fast", function() { resultDiv.remove(); });
  incrementDisplayedRoutes(-1);

  var shape = routeShapes[routeId];
  shape.setMap(null);
  delete routeShapes[routeId];

  return false;
}

function incrementDisplayedRoutes(offset) {
  var nDisplayedElement = jQuery("#n-displayed-routes");
  var nDisplayed = nDisplayedElement.data("nDisplayed");
  var n = (typeof offset === "undefined") ? 1 : offset;
  var newDisplayed = nDisplayed + n;
  nDisplayedElement.text(newDisplayed);
  nDisplayedElement.data("nDisplayed", newDisplayed);
  return nDisplayed;
}

function makeStopElement(record) {
  return jQuery('<div id="stop-' + record.id + '" class="stop"></div>')
    .append('<a class="control showOnMap" href="#">Show on Map</a>')
    .append('<p class="name">' + record.name + '</p>');
}

function makeRouteElement(record) {
  return jQuery('<div id=record-"' + record.id + '" class="route"></div>')
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
      searchResultsList.append(jQuery("<li></li>").append(makeRouteElement(record)));
      anyResults = true;
    }
  });

  if (!anyResults)
    searchResultsList.append(jQuery("<li>No search results</li>"));

  searchResultsList.hide().fadeIn();
}

function initializeDisplayedRoutes() {
  // store the number of displayed routes
  jQuery("#n-displayed-routes").data('nDisplayed', 0);
}

jQuery(document).ready(function() {
  createMap();
  addSearchBehavior();
  addExampleSearchBehavior();
  addSearchControlBehavior();
  initializeDisplayedRoutes();

//XXX debugging
//  jQuery("#debug a").click(function() {
//    console.log(latLngs);
//    var ul = jQuery("<ul></ul>");
//    jQuery.each(latLngs, function(i, x) {
//      jQuery("<li></li>").append(x.lat() + "," + x.lng()).appendTo(ul);
//    });
//    jQuery("#debug").append(ul);
//    return false;
//  });

});

})();