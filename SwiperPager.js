let EventSystem = require("./EventSystem");

class SwiperPager {

    constructor(swiper) {
        this.swiper = swiper;

        EventSystem.register(this);
        EventSystem.addEvent(this, 'pagerItemClicked');
    }


    init() {
        let pagerItemTemplate = document.querySelector(this.swiper._getSelectorForComponent('pager-item'));

        for (let i = 0; i < this.swiper.count - 1; i++) {
            let pagerItem = pagerItemTemplate.cloneNode(true);
            pagerItemTemplate.parentNode.insertBefore(pagerItem, pagerItemTemplate.nextSibling);
        }

        this._pagerElements = document.querySelectorAll(this.swiper._getSelectorForComponent('pager-item'));

        this._pagerItemsOnClickListeners = [];

        for (let i = 0; i < this._pagerElements.length; i++) {
            ((i) => {
                this._pagerItemsOnClickListeners[i] = () => {
                    this.pagerElementClickListener(i);
                };
                this._pagerElements[i].addEventListener('click', this._pagerItemsOnClickListeners[i]);
            })(i);
        }

        let activeSlideIndex = this.swiper.activeSlides()[0];

        this._pagerElements[activeSlideIndex].classList.add('active');


        this.swiper.addEventListener('move', () => {
            this._setUpProperPagerElementsAsActive(this.swiper.activeSlides());
        });
    }

    pagerElementClickListener(index) {
        this.swiper.moveToSlide(index);
        this._setUpProperPagerElementsAsActive([index]);
    }

    _setUpProperPagerElementsAsActive(elementsIndexes) {
        this._pagerElements.forEach(pagerElement => {
            pagerElement.classList.remove('active');
        });

        elementsIndexes.forEach(elementIndex => {
            this._pagerElements[elementIndex].classList.add('active');
        });

        this._runEventListeners('pagerItemClicked', elementsIndexes);

    }

    deinit() {
        for (let i = 0; i < this._pagerElements.length; i++) {
            // Let's leave first element alive, just unbind listener
            if (i === 0) {
                this._pagerElements[i].removeEventListener('click', this._pagerItemsOnClickListeners[i]);
            }
            else { // rest elements -> out.
                this._pagerElements[i].remove();
            }
        }
    }
}

module.exports = SwiperPager;