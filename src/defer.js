/**
 *
 * Package shinsenter/defer.js
 * https://github.com/shinsenter/defer.js
 *
 * Minified by UglifyJS3
 * http://lisperator.net/uglifyjs/
 *
 * Released under the MIT license
 * https://raw.githubusercontent.com/shinsenter/defer.js/master/LICENSE
 *
 * MIT License
 *
 * Copyright (c) 2019 Mai Nhut Tan <shin@shin.company>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

/*@shinsenter/defer.js*/
(function (
    // Global objects
    window, document,

    // Page load event name
    load_event,

    // Dequeue method
    dequeue, func_queue,

    // Variable placeholder
    dom_loaded
) {

    // Check if load event was fired
    dom_loaded = (/p/).test(document.readyState);
    var isFirefox = navigator.userAgent.indexOf('Firefox') >= 0;

    /**
     * This is our hero: the `defer` function.
     * This will push your function `func` into queue with its delay time.
     * If browser's `load` event was fired, your function will be executed.
     *
     * @param   {function}  func    The function
     * @param   {integer}   delay   The delay time to call the function
     * @returns {void}
     */
    function defer(func, delay) {
        // Let's set default timeout to 2 browser tick cycles
        var default_delay = 32;

        if (dom_loaded) {
            dequeue(func, delay || default_delay);
        } else {
            func_queue.push(func, delay);
        }
    }

    /**
     * This method will be triggled when `load` event was fired.
     * This will also turn `dom_loaded` into `true`...
     * ... and run all function in queue using `dequeue` method.
     *
     * @returns {void}
     */
    function flushqueue() {
        for (dom_loaded = 1; func_queue[0];) {
            defer(func_queue.shift(), func_queue.shift());
        }
    }

    // var DOMLoad = (function(){
    //     var idsLoad = new Set()
    //     var subscribeCallbacks = [/*{
    //         hasFired: false, //Đã fire hay chưa
    //         ids: [], //Danh sách id đăng kí
    //         cb: Function(), //Function callback
    //     }*/]
    //
    //     function subscribes(ids, callback){
    //         subscribeCallbacks.push({
    //             hasFired: false,
    //             ids: ids,
    //             cb: callback
    //         })
    //         checkAndFireCallback()
    //     }
    //
    //     function subscribe(id, callback){
    //         subscribes([id], callback)
    //     }
    //
    //     function checkAndFireCallback(){
    //         subscribeCallbacks.forEach(function(sub){
    //             if(sub.hasFired !== true){
    //                 var isComplete = true
    //                 sub.ids.forEach(function(id){
    //                     if(!idsLoad.has(id)){
    //                         isComplete = false
    //                     }
    //                 })
    //                 if(isComplete){
    //                     sub.hasFired = true
    //                     sub.cb.apply()
    //                 }
    //             }
    //         })
    //     }
    //
    //     function publish(id){
    //         idsLoad.add(id)
    //         checkAndFireCallback()
    //     }
    //
    //     return {
    //         publish: publish,
    //         subscribe: subscribe,
    //         subscribes: subscribes
    //     }
    // })()

    /**
     * Preload js
     */
    function preload(url, type){
        type = type || 'script'
        if(isFirefox){
            var o = document.createElement('object');
            o.data = url;
            o.width = 0;
            o.height = 0;
            document.body.append(o)
        }else{
            var link = document.createElement('link');
            link.setAttribute('rel', 'preload');
            link.href=url;
            link.as = type;
            document.head.append(link)
        }
    }

    /**
     * Create a DOM element if not exist.
     *
     * @param   {string}    tag         Tag name
     * @param   {string}    id          The DOM's id
     * @param   {function}  callback    The callback function when load
     * @param   {object}    dom         The placeholder for the DOM
     * @returns {object}    The DOM
     */
    function dom(tag, id, callback, dom) {
        if(!id || !document.getElementById(id)) {
            dom = document.createElement(tag || 'SCRIPT');

            if (id) {
                dom.id = id;
            }

            // dom.onload = function(){
            //     if(id){
            //         DOMLoad.publish(id)
            //     }
            //     if (callback) {
            //         callback();
            //     }
            // }

            if (callback) {
                dom.onload = callback;
            }

            document.head.appendChild(dom);
        }

        return dom || {};
    }

    /**
     * This function will lazy-load a script from given URL in `src` argument.
     * The tag id and delay time can be set in `id` and `delay` arguments.
     * Sometimes you may call a `callback` function when the file is loaded.
     *
     * @param   {string}        src         The file URL
     * @param   {string|false}  id          The tag id
     * @param   {integer}       delay       The delay time to create the tag
     * @param   {function}      callback    The callback function when load
     * @param   {array}      depenIds    Danh sách ids cần load xong trước để execute
     * @returns {void}
     */
    // function deferscript(src, id, delay, callback, depenIds) {
    //     if(Array.isArray(depenIds) && depenIds.length > 0){
    //         preload(src)
    //         DOMLoad.subscribes(depenIds, function(){
    //             defer(function () {dom('', id, callback).src = src}, 1);
    //         })
    //     }else{
    //         defer(function () {dom('', id, callback).src = src}, delay);
    //     }
    // }
    function deferscript(src, id, delay, callback) {
        defer(function () {dom('', id, callback).src = src}, delay);
    }

    // Add event listener into global scope
    window.addEventListener('on' + load_event in window ? load_event : 'load', flushqueue);

    // Export functions into the global scope
    defer._            = dom;
    window.defer       = defer;
    window.deferscript = deferscript;
    window.deferPreload = preload;

})(this, document, 'pageshow', setTimeout, []);
