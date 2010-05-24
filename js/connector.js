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
chrome.extension.onConnect.addListener(function(_port) {
  port = _port;
  console.assert(port.name == "lwe");
  port.onMessage.addListener(function(msg) {
    
    // Actions originating from the popup
    
    if (msg.action == "activate") {
      lwe.activate();
      port.postMessage({action: "activate", status: "ok"});
    /*} else if (msg.action == "deactivate") {
      lwe.deactivate();
      port.postMessage({action: "deactivate", status: "ok"});
    } else if (msg.action == "undo") {
      lwe.history.undo();
      port.postMessage({action: "undo", status: "ok"});
    } else if (msg.action == "redo") {
      lwe.history.redo();
      port.postMessage({action: "redo", status: "ok"});
    } else if (msg.action == "save") {
      lwe.history.save();
      port.postMessage({action: "save", status: "ok"});
    } else if (msg.action == "load") {
      lwe.history.load();
      port.postMessage({action: "load", status: "ok"});*/
    } else if (msg.action == "redo-text-edit") {
      lwe.history.f.redoTextEdit(msg.uid, msg.value);
    }
    
  });
});
