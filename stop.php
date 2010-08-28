<?php

$stopId = $_GET["stopId"];

if($stopId == "S000001") {
    $name = "Mulberry and Canal";
    $latlng = array(40.717078345319955, -73.9985418201294);

} elseif($stopId == "S000002") {
    $name = "Allen and Delancey";
    $latlng = array(40.71912753071832,-73.99034498937989);
}

$stop = array("stopId" => $stopId,
              "latlng" => $latlng,
              "name" => $name,
              "lastUpdate" => "1 minute ago",
              "routesAvailable" => array(
                        array(
                              "routeId" => "M14A",
                              "description" => "14th Street Crosstown to LES/Delancey via Avenue A",
                              "distanceAway" => array(
                                  // stops, distance in feet
                                  array("stops"=>2, "feet"=>100),
                                  array("stops"=>3, "feet"=>2500)       
                              )
                        ),                          

                        array(
                              "routeId" => "M14D",
                              "description" => "14th Street Crosstown to LES/Delancey via Avenue D",
                              "distanceAway" => array(
                                  // stops, distance in feet
                                  array("stops"=>2, "feet"=>100),
                                  array("stops"=>3, "feet"=>2500)       
                              )
                        )                                        
                    )
              );

        if(rand(0, 10) % 2 == 0) {
            $stop["routesAvailable"][1]["serviceNotice"] = "The M14D is experiencing delays and rerouting due to construction on 2nd avenue.";
        } 
        
        if(rand(0, 10) % 3 == 0) {
            $stop["routesAvailable"][0]["serviceNotice"] = "The M14A is experiencing delays because of a sick passenger.";
        } 
 
echo json_encode(array("stop" => $stop));
