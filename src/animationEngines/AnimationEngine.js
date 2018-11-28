function AnimationEngine(animationFunction, animationTime) {

    let startPosition = null;
    let endPosition = null;
    let updateCallback = null;
    let finishCallback = null;
    let start = null;
    let requestAnimationId = null;
    animationTime *= 1000;

    function draw(timestamp) {
        if (!start) start = timestamp;

        let t = (timestamp - start) / animationTime;
        let currentXPosition = startPosition + ( endPosition - startPosition ) * animationFunction(t);

        updateCallback(currentXPosition);

        if (start + animationTime <= timestamp) {
            if (finishCallback) finishCallback(currentXPosition);

            return;
        }

        requestAnimationId = window.requestAnimationFrame(draw);
    }

    this.animate = function(from, to, updateCb, finishCb) {
        start = null;
        startPosition = from;
        endPosition = to;
        updateCallback = updateCb;
        finishCallback = finishCb;

        requestAnimationId = window.requestAnimationFrame(draw);
    };

    this.killAnimation = function () {
        window.cancelAnimationFrame(requestAnimationId);
    }
}

AnimationEngine.Ease = {
    linear: function (t) { return t },
    inQuad: function (t) { return t*t },
    outQuad: function (t) { return t*(2-t) },
    inOutQuad: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    inCubic: function (t) { return t*t*t },
    outCubic: function (t) { return (--t)*t*t+1 },
    inOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    inQuart: function (t) { return t*t*t*t },
    outQuart: function (t) { return 1-(--t)*t*t*t },
    inOutQuart: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    inQuint: function (t) { return t*t*t*t*t },
    outQuint: function (t) { return 1+(--t)*t*t*t*t },
    inOutQuint: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },
    inExpo: function (t) { return Math.pow( 2, 10 * (t - 1) ); },
    outExpo: function (t) { return ( -Math.pow( 2, -10 * t ) + 1 ); },
};

export default AnimationEngine;