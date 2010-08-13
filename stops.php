<?php

$stops = array(
    array("stopId" => "14AVEC0001",
          "latlng" => array(40.717078345319955, -73.9985418201294),
          ),
    array("stopId" => "14AVEC0001",
          "latlng" => array(40.71912753071832,-73.99034498937989),
          ),
    );

echo json_encode(array("stops" => $stops));
