var $ = require("jquery");

var VerticalScrollDetector = new function() {

	var initScroll;
	var isScrolling = false;

	$(window).on("touchstart", function(ev) {
		initScroll = $(window).scrollTop();
	});

	$(window).on("touchmove", function(ev) {
		if (!isScrolling) {
			var scroll = $(window).scrollTop();

			if (scroll != initScroll) {
				isScrolling = true;
			}
		}
	});

	$(window).on("touchend", function(ev) {
		isScrolling = false;
	});

	this.isScrolling = function() {
		return isScrolling;
	}

}

module.exports = VerticalScrollDetector;