/**
 * Copyright (c) 2009 Arnaud Leymet
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
 * Live Website Editor <http://code.google.com/p/lwe/>
 * v0.2
 * Last update: 2009.01.11
 */

var lwe_undefined;
var lwe = {
	/**
	* current lwe version
	*/
	version: '0.2',
	/**
	* environment variables and constants
	*/
	env: {
		current_mode: 'none',
		debug_mode: true,
		firebug_on: (window.console && console.firebug),
		editable_text_elements: ['p','h1','h2','h3','h4','h5','h6','strong','em','abbr','acronym','address','bdo',
			'blockquote','cite','q','code','ins','del','dfn','kbd','pre','samp','var','br','b','i','tt','sub','sup',
			'big','small','hr','span','a','li','dt','dd','caption','label','legend'],
		draggable_elements: ['p','h1','h2','h3','h4','h5','h6','strong','em','abbr','acronym','address','bdo',
			'blockquote','cite','q','code','ins','del','dfn','kbd','pre','samp','var','hr','span','a','ul','ol','dt',
			'dd','caption','label','legend','div','span','p','code','cite','img','object','table','form','input',
			'textarea','select','button','label','fieldset','legend'],
		
		tags_structure: ['html','head','body','div','span'],
		tags_meta_informations: ['DOCTYPE','title','link','meta','style'],
		tags_text: ['p','h1','h2','h3','h4','h5','h6','strong','em','abbr','acronym','address','bdo','blockquote',
			'cite','q','code','ins','del','dfn','kbd','pre','samp','var','br'],
		tags_links: ['a','base'],
		tags_images: ['img','area','map','object','param'],
		tags_lists: ['ul','ol','li','dl','dt','dd'],
		tags_tables: ['table','tr','td','th','tbody','thead','tfoot','col','colgroup','caption'],
		tags_forms: ['form','input','textarea','select','option','optgroup','button','label','fieldset','legend'],
		tags_scripting: ['script','noscript'],
		tags_presentational: ['b','i','tt','sub','sup','big','small','hr']
	},
	/**
	* history & persistency handler
	*/
	history: {
		/**
		* array which contains all the changes that have been made
		*/
		h_undo: [],
		/**
		* array which contains all the changes that have been undone
		*/
		h_redo: [],
		/**
		* persistency store
		*/
		store: lwe_undefined,
		/**
		* persistency store's name (part of this name is the current URL)
		*/
		store_name: 'lwe_store ' + location.href.replace(/https?\:\/\//g, '').replace(/[^a-zA-Z0-9_ -]/g, '_'),
		/**
		* undo the latest change
		*/
		undo: function() {
			console.group('undo');
			with(lwe.history) {
				// remove the last action of the 'undo history'
				var last_undo = h_undo.pop();
				// then add it to the 'redo history'
				h_redo.push({
					action: last_undo.action,
					element: last_undo.element,
					new_data: last_undo.new_data,
					old_data: last_undo.old_data
				});
				console.debug(last_undo);
				// do the effective rollback
				switch(last_undo.action) {
					case 'edit-text':
						f.undoTextEdit(last_undo.element, last_undo.old_data);
						break;
				}
			  //lwe.f.notification('Last modification was undone');
				console.warn('TODO: handle all the cases');
				//TODO
				// update the buttons visibility/usability
				if(h_undo.length == 0) {
					f.disableButton('undo');
				}
				f.enableButton('redo');
				f.enableButton('save');
			}
			console.groupEnd();
		},
		/**
		* redo the latest change
		*/
		redo: function() {
			console.group('redo');
			with(lwe.history) {
				// remove the last action of the 'redo history'
				var last_redo = h_redo.pop();
				// then add it to the 'undo history'
				h_undo.push({
					action: last_redo.action,
					element: last_redo.element,
					new_data: last_redo.new_data,
					old_data: last_redo.old_data
				});
				console.debug(last_redo);
				// do the effective rollback
				switch(last_redo.action) {
					case 'edit-text':
						f.redoTextEdit(last_redo.element, last_redo.new_data);
						break;
				}
			  //lwe.f.notification('Last undone modification was redone');
				console.warn('TODO: handle all the cases');
				//TODO
				// update the buttons visibility/usability
				if(h_redo.length == 0) {
					f.disableButton('redo');
				}
				f.enableButton('undo');
				f.enableButton('save');
			}
			console.groupEnd();
		},
		/**
		* undo all the changes
		*/
		revert: function() {
			console.group('revert');
			with(lwe.history) {
				// for all the 'undo history' actions
				while(h_undo.length > 0) {
					// undo the action
					undo();
				}
			}
			console.groupEnd();
		},
		/**
		* save the current state
		*/
		save: function() {
			console.group('save');
			with(lwe.history.f) {
				persistHistory();
				disableButton('save');
				enableButton('load');
			}
			console.groupEnd();
		},
		/**
		* load the persisted state
		*/
		load: function() {
			console.group('load');
			with(lwe.history) {
			  revert();
				f.applyPersistedHistory();
				f.updateButtons();
			}
			// cleaning the presentation
			with(lwe.f) {
				if(lwe.env.current_mode=='none') {
					unmarkEditableElements();
					unmarkDraggableElements();
				}
			}
			console.groupEnd();
		},
		/**
		* add an history action
		*/
		add: function(action, element, new_data, old_data) {
			console.debug('add %o %o %o', action, element, new_data, old_data);
			with(lwe.history) {
				// reset the redo history
				h_redo = [];
				// add the new history action
				h_undo.push({
					action: action,
					element: element,
					new_data: new_data,
					old_data: old_data
				});
				// enable the undo and action buttons
				f.enableButton('undo');
				f.enableButton('save');
			}
		},
		/**
		* history functions
		*/
		f: {
			/**
			* persist the current history
			*/
			persistHistory: function() {
				console.debug('persistHistory');
				with(lwe.history) {
					if(store == lwe_undefined) {
						store = new Persist.Store(store_name);
					}
					store.set('history', JSON.stringify(h_undo));
					console.info('Persisted the history (' + h_undo.length + ' actions)');
			    lwe.f.notification('The current state of this page is now saved<br/>('+h_undo.length+' modifications)');
				}
			},
			/**
			* apply the persisted history
			*/
			applyPersistedHistory: function() {
				console.debug('applyPersistedHistory');
				with(lwe.history) {
					if(store == lwe_undefined) {
						store = new Persist.Store(store_name);
					}
					// get the 'undo history' back
					store.get('history', function(ok, val) {
						if(ok) {
							h_redo = [];
							h_undo = [];
							h_undo = JSON.parse(val.value);
							console.info('Persisted the history back ('+h_undo.length+' actions)');
			        lwe.f.notification('Loaded the last state of this page<br/>('+h_undo.length+' modifications)');
						} else {
							console.error('Couldn\'t get persisted history back!');
						}
					});
					// apply all the actions of the 'undo history'
					for(var i=0; i<h_undo.length; i++) {
						var action = h_undo[i];
						switch(action.action) {
							case 'edit-text':
								f.redoTextEdit(action.element, action.new_data);
								break;
							case 'delete':
								f.redoDelete(action.element, action.new_data);
								break;
							case 'drag':
								f.redoDrag(action.element, action.new_data);
								break;
							default:
								console.warn('TODO: handle all the cases: %o', action.action);
								//TODO
								break;
						}
					}
				}
			},
			/**
			* is there history persisted ? then enable the 'load' button
			*/
			checkPersistedHistory: function() {
				console.debug('checkPersistedHistory');
				with(lwe.history) {
					if(store == lwe_undefined) {
						store = new Persist.Store(store_name);
					}
					store.get('history', function(ok, val) {
						if(ok && val != lwe_undefined) {
							f.enableButton('load');
						}
					});
				}
				
			},
			undoDelete: function(element, old_data) {
				console.debug('undoDelete %o %o', element, old_data);
				$(element).effect('highlight');
				$(element).show();
			},
			undoDrag: function(element, old_data) {
				console.debug('undoDrag %o %o', element, old_data);
				$(element).effect('highlight');
				$(element).css('left', old_data.x);
				$(element).css('top', old_data.y);
			},
			undoTextEdit: function(element, old_data) {
				console.debug('undoTextEdit %o %o', element, old_data);
				$(element).effect('highlight');
				$(element).html(old_data);
			},
			undoImageChange: function(element, old_data) {
				console.debug('undoImageChange %o %o', element, old_data);
				console.warn('TODO: handle the undoImageChange function');
				//TODO
			},
			redoDelete: function(element, new_data) {
				console.debug('redoDelete %o %o', element, new_data);
				$(element).effect('highlight');
				$(element).hide();
			},
			redoDrag: function(element, new_data) {
				console.debug('redoDrag %o %o', element, new_data);
				$(element).effect('highlight');
				$(element).css('left', new_data.x);
				$(element).css('top', new_data.y);
			},
			redoTextEdit: function(element, new_data) {
				console.debug('redoTextEdit %o %o', element, new_data);
				$(element).effect('highlight');
				$(element).html(new_data);
			},
			redoImageChange: function(element, new_data) {
				console.debug('redoImageChange %o %o', element, new_data);
				console.warn('TODO: handle the redoImageChange function');
				//TODO
			},
			/**
			* enable the button which id is 'lwe-<name>'
			*/
			enableButton: function(name) {
				console.debug('enableButton', name);
				$('#lwe-'+name).removeAttr('disabled');
				$('#lwe-'+name).removeClass('disabled');
			},
			/**
			* disable the button which id is 'lwe-<name>'
			*/
			disableButton: function(name) {
				console.debug('disableButton', name);
				$('#lwe-'+name).attr('disabled', 'disabled');
				$('#lwe-'+name).addClass('disabled');
			},
			/**
			* disable all buttons
			*/
			disableAllButtons: function() {
				console.debug('disableAllButtons');
				with(lwe.history.f) {
					disableButton('undo');
					disableButton('redo');
					disableButton('save');
					disableButton('load');
					disableButton('delete');
				}
			},
			/**
			* update all the buttons
			*/
			updateButtons: function() {
				console.debug('updateButtons');
				with(lwe.history) {
					f.disableAllButtons();
					f.checkPersistedHistory();
					if(h_undo.length > 0) f.enableButton('undo');
					if(h_redo.length > 0) f.enableButton('redo');
				}
			}
		}
	},
	/**
	* lwe console
	*/
	console: {
		/**
		* add an entry in the console
		*/
		add: function(type, args) {
			var show = true;
			switch(type) {
				case 'debug':
				case 'warn':
				case 'error':
					if(!lwe.env.debug_mode) show = false;
			}
			if(show) {
				try {
					with(lwe.console.f) {
						var time = getCurrentTime();
						var date_and_time = getCurrentDate()+' - '+time;
						var message = '<span class="lwe-not-editable lwe-not-draggable" title="'+date_and_time+'">'+time+'</span> ';
						message += formatMessageArguments(args);
					}
			    //lwe.f.notification(message);
				} catch(e) {}
			}
		},
		/**
		* console functions
		*/
		f: {
			/**
			* get the current time (format is hh:mm:ss.ms/24)
			*/
			getCurrentTime: function() {
				var currentTime = new Date();
				var hours = currentTime.getHours();
				if (hours < 10)
					hours = '0' + hours;
				var minutes = currentTime.getMinutes();
				if (minutes < 10)
					minutes = '0' + minutes;
				var seconds = currentTime.getSeconds();
				if (seconds < 10)
					seconds = '0' + seconds;
				var milliseconds = currentTime.getMilliseconds();
				if (milliseconds < 100)
					milliseconds = '0' + milliseconds;
				else if (milliseconds < 10)
					milliseconds = '00' + milliseconds;
				return hours + ':' + minutes + ':' + seconds + '.' + milliseconds;
			},
			/**
			* get the current date (format is dd/mm/yyyy)
			*/
			getCurrentDate: function() {
				var currentDate = new Date();
				var day = currentDate.getDate();
				if (day < 10)
					day = '0' + day;
				var month = currentDate.getMonth();
				if (month < 10)
					month = '0' + month;
				var year = currentDate.getFullYear();
				return day + '/' + month + '/' + year;
			},
			/**
			* formats the 'args' arguments in order to get something like firebug console
			*/
			formatMessageArguments: function(args) {
				switch(typeof(args)) {
					case 'string':
						return args;
					default:
						return args[0];
				}
			}
		}
	},
	/**
	* lwe main functions
	*/
	f: {
		/**
		* injects a javascript file in the website
		*/
		addScript: function(src) {
			console.debug('addScript %o', src);
			var e = document.createElement('script');
			e.setAttribute('src', src);
			e.setAttribute('type', 'text/javascript');
			e.setAttribute('class', 'lwe-script');
			document.body.appendChild(e);
		},
		/**
		* injects a stylesheet file in the website
		*/
		addCSS: function(src) {
			console.debug('addCSS %o', src);
			var e = document.createElement('link');
			e.setAttribute('href', src);
			e.setAttribute('type', 'text/css');
			e.setAttribute('rel', 'stylesheet');
			e.setAttribute('class', 'lwe-stylesheet');
			document.getElementsByTagName('head')[0].appendChild(e);
		},
		/*
		* remove all the additional elements: css, js, etc.
		*/
		removeAdditionalElements: function() {
			console.debug('removeAdditionalElements');
			$('.lwe-stylesheet').remove();
			$('.lwe-script').remove();
			$('#lwe-inspector').remove();
			$('#jGrowl').remove();
		},
  	/**
  	* create a notification with jGrowl
  	*/
  	notification: function(message) {
  		console.group('lwe > notification', message);
  		$.jGrowl.defaults.closer = false;
  		$.jGrowl(message, { header: 'Live Website Editor' });
  		console.groupEnd();
  	},
		/**
		* enable the inspector
		*/
		enableInspector: function(elements) {
			console.debug('enableInspector %o', elements);
			console.warn('TODO: Inspector');
			//TODO: Inspector
			/*var inspector = $('#lwe-inspector');
			elements.hover(function() {
				inspector.css('top', $(this).css('top'));
				inspector.css('left', $(this).css('left'));
				inspector.css('width', $(this).css('width'));
				inspector.css('height', $(this).css('height'));
				inspector.show();
			},function(){
				inspector.hide();
			});*/
		},
		/**
		* disable the inspector
		*/
		disableInspector: function(elements) {
			console.debug('disableInspector %o', elements);
			console.warn('TODO: Inspector');
			//TODO: Inspector
			/*elements.hover(function() {},function(){});
			$('#lwe-inspector').hide();*/
		},
		/**
		* marks all the editable elements
		*/
		markEditableElements: function() {
			console.debug('markEditableElements');
			with(lwe) {
				$.each(env.editable_text_elements, function(i, elmts) {
					$(elmts).not('.lwe-not-editable').not('.jGrowl').not(":empty").addClass('lwe-editable');
				});
			}
		},
		/**
		* unmarks all the editable elements
		*/
		unmarkEditableElements: function() {
			console.debug('unmarkEditableElements');
			$('.lwe-editable').removeClass('lwe-editable');
		},
		/**
		* marks all the draggable elements
		*/
		markDraggableElements: function() {
			console.debug('markDraggableElements');
			with(lwe) {
				$.each(env.draggable_elements, function(i, elmts) {
					$(elmts).not('.lwe-not-draggable').not('.jGrowl').addClass('lwe-draggable');
				});
			}
		},
		/**
		* unmarks all the draggable elements
		*/
		unmarkDraggableElements: function() {
			console.debug('unmarkDraggableElements');
			$('.lwe-draggable').removeClass('lwe-draggable').removeClass('ui-draggable');
		},
		/**
		* applies the inline editing effect to all marked editable elements
		*/
		applyEditableElements: function() {
			console.group('applyEditableElements');
			with(lwe.f) {
				$('.lwe-editable').editable(
					function(value, settings) { 
						var uid = getElementUniqueId($(this));
						lwe.history.add('edit-text', uid, value, this.revert);
						return(value);
					},
					{
						cssclass : 'lwe-editable-textarea',
						event : 'dblclick',
						type: 'autogrow',
						onblur: 'submit',
						autogrow: {
							lineHeight: 16,
							minHeight: 32
						}/*,
						id: $(this).attr('id'),
						classes: $(this).attr('class'),
						tagName: $(this).attr('tagName')*/
					}
				);
				/*$('img').editable(
					function(value, settings) { 
						//console.log(this, value, settings);
						return(value);
					},
					{
						type: 'ajaxupload',
						tooltip: 'Click to change the picture...',
						onblur: 'submit'
					}
				);*/
				deactivateLinks($('.lwe-editable'));
				enableInspector($('.lwe-editable'));
			}
			console.groupEnd();
		},
		/**
		* unapplies the inline editing effect to all marked editable elements
		*/
		unapplyEditableElements: function() {
			console.group('unapplyEditableElements');
			with(lwe.f) {
				$('.lwe-editable').each(function(i, elmt) {
					//TODO
				});
				console.warn('TODO: remove the editable effect');
				reactivateLinks($('.lwe-editable'));
				disableInspector($('.lwe-editable'));
			}
			console.groupEnd();
		},
		/**
		* applies the draggable effect to all marked draggable elements
		*/
		applyDraggableElements: function() {
			console.group('applyDraggableElements');
			with(lwe.f) {
				console.group('lwe-draggable objects list');
				$('.lwe-draggable').draggable({ /*handle: 'div'*/});
				console.groupEnd();
				deactivateLinks($('.lwe-draggable'));
				enableInspector($('.lwe-draggable'));
			}
			console.groupEnd();
		},
		/**
		* unapplies the draggable effect to all marked draggable elements
		*/
		unapplyDraggableElements: function() {
			console.group('unapplyDraggableElements');
			with(lwe.f) {
				$('.lwe-panel').remove();
				console.debug('removed the panels');
				reactivateLinks($('.lwe-draggable'));
				disableInspector($('.lwe-draggable'));
			}
			console.groupEnd();
		},
		/**
		* deactivate all links
		*/
		deactivateLinks: function(jQueryElmts) {
			console.group('deactivateLinks %o', jQueryElmts);
			jQueryElmts.not('.lwe-keep-link').each(function(i, elmt) {
				//console.log(i, elmt);
				var cur_href = elmt.getAttribute('href');
				if(cur_href!=lwe_undefined) {
					elmt.setAttribute('lwe-href', cur_href);
					elmt.setAttribute('href', 'javascript:void(0)');
				}
				var cur_onclick = elmt.getAttribute('onclick');
				if(cur_onclick!=lwe_undefined) {
					elmt.setAttribute('lwe-onclick', cur_onclick);
					elmt.setAttribute('onclick', 'void(0)');
				}
			});
			console.groupEnd();
		},
		/**
		* reactivate all links
		*/
		reactivateLinks: function(jQueryElmts) {
			console.group('reactivateLinks %o', jQueryElmts);
			jQueryElmts.not('.lwe-keep-link').each(function(i, elmt) {
				var cur_href = elmt.getAttribute('lwe-href');
				if(cur_href!=lwe_undefined) {
					elmt.setAttribute('href', cur_href);
					elmt.removeAttribute('lwe-href');
				}
				var cur_onclick = elmt.getAttribute('lwe-onclick');
				if(cur_onclick!=lwe_undefined) {
					elmt.setAttribute('onclick', cur_onclick);
					elmt.removeAttribute('lwe-onclick');
				}
			});
			console.groupEnd();
		},
		/**
		* waits until all necessary libs are ready to use
		*/
		wait_until_ready: function(fn) {
			console.debug('wait_until_ready');
			var is_jquery_ready = ((typeof($) == 'function') && (typeof($(document).createAppend) == 'function'));
			var is_jgrowl_ready = ((typeof($) == 'function') && (typeof($.jGrowl) == 'function'));
			var is_persist_ready = (typeof(Persist) == 'object');
			var is_ready = is_jquery_ready && is_jgrowl_ready && is_persist_ready;
			if(is_ready)
				fn();
			else
				setTimeout('lwe.f.wait_until_ready('+fn+')', 200);
		},
		/**
		* sets the loading picture (dis)appear
		*/
		set_loading: function(mode) {
			console.debug('set_loading', mode);
			if(mode) $('#lwe-loading').show();
			else $('#lwe-loading').hide();
		},
		/**
		* get the selector that makes jQuery select the specified element only
		* TODO: add the position information
		*/
		getElementUniqueId: function(element, no_dom) {
			console.debug('getElementUniqueId %o', element);
			with(lwe.f) {
				// get the element's tag name
				var tagName = element.get(0).tagName;
				console.debug('tagName %o', tagName);
				// does the element have an id ?
				var id = element.get(0).id;
				console.debug('id %o', id);
				if(id!=lwe_undefined && id.length>0 && isSelectorUnique(tagName+'#'+id+':eq('+getElementPositionRelativeToParent(element)+')')) {
					// the id is unique
					return tagName+'#'+id+':eq('+getElementPositionRelativeToParent(element)+')';
				}
				// does the element have some classes ?
				var classes = element.get(0).className;
				console.debug('classes %o', classes);
				//$('#lwe-history').attr('class')
				if(classes!=lwe_undefined) {
					classes = classes.replace(/lwe-[a-zA-Z\-]/g, '');
					classes = classes.replace(/  /g, ' ');
					var classes_str = '.'+classes.split(' ').join('.');
					console.debug('classes_str %o', classes_str);
					if(classes_str.length>1 && isSelectorUnique(tagName+classes_str+':eq('+getElementPositionRelativeToParent(element)+')')) {
						// the class is unique
						return tagName+classes_str+':eq('+getElementPositionRelativeToParent(element)+')';
					}
				}
				if(no_dom!=lwe_undefined && no_dom) {
					return tagName+':eq('+getElementPositionRelativeToParent(element)+')';
				} else {
					// we have to go one step up: let's get the parent's unique id
					return getElementUniqueIdInDOM(element);
				}
			}
		},
		/**
		* get the selector that makes jQuery select the specified element only (DOM edition)
		*/
		getElementUniqueIdInDOM: function(element) {
			console.debug('getElementUniqueIdInDOM %o', element);
			console.warn('TODO: could ben enhanced with %a', 'http://docs.jquery.com/Traversing/parents#expr');
			//TODO: Enhance with the 'parents' method
			var parent = element.parent();
			if(parent.size()==1 && parent.get(0).tagName!=lwe_undefined) {
				// there are still some parents
				return lwe.f.getElementUniqueIdInDOM(parent)+' > '+lwe.f.getElementUniqueId(element, true);
			} else {
				// this is the root
				return lwe.f.getElementUniqueId(element, true);
			}
		},
		/**
		* get the relative element position to its parent
		*/
		getElementPositionRelativeToParent: function(element) {
			console.debug('getElementPositionRelativeToParent %o', element);
			var parent = element.parent();
			// there is no parent => so it's the first element
			if(parent.get(0).tagName==lwe_undefined) {
				return 0;
			}
			element.addClass('lwe-dom-curr-elmt');
			// get the siblings with the same tagName
			var siblings = parent.children(element.get(0).tagName);
			var pos;
			for(pos=0; pos<siblings.size(); pos++) {
				var cur_elmt = siblings.get(pos);
				if(cur_elmt!=lwe_undefined && $(cur_elmt).hasClass('lwe-dom-curr-elmt'))
					break;
			}
			element.removeClass('lwe-dom-curr-elmt');
			return pos;
		},
		/**
		* does this selector refers to a unique element?
		*/
		isSelectorUnique: function(selector) {
			console.debug('isSelectorUnique %o', selector);
			if(selector!=lwe_undefined && selector.length>0) {
				return ($(selector).size()==1);
			}
			return false;
		}
	},
	/**
	* main panel helpers
	*/
	panel: {
		/**
		* functions
		*/
		f: {
			/**
			* initialize the lwe main panel
			*/
			create_main_panel: function() {
				console.debug('create_main_panel %o', 'lwe-main-panel');
				with(lwe.panel) {
					$(document.body).createAppend(
						'div', {id: 'lwe-main-panel', 'class': 'lwe-not-editable lwe-not-draggable'}, [
							'div', {id: 'lwe-main-panel-container', 'class': 'lwe-not-editable lwe-not-draggable'}, [
								'input', {id: 'lwe-undo', type: 'button', 'class': 'lwe-button lwe-not-editable lwe-not-draggable', alt: 'undo', title: 'Undo the last change', onclick: 'lwe.history.undo()'}, [],
								'input', {id: 'lwe-redo', type: 'button', 'class': 'lwe-button lwe-not-editable lwe-not-draggable', alt: 'redo', title: 'Redo the last change', onclick: 'lwe.history.redo()'}, [],
							  'input', {id: 'lwe-save', type: 'button', 'class': 'lwe-button lwe-not-editable lwe-not-draggable', alt: 'save', title: 'Save the current state', onclick: 'lwe.history.save()'}, [],
								'input', {id: 'lwe-load', type: 'button', 'class': 'lwe-button lwe-not-editable lwe-not-draggable', alt: 'load', title: 'Load the persisted state', onclick: 'lwe.history.load()'}, [],
								/*'input', {id: 'lwe-delete', type: 'button', 'class': 'lwe-button lwe-not-editable lwe-not-draggable', alt: 'delete', title: 'Delete the the current element', onclick: 'lwe.action.remove(this)'}, [],*/
								'span', {'id': 'lwe-title', 'class': 'lwe-not-editable lwe-not-draggable', title: 'Live Website Editor'}, 'LWE v'+lwe.version
							]
						]
					);
					// add the element inspector
					$(document.body).createAppend(
						'div', {id: 'lwe-inspector', 'class': 'lwe-not-editable lwe-not-draggable'}, []
					);
					// update the state of each history button
					with(lwe.history.f) {
						updateButtons();
					}
					/*$('#lwe-loading').hide();*/
				}
			  if($.browser.msie) {
			    $('#jGrowl').css('position', 'absolute');
		    }
			},
			/**
			* removes the lwe main panel
			*/
			remove_main_panel: function() {
				console.debug('remove_main_panel');
				$('#lwe-main-panel').remove();
			}
		},
		/**
		* show the main panel
		*/
		show: function() {
			//console.debug('show');
			$('#lwe-main-panel-container').show("normal");
			$('#lwe-hide-panel').show("normal");
			$('#lwe-name').show("normal");
			//setTimeout(function() { $('#lwe-name').show("fast") }, 300);
		},
		/**
		* hide the main panel
		*/
		hide: function() {
			//console.debug('hide');
			$('#lwe-main-panel-container').hide("slow");
			$('#lwe-hide-panel').hide("slow");
			$('#lwe-name').hide();
			//setTimeout(function() { $('#lwe-name').hide() }, 1000);
		}
	},
	/**
	* list of the actions that can be performed with elements of a certain class
	*/
	action: {
		/**
		* delete action for elements of class 'lwe-draggable'
		*/
		remove: function(elmt) {
			console.debug('remove');
			var element = $(elmt.parentNode.parentNode);
			var uid = lwe.f.getElementUniqueId(element);
			lwe.history.add('delete', uid, element.get(0).tagName+' tag');
			element.hide();
		},
		/**
		* drag action for elements of class 'lwe-draggable'
		*/
		drag: function(elmt) {
			console.debug('drag');
			var element = $(elmt);
			var uid = lwe.f.getElementUniqueId(element);
			var new_data = JSON.stringify( {x: element.css('left'), y: element.css('top')} );
			var old_data = JSON.stringify( {x: element.css('left'), y: element.css('top')} );
			console.warn('TODO: get the correct old value');
			//TODO
			lwe.history.add('drag', uid, new_data, old_data);
		}
	},
	/**
	* switch the editing mode
	*/
	switch_mode: function(mode) {
		console.group('lwe > switch mode', mode);
		with(lwe.f) {
			set_loading(true);
			if(mode=='editing') {
			  notification('<b>This webpage is now editable!</b>');
			  // text editing activation
				markEditableElements();
				applyEditableElements();
				// box editing activation
				//markDraggableElements();
				//applyDraggableElements();
			} else {
			  notification('This webpage is no longer editable');
			  // text editing deactivation
				unapplyEditableElements();
				unmarkEditableElements();
				// box editing deactivation
				unapplyDraggableElements();
				unmarkDraggableElements();
			}
		  lwe.env.current_mode = mode;
			set_loading(false);
		}
		console.groupEnd();
	},
	/**
	* initialize lwe by injecting its mandatory libs then creating its main panel
	*/
	start: function() {
		console.group('lwe > start');
		with(lwe.f) {
			var path = 'http://static.t4ke.com/projects/lwe/current/';
			//var path = 'http://localhost/lwe/';
			addCSS(path + 'css/lwe.css');
			addCSS(path + 'css/jquery.jgrowl.css');
			path = 'http://lwe.googlecode.com/svn/trunk/';
			addScript(path + 'lib/jquery-1.3.min.js');
			addScript(path + 'lib/jquery-ui-personalized-1.6rc4.packed.js');
			addScript(path + 'lib/jquery.jeditable.js');
			addScript(path + 'lib/jquery.jeditable.autogrow.js');
			addScript(path + 'lib/jquery.autogrow.js');
			addScript(path + 'lib/jquery.jeditable.ajaxupload.js');
			addScript(path + 'lib/jquery.ajaxfileupload.js');
			addScript(path + 'lib/jquery.flydom-3.1.1.js');
			addScript(path + 'lib/jquery.jgrowl.js');
			addScript(path + 'lib/json2.js');
			addScript(path + 'lib/persist.js');
			wait_until_ready(lwe.start_when_ready);
		}
		console.groupEnd();
	},
	/**
	* when ready, creates the main panel and switches to 'editable mode'
	*/
	start_when_ready: function() {
		console.group('lwe > start_when_ready');
		with(lwe) {
  		panel.f.create_main_panel();
  		switch_mode('editing');
	  }
		console.groupEnd();
	},
	/**
	* quits lwe by switching to the inactive mode and by removing the main panel
	*/
	stop: function() {
		console.group('lwe > quit');
		with(lwe) {
			switch_mode('none');
			panel.f.remove_main_panel();
			f.removeAdditionalElements();
		}
		lwe = lwe_undefined;
		console.groupEnd();
	}
}

// if firebug isn't active, let's use lwe's console
if(!lwe.env.firebug_on) {
	window.console = {};
	window.console.log = function() {lwe.console.add('log', arguments)}
	window.console.debug = function() {lwe.console.add('debug', arguments)}
	window.console.info = function() {lwe.console.add('info', arguments)}
	window.console.warn = function() {lwe.console.add('warn', arguments)}
	window.console.error = function() {lwe.console.add('error', arguments)}
	window.console.assert = function() {lwe.console.add('assert', arguments)}
	window.console.dir = function() {lwe.console.add('dir', arguments)}
	window.console.dirxml = function() {lwe.console.add('dirxml', arguments)}
	window.console.group = function() {lwe.console.add('group', arguments)}
	window.console.groupEnd = function() {/*lwe.console.add('groupEnd', arguments);*/}
	window.console.time = function() {lwe.console.add('time', arguments)}
	window.console.timeEnd = function() {/*lwe.console.add('timeEnd', arguments);*/}
	window.console.count = function() {lwe.console.add('count', arguments)}
	window.console.trace = function() {lwe.console.add('trace', arguments)}
	window.console.profile = function() {lwe.console.add('profile', arguments)}
	window.console.profileEnd = function() {/*lwe.console.add('profileEnd', arguments)*/}
	//TODO could be enhanced
	//var names = ['log', 'debug', 'info', 'warn', 'error', 'assert', 'dir', 'dirxml',
	//	'group', 'groupEnd', 'time', 'timeEnd', 'count', 'trace', 'profile', 'profileEnd'];
	//for (var i = 0; i < names.length; ++i)
	//	window.console[names[i]] = function() {lwe.console.add('log', arguments[0]);}
}

lwe.start();
