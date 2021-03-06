$(document).ready(function() {
    var libs = {
        prod: [ 
            "js/popper.min.js", 
            "js/vue.min.js", 
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/vue-multiselect.min.js",
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/cape.js",
            "js/cape-templates.js" ],
        pprd: [ 
            "js/popper.min.js", 
            "js/vue.min.js", 
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/vue-multiselect.min.js",
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/cape.js",
            "js/cape-templates.js" ],
        test: [ 
            "js/popper.min.js", 
            "js/vue.min.js", 
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/vue-multiselect.min.js",
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/cape.js",
            "js/cape-templates.js" ],
        dev:  [ 
            "js/popper.min.js", 
            "js/vue.js",     
            "js/vue-router.js", 
            "js/vue-resource-1.5.1.js", 
            "js/vue-multiselect.min.js",
            "js/bootstrap.min.js", 
            "js/moment.min.js", 
            "js/lodash.min.js", 
            "js/cape.js",
            "js/cape-templates.js" ],
    };
    var load_list = libs["dev"];
    if( libs[app_status] ) {
        load_list = libs[app_status];
    }
    load_next_script();
    load_browser_styles();

    function load_next_script() {
        if( load_list.length == 0 ) {
            // all js loaded
            return;
        }
        var next_script = load_list.shift();
        $.getScript(next_script, function(data, textStatus, jqxhr) {
              load_next_script();
        }).fail(function(jqxhr, settings, exception) {
            console.error("Error in ", next_script, "\n", exception)
        });
    };

    function load_browser_styles() {
        if (window.navigator.userAgent.indexOf("MSIE") < 0 && window.navigator.userAgent.indexOf("Trident") < 0) {

            $('<link/>', {
                rel: 'stylesheet',
                type: 'text/css',
                href: 'css/switch.css'
            }).appendTo('head');
        }
    };
});

