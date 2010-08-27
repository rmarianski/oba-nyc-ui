var OBA = window.OBA || {};

OBA.Util = (function() {
    var textSizer = null;

    return {
    	truncate: function(text, length) {
            // FIXME: truncate on word boundaries?
            if(typeof text === 'string' && text.length > length) {
                text = text.substr(0, length - 3) + "...";
            }

            return text;
        },

	 	serializeArray: function(lst, keyname) {
	        	var result = null;
	
	            jQuery.each(lst, function(i, x) {
	            	if (result === null) {
	            		result = keyname + "[]=" + x;
	            	} else {
	            		result += "&" + keyname + "[]=" + x;
	            	}
	            });
	
	            return result;
	    }
    }
})();