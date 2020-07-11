// Utility function
function Util () {};

/* 
	class manipulation functions
*/
Util.hasClass = function(el, className) {
	if (el.classList) return el.classList.contains(className);
	else return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
};

Util.addClass = function(el, className) {
	var classList = className.split(' ');
 	if (el.classList) el.classList.add(classList[0]);
 	else if (!Util.hasClass(el, classList[0])) el.className += " " + classList[0];
 	if (classList.length > 1) Util.addClass(el, classList.slice(1).join(' '));
};

Util.removeClass = function(el, className) {
	var classList = className.split(' ');
	if (el.classList) el.classList.remove(classList[0]);	
	else if(Util.hasClass(el, classList[0])) {
		var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
		el.className=el.className.replace(reg, ' ');
	}
	if (classList.length > 1) Util.removeClass(el, classList.slice(1).join(' '));
};

Util.toggleClass = function(el, className, bool) {
	if(bool) Util.addClass(el, className);
	else Util.removeClass(el, className);
};

Util.setAttributes = function(el, attrs) {
  for(var key in attrs) {
    el.setAttribute(key, attrs[key]);
  }
};

/* 
  DOM manipulation
*/
Util.getChildrenByClassName = function(el, className) {
  var children = el.children,
    childrenByClass = [];
  for (var i = 0; i < el.children.length; i++) {
    if (Util.hasClass(el.children[i], className)) childrenByClass.push(el.children[i]);
  }
  return childrenByClass;
};

Util.is = function(elem, selector) {
  if(selector.nodeType){
    return elem === selector;
  }

  var qa = (typeof(selector) === 'string' ? document.querySelectorAll(selector) : selector),
    length = qa.length,
    returnArr = [];

  while(length--){
    if(qa[length] === elem){
      return true;
    }
  }

  return false;
};

/* 
	Animate height of an element
*/
Util.setHeight = function(start, to, element, duration, cb) {
	var change = to - start,
	    currentTime = null;

  var animateHeight = function(timestamp){  
    if (!currentTime) currentTime = timestamp;         
    var progress = timestamp - currentTime;
    var val = parseInt((progress/duration)*change + start);
    element.style.height = val+"px";
    if(progress < duration) {
        window.requestAnimationFrame(animateHeight);
    } else {
    	cb();
    }
  };
  
  //set the height of the element before starting animation -> fix bug on Safari
  element.style.height = start+"px";
  window.requestAnimationFrame(animateHeight);
};

/* 
	Smooth Scroll
*/

Util.scrollTo = function(final, duration, cb, scrollEl) {
  var element = scrollEl || window;
  var start = element.scrollTop || document.documentElement.scrollTop,
    currentTime = null;

  if(!scrollEl) start = window.scrollY || document.documentElement.scrollTop;
      
  var animateScroll = function(timestamp){
  	if (!currentTime) currentTime = timestamp;        
    var progress = timestamp - currentTime;
    if(progress > duration) progress = duration;
    var val = Math.easeInOutQuad(progress, start, final-start, duration);
    element.scrollTo(0, val);
    if(progress < duration) {
        window.requestAnimationFrame(animateScroll);
    } else {
      cb && cb();
    }
  };

  window.requestAnimationFrame(animateScroll);
};

/* 
  Focus utility classes
*/

//Move focus to an element
Util.moveFocus = function (element) {
  if( !element ) element = document.getElementsByTagName("body")[0];
  element.focus();
  if (document.activeElement !== element) {
    element.setAttribute('tabindex','-1');
    element.focus();
  }
};

/* 
  Misc
*/

Util.getIndexInArray = function(array, el) {
  return Array.prototype.indexOf.call(array, el);
};

Util.cssSupports = function(property, value) {
  if('CSS' in window) {
    return CSS.supports(property, value);
  } else {
    var jsProperty = property.replace(/-([a-z])/g, function (g) { return g[1].toUpperCase();});
    return jsProperty in document.body.style;
  }
};

// merge a set of user options into plugin defaults
// https://gomakethings.com/vanilla-javascript-version-of-jquery-extend/
Util.extend = function() {
  // Variables
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  // Check if a deep merge
  if ( Object.prototype.toString.call( arguments[0] ) === '[object Boolean]' ) {
    deep = arguments[0];
    i++;
  }

  // Merge the object into the extended object
  var merge = function (obj) {
    for ( var prop in obj ) {
      if ( Object.prototype.hasOwnProperty.call( obj, prop ) ) {
        // If deep merge and property is an object, merge properties
        if ( deep && Object.prototype.toString.call(obj[prop]) === '[object Object]' ) {
          extended[prop] = extend( true, extended[prop], obj[prop] );
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  };

  // Loop through each object and conduct a merge
  for ( ; i < length; i++ ) {
    var obj = arguments[i];
    merge(obj);
  }

  return extended;
};

// Check if Reduced Motion is enabled
Util.osHasReducedMotion = function() {
  if(!window.matchMedia) return false;
  var matchMediaObj = window.matchMedia('(prefers-reduced-motion: reduce)');
  if(matchMediaObj) return matchMediaObj.matches;
  return false; // return false if not supported
}; 

/* 
	Polyfills
*/
//Closest() method
if (!Element.prototype.matches) {
	Element.prototype.matches = Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function(s) {
		var el = this;
		if (!document.documentElement.contains(el)) return null;
		do {
			if (el.matches(s)) return el;
			el = el.parentElement || el.parentNode;
		} while (el !== null && el.nodeType === 1); 
		return null;
	};
}

//Custom Event() constructor
if ( typeof window.CustomEvent !== "function" ) {

  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }

  CustomEvent.prototype = window.Event.prototype;

  window.CustomEvent = CustomEvent;
}

/* 
	Animation curves
*/
Math.easeInOutQuad = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t + b;
	t--;
	return -c/2 * (t*(t-2) - 1) + b;
};

Math.easeInQuart = function (t, b, c, d) {
	t /= d;
	return c*t*t*t*t + b;
};

Math.easeOutQuart = function (t, b, c, d) { 
  t /= d;
	t--;
	return -c * (t*t*t*t - 1) + b;
};

Math.easeInOutQuart = function (t, b, c, d) {
	t /= d/2;
	if (t < 1) return c/2*t*t*t*t + b;
	t -= 2;
	return -c/2 * (t*t*t*t - 2) + b;
};

Math.easeOutElastic = function (t, b, c, d) {
  var s=1.70158;var p=d*0.7;var a=c;
  if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
  if (a < Math.abs(c)) { a=c; var s=p/4; }
  else var s = p/(2*Math.PI) * Math.asin (c/a);
  return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
};


/* JS Utility Classes */
(function() {
  // make focus ring visible only for keyboard navigation (i.e., tab key) 
  var focusTab = document.getElementsByClassName('js-tab-focus');
  function detectClick() {
    if(focusTab.length > 0) {
      resetFocusTabs(false);
      window.addEventListener('keydown', detectTab);
    }
    window.removeEventListener('mousedown', detectClick);
  };

  function detectTab(event) {
    if(event.keyCode !== 9) return;
    resetFocusTabs(true);
    window.removeEventListener('keydown', detectTab);
    window.addEventListener('mousedown', detectClick);
  };

  function resetFocusTabs(bool) {
    var outlineStyle = bool ? '' : 'none';
    for(var i = 0; i < focusTab.length; i++) {
      focusTab[i].style.setProperty('outline', outlineStyle);
    }
  };
  window.addEventListener('mousedown', detectClick);
}());
// File#: _1_responsive-sidebar
// Usage: codyhouse.co/license
(function () {
    var Sidebar = function (element) {
        this.element = element;
        this.triggers = document.querySelectorAll('[aria-controls="' + this.element.getAttribute('id') + '"]');
        this.firstFocusable = null;
        this.lastFocusable = null;
        this.selectedTrigger = null;
        this.showClass = "sidebar--is-visible";
        this.staticClass = "sidebar--static";
        this.customStaticClass = "";
        this.readyClass = "sidebar--loaded";
        this.layout = false; // this will be static or mobile
        getCustomStaticClass(this); // custom classes for static version
        initSidebar(this);
    };

    function getCustomStaticClass(element) {
        var customClasses = element.element.getAttribute('data-static-class');
        if (customClasses) element.customStaticClass = ' ' + customClasses;
    };

    function initSidebar(sidebar) {
        initSidebarResize(sidebar); // handle changes in layout -> mobile to static and viceversa

        if (sidebar.triggers) { // open sidebar when clicking on trigger buttons - mobile layout only
            for (var i = 0; i < sidebar.triggers.length; i++) {
                sidebar.triggers[i].addEventListener('click', function (event) {
                    event.preventDefault();
                    if (Util.hasClass(sidebar.element, sidebar.showClass)) {
                        sidebar.selectedTrigger = event.target;
                        closeSidebar(sidebar);
                        return;
                    }
                    sidebar.selectedTrigger = event.target;
                    showSidebar(sidebar);
                    initSidebarEvents(sidebar);
                });
            }
        }
    };

    function showSidebar(sidebar) { // mobile layout only
        Util.addClass(sidebar.element, sidebar.showClass);
        getFocusableElements(sidebar);
        Util.moveFocus(sidebar.element);
    };

    function closeSidebar(sidebar) { // mobile layout only
        Util.removeClass(sidebar.element, sidebar.showClass);
        sidebar.firstFocusable = null;
        sidebar.lastFocusable = null;
        if (sidebar.selectedTrigger) sidebar.selectedTrigger.focus();
        sidebar.element.removeAttribute('tabindex');
        //remove listeners
        cancelSidebarEvents(sidebar);
    };

    function initSidebarEvents(sidebar) { // mobile layout only
        //add event listeners
        sidebar.element.addEventListener('keydown', handleEvent.bind(sidebar));
        sidebar.element.addEventListener('click', handleEvent.bind(sidebar));
    };

    function cancelSidebarEvents(sidebar) { // mobile layout only
        //remove event listeners
        sidebar.element.removeEventListener('keydown', handleEvent.bind(sidebar));
        sidebar.element.removeEventListener('click', handleEvent.bind(sidebar));
    };

    function handleEvent(event) { // mobile layout only
        switch (event.type) {
            case 'click': {
                initClick(this, event);
            }
            case 'keydown': {
                initKeyDown(this, event);
            }
        }
    };

    function initKeyDown(sidebar, event) { // mobile layout only
        if (event.keyCode && event.keyCode == 27 || event.key && event.key == 'Escape') {
            //close sidebar window on esc
            closeSidebar(sidebar);
        } else if (event.keyCode && event.keyCode == 9 || event.key && event.key == 'Tab') {
            //trap focus inside sidebar
            trapFocus(sidebar, event);
        }
    };

    function initClick(sidebar, event) { // mobile layout only
        //close sidebar when clicking on close button or sidebar bg layer 
        if (!event.target.closest('.js-sidebar__close-btn') && !Util.hasClass(event.target, 'js-sidebar')) return;
        event.preventDefault();
        closeSidebar(sidebar);
    };

    function trapFocus(sidebar, event) { // mobile layout only
        if (sidebar.firstFocusable == document.activeElement && event.shiftKey) {
            //on Shift+Tab -> focus last focusable element when focus moves out of sidebar
            event.preventDefault();
            sidebar.lastFocusable.focus();
        }
        if (sidebar.lastFocusable == document.activeElement && !event.shiftKey) {
            //on Tab -> focus first focusable element when focus moves out of sidebar
            event.preventDefault();
            sidebar.firstFocusable.focus();
        }
    };

    function initSidebarResize(sidebar) {
        // custom event emitted when window is resized - detect only if the sidebar--static@{breakpoint} class was added
        var beforeContent = getComputedStyle(sidebar.element, ':before').getPropertyValue('content');
        if (beforeContent && beforeContent != '' && beforeContent != 'none') {
            checkSidebarLayour(sidebar);

            sidebar.element.addEventListener('update-sidebar', function (event) {
                checkSidebarLayour(sidebar);
            });
        }
        Util.addClass(sidebar.element, sidebar.readyClass);
    };

    function checkSidebarLayour(sidebar) {
        var layout = getComputedStyle(sidebar.element, ':before').getPropertyValue('content').replace(/\'|"/g, '');
        if (layout == sidebar.layout) return;
        sidebar.layout = layout;
        if (layout != 'static') Util.addClass(sidebar.element, 'is-hidden');
        Util.toggleClass(sidebar.element, sidebar.staticClass + sidebar.customStaticClass, layout == 'static');
        if (layout != 'static') setTimeout(function () { Util.removeClass(sidebar.element, 'is-hidden') });
        // reset element role 
        (layout == 'static') ? sidebar.element.removeAttribute('role', 'alertdialog') : sidebar.element.setAttribute('role', 'alertdialog');
        // reset mobile behaviour
        if (layout == 'static' && Util.hasClass(sidebar.element, sidebar.showClass)) closeSidebar(sidebar);
    };

    function getFocusableElements(sidebar) {
        //get all focusable elements inside the drawer
        var allFocusable = sidebar.element.querySelectorAll('[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex]:not([tabindex="-1"]), [contenteditable], audio[controls], video[controls], summary');
        getFirstVisible(sidebar, allFocusable);
        getLastVisible(sidebar, allFocusable);
    };

    function getFirstVisible(sidebar, elements) {
        //get first visible focusable element inside the sidebar
        for (var i = 0; i < elements.length; i++) {
            if (elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
                sidebar.firstFocusable = elements[i];
                return true;
            }
        }
    };

    function getLastVisible(sidebar, elements) {
        //get last visible focusable element inside the sidebar
        for (var i = elements.length - 1; i >= 0; i--) {
            if (elements[i].offsetWidth || elements[i].offsetHeight || elements[i].getClientRects().length) {
                sidebar.lastFocusable = elements[i];
                return true;
            }
        }
    };

    //initialize the Sidebar objects
    var sidebar = document.getElementsByClassName('js-sidebar');
    if (sidebar.length > 0) {
        for (var i = 0; i < sidebar.length; i++) {
            (function (i) { new Sidebar(sidebar[i]); })(i);
        }
        // switch from mobile to static layout
        var customEvent = new CustomEvent('update-sidebar');
        window.addEventListener('resize', function (event) {
            (!window.requestAnimationFrame) ? setTimeout(function () { resetLayout(); }, 250) : window.requestAnimationFrame(resetLayout);
        });

        function resetLayout() {
            for (var i = 0; i < sidebar.length; i++) {
                (function (i) { sidebar[i].dispatchEvent(customEvent) })(i);
            };
        };
    }
}());
// File#: _1_side-navigation
// Usage: codyhouse.co/license
(function () {
    function initSideNav(nav) {
        nav.addEventListener('click', function (event) {
            var btn = event.target.closest('.js-sidenav__sublist-control');
            if (!btn) return;
            var listItem = btn.parentElement,
                bool = Util.hasClass(listItem, 'sidenav__item--expanded');
            btn.setAttribute('aria-expanded', !bool);
            Util.toggleClass(listItem, 'sidenav__item--expanded', !bool);
        });
    };

    var sideNavs = document.getElementsByClassName('js-sidenav');
    if (sideNavs.length > 0) {
        for (var i = 0; i < sideNavs.length; i++) {
            (function (i) { initSideNav(sideNavs[i]); })(i);
        }
    }
}());