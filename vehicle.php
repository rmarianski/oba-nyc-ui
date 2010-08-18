<?php

$vehicleId = $_GET["vehicleId"];

$routeId = "no route";

if (strstr($vehicleId, "8213")) {
  $routeId = "M14D";
} elseif (strstr($vehicleId, "8214")) {
  $routeId = "M21C";
}

$vehicle = array("vehicleId" => $vehicleId,
                 "lastUpdate" => "one minute ago",
                 "routeId" => $routeId,
                 );

echo json_encode(array("vehicle" => $vehicle));
