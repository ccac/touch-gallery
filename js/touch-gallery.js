
var TouchGallery = {

    init: function() {
        console.log("TouchGallery.init()");

        this.container = $(".gallery-container");
        this.list = this.container.children("ul");
        this.listItems = this.list.children("li");
        this.listHeight = this.listItems.first().height();
        this.bulletsContainer = this.container.children(".gallery-bullets");
        this.prev = this.container.children(".gallery-prev");
        this.next = this.container.children(".gallery-next");
        
        var _self = this;

        _self.initListItems();
//        _self.initHeight();
        _self.initBullets();
        _self.initPrevNextNav();

        _self.showPrevNextNav();
        _self.showBullets();

//        _self.initOrientationEvents();
//        _self.initResizeEvents();

        // if (Modernizr.touch) {
            _self.initSwipeTransition();
        // }
        
    },
    initListItems: function() {
        console.log("TouchGallery.initListItems()");

        var _self = this;
        var marginLeft = 0;

        _self.listItems.removeClass("active");
        _self.listItems.first().addClass("active");

        _self.listItems.each(function() {
            $(this).css("margin-left", marginLeft + "%");
            marginLeft += 100;
        });
        
        _self.listItems.first().show();
    },
    initHeight: function(isOrientationChanged) {
        console.log("TouchGallery.initHeight()");

        var _self = this;

        if (window.innerWidth > 767) {
            var timeout = 1;
            if (isOrientationChanged) {
                timeout = 1000;
            }

            setTimeout(function() {

                _self.list.css("height", "auto");
                _self.listItems.css("height", "auto");

                _self.listHeight = _self.listItems.first().height();

                _self.listItems.each(function() {
                    if ($(this).height() > _self.listHeight) {
                        _self.listHeight = $(this).height();
                    }
                });

                _self.list.css("height", _self.listHeight + "px");
                _self.listItems.css("height", _self.listHeight + "px");

            }, timeout);
        }
        else {
            _self.list.css("height", "auto");
            _self.listItems.css("height", "auto");
        }
    },
    initResizeEvents: function() {
        console.log("TouchGallery.initResizeEvents()");

        var _self = this;

        var waitForFinalEvent = (function() {
            var timers = {};
            return function(callback, ms, uniqueId) {
                if (!uniqueId) {
                    uniqueId = "Don't call this twice without a uniqueId";
                }
                if (timers[uniqueId]) {
                    clearTimeout(timers[uniqueId]);
                }
                timers[uniqueId] = setTimeout(callback, ms);
            };
        })();

        $(window).bind("resize", function() {
            waitForFinalEvent(function() {
                _self.callback();
            }, 500, "galleryuniquestring1");
        });

        $(window).bind("resize", function() {
            _self.list.css("height", "0");
            _self.listItems.css("height", "0");
            waitForFinalEvent(function() {
                _self.initHeight();
            }, 500, "galleryuniquestring2");
        });
    },
    initOrientationEvents: function() {
        console.log("TouchGallery.initOrientationEvents()");

        var _self = this;

        $(window).bind("orientationchange", function() {
            _self.initHeight(true);
        });
    },
    initPrevNextNav: function() {
        console.log("TouchGallery.initPrevNextNav()");

        var _self = this;

        this.next.on("click", function() {
            _self.goForward();
        });

        this.prev.on("click", function() {
            _self.goBackward();
        });
    },
    initSwipeTransition: function() {
        console.log("TouchGallery.initSwipeTransition()");

        var _self = this;

        this.list.on("touchstart", function(e) {
            if (!e.touches) {
                e = e.originalEvent;
            }
            var data = {
                start_page_x: e.touches[0].pageX,
                start_page_y: e.touches[0].pageY,
                start_time: (new Date()).getTime(),
                delta_x: 0,
                last_x: e.touches[0].pageX,
                direction: "forward",
                is_scrolling: undefined
            };
            _self.container.data('swipe-transition', data);
            e.stopPropagation();

        }).on("touchmove", function(e) {
            if (!e.touches) {
                e = e.originalEvent;
            }
            // Ignore pinch/zoom events
            if (e.touches.length > 1 || e.scale && e.scale !== 1)
                return;

            var data = _self.container.data('swipe-transition');
            if (typeof data === 'undefined') {
                data = {};
            }

            data.delta_x = e.touches[0].pageX - data.start_page_x;

            console.log(e.touches[0].pageX + " < " + data.last_x);
            if (e.touches[0].pageX < data.last_x) {
                data.direction = "forward";
            } else {
                data.direction = "backward";
            }
            console.log(data.direction);

            data.last_x = e.touches[0].pageX;

            _self.listItems.css("transition", "0s");
            _self.listItems.css("transform", "translate3d(" + data.delta_x + "px, 0, 0)");

            if (typeof data.is_scrolling === 'undefined') {
                data.is_scrolling = !!(data.is_scrolling || Math.abs(data.delta_x) < Math.abs(e.touches[0].pageY - data.start_page_y));
            }

            if (!data.is_scrolling && !data.active) {
                e.preventDefault();
//                var direction = (data.delta_x < 0) ? (idx + 1) : (idx - 1);
                data.active = true;
//                self._goto(direction);
            }

        }).on("touchend", function(e) {

            var data = _self.container.data('swipe-transition');
            if (typeof data === 'undefined') {
                data = {};
            }

            _self.listItems.css("transition", "0.5s");
            _self.listItems.each(function() {
                _self.listItems.css("transform", "translate3d(0, 0, 0)");
            });

            if (data.direction === "forward" && data.delta_x <= -10) {
                _self.goForward();
            }
            else if (data.direction === "backward" && data.delta_x > 10) {
                _self.goBackward();
            }

            _self.container.data('swipe-transition', {});
            e.stopPropagation();

        });
    },
    initBullets: function() {
        console.log("TouchGallery.initBullets()");

        var _self = this;

        this.listItems.each(function(e, i) {
            _self.bulletsContainer.append('<li></li>');
        });
        this.bulletsContainer.children('li:first-child').addClass("active");

    },
    disable: function() {
        console.log("TouchGallery.disable()");
        this.list.unbind();
        this.list.off();
        this.initListItems();
        this.bulletsContainer.hide();
        this.prev.hide();
        this.next.hide();
    },
    showPrevNextNav: function() {
        console.log("TouchGallery.showPrevNext()");
//        this.bulletsContainer.hide();
        this.prev.show();
        this.next.show();
    },
    showBullets: function() {
        console.log("TouchGallery.showBullets()");
//        this.prev.hide();
//        this.next.hide();
        this.bulletsContainer.show();
    },
    updateBullets: function() {
        console.log("TouchGallery.updateBullets()");
        var activeIndex = this.list.children("li.active").index();
        var nthChild = activeIndex - 0 + 1;

        this.bulletsContainer.children("li").removeClass("active");
        this.bulletsContainer.children("li:nth-child(" + nthChild + ")").addClass("active");
    },
    goForward: function() {
        console.log("TouchGallery.goForward()");
        var _self = this;

        var galleryItem = _self.list.children("li.active");

        if (galleryItem.next().length > 0) {

            _self.listItems.removeClass("active");

            var galleryItemToShow = galleryItem.next();

            if (Modernizr.touch) {
                _self.list.css("transform", "translate3d(-" + (galleryItemToShow.index() * 100) + "%, 0, 0)");
            }
            else {
                console.log(galleryItem);
                console.log(galleryItemToShow);
//                galleryItem.fadeOut();
                galleryItemToShow.fadeIn();
                galleryItem.css("margin-left", "-100%");
                galleryItemToShow.css("margin-left", "0");
            }

            galleryItemToShow.addClass("active");

        }
        else {
            var galleryItemToShow = galleryItem.parent().children().first();

            console.log(galleryItem);
            console.log(galleryItemToShow);

            if (Modernizr.touch) {
            }
            else {

                _self.listItems.removeClass("active");

//                galleryItem.fadeOut();
                galleryItemToShow.fadeIn();
                _self.listItems.css("margin-left", "100%");
                galleryItemToShow.css("margin-left", "0");

                galleryItemToShow.addClass("active");
            }

        }

        _self.updateBullets();
    },
    goBackward: function() {
        console.log("TouchGallery.goBackward()");
        var _self = this;

        var galleryItem = _self.list.children("li.active");

        if (galleryItem.prev().length > 0) {

            _self.listItems.removeClass("active");

            var galleryItemToShow = galleryItem.prev();

            if (Modernizr.touch) {
                _self.list.css("transform", "translate3d(-" + (galleryItemToShow.index() * 100) + "%, 0, 0)");
            }
            else {
//                galleryItem.fadeOut();
                galleryItemToShow.fadeIn();
                galleryItem.css("margin-left", "100%");
                galleryItemToShow.css("margin-left", "0");
            }

            galleryItemToShow.addClass("active");

        }
        else {
            var galleryItemToShow = galleryItem.parent().children().last();

            if (Modernizr.touch) {
            }
            else {

                _self.listItems.removeClass("active");

//                galleryItem.fadeOut();
                galleryItemToShow.fadeIn();
                _self.listItems.css("margin-left", "-100%");
                galleryItemToShow.css("margin-left", "0");

                galleryItemToShow.addClass("active");
            }
        }

        _self.updateBullets();
    }
};
