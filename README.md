> React utilities for lazy image loading in React

# React Lazy Images

Features:
- Composable pieces that range from the simple use case, to preloading images and more
- Modern, performant, implementation, using [IntersectionObserver]() and providing fallbacks
- Server-side rendering support
- Easy to understand source code. You should be able to fork and do your thing if desired.

What it does not do by itself:
- Dictate the kind of placeholders. There are many ways to do that; you can use a simple box with a background color (I hear gray is popular), or a blurred image, or anything you'd like. You are in control of the element that gets rendered.
- Animate the transitions. Again, you are in control of the containers, so it is possible to implement those upon consumption.
- Any kind of intrinsic placeholders. Those are better served by another library/styles/the consumer.

Basically, this library focuses on loading the images and supporting patterns around that. The actual components are yours to decide!

## The basic idea
Browsers preload images; as soon as they see an `<img>` tag with a valid `src`, they kick off the request for the image. Even in cases where a certain image is not in the viewport, it will be requested. This might have adverse effects for users, especially on mobile or metered connections.

This brings us to the basic premise of any Lazy Image Loading library:
- Have a way to observe the visibility of the DOM elements
- Prevent the browser from loading images directly
- Once an img is in view, instruct the browser to load it and place it in the element

In the past, this has meant "hiding" the actual `src` in a `data-src` attribute, and using classes to indicate state, e.g. `.isLazyLoaded .lazyLoad`. 
On initialisation, a script would scan these classes and attributes, keep track of visibily, and swap `data-src` with an actual `src`, kicking off the browser request process.
It could even elect to preload the Image, and only swap once loaded.

With React, all this implicit state management is made simpler, since you do not have to store loading information in the DOM and pick it back up again. This can potentially mean a nicer, more composable codebase, and it was one of the main design goals for this library.

The way to do this visibility tracking has for the most part listening for events such as scroll.
This is synchronous by nature and can have performance implications. This was the motivation for browsers providing [IntersectionObserver](). Using this API is not specific to React; it just seems like the best fit nowadays.

## Pieces
### Simple use case
`LazyImage` is the basic solution. Other components build on top of this. At its core, it is tiny, and you could implement this:

```js

```

At the moment, it uses [react-intersection-observer]() under the hood.
There are a few more pieces to it, such as warning about fallbacks and supporting Server-Side rendering.
[Check it out]()

### Customising what is displayed
The render prop pattern is used throughout.
The LazyImage component handles the behaviour of informing the consumer when the image is in view, but leaves the actual rendering up to the consumer. Thus, whether you want to display a simple `<img>`, your own `<Image>`, or even wrapped elements, it is simple to do so:

```
TODO: show render prop
src
actual
placeholder (show two different ones)
```

### Preloading Images
A common optimisation to the loading strategy is to preload the image before swapping it for the placeholder.
In other words, once the image is in view, you can kick off a request to load the image, and only swap it once loaded. 
This prevents swapping a half-loaded image (i.e. one that is still scanning top-to-bottom), and allows the transition to be smoother.

The interface is similar to LazyImage:
```
TODO: show render prop
src ...
actual: (src) => ...
placeholder (show two different ones)
```

### Server-Side Rendering (SSR)
### What does SSR even mean in a lazy images context?
If you recall the basic premise, then you will know that we "hide" the src or display a placeholder.
For the actual image request to kick off, Javascript has to have loaded, and detected that the document is in the viewport.
In cases where you are server-side rendering, there can be a non-neglible amount of time until Javascript is available (download, parse, execute).
For those cases, it would be beneficial if we can mark images to render with the intended/final src by default, so that the browser can start requesting them as soon as it gets the HTML.

As you can imagine, this is a pretty straightforward thing to implement; we just short-circuit the process if an `renderImmediately` flag is served. 

And while the implementation is simple, the patterns in your app will not necessarily be so. Think about when you  do this (e.gg. above the fold, otherwise you risk removing the benefits!).

## Polyfilling IntersectionObserver
...

## Feedback?
I have some specific questions that I would like input on. If you want to go exploring, or have used the library and had gripes with it, then see `FEEDBACK.md` and let's have a discussion!

## Contributing
I would love to have contributions on this! Are there more patterns that we can expose and simplify? Is something not clear? See `CONTRIBUTING.md` for details.

## Credits and Thanks
react-intersection-observer library
Paul Lewis' implementation of lazy image loading
How Medium does...
