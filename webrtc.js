/*global extendSingleton, getSingleton, isDefined, Peer, getUserMedia */
var WebrtcHelper;
var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
(function(){
    "use strict";

    /**
     * @name  WebrtcHelper
     * @description  Manage WebRTC connection 
     * @constructor
     */
    WebrtcHelper = function(cb){   
        var that = this;
        this.stream;
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

    /**
     * @method WebrtcHelper#init
     * @description Init
     */
    WebrtcHelper.prototype.initialize = function(type, cb){
        var that = this;
        this.peer = new Peer(); 
        getUserMedia(type, success, error);

        function success(stream){
            that.stream = stream;
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
        /*getUserMedia(type, function(stream) {
          var call = peer.call('another-peers-id', stream);
          call.on('stream', function(remoteStream) {
            // Show stream in some video/canvas element.
          });
        }, error);

        function call(){

        }

        function answer(){

        }   
        
        function error(msg){
            console.error(msg);
        }     
        peer.on('call', function(call) {
          getUserMedia({video: true, audio: true}, function(stream) {
            call.answer(stream); // Answer the call with an A/V stream.
            call.on('stream', function(remoteStream) {
              // Show stream in some video/canvas element.
            });
          }, function(err) {
            console.log('Failed to get local stream' ,err);
          });
        });
        if(data.isCall){

        } else {

        }*/

    };

})();