var OBA = window.OBA || {};

OBA.State = function(map) {
    var state = {};
    var _hash = null;
    
    function setState(k, v) {
        state[k] = v;    
    }
   
    function syncState() {
        setState("z", map.getZoom());
        setState("lat", map.getCenter().lat());
        setState("lng", map.getCenter().lng());

        save();
    }

    google.maps.event.addListener(map, "zoom_changed", syncState);
    google.maps.event.addListener(map, "dragend", syncState);

    function restore(hash) {
        if(_hash === hash)
            return;

        _hash = hash;

        var c = hash.split("/");
        
        for(var i = 0; i < c.length; i++) {
            var p = c[i].split(":");

            if(typeof p[0] === 'undefined' || typeof p[1] === 'undefined')
                continue;
            
            state[p[0]] = p[1];            
        }    
        
        map.setCenter(new google.maps.LatLng(state.lat, state.lng));
        map.setZoom(parseInt(state.z));
    }
    
    function save() {
        var s = "";

        jQuery.each(state, function(k) {
            var v = state[k];
            
            s += k + ":" + v + "/";            
        });
        
        jQuery.history.load(s);
    }    

    jQuery.history.init(restore);
}

            
