# React Lazy Images
> Components and utilities for lazy image loading in React.

[![npm](https://img.shields.io/npm/v/react-lazy-images.svg)](https://www.npmjs.com/package/react-lazy-images)
[![gzip size](http://img.badgesize.io/https://unpkg.com/react-lazy-images/dist/react-lazy-images.js?compression=gzip)](https://unpkg.com/react-lazy-images/dist/react-lazy-images.js)

:construction: Work in progress :construction:

[This documentation is here to document the goals](http://tom.preston-werner.com/2010/08/23/readme-driven-development.html)

## Table of Contents

-   [Features](#features)
-   [Install](#install)
-   [Motivation](#motivation)
-   [Usage](#usage)
-   [Examples](#examples)
-   [API](#api)
-   [Feedback](#feedback)
-   [Contributing](#contributing)
-   [License](#license)
-   [Thanks](#thanks)

## Features:
- Composable pieces that range from the simple use case, to preloading images and more
- Modern, performant implementation, using [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) and providing fallback strategies
- Eager loading / Server-side rendering support
- Easy to understand source code. You should be able to fork and do your thing if desired.

What it does not do by itself:
- Polyfill `IntersectionObserver`. Adding polyfills is something you should do consciously at the application level, especially if they might incur download and performance costs. See [Polyfilling IntersectionObserver](#polyfill) for different strategies.
- Dictate the kind of placeholders. There are many ways to do that; you can use a simple box with a background color (I hear gray is popular), a blurred image, some gradient or anything you'd like. You are in control of the element that gets rendered.
- Animate the transitions. Again, you are in control of the containers, so it is possible to implement those at the consumer.
- Any kind of intrinsic ratios. Those are better served by another library/styles composed with this one.

In other words, this library focuses on loading the images once in view and supporting loading patterns around that. The actual components are yours to decide!

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
import { LazyImage } from 'react-lazy-images';

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
- Have a way to observe the visibility of the DOM elements
- Prevent the browser from loading images directly
- Once an image is in view, instruct the browser to load it and place it in the element

In the past, this has meant "hiding" the actual `src` in a `data-src` attribute, and using classes to indicate state, e.g. `.isLazyLoaded .lazyLoad`.
On initialisation, a script would query for these classes and attributes, keep track of visibily, and swap `data-src` with an actual `src`, kicking off the browser request process.
It could even elect to preload the Image, and only swap once loaded.

With React, all this implicit state management is made simpler, since you do not have to stash loading information in the DOM and pick it back up again.
This can potentially mean a nicer, more composable codebase, and it was one of the main design goals for this library.

The way to do this visibility tracking has for the most part been listening for events such as scroll.
This is synchronous by nature and can have performance implications.
This was the motivation for browsers providing [IntersectionObserver]().
Using this API is not specific to React; it just seems like a good fit for this task nowadays.

## Usage
### Quick Start
If you want to just dive in, do this:
```jsx
import {LazyImage, renderDefaultFallback} from 'react-lazy-images';

<LazyImage
  src="https://www.fillmurray.com/g/600/400"
  placeholder={
    ({cls}) =>
      <img src="https://www.fillmurray.com/g/60/40" className={cls} />
  }
  actual={
    ({cls}) =>
      <img src="https://www.fillmurray.com/g/600/400" className={cls} />
  }
  fallback={renderDefaultFallback}
/>
```

Additionally, make sure you understand [how to polyfill IntersectionObserver](#polyfill) and [strategies for when JS is not available](#fallback).

From then on:
- If you want to learn more about the API and the problem space, read the rest of this section.
- If you want to list the props, see the [API reference]

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

This behaviour is provided by default:
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

### Eager loading / Server-Side Rendering (SSR)
**What does SSR even mean in a lazy images context?**

If you recall the basic premise, then you will know that we "hide" the intended image and display a placeholder.
For the actual image request to kick off, Javascript has to have loaded, and detected that the image is in the viewport.
In cases where you are server-side rendering, there can be a non-neglible amount of time until Javascript is available (i.e. it has to download, parse, execute).
For those cases, it would be beneficial if we can mark images to render with the intended/final src by default, so that the browser can start requesting them as soon as it gets the HTML.

This is a pretty straightforward thing to implement; we just short-circuit the process by using a `loadEagerly` prop:
```jsx
<LazyImage
  loadEagerly
  src="https://www.fillmurray.com/g/600/400"
  placeholder={
    <img src="https://www.fillmurray.com/g/60/40" className="w-100" />
  }
  actual={
    <img src="https://www.fillmurray.com/g/600/400" className="w-100" />
  }
/>
```

While the implementation is simple, the patterns in your app will not necessarily be so.
Think about the cases where it is beneficial to do this, and apply it with intent. Examples might be hero images, the first X elements in a list and so on.
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

### Polyfill
:construction: Work in progress :construction:

[Usage data for IntersectionObserver](https://caniuse.com/#search=intersectionobserver)

Strategies for polyfilling IntersectionObserver

## Examples
A variety of usage examples and recipes is provided in the form of storybook.
[You can browse the documentation online](https://fpapado.github.io/react-lazy-images) or look at `stories/`.

## API
:construction: Work in progress :construction:

## Feedback
I have some specific questions that I would like input on. If you want to go exploring, or have used the library and had gripes with it, then see [`FEEDBACK.md`](./FEEDBACK.md) and let's have a discussion!

## Contributing
:construction: Work in progress :construction:

I would love to have contributions on this! Are there more patterns that we can expose and simplify? Is something not clear? See `CONTRIBUTING.md` for details.

## License
MIT License © Fotis Papadogeorgpoulos

## Thanks
(And inspiration)

[react-intersection-observer library](https://github.com/thebuilder/react-intersection-observer)
This is the library backing `LazyImage`.
Further thanks for demonstrating Storybook as documentation.

[Paul Lewis' implementation of lazy image loading](https://github.com/GoogleChromeLabs/sample-media-pwa/blob/master/src/client/scripts/helpers/lazy-load-images.js)

[How Medium does lazy image loading](https://jmperezperez.com/medium-image-progressive-loading-placeholder/)
