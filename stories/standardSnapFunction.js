
let getItemArea = function (pos, itemSize) {

    let half = {
        w: itemSize.width / 2 * pos.scale,
        h: itemSize.height / 2 * pos.scale
    };

    return {
        top: pos.y - half.h,
        bottom: pos.y + half.h,
        left: pos.x - half.w,
        right: pos.x + half.w,
        x: pos.x,
        y: pos.y,
        width: itemSize.width * pos.scale,
        height: itemSize.height * pos.scale
    };
};

function standardSnapFunction (pos, containerSize, itemSize)  {

    let newPos = {
        scale: pos.scale
    };

    if (newPos.scale < 1) {
        newPos.scale = 1;
    }
    else if (newPos.scale > 5) {
        newPos.scale = 5;
    }

    let itemArea = getItemArea(Object.assign({}, pos, { scale: newPos.scale }), itemSize);

    // X
    if (itemArea.width <= containerSize.width) {
        newPos.x = 0;
    }
    else if (itemArea.left > -containerSize.width / 2) {
        newPos.x = (itemArea.width - containerSize.width) / 2;
    }
    else if (itemArea.right < containerSize.width / 2) {
        newPos.x = -(itemArea.width - containerSize.width) / 2;
    }
    else {
        newPos.x = itemArea.x;
    }

    // Y
    if (itemArea.height <= containerSize.height) {
        newPos.y = 0;
    }
    else if (itemArea.top > -containerSize.height / 2) {
        newPos.y = (itemArea.height - containerSize.height) / 2;
    }
    else if (itemArea.bottom < containerSize.height / 2) {
        newPos.y = -(itemArea.height - containerSize.height) / 2;
    }
    else {
        newPos.y = itemArea.y;
    }
    return newPos;
}

export default standardSnapFunction;
