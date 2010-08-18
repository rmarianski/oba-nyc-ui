var OBA = window.OBA || {};

OBA.Config = {
    debug: true,

    // urls to fetch various data
    routeShapeUrl: "route.php",
    stopsUrl: "stops.php",
    stopUrl: "stop.php",
    vehiclesUrl:"vehicles.php",
    vehicleUrl: "vehicle.php",

    // milliseconds to wait in between polls for bus locations
    pollingInterval: 5000,

    // image url
    vehicleIcon: "img/vehicle.png"
};
