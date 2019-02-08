import AbstractSlider from "../src/AbstractSlider";

let swiper;

function sliderIrregular(extraConfig) {
    let config = {
        containerSize: () => 500,
        count: 5,
        leftOffset: () => 100,
        rightOffset: () => 200,
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

    //
    // swiper.containerSizeFunction = () => 500;
    // swiper.count = 5;
    // swiper.leftOffsetFunction = () => 100;
    // swiper.rightOffsetFunction = () => 200;
    // swiper.infinite = infinite;
    //
    // swiper.slideSizeFunction = function(n) {
    //     return (n + 1) * 10 + 300;
    // };
    //
    // swiper.slideMargin = function(n) {
    //     return (n + 1) * 10;
    // };
    // swiper.slideSnapOffset = function(n) {
    //     return (n + 1) * 10;
    // };
    //
    // swiper.overscrollFunction = (x) => {
    //     return x / 2;
    // };
    //
    // swiper.layout();
}

function sliderRegular(infinite) {
    swiper = new AbstractSlider();

    swiper.containerSizeFunction = () => 500;
    swiper.count = 5;
    swiper.leftOffsetFunction = () => 100;
    swiper.rightOffsetFunction = () =>200;
    swiper.infinite = infinite;

    swiper.slideSizeFunction = function(n) {
        return 500;
    };

    swiper.slideMargin = function(n) {
        return 0;
    };
    swiper.slideSnapOffset = function(n) {
        return 0;
    };

    swiper.layout();
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

    it ("properly adds and removes 'move' event listeners", function() {
        let swiper = sliderIrregular(false);

        let event1counter = 0;
        let event1 = () => { event1counter++; };

        let event2counter = 0;
        let event2 = () => { event2counter++; };

        swiper.moveTo(300, false);
        expect(event1counter).toBe(0);
        expect(event2counter).toBe(0);

        swiper.addEventListener('move', event1);
        swiper.moveTo(400, false);
        expect(event1counter).toBe(1);
        expect(event2counter).toBe(0);

        swiper.addEventListener('move', event2);
        swiper.moveTo(500, false);
        expect(event1counter).toBe(2);
        expect(event2counter).toBe(1);

        swiper.removeEventListener('move', event1);
        swiper.moveTo(600, false);
        expect(event1counter).toBe(2);
        expect(event2counter).toBe(2);

        swiper.removeEventListener('move', event2);
        swiper.moveTo(700, false);
        expect(event1counter).toBe(2);
        expect(event2counter).toBe(2);
    });

    // it ("runs single 'move' event after layout", function() {
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

});
//
//
// describe("SwiperEngine (no animations / infinite mode)", function() {
//
//
//     it("returns correct slideable width", function() {
//         sliderIrregular(true);
//
//         expect(swiper.slideableWidth).toBe(310 + 10 + 320 + 20 + 330 + 30 + 340 + 40 + 350 + 50);
//     });
//
//     it("has properly set initial positions", function() {
//         sliderIrregular(true);
//
//         expect(swiper.slideCoord(0)).toBe(10);
//         expect(swiper.slideCoord(1)).toBe(10 + 310 + 10);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//     });
//
//     it("moves properly to the position from 0 to SW", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(0, false);
//         expect(swiper.slideCoord(0)).toBe(0);
//         // expect(swiper.slideCoord(1)).toBe(310 + 10);
//         // expect(swiper.slideCoord(2)).toBe(undefined);
//         // expect(swiper.slideCoord(3)).toBe(undefined);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//
//         swiper.moveTo(200, false);
//         expect(swiper.slideCoord(0)).toBe(-200 + 0);
//         expect(swiper.slideCoord(1)).toBe(-200 + 310 + 10);
//         expect(swiper.slideCoord(2)).toBe(-200 + 310 + 10 + 320 + 20);
//         // expect(swiper.slideCoord(3)).toBe(undefined);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//
//         swiper.moveTo(600, false);
//         // expect(swiper.slideCoord(0)).toBe(undefined);
//         expect(swiper.slideCoord(1)).toBe(-600 + 310 + 10);
//         expect(swiper.slideCoord(2)).toBe(-600 + 310 + 10 + 320 + 20);
//         expect(swiper.slideCoord(3)).toBe(-600 + 310 + 10 + 320 + 20 + 330 + 30);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//
//         swiper.moveTo(1000, false);
//         // expect(swiper.slideCoord(0)).toBe(undefined);
//         // expect(swiper.slideCoord(1)).toBe(undefined);
//         // expect(swiper.slideCoord(2)).toBe(undefined);
//         expect(swiper.slideCoord(3)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30);
//         expect(swiper.slideCoord(4)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
//
//         swiper.moveTo(1400, false);
//         expect(swiper.slideCoord(0)).toBe(swiper.slideableWidth - 1400);
//         // expect(swiper.slideCoord(1)).toBe(undefined);
//         // expect(swiper.slideCoord(2)).toBe(undefined);
//         // expect(swiper.slideCoord(3)).toBe(undefined);
//         expect(swiper.slideCoord(4)).toBe(-1400 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
//     });
//
//     it("moves properly to the position from any position (wrapping)", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(0 - swiper.slideableWidth, false);
//         expect(swiper.slideCoord(0)).toBe(0);
//         expect(swiper.slideCoord(1)).toBe(310 + 10);
//         // expect(swiper.slideCoord(2)).toBe(undefined);
//         // expect(swiper.slideCoord(3)).toBe(undefined);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//
//         swiper.moveTo(200 - swiper.slideableWidth * 2, false);
//         expect(swiper.slideCoord(0)).toBe(-200 + 0);
//         expect(swiper.slideCoord(1)).toBe(-200 + 310 + 10);
//         expect(swiper.slideCoord(2)).toBe(-200 + 310 + 10 + 320 + 20);
//         // expect(swiper.slideCoord(3)).toBe(undefined);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//
//         swiper.moveTo(600 - swiper.slideableWidth * 4, false);
//         // expect(swiper.slideCoord(0)).toBe(undefined);
//         expect(swiper.slideCoord(1)).toBe(-600 + 310 + 10);
//         expect(swiper.slideCoord(2)).toBe(-600 + 310 + 10 + 320 + 20);
//         expect(swiper.slideCoord(3)).toBe(-600 + 310 + 10 + 320 + 20 + 330 + 30);
//         // expect(swiper.slideCoord(4)).toBe(undefined);
//
//         swiper.moveTo(1000 + swiper.slideableWidth, false);
//         // expect(swiper.slideCoord(0)).toBe(undefined);
//         // expect(swiper.slideCoord(1)).toBe(undefined);
//         // expect(swiper.slideCoord(2)).toBe(undefined);
//         expect(swiper.slideCoord(3)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30);
//         expect(swiper.slideCoord(4)).toBe(-1000 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
//
//         swiper.moveTo(1400 + 2 * swiper.slideableWidth, false);
//         expect(swiper.slideCoord(0)).toBe(swiper.slideableWidth - 1400);
//         // expect(swiper.slideCoord(1)).toBe(undefined);
//         // expect(swiper.slideCoord(2)).toBe(undefined);
//         // expect(swiper.slideCoord(3)).toBe(undefined);
//         expect(swiper.slideCoord(4)).toBe(-1400 + 310 + 10 + 320 + 20 + 330 + 30 + 340 + 40);
//     });
//
//     it("snaps properly", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(0, false);
//         swiper.snap(0, false);
//         expect(swiper.slideCoord(0)).toBe(10);
//     });
//
//     it("snaps properly to the left slide when distance identical", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(145, false);
//         swiper.snap(0, false);
//         expect(swiper.slideCoord(0)).toBe(10);
//     });
//
//     it("snaps properly to the right slide if distance is minimally bigger than to the left", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(146, false);
//         swiper.snap(0, false);
//         expect(swiper.slideCoord(1)).toBe(20);
//     });
//
//     it("snaps properly to 4th slide", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(1000, false);
//         swiper.snap(0, false);
//         expect(swiper.slideCoord(3)).toBe(40);
//     });
//
//     it("snaps properly with wrapping to the left", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(1550, false);
//         swiper.snap(0, false);
//         expect(swiper.slideCoord(4)).toBe(50);
//     });
//
//     it("snaps properly with wrapping to the right", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(1650, false);
//         swiper.snap(0, false);
//         expect(swiper.slideCoord(0)).toBe(10);
//     });
//
//     // VELOCITY 1
//
//     it("snaps properly with negative velocity and closer to left item", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(350 + 10, false);
//         swiper.snap(-1, false);
//         expect(swiper.slideCoord(1)).toBe(20);
//
//     });
//
//     it("snaps properly with positive velocity and closer to left item", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(350 + 10, false);
//         swiper.snap(1, false);
//         expect(swiper.slideCoord(2)).toBe(30);
//     });
//
//     it("snaps properly with negative velocity and closer to right item", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(550, false);
//         swiper.snap(-1, false);
//         expect(swiper.slideCoord(1)).toBe(20);
//     });
//
//     it("snaps properly with positive velocity and closer to right item", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(550, false);
//         swiper.snap(1, false);
//         expect(swiper.slideCoord(2)).toBe(30);
//     });
//
//     it("snaps properly with negative velocity and closer to left item + wrapping", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(-350, false);
//         swiper.snap(-1, false);
//         expect(swiper.slideCoord(4)).toBe(50);
//
//         sliderRegular(true);
//
//         swiper.moveTo(2100, false);
//         swiper.snap(-1, false);
//         expect(swiper.slideCoord(4)).toBe(0);
//     });
//
//     it("snaps properly with positive velocity and closer to left item + wrapping", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(-300, false);
//         swiper.snap(1, false);
//         expect(swiper.slideCoord(0)).toBe(10);
//
//         sliderRegular(true);
//
//         swiper.moveTo(2100, false);
//         swiper.snap(1, false);
//         expect(swiper.slideCoord(0)).toBe(0);
//     });
//
//     it("snaps properly with negative velocity and closer to right item + wrapping", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(-50, false);
//         swiper.snap(-1, false);
//         expect(swiper.slideCoord(4)).toBe(50);
//
//         sliderRegular(true);
//
//         swiper.moveTo(2400, false);
//         swiper.snap(-1, false);
//         expect(swiper.slideCoord(4)).toBe(0);
//     });
//
//     it("snaps properly with positive velocity and closer to right item + wrapping", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(-50, false);
//         swiper.snap(1, false);
//         expect(swiper.slideCoord(0)).toBe(10);
//
//         sliderRegular(true);
//
//         swiper.moveTo(2400, false);
//         swiper.snap(1, false);
//         expect(swiper.slideCoord(0)).toBe(0);
//     });
//
//     /**
//      * This is very special use case. So here we have slideable width 1800 and snap points are 1790, 300, 630, 980, 1350.
//      * We want slider to be positioned between 1790 and 1800 and snap (to left or right) and see if slider properly behaves on infinite slider boundary.
//      *
//      * snap points, slideable width, position, direction
//      * [ 1790, 300, 630, 980, 1350 ] 1800 1500 1
//      *
//      */
//     it("snaps properly with positive velocity when current position is bigger than highest-value snap point", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(swiper.slideableWidth - 2, false);
//         swiper.snap(1, false);
//         expect(swiper.pos).toBe(300);
//     });
//
//     it("snaps properly with negative velocity when current position is bigger than highest-value snap point", function() {
//         sliderIrregular(true);
//
//         swiper.moveTo(swiper.slideableWidth - 2, false);
//         swiper.snap(-1, false);
//         expect(swiper.pos).toBe(1790);
//     });
//
//
//
//     // initial position
//
//     it ("has good initial position without setting initialPos and initialSlide", function() {
//         sliderIrregular(true);
//
//         expect(swiper.pos).toBe(swiper.slideableWidth-10);
//     });
//
//     it ("has good initial position with setting initialPos", function() {
//         sliderIrregular(true);
//
//         swiper.initialPos = 100;
//         swiper.layout();
//         expect(swiper.pos).toBe(100);
//     });
//
//     it ("has good initial position with setting initialSlide", function() {
//         sliderIrregular(true);
//
//         swiper.initialSlide = 1;
//         swiper.layout();
//         expect(swiper.pos).toBe(310 + 10 - 20);
//     });
//
//     it ("runs single 'move' event after layout", function() {
//         sliderIrregular(true);
//
//         let eventCounter = 0;
//         let event = () => { eventCounter++; };
//
//         swiper.addEventListener('move', event);
//
//         swiper.layout();
//         expect(eventCounter).toBe(1);
//
//         swiper.initialSlide = 3;
//         swiper.layout();
//         expect(eventCounter).toBe(2);
//
//         swiper.initialPos = 100;
//         swiper.layout();
//         expect(eventCounter).toBe(3);
//
//     });
//
//     // move left / move right
//
//     it ("moves properly to the right with moveRight method", function() {
//         sliderRegular(true);
//
//         swiper.moveRight(false);
//         expect(swiper.slideCoord(1)).toBe(0);
//
//         swiper.moveRight(false);
//         expect(swiper.slideCoord(2)).toBe(0);
//
//         swiper.moveRight(false);
//         expect(swiper.slideCoord(3)).toBe(0);
//
//         swiper.moveRight(false);
//         expect(swiper.slideCoord(4)).toBe(0);
//
//         swiper.moveRight(false);
//         expect(swiper.slideCoord(0)).toBe(0);
//
//         swiper.moveRight(false);
//         expect(swiper.slideCoord(1)).toBe(0);
//     });
//
//     it ("moves properly to the left with moveLeft method", function() {
//         sliderRegular(true);
//
//         swiper.moveLeft(false);
//         expect(swiper.slideCoord(4)).toBe(0);
//
//         swiper.moveLeft(false);
//         expect(swiper.slideCoord(3)).toBe(0);
//
//         swiper.moveLeft(false);
//         expect(swiper.slideCoord(2)).toBe(0);
//
//         swiper.moveLeft(false);
//         expect(swiper.slideCoord(1)).toBe(0);
//
//         swiper.moveLeft(false);
//         expect(swiper.slideCoord(0)).toBe(0);
//
//         swiper.moveLeft(false);
//         expect(swiper.slideCoord(4)).toBe(0);
//     });
//
//
// });