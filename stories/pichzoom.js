
// Hammer pinch zoom.

// var __pinchZoomer_standardSnapFunction =

var PinchZoomer = function(containerSelector) {
    var _this = this;
    var _container = $(containerSelector);

    var HAMMER_EVENTS = "pinch pinchstart pinchmove pinchend pinchcancel pinchin pinchout pan panup panleft panright pandown panstart panend tap";

    var mc = new Hammer(_container[0], { domEvents: true });
    mc.get('pinch').set({ enable: true });
    mc.get('pan').set({ direction: Hammer.DIRECTION_ALL, threshold: 0 });


    // Zoom center and current center are coordinates respective to initial canvas.
    var _zoomCenterRelative = {};
    var _currentParams = { x: 0.5, y: 0.5, scale: 1 };

    var _velocity = { x: 0, y: 0, valX: 0, valY: 0 };

    var _previousEv; // last event from move. We ignore events from panend / pancancel, they can be misleading.
    var _initPinchValues; // sometimes scale for pinch zoom doesn't start at 1!

    var _initPanValues; // should be defined if pan should work. They are init deltas!

    var _isPinching = false;

    var _animationCurve = Expo.easeOut;
    var _animationTime = 0.5;


    var _anims = [];
    function addAnim(anim) {
        _anims.push(anim);
    }

    function killAnims() {
        for(var i = 0; i < _anims.length; i++) {
            _anims[i].kill();
        }

        _anims = [];
        animationCancelled = true;
    }

    this.setAnimationCurve = function(curve) {
        _animationCurve = curve;
    }

    this.setAnimationTime = function(time) {
        _animationTime = time;
    }


    this.getParams = function() {
        return _currentParams;
    }

    function combineCurrentWithRelative(ev) {
        var s = ev.scale / _initPinchValues.scale;

        var centerRelative = {
            x: (1 / (s * 2)) + _zoomCenterRelative.x * (1 - 1 / s),
            y: (1 / (s * 2)) + _zoomCenterRelative.y * (1 - 1 / s)
        }

        var tX = ev.center.x / _container.width() - _zoomCenterRelative.x;
        var tY = ev.center.y / _container.height() - _zoomCenterRelative.y;

        return {
            x: centerRelative.x / _currentParams.scale + _currentParams.x - 1 / (2 * _currentParams.scale) - tX / (s * _currentParams.scale),
            y: centerRelative.y / _currentParams.scale + _currentParams.y - 1 / (2 * _currentParams.scale) - tY / (s * _currentParams.scale),
            scale: _currentParams.scale * s
        }
    }

    function onPinch(ev) {

        _onMoveListener(combineCurrentWithRelative(ev));

        _previousEv = ev;
    }

    function snapToBoundaries(params, animated) {

        if (typeof animated === 'undefined') { animated = true; }

        var targetParams;

        if (typeof _customSnapFunction == 'function') {

            // Primitive way of copying objects -> quick thing for now.
            var newBoundaries = {
                left: _boundaries.left,
                top: _boundaries.top,
                width: _boundaries.width,
                height: _boundaries.height
            }

            var newParams = {
                x: params.x,
                y: params.y,
                scale: params.scale
            }

            targetParams = _customSnapFunction(newBoundaries, newParams);
        }
        else {
            targetParams = PinchZoomer.standardSnapFunction(_boundaries, params);
        }

        _onBeforeMoveEndListener(targetParams);

        if (animated) {

            var animationData = { ease: _animationCurve, onUpdate: function() {
                    _onMoveListener(_currentParams)
                }, onComplete: _onMoveEndListener };

            animationData.x = targetParams.x;
            animationData.y = targetParams.y;
            animationData.scale = targetParams.scale;

            addAnim(TweenMax.to(_currentParams, _animationTime, animationData));
        }
        else {
            _currentParams = targetParams;

            _onMoveListener(_currentParams);
            _onMoveEndListener(_currentParams);
        }
    }


    /* ANIMATION ON EDGES! */

    function easeOutQuart(t, b, c, d) {
        t /= d;
        t--;
        return -c * (t*t*t*t - 1) + b;
    };

    var MAX_VELOCITY = 0.03;
    var TRESHOLD_VELOCITY = MAX_VELOCITY / 100;
    var MAX_TIME = 800;

    function velocityFunction(t) { // millis from 0 to 1000 and value from 3 to 0.

        if (t <= 0) { return MAX_VELOCITY; }
        if (t >= MAX_TIME) { return 0; }

        return easeOutQuart(t, MAX_VELOCITY, -MAX_VELOCITY, MAX_TIME);
    }

    function inverseVelocityFunction(v) {

        var abs = Math.abs(v);

        if (abs >= MAX_VELOCITY) { return 0; }

        var delta = MAX_TIME / 100;

        for(var i = 0; i < MAX_TIME; i += delta) {
            var valCur = velocityFunction(i);
            var valNext = velocityFunction(i + delta);

            if (valCur >= abs && abs >= valNext) {
                return i + delta;
            }
        }
    }

    var initTime;
    var initTimeVals;
    var animationCancelled;

    var prevTime;

    function calculateAnimationFrame() {

        if (animationCancelled) { return; }

        var curTime = new Date().getTime();
        var deltaT = curTime - prevTime;
        prevTime = curTime;

        var deltaTFromInit = new Date().getTime() - initTime;

        var timeVals = {
            x: deltaTFromInit + initTimeVals.x,
            y: deltaTFromInit + initTimeVals.y
        }

        var isFinished = true;
        var half = 1 / (2 * _currentParams.scale);
        var c = 0.15;

        if (timeVals.x < MAX_TIME) {
            isFinished = false;

            _velocity.x = Math.sign(_velocity.x) * velocityFunction(timeVals.x);

            var newX = _currentParams.x - _velocity.x * deltaT * c;
            if (newX - half < _boundaries.left) {
                newX = _boundaries.left + half;
            }
            else if (newX + half > _boundaries.left + _boundaries.width) {
                newX = _boundaries.left + _boundaries.width - half;
            }

            _currentParams.x = newX;
        }

        if (timeVals.y < MAX_TIME) {
            isFinished = false;

            _velocity.y = Math.sign(_velocity.y) * velocityFunction(timeVals.y);

            var newY = _currentParams.y - _velocity.y * deltaT * c;
            if (newY - half < _boundaries.top) {
                newY = _boundaries.top + half;
            }
            if (newY + half > _boundaries.top + _boundaries.height) {
                newY = _boundaries.top + _boundaries.height - half;
            }

            _currentParams.y = newY;
        }

        _onMoveListener(_currentParams);

        if (!isFinished) {
            requestAnimationFrame(calculateAnimationFrame);
        }


    }

    function startAnimatingCenter() {

        animationCancelled = false;

        initTime = new Date().getTime();
        prevTime = new Date().getTime();

        _velocity.x = _velocity.x / _container.width();
        _velocity.y = _velocity.y / _container.height();

        initTimeVals = {
            x: inverseVelocityFunction(_velocity.x),
            y: inverseVelocityFunction(_velocity.y)
        }

        // If on startAnimatingCenter beyond boundaries -> no vector decreasing, just snap back!
        var half = 1 / (2 * _currentParams.scale);

        if (2*half >= _boundaries.width) {
            initTimeVals.x = MAX_TIME;
            addAnim(TweenMax.to(_currentParams, _animationTime, { x: _boundaries.left + _boundaries.width / 2, ease: _animationCurve, onUpdate: function() { _onMoveListener(_currentParams); } }));
        }
        else if (_currentParams.x - half <= _boundaries.left) {
            initTimeVals.x = MAX_TIME;
            addAnim(TweenMax.to(_currentParams, _animationTime, { x: _boundaries.left + half, ease: _animationCurve, onUpdate: function() { _onMoveListener(_currentParams); } }));
        }
        else if (_currentParams.x + half >= _boundaries.left + _boundaries.width) {
            initTimeVals.x = MAX_TIME;
            addAnim(TweenMax.to(_currentParams, _animationTime, { x: _boundaries.left + _boundaries.width - half, ease: _animationCurve, onUpdate: function() { _onMoveListener(_currentParams); } }));
        }

        if (2*half >= _boundaries.height) {
            initTimeVals.y = MAX_TIME;
            addAnim(TweenMax.to(_currentParams, _animationTime, { y: _boundaries.top + _boundaries.height / 2, ease: _animationCurve, onUpdate: function() { _onMoveListener(_currentParams); } }));
        }
        else if (_currentParams.y - half <= _boundaries.top) {
            initTimeVals.y = MAX_TIME;
            addAnim(TweenMax.to(_currentParams, _animationTime, { y: _boundaries.top + half, ease: _animationCurve, onUpdate: function() { _onMoveListener(_currentParams); } }));
        }
        else if (_currentParams.y + half >= _boundaries.top + _boundaries.height) {
            initTimeVals.y = MAX_TIME;
            addAnim(TweenMax.to(_currentParams, _animationTime, { y: _boundaries.top + _boundaries.height - half, ease: _animationCurve, onUpdate: function() { _onMoveListener(_currentParams); } }));
        }

        requestAnimationFrame(calculateAnimationFrame);



    }

    function onPinchEnd(ev) {
        var newValues = combineCurrentWithRelative(_previousEv);
        _currentParams.x = newValues.x;
        _currentParams.y = newValues.y;
        _currentParams.scale = newValues.scale;

        snapToBoundaries(_currentParams);
    }

    function onPan(ev) {
        _onMoveListener({
            x: _currentParams.x + (-(ev.deltaX - _initPanValues.deltaX) / _container.width()) / _currentParams.scale,
            y: _currentParams.y + (-(ev.deltaY - _initPanValues.deltaY) / _container.height()) /  _currentParams.scale,
            scale: _currentParams.scale
        });
    }

    function onPanEnd(ev) {

        _currentParams.x = _currentParams.x + (-(ev.deltaX - _initPanValues.deltaX) / _container.width()) / _currentParams.scale;
        _currentParams.y = _currentParams.y + (-(ev.deltaY - _initPanValues.deltaY) / _container.height()) /  _currentParams.scale;

        // snapToBoundaries(_currentParams);

        // if (Math.abs(ev.velocity) > 0.01) {
        _velocity.x = ev.velocityX;
        _velocity.y = ev.velocityY;

        // _velocity.signX = Math.sign(ev.velocityX);
        // _velocity.signY = Math.sign(ev.velocityY);

        // _velocity.valX = Math.abs(ev.velocityX);
        // _velocity.valY = Math.abs(ev.velocityY);

        startAnimatingCenter();
        // }

    }

    this.goTo = function(params, animated) {

        snapToBoundaries(params, animated);

    }

    var hammerCallback = function(ev) {

        switch(ev.type) {

            case "pinchstart":
                _onMoveStartListener();

                killAnims();

                _isPinching = true;

                _initPinchValues = ev;
                _zoomCenterRelative.x = ev.center.x / _container.width();
                _zoomCenterRelative.y = ev.center.y / _container.height();

                break;

            case "pinchmove":
                if (typeof _initPinchValues === 'undefined') { break; }
                // console.log('PINCH MOVE', ev);
                onPinch(ev);
                break;

            case "pinchin":
                if (typeof _initPinchValues === 'undefined') { break; }
                // console.log('PINCH IN', ev);
                onPinch(ev);
                break;

            case "pinchout":
                if (typeof _initPinchValues === 'undefined') { break; }
                // console.log('PINCH OUT', ev);
                onPinch(ev);
                break;

            case "pinchend":
                if (typeof _initPinchValues === 'undefined') { break; }

                // console.log('PINCH END', ev);

                onPinchEnd(ev);
                _isPinching = false;
                _initPinchValues = undefined;
                break;

            case "pinchcancel":
                if (typeof _initPinchValues === 'undefined') { break; }
                // console.log('PINCH CANCEL', ev);
                onPinchEnd(ev);
                _isPinching = false;
                _initPinchValues = undefined;
                break;

            case "pan":
                if (typeof _initPanValues === 'undefined') { break; }
                // console.log('PAN', ev);
                onPan(ev);
                break;

            case "panstart":
                _onMoveStartListener();

                _initPanValues = ev;
                // console.log('PAN START', ev);
                killAnims();
                break;

            case "panend":
                if (typeof _initPanValues === 'undefined') { break; }
                // console.log('PAN END', ev);

                onPanEnd(ev);
                _initPanValues = undefined;
                break;
        }


    }

    this.enable = function() {
        mc.on(HAMMER_EVENTS, hammerCallback);
    }

    this.isPinching = function() {
        return _isPinching;
    }

    this.disable = function() {
        mc.off(HAMMER_EVENTS)
    }

    this.enablePan = function() {
        mc.get('pan').set({ enable: true });
    }

    this.disablePan = function() {
        mc.get('pan').set({ enable: false });
    }

    // Set listeners

    var _onMoveListener;
    this.setOnMoveListener = function(callback) {
        _onMoveListener = callback;
    }

    var _onMoveEndListener;
    this.setOnMoveEndListener = function(callback) {
        _onMoveEndListener = callback;
    }

    var _onBeforeMoveEndListener;
    this.setOnBeforeMoveEndListener = function(callback) {
        _onBeforeMoveEndListener = callback;
    }

    var _onMoveStartListener;
    this.setOnMoveStartListener = function(callback) {
        _onMoveStartListener = callback;
    }

    var _customSnapFunction;
    this.setCustomSnapFunction = function(callback) {
        _customSnapFunction = callback;
    }


    var _boundaries = {
        top: 0,
        left: 0,
        width: 1,
        height: 1
    };

    this.setBoundaries = function(boundaries) {
        _boundaries = boundaries;
    }

    this.getBoundaries = function() {
        return _boundaries;
    }
}

PinchZoomer.standardSnapFunction = function(boundaries, zoomArea) {

    var targetParams = {
        scale: zoomArea.scale
    }

    var half = 1 / (2 * zoomArea.scale);

    zoomArea.top = zoomArea.y - half;
    zoomArea.bottom = zoomArea.y + half;
    zoomArea.left = zoomArea.x - half;
    zoomArea.right = zoomArea.x + half;
    zoomArea.width = half * 2;
    zoomArea.height = half * 2;

    // X
    if (zoomArea.width >= boundaries.width) { targetParams.x = boundaries.left + boundaries.width / 2; }
    else if (zoomArea.left < boundaries.left) { targetParams.x = boundaries.left + half; }
    else if (zoomArea.right > boundaries.left + boundaries.width) { targetParams.x = boundaries.left + boundaries.width - half; }
    else { targetParams.x = zoomArea.x; }

    // Y
    if (zoomArea.height >= boundaries.height) { targetParams.y = boundaries.top + boundaries.height / 2; }
    else if (zoomArea.top < boundaries.top) { targetParams.y = boundaries.top + half; }
    else if (zoomArea.bottom > boundaries.top + boundaries.height) { targetParams.y = boundaries.top + boundaries.height - half; }
    else { targetParams.y = zoomArea.y; }

    return targetParams;
};
