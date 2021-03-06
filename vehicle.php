<?php

$vehicleId = $_GET["vehicleId"];

$routeId = "no route";

if (strstr($vehicleId, "8213") ||strstr($vehicleId, "8210") ) {
  $routeId = "M14D";
  $description = "14th Street Crosstown via Avenue D";
} elseif (strstr($vehicleId, "8214") || strstr($vehicleId, "8215")) {
  $routeId = "M14A";
  $description = "14th Street Crosstown via Avenue A";
}

$vehicle = array("vehicleId" => $vehicleId,
                 "description" => $description,
                 "lastUpdate" => "one minute ago",
                 "routeId" => $routeId,
                 "poorAccuracy" => false,
                 "nextStops" => array(
                                    array(
                                          "stopId" => "S000001",
                                          "name" => "Mulberry and Canal",
                                           // stops, distance in feet
                                          "distanceAway" => array("stops"=>2, "feet"=>100),
                                          "lastUpdate" => "1 minute ago" 
                                    ),                                    
                                    array(
                                          "stopId" => "S000002",
                                          "name" => "Allen and Delancey",
                                           // stops, distance in feet
                                          "distanceAway" => array("stops"=>3, "feet"=>100),
                                          "lastUpdate" => "1 minute ago"
                                     )
                                )
                 );


        if(rand(0, 10) % 2 == 0) {
            $vehicle["serviceNotice"] = "The $routeId is experiencing delays and rerouting due to construction on 2nd avenue.";
        } 


echo json_encode(array("vehicle" => $vehicle));
