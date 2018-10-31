export default function AnimationEngine(animationFunction, animationTime) {

    let startPosition = null;
    let endPosition = null;
    let updateCallback = null;
    let finishCallback = null;
    let start = null;
    let requestAnimationId = null;
    animationTime *= 1000;

    this.animate = function(from, to, updateCb, finishCb) {
        start = null;
        startPosition = from;
        endPosition = to;
        updateCallback = updateCb;
        finishCallback = finishCb;

        requestAnimationId = window.requestAnimationFrame(draw);
    };

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

    this.killAnimation = function () {
        window.cancelAnimationFrame(requestAnimationId);
    }
}