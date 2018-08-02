let EventSystem = require("./EventSystem");
let SwiperPagerController = require("./SwiperPagerController");

class SwiperPager {

    constructor(swiper) {
        this.swiper = swiper;
        EventSystem.register(this);
        EventSystem.addEvent(this, 'pagerItemClicked');

        this.swiperPagerController = new SwiperPagerController(this.swiper);
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

        this._activeElements = [];

        this._setElementsActive(this.swiper.activeSlides());
        this.swiper.addEventListener('move', () => {
            this._setElementsActive(this.swiper.activeSlides());
        });
    }

    pagerElementClickListener(index) {
        this.swiperPagerController.elementClicked(index);
        this._setElementsActive([index]);
        this._runEventListeners('pagerItemClicked', index);

    }

    _setElementsActive(elementsIndexes) {

        let newActiveElements = [];

        elementsIndexes.forEach(elementIndex => {
            newActiveElements.push(this._pagerElements[elementIndex]);
        });

        newActiveElements.forEach(element => {
            if (!this._activeElements.includes(element)) {
                element.classList.add('active');
                this._activeElements.push(element);
            }
        });

        this._activeElements = this._activeElements.filter(element => {
            if (!newActiveElements.includes(element)) {
                element.classList.remove('active');
                return false;
            }

            return true;
        });
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