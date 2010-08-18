var OBA = window.OBA || {};

OBA.State = function(map) {
    var state = {};        
    var dirtyState = true;
    var currentHash = null;
        
    function setState(k, v) {
        if(state[k] != v) {
            state[k] = v;
            
            dirtyState = true;
        } 
    }

    function loadState(hash) {
        unserialize(hash);

        if(! dirtyState)
            return;
    
        var searchForm = jQuery("#search form");
        var searchInput = jQuery("#search input[type=text]");
        
        searchInput.val(state.q);
        searchForm.submit();
    
        map.setCenter(new google.maps.LatLng(state.lat, state.lng));        
        map.setZoom(parseInt(state.z));
    }
   
    function saveState() {
        var searchInput = jQuery("#search input[type=text]");

        setState("q", searchInput.val());

        setState("z", map.getZoom());
        setState("lat", map.getCenter().lat());
        setState("lng", map.getCenter().lng());

        serialize();
    }

    google.maps.event.addListener(map, "zoom_changed", saveState);
    google.maps.event.addListener(map, "dragend", saveState);

    function unserialize(hash) {
        var c = hash.split("/");
        
        for(var i = 0; i < c.length; i++) {
            var p = c[i].split(":");

            if(typeof p[0] === 'undefined' || typeof p[1] === 'undefined')
                continue;
            
            state[p[0]] = p[1];            
        }    
    }
    
    function serialize() {
        if(! dirtyState)
            return;
        
        dirtyState = false;

        var s = "";

        jQuery.each(state, function(k) {
            var v = state[k];
            
            s += k + ":" + v + "/";            
        });

        jQuery.history.load(s);
    }    

//    jQuery.history.init(loadState);
}

            
