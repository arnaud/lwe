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

var lwe_undefined;
var lwe = {
	/**
	* environment variables and constants
	*/
	env: {
		current_mode: 'none',
		debug_mode: true,
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
	* Activate live editing on the current page
	*/
	activate: function() {
		with(lwe.f) {
			markEditableElements();
			applyEditableElements();
		}
		//TODO
	},
	/**
	* Deactivate live editing on the current page
	*/
	deactivate: function() {
		//TODO
	},
	/**
	* History
	*/
	history: {
		/**
		* Undo the last action
		*/
		undo: function() {
			console.log("undo");
		},
		/**
		* Redo the last action
		*/
		redo: function() {
			console.log("redo");
		},
		/**
		* Save the last action
		*/
		save: function() {
			console.log("save");
		},
		/**
		* Load the last action
		*/
		load: function() {
			console.log("load");
    	document.getElementById('lwe-title').innerHTML = localStorage.urls;
		},
		/**
		* History functions
		*/
		f: {
			redoTextEdit: function(element, new_data) {
				console.log('redoTextEdit', element, new_data);
				$(element).effect('highlight');
				console.log($(element));
				$(element).html(new_data);
			},
		}
	},
	/**
	* Utils
	*/
	f: {
		/**
		* marks all the editable elements
		*/
		markEditableElements: function() {
			with(lwe) {
				$.each(env.editable_text_elements, function(i, elmts) {
					$(elmts).not('.lwe-not-editable').not(":empty").addClass('lwe-editable');
				});
			}
		},
		/**
		* unmarks all the editable elements
		*/
		unmarkEditableElements: function() {
			$('.lwe-editable').removeClass('lwe-editable');
		},
		/**
		* marks all the draggable elements
		*/
		markDraggableElements: function() {
			with(lwe) {
				$.each(env.draggable_elements, function(i, elmts) {
					$(elmts).not('.lwe-not-draggable').addClass('lwe-draggable');
				});
			}
		},
		/**
		* unmarks all the draggable elements
		*/
		unmarkDraggableElements: function() {
			$('.lwe-draggable').removeClass('lwe-draggable').removeClass('ui-draggable');
		},
		/**
		* applies the inline editing effect to all marked editable elements
		*/
		applyEditableElements: function() {
			with(lwe.f) {
				$('.lwe-editable').editable(
					function(value, settings) { 
						var uid = getElementUniqueId($(this));
						port.postMessage({action: "edit-text", uid: uid, new_value: value, old_value: this.revert});
						//lwe.history.add('edit-text', uid, value, this.revert);
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
			}
		},
		/**
		* unapplies the inline editing effect to all marked editable elements
		*/
		unapplyEditableElements: function() {
			with(lwe.f) {
				$('.lwe-editable').each(function(i, elmt) {
					//TODO
				});
				console.warn('TODO: remove the editable effect');
				reactivateLinks($('.lwe-editable'));
			}
		},
		/**
		* applies the draggable effect to all marked draggable elements
		*/
		applyDraggableElements: function() {
			with(lwe.f) {
				console.group('lwe-draggable objects list');
				$('.lwe-draggable').draggable({ /*handle: 'div'*/});
				console.groupEnd();
				deactivateLinks($('.lwe-draggable'));
			}
		},
		/**
		* unapplies the draggable effect to all marked draggable elements
		*/
		unapplyDraggableElements: function() {
			with(lwe.f) {
				$('.lwe-panel').remove();
				console.debug('removed the panels');
				reactivateLinks($('.lwe-draggable'));
			}
		},
		/**
		* deactivate all links
		*/
		deactivateLinks: function(jQueryElmts) {
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
		},
		/**
		* reactivate all links
		*/
		reactivateLinks: function(jQueryElmts) {
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
		},
		/**
		* get the selector that makes jQuery select the specified element only
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
				if(id!=lwe_undefined && id.length>0 && isSelectorUnique(tagName+'#'+id+':eq('+getElementPositionRelativeToParent(element, "")+')')) {
					// the id is unique
					return tagName+'#'+id+':eq('+getElementPositionRelativeToParent(element, "")+')';
				}
				// does the element have some classes ?
				var classes = element.get(0).className;
				console.debug('classes %o', classes);
				//$('#lwe-history').attr('class')
				if(classes!=lwe_undefined) {
					classes = classes.replace(/lwe-[a-zA-Z\-]+/g, '');
					classes = classes.replace(/  /g, ' ');
					classes = $.trim(classes);
					var classes_str = '.'+classes.split(' ').join('.');
					console.debug('classes_str %o', classes_str);
					if(classes_str.length>1 && isSelectorUnique(tagName+classes_str+':eq('+getElementPositionRelativeToParent(element, classes_str)+')')) {
						// the class is unique
						return tagName+classes_str+':eq('+getElementPositionRelativeToParent(element, classes_str)+')';
					}
				}
				if(no_dom!=lwe_undefined && no_dom) {
					return tagName+':eq('+getElementPositionRelativeToParent(element, "")+')';
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
			console.warn('TODO: could be enhanced with %a', 'http://docs.jquery.com/Traversing/parents#expr');
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
		getElementPositionRelativeToParent: function(element, options) {
			console.debug('getElementPositionRelativeToParent %o %o', element, options);
			var parent = element.parent();
			// there is no parent => so it's the first element
			if(parent.get(0).tagName==lwe_undefined) {
				return 0;
			}
			element.addClass('lwe-dom-curr-elmt');
			// get the siblings with the same tagName
			var siblings = parent.children(element.get(0).tagName+options);
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
	}
}
