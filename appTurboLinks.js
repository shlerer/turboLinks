/*!
 * Copyright 2013 G8net (g8net.com), Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

window.addEventListener("popstate", function(e) {
	app.turbolinks.loadPage(e.state.url, {loadCounter: 0});
});

app.turbolinks = {};

app.turbolinks.setUrlHistory = function(url) {
	var location = document.location;
	if (location.href != url) {
		history.pushState({url: url}, '', url);
	}
	else {
		history.replaceState({url: url}, '', url);
	}
};

app.turbolinks.init = function(selector) {
	var links = document.querySelectorAll(selector);

	links.forEach(function(link){
		if (!link.getAttribute('data-turbolinks')) {
			link.setAttribute('data-turbolinks', true);
		}
		link.addEventListener('click', app.turbolinks.onclickFn);
	});
};

app.turbolinks.onclickFn = function(e) {
	if (this.getAttribute('data-turbolinks') === 'false') {return;}
	e.preventDefault();
	let obj = {loadCounter: 0};
	app.turbolinks.loadPage(this.href, obj);
};

app.turbolinks.loadPage = function(url, obj) {
	app.turbolinks.setProgressBar();
	var progressBar = document.getElementById('pageProgress');
	if (progressBar) {
		progressBar.style.display = 'block';
		var progressWidth = Math.floor(Math.random() * Math.floor(50))+'%';
		setTimeout(function () {progressBar.style.width = progressWidth;}, 50);
	}

	appXhr({
		type: 'document',
		method: 'GET',
		renderJs: false,
		url: url,
		onloadstart: function(e) {
			app.turbolinks.setUrlHistory(url);
		},
		onprogress: function(e) {},
		onloadend: function(e) {},
		onSuccess: function(response) {
			app.turbolinks.markHeadNodes(response, obj);
			app.turbolinks.setNewHead(response, obj);
			let t = setInterval(function(){
				if (obj.loadCounter <= 0) {
					app.turbolinks.removeOldHead(response);
					app.turbolinks.setBody(response);
					app.turbolinks.setProgressBar();
					var progressBar = document.getElementById('pageProgress');
					progressBar.style.width = progressWidth;
					if (progressBar) {
						setTimeout(function () {
							progressBar.style.width = '100%';
							setTimeout(function () {progressBar.style.display = 'none'; progressBar.style.width = '0';}, 350);
						}, 50);
					}
					// console.log(window.location);

					document.body.scrollTop = document.documentElement.scrollTop = 0;
					if (window.location.hash) {
						window.location.hash = window.location.hash;
					}
					clearInterval(t);
				}
			}, 5);

		}
	});
};

app.turbolinks.setProgressBar = function() {
	if (!document.documentElement.querySelector('body #pageProgress')) {
		var body = document.documentElement.querySelector('body');
		var div = document.createElement('div');
		div.id = 'pageProgress';
		div.style.cssText = 'position: fixed; top: 0; height: 2px; background: #F63805; width: 0; transition: width 0.3s; z-index:9999;';
		body.appendChild(div);
	}
};

app.turbolinks.setBody = function(response, obj) {
	var body = document.documentElement.querySelector('body');
	var newBody = response.documentElement.querySelector('body');

	body.parentNode.replaceChild(newBody, body);

	let scripts = newBody.querySelectorAll('script');
	// console.log(scripts);
	for (let i = 0; i < scripts.length; i++) {
		if (scripts[i].src) {
			var script = document.createElement('script');
			for (let attr of scripts[i].attributes) {
				script.setAttribute(attr.name, attr.value);
			}
			if (scripts[i].text) {
				script.text = child.text;
			}
			scripts[i].parentNode.replaceChild(script, scripts[i]);
		}
		else {
			// Dom Eval
			var script = document.createElement( "script" );
			script.text = scripts[i].text;
			document.head.appendChild(script).parentNode.removeChild(script);
		}
	}
};

app.turbolinks.removeOldHead = function(response, obj) {
	// Reverse loop (node.childNodes is a live collection. As you remove items from it, the collection itself is modified)
	for (let i = document.head.childNodes.length - 1; i >= 0; i--) {
		let child = document.head.childNodes[i];
		// Remove old children
		if (child.getAttribute('data-turbolinks_remove_node')) {
			child.parentNode.removeChild(child);
		}
	}
};

app.turbolinks.setNewHead = function(response, obj) {
	var newHead = response.documentElement.querySelector('head');
	for (newChild of newHead.childNodes) {
		// Modify new childrens
		if (!newChild.getAttribute('data-turbolinks_remove_node')) {
			obj.loadCounter++;
			if (newChild.nodeName === 'SCRIPT') {
				var node = document.createElement('script');
				for (let attr of newChild.attributes) {
					node.setAttribute(attr.name, attr.value);
				}
				if (newChild.text) {
					node.text = newChild.text;
				}
				obj.loadCounter--;

			}
			else if (newChild.nodeName === 'LINK') {
				var node = document.createElement('link');
				for (let attr of newChild.attributes) {
					node.setAttribute(attr.name, attr.value);
				}
				node.onload = function() {
					obj.loadCounter--;

				};
			}
			else {
				var node = document.createElement(newChild.nodeName);
				for (let attr of newChild.attributes) {
					node.setAttribute(attr.name, attr.value);
				}
				obj.loadCounter--;
			}

			document.head.appendChild(node);
		}
	}
};

app.turbolinks.markHeadNodes = function(response, obj) {
	var head = document.head;
	var newHead = response.documentElement.querySelector('head');

	for (oldChild of head.childNodes) {
		var removeFlag = true;
		for (newChild of newHead.childNodes) {
			if (oldChild.nodeName === newChild.nodeName) {
				if (oldChild.nodeName === 'TITLE') {
					if (oldChild.textContent === newChild.textContent) {
						removeFlag = false;
					}
				}
				else if (oldChild.nodeName === 'META') {
					if (oldChild.getAttribute('property') === newChild.getAttribute('property') &&
						oldChild.getAttribute('name') === newChild.getAttribute('name') &&
						oldChild.getAttribute('content') === newChild.getAttribute('content')) {
						removeFlag = false;
					}

				}
				else if (oldChild.nodeName === 'LINK') {
					if (oldChild.getAttribute('href') === newChild.getAttribute('href') &&
						oldChild.getAttribute('type') === newChild.getAttribute('type') &&
						oldChild.getAttribute('rel') === newChild.getAttribute('rel')) {
						removeFlag = false;
					}
				}
				else if (oldChild.nodeName === 'SCRIPT') {
					if (oldChild.getAttribute('type') === newChild.getAttribute('type') &&
						oldChild.getAttribute('src') === newChild.getAttribute('src') &&
						oldChild.getAttribute('src')) {
						removeFlag = false;
					}
				}
				else if (oldChild.nodeName === 'STYLE') {}
				else if (oldChild.nodeName === 'NOSCRIPT') {}
				else if (oldChild.nodeName === 'TEMPLATE') {}
				else if (oldChild.nodeName === 'BASE') {}
			}

			if (!removeFlag) {
				// (Not modified) Remove from new list
				newChild.setAttribute('data-turbolinks_remove_node', 1);
				break;
			}
		}

		if (removeFlag) {
			// (modified) Remove from old list
			oldChild.setAttribute('data-turbolinks_remove_node', 1);
		}
	}
};
