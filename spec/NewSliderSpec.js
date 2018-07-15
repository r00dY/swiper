let NewSwiper = require("../NewSwiper");

describe("NewSwiper (no animations / finite mode)", function() {

    let swiper;

    beforeEach(function() {

        swiper = new NewSwiper();

        swiper.containerSize = 500;
        swiper.count = 5;
        swiper.leftOffset = 100;
        swiper.rightOffset = 200;

        swiper.slideSizeFunction = function(n) {
            return (n + 1) * 10 + 300;
        };

        swiper.slideMargin = function(n) {
            return (n + 1) * 10;
        };
        swiper.slideSnapOffset = function(n) {
            return (n + 1) * 10;
        };

        swiper.overscrollFunction = (x) => {
            return x / 2;
        };

        swiper.init();
    });

    it("returns correct slideable width", function() {
        expect(swiper.slideableWidth).toBe(100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40 + 350 + 200);
    });

    it("returns correct max position", function() {
        expect(swiper.maxPos).toBe(swiper.slideableWidth - 500);
    });

    it("has properly set initial positions", function() {
        expect(swiper.slideCoord(0)).toBe(100);
        expect(swiper.slideCoord(1)).toBe(100 + 310 + 10);
        expect(swiper.slideCoord(4)).toBe(100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("moves properly to the position without going beyond edges", function() {
        swiper.moveTo(500, false);
        expect(swiper.slideCoord(0)).toBe(-500 + 100);
        expect(swiper.slideCoord(1)).toBe(-500 + 100 + 310 + 10);
        expect(swiper.slideCoord(4)).toBe(-500 + 100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);

        swiper.moveTo(888, false);
        expect(swiper.slideCoord(0)).toBe(-888 + 100);
        expect(swiper.slideCoord(1)).toBe(-888 + 100 + 310 + 10);
        expect(swiper.slideCoord(4)).toBe(-888 + 100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("moves properly with overscroll on the left", function() {
        swiper.moveTo(-100, false);
        expect(swiper.slideCoord(0)).toBe(50 + 100);
        expect(swiper.slideCoord(1)).toBe(50 + 100 + 310 + 10);
        expect(swiper.slideCoord(4)).toBe(50 + 100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
        expect(swiper.pos).toBe(-100); // pos should stay untouched by overscroll function
    });

    it("moves properly with overscroll on the right", function() {
        swiper.moveTo(swiper.maxPos + 100, false);
        expect(swiper.slideCoord(0)).toBe(-swiper.maxPos - 50 + 100);
        expect(swiper.pos).toBe(swiper.maxPos + 100); // pos should stay untouched by overscroll function
    });

    it("moves properly to the specific slide (taking snap points into account)", function() {
        swiper.moveToSlide(0, false);
        expect(swiper.slideCoord(0)).toBe(10);

        swiper.moveToSlide(1, false);
        expect(swiper.slideCoord(1)).toBe(20);

        swiper.moveToSlide(4, false);
        expect(swiper.slideCoord(4)).toBe(50);
    });

    it("snaps properly to the beginning", function() {
        swiper.moveTo(-100, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(0)).toBe(100);
    });

    it("snaps properly to first slide", function() {
        swiper.moveTo(100, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly to the left slide when distance identical", function() {
        swiper.moveTo(245, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly to the right slide if distance is minimally bigger than to the left", function() {
        swiper.moveTo(246, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(1)).toBe(20);
    });

    it("snaps properly to the end", function() {
        swiper.moveTo(100000, false);
        swiper.snap(0, false);
        expect(swiper.pos).toBe(swiper.maxPos);
    });

    // Minimum velocity (1)

    it("snaps properly with negative velocity and overscroll on the left", function() {
        swiper.moveTo(-100, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(0)).toBe(100);
    });

    it("snaps properly with positive velocity and overscroll on the left", function() {
        swiper.moveTo(-100, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(0)).toBe(100);
    });

    it("snaps properly with positive velocity and overscroll on the right", function() {
        swiper.moveTo(100000, false);
        swiper.snap(1, false);
        expect(swiper.pos).toBe(swiper.maxPos);
    });

    it("snaps properly with negative velocity and overscroll on the right", function() {
        swiper.moveTo(100000, false);
        swiper.snap(-1, false);
        expect(swiper.pos).toBe(swiper.maxPos);
    });

    it("snaps properly with negative velocity and closer to left item", function() {
        swiper.moveTo(200, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly with positive velocity and closer to left item", function() {
        swiper.moveTo(200, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(1)).toBe(20);
    });

    it("snaps properly with negative velocity and closer to right item", function() {
        swiper.moveTo(350, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly with positive velocity and closer to right item", function() {
        swiper.moveTo(350, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(1)).toBe(20);
    });







});


describe("NewSwiper (no animations / infinite mode)", function() {

    let swiper;

    beforeEach(function() {

        swiper = new NewSwiper();

        swiper.containerSize = 500;
        swiper.count = 5;
        swiper.leftOffset = 100;
        swiper.rightOffset = 200;
        swiper.infinite = true;

        swiper.slideSizeFunction = function(n) {
            return (n + 1) * 10 + 300;
        };

        swiper.slideMargin = function(n) {
            return (n + 1) * 10;
        };
        swiper.slideSnapOffset = function(n) {
            return (n + 1) * 10;
        };

        swiper.init();
    });

    it("returns correct slideable width", function() {
        expect(swiper.slideableWidth).toBe(310 + 10 + 320 + 20 + 330 + 30 + 340 + 40 + 350 + 50);
    });

    it("has properly set initial positions", function() {
        expect(swiper.slideCoord(0)).toBe(10);
        expect(swiper.slideCoord(1)).toBe(10 + 310 + 10);
        // expect(swiper.slideCoord(4)).toBe(undefined);
    });

    it("moves properly to the position from 0 to SW", function() {
        swiper.moveTo(0, false);
        expect(swiper.slideCoord(0)).toBe(0);
        // expect(swiper.slideCoord(1)).toBe(310 + 10);
        // expect(swiper.slideCoord(2)).toBe(undefined);
        // expect(swiper.slideCoord(3)).toBe(undefined);
        // expect(swiper.slideCoord(4)).toBe(undefined);

        swiper.moveTo(200, false);
        expect(swiper.slideCoord(0)).toBe(-200 + 0);
        expect(swiper.slideCoord(1)).toBe(-200 + 310 + 10);
        expect(swiper.slideCoord(2)).toBe(-200 + 310 + 10 + 320 + 20);
        // expect(swiper.slideCoord(3)).toBe(undefined);
        // expect(swiper.slideCoord(4)).toBe(undefined);

        swiper.moveTo(600, false);
        // expect(swiper.slideCoord(0)).toBe(undefined);
        expect(swiper.slideCoord(1)).toBe(-600 + 310 + 10);
        expect(swiper.slideCoord(2)).toBe(-600 + 310 + 10 + 320 + 20);
        expect(swiper.slideCoord(3)).toBe(-600 + 310 + 10 + 320 + 20 + 330 + 30);
        // expect(swiper.slideCoord(4)).toBe(undefined);

        swiper.moveTo(1000, false);
        // expect(swiper.slideCoord(0)).toBe(undefined);
        // expect(swiper.slideCoord(1)).toBe(undefined);
        // expect(swiper.slideCoord(2)).toBe(undefined);
        expect(swiper.slideCoord(3)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30);
        expect(swiper.slideCoord(4)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);

        swiper.moveTo(1400, false);
        expect(swiper.slideCoord(0)).toBe(swiper.slideableWidth - 1400);
        // expect(swiper.slideCoord(1)).toBe(undefined);
        // expect(swiper.slideCoord(2)).toBe(undefined);
        // expect(swiper.slideCoord(3)).toBe(undefined);
        expect(swiper.slideCoord(4)).toBe(-1400 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("moves properly to the position from any position (wrapping)", function() {
        swiper.moveTo(0 - swiper.slideableWidth, false);
        expect(swiper.slideCoord(0)).toBe(0);
        expect(swiper.slideCoord(1)).toBe(310 + 10);
        // expect(swiper.slideCoord(2)).toBe(undefined);
        // expect(swiper.slideCoord(3)).toBe(undefined);
        // expect(swiper.slideCoord(4)).toBe(undefined);

        swiper.moveTo(200 - swiper.slideableWidth * 2, false);
        expect(swiper.slideCoord(0)).toBe(-200 + 0);
        expect(swiper.slideCoord(1)).toBe(-200 + 310 + 10);
        expect(swiper.slideCoord(2)).toBe(-200 + 310 + 10 + 320 + 20);
        // expect(swiper.slideCoord(3)).toBe(undefined);
        // expect(swiper.slideCoord(4)).toBe(undefined);

        swiper.moveTo(600 - swiper.slideableWidth * 4, false);
        // expect(swiper.slideCoord(0)).toBe(undefined);
        expect(swiper.slideCoord(1)).toBe(-600 + 310 + 10);
        expect(swiper.slideCoord(2)).toBe(-600 + 310 + 10 + 320 + 20);
        expect(swiper.slideCoord(3)).toBe(-600 + 310 + 10 + 320 + 20 + 330 + 30);
        // expect(swiper.slideCoord(4)).toBe(undefined);

        swiper.moveTo(1000 + swiper.slideableWidth, false);
        // expect(swiper.slideCoord(0)).toBe(undefined);
        // expect(swiper.slideCoord(1)).toBe(undefined);
        // expect(swiper.slideCoord(2)).toBe(undefined);
        expect(swiper.slideCoord(3)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30);
        expect(swiper.slideCoord(4)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);

        swiper.moveTo(1400 + 2 * swiper.slideableWidth, false);
        expect(swiper.slideCoord(0)).toBe(swiper.slideableWidth - 1400);
        // expect(swiper.slideCoord(1)).toBe(undefined);
        // expect(swiper.slideCoord(2)).toBe(undefined);
        // expect(swiper.slideCoord(3)).toBe(undefined);
        expect(swiper.slideCoord(4)).toBe(-1400 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("snaps properly", function() {
        swiper.moveTo(0, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly to the left slide when distance identical", function() {
        swiper.moveTo(145, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly to the right slide if distance is minimally bigger than to the left", function() {
        swiper.moveTo(146, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(1)).toBe(20);
    });

    it("snaps properly to 4th slide", function() {
        swiper.moveTo(1000, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(3)).toBe(40);
    });

    it("snaps properly with wrapping to the left", function() {
        swiper.moveTo(1550, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(4)).toBe(50);
    });

    it("snaps properly with wrapping to the right", function() {
        swiper.moveTo(1650, false);
        swiper.snap(0, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    // VELOCITY 1

    it("snaps properly with negative velocity and closer to left item", function() {
        swiper.moveTo(350 + 10, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(1)).toBe(20);
    });

    it("snaps properly with positive velocity and closer to left item", function() {
        swiper.moveTo(350 + 10, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(2)).toBe(30);
    });

    it("snaps properly with negative velocity and closer to right item", function() {
        swiper.moveTo(550, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(1)).toBe(20);
    });

    it("snaps properly with positive velocity and closer to right item", function() {
        swiper.moveTo(550, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(2)).toBe(30);
    });

    it("snaps properly with negative velocity and closer to left item + wrapping", function() {
        swiper.moveTo(-350, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(4)).toBe(50);
    });

    it("snaps properly with positive velocity and closer to left item + wrapping", function() {
        swiper.moveTo(-350, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });

    it("snaps properly with negative velocity and closer to right item + wrapping", function() {
        swiper.moveTo(-50, false);
        swiper.snap(-1, false);
        expect(swiper.slideCoord(4)).toBe(50);
    });

    it("snaps properly with positive velocity and closer to right item + wrapping", function() {
        swiper.moveTo(-50, false);
        swiper.snap(1, false);
        expect(swiper.slideCoord(0)).toBe(10);
    });




});