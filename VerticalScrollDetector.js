let VerticalScrollDetector = new function() {

	var initScroll;
	var isScrolling = false;

	if (typeof window !== 'undefined') {
        window.addEventListener('touchstart', function (ev) {

            initScroll = window.pageYOffset || document.documentElement.scrollTop;
        });

        window.addEventListener('touchmove', function (ev) {
            if (!isScrolling) {
                var scroll = window.pageYOffset || document.documentElement.scrollTop;

                if (scroll != initScroll) {
                    isScrolling = true;
                }
            }
        });

        window.addEventListener("touchend", function (ev) {
            isScrolling = false;
        });
    }

	this.isScrolling = function() {
		return isScrolling;
	}

};

export default VerticalScrollDetector;
