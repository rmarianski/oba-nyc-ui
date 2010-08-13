<?php

function make_stop($name) {
  return array("type" => "stop",
               "name" => $name,
               "id" => $name,
               );
}

function make_route($name, $description) {
  return array("type" => "route",
               "name" => $name,
               "description" => $description,
               "lastUpdate" => "1 minute ago",
               "id" => $name,
               "polyline" => array(
                   array(-74.0019, 40.7194),
                   array(-74.0005, 40.7184),
                   array(-74.0031, 40.7156),
                   ),
               );
}

$results = array(
    make_route("M14D", "14th Street Crosstown via Avenue D"),
    make_stop("14AVEC0001"),
    make_stop("14AVEC0002"),
    );

echo json_encode(array("searchResults" => $results));
