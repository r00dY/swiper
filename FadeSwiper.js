import TouchSwiper from "./TouchSwiper";


class FadeSwiper extends TouchSwiper {
    layout(slides) {
        this.addEventListener('move', () => {
            slides.forEach((slide, index) => {
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

        super.layout();
    }
}

export default FadeSwiper;