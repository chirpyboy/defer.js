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

(function (window, document) {

    // IntersectionObserver class
    var OBSERVER_CLASS = 'IntersectionObserver';

    // Real attributes for lazy-loaded media
    var ATTR_SRC    = 'src';
    var ATTR_SRCSET = 'srcset';
    var ATTR_STYLE  = 'style';
    var ATTR_TYPE   = 'type';

    // Tag names
    var IFRAME = 'IFRAME';
    var IMG    = 'IMG';
    var LINK   = 'LINK';
    var SOURCE = 'SOURCE';

    // Tag attributes
    var APPLIED_CLASS    = 'lazied';
    var DATASET_PREFIX   = 'data-';
    var APPLIED_SELECTOR = DATASET_PREFIX + APPLIED_CLASS;

    // Element methods
    var LOAD          = 'load';
    var FOR_EACH      = 'forEach';
    var GET_ATTRIBUTE = 'getAttribute';
    var SET_ATTRIBUTE = 'setAttribute';
    var HAS_ATTRIBUTE = 'hasAttribute';
    var REMOVE_ATTRIBUTE = 'removeAttribute';
    var NODE_NAME     = 'nodeName';

    // Common used constants
    var NOOP  = Function();
    var FALSE = false;
    var defer = window.defer || NOOP;
    var dom   = defer._ || NOOP;

    // Query selector
    function query(selector, parent) {
        return [].slice.call((parent || document).querySelectorAll(selector));
    }

    /**
     * This function will lazy-load stylesheet from given URL in `src` argument.
     * The tag id and delay time can be set in `id` and `delay` arguments.
     * Sometimes you may call a `callback` function when the file is loaded.
     *
     * @param   {string}        src         The file URL
     * @param   {string|false}  id          The tag id
     * @param   {integer}       delay       The delay time to create the tag
     * @param   {function}      callback    The callback function when load
     * @returns {void}
     */
    function deferstyle(src, id, delay, callback) {
        defer(function (element) {
            element      = dom(LINK, id, callback)
            element.rel  = 'stylesheet';
            element.href = src;
        }, delay);
    }

    /**
     * Returns a function to create lazy-load for `tagname` element.
     * For example: defermedia('img') with return a function to lazy-load
     *              creating a `<img>` tag.
     *
     * @param   {string}    tagname     The tag name (E.g. IMG, IFRAME)
     * @returns {function}              The returned function
     */
    function defermedia(tagname) {
        return function (selector, delay, lazied_class, callback, options, attributes) {
            defer(function (observer, walker) {
                // This function marks item initialized, then applies the callback
                function filter(media) {
                    if (media[GET_ATTRIBUTE](APPLIED_SELECTOR)) {return}
                    media[SET_ATTRIBUTE](APPLIED_SELECTOR, tagname);
                    walker(media);
                }

                // This method sets the real attributes
                function display(media) {
                    if ((callback || NOOP).call(media, media) !== FALSE) {
                        (attributes || [ATTR_SRCSET, ATTR_SRC, ATTR_STYLE])[FOR_EACH](function (attr, value) {
                            value = media[GET_ATTRIBUTE](DATASET_PREFIX + attr);
                            if (value) {media[SET_ATTRIBUTE](attr, value)}
                        });
                        query(SOURCE, media)[FOR_EACH](display);
                        if (LOAD in media) {media[LOAD]()}
                    }

                    media.className += ' ' + (lazied_class || APPLIED_CLASS);
                }

                // Force using IntersectionObserver when posible
                // It class is the heart of media lazy-loading
                if (OBSERVER_CLASS in window) {
                    observer = new window[OBSERVER_CLASS](function (items) {
                        items[FOR_EACH](function (item, target) {
                            if (item.isIntersecting && (target = item.target)) {
                                observer.unobserve(target);
                                display(target);
                            }
                        });
                    }, options);
                    walker = observer.observe.bind(observer);
                } else {
                    walker = display;
                }

                query(selector ||
                    tagname + '[' + DATASET_PREFIX + ATTR_SRC + ']:not([' + APPLIED_SELECTOR + '])')[FOR_EACH](filter);
            }, delay);
        }
    }

    /**
     * The easiest way to delay the execution of the existing <script> tags on website.
     *
     * @returns {void}
     */
    // function defersmart() {
    //     function loadscript(scripts, tag, base, attr) {
    //         base    = '[type=deferjs]';
    //         attr    = '[async]';
    //         scripts = query(base + ':not(' + attr + ')').concat(query(base + attr));
    //         //debugger
    //         var asyncScripts = scripts.filter(function(script){
    //             return false;
    //             //return script.async || script.getAttribute("data-after")
    //         });
    //
    //         scripts = scripts.filter(function(script){ //Loại bỏ các async script
    //             return asyncScripts.indexOf(script) == -1
    //         });
    //
    //         function appendDom(script){
    //             return (function(base){
    //                 base.parentNode.removeChild(base);
    //                 base[REMOVE_ATTRIBUTE](ATTR_TYPE);
    //                 var tag = dom(base[NODE_NAME]);
    //
    //                 for (var attr in base) {
    //                     var value = base[attr];
    //                     if (typeof value == 'string' && tag[attr] != value) {
    //                         tag[attr] = value;
    //                     }
    //                 }
    //                 return tag
    //             })(script)
    //         };
    //
    //         //Xử lý các script async
    //         asyncScripts.forEach(function(script){
    //             (function(script){
    //                 var afterIdsStr = script.getAttribute("data-after")
    //                 var isDepended = !!afterIdsStr
    //                 if(isDepended){
    //                     var idsDepended = afterIdsStr.split(",").map(function(id){
    //                         return id.trim();
    //                     }).filter(function(id){
    //                         return is !== ""
    //                     })
    //                     window.deferscript(script.src, script.id, 0, null, idsDepended)
    //                 }else{
    //                     appendDom(script)
    //                 }
    //             })(script)
    //         });
    //
    //         //Xử lý các script sync
    //         (function appendtag() {
    //             if (scripts == FALSE) {return}
    //
    //             base = scripts.shift();
    //
    //             var tag = appendDom(base)
    //
    //             //if (tag[ATTR_SRC] && !tag[HAS_ATTRIBUTE]('async')) {
    //                 tag.onload = tag.onerror = appendtag;
    //             //} else {
    //                 //defer(appendtag, 0.1);
    //             //}
    //         })();
    //     }
    //
    //     defer(loadscript, 4);
    // }

    function defersmart() {
        function loadscript(scripts, tag, base, attr, value) {
            base    = '[type=deferjs]';
            attr    = '[async]';
            scripts = query(base + ':not(' + attr + ')');
            let asyncScripts = query(base + attr);

            function append(base, async = false){
                base.parentNode.removeChild(base);

                base[REMOVE_ATTRIBUTE](ATTR_TYPE);

                tag = dom(base[NODE_NAME]);
                if(async){
                    tag.async = 1
                }
                for (attr in base) {
                    value = base[attr];
                    if (typeof value == 'string' && tag[attr] != value) {
                        tag[attr] = value;
                    }
                }
                return tag
            };

            //xử lý async tag
            asyncScripts.forEach(script => {
                append(script, true)
            });
            //Preload sync tag
            scripts.forEach(script => {
                window.deferPreload(script.src)
            });

            //xử lý sync tag
            (function appendtag() {
                if (scripts == FALSE) {return}

                base = scripts.shift();

                tag = append(base)
                tag.onload = tag.onerror = appendtag;
            })();
        }

        defer(loadscript, 4);
    }

    // Run once onload
    defersmart();

    // Export functions into the global scope
    window.deferstyle  = deferstyle;
    window.deferimg    = defermedia(IMG);
    window.deferiframe = defermedia(IFRAME);
    defer.all          = defersmart;

})(this, document);