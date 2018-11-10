(function(window){
    window.htmlentities = {
        /**
         * Converts a string to its html characters completely.
         *
         * @param {String} str String with unescaped HTML characters
         **/
        encode : function(str) {
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, "'")
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');
        },
        /**
         * Converts an html characterSet into its original character.
         *
         * @param {String} str htmlSet entities
         **/
        decode : function(str) {
            var e = document.createElement('div');
            e.innerHTML = str;
            return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
        }
    };
})(window);