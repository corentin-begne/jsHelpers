/*global extendSingleton, getSingleton, isDefined */
var AnalyticsHelper;
(function(){
    "use strict";
    /**
    * @name AnalyticsHelper
    * @description To make analytics call
    * @constructor
    */
    AnalyticsHelper = function(key){
        extendSingleton(AnalyticsHelper); 
        this.isAvailable = true;
        if(isAPP || ENV !== "prod"){
            this.isAvailable = false;
            return false;
        }
        var script = $("<script type='text/javascript'></script>");
        script.text(
            "var _gaq;"+
            "(function() {"+
                "var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;"+
                "ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';"+
                "var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);"+
            "})();"
        );
        $("body").prepend(script);
        this._key = key;
        _gaq = _gaq || [];
    };

    /**
     * @member AnalyticsHelper#getInstance
     * @description get the single class instance
     * @return {AnalyticsHelper} the single class instance
     */
    AnalyticsHelper.getInstance = function(){
        return getSingleton(AnalyticsHelper);
    };

    AnalyticsHelper.prototype.trackEvent = function(name, event, type) {
        if(!this.isAvailable){
            return false;
        }
        _gaq.push(["_trackEvent", name, event, type]);
    };

    AnalyticsHelper.prototype.setAccount = function() {
        _gaq.push(["_setAccount", "UA-"+this._key]);
    };

    AnalyticsHelper.prototype.trackPage = function() {
        _gaq.push(["_trackPageview"]);
    };

    AnalyticsHelper.prototype.init = function() {
        if(!this.isAvailable){
            return false;
        }
        this.setAccount();
        this.trackPage();
    };

})();