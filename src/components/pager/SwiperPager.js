import EventSystem from "../../helpers/EventSystem";
import SwiperPagerController from "./SwiperPagerController";

class SwiperPager {

    constructor(swiper, pagerItemTemplate) {
        this.swiper = swiper;
        EventSystem.register(this);
        EventSystem.addEvent(this, 'pagerItemClicked');

        this._pagerElements = [];
        this.swiperPagerController = new SwiperPagerController(this.swiper);

        this._pagerItemTemplate = pagerItemTemplate;
    }


    enable() {
        for (let i = 0; i < this.swiper.count - 1; i++) {
            let pagerItem = this._pagerItemTemplate.cloneNode(true);
            this._pagerElements.unshift(pagerItem);
            this._pagerItemTemplate.parentNode.insertBefore(pagerItem, this._pagerItemTemplate.nextSibling);
        }
        this._pagerElements.unshift(this._pagerItemTemplate);

        this._pagerItemsOnClickListeners = [];

        for (let i = 0; i < this._pagerElements.length; i++) {
            ((i) => {
                this._pagerItemsOnClickListeners[i] = () => {
                    this.swiperPagerController.elementClicked(i);
                    this._runEventListeners('pagerItemClicked', i);
                };
                this._pagerElements[i].addEventListener('click', this._pagerItemsOnClickListeners[i]);
            })(i);
        }

        this._activeElements = {};

        this.swiperPagerController.init();

        this._setElementsActive(this.swiperPagerController.activeElements);

        this.swiperPagerController.addEventListener('activeElementsChanged', (elementsIndexes) => {
            this._setElementsActive(elementsIndexes);

        })
    }

    _setElementsActive(elementsIndexes) {
        Object.keys(this._activeElements).forEach(activeElementIndex => {
            if (!elementsIndexes.includes(activeElementIndex)) {
                this._activeElements[activeElementIndex].classList.remove('active');
                delete this._activeElements[activeElementIndex];
            }
        });

        elementsIndexes.forEach(elementIndex => {
            if (!this._activeElements.hasOwnProperty(elementIndex)) {
                let newActiveElement = this._pagerElements[elementIndex];
                newActiveElement.classList.add('active');
                this._activeElements[elementIndex] = newActiveElement;
            }
        })
    }

    disable() {
        for (let i = 0; i < this._pagerElements.length; i++) {
            // Let's leave first element alive, just unbind listener
            // and remove 'active' class from first element. It would be added during "init" anyways
            if (i === 0) {
                this._pagerElements[i].removeEventListener('click', this._pagerItemsOnClickListeners[i]);
                this._pagerElements[i].classList.remove('active');
            }
            else { // rest elements -> out.
                this._pagerElements[i].remove();
            }
        }
    }
}

export default SwiperPager;