import $ from "../../jQuery/src/jquery.js";

class WebsocketHelper{  

    constructor(){
        this.userEvents = {};
        this.socket;
    }

    connect(url, data){
        var that = this;
        return new Promise(run);

        function run(resolve, reject){
            try{
                that.socket = new WebSocket(url+(!data ? "" : "?"+encodeURIComponent(JSON.stringify(data))));
                init(); 
            } catch(exception){
                console.error("can't connect to websocket server");
                reject(exception);
            }

            function init(){
                let events = new Map({
                    onopen,
                    onerror,
                    onclose,
                    onmessage
                });
        
                for(const [name, cb] of events){
                    that.socket[name] = cb;
                }

                $(window).on("beforeunload", disconnect);

                function disconnect(event) {                           
                    if(that.socket){
                        that.socket.close();                
                    }
                    event.preventDefault();
                }
            }

            function onmessage(event){
                if(!event.data){
                    return;
                }
                var data = $.parseJSON(event.data);
                if(!that.userEvents[data.type]){
                    console.error("socket event received but not defined", data);
                    return false;
                }
                that.userEvents[data.type](data.data);
            }            

            function onopen(data){
                console.log("connected to websocket server");
                resolve(data);
            }

            function onerror(data){
                console.error("can't connect to websocket server");
                reject(data);
            }

            function onclose(data){
                console.error("disconnected from websocket server");
                reject(data);
            }
        }
    }

    setEvents(events = {}){
        Object.assign(this.userEvents, events);        
    }

    setEvent(name = "", event = ()){
        this.userEvents[name] = event;
    }

    deleteEvent(name = ""){
        if(this.userEvents[name]){
            return;
        }        
        delete this.userEvents[name];
    }

    clearEvents = function(){
        this.userEvents = {};        
    }

    send(event = "", data = {}){      
        this.socket.send(JSON.stringify({
           type: event,
           data: data
        }));
    }

}
let websocketHelper = new WebsocketHelper();
export default websocketHelper;