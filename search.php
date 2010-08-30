<?php

header("Content-type: text/json");

function make_stop($stopId) {
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
        $stop["routesAvailable"][0]["serviceNotice"] = "The M14D is experiencing delays and rerouting due to construction on 2nd avenue.";
    } 
    
    if(rand(0, 10) % 3 == 0) {
        $stop["routesAvailable"][0]["serviceNotice"] = "The M14A is experiencing delays because of a sick passenger.";
    } 

    return $stop;
}

function make_route($name, $description) {
  $route = array("routeId" => $name,
               "name" => $name,
               "description" => $description,
               "lastUpdate" => "1 minute ago"
             );
             
    if(rand(0, 10) % 2 == 0) {
        $route["serviceNotice"] = "The $name is experiencing delays and rerouting due to construction on 2nd avenue.";
    } 

    return $route;
}

$results = array(
    make_route("M14D", "14th Street Crosstown via Avenue D"),
    make_route("M14A", "14th Street Crosstown via Avenue A"),
    make_stop("S000001"),
    make_stop("S000002")
    );

echo json_encode(array("searchResults" => $results));