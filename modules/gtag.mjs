import $ from "../../jQuery/src/jquery.js";

/**
 * @name class GtagHelper
 * @class
 * @hideconstructor
 * @description Manage Google Tag Manager - singleton
 */
class GtagHelper{  

    constructor(){
    }

    /**
     * @method GtagHelper#init
     * @description Initialiaze helper, include Google Tag Manager script and initialize it
     * @param {String} [key] Google Tag Manager user key 
     */
    init(key){
        $("head").prepend("<script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '"+key+"');</script>");
        init(window,document,"script","dataLayer",key);
        
        function init(w,d,s,l,i){
            var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s);
            j.async=true;j.src="https://www.googletagmanager.com/gtag/js?id="+i;
            f.parentNode.insertBefore(j,f);
        };
    }
}
const gtagHelper = new GtagHelper();
export default gtagHelper;