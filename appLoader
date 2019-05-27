'use strict';

const appLoaderCache = {};

app.appLoader = function(srcs, callback) {

    var app = {
        stack: srcs,

        timer: 0,

        loadScript: function (src) {
            return new Promise(function(resolve, reject) {
                var script = document.createElement('script');
                src+= '?ver='+window.app.ver;
                if (window.app.debug) {
                    src+= '&'+Math.random();
                }
                script.src = src;
                script.type = "text/javascript";
                script.async = true;
                document.getElementsByTagName('head')[0].appendChild(script);

                script.onload = () => {
                    resolve(script)
                };
                script.onerror	= () => reject(new Error("Script load error: " + src));
            });
        },

        loadCss: function(src) {
            return new Promise(function(resolve, reject) {
                var link = document.createElement('link');
                src+= '?ver='+window.app.ver;
                if (window.app.debug) {
                    src+= '&'+Math.random();
                }
                link.setAttribute("href", src);
                link.setAttribute("rel","StyleSheet");
                link.setAttribute("type","text/css");
                link.setAttribute("media","none"); // trick to triggering an asynchronous
                document.getElementsByTagName('head')[0].appendChild(link);

                link.onload 	= () => {
                    link.setAttribute("media","all");
                    resolve(link)
                };
                link.onerror	= () => reject(new Error("Css load error: " + src));
            });
        },

        handelCallback: function() {
            self.counter--;
            if (self.counter <= 0) {
                return callback();
            }
        }

    };

    if (!srcs.length) {
        if (typeof callback == 'function') {
            return callback();
        }
    }

    srcs.forEach(function(src) {
        for (let type in src) {

            let cacheKey = JSON.stringify(src);

            if (appLoaderCache[cacheKey] === true) {
                continue;
            }
            else if (appLoaderCache[cacheKey] === 'loading') {
                continue;
            }
            else if (typeof appLoaderCache[cacheKey] === 'undefined') {
                appLoaderCache[cacheKey] = 'loading';
            }

            switch (type) {
                case 'js':
                    app.loadScript(src[type]).then(function(val){
                        appLoaderCache[cacheKey] = true;
                    });
                    break;
                case 'css':
                    app.loadCss(src[type]).then(function(val){
                        appLoaderCache[cacheKey] = true;
                    });
                    break;
            }
        }
    });

    var t = setInterval(() => {
        if (app.timer++ && app.timer > 10000) {
            clearTimeout(t);
        }

        let legnth = Object.keys(appLoaderCache).length;
        for (let i in appLoaderCache) {
            if (appLoaderCache[i] === true) {
                legnth--;
                if (legnth <= 0) {
                    clearTimeout(t);
                    if (typeof callback == 'function') {
                        return callback();
                    }
                }
            }
        }
    }, 0);

};

const domEval = function (code, doc) {
    doc = doc || document;
    var script = doc.createElement( "script" );
    script.text = code;
    doc.head.appendChild(script).parentNode.removeChild(script);
};

const appXhr = function(params) { //https://plainjs.com/javascript/ajax/send-ajax-get-and-post-requests-47/

    var jsonToUrlEncoded = function (element, key, list){
        var list = list || [];
        if(typeof(element)=='object'){
            for (var idx in element)
                jsonToUrlEncoded(element[idx], key ? key+'['+idx+']' : idx, list);
        } else {
            list.push(key+'='+encodeURIComponent(element));
        }
        return list.join('&');
    };

    var onSuccess 	= params.onSuccess ? params.onSuccess : function(){};
    var onload 	    = params.onload ? params.onload : function(){};
    var onFail 		= params.onFail ? params.onFail : function(){};
    var onloadstart = params.onloadstart ? params.onloadstart : function(){};
    var onprogress  = params.onprogress ? params.onprogress : function(){};
    var onloadend   = params.onloadend ? params.onloadend : function(){};
    var onerror     = params.onerror ? params.onerror : function(){};
    var onabort     = params.onabort ? params.onabort : function(){};
    var ontimeout   = params.ontimeout ? params.ontimeout : function(){};
    var url			= params.url;
    var method 		= params.method ? params.method : 'GET'; method = method.toUpperCase();
    var type		= params.type ? params.type : 'string';
    var renderJs    = (typeof params.renderJs != 'undefined') ? params.renderJs : (type === 'json' ? false : true);
    var data		= params.data ? params.data : '';

    var xhr = new XMLHttpRequest();

    xhr.onloadstart = function(e) {
        onloadstart(e);
    };

    xhr.onprogress = function(e) {
        onprogress(e);
    };

    xhr.onloadend = function(e) {
        onloadend(e);
    };

    xhr.onerror = function(e) {
        onerror(e);
    };

    xhr.onabort = function(e) {
        onabort(e);
    };

    xhr.ontimeout = function(e) {
        ontimeout(e);
    };

    xhr.onload = function () {
        let response = xhr.response;
        if (xhr.status >= 200 && xhr.status < 300) {

            if (type === 'json' && typeof response === 'string') {
                response = JSON.parse(response);
            }

            onSuccess(response, xhr);
            onload(response, xhr);

            if (renderJs) {
                let div = document.createElement('div'); div.innerHTML = response;
                let scripts = div.querySelectorAll('script');
                for (let i = 0; i < scripts.length; i++) {
                    domEval(scripts[i].textContent);
                }
            }

        }
        else {
            onFail(response, xhr);
        }
    };

    data = jsonToUrlEncoded(data);

    xhr.open(method, url);

    if (method === 'GET') {
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    else if (method === 'POST') {
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    }

    if (type === 'document') {
	    xhr.responseType = "document";
    }

    xhr.send(data);
};










