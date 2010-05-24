// Original idea : Steven Shand
// http://www.junlu.com/msg/39644.html

(function($) {
	$.fn.xpathhelper = {
		generateJDOMXPath(element, type, includeIndices) {
			var path;
			alert(node, type, includeIndices);
			if (type=='Attribute') {
				var attribute = node;
				return generateJDOMXPath(attribute.getParent()) + '/@@' + attribute.getName();
			} else if (typeof(node)=='Element') {
				var element = node;
				var parent = element.getParent();
				if (parent == null || element.isRootElement())
					return '/' + element.getName();
				var namespace = parent.getNamespace();
				path = generateJDOMXPath(parent) + '/' + element.getName();
				var siblings = parent.getChildren(element.getName(), namespace);
				if (siblings.size() > 1 && includeIndices)
					path += '[' + ( siblings.indexOf(element) + 1 ) + ']';
			}
			return path;
		}
	}
})(jQuery);
