/*global extendSingleton, getSingleton, isDefined, Peer, getUserMedia, getScreenId */
var WebrtcHelper;

(function(){
    "use strict";

    /**
     * @name  WebrtcHelper
     * @description  Manage WebRTC connection 
     * @constructor
     */
    WebrtcHelper = function(cb){   
        var that = this;
        this.localStream;
        this.remoteStreams = {};
        this.onCallEvent;
        this.extensionStatus = "test";
        extendSingleton(WebrtcHelper);        
        require([
            "frontend/js/helper/peer"
        ], ready);

        function ready(){
            PeerHelper.getInstance(ready);

            function ready(instance){
                that.peer = instance;
                testExtension();
                if(cb){
                    cb(that);
                }

                function testExtension(){
                    getChromeExtensionStatus(check);

                    function check(msg){
                        that.extensionStatus = msg;
                        setInterval(testExtension, 10000);
                    }
                }
                
            }
        }
    };

    /**
     * @member WebrtcHelper#getInstance
     * @description get the single class instance
     * @return {WebrtcHelper} the single class instance
     */
    WebrtcHelper.getInstance = function(cb){
        if(isDefined(cb)){
            getSingleton(WebrtcHelper, cb);
        } else {
            return getSingleton(WebrtcHelper);
        }
    };

    WebrtcHelper.prototype.callAll = function(options, cb){
        var that = this;
        $.each(SocketHelper.getInstance().users, call);        

        function call(id, data){
            that.peer.call(options, id, cb);
        }
    };

    WebrtcHelper.prototype.call = function(options, id, cb){
        this.peer.call(options, id, cb);
    };


    /**
     * @method WebrtcHelper#init
     * @description Init
     */
    WebrtcHelper.prototype.initialize = function(data, cb){
        var that = this;
        this.getUserMedia(data.constraints, ready);

        function ready(){
            that.peer.init();
            if(cb){
                cb();
            }
        }
    };

    WebrtcHelper.prototype.getUserScreen = function(cb) {
        var that = this;               
        if(this.extensionStatus === "installed-enabled"){
            console.log("chrome extension screen sharing already installed");
            getScreenId(getConstraints);
        } else {
            console.log("Launch chrome extension screen sharing install");
            var link = $("<link>");
            var url = "https://chrome.google.com/webstore/detail/hoabddhlkoneohdomlokajbepekbahna";
            link.attr({
                rel:"chrome-webstore-item",
                href:url
            });
            $("head").append(link);
            chrome.webstore.install(url, installSuccess, installError);
        }

        function installError(error){
            console.error("chrome extension screen sharing failed to install", error);
        }

        function installSuccess(){
            console.log("chrome extension screen sharing succefully installed");
            getScreenId(getConstraints);
        }

        function getConstraints(err, sourceId, constraints) {
            if(err){
                console.error(err);
                if(cb){
                    cb();
                }
                return false;
            }
         //   constraints.audio = false;
            that.getUserMedia(constraints, complete);

            function complete(){
                SocketHelper.getInstance().socket.send("update", {streamScreenId:that.localStreamScreen.id})
                $.each(that.peer.pcs, addStream);    
                that.callAll();            


                function addStream(id, pc){
                  //  that.localStreamScreen.getTracks().forEach(addTrack.bind(that.localStreamScreen));
                    pc.addStream(that.localStreamScreen);

                 /*   function addTrack(track){
                        pc.addTrack(track, this);
                    }*/
                }
            }
        }; 
    };

    WebrtcHelper.prototype.getUserMedia = function(constraints, cb) {
        var that = this;
        var stream;
        navigator.mediaDevices.getUserMedia(constraints).then(success).catch(error);

        function success(stream){
            if(!that.localStream){
                that.localStream = stream;
            } else {
                that.localStreamScreen = stream;
            }
            checkCb();
        }

        function error(msg){
            console.error(msg);
            checkCb();
        }

        function checkCb(){
            if(cb){
                cb();
            }
        }
    };

})();