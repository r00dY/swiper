# SimpleSlider

SimpleSlider allows you to simply implement Sliders with mobile app grade gesture handling. It doesn't limit itself to images. You can place in slides any HTML content you want.

# Why React doesn't have its own presets?

As you could have noticed, we use SimpleSlider instances inside React components and take full imperative approach.

The reason for this is that slider UI state is complicated (position, animation, speed, etc) and requires heavy orchestration of state variables (not every combination of state variables is correct). If we make slider dummy, this state management logic would have to go to parent. This doesn't make sense because its slider who knows how to manage state logic. This means that calling SimpleSlider methods is simply th best solution to drive internal state changes.

## Why no ReactSimpleSlider helper?

We tried it and it failed.

First, we need to have ref to this `ReactSimpleSlider` component always. To have access to all methods (`moveTo`, `visibleSlides`, etc).

We also got to conclusion that `layout` method must be always called in component that instantiates `ReactSimpleSlider`, which complicates API and doesn't allow us for simply putting `ReactSimpleSlider` to `render()` and keeping parent component stateless. The reason for that is that if `layout` is called inside `ReactSimpleSlider`, `SimpleSlider` automatically calls all the events (`onActiveSlidesChange`, `onMove` etc). Those events are usually used by parent component. And when they're called, parent component still doesn't have `ReactSimpleSlider` ref initialized, because it's child who is being initialized at the moment. This led to conclusion that it's parent who should control everything and we shouldn't put partial control to `ReactSimpleSlider`.

Also, all that `ReactSimpleSlider` did was rewrite API of `SimpleSlider` to `props`. That casued many bugs, where `SimpleSlider` did have some method and `ReactSimpleSlider` didn't. It doesn't make sense to copy APIs and DX doesn't seem to be much better with props.

Another thing is that having `slideMargin`, `slideSnapOffset` etc functions in render is tempting to use `() => 200` syntax inside render method and instantiate new local methods every time `render` is called which is super inefficient if we have many of that methods.

Also, all the components (pager, arrows, touchspace) require `Slider` instance and the code of parent of `ReactSimpleSlider` was full of `this.sliderRef.current.slider.sth`, while without we have only `this.slider.sth`.

At the end of the day `SimpleSlider` is very imperative component and it should stay this way within React (or Vue) realm.