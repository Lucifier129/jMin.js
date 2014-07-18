;(function(window, undefined) {
	var doc = window.document,
		type1 = {},
		type2 = [],
		type3 = '',
		noop = function() {},
		rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,
		toStr = type1.toString,
		hasOwn = type1.hasOwnProperty,
		slice = type2.slice,
		push = type2.push,
		types = {};

	"Obejct Array String Number Function Blooean Date Error RegExp".replace(/[^ ]+/g, function(name) {
		types['[object ' + name + ']'] = name.toLowerCase();
	});

	var tools = {
		type: function(obj) {
			if (obj == null) {
				return String(obj);
			}
			return typeof obj === 'object' || typeof obj === 'function' ?
				types[toStr.call(obj)] || 'object' :
				typeof obj;
		},
		trim: type3.trim ? function(str) {
			if (str == null) {
				return '';
			}
			return str.trim();
		} : function(str) {
			if (str == null) {
				return '';
			}
			return str.replace(rtrim, '');
		},
		inArray: type2.indexOf ? function(arr, item, i) {
			if (tools.type(arr) !== 'array') {
				return -1
			}
				return arr.indexOf(item, i);
		} : function(arr, item, i) {
			if (tools.type(arr) !== 'array') {
				return -1
			}
			var len = arr.length;
			i = i ? i < 0 ? Math.max(0, len + i) : i : 0;
			for (; i < len; i += 1) {
				if (i in arr && arr[i] === item) {
					return i;
				}
			}
			return -1;
		},
		each: function(obj, callback) {
			var type = tools.type(obj),
				key,
				len,
				i;
			if (type === 'object') {
				for (key in obj) {
					callback.call(obj, key, obj[key]);
				}
			} else if (type === 'array') {
				for (i = 0, len = obj.length; i < len; i += 1) {
					callback.call(obj, i, obj[i]);
				}
			}
			return obj;
		},
		extend: function() {
			var args = arguments,
				len = args.length,
				i = 1,
				key,
				target = args[0],
				src;
			for (; i < len; i += 1) {
				src = args[i];
				for (key in src) {
					target[key] = src[key];
				}
			}
			return target;
		}
	};

	var dom = {
		getElem: function(selector, context) {
			var tag,
				elem,
				_elem,
				len,
				l,
				i;
			if (selector == null) {
				return null;
			}

			if (selector.nodeName) {
				return [selector];
			}

			if (tools.type(selector) === 'array') {
				return selector;
			}

			if (tools.type(selector) === 'string') {
				if (selector.indexOf('#') !== -1) {
					return doc.getElementById(selector.split('#')[1]);
				}

				if (selector.indexOf('.') !== -1) {
					if (doc.querySelectorAll) {
						_elem = (context || doc).querySelectorAll(selector);
					} else {
						selector = selector.split('.');
						selector[0] = tools.trim(selector[0]);
						selector[1] = tools.trim(selector[1]);
						tag = (context || doc).getElementsByTagName(selector[0] || '*'),
							_elem = [];
						for (var i = 0, l = tag.length; i < l; i += 1) {
							tag[i].className.indexOf(selector[1]) !== -1 && (_elem.push(tag[i]));
						}
						console.log(_elem);
					}
				} else {
					_elem = (context || doc).getElementsByTagName(selector);
				}
				len = _elem.length
				if (len) {
					elem = [];
					for (i = 0; i < len; i += 1) {
						elem[i] = _elem[i];
					}
				}
				return elem || null;
			}
		},
		append: function(child) {
			if (child.nodeName) {
				return this.appendChild(child);
			}
		},
		prepend: function(child) {
			if (child.nodeName) {
				return this.insertBefore(child, this.firstChild);
			}
		},
		before: function(sibling) {
			var parent = this.parentNode;
			if (parent) {
				parent.insertBefore(sibling, this);
			}
		},
		after: function(sibling) {
			var parent = this.parentNode;
			if (parent) {
				parent.insertBefore(sibling, this.nextSibling);
			}
		},
		remove: function() {
			return this.parentNode.removeChild(this);
		},
		next: function() {
			var next = this.nextSibling;
			while(next.nodeName.indexOf('text') !== -1) {
				next = next.nextSibling;
			}
			return next;
		},
		prev: function() {
			var prev = this.previousSibling;
			while(prev.nodeName.indexOf('text') !== -1) {
				prev = prev.previousSibling;
			}
			return prev;
		},
		html: function() {
			var html = arguments[0];
			if (html) {
				this.innerHTML = html;
			} else {
				return this.innerHTML;
			}
		},
		index: function() {
			var i = 0,
				prev = this.previousSibling;
			while(prev) {
				if (prev.nodeName.indexOf('text') === -1) {
					i += 1;
				}
				prev = prev.previousSibling;
			}
			return i;
		}
	};

	var css = {
		getStyle: 'getComputedStyle' in window ? function(prop) {
			return window.getComputedStyle(this, null)[prop];
		} : function(prop) {
			return this.currentStyle[prop];
		},
		setStyle: function(prop, value) {
			this.style[prop] = value;
		},
		addClass: function(name) {
			var original = this.className.split(' ');
			original.push(name);
			this.className = tools.trim(original.join(' '));
		},
		removeClass: function(name) {
			var original = this.className.split(' '),
				i = tools.inArray(original, name);
			i !== -1 && original.splice(i, 1);
			this.className = tools.trim(original.join(' '));
		}
	};

	var events = {
		addEvent: doc.addEventListener ? function(type, callback) {
			return this.addEventListener(type, callback, false);
		} : function(type, callback) {
			return this.attachEvent('on' + type, callback);
		},
		removeEvent: doc.removeEventListener ? function(type, callback) {
			return this.removeEventListener(type, callback, false);
		} : function(type, callback) {
			console.log(type);
			return this.detachEvent('on' + type, callback);
		}
	};

	function jMin(selector, context) {
		return new jMin.init(selector, context);
	};

	jMin.init = function(selector, context) {

		this.elem = dom.getElem(selector, context);
	}

	jMin.fn = jMin.init.prototype = jMin.prototype = {
		constructor: jMin
	};

	tools.extend(jMin, tools);

	jMin.extend(jMin.fn, {
		each: function(callback) {
			jMin.each(this.elem, callback);
			return this;
		},
		append: function(child) {
			return this.each(function(i, elem) {
				dom.append.call(elem, child);
			});
		},
		prepend: function(child) {
			return this.each(function(i, elem) {
				dom.prepend.call(elem, child);
			});
		},
		after: function(sibling) {
			return this.each(function(i, elem) {
				dom.after.call(elem, sibling);
			});
		},
		before: function(sibling) {
			return this.each(function(i, elem) {
				dom.before.call(elem, sibling);
			});
		},
		remove: function() {
			return this.each(function(i, elem) {
				dom.remove.call(elem);
			});
		},
		index: function() {
			return dom.index.call(this.elem[0]);
		},
		eq: function(i) {
			return $(this.elem[i < 0 ? i + this.elem.length : i]);
		},
		next: function() {
			var elem = [],
				len = this.elem.length,
				i = 0;
			for (; i < len; i += 1) {
				elem.push(dom.next.call(this.elem[i]));
			}
			return $(elem);
		},
		prev: function() {
			var elem = [],
				len = this.elem.length,
				i = 0;
			for (; i < len; i += 1) {
				elem.push(dom.prev.call(this.elem[i]));
			}
			return $(elem);
		},
		html: function() {
			var args= arguments;

			return !args.length ? dom.html.call(this.elem[0]) : this.each(function(i, elem) {
					dom.html.call(elem, args[0]);
				});
		},
		on: function(type, callback) {
			this.each(function(i, elem) {
				elem.handler = elem.handler || {};
				elem.handler[type] = callback;
				events.addEvent.call(elem, type, elem.handler[type]);
			});
			return this;
		},
		off: function(type) {
			this.each(function(i, elem) {
				events.removeEvent.call(elem, type, elem.handler[type]);
			});
			return this;
		},
		css: function(prop, value) {
			if (value) {
				this.each(function(i, elem) {
					css.setStyle.call(elem, prop, value);
				});
			} else if (prop) {
				if (tools.type(prop) === 'object') {
					for (var key in prop) {
						if (prop[key] in this.elem[0].style) {
							this.css(key, prop[key]);
						}
					}
					return this;
				} else {
					return css.getStyle.call(this.elem[0], prop);
				}
			}
		},
		addClass: function(name) {
			this.each(function(i, elem) {
				css.addClass.call(elem, name);
			});
			return this;
		},
		removeClass: function(name) {
			this.each(function(i, elem) {
				css.removeClass.call(elem, name);
			});
			return this;
		}
	});

	window.$ = jMin;

	var div = $('div', $('.list').elem[0]);
	div.addClass('on').on('click', function(e) {
		e = e || window.event;
		alert(e.type);
	});

	console.log(div.eq(3).index());
	setTimeout(function() {
		/*div.removeClass('on');*/
		/*div.remove();*/
		div.off('click').html('test word');
	},1000);
}(window));
