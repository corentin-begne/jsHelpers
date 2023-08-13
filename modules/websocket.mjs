import $ from "../../jQuery/src/jquery.js";

/**
 * @name WebsocketHelper
 * @class
 * @hideconstructor
 * @property {Object} [userEvents = {}] User websocket events
 * @property {WebSocket} [instance] Websocket instance to manage requests
 * @description Manager Websocket requests and events - singleton
 */
class WebsocketHelper{  

    constructor(){
        this.userEvents = {};
        this.instance;
    }

    /**
     * @method WebsocketHelper#connect
     * @description Connect to a Websocket server and initialize default events
     * @param {String} [url] Url of the Websocket server
     * @param {Object} [data] Data to send to the server
     * @return {Promise} Promise of the Websocket connection 
     */
    connect(url, data){
        var that = this;
        return new Promise(runConnect);

        /**
         * @method WebsocketHelper#runConnect
         * @private 
         * @description Run the Promise of the connect function
         * @callback [resolve] Promise resolve callback on connect success
         * @param {Object} [data] Event connect data
         * @callback [reject] Promise reject callback on connect error
         * @param {Object} [data] Event error connect data
         */
        function runConnect(resolve, reject){
            try{
                that.instance = new WebSocket(url+(!data ? "" : "?"+(new URLSearchParams(data).toString())));
                init(); 
            } catch(exception){
                console.error("can't connect to websocket server");
                reject(exception);
            }

            /**
             * @method WebsocketHelper#init
             * @private
             * @description Initialize Websocket connection and default events
             */
            function init(){
                let events = new Map([
                    ["onopen", onopen],
                    ["onerror", onerror],
                    ["onclose", onclose],
                    ["onmessage", onmessage]
                ]);
        
                for(const [name, cb] of events){
                    that.instance[name] = cb;
                }

                $(window).on("beforeunload", disconnect);

                /**
                 * @event WebsocketHelper#disconnect
                 * @private
                 * @description Disconnect user from Websocket when he quit the page
                 * @param {Event} [event] Event data
                 */
                function disconnect(event) {                           
                    if(that.instance){
                        that.instance.close();                
                    }
                    event.preventDefault();
                }
            }

            /**
             * @event WebsocketHelper#onmessage
             * @private
             * @description Dispatch event to user event if exists
             * @param {Object} [event] Event data received from the Websocket server
             */
            function onmessage(event){
                if(!event.data){
                    return;
                }
                var data = JSON.parse(event.data);
                if(!that.userEvents[data.type]){
                    console.error("socket event received but not defined", data);
                    return;
                }
                that.userEvents[data.type](data.data);
            }            

            /**
             * @event WebsocketHelper#onopen
             * @private
             * @description Execute Promise resolve callback on Websocket connection open
             * @param {Event} [data] Event data
             */
            function onopen(data){
                console.log("connected to websocket server");
                resolve(data);
            }

            /**
             * @event WebsocketHelper#onerror
             * @private
             * @description Execute Promise reject callback on Websocket connection error
             * @param {Event} [data] Event data
             */
            function onerror(data){
                console.error("can't connect to websocket server");
                reject(data);
            }

            /**
             * @event WebsocketHelper#onerror
             * @private
             * @description Execute Promise reject callback on Websocket connection close
             * @param {Event} [data] Event data
             */
            function onclose(data){
                console.error("disconnected from websocket server");
                reject(data);
            }
        }
    }

    /**
     * @method WebsocketHelper#setEvents
     * @description Add or replace user events
     * @param {Object} [events] User events
     */
    setEvents(events = {}){
        Object.assign(this.userEvents, events);        
    }

    /**
     * @method WebsocketHelper#setEvent
     * @description Add or replace an user event
     * @param {String} [name] Event name
     * @param {Function} [event] Event function
     */
    setEvent(name = "", event = function(){}){
        this.userEvents[name] = event;
    }

    /**
     * @method WebsocketHelper#deleteEvent
     * @description Remove an user event
     * @param {String} [name] Event name
     */
    deleteEvent(name = ""){
        if(this.userEvents[name]){
            return;
        }        
        delete this.userEvents[name];
    }

    /**
     * @method WebsocketHelper#clearEvents
     * @description Remove all user events
     */
    clearEvents(){
        this.userEvents = {};        
    }

    /**
     * @method WebsocketHelper#send
     * @description Send an event to the Websocket server
     * @param {String} [event] Event name
     * @param {Object} [data = {}] Event Data
     */
    send(event = "", data = {}){      
        this.instance.send(JSON.stringify({
           type: event,
           data: data
        }));
    }

}
const websocketHelper = new WebsocketHelper();
export default websocketHelper;