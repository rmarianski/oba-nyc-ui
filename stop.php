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
              "lastUpdate" => "2008-07-17 at 09:24:17 PM",
              "routesAvailable" => array(
                        "M14A" => array(
                                "description" => "14th Street Crosstown to LES/Delancey via Avenue A",
                                "distanceAway" => array(
                                    // stops, distance in feet
                                    array(2, 100),
                                    array(3, 2500)       
                                )
                        ),                          

                        "M14D" => array(
                                "description" => "14th Street Crosstown to LES/Delancey via Avenue D",
                                "distanceAway" => array(
                                    // stops, distance in feet
                                    array(2, 100),
                                    array(3, 2500)       
                                )
                        )                                        
                    )
              );

        if(rand(0, 10) % 2 == 0) {
            $stop["routesAvailable"]["M14D"]["serviceNotice"] = "The M14D is experiencing delays and rerouting due to construction on 2nd avenue.";
        } 
        
        if(rand(0, 10) % 3 == 0) {
            $stop["routesAvailable"]["M14A"]["serviceNotice"] = "The M14A is experiencing delays because of a sick passenger.";
        } 
 
echo json_encode(array("stop" => $stop));
