import TouchSwiper from "./TouchSwiper";

class FadeSwiper extends TouchSwiper {
    constructor(container) {
        super();

        this.touchSpace = container;

        this.slides = Array.from(this.touchSpace.children);

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
}

export default FadeSwiper;
