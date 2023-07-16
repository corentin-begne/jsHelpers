/**
 * @name class JsHelper
 * @class
 * @hideconstructor
 * @property {Map.<String, Object>} [helpers] Helpers managed
 * @description Manage JsHelper - singleton
 */
class JsHelper{  

    constructor(){
        this.helpers = new Map();
    }

    /**
     * @method JsHelper#init
     * @description Initialize helpers and add globals functions
     * @param {Map.<String, Object>} [helpers] List of helpers to add, index is the name and value is an object container helper instance and data to use in the init function if exists
     */
    init(helpers = new Map()){
        var that = this;
        this.helpers = helpers;
        for (const helper of helpers.values()) {
            if(!helper.instance.init){
                continue;
            }
            helper.instance.init(helper.data);
        }
        Reflect.ownKeys(Reflect.getPrototypeOf(this)).forEach(addGlobalFunction);

        /**
         * @method JsHelper#addGlobalFunction
         * @private
         * @description Set a function of this class accessible globally, function starting by 'is' is executed, only the result is global
         * @param {String} [name] Function name to add
         */
        function addGlobalFunction(name){
            if(name !== "init" && name !== "add" && name !== "constructor"){
                if(name.indexOf("is") === 0){
                    window[name] = that[name]();
                } else {
                    window[name] = that[name];
                }                
            }
        }
    }

    /**
     * @method JsHelper#add
     * @description Add an helper to the list
     * @param {String} [name] Helper name
     * @param {Object} [instance] Helper instance
     */
    add(name, instance){
        this.helpers.set(name, {instance});
    }

    /**
     * @method JsHelper#isMobile
     * @description Check if the device is a mobile
     * @return {Boolean} Result of the check
     */
    isMobile(){
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /**
     * @method JsHelper#isTablet
     * @description Check if the device is a tablet
     * @return {Boolean} Result of the check
     */
    isTablet(){
        return /(tablet|ipad|playbook)|(android(?!.*(mobi|opera mini)))/i.test(navigator.userAgent.toLowerCase());
    }

    /**
     * @method JsHelper#isApple
     * @description Check if the device is on an Apple OS
     * @return {Boolean} Result of the check
     */
    isApple(){
        return /(iPad|iPhone|iPod|Mac)/g.test(navigator.userAgent);
    }

    /**
     * @method JsHelper#ucfirst
     * @description Set the first character of a text in uppercase
     * @param {String} [str] Text to process
     * @return {String} Param with first character in uppercase 
     */
    ucfirst(str){
        return str.charAt(0).toUpperCase()+str.substr(1);
    }

}
const jsHelper = new JsHelper();
export default jsHelper;