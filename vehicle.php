<?php

$vehicleId = $_GET["vehicleId"];

$routeId = "no route";

if (strstr($vehicleId, "M14D")) {
  $routeId = "M14D";
} elseif (strstr($vehicleId, "M21C")) {
  $routeId = "M21C";
}

$vehicle = array("vehicleId" => $vehicleId,
                 "lastUpdate" => "one minute ago",
                 "routeId" => $routeId,
                 );

echo json_encode(array("vehicle" => $vehicle));
