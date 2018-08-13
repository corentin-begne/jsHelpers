/*global extendSingleton, getSingleton, isDefined, Peer, getUserMedia */
var WebrtcHelper;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || msGetUserMedia;
if (getUserMedia) {
  getUserMedia = getUserMedia.bind(navigator);
}
(function(){
    "use strict";

    /**
     * @name  WebrtcHelper
     * @description  Manage WebRTC connection 
     * @constructor
     */
    WebrtcHelper = function(cb){   
        var that = this;
        this.localstream;
        this.remoteStreams = {};
        extendSingleton(WebrtcHelper);        
        require([
            "bower_components/peerjs/peer"
        ], ready);

        function ready(){
            if(cb){
                cb(that);
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

    WebrtcHelper.prototype.onCall = function(call){
        var that = this;
        call.answer(this.localstream); // Answer the call with an A/V stream.
        call.on("stream", getStream);

        function getStream(stream){
            that.remoteStreams[call.id] = stream;
        }
    };

    WebrtcHelper.prototype.call = function(id){
        var that = this;
        var call = peer.call(id, this.localstream);
        call.on("stream", getStream);

        function getStream(stream){
            that.remoteStreams[call.id] = stream;
        }
    };


    /**
     * @method WebrtcHelper#init
     * @description Init
     */
    WebrtcHelper.prototype.initialize = function(data, cb){
        var that = this;
        this.peer = new Peer(data.id, {host: window.location.host, port: data.port, path: data.path}); 
        getUserMedia(data.type, success, error);

        function success(stream){
            that.localstream = stream;
            that.peer.on("call", that.onCall.bind(that));
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