/*global B, extendSingleton, getSingleton, UserHelper, isDefined, VoiceHelper */
var WebsocketHelper;
(function(){
    "use strict";
    /**
    * @name WebsocketHelper
    * @description To define socket events
    * @property {Object} [_socket = B.bClient._socket] Client socket instance
    * @constructor
    */
    WebsocketHelper = function(cb){      
        extendSingleton(WebsocketHelper);
        this.token;
        this.events = {
            onopen: this.connected.bind(this),
            onerror: this.error.bind(this),
            onclose: this.disconnected.bind(this),
            onmessage: this.recv.bind(this)
        };
        this.cbConnected;
        this.userEvents = {};
        cb(this);        
    };

    /**
     * @member WebsocketHelper#getInstance
     * @description get the single class instance
     * @return {WebsocketHelper} the single class instance
     */
    WebsocketHelper.getInstance = function(cb){
        if(isDefined(cb)){
            getSingleton(WebsocketHelper, cb);
        } else {
            return getSingleton(WebsocketHelper);
        }
    };

    /**
     * @method WebsocketHelper#init
     * @param  {Object} events Object containing all events to be set
     * @description Initialize socket events
     */
    WebsocketHelper.prototype.init = function(events){
        var that = this;
        
        $.each(events, addEvent);

        $(window).unbind("beforeunload");
        $(window).bind("beforeunload", disconnect);

        /**
         * @event WebsocketHelper#disconnect
         * @description Disconnect user socket on beforeunload event
         */
        function disconnect(event) {                  
            if (isDefined(that.socket)){
                that.socket.close();         
            }
        }

        /**
         * @description Add socket event
         * @method WebsocketHelper#addEvent
         * @private
         * @param  {String}   [event] Socket event name
         * @param  {Function} [cb]    Callback of the event
         */
        function addEvent(name, cb){
            that.socket[name] = cb;
        }
    };

    /**
     * @description Send data by event to RTS
     * @method WebsocketHelper#send
     * @param  {String} [event] event to use
     * @param  {Object} [data]  data to send
     */
    WebsocketHelper.prototype.send = function(event, data){
        data = ifNull(data, {});
        data.token = this.token;        
        this.socket.send({
           type: event,
           data: data
        });
    };

    WebsocketHelper.prototype.connect = function(url, cb){
        console.log("connecting to socket server ...");
        this.cbConnected = cb;
        try{
            this.socket = new WebSocket(url);
            this.init(this.events); 
        } catch(exception){
            console.error(exception);
        }
    };

    WebsocketHelper.prototype.recv = function(msg){
        if(!isDefined(this.userEvents[msg.type])){
            console.error("socket event received but not defined", msg);
            return false;
        }
        this.userEvents[msg.type](msg.data);
    };

    WebsocketHelper.prototype.connected = function(msg){
        console.log("connected to socket server", msg);
        if(isDefined(this.cbConnected)){
            this.cbConnected(msg);
        }
    };

    WebsocketHelper.prototype.disconnected = function(){
        console.error("disconnected from socket server");
    };

    WebsocketHelper.prototype.error = function(){
        console.error("can't connect to socket server");
    };

})();