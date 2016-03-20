/*global B, extendSingleton, getSingleton, UserHelper, isDefined, VoiceHelper */
var SocketHelper;
(function(){
    "use strict";
    /**
    * @name SocketHelper
    * @description To define socket events
    * @property {Object} [_socket = B.bClient._socket] Client socket instance
    * @constructor
    */
    SocketHelper = function(cb){      
        extendSingleton(SocketHelper);
        this.token;
        this.events = {
            onopen: this.connected.bind(this),
            onerror: this.error.bind(this),
            onclose: this.disconnected.bind(this),
            onmessage: this.recv.bind(this)
        };
        this.userEvents = {};
        cb(this);        
    };

    /**
     * @member SocketHelper#getInstance
     * @description get the single class instance
     * @return {SocketHelper} the single class instance
     */
    SocketHelper.getInstance = function(cb){
        if(isDefined(cb)){
            getSingleton(SocketHelper, cb);
        } else {
            return getSingleton(SocketHelper);
        }
    };

    /**
     * @method SocketHelper#init
     * @param  {Object} events Object containing all events to be set
     * @description Initialize socket events
     */
    SocketHelper.prototype.init = function(events){
        var that = this;
        
        $.each(events, addEvent);

        $(window).unbind("beforeunload");
        $(window).bind("beforeunload", disconnect);

        /**
         * @event SocketHelper#disconnect
         * @description Disconnect user socket on beforeunload event
         */
        function disconnect(event) {                  
            if (isDefined(that.socket)){
                that.socket.close();         
            }
        }

        /**
         * @description Add socket event
         * @method SocketHelper#addEvent
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
     * @method SocketHelper#send
     * @param  {String} [event] event to use
     * @param  {Object} [data]  data to send
     */
    SocketHelper.prototype.send = function(event, data){
        data = isDefined(data) ? data : {};
        data.token = this.token;        
        this.socket.send({
           type: event,
           data: data
        });
    };

    SocketHelper.prototype.connect = function(url){
        console.log("connecting to socket server ...");
        try{
            this.socket = WebSocket(url);
            this.init(this.events); 
        } catch(exception){
            console.error(exception);
        }
    };

    SocketHelper.prototype.recv = function(msg){
        if(!isDefined(this.userEvents[msg.type])){
            console.error("socket event received but not defined", msg);
            return false;
        }
        this.userEvents[msg.type](msg.data);
    };

    SocketHelper.prototype.connected = function(msg){
        console.log("connected to socket server", msg);
    };

    SocketHelper.prototype.disconnected = function(){
        console.error("disconnected from socket server");
    };

    SocketHelper.prototype.error = function(){
        console.error("can't connect to socket server");
    };

})();