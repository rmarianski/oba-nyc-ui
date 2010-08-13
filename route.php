<?php

$routeid = $_GET["routeId"];

if ($routeid == "M14D") {
  $polyline = array(
                   array(40.71841194933421,-74.0005588413086),
                   array(40.71785899481434,-73.99978636511231),
                   array(40.717078345319955,-73.9985418201294),
                   array(40.716200103696565,-73.99605273016358),
                   array(40.713923127013494,-73.99746893652345),
                   array(40.71353278033439,-73.99867056616212),
                   );
} elseif ($routeid == "M21C") {
  $polyline = array(
                   array(40.70998702652973,-73.99193285711671),
                   array(40.71460622819519,-73.99283407934571),
                   array(40.71912753071832,-73.99034498937989),
                   );
} else {
  $polyline = array();
}

$route = array("routeId" => $routeid,
               "polyline" => $polyline,
               );

echo json_encode(array("route" => $route));
