/**
 * Copyright (c) 2009-2010 Arnaud Leymet
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Live Website Editor <http://github.com/arnaud/lwe>
 */

var port;

function sendMessage(action) {
  console.debug("Sending message", action);
  port.postMessage({action: action});
}

// Listen to a tab change and update the action icon accordingly
chrome.tabs.onUpdated.addListener(function (tabId, change, tab) {
  console.log("listenToTabsUpdates", tabId, change, tab);
  if (change.status == "complete") {
    localStorage.current_tab = tab;
    if(!lwe.f.isValidUrl(tab.url)) {
      lwe.f.setInactiveIcon(tab);
      //chrome.browserAction.setPopup({tabId: tab.id, popup: ""});
    } else {
      lwe.f.setActiveIcon(tab);
      //chrome.browserAction.setPopup({tabId: tab.id, popup: "popup.html"});
      if(lwe.f.isUrlPersisted(tab.url)) {
        lwe.history.load(tab);
        lwe.f.setEditedIcon(tab);
      }
    }
  }
});

// Listen to clicks on the action icon
chrome.browserAction.onClicked.addListener(function(tab) {
  console.log("listenToClick", tab);
  port = chrome.tabs.connect(tab.id, {name: "lwe"});
  port.onMessage.addListener(function(msg) {
    console.log("Returned from action", msg.action, "with status", msg.status);
    switch(msg.status) {
      case "ok": // status "ok"
        // Responses to actions originating from the popup
        switch(msg.action) {
          case "activate": // action
            lwe.f.persistUrl(tab.url);
            lwe.f.setEditedIcon(tab);
            lwe.flash.success("has been activated! Double-click any text element to change its content.");
            break;
          /*case "deactivate": // action
            lwe.f.setActiveIcon(tab);
            lwe.flash.success("Deactivated!");
            break;*/
        }
        break;
      default: // no status
        // Actions originating from the content-script connector
        switch(msg.action) {
          case "edit-text": // action
            var options = {type: "edit-text", uid: msg.uid, new_value: msg.new_value, old_value: msg.old_value};
            lwe.f.saveTextEdit(tab.url, options);
            break;
        }
        break;
    }
  });
  if(!lwe.f.isValidUrl(tab.url)) {
    lwe.flash.error("This page cannot be edited.");
  } else {
    sendMessage("activate");
  }
});


var lwe = {
	/**
	* Flash desktop notifications
	*/
	flash: {
		error: function(message) {
			lwe.f.showNotification("error", "Live Website Editor", message);
		},
		warning: function(message) {
			lwe.f.showNotification("warning", "Live Website Editor", message);
		},
		success: function(message) {
			lwe.f.showNotification("success", "Live Website Editor", message);
		}
	},
	/**
	* History
	*/
	history: {
		/**
		* Undo the last action
		*/
		/*undo: function() {
			console.log("undo");
		},*/
		/**
		* Redo the last action
		*/
		/*redo: function() {
			console.log("redo");
		},*/
		/**
		* Save the last action
		*/
		/*save: function() {
			console.log("save");
		},*/
		/**
		* Load the last action
		*/
		load: function(tab) {
			console.log("load", tab);
			with(lwe.f) {
				var history = getHistory(tab.url);
				console.log(history);
				for(var i in history) {
					var change = history[i];
					console.log(change);
					switch(change.type) {
						case "edit-text":
							console.log("Please redo the text edit?");
							var port = chrome.tabs.connect(tab.id, {name: "lwe"});
							port.postMessage({action: "redo-text-edit", uid: change.uid, value: change.new_value});
							break;
					}
				}
			}
		}
	},
	/**
	* Utils
	*/
	f: {
		isValidUrl: function(url) {
			return url != null && /https?:\/\/.+/.test(url);
		},
		showNotification: function(icon, title, message) {
			if (window.webkitNotifications.checkPermission() == 0) {
			  window.webkitNotifications.createNotification(chrome.extension.getURL("ico/flash/"+icon+".png"), title, message).show();
			} else {
			  window.webkitNotifications.requestPermission();
			}
		},
		setEditedIcon: function(tab) {
			with(lwe.f) {
				_setIcon("edit", tab);
			}
		},
		setActiveIcon: function(tab) {
			with(lwe.f) {
				_setIcon("active", tab);
			}
		},
		setInactiveIcon: function(tab) {
			with(lwe.f) {
				_setIcon("inactive", tab);
			}
		},
		_setIcon: function(icon, tab) {
		  chrome.browserAction.setIcon({
		    'path': "ico/"+icon+".png",
		    'tabId': tab.id
		  });
		},
		_getCurrentUrl: function() {
		  chrome.tabs.getSelected(null, function(tab) {
		    localStorage.current_url = tab.url;
		  });
		  return localStorage.current_url;
		},
		persistUrl: function(url) {
			with(lwe.f) {
				if(isUrlPersisted(url)) {
					// don't bother adding it to the list since it's already in
					return;
				}
			  var urls_array = _getPersistedUrls();
			  urls_array = urls_array.concat(url);
			  localStorage.urls = JSON.stringify(urls_array);
			}
		},
		unpersistUrl: function(url) {
			with(lwe.f) {
			  var urls_array = _getPersistedUrls();
			  for(var i=0; i<urls_array.length; i++) {
			    i_url = urls_array[i];
			    if(i_url == url) {
			      urls_array.slice(i, 1);
			    }
			  }
			  localStorage.urls = JSON.stringify(urls_array);
			}
		},
		isUrlPersisted: function(url) {
			with(lwe.f) {
			  var urls_array = _getPersistedUrls();
			  for(var i=0; i<urls_array.length; i++) {
			    url_array = urls_array[i];
			    if(url_array == url) {
			      return true;
			    }
			  }
			}
			return false;
		},
		_getPersistedUrls: function() {
			array = (localStorage.urls != null) ? JSON.parse(localStorage.urls) : new Array;
			if(array == null) {
				array = new Array;
			}
			return array;
		},
		getHistory: function(url) {
			var array = (localStorage[url] != null) ? JSON.parse(localStorage[url]) : new Array;
			if(array == null) {
				array = new Array;
			}
			return array;
		},
		setHistory: function(url, history) {
			localStorage[url] = JSON.stringify(history);
		},
		saveTextEdit: function(url, data) {
			console.log("saveTextEdit", url, data);
			with(lwe.f) {
				var history = getHistory(url);
			  history = history.concat(data);
			  setHistory(url, history);
			}
		}
	}
}
