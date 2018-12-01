function GalleryModule() {


    var resizeCallback;

    var BottomPanel = {
        opened: false,
        scrollCallback: undefined,
        animationTime: 0.8,
        contentHeight: 0,
    }

    // Slider, pinch zoomers, tap recognizer
    var slider;
    var pinchZoomers;
    var isFullscreenSlider;
    var tapRecognizer;

    var portfolioPlayer;



    // This all height stuff is connected with staying resistant to iPhone bars collapsing and resizing damn window.
    var getSlideWidth = function() {
        return $('body').width() + 2
    };


    function getPhotoDimensionsInContainer(naturalRatio, containerWidth, containerHeight) {

        var containerRatio = containerWidth / containerHeight;

        var width, height, left, top;

        if (containerRatio > naturalRatio) {
            height = containerHeight;
            width = containerWidth * naturalRatio / containerRatio;

            top = 0;
            left = (containerWidth - width) / 2;
        }
        else {
            height = containerHeight * containerRatio / naturalRatio;
            width = containerWidth;

            top = (containerHeight - height) / 2;
            left = 0;
        }

        return {
            top: top,
            left: left,
            height: height,
            width: width
        }

    }

    function getTopMargin() {
        return $('#menu-height-measurement-big').outerHeight() * (window.innerWidth < 740 ? 1 : 1.5);
    }

    function getBottomMargin() {
        return $('#gallery-module .control-panel').height() * (window.innerWidth < 740 ? 1 : 1.2);
    }

    function getDimensionsInContainerWithZoomParams(photoContainer) {

        var photo = $(photoContainer).find('.photo');
        var gallery = $('#gallery-module .gallery');

        var dimensions = getPhotoDimensionsInContainer(photo.data('aspect-ratio'), $('body').width(), ViewPortManager.getCurrentViewportHeight());
        var dimensionsScaled = getPhotoDimensionsInContainer(photo.data('aspect-ratio'), $('body').width(), ViewPortManager.getCurrentViewportHeight() - getTopMargin() - getBottomMargin());

        var scale = dimensionsScaled.width / dimensions.width;

        return {
            top: dimensions.top,
            left: dimensions.left,
            height: dimensions.height,
            width: dimensions.width,
            scale: scale,
            translateY: (getTopMargin() - getBottomMargin()) / 2,

            scaledTop: dimensionsScaled.top,
            scaledLeft: dimensionsScaled.left,
            scaledHeight: dimensionsScaled.height,
            scaledWidth: dimensionsScaled.width
        }

    }

    function calculatePhotosDimensions() {

        $('#gallery-module .item-container').each(function() {

            var dimensions = getDimensionsInContainerWithZoomParams(this);

            var photo = $(this).find('.photo');
            photo.css({
                top: dimensions.top,
                left: dimensions.left,
                height: dimensions.height,
                width: dimensions.width
            });

            $(this).data('translateY', dimensions.translateY);
            $(this).data('scale', dimensions.scale);
            $(this).data('width', dimensions.width);
            $(this).data('height', dimensions.height);

            LazyAsset.autosize(photo, dimensions.width); // Set lazy asset element!
        });
    }

    function calculateContainerPositions() {

        if (supportsTouch()) {
            $('#gallery-module .slide').each(function(index) {
                $(this).css('left', getSlideWidth() * index);
            });
        }
        else {
            var count = $('#gallery-module .slide').length;

            $('#gallery-module .slide').each(function(index) {
                $(this).css('z-index', count - index);
            });
        }

    }

    // MORE PORTFOLIOS

    var MorePortfolios = new function() {
        var _this = this;

        var node;
        var button;

        this.init = function() {
            node = $('#gallery-module .more-portfolios');
            button = $('#gallery-module .more-portfolios-toggle');

            button.click(function() {
                _this.toggle();
            })

            node.click(function(e) {

                if (e.target.tagName !== 'A') {
                    _this.close();
                }
            });
        }

        this.open = function() {
            node.addClass('opened');
            button.addClass('opened');
        }

        this.close = function() {
            node.removeClass('opened');
            button.removeClass('opened');
        }

        this.toggle = function() {
            if (node.hasClass('opened')) { this.close(); }
            else { this.open(); }
        }

    }


    // SLIDESHOW
    var Slideshow = function() {
        var _this = this;

        var timer;
        var time = 3000;
        var playing = false;

        function tick() {
            slider.goToNextSlide();
            portfolioActivateLastSectionIfNeeded();

            setTimer();
        }

        function setTimer() {
            if (playing) {
                timer = setTimeout(tick, time);
            }
        }

        this.init = function() {
            if (supportsTouch()) { return; }

            $('#gallery-module .slideshow-close-button').click(function() {
                Interface.show();

                var pinchZoomer = pinchZoomers[slider.getTargetSlide()];
                if (pinchZoomer) {
                    pinchZoomer.toggleFullscreen();
                }
            });

            $('#gallery-module .slideshow-play-button').click(function() {
                _this.play();
            });

            $('#gallery-module .slideshow-pause-button').click(function() {
                _this.pause();
            });
        }

        this.resetTimer = function() {
            if (supportsTouch()) { return; }

            if (playing) {
                clearTimeout(timer);
                setTimer();
            }
        }

        this.play = function(val) {
            if (supportsTouch()) { return; }

            $('#gallery-module .slideshow-pause-button').show();
            $('#gallery-module .slideshow-play-button').hide();

            playing = true;
            setTimer();
        }

        this.pause = function() {
            if (supportsTouch()) { return; }

            $('#gallery-module .slideshow-pause-button').hide();
            $('#gallery-module .slideshow-play-button').show();

            playing = false;
            clearTimeout(timer);
        }

        this.show = function() {
            if (supportsTouch()) { return; }

            $('#page-wrapper .slideshow-panel').addClass('visible');
            this.pause();
        }

        this.hide = function() {
            if (supportsTouch()) { return; }

            $('#page-wrapper .slideshow-panel').removeClass('visible');
            this.pause();
        }

    }

    Slideshow = new Slideshow();

    // INTERFACE - bottom and top bar.

    var Interface = function() {
        var _this = this;
        var hidden = false;

        var zoomAnimationTime = 0.4;
        var zoomAnimationEase = Power4.easeOut;

        this.show = function() {

            if (!hidden) { return; }
            hidden = false;

            Slideshow.hide();

            $('#page-wrapper header, #page-wrapper .control-panel').css('visibility', 'visible');

            TweenMax.to('#page-wrapper header', zoomAnimationTime, { y: 0, alpha: 1, force3D: true, ease: zoomAnimationEase });
            TweenMax.to('#page-wrapper .control-panel', zoomAnimationTime, { y: 0, alpha: 1, force3D: true, ease: zoomAnimationEase, onComplete: function() {
                    calculateHoverSectionsForPortfolio();
                } });

            $('#gallery-module .hover-section.center').removeClass('zoom');
        }

        this.hide = function() {

            if (hidden) { return; }
            hidden = true;

            TweenMax.to('#page-wrapper header', zoomAnimationTime, { y: -$('#page-wrapper header').height(), alpha: 0, force3D: true, ease: zoomAnimationEase });
            TweenMax.to('#page-wrapper .control-panel', zoomAnimationTime, { y: $('#page-wrapper .control-panel').height(), alpha: 0, force3D: true, ease: zoomAnimationEase, onComplete: function() {

                    if (hidden) {
                        $('#page-wrapper header, #page-wrapper .control-panel').css('visibility', 'hidden');
                    }

                    calculateHoverSectionsForPortfolio(); // Do this to recalculate touch spaces with icons + slideshow icons color.
                    Slideshow.show();

                } });

            $('#gallery-module .hover-section.center').addClass('zoom');
        }
    }

    Interface = new Interface();


    function calculateHoverSectionsForPortfolio() {
        if (supportsTouch()) {
            $('#gallery-module .hover-sections').hide();
            return;
        }

        if (slider.getTargetSlide() == slider.getCount() - 1) { // if last slide
            $('#gallery-module .hover-section.light').css('visibility', 'hidden');
            return;
        }

        var currentPhotoContainer = $('#gallery-module .gallery .item-container').eq(slider.getActiveSlide());
        var currentPhoto = currentPhotoContainer.find('.photo');

        // IF CURRENT PHOTO IS LIGHT THEN SIMPLY HIDE THEM!!! TODO

        if (parseFloat(currentPhoto.parent().data('luminance')) > 160) {
            $('#gallery-module .hover-section.light').css('visibility', 'hidden');
        }
        else {
            $('#gallery-module .hover-section.light').css('visibility', 'visible');
        }

        $('#gallery-module .hover-section.light').css('top', currentPhoto.offset().top);
        $('#gallery-module .hover-section.light').css('height', currentPhoto.height());

        var width = $('body').width();
        var left = currentPhoto.offset().left - currentPhoto.parent().offset().left;

        if (currentPhoto.width() > width / 3) {

            // Left
            $('#gallery-module .hover-section.light.left').css({
                left: left,
                width: width / 3 - left
            });

            // Right
            $('#gallery-module .hover-section.light.right').css({
                left: width * 2 / 3,
                width: width / 3 - left
            });

            // center
            $('#gallery-module .hover-section.light.center').css({
                left: width / 3,
                width: width / 3
            });
        }
        else {
            // Left
            $('#gallery-module .hover-section.light.left').css('width', 0);

            // Right
            $('#gallery-module .hover-section.light.right').css('width', 0);

            // Center
            $('#gallery-module .hover-section.light.center').css({
                left: left,
                width: currentPhoto.width()
            });
        }

        // SLIDESHOW BUTTONS
        var buttons = $('.slideshow-panel .buttons');
        var rightEdgeOfButtons = buttons.offset().left + buttons.width();

        if (parseFloat(currentPhoto.parent().data('luminance')) <= 160 && rightEdgeOfButtons <= left + currentPhoto.width()) {
            buttons.find('.circle-button').addClass('light');
        }
        else {
            buttons.find('.circle-button').removeClass('light');
        }

    }

    function updatePinterestShareLink(index) {

        var pinButton = $('.pinButton');
        if (pinButton.length == 0) { return; }

        var pinButtonURL = pinButton.attr("data-pin-href");

        if(typeof pinButtonURL == 'undefined') {
            pinButtonURL = pinButton.attr("href");
        }

        var newImageURL = $('#gallery-module .item-container').eq(index).find('img').attr("data-src");
        var newPinHref = pinButtonURL.replace(/(media=).*?(&)/,'$1' + newImageURL + '$2');

        pinButton.attr("data-pin-href", newPinHref);
        pinButton.attr("href", newPinHref);

    }

    function updatePortfolioCounter() {

        function getNumberWithZero(num) {
            return num < 10 ? "0" + num : num.toString();
        }

        var numberOfPhotos = $('#gallery-module .item-container').length;

        $('#gallery-module .number-of-photos').html(getNumberWithZero(numberOfPhotos));
        $('#gallery-module .current-photo-index').html(getNumberWithZero(Math.min(numberOfPhotos, slider.currentIndex() + 1)));

    }

    function galleryChangePhoto(index) {

        var oldActive = $('#gallery-module .item-container.active .photo');
        TweenMax.to(oldActive, 0.1, { force3D: true, alpha: 0 });

        setTimeout(function() {
            slider.goTo(index, Expo.easeInOut, 0);

            TweenMax.set(oldActive, { alpha: 1 });

            TweenMax.set('#gallery-module .item-container.active .photo', { alpha: 0 });
            TweenMax.to('#gallery-module .item-container.active .photo', 0.2, { force3D: true, alpha: 1 });

        }, BottomPanel.animationTime * 1250);
    }


    function openBottomPanel() {

        // TweenMax.to($('#gallery-module .control-panel .circle-button-container .label'), 0.3, { alpha: 0 }); // hide "View all" label when used once.

        // if (document.cookie.indexOf("cookie__label_opacity") < 0) {
        // 	var expires = new Date();
        //        expires.setTime(expires.getTime() + 604800000);
        //        document.cookie = 'cookie__label_opacity' + '=' + 'on' + ';expires=' + expires.toUTCString();
        //    }

        $('#page-wrapper .menu').removeClass('transparent');

        BottomPanel.opened = true;

        Menu.minify();

        $('#gallery-module').css('height', BottomPanel.contentHeight + ViewPortManager.getBigViewportHeight() / 2);

        $('#gallery-module .overlay .white-overlay').hide();
        $('#gallery-module .overlay').show();

        TweenMax.to('#gallery-module .bottom-panel', BottomPanel.animationTime, { y: ViewPortManager.getBigViewportHeight() / 2, force3D: true, ease: Power4.easeOut, onComplete: function() {
                $('#gallery-module .overlay .white-overlay').show();
            } });

        TweenMax.set(window, { scrollTo: 5 });

        BottomPanel.scrollCallback = function() {

            if ($(window).scrollTop() <= 0) {
                closeBottomPanel(Power4.easeOut);
            }
        }

        ScrollEvents.register(BottomPanel.scrollCallback);

        LazyAsset.load('#gallery-module .bottom-panel', function() {});
    }

    function closeBottomPanel(animation) {

        $('#gallery-module .overlay').hide();

        calculatePhotosDimensions(); // viewport could have changed when scrolling panel on mobile so change photo sizes and adapt them to current viewport!.

        BottomPanel.opened = false;

        ScrollEvents.unregister(BottomPanel.scrollCallback);

        var scrollTop = $(window).scrollTop();

        TweenMax.set('#gallery-module .bottom-panel', { y: ViewPortManager.getBigViewportHeight() / 2 - scrollTop, onComplete: function() {

                TweenMax.to('#gallery-module .bottom-panel', BottomPanel.animationTime, { y: ViewPortManager.getBigViewportHeight(), force3D: true, ease: animation, onComplete: function() {
                        // $('#gallery-module .bottom-panel').css('visibility', 'hidden');

                        $('#page-wrapper .menu').addClass('transparent');

                    } });

                Menu.hideSubmenu();

                setTimeout(function() {
                    Menu.unminify();
                }, 400);

            } });

        $('#gallery-module').css('height', ViewPortManager.getCurrentViewportHeight());
    }


    function portfolioUpdatePhotosPositions(coords) {

        if (supportsTouch()) {
            TweenMax.set($('#gallery-module .slide.active'), { x: -coords.position * getSlideWidth(), force3D: true });
        }
        else {
            var slides = $('#gallery-module .slide');

            var slideLeft = slides.eq(coords.leftIndex);
            var slideRight = slides.eq(coords.rightIndex);

            $('#gallery-module .slide.active').css('opacity', 0); // all active reset first
            $('#gallery-module .slide.active').css('transform', 'none'); // all active reset first

            // var leftTreshold = 0.7;
            // var rightTreshold = 0.7;

            // var leftPercent = Math.max(0, (coords.leftPercent - (1 - leftTreshold)) * (1 / leftTreshold));
            // var rightPercent = Math.max(0, (coords.rightPercent - (1 - rightTreshold)) * (1 / rightTreshold));

            var leftPercent = coords.leftPercent;
            var rightPercent = coords.rightPercent;

            slideLeft.css('opacity', leftPercent); // set left visible opacity
            slideRight.css('opacity', rightPercent); // set righ visible opacity
        }


    }

    function portfolioUpdateActivePhotos(index) {

        $('#gallery-module .thumbnail').removeClass('active');
        $('#gallery-module .thumbnail').eq(index).addClass('active');

        $('#gallery-module .slide').each(function(i) {

            if (index - 1 <= i && i <= index + 1) {

                // Pointer events
                $(this).css('pointer-events', 'none');
                if (i == index) {
                    $(this).css('pointer-events', 'auto');
                }


                if ($(this).hasClass('active')) { return; }
                $(this).addClass('active');

                // Pinch zoomer
                var pinchZoomer = pinchZoomers[i];
                if (pinchZoomer) {
                    pinchZoomer.normalize();
                }
            }
            else {
                $(this).removeClass('active');
            }


        });

        LazyAsset.load('#gallery-module .item-container.active .lazy-asset', function() {

        });
    }

    function hideOtherPortfoliosOnMobile() {
        if( $('#gallery-module .slide.last-slide').length == 0 ){ return; }
        if (slider.getTargetSlide() != slider.getCount() - 2) { return; }
        if (slider.getTargetSlide() != slider.currentIndex()-1) { return; }

        MorePortfolios.close();
    }

    function portfolioActivateLastSectionIfNeeded() {

        if (slider.getTargetSlide() != slider.getCount() - 1) { return; }

        if ($('#gallery-module .slide.last').length != 0) {

            if (supportsTouch()) {
                slider.disable();
            }

            if (tapRecognizer) { tapRecognizer.disable() };

            Interface.show();

            var pinchZoomer = pinchZoomers[slider.getActiveSlide()];
            if (pinchZoomer) {
                pinchZoomer.zoomOut();
            }

            Slideshow.pause();

            $('#gallery-module .gallery .hover-sections').css('display', 'none');

            TweenMax.to('#page-wrapper .control-panel', 0.2, { alpha: 0, force3D: true, onComplete: function() {
                    $('#page-wrapper .control-panel').css('visibility', 'hidden');
                } });
        }
        else if( $('#gallery-module .slide.last-slide').length != 0 ){

            if (slider.getTargetSlide() != slider.currentIndex()) { return; }

            MorePortfolios.open();

            var pinchZoomer = pinchZoomers[slider.getActiveSlide()];
            if (pinchZoomer) {
                pinchZoomer.zoomOut();
            }

            Slideshow.pause();
        }
    }

    function portfolioDeactivateLastSlide() {

        if (supportsTouch()) {
            slider.enable();
        }

        if (tapRecognizer) { tapRecognizer.enable() };

        TweenMax.to('#page-wrapper .control-panel', 0.2, { alpha: 1, force3D: true });

        $('#gallery-module .gallery .hover-sections').css('display', 'block');
        $('#page-wrapper .control-panel').css('visibility', 'visible');

        slider.goToPreviousSlide();

    }



    function portfolioCalculateHeights() {

        $('#gallery-module .more-portfolios').css({
            top: (getTopMargin() - getBottomMargin()) + 'px'
        });


        BottomPanel.contentHeight = $('#gallery-module .bottom-panel .content').outerHeight();

        // let's calculate visible viewport height. It's stupid hack but it works on iOS and in most other cases (and both orientations)

        // var height = ViewPortManager.getSmallViewportHeight();
        // var height = ViewPortManager.getCurrentViewportHeight();

        // if (ViewPortManager.getSmallViewportHeight() == ViewPortManager.getBigViewportHeight()) { // horizontal iPhone -> just take actual viewport height. It will jump but that's only solution which doesn't hide bottom bar with smaller viewport.
        // 	height = ViewPortManager.getCurrentViewportHeight();
        // }

        // $('#gallery-module .gallery').css('height', ViewPortManager.getSmallViewportHeight());

        // $('#gallery-module').css('height', BottomPanel.contentHeight);

        var scrollTop = $(window).scrollTop();

        if (!BottomPanel.opened) {

            // remove all params instead of transform
            var transform = $('#gallery-module').css('transform');
            $('#gallery-module').removeAttr('style');
            $('#gallery-module').css('transform', transform);

            TweenMax.set('#gallery-module .bottom-panel', { y: ViewPortManager.getBigViewportHeight() });
        }
        else {
            $('#gallery-module').css('height', BottomPanel.contentHeight + ViewPortManager.getBigViewportHeight() / 2);
            TweenMax.set('#gallery-module .bottom-panel', { y: ViewPortManager.getBigViewportHeight() / 2 });
        }

    }

    function updateArrows(index) {
        $('#gallery-module .hover-section.left, #gallery-module .hover-section.right').addClass('active');

        if (index == 0) {
            $('#gallery-module .hover-section.left').removeClass('active');
        } else if (index == slider.getCount() - 1 && $('#gallery-module .slide.last-slide').length == 0) {
            $('#gallery-module .hover-section.right').removeClass('active');
        }

    }


    this.init = function() {

        LazyAsset.normalizeImagesInContainMode($('.bottom-panel'));

        // Remove autosizing from scaled images in gallery
        $('#gallery-module .item-container .lazy-asset-auto-sizes').removeClass('lazy-asset-auto-sizes');

        portfolioIsZoomedIn = false;
        BottomPanel.opened = false;

        portfolioCalculateHeights();

        LazyAsset.load('#gallery-module .item-container.active .lazy-asset', function() {

        });

        // Calulation of gallery
        calculatePhotosDimensions();
        calculateContainerPositions();

        resizeCallback = function() {
            LazyAsset.normalizeImagesInContainMode($('.bottom-panel'));

            portfolioCalculateHeights();
            calculatePhotosDimensions();
            calculateContainerPositions();
            slider.normalize();

            initPinchZoomers();
            calculateHoverSectionsForPortfolio();
        }

        // ViewPortManager.onResize(resizeCallback)
        $(window).resize(resizeCallback)

        // init slider
        slider = new Slider($('#gallery-module .gallery'));

        if (supportsTouch()) {
            slider.setAnimationCurve(Power4.easeOut);
            slider.setAnimationTime(0.8);
        }
        else {
            slider.setAnimationCurve(Power2.easeOut); // Power4.easeOut;
            slider.setAnimationTime(0.5);
        }

        slider.setCount($('#gallery-module .slide').length);
        slider.setSlideWidth(getSlideWidth());

        slider.setMovementCallback(function(coords) {
            portfolioUpdatePhotosPositions(coords);
        });

        slider.setActiveSlideChangedCallback(function(index) {
            updateArrows(index);
            portfolioUpdateActivePhotos(index);
            updatePortfolioCounter();
            updatePinterestShareLink(index);
            calculateHoverSectionsForPortfolio();
        })

        if (supportsTouch()) {
            slider.enable();
        }
        else {
            slider.enableArrows();

            slider.setKeyRightCallback(function() {
                portfolioActivateLastSectionIfNeeded();
                Slideshow.resetTimer();
            })

            slider.setKeyLeftCallback(function() {
                if (slider.isLast()) {
                    portfolioDeactivateLastSlide();
                }
                Slideshow.resetTimer();
            });

            $('#gallery-module .gallery .hover-section.left').click(function() {
                slider.goToPreviousSlide();
                Slideshow.resetTimer();
            });

            $('#gallery-module .gallery .hover-section.right').click(function() {
                slider.goToNextSlide();
                portfolioActivateLastSectionIfNeeded();
                Slideshow.resetTimer();
            });

            $('#gallery-module .gallery .hover-section.center').click(function() {

                var pinchZoomer = pinchZoomers[slider.getActiveSlide()];
                if (pinchZoomer) {
                    pinchZoomer.toggleFullscreen();
                }

                // zoomTogglePortfolio();
            });
        }

        Slideshow.init();

        // Last section!
        // slider.setPanEndCallback(function() {
        // 	console.log('PAN END CALLBACK');
        // 	portfolioActivateLastSectionIfNeeded();
        // });

        $('#gallery-module .portfolio-go-back').click(function(e) {
            e.preventDefault();

            portfolioDeactivateLastSlide();
        })


        // Bottom panel
        $('#gallery-module .overlay, #gallery-module .close-bottom-panel-button').click(function() {
            closeBottomPanel(Power4.easeInOut);
        });

        $('#gallery-module .control-panel .list-button-container .circle-button-container').click(function() {
            openBottomPanel();
        });

        $('#gallery-module .bottom-panel .thumbnail').click(function() {
            // temporary click action

            closeBottomPanel(Power4.easeInOut);

            galleryChangePhoto($(this).data('item-id'));
        });



        // PINCH ZOOM OPERATOR INIT

        // Every single element has pinch recognizer!!! That'll be much easier. Automatically solves problem of last slide.

        PinchZoomer.prototype.getInitialScale = function() {
            return parseFloat(this.container.data('scale'));
        }

        PinchZoomer.prototype.getInitialTranslate = function() {
            return parseFloat(this.container.data('translateY'));
        }

        PinchZoomer.prototype.getInitialWidth = function() {
            return parseFloat(this.container.data('width'));
        }

        PinchZoomer.prototype.getInitialHeight = function() {
            return parseFloat(this.container.data('height'));
        }

        // Check if given scale qualifes for being a thumbnail and therefore being snapped to thumbnail
        PinchZoomer.prototype.hasThumbnailScale = function(scale) {
            if (typeof scale === 'undefined') { scale = this.getParams().scale; }
            return scale < this.getFullscreenScale() + 0.01;
        }

        PinchZoomer.prototype.getFullscreenScale = function() {
            return 1 / this.getInitialScale();
        }

        PinchZoomer.prototype.setPhotoZoom = function(vals) {

            var initialScale = this.getInitialScale();

            var boundaries = this.getBoundaries();
            var boundariesCenter = {
                x: boundaries.left + boundaries.width / 2,
                y: boundaries.top + boundaries.height / 2
            }

            var translate = {
                x: boundariesCenter.x - vals.x,
                y: boundariesCenter.y - vals.y
            }

            translate.x = translate.x * vals.scale * this.container.width();
            translate.y = translate.y * vals.scale * this.container.height();

            TweenMax.set(this.photo, { x: translate.x, y: translate.y, scale: vals.scale * initialScale });

            if (this.isPinching()) {
                if (vals.scale > 1 || isFullscreenSlider) {
                    Interface.hide();
                }
                else {
                    Interface.show();
                }
            }
        }

        PinchZoomer.prototype.zoomInToViewPort = function(animated) {
            isFullscreenSlider = true;

            var scale = this.getFullscreenScale();

            this.goTo({ x: 0.5, y: 0.5, scale: scale }, animated); // This 1% prevents us from snapping fullscreen to thumbnail
        }

        PinchZoomer.prototype.zoomOut = function(animated) {
            isFullscreenSlider = false;
            this.goTo({ x: 0.5, y: 0.5, scale: 1 }, animated);
        }

        PinchZoomer.prototype.normalize = function() {
            this.onMoveEndListenerBlocked = true;

            if (isFullscreenSlider) {
                this.zoomInToViewPort(false);
            }
            else {
                this.zoomOut(false);
            }

            this.onMoveEndListenerBlocked = false;
        }

        PinchZoomer.prototype.toggleFullscreen = function() {
            if (!isFullscreenSlider && this.hasThumbnailScale()) {
                this.zoomInToViewPort(true);
            }
            else {
                this.zoomOut(true);
            }
        }

        function normalizeActivePinchZoomers(includeActive) {

            for(var i = slider.getActiveSlide() - 1; i <= slider.getActiveSlide() + 1; i++) {

                if (!includeActive && i == slider.getActiveSlide()) { continue; }

                var pinchZoomer = pinchZoomers[i];
                if (pinchZoomer) {
                    pinchZoomer.normalize();
                }

            }
        }

        function initPinchZoomers() {

            isFullscreenSlider = false;
            Interface.show();

            if (pinchZoomers) {
                for(var i = 0; i < pinchZoomers.length; i++) {
                    pinchZoomers[i].disable();
                }
            }

            pinchZoomers = [];

            var containerWidth = $('body').width();
            var containerHeight = ViewPortManager.getCurrentViewportHeight();

            $('#gallery-module .gallery .item-container').each(function(index) {
                var _this = this;

                var pinchZoomer = new PinchZoomer($(this));
                pinchZoomer.container = $(this);
                pinchZoomer.photo = $(this).find('.photo');
                pinchZoomer.onMoveEndListenerBlocked = false;

                pinchZoomer.setAnimationCurve(Power4.easeOut);
                pinchZoomer.setAnimationTime(0.4);

                // Boundaries!
                var width = pinchZoomer.getInitialWidth() / containerWidth * pinchZoomer.getInitialScale();
                var height = pinchZoomer.getInitialHeight() / containerHeight * pinchZoomer.getInitialScale();

                var boundaries = {
                    width: width,
                    height: height,
                    left: (1 - width) / 2,
                    top: (1 - height) / 2 + pinchZoomer.getInitialTranslate() / containerHeight
                };

                pinchZoomer.setBoundaries(boundaries);

                pinchZoomer.setOnMoveListener(function(vals) {
                    pinchZoomer.setPhotoZoom(vals);
                });

                pinchZoomer.setOnMoveStartListener(function() {
                    isFullscreenSlider = false;
                });

                pinchZoomer.setCustomSnapFunction(function(boundaries, zoomArea) {

                    zoomArea.scale = Math.min(zoomArea.scale, 5);

                    var targetParams = PinchZoomer.standardSnapFunction(boundaries, zoomArea);

                    // Snap to thumbnail if needed (we need to remember that proper fullscreen photo of width-snapped-to-edges photo may qualify as thumbnail -> therefore exception for isFullscreenSlider!)
                    var size = 1 / (targetParams.scale);
                    if (size + 0.01 >= boundaries.width && size + 0.01 >= boundaries.height && !isFullscreenSlider) {
                        targetParams.x = 0.5;
                        targetParams.y = 0.5;
                        targetParams.scale = 1;
                    }

                    return targetParams;
                });


                pinchZoomer.setOnBeforeMoveEndListener(function(vals) {

                    if (pinchZoomer.onMoveEndListenerBlocked) { return; }

                    normalizeActivePinchZoomers(false);

                    if (pinchZoomer.hasThumbnailScale(vals.scale)) {

                        if (isFullscreenSlider) { // If thumbnail size, we can have also full width photo as thumbnail.
                            Interface.hide()
                        } else {
                            Interface.show()
                        }

                        slider.enable();
                        pinchZoomer.disablePan();
                    }
                    else {
                        Interface.hide();

                        slider.disable();
                        pinchZoomer.enablePan();
                    }
                })

                pinchZoomer.setOnMoveEndListener(function(vals) {

                });

                pinchZoomer.enable();
                pinchZoomer.disablePan();

                pinchZoomers.push(pinchZoomer);
            });

            normalizeActivePinchZoomers(true);

            // Disable pinch zoom while swiping slider
            slider.setPanStartCallback(function() {
                for(var i = 0; i < pinchZoomers.length; i++) {
                    pinchZoomers[i].disable();
                }
            });

            slider.setPanEndCallback(function() {
                for(var i = 0; i < pinchZoomers.length; i++) {
                    pinchZoomers[i].enable();
                }


                portfolioActivateLastSectionIfNeeded();

                hideOtherPortfoliosOnMobile();
            });

        }

        // TAP RECOGNIZER

        if (supportsTouch()) {

            tapRecognizer = new function() {

                var mc = new Hammer($('#gallery-module .gallery')[0], { domEvents: true, taps: 2 });

                this.enable = function() {

                    mc.on("tap", function(ev) {
                        if (ev.tapCount == 2) {

                            var pinchZoomer = pinchZoomers[slider.getTargetSlide()];
                            if (pinchZoomer) {
                                pinchZoomer.toggleFullscreen();
                            }
                        }

                        //fix - link doesn't work on mobile
                        if(ev.target.className != 'portfolio-link') {
                            ev.preventDefault();
                        }
                    });
                }

                this.disable = function() {
                    mc.off("tap");
                }

            }

            tapRecognizer.enable();
        }

        initPinchZoomers();

        portfolioUpdateActivePhotos(0);
        updateArrows(0);
        updatePortfolioCounter();
        calculateHoverSectionsForPortfolio();

        MorePortfolios.init();

        // Share buttons

        $('#gallery-module .share-toggle').click(function() {
            $('#gallery-module .share-buttons').toggleClass('visible');
        });
    }

    this.deinit = function() {
        $(window).off("resize", resizeCallback);
        ScrollEvents.unregister(BottomPanel.scrollCallback);

    }

}

GalleryModule = new GalleryModule();

