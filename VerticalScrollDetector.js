var $ = require("jquery");

var VerticalScrollDetector = new function() {

	var initScroll;
	var isScrolling = false;

	$(window).on("touchstart", function(ev) {
		initScroll = $(window).scrollTop();
    console.log('global touch start!');
	});

	$(window).on("touchmove", function(ev) {
    console.log('touch move');
		if (!isScrolling) {
			var scroll = $(window).scrollTop();

			if (scroll != initScroll) {
        console.log('scrolling!');
				isScrolling = true;
			}
		}
	});

	$(window).on("touchend", function(ev) {
    console.log('not scrolling');
		isScrolling = false;
	});

	this.isScrolling = function() {
		return isScrolling;
	}

}

module.exports = VerticalScrollDetector;
