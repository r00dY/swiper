import TouchSpace from "../components/touchSpace/TouchSpace";
import SwiperEngine from "./SwiperEngine";

class FadeSwiper extends SwiperEngine {
    constructor(container) {
        super();

        this._touchSpaceComponent = new TouchSpace(this, container);

        this.slides = Array.from(container.children);

        this.addEventListener('move', () => {
            this.slides.forEach((slide, index) => {
                let visibility = this.slideVisibility(index);

                if (visibility < 0.01) {
                    slide.style.display = 'none';
                }
                else {
                    slide.style.display = 'block';
                    slide.style.opacity = visibility;
                }
            });
        });
    }

    set touchSpace(touchSpaceComponent) {
        this._touchSpaceComponent = touchSpaceComponent;
    }

    get touchSpace() {
        return this._touchSpaceComponent;
    }

}

export default FadeSwiper;
