# React Lazy Images

> Components and utilities for lazy image loading in React.

[![npm](https://img.shields.io/npm/v/react-lazy-images.svg)](https://www.npmjs.com/package/react-lazy-images)
[![gzip size](http://img.badgesize.io/https://unpkg.com/react-lazy-images/dist/react-lazy-images.js?compression=gzip)](https://unpkg.com/react-lazy-images/dist/react-lazy-images.js)
[![npm downloads](https://img.shields.io/npm/dm/react-lazy-images.svg)](https://www.npmjs.com/package/react-lazy-images)
[![dependencies](https://david-dm.org/fpapado/react-lazy-images.svg)](https://david-dm.org/fpapado/react-lazy-images)
<a href="https://codesandbox.io/s/jnn9wjkj1w">
<img src="https://codesandbox.io/static/img/play-codesandbox.svg" height="20px"/>
</a>

## Table of Contents

* [Features](#features)
* [Install](#install)
* [Motivation](#motivation)
* [Usage](#usage)
* [Examples](#examples)
* [API Reference](#api-reference)
* [Feedback](#feedback)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [Thanks](#thanks-and-inspiration)
* [License](#license)

## Features

* Composable pieces, preloading images and handling failures.
* Full presentational control for the caller (render props).
* Modern, performant implementation, using [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and providing [polyfill information](#polyfill-intersection-observer).
* [Eager loading / Server-side rendering support](#eager-loading--server-side-rendering-ssr).
* Works with horizontal scrolling, supports background images.
* [Fallbacks for SEO / when Javascript is disabled](#fallback-without-javascript).
* Easy to understand source code. You should be able to fork and do your thing if desired.
* Ample documentation to help you understand the problem, in addition to the solutions.

What it does not do by itself:

* Polyfill `IntersectionObserver`. Adding polyfills is something you should do consciously at the application level. See [Polyfilling IntersectionObserver](#polyfill-intersectionobserver) for how to do this.
* Dictate the kind of placeholders displayed. There are many ways to do it; you can use a simple box with a background color, a low-resolution image, some gradient, etc.
In other words, this library focuses on loading the images once in view and supporting **loading** patterns around that.
The presentational patterns are yours to decide!
Fear not though, [we cover both patterns in the examples section](#examples).

## Install

This package is distributed via [npm](https://www.npmjs.com/get-npm).

```shell
$ npm install --save react-lazy-images
# or
$ yarn add react-lazy-images
```

Then import according to your modules model and bundler, such as [Rollup](https://rollupjs.org/guide/en) and [Webpack](https://webpack.js.org/):

```js
// ES Modules
// For all possible functions to import look at the documentation
import {LazyImage} from 'react-lazy-images';

/// CommonJS modules
const {LazyImage} = require('react-lazy-images');
```

A [UMD](https://github.com/umdjs/umd) version is also available on [unpkg](https://unpkg.com/):

```html
<script src="https://unpkg.com/react-lazy-images/dist/react-lazy-images.umd.js"></script>
```

## Motivation

Browsers preload images; as soon as they encounter an `<img>` tag with a valid `src`, they kick off the request for the image (they even do this before the HTML has been parsed).
Even in cases where a certain image is not in the viewport, it will be requested.
This can have adverse effects for users, especially on mobile or metered connections.

This brings us to the basic premise of any Lazy Image Loading library:

* Have a way to observe the visibility of the DOM elements
* Prevent the browser from loading images directly
* Once an image is in view, instruct the browser to load it and place it in the element

In vanilla JS, this means "hiding" the actual `src` in a `data-src` attribute, and using classes to indicate state, e.g. `.isLazyLoaded .lazyLoad`.
On initialisation, a script queries for these classes and attributes, keeps track of visibily, and swaps `data-src` with an actual `src`, kicking off the browser request process.
It can elect to preload the Image, and only swap once loaded.

With React, all this implicit state management is brought into one place, since you do not have to stash loading information in the DOM and pick it back up again.
This can potentially mean a nicer, more composable codebase, and it was one of the main design goals for this library.

The way to do this visibility tracking has for the most part been listening for events such as scroll.
This is synchronous by nature and [can have performance implications](https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/#lazy_loading_images).
It also involves calling `getBoundingClientRect()` to calculate the interesection of the image with the viewport; this function causes relayout.
This was the motivation for browsers providing [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
Using this API is not specific to React; it just seems like a good fit for this task nowadays.

## Usage

### Quick Start

If you want to just dive in, do this:

```jsx
import {LazyImage} from 'react-lazy-images';

<LazyImage
  src="https://www.fillmurray.com/g/600/400"
  placeholder={({cls}) => (
    <img src="https://www.fillmurray.com/g/60/40" className={cls} />
  )}
  actual={({cls}) => (
    <img src="https://www.fillmurray.com/g/600/400" className={cls} />
  )}
/>;
```

[You can play around with this library on Codesandbox](https://codesandbox.io/s/jnn9wjkj1w).

Additionally, make sure you understand [how to polyfill IntersectionObserver](#polyfill-intersectionobserver) and [strategies for when JS is not available](#fallback-without-javascript).

From then on:

* If you want to learn more about the API and the problem space, read the rest of this section.
* If you want to list the props, see the [API reference](#api-reference)

### Customising what is displayed

The render prop pattern is used throughout in `LazyImage`.
The `LazyImage` component **handles the behaviour of tracking when the image is in view, but leaves the actual rendering up to the consumer**.
Thus, whether you want to display a simple `<img>`, your own `<Image>`, or even wrapped elements, it is simple to do so:

```jsx
<LazyImage
  src={https://www.fillmurray.com/g/600/400}
  // This is rendered first
  placeholder={
    ({cls}) =>
      <img src="https://www.fillmurray.com/g/60/40" className={cls} />
  }
  // This is rendered once in view
  actual={
    ({cls}) =>
      <img src="https://www.fillmurray.com/g/600/400" className={cls} />
  }
/>

// Perhaps you want a container?
<LazyImage
  placeholder={
    ({cls}) =>
      <div className={`LazyImage-Placeholder ${cls}`}">
        <img src="https://www.fillmurray.com/g/60/40"/>
      </div>
  }
  actual={
    ({cls}) =>
      <div className={`LazyImage-Actual ${cls}`}>
        <img src="https://www.fillmurray.com/g/600/400" className={cls} />
      </div>
  }
/>
```

These props are there to instruct the component what to render in those places, and they take some useful information (in this case, a className) from the LazyImage.

### Load before swap

A common optimisation to the loading strategy is to preload the image before swapping it for the placeholder.
In other words, once the image is in view, you can kick off a request to load the image, and only show it once fully loaded.
This avoids presenting a half-loaded image (i.e. one that is still scanning top-to-bottom), and makes the transition smoother.

This behaviour is provided with the `src` prop:

```jsx
// Note that the actual src is also provided separately,
// so that the image can be requested before rendering
<LazyImage
  src="https://www.fillmurray.com/g/600/400"
  placeholder={
    ({cls}) =>
      <div className={`LazyImage-Placeholder ${cls}`}">
        <img src="https://www.fillmurray.com/g/60/40"/>
      </div>
  }
  actual={
    ({cls}) =>
      <div className={`LazyImage-Actual ${cls}`}>
        <img src="https://www.fillmurray.com/g/600/400" className={cls} />
      </div>
  }
/>
```

There is another case if you are using `srcset` for your images; `LazyImage` needs that information to preload the correct image. You can provide it with the `srcSet` prop.

### Loading and Error states

You can choose what to display on Loading and Error using the render props `loading` and `error`:

```jsx
<div className="bg-light-silver h5 w-100">
  <LazyImage
    src="https://www.fillmurray.com/notanimage"
    placeholder={({cls}) => <div className={cls} />}
    actual={({cls}) => (
      <img src="https://www.fillmurray.com/notanimage" className={cls} />
    )}
    loading={({cls}) => (
      <div className={cls}>
        <p className="pa3 f5 lh-copy near-white">Loading...</p>
      </div>
    )}
    error={({cls}) => (
      <div className={`bg-light-red h-100 w-100 ${cls}`}>
        <p>There was an error fetching this image :(</p>
      </div>
    )}
  />
</div>
```

### Eager loading / Server-Side Rendering (SSR)

**What does SSR even mean in a lazy images context?**

If you recall the basic premise, then you will know that we "hide" the intended image and display a placeholder.
For the actual image request to kick off, Javascript has to have loaded, and detected that the image is in the viewport.
In cases where you are server-side rendering, there can be a non-neglible amount of time until Javascript is available (i.e. it has to download, parse, execute).
For those cases, it would be beneficial if we can mark images to render with the intended/final src by default, so that the browser can start requesting them as soon as it gets the HTML.

This behaviour is available by using a `loadEagerly` prop:

```jsx
<LazyImage
  loadEagerly
  src="https://www.fillmurray.com/g/600/400"
  placeholder={({cls}) => (
    <img src="https://www.fillmurray.com/g/60/40" className={cls} />
  )}
  actual={({cls}) => (
    <img src="https://www.fillmurray.com/g/600/400" className={cls} />
  )}
/>;
```

While the usage is simple, the patterns in your app will not necessarily be so.
Think about the cases where it is beneficial to do this, and apply it with intent. 
Examples might be eager-loading hero images, preloading the first few elements in a list and so on.
[Some of these use cases are provided as examples](#examples).

### Fallback without Javascript

If Javascript is disabled altogether by the user, then they will be stuck with the placeholder (and any images loaded eagerly).
This is probably undesirable.

There are a few strategies for fallbacks.
Most of them are variations on a `<noscript>` tag with the `actual` img and hiding the placeholder if JS is disabled.
Here is what it looks like rendered:

```jsx
// In the <head>
// Style applied only when JS is disabled
// Hide the LazyImage (since the actual one will be displayed in its place)
<noscript>
  <style>
    .LazyImage {
      display: none;
    }
  </style>
</noscript>

// Your component (as rendered)
// Placeholder since JS has not run; will be hidden with the style above.
<img src="placeholderImgSrc" class="LazyImage"/>

// img tags that are hidden are not loaded, yay!
<noscript>
  <img src="actualImgSrc" />  // Render the actual as usual
</noscript>
```

Until v0.3.0, this library had a fallback API, in the form of a `fallback` render prop.
This has been disabled due to issues with `<noscript>` in react causing the fallback to always load.

(See https://github.com/facebook/react/issues/11423 for more details)

Current solutions involve either using `dangerouslySetInnerHTML`, which is not safe, or `ReactDOMServer.renderToStaticMarkup`.
I thought it would be irresponsible to hide the fact that `dangerouslySetInnerHTML` is used from the user, so that excludes the first option.
I also think that using the server method, albeit safe, would be messy with some bundling configurations (which would keep the entirety of `react-dom/server`).

Silver lining:

There is generally no case where `<noscript>` will be rendered by client-side react, which means that, if you are in charge of server-rendering and
you trust your bundling setup, then you can have this fallback!
Look at [`src/fallbackUtils.tsx`](./src/fallbackUtils.tsx) for a function that can work.
You would probably do something like this:

```jsx
<LazyImage
  src="actualImgSrc"
  placeholder={//the usual}
  actual={//the usual}
/>
<Fallback>
  <img src="actualImgSrc" />
</Fallback>
```

Don't forget to also hide the `.LazyImage` as shown above.

This may or may not be good enough.
Please open an issue to discuss your needs if that is the case :)

### Polyfill IntersectionObserver

IntersectionObserver is generally well-supported, but it is still important to polyfill it!
[You can consult the usage data for IntersectionObserver here.](https://caniuse.com/#search=intersectionobserver)

The polyfill itself is pretty small, [on the order of 6k min, 2k gzipped](https://bundlephobia.com/result?p=intersection-observer@0.5.0).

[The polyfill is available through npm](http://npmjs.com/package/intersection-observer):

```shell
npm install --save intersection-observer
```

And import it at your app's entry point:

```js
import 'intersection-observer';
```

[Polyfill.io is an alternative method of distributing the polyfill](polyfill.io) if you wish.

#### About the polyfill

_It is generally a good idea to know what you are adding to your codebase_

The polyfill behaviour is to [fall back to the older strategy](https://github.com/w3c/IntersectionObserver/tree/master/polyfill); "debounced scroll listener and calculate bounding rectangle", as mentioned above.
It will not be as performant as the native IntersectionObserver, but likely no worse than most implementations of the older strategy.

## Examples
### About understanding the library and loading patterns
A variety of usage examples and recipes is provided in the form of storybook.

[You can browse the documentation online](https://fpapado.github.io/react-lazy-images) or look at `stories/`.

Read the notes section either on Storybook or the story source if you are wondering about the specifics of each pattern demonstrated.

### About using it in practice and abstracting over it
[The starter on Codesandbox](https://codesandbox.io/s/jnn9wjkj1w) has a good basis for two popular presentational patterns.
In particular, it shows intrinsic placeholders and fading in the actual image.

## API Reference

**`<LazyImage />`** accepts the following props:

| Name              | Type                                    | Default                                   | Required | Description                                                                                                                                                                                          |
| ----------------- | --------------------------------------- | ----------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **src**           | String                                  |                                           | true     | The source of the image to load                                                                                                                                                                      |
| **srcSet**        | String                                  |                                           | false    | If your images use srcset, you can pass the `srcSet` prop to provide that information for preloading. |
| **placeholder**   | Function (render prop)                  |                                           | true     | Component to display while image has not loaded                                                                                                                                                      |
| **actual**        | Function (render prop)                  |                                           | true     | Component to display once image has loaded                                                                                                                                                           |
| **loading**       | Function (render prop)                  | placeholder                               | false    | Component to display while the image is loading                                                                                                                                                      |
| **error**         | Function                                | placeholder                               | false    | Component to display if the image loading has failed (render prop)                                                                                                                                   |
| **loadEagerly**   | Boolean                                 | false                                     | false    | Whether to skip checking for viewport and always show the 'actual' component                                                                                                                         |
| **observerProps** | {threshold: number, rootMargin: string} | {threshold: 0.01, rootMargin: "50px 0px"} | false    | Subset of props for the IntersectionObserver                                                                                                                                                         |

[You can consult Typescript types in the code](./src/LazyImage.tsx) as a more exact definition.

## Feedback

I have some specific questions that I would like input on. If you want to go exploring, or have used the library and had gripes with it, then see [`FEEDBACK.md`](./FEEDBACK.md) and let's have a discussion!

## Roadmap

See [`ROADMAP.md`](./ROADMAP.md) for information and ideas about where the project is headed.

## Contributing

I would love to have contributions on this! Are there more patterns that we can expose and simplify? Is something not clear? See `CONTRIBUTING.md` for details.

## Thanks and Inspiration

Jeremy Wagner's writing on [Lazy Loading Images and Video](https://developers.google.com/web/fundamentals/performance/lazy-loading-guidance/images-and-video/) is a good reference for the problem and solutions space.

The library backing this one, [react-intersection-observer library](https://github.com/thebuilder/react-intersection-observer).
Further thanks for demonstrating Storybook as documentation for lazy-loading.

[Paul Lewis' implementation of lazy image loading](https://github.com/GoogleChromeLabs/sample-media-pwa/blob/master/src/client/scripts/helpers/lazy-load-images.js) has the concept of pre-loading images before swapping.

[Dave Rupert has a good guide on intrinsic image placeholders](https://daverupert.com/2015/12/intrinsic-placeholders-with-picture/)

[How Medium does lazy image loading](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)

## License

MIT License © Fotis Papadogeorgopoulos
