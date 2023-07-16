import $ from "../../jQuery/src/jquery.js";

/**
 * @name ActionHelper
 * @class
 * @hideconstructor
 * @property {DOMElement} [body = $("body")] Body element of the page
 * @property {DOMElement} [loader = "<div class='backdrop'><div id='loader'></div></div>"] Loader element for ajax requests
 * @property {String} [app = this.body.attr("app")] Application name
 * @property {String} [basePath = "/"+(this.app==="frontend" ? '' : this.app+"/")] Ajax requests base path
 * @property {Number} [progress = 0] Value of the ajax request progress
 * @description Manage ajax requests and redirections - singleton
 */
class ActionHelper{  

    constructor(){
        this.body = $("body");
        this.loader = "<div class='backdrop'><div id='loader'></div></div>";
        this.app = this.body.attr("app");
        this.basePath = "/"+(this.app==="frontend" ? '' : this.app+"/");
        this.progress = 0;
        const hasOnProgress = ("onprogress" in $.ajaxSettings.xhr());
        var oldXHR;
        if (hasOnProgress) {   
            //patch ajax settings to call a progress callback
            oldXHR = $.ajaxSettings.xhr;
            $.ajaxSettings.xhr = setAjaxSetting;
        }

        /**
         * @method ActionHelper#setAjaxSetting
         * @private
         * @description Allow to get ajax requests progress
         * @return {XMLHttpRequest} Xhr request
         */
        function setAjaxSetting(){
            const xhr = oldXHR();
            if(xhr instanceof XMLHttpRequest) {
                xhr.addEventListener("progress", this.progress, false);
            }
            
            if(xhr.upload) {
                xhr.upload.addEventListener("progress", this.progress, false);
            }
            
            return xhr;
        }
    }

    /**
     * @method ActionHelper#execute
     * @param {Object|FormData} [data = {}] Data to send
     * @param {Object} [options = {}] Request options
     * @param {Boolean} [options.noload = false] Show or not the loader while request progressing
     * @param {String} [options.type] Request type: post or get
     * @param {String} [options.action] Request path
     * @param {String} [options.dataType] Request dataType: xml, json, script, text or html
     * @param {Boolean} [options.form = false] Set to true if the request send FormData
     * @description Execute an ajax request
     * @return {Promise} Request promise
     */
    execute(data = {}, options = {}){
        var that = this;
        if(!options.noload){
            this.body.append(this.loader);
        }
        const infos = {
            type:options.type,
            data,
            url: this.basePath+options.action+(window.PHPSESSID?`?PHPSESSID=${PHPSESSID}`:''),
            dataType:options.dataType
        };        
        if(options.form){
            Object.assign(infos, {
                cache:false, 
                contentType:false, 
                processData:false
            });
        }  

        return new Promise(runExecute);

        /**
         * @method ActionHelper#runExecute
         * @private
         * @description Run the Promise of the execute function
         * @callback [resolve] Promise resolve callback on request success
         * @param {Object|String} [data] Result of the request
         * @callback [reject] Promise reject callback on request error
         * @param {Event} [event] Ajax error event
         */
        function runExecute(resolve, reject){
            Object.assign(infos, {
                error, 
                complete,  
                progress, 
                success
            });
            $.ajax(infos);

            /**
             * @event ActionHelper#progress
             * @private
             * @description Update progress value on request progression
             * @param {Event} [event] Event Data
             */
            function progress(event){
                that.progress = event.loaded / event.total;     
            }   

            /**
             * @event ActionHelper#error
             * @private
             * @description Execute reject Promise callback on error
             * @param {Event} [event] Event data
             */
            function error(event){
                reject(event);
            }

            /**
             * @event ActionHelper#success
             * @private
             * @description Execute resolve Promise callback on success
             * @param {Object|String} [data] Request data
             */
            function success(data){
                resolve(data);
            }

            /**
             * @method ActionHelper#complete
             * @private
             * @description Remove loader and reset progress value on request complete
             */
            function complete(){
                if(!options.noload){
                    $("body > .backdrop").remove();
                }
                that.progress = 0;
            }
        }        
    }

    /**
     * @method ActionHelper#redirect
     * @param {Map.<String, String>} [data] Contain path and type (self, blank, parent, top) to redirect, by default redirect the current page.
     */
    redirect(data){
        if(!data.has("type")){
            window.location.href = data.get("path");
        } else {
            window.open(window.location.origin+data.get("path"), "_"+data.get("type"));
        }
    }

}

const actionHelper = new ActionHelper();
export default actionHelper;