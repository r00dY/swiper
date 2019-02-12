import AbstractSlider from "../src/AbstractSlider";

let swiper;

function sliderIrregular(extraConfig) {
    let config = {
        containerSize: () => 500, // function
        count: 5,
        leftOffset: 100, // value
        rightOffset: 200, // value
        infinite: false,
        slideSize: (n) => ((n + 1) * 10 + 300),
        slideMargin: (n) => ((n + 1) * 10),
        slideSnapOffset: (n) => ((n + 1) * 10),
        overscrollFunction: (x) => (x/2)
    };

    if (extraConfig) {
        Object.assign(config, extraConfig);
    }

    return new AbstractSlider(config);
}

function sliderRegular(extraConfig) {
    let config = {
        containerSize: () => 500,
        count: 5,
        leftOffset: () => 100,
        rightOffset: () => 200,
        infinite: false,
        slideSize: () => 500,
        overscrollFunction: (x) => (x/2)
    };

    if (extraConfig) {
        Object.assign(config, extraConfig);
    }

    return new AbstractSlider(config);
}



describe("SwiperEngine (no animations / finite mode)", function() {

    it("returns correct slideable width", function() {
        let swiper = sliderIrregular();
        expect(swiper.state.slideableWidth).toBe(100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40 + 350 + 200);
    });

    it("returns correct max position", function() {
        let swiper = sliderIrregular();
        expect(swiper.state.maxPos).toBe(swiper.state.slideableWidth - 500);
    });

    it("has properly set initial positions", function() {
        let swiper = sliderIrregular();
        expect(swiper.state.slides[0].coord).toBe(100);
        expect(swiper.state.slides[1].coord).toBe(100 + 310 + 10);
        expect(swiper.state.slides[4].coord).toBe(100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("moves properly to the position without going beyond edges", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(500, false);
        expect(swiper.state.slides[0].coord).toBe(-500 + 100);
        expect(swiper.state.slides[1].coord).toBe(-500 + 100 + 310 + 10);
        expect(swiper.state.slides[4].coord).toBe(-500 + 100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);

        swiper.moveTo(888, false);
        expect(swiper.state.slides[0].coord).toBe(-888 + 100);
        expect(swiper.state.slides[1].coord).toBe(-888 + 100 + 310 + 10);
        expect(swiper.state.slides[4].coord).toBe(-888 + 100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("moves properly with overscroll on the left", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(-100, false);
        expect(swiper.state.slides[0].coord).toBe(50 + 100);
        expect(swiper.state.slides[1].coord).toBe(50 + 100 + 310 + 10);
        expect(swiper.state.slides[4].coord).toBe(50 + 100 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
        expect(swiper.state.pos).toBe(-100); // pos should stay untouched by overscroll function
    });

    it("moves properly with overscroll on the right", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(swiper.state.maxPos + 100, false);
        expect(swiper.state.slides[0].coord).toBe(-swiper.state.maxPos - 50 + 100);
        expect(swiper.state.pos).toBe(swiper.state.maxPos + 100); // pos should stay untouched by overscroll function
    });


    it("moves properly to the specific slide (taking snap points into account)", function() {
        let swiper = sliderIrregular();
        swiper.moveToSlide(0, false);
        expect(swiper.state.slides[0].coord).toBe(10);

        swiper.moveToSlide(1, false);
        expect(swiper.state.slides[1].coord).toBe(20);

        swiper.moveToSlide(4, false);
        expect(swiper.state.slides[4].coord).toBe(50);
    });

    it("snaps properly to the beginning", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(-100, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[0].coord).toBe(100);
    });

    it("snaps properly to first slide", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(100, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    it("snaps properly to the left slide when distance identical", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(245, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    it("snaps properly to the right slide if distance is minimally bigger than to the left", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(246, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[1].coord).toBe(20);
    });

    it("snaps properly to the end", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(100000, false);
        swiper.snap(0, false);
        expect(swiper.state.pos).toBe(swiper.state.maxPos);
    });

    // Minimum velocity (1)

    it("snaps properly with negative velocity and overscroll on the left", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(-100, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[0].coord).toBe(100);
    });

    it("snaps properly with positive velocity and overscroll on the left", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(-100, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[0].coord).toBe(100);
    });

    it("snaps properly with positive velocity and overscroll on the right", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(100000, false);
        swiper.snap(1, false);
        expect(swiper.state.pos).toBe(swiper.state.maxPos);
    });

    it("snaps properly with negative velocity and overscroll on the right", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(100000, false);
        swiper.snap(-1, false);
        expect(swiper.state.pos).toBe(swiper.state.maxPos);
    });

    it("snaps properly with negative velocity and closer to left item", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(200, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    it("snaps properly with positive velocity and closer to left item", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(200, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[1].coord).toBe(20);
    });

    it("snaps properly with negative velocity and closer to right item", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(350, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    it("snaps properly with positive velocity and closer to right item", function() {
        let swiper = sliderIrregular();
        swiper.moveTo(350, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[1].coord).toBe(20);
    });

    // initial position

    it ("has good initial position without setting initialPos and initialSlide", function() {
        let swiper = sliderIrregular();
        expect(swiper.state.pos).toBe(0);
    });

    it ("has good initial position with setting initialPos", function() {
        let swiper = sliderIrregular({
            initialPos: 100
        });
        expect(swiper.state.pos).toBe(100);
    });


    it ("has good initial position with setting initialSlide", function() {
        let swiper = sliderIrregular({
            initialSlide: 1
        });
        expect(swiper.state.pos).toBe(100 + 310 + 10 - 20);
    });

    // move listener

    it ("properly adds and removes 'stateChange' event listeners", function() {
        let swiper = sliderIrregular(false);

        let event1counter = 0;
        let event1 = () => { event1counter++; };

        let event2counter = 0;
        let event2 = () => { event2counter++; };

        swiper.moveTo(300, false);
        expect(event1counter).toBe(0);
        expect(event2counter).toBe(0);

        swiper.addEventListener('stateChange', event1);
        swiper.moveTo(400, false);
        expect(event1counter).toBe(1);
        expect(event2counter).toBe(0);

        swiper.addEventListener('stateChange', event2);
        swiper.moveTo(500, false);
        expect(event1counter).toBe(2);
        expect(event2counter).toBe(1);

        swiper.removeEventListener('stateChange', event1);
        swiper.moveTo(600, false);
        expect(event1counter).toBe(2);
        expect(event2counter).toBe(2);

        swiper.removeEventListener('stateChange', event2);
        swiper.moveTo(700, false);
        expect(event1counter).toBe(2);
        expect(event2counter).toBe(2);
    });
    //
    // it ("doesn't run 'move' event after layout", function() {
    //     let swiper = sliderIrregular(false);
    //
    //     let eventCounter = 0;
    //     let event = () => { eventCounter++; };
    //
    //     swiper.addEventListener('move', event);
    //
    //     swiper.layout();
    //     expect(eventCounter).toBe(1);
    //
    //     swiper.initialSlide = 3;
    //     swiper.layout();
    //     expect(eventCounter).toBe(2);
    //
    //     swiper.initialPos = 100;
    //     swiper.layout();
    //     expect(eventCounter).toBe(3);
    //
    // });
    //
    // move right move left

    it ("moves properly to the right with moveRight method", function() {
        let swiper = sliderIrregular(false);
        swiper.moveRight(false);
        expect(swiper.state.slides[1].coord).toBe(20);

        swiper.moveRight(false);
        expect(swiper.state.slides[2].coord).toBe(30);
    });

    it ("moves properly to the left with moveLeft method", function() {
        let swiper = sliderIrregular(false);

        swiper.moveTo(swiper.state.maxPos, false);

        swiper.moveLeft(false);
        expect(swiper.state.slides[3].coord).toBe(40);

        swiper.moveLeft(false);
        expect(swiper.state.slides[2].coord).toBe(30);
    });


    // isTouched / isStill
    // it ("moves properly to the right with moveRight method", function() {
    //     let swiper = sliderIrregular(false);
    //     swiper.moveRight(false);
    //     expect(swiper.state.slides[1].coord).toBe(20);
    //
    //     swiper.moveRight(false);
    //     expect(swiper.state.slides[2].coord).toBe(30);
    // });
});


describe("SwiperEngine (no animations / infinite mode)", function() {


    it("returns correct slideable width", function() {
        let swiper = sliderIrregular({ infinite: true });

        expect(swiper.state.slideableWidth).toBe(310 + 10 + 320 + 20 + 330 + 30 + 340 + 40 + 350 + 50);
    });

    it("has properly set initial positions", function() {
        let swiper = sliderIrregular({ infinite: true });

        expect(swiper.state.slides[0].coord).toBe(10);
        expect(swiper.state.slides[1].coord).toBe(10 + 310 + 10);
        // expect(swiper.state.slides[4].coord).toBe(undefined);
    });

    it("moves properly to the position from 0 to SW", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(0, false);
        expect(swiper.state.slides[0].coord).toBe(0);
        // expect(swiper.state.slides[1].coord).toBe(310 + 10);
        // expect(swiper.state.slides[2].coord).toBe(undefined);
        // expect(swiper.state.slides[3].coord).toBe(undefined);
        // expect(swiper.state.slides[4].coord).toBe(undefined);

        swiper.moveTo(200, false);
        expect(swiper.state.slides[0].coord).toBe(-200 + 0);
        expect(swiper.state.slides[1].coord).toBe(-200 + 310 + 10);
        expect(swiper.state.slides[2].coord).toBe(-200 + 310 + 10 + 320 + 20);
        // expect(swiper.state.slides[3].coord).toBe(undefined);
        // expect(swiper.state.slides[4].coord).toBe(undefined);

        swiper.moveTo(600, false);
        // expect(swiper.state.slides[0].coord).toBe(undefined);
        expect(swiper.state.slides[1].coord).toBe(-600 + 310 + 10);
        expect(swiper.state.slides[2].coord).toBe(-600 + 310 + 10 + 320 + 20);
        expect(swiper.state.slides[3].coord).toBe(-600 + 310 + 10 + 320 + 20 + 330 + 30);
        // expect(swiper.state.slides[4].coord).toBe(undefined);

        swiper.moveTo(1000, false);
        // expect(swiper.state.slides[0].coord).toBe(undefined);
        // expect(swiper.state.slides[1].coord).toBe(undefined);
        // expect(swiper.state.slides[2].coord).toBe(undefined);
        expect(swiper.state.slides[3].coord).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30);
        expect(swiper.state.slides[4].coord).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);

        swiper.moveTo(1400, false);
        expect(swiper.state.slides[0].coord).toBe(swiper.state.slideableWidth - 1400);
        // expect(swiper.state.slides[1].coord).toBe(undefined);
        // expect(swiper.state.slides[2].coord).toBe(undefined);
        // expect(swiper.state.slides[3].coord).toBe(undefined);
        expect(swiper.state.slides[4].coord).toBe(-1400 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("moves properly to the position from any position (wrapping)", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(0 - swiper.state.slideableWidth, false);
        expect(swiper.state.slides[0].coord).toBe(0);
        expect(swiper.state.slides[1].coord).toBe(310 + 10);
        // expect(swiper.state.slides[2].coord).toBe(undefined);
        // expect(swiper.state.slides[3].coord).toBe(undefined);
        // expect(swiper.state.slides[4].coord).toBe(undefined);

        swiper.moveTo(200 - swiper.state.slideableWidth * 2, false);
        expect(swiper.state.slides[0].coord).toBe(-200 + 0);
        expect(swiper.state.slides[1].coord).toBe(-200 + 310 + 10);
        expect(swiper.state.slides[2].coord).toBe(-200 + 310 + 10 + 320 + 20);
        // expect(swiper.state.slides[3].coord).toBe(undefined);
        // expect(swiper.state.slides[4].coord).toBe(undefined);

        swiper.moveTo(600 - swiper.state.slideableWidth * 4, false);
        // expect(swiper.state.slides[0].coord).toBe(undefined);
        expect(swiper.state.slides[1].coord).toBe(-600 + 310 + 10);
        expect(swiper.state.slides[2].coord).toBe(-600 + 310 + 10 + 320 + 20);
        expect(swiper.state.slides[3].coord).toBe(-600 + 310 + 10 + 320 + 20 + 330 + 30);
        // expect(swiper.state.slides[4].coord).toBe(undefined);

        swiper.moveTo(1000 + swiper.state.slideableWidth, false);
        // expect(swiper.state.slides[0].coord).toBe(undefined);
        // expect(swiper.state.slides[1].coord).toBe(undefined);
        // expect(swiper.state.slides[2].coord).toBe(undefined);
        expect(swiper.state.slides[3].coord).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30);
        expect(swiper.state.slides[4].coord).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);

        swiper.moveTo(1400 + 2 * swiper.state.slideableWidth, false);
        expect(swiper.state.slides[0].coord).toBe(swiper.state.slideableWidth - 1400);
        // expect(swiper.state.slides[1].coord).toBe(undefined);
        // expect(swiper.state.slides[2].coord).toBe(undefined);
        // expect(swiper.state.slides[3].coord).toBe(undefined);
        expect(swiper.state.slides[4].coord).toBe(-1400 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
    });

    it("snaps properly", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(0, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    it("snaps properly to the left slide when distance identical", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(145, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    it("snaps properly to the right slide if distance is minimally bigger than to the left", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(146, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[1].coord).toBe(20);
    });

    it("snaps properly to 4th slide", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(1000, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[3].coord).toBe(40);
    });

    it("snaps properly with wrapping to the left", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(1550, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[4].coord).toBe(50);
    });

    it("snaps properly with wrapping to the right", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(1650, false);
        swiper.snap(0, false);
        expect(swiper.state.slides[0].coord).toBe(10);
    });

    // VELOCITY 1

    it("snaps properly with negative velocity and closer to left item", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(350 + 10, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[1].coord).toBe(20);

    });

    it("snaps properly with positive velocity and closer to left item", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(350 + 10, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[2].coord).toBe(30);
    });

    it("snaps properly with negative velocity and closer to right item", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(550, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[1].coord).toBe(20);
    });

    it("snaps properly with positive velocity and closer to right item", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(550, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[2].coord).toBe(30);
    });

    it("snaps properly with negative velocity and closer to left item + wrapping", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(-350, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[4].coord).toBe(50);

        swiper = sliderRegular({ infinite: true });

        swiper.moveTo(2100, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[4].coord).toBe(0);
    });

    it("snaps properly with positive velocity and closer to left item + wrapping", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(-300, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[0].coord).toBe(10);

        swiper = sliderRegular({ infinite: true });

        swiper.moveTo(2100, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[0].coord).toBe(0);
    });

    it("snaps properly with negative velocity and closer to right item + wrapping", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(-50, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[4].coord).toBe(50);

        swiper = sliderRegular({ infinite: true });

        swiper.moveTo(2400, false);
        swiper.snap(-1, false);
        expect(swiper.state.slides[4].coord).toBe(0);
    });

    it("snaps properly with positive velocity and closer to right item + wrapping", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(-50, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[0].coord).toBe(10);

        swiper = sliderRegular({ infinite: true });

        swiper.moveTo(2400, false);
        swiper.snap(1, false);
        expect(swiper.state.slides[0].coord).toBe(0);
    });

    /**
     * This is very special use case. So here we have slideable width 1800 and snap points are 1790, 300, 630, 980, 1350.
     * We want slider to be positioned between 1790 and 1800 and snap (to left or right) and see if slider properly behaves on infinite slider boundary.
     *
     * snap points, slideable width, position, direction
     * [ 1790, 300, 630, 980, 1350 ] 1800 1500 1
     *
     */
    it("snaps properly with positive velocity when current position is bigger than highest-value snap point", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(swiper.state.slideableWidth - 2, false);
        swiper.snap(1, false);
        expect(swiper.state.pos).toBe(300);
    });

    it("snaps properly with negative velocity when current position is bigger than highest-value snap point", function() {
        let swiper = sliderIrregular({ infinite: true });

        swiper.moveTo(swiper.state.slideableWidth - 2, false);
        swiper.snap(-1, false);
        expect(swiper.state.pos).toBe(1790);
    });



    // initial position

    it ("has good initial position without setting initialPos and initialSlide", function() {
        let swiper = sliderIrregular({ infinite: true });

        expect(swiper.state.pos).toBe(swiper.state.slideableWidth-10);
    });

    it ("has good initial position with setting initialPos", function() {
        let swiper = sliderIrregular({ infinite: true, initialPos: 100 });

        expect(swiper.state.pos).toBe(100);
    });

    it ("has good initial position with setting initialSlide", function() {
        let swiper = sliderIrregular({ infinite: true, initialSlide: 1 });
        expect(swiper.state.pos).toBe(310 + 10 - 20);
    });

    // it ("runs single 'move' event after layout", function() {
    //     let swiper = sliderIrregular({ infinite: true });
    //
    //     let eventCounter = 0;
    //     let event = () => { eventCounter++; };
    //
    //     swiper.addEventListener('move', event);
    //
    //     swiper.layout();
    //     expect(eventCounter).toBe(1);
    //
    //     swiper.initialSlide = 3;
    //     swiper.layout();
    //     expect(eventCounter).toBe(2);
    //
    //     swiper.initialPos = 100;
    //     swiper.layout();
    //     expect(eventCounter).toBe(3);
    //
    // });

    // move left / move right

    it ("moves properly to the right with moveRight method", function() {
        let swiper = sliderRegular({ infinite: true });

        swiper.moveRight(false);
        expect(swiper.state.slides[1].coord).toBe(0);

        swiper.moveRight(false);
        expect(swiper.state.slides[2].coord).toBe(0);

        swiper.moveRight(false);
        expect(swiper.state.slides[3].coord).toBe(0);

        swiper.moveRight(false);
        expect(swiper.state.slides[4].coord).toBe(0);

        swiper.moveRight(false);
        expect(swiper.state.slides[0].coord).toBe(0);

        swiper.moveRight(false);
        expect(swiper.state.slides[1].coord).toBe(0);
    });

    it ("moves properly to the left with moveLeft method", function() {
        let swiper = sliderRegular({ infinite: true });

        swiper.moveLeft(false);
        expect(swiper.state.slides[4].coord).toBe(0);

        swiper.moveLeft(false);
        expect(swiper.state.slides[3].coord).toBe(0);

        swiper.moveLeft(false);
        expect(swiper.state.slides[2].coord).toBe(0);

        swiper.moveLeft(false);
        expect(swiper.state.slides[1].coord).toBe(0);

        swiper.moveLeft(false);
        expect(swiper.state.slides[0].coord).toBe(0);

        swiper.moveLeft(false);
        expect(swiper.state.slides[4].coord).toBe(0);
    });
});


/**
 * Events / state
 */
describe("SwiperEngine (no animations)", function() {

    it("properly handles 'isTouched' and 'isStill'", () => {
        let swiper = sliderRegular();

        let counters;

        let resetCounters = () => {
            counters = {
                stillnessChange: 0,
                touchup: 0,
                touchdown: 0,
                stateChange: 0
            };
        };

        resetCounters();

        swiper.addEventListener('stillnessChange', () => counters.stillnessChange++);
        swiper.addEventListener('touchup', () => counters.touchup++);
        swiper.addEventListener('touchdown', () => counters.touchdown++);
        swiper.addEventListener('stateChange', () => counters.stateChange++);

        expect(swiper.state.isStill).toBe(true);
        expect(swiper.state.isTouched).toBe(false);

        swiper.touchup(); // nothing should change, as this doesn't change state

        expect(swiper.state.isStill).toBe(true);
        expect(swiper.state.isTouched).toBe(false);
        expect(counters.stillnessChange).toBe(0);
        expect(counters.touchup).toBe(0);
        expect(counters.touchdown).toBe(0);
        expect(counters.stateChange).toBe(0);
        resetCounters();

        swiper.touchdown(); // let's touch down

        expect(swiper.state.isStill).toBe(false);
        expect(swiper.state.isTouched).toBe(true);
        expect(counters.stillnessChange).toBe(1);
        expect(counters.touchup).toBe(0);
        expect(counters.touchdown).toBe(1);
        expect(counters.stateChange).toBeGreaterThan(0);
        resetCounters();

        swiper.touchdown(); // touch down again -> no state change

        expect(swiper.state.isStill).toBe(false);
        expect(swiper.state.isTouched).toBe(true);
        expect(counters.stillnessChange).toBe(0);
        expect(counters.touchup).toBe(0);
        expect(counters.touchdown).toBe(0);
        expect(counters.stateChange).toBe(0);
        resetCounters();

        swiper.touchup(); // touch down again -> no state change

        expect(swiper.state.isStill).toBe(true);
        expect(swiper.state.isTouched).toBe(false);
        expect(counters.stillnessChange).toBe(1);
        expect(counters.touchup).toBe(1);
        expect(counters.touchdown).toBe(0);
        expect(counters.stateChange).toBeGreaterThan(0);
    });

    it("properly handles 'isAnimating'", () => {
        // TODO: implement this! Probably in section above
    });

    it("properly handles 'visibility' and 'active' state for slides", () => {
        let swiper = sliderRegular();

        let counters;

        let resetCounters = () => {
            counters = {
                visibleSlidesChange: 0,
                activeSlidesChange: 0,
                stateChange: 0
            };
        };

        resetCounters();

        swiper.addEventListener('visibleSlidesChange', () => counters.visibleSlidesChange++);
        swiper.addEventListener('activeSlidesChange', () => counters.activeSlidesChange++);
        swiper.addEventListener('stateChange', () => counters.stateChange++);

        // initial state
        expect(swiper.state.slides[0].active).toBe(true);
        expect(swiper.state.slides[1].active).toBe(false);
        expect(swiper.state.slides[2].active).toBe(false);
        expect(swiper.state.slides[3].active).toBe(false);
        expect(swiper.state.slides[4].active).toBe(false);

        expect(swiper.state.slides[0].visibility).toBe(0.8);
        expect(swiper.state.slides[1].visibility).toBe(0);
        expect(swiper.state.slides[2].visibility).toBe(0);
        expect(swiper.state.slides[3].visibility).toBe(0);
        expect(swiper.state.slides[4].visibility).toBe(0);

        resetCounters();

        // let's move slider 200 points right
        swiper.moveTo(200, false);

        expect(swiper.state.slides[0].active).toBe(true);
        expect(swiper.state.slides[1].active).toBe(false);
        expect(swiper.state.slides[2].active).toBe(false);
        expect(swiper.state.slides[3].active).toBe(false);
        expect(swiper.state.slides[4].active).toBe(false);

        expect(swiper.state.slides[0].visibility).toBe(0.8);
        expect(swiper.state.slides[1].visibility).toBe(0.2);
        expect(swiper.state.slides[2].visibility).toBe(0);
        expect(swiper.state.slides[3].visibility).toBe(0);
        expect(swiper.state.slides[4].visibility).toBe(0);

        expect(counters.visibleSlidesChange).toBe(1);
        expect(counters.activeSlidesChange).toBe(0);
        expect(counters.stateChange).toBeGreaterThan(0);

        resetCounters();

        // let's move slider 500 points left so that 2nd slide is active
        swiper.moveTo(500, false);

        expect(swiper.state.slides[0].active).toBe(false);
        expect(swiper.state.slides[1].active).toBe(true);
        expect(swiper.state.slides[2].active).toBe(false);
        expect(swiper.state.slides[3].active).toBe(false);
        expect(swiper.state.slides[4].active).toBe(false);

        expect(swiper.state.slides[0].visibility).toBe(0.2);
        expect(swiper.state.slides[1].visibility).toBe(0.8);
        expect(swiper.state.slides[2].visibility).toBe(0);
        expect(swiper.state.slides[3].visibility).toBe(0);
        expect(swiper.state.slides[4].visibility).toBe(0);

        expect(counters.visibleSlidesChange).toBe(0);
        expect(counters.activeSlidesChange).toBe(1);
        expect(counters.stateChange).toBeGreaterThan(0);
    });

});










