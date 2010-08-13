<?php

$stopId = $_GET["stopId"];

$stop = array("stopId" => $stopId,
              "lastUpdate" => "one minute ago",
              "description" => "description of the bus route",
              );

echo json_encode(array("stop" => $stop));
