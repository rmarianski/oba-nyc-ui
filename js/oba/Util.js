var OBA = window.OBA || {};

OBA.Util = (function() {
    var textSizer = null;

    return {
        truncate: function(text, length) {
            // truncate on word boundaries?
            if(text.length > length)
                text = text.substr(0, length - 3) + "...";
                
            return text;
        }    
    }
})();