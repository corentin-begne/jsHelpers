/*global extendSingleton, getSingleton, isDefined, RTCPeerConnection */
var WebrtcHelper;
window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection;
(function(){
    "use strict";

    /**
     * @name  WebrtcHelper
     * @description  Manage WebRTC connection 
     * @property {RTCPeerConnection} [localConnection] Local RTCPeerConnection
     * @property {RTCPeerConnection} [remoteConnection] Remote RTCPeerConnection
     * @property {RTCDataChannel} [sendChannel] Local channel
     * @property {RTCDataChannel} [receiveChannel] Remote channel
     * @property {Object} [events] User callbacks onConnect, onOpen, onClose
     * @constructor
     */
    WebrtcHelper = function(){   
        this.localConnection = null;   // RTCPeerConnection for our "local" connection
        this.remoteConnection = null;  // RTCPeerConnection for the "remote"

        this.sendChannel = null;       // RTCDataChannel for the local (sender)
        this.receiveChannel = null;    // RTCDataChannel for the remote (receiver)

        this.events = {};
        extendSingleton(WebrtcHelper);                
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
     * @description Store user Callbacks and connect peers
     * @param  {Object} [events] [description]
     */
    WebrtcHelper.prototype.init = function(events){
        if(events){
            this.events = events;
        }
        this.connectPeers();
    };

    /**
     * @method WebrtcHelper#connectPeers
     * @description Initialize peers connection
     */
    WebrtcHelper.prototype.connectPeers = function() {
        var that = this;

        this.localConnection = new RTCPeerConnection();

        this.sendChannel = this.localConnection.createDataChannel("sendChannel");
        this.sendChannel.onopen = this.handleSendChannelStatusChange.bind(this);
        this.sendChannel.onclose = this.handleSendChannelStatusChange.bind(this);

        this.remoteConnection = new RTCPeerConnection();
        this.remoteConnection.ondatachannel = this.receiveChannelCallback.bind(this);

        this.localConnection.onicecandidate = e => !e.candidate
        || this.remoteConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError.bind(this));

        this.remoteConnection.onicecandidate = e => !e.candidate
        || this.localConnection.addIceCandidate(e.candidate)
        .catch(this.handleAddCandidateError.bind(this));



        this.localConnection.createOffer()
        .then(offer => that.localConnection.setLocalDescription(offer))
        .then(() => that.remoteConnection.setRemoteDescription(that.localConnection.localDescription))
        .then(() => that.remoteConnection.createAnswer())
        .then(answer => that.remoteConnection.setLocalDescription(answer))
        .then(() => that.localConnection.setRemoteDescription(that.remoteConnection.localDescription))
        .catch(this.handleCreateDescriptionError.bind(this));
    };

    /**
     * @event WebrtcHelper#handleCreateDescriptionError
     * @description Triggered on offer creation exception
     * @param  {Object} [error] Error data
     */
    WebrtcHelper.prototype.handleCreateDescriptionError = function(error) {
        console.error("Unable to create an offer: " + error.toString());
    };

    /**
     * @event WebrtcHelper#handleLocalAddCandidateSuccess
     * @description Triggered on local connection success
     */
    WebrtcHelper.prototype.handleLocalAddCandidateSuccess = function() {
        if(this.events.onConnect){
            this.events.onConnect();
        }
    };

    /**
     * @event WebrtcHelper#handleRemoteAddCandidateSuccess
     * @description Triggered on remote connection success
     */
    WebrtcHelper.prototype.handleRemoteAddCandidateSuccess = function() {
        if(this.events.onConnect){
            this.events.onConnect();
        }
    };

    /**
     * @event WebrtcHelper#handleAddCandidateError
     * @description  Triggered on connection error
     */
    WebrtcHelper.prototype.handleAddCandidateError = function() {
        console.error("Oh noes! addICECandidate failed!");
    };

    /**
     * @method WebrtcHelper#sendMessage
     * @description Send Data threw channel
     * @param  {Object} [data] Data to send
     */
    WebrtcHelper.prototype.sendMessage = function(data) {
        this.sendChannel.send(data);
        console.log("data send", data);
    };

    /**
     * @event WebrtcHelper#handleSendChannelStatusChange
     * @description Triggered on send channel status change
     * @param  {Object} [event] Event data
     */
    WebrtcHelper.prototype.handleSendChannelStatusChange = function(event) {
        if (this.sendChannel) {
            var state = this.sendChannel.readyState;

            if (state === "open") {
                console.log("state open");
                if(this.events.onOpen){
                    this.events.onOpen();
                }
            } else {
                console.warn("state close");
                if(this.events.onClose){
                    this.events.onClose();
                }
            }
        }
    };

    /**
     * @event WebrtcHelper#receiveChannelCallback
     * @description Bind receive channel events on channel success
     * @param  {Object} [event] Event data
     */
    WebrtcHelper.prototype.receiveChannelCallback = function(event) {
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = this.handleReceiveMessage.bind(this);
        this.receiveChannel.onopen = this.handleReceiveChannelStatusChange.bind(this);
        this.receiveChannel.onclose = this.handleReceiveChannelStatusChange.bind(this);
    };

    /**
     * @event WebrtcHelper#handleReceiveMessage
     * @description Triggered when receive channel get a message
     * @param  {Object} [event] Event data
     */
    WebrtcHelper.prototype.handleReceiveMessage = function(event) {
        console.log("data received", event.data);
    };

    /**
     * @event WebrtcHelper#handleReceiveChannelStatusChange
     * @description Triggered when receive channel status change
     * @param  {Object} [event] Event data
     */
    WebrtcHelper.prototype.handleReceiveChannelStatusChange = function(event) {
        if (this.receiveChannel) {
            console.log("Receive channel's status has changed to " +
                this.receiveChannel.readyState);
        }
    };

    /**
     * @method WebrtcHelper#disconnectPeers
     * @description Disconnect all peer
     */
    WebrtcHelper.prototype.disconnectPeers = function() {

        this.sendChannel.close();
        this.receiveChannel.close();

        this.localConnection.close();
        this.remoteConnection.close();

        this.sendChannel = null;
        this.receiveChannel = null;
        this.localConnection = null;
        this.remoteConnection = null;
    };

})();