import snapStandardFunction from "../stories/standardSnapFunction";

describe("Zoomer snapStandardFunction", function() {


    let containerSize = {
        width: 1000,
        height: 2000,
    };

    let itemSize = {
        width: 500,
        height: 1500
    };

    /**
     * NO ZOOM
     */

    it("snaps properly without zoom (centered) ", function() {
        let pos = {
            x: 0,
            y: 0,
            scale: 1
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });



    it("snaps properly without zoom (left) ", function() {
        let pos = {
            x: -100,
            y: 0,
            scale: 1
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly without zoom (right) ", function() {
        let pos = {
            x: 100,
            y: 0,
            scale: 1
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly without zoom (top) ", function() {
        let pos = {
            x: 0,
            y: -100,
            scale: 1
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly without zoom (bottom)", function() {
        let pos = {
            x: 0,
            y: 100,
            scale: 1
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly without zoom (both directions)", function() {
        let pos = {
            x: 500,
            y: 500,
            scale: 1
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    /**
     * POSITIVE ZOOM
     */

    it("snaps properly with positive zoom (centered) ", function() {
        let pos = {
            x: 0,
            y: 0,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with positive zoom (left, no snap) ", function() {
        let pos = {
            x: -100,
            y: 0,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(-100);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with positive zoom (left, snap) ", function() {
        let pos = {
            x: -2000,
            y: 0,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(-500);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with positive zoom (right, no snap) ", function() {
        let pos = {
            x: 100,
            y: 0,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(100);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with positive zoom (right, snap) ", function() {
        let pos = {
            x: 2000,
            y: 0,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(500);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with positive zoom (top, no snap) ", function() {
        let pos = {
            x: 0,
            y: -100,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(-100);
    });

    it("snaps properly with positive zoom (top, snap) ", function() {
        let pos = {
            x: 0,
            y: -4000,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(-2000);
    });

    it("snaps properly with positive zoom (bottom, no snap) ", function() {
        let pos = {
            x: 0,
            y: 100,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(100);
    });

    it("snaps properly with positive zoom (bottom, snap) ", function() {
        let pos = {
            x: 0,
            y: 4000,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(2000);
    });

    it("snaps properly without zoom (both directions, no snap)", function() {
        let pos = {
            x: 100,
            y: 100,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(100);
        expect(newPos.y).toBe(100);
    });

    it("snaps properly without zoom (both directions, snap)", function() {
        let pos = {
            x: 2000,
            y: 4000,
            scale: 4
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(500);
        expect(newPos.y).toBe(2000);
    });


    /**
     * NEGATIVE ZOOM
     */

    it("snaps properly with negative zoom (centered) ", function() {
        let pos = {
            x: 0,
            y: 0,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (left, no snap) ", function() {
        let pos = {
            x: -100,
            y: 0,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (left, snap) ", function() {
        let pos = {
            x: -2000,
            y: 0,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (right, no snap) ", function() {
        let pos = {
            x: 100,
            y: 0,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (right, snap) ", function() {
        let pos = {
            x: 2000,
            y: 0,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (top, no snap) ", function() {
        let pos = {
            x: 0,
            y: -100,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (top, snap) ", function() {
        let pos = {
            x: 0,
            y: -4000,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (bottom, no snap) ", function() {
        let pos = {
            x: 0,
            y: 100,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly with negative zoom (bottom, snap) ", function() {
        let pos = {
            x: 0,
            y: 4000,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly without zoom (both directions, no snap)", function() {
        let pos = {
            x: 100,
            y: 100,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

    it("snaps properly without zoom (both directions, snap)", function() {
        let pos = {
            x: 2000,
            y: 4000,
            scale: 0.5
        };

        let newPos = snapStandardFunction(pos, containerSize, itemSize);
        expect(newPos.x).toBe(0);
        expect(newPos.y).toBe(0);
    });

});