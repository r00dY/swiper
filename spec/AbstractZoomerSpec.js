import AbstractZoomer from '../src/AbstractZoomer';

/**
 * The pinch zoomer that doesn't allow for any edge effect. When you go beyond the edge, it simply stays at max position.
 */
function getZoomerWithoutEdgeEffects() {

    let zoomer = new AbstractZoomer();

    zoomer.containerSize = {
        width: 1000,
        height: 2000,
    };

    zoomer.itemSize = {
        width: 500,
        height: 1500
    };

    zoomer.overscrollFunction = (x) => 0; // Let's disable non-linearities at all

    return zoomer;
}


describe("AbstractZoomer", function() {

    /**
     * NO ZOOM
     */

    it("snaps properly without zoom (centered) ", function() {

        let zoomer = getZoomerWithoutEdgeEffects();

        zoomer.moveTo({
            x: 0,
            y: 0,
            scale: 1
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });



    it("snaps properly without zoom (left) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();

        zoomer.moveTo({
            x: -100,
            y: 0,
            scale: 1
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly without zoom (right) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 100,
            y: 0,
            scale: 1
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly without zoom (top) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: -100,
            scale: 1
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly without zoom (bottom)", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 100,
            scale: 1
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly without zoom (both directions)", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 500,
            y: 500,
            scale: 1
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });


    /**
     * POSITIVE ZOOM
     */

    it("snaps properly with positive zoom (centered) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 0,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with positive zoom (left, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: -100,
            y: 0,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(-100);
        expect(zoomer.coords.y).toBe(0);
    });



    it("snaps properly with positive zoom (left, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: -2000,
            y: 0,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(-500);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with positive zoom (right, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 100,
            y: 0,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(100);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with positive zoom (right, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 2000,
            y: 0,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(500);
        expect(zoomer.coords.y).toBe(0);
    });



    it("snaps properly with positive zoom (top, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: -100,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(-100);
    });

    it("snaps properly with positive zoom (top, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: -4000,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(-2000);
    });

    it("snaps properly with positive zoom (bottom, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 100,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(100);
    });

    it("snaps properly with positive zoom (bottom, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 4000,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(2000);
    });

    it("snaps properly without zoom (both directions, no snap)", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 100,
            y: 100,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(100);
        expect(zoomer.coords.y).toBe(100);
    });

    it("snaps properly without zoom (both directions, snap)", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 2000,
            y: 4000,
            scale: 4
        });

        expect(zoomer.coords.x).toBe(500);
        expect(zoomer.coords.y).toBe(2000);
    });


    /**
     * NEGATIVE ZOOM
     */

    it("snaps properly with negative zoom (centered) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 0,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (left, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: -100,
            y: 0,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (left, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: -2000,
            y: 0,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (right, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 100,
            y: 0,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (right, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 2000,
            y: 0,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (top, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: -100,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (top, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: -4000,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (bottom, no snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 100,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly with negative zoom (bottom, snap) ", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 0,
            y: 4000,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly without zoom (both directions, no snap)", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 100,
            y: 100,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

    it("snaps properly without zoom (both directions, snap)", function() {
        let zoomer = getZoomerWithoutEdgeEffects();
        zoomer.moveTo({
            x: 2000,
            y: 4000,
            scale: 0.5
        });

        expect(zoomer.coords.x).toBe(0);
        expect(zoomer.coords.y).toBe(0);
    });

});