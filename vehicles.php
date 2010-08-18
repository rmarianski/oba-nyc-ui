<?php

$routeIds = $_GET["routeIds"];

$vehicles = array();

foreach ($routeIds as $routeid) {
  if ($routeid == "M14D") {
    $routeVehicles = array(
        array("vehicleId" => "8213",
              "latlng" => array(40.71818426273522,-74.00017260321046),
              ),
        array("vehicleId" => "8210",
              "latlng" => array(40.71408577078771,-73.9972972751465),
              ),
        );
        
    $vehicles[] = array("routeId" => $routeid,
                        "vehicles" => $routeVehicles,
                        );
                        
  } elseif ($routeid == "M14A") {
    $routeVehicles = array(
        array("vehicleId" => "8214",
              "latlng" => array(40.71805415575759,-73.99085997351075),
              ),
        array("vehicleId" => "8215",
              "latlng" => array(40.71213401927467,-73.99219034918214),
              ),
        );

    $vehicles[] = array("routeId" => $routeid,
                        "vehicles" => $routeVehicles,
                        );
  }
}

echo json_encode(array("vehicles" => $vehicles));
