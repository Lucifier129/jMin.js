(function(document) {
	'use strict';
	var eventType = 'ontouchstart' in document ? {
			start: 'touchstart',
			move: 'touchmove',
			end: 'touchend'
		} : {
			start: 'mousedown',
			move: 'mousemove',
			end: 'mouseup'
		},
		getCoor = function(e) {
			getCoor = 'touches' in e ? function(e) {
				var touch = e.touches[0];
				return {
					x: touch.clientX,
					y: touch.clientY
				}
			} : function(e) {
				return {
					x: e.clientX,
					y: e.clientY
				};
			};
			return getCoor(e);
		},
		swipe = function(elem, callback) {
			var data = {
					start: {},
					move: {}
				},
				fn = {
					start: function(e) {
						e.preventDefault();
						var client = getCoor(e);
						data.start.x = data.move.x = client.x;
						data.start.y = data.move.y = client.y;
						data.start.timeStamp = e.timeStamp;
						data.start.begin = true;
						data.start.dir = function(y, x) {
							var dir = Math.atan2(Math.abs(y), Math.abs(x)) * (180 / Math.PI);
							data.start.dir = function() {
								return dir;
							};
							return dir;
						};
						'start' in callback && callback.start.call(this, e, data.start);
						setImmediate(function() {
							document.addEventListener(eventType.end, fn.end, false);
							document.addEventListener(eventType.move, fn.move, false);
						});
					},
					move: function(e) {
						e.preventDefault();
						if (!data.start.begin) {
							return;
						}
						var client = getCoor(e);
						data.move.dir = data.start.dir(client.y - data.start.y, client.x - data.start.x);
						data.move.x = client.x - data.move.x;
						data.move.y = client.y - data.move.y;
						'move' in callback && callback.move.call(this, e, data.move);
						data.move.x = client.x;
						data.move.y = client.y;
					},
					end: function(e) {
						e.preventDefault();
						document.removeEventListener(eventType.move, fn.move, false);
						document.removeEventListener(eventType.end, fn.end, false);
						data.start.begin = false;
						data.end = {
							x: data.move.x - data.start.x,
							y: data.move.y - data.start.y,
							t: e.timeStamp - data.start.timeStamp,
							dir: {},
							stop: false
						};
						if (data.end.t < 220 && Math.max(Math.abs(data.end.x), Math.abs(data.end.y)) > 10) {
							if (data.move.dir > 30) {
								data.end.dir[data.end.y > 0 ? 'down' : 'up'] = 1;
							} else {
								data.end.dir[data.end.x > 0 ? 'right' : 'left'] = 1;
							}
							for (var prop in data.end.dir) {
								if (prop in callback) {
									data.end.stop = true;
									callback[prop].call(this, e, data.end);
								}
							}
							return;
						} else if (data.end.t < 200 && Math.max(Math.abs(data.end.x), Math.abs(data.end.y)) < 10) {
							'tap' in callback && callback.tap.call(this, e, data);
							return;
						}
						!data.end.stop && 'end' in callback && callback.end.call(this, e, data.end, data.move);
					}
				}

			elem.addEventListener(eventType.start, fn.start, false);
		},
		setImmediate = typeof window.setImmediate === "function" ? function(fn) {
			window.setImmediate(fn)
		} : function(fn) {
			window.setTimeout(fn, 0)
		};

	var obj = {},
		arr = [],
		str = '',
		func = function() {},
		toStr = obj.toString,
		slice = arr.slice,
		push = arr.push,
		shift = arr.shift,
		parseF = parseFloat,
		parseI = parseInt,
		readyRE = /complete|loaded|interactive/;
	if (String.prototype.trim === undefined) {
		String.prototype.trim = function() {
			return this.replace(/^\s+|\s+$/g, '')
		};
	}

	function jMobile(selector, context) {
		return new jMobile.init(selector, context);
	}

	jMobile.swipe = swipe;

	jMobile.extend = function(target) {
		var args = slice.call(arguments, 1),
			len = args.length,
			i = 0,
			src,
			key;
		for (; i < len; i += 1) {
			src = args[i];
			for (key in src) {
				src.hasOwnProperty(key) && (target[key] = src[key]);
			}
		}
		return target;
	};

	jMobile.each = function(obj, callback) {
		var type = toStr.call(obj);
		if (type.indexOf('Array') !== -1) {
			for (var i = 0, len = obj.length; i < len; i += 1) {
				callback.call(obj, i, obj[i]);
			}
		} else if (type.indexOf('Object') !== -1) {
			for (var key in obj) {
				callback.call(obj, key, obj[key]);
			}
		}
	};

	jMobile.pushStack = function(target) {
		var args = slice.call(arguments, 1),
			len = args.length,
			i = 0;
		for (; i < len; i += 1) {
			push.apply(target, args[i]);
		}
		return target;
	};

	jMobile.camelCase = function(str) {
		return str.replace(/-+(.)?/g, function(match, chr) {
			return chr ? chr.toUpperCase() : ''
		});
	};

	jMobile.eventType = eventType;

	jMobile.init = function(selector, context) {
		var type = toStr.call(selector),
			elems,
			len,
			i;

		if (type.indexOf('String') !== -1) {

			if (selector.indexOf('#') === 0) {
				this[0] = document.getElementById(selector.split('#')[1]);
				this.length = 1;
				return this;
			}

			if (selector.indexOf('.') !== -1) {
				elems = [];
				push.apply(elems, (context || document).querySelectorAll(selector));
			}
		}

		if (type.indexOf('Array') !== -1) {
			elems = selector;
		}

		if (type.indexOf('Function') !== -1) {
			return $.fn.ready(selector);
		}

		if (selector.nodeName) {
			this[0] = selector;
			this.length = 1;
			return this;
		}

		if (selector.jMobile) {
			return selector;
		}

		len = this.length = elems.length;
		i = 0;
		for (; i < len; i += 1) {
			this[i] = elems[i];
		}
	};

	jMobile.fn = jMobile.init.prototype = jMobile.prototype = {
		jMobile: '0.1.0',
		each: function(callback) {
			var len = this.length,
				i = 0;
			for (; i < len; i += 1) {
				callback.call(this[i], i, this[i]);
			}
			return this;
		},
		ready: function(callback) {
			if (readyRE.test(document.readyState)) callback($)
			else document.addEventListener('DOMContentLoaded', function() {
				callback($)
			}, false)
			return this
		},
		add: function(item) {
			return $.pushStack(Object.create($.fn), this, 'jMobile' in item ? item : $(item));
		},
		eq: function(i) {
			return $.pushStack(Object.create($.fn), [this[i < 0 ? i + this.length : i]]);
		},
		slice: function(a, b) {
			a = a || 0;
			b = b || this.length;
			return $.pushStack(Object.create($.fn), slice.apply(this, [a < 0 ? a + this.length : a, b]));
		}
	};

	jMobile.extend(jMobile.fn, {
		remove: function() {
			return this.each(function(i) {
				this.parentNode.removeChild(this);
			});
		},
		append: function(node) {
			if (node.nodeName) {
				this[0].appendChild(node);
			} else if ('jMobile' in node) {
				var parent = this[0];
				node.each(function() {
					parent.appendChild(this);
				});
			}
			return this;
		},
		prepend: function(node) {
			var first = this[0].firstChild;
			if (node.nodeName) {
				this[0].insertBefore(node, first);
			} else if ('jMobile' in node) {
				var parent = this[0];
				node.each(function() {
					parent.insertBefore(this, first);
				});
			}
			return this;
		},
		before: function(node) {
			var target = this[0],
				parent = target.parentNode;
			node.nodeName ? parent.insertBefore(node, target) : node.each(function() {
				parent.insertBefore(this, target);
			});
			return this;
		},
		after: function(node) {
			var target = this[0].nextSibling,
				parent = target.parentNode;
			if (target.nodeName.indexOf('text') !== -1) {
				target = target.nextSibling;
			}
			node.nodeName ? parent.insertBefore(node, target) : node.each(function() {
				parent.insertBefore(this, target);
			});
			return this;
		},
		clone: function() {
			var clone = [];
			this.each(function() {
				clone.push(this.cloneNode(true));
			});
			return $.pushStack(Object.create($.fn), clone);
		},
		index: function() {
			var target = this[0],
				prev = target.previousSibling,
				i = 0;
			while (prev.previousSibling) {
				prev.nodeName.indexOf('text') !== -1 && (i += 1);
				prev = prev.previousSibling;
			}
			return i;
		},
		find: function(selector) {
			var elemArr = [];
			this.each(function() {
				push.apply(elemArr, this.querySelectorAll(selector));
			});
			return $.pushStack(Object.create($.fn), elemArr);
		},
		siblings: function(selector) {
			var self = this[0],
				children = $(self.parentNode).children(selector),
				siblings = [];
			children.each(function() {
				this !== self && siblings.push(this);
			});
			return $.pushStack(Object.create($.fn), siblings);
		},
		parent: function() {
			var ret = [];
			this.each(function() {
				var parent = this.parentNode;
				parent && ret.push(parent);
			});
			return $.pushStack(Object.create($.fn), ret);
		},
		children: function(selector) {
			var ret = Object.create($.fn);
			this.each(function() {
				var children = slice.call(this.children),
					childList,
					i;
				if (selector) {
					childList = [];
					if (selector.indexOf('.') !== -1) {
						selector = selector.split('.')[1];
						for (i = children.length - 1; i >= 0; i--) {
							children[i].className.indexOf(selector) !== -1 && childList.push(children[i]);
						};
					} else {
						selector = selector.toUpperCase();
						for (i = children.length - 1; i >= 0; i--) {
							children[i].nodeName === selector && childList.push(children[i]);
						};
					}
					childList.reverse();
				} else {
					childList = children;
				}
				$.pushStack(ret, childList);
			});
			return ret;
		}
	});

	var nextTick = 'requestAnimationFrame' in window ? requestAnimationFrame : function(callback) {
			setTimeout(callback, 4);
		},
		filter = arr.filter,
		uniq = function(array) {
			return filter.call(array, function(item, idx) {
				return array.indexOf(item) == idx
			})
		};
	jMobile.nextTick = nextTick;
	jMobile.uniq = uniq;

	jMobile.extend(jMobile.fn, {
		css: function(prop, value) {
			if (toStr.call(prop) === "[object Object]") {
				for (var key in prop) {
					this.each(function() {
						this.style[key] = prop[key];
					});
				}
				return this;
			}
			return value ? this.each(function() {
				prop in this.style && (this.style[prop] = value);
			}) : getComputedStyle(this[0], null)[prop];
		},
		addClass: function() {
			var args = slice.call(arguments);
			return this.each(function() {
				this.className = uniq(this.className.split(/\s+/g).concat(args)).join(' ');
			});
		},
		removeClass: function() {
			var args = slice.call(arguments);
			return this.each(function() {
				var classList = this.className.split(/\s+/g);
				for (var i = classList.length - 1; i >= 0; i--) {
					for (var j = args.length - 1; j >= 0; j--) {
						args[j] === classList[i] && classList.splice(i, 1);
					}
				};
				this.className = classList.join(' ');
			});
		},
		hasClass: function(className) {
			var target = this[0],
				classList = target.className.split(/\s+/g);
			for (var i = classList.length - 1; i >= 0; i--) {
				if (classList[i] === className) {
					return true;
				}
			};
			return false;
		},
		offset: function() {
			var target = this[0],
				offsetParent = target.offsetParent,
				ret = {
					top: target.offsetTop,
					left: target.offsetLeft
				};
			while (offsetParent) {
				ret.top += offsetParent.offsetTop;
				ret.left += offsetParent.offsetLeft;
				offsetParent = offsetParent.offsetParent;
			}
			return ret;
		},
		show: function() {
			return this.each(function() {
				this.style.display = 'block';
			});
		},
		hide: function() {
			return this.each(function() {
				this.style.display = 'none';
			});
		},
		animate: function(propObj, speed, callback) {
			var propArr = [],
				start = +new Date(),
				ratio;
			speed = speed || 300;
			if (typeof speed === 'function') {
				callback = speed;
				speed = 300;
			}
			this.each(function(i) {
				var obj = propArr[i] = {};
				for (var prop in propObj) {
					obj[prop] = parseF(getComputedStyle(this, null)[prop], 10);
				}
				obj.overflow = getComputedStyle(this, null).overflow;
				this.style.overflow = 'hidden';
			});
			var self = this;

			function anim() {
				ratio = (+new Date() - start) / speed;
				for (var prop in propObj) {
					if (ratio < 1) {
						self.each(function(i) {
							this.style[prop] = propArr[i][prop] + propObj[prop] * ratio + 'px';
						});
						nextTick(anim);
					} else {
						self.each(function(i) {
							this.style.overflow = propArr.overflow;
							this.style[prop] = propArr[i][prop] + propObj[prop] + 'px';
							callback && callback.call(this);
						});
					}
				}
			}
			anim();
		}
	});

	jMobile.event = {
		uuid: [],
		on: function(elem, type, selector, callback) {
			elem.evtId = 'evtId' in elem ? elem.evtId : this.uuid.length;
			this.uuid[elem.evtId] = this.uuid[elem.evtId] || {};
			var callbacks = this.uuid[elem.evtId],
				nameSpace;
			type = type.split('.');
			nameSpace = type.join('-');
			if (selector) {
				selector = elem.querySelectorAll(selector);
				callbacks[nameSpace] = function(e) {
					for (var i = selector.length - 1; i >= 0; i--) {
						selector[i] === e.target && callback.call(e.target, e);
					};
				}
			} else {
				callbacks[nameSpace] = callback;
			}

			elem.addEventListener(type[0], callbacks[nameSpace], false);
		},
		off: function(elem, type) {
			var evtId,
				callbacks,
				index,
				key;
			if (!('evtId' in elem)) {
				return;
			}
			evtId = elem.evtId;
			callbacks = this.uuid[evtId];
			index = type.indexOf('.');
			if (index !== -1) {
				type = type.split('.');
				if (index === 0) {
					for (key in callbacks) {
						key = key.split('-');
						key[1] === type[1] && elem.removeEventListener(key[0], callbacks[key.join('-')], false);
					}
				} else {
					elem.removeEventListener(type[0], callbacks[type.join('-')], false);
				}
			} else {
				for (key in callbacks) {
					key.indexOf(type) !== -1 && elem.removeEventListener(type, callbacks[key], false);
				}
			}
		}
	};

	jMobile.extend(jMobile.fn, {
		on: function(type, selector, callback) {
			if (typeof selector === 'function') {
				callback = selector;
				selector = void 0;
			} else if (toStr.call(type) === "[object Object]") {
				for (var key in type) {
					this.each(function() {
						$.event.on(this, key, void 0, type[key]);
					});
				}
				return this;
			}
			return this.each(function() {
				$.event.on(this, type, selector, callback);
			});
		},
		off: function() {
			var args = arguments;
			for (var i = args.length - 1; i >= 0; i--) {
				this.each(function() {
					$.event.off(this, args[i]);
				});
			};
		}
	});

	window.jMobile = window.$ = jMobile;

	(function($, document, undefined) {
		'use strict';
		var style = document.getElementsByTagName('body')[0].style,
			prefix = ['', '-webkit-', '-moz-', '-ms-', '-o-'],
			len = prefix.length,
			camelCase = $.camelCase;

		$.css3fix = function(prop) {
			var i = 0,
				fixed;
			for (; i < len; i += 1) {
				fixed = camelCase(prefix[i] + prop);
				if (fixed in style) {
					return fixed;
				}
			}
			return false;
		};
	})(jMobile, document);
}(document));