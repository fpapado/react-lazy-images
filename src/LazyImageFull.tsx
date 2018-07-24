import React from "react";
import Observer from "react-intersection-observer";
import { unionize, ofType, UnionOf } from "unionize";

/**
 * Valid props for LazyImage components
 */
export type CommonLazyImageProps = ImageProps & {
  // NOTE: if you add props here, remember to destructure them out of being
  // passed to the children, in the render() callback.

  /** Whether to skip checking for viewport and always show the 'actual' component
   * @see https://github.com/fpapado/react-lazy-images/#eager-loading--server-side-rendering-ssr
   */
  loadEagerly?: boolean;

  /** Subset of props for the IntersectionObserver
   * @see https://github.com/thebuilder/react-intersection-observer#props
   */
  observerProps?: ObserverProps;

  /** Use the Image Decode API;
   * The call to a new HTML <img> element’s decode() function returns a promise, which,
   * when fulfilled, ensures that the image can be appended to the DOM without causing
   * a decoding delay on the next frame.
   *  @see: https://www.chromestatus.com/feature/5637156160667648
   */
  experimentalDecode?: boolean;

  /** Whether to log out internal state transitions for the component */
  debugActions?: boolean;

  /** Delay a certain duration before starting to load, in ms.
   * This can help avoid loading images while the user scrolls quickly past them.
   * TODO: naming things.
   */
  debounceDurationMs?: number;
};

/** Valid props for LazyImageFull */
export interface LazyImageFullProps extends CommonLazyImageProps {
  /** Children should be either a function or a node */
  children: (args: RenderCallbackArgs) => React.ReactNode;
}

/** Values that the render props take */
export interface RenderCallbackArgs {
  imageState: ImageState;
  imageProps: ImageProps;
  /** When not loading eagerly, a ref to bind to the DOM element. This is needed for the intersection calculation to work. */
  ref?: React.RefObject<any>;
}

export interface ImageProps {
  /** The source of the image to load */
  src: string;

  /** The source set of the image to load */
  srcSet?: string;

  /** The alt text description of the image you are loading */
  alt?: string;

  /** Sizes descriptor */
  sizes?: string;
}

/** Subset of react-intersection-observer's props */
export interface ObserverProps {
  /**
   * Margin around the root that expands the area for intersection.
   * @see https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
   * @default "50px 0px"
   * @example Declaration same as CSS margin:
   *  `"10px 20px 30px 40px"` (top, right, bottom, left).
   */
  rootMargin?: string;

  /** Number between 0 and 1 indicating the the percentage that should be
   * visible before triggering.
   * @default `0.01`
   */
  threshold?: number;
}

/** States that the image loading can be in.
 * Used together with LazyImageFull render props.
 * External representation of the internal state.
 * */
export enum ImageState {
  NotAsked = "NotAsked",
  Buffering = "Buffering",
  Loading = "Loading",
  LoadSuccess = "LoadSuccess",
  LoadError = "LoadError"
}

/** The component's state */
const LazyImageFullState = unionize({
  NotAsked: {},
  Buffering: {},
  // Could try to make it Promise<HTMLImageElement>,
  // but we don't use the element anyway, and we cache promises
  Loading: {},
  LoadSuccess: {},
  LoadError: ofType<{ msg: string }>()
});

type LazyImageFullState = UnionOf<typeof LazyImageFullState>;

/** Actions that change the component's state.
 * These are not unlike Actions in Redux or, the ones I'm inspired by,
 * Commands in Elm.
 */
const Action = unionize({
  ViewChanged: ofType<{ inView: boolean }>(),
  BufferingEnded: {},
  // MAYBE: Load: {},
  LoadSuccess: {},
  LoadError: ofType<{ msg: string }>()
});

type Action = UnionOf<typeof Action>;

/**
 * Component that preloads the image once it is in the viewport,
 * and then swaps it in. Takes a render prop that allows to specify
 * what is rendered based on the loading state.
 */
export class LazyImageFull extends React.Component<
  LazyImageFullProps,
  LazyImageFullState
> {
  static displayName = "LazyImageFull";

  /** A central place to store promises.
   * A bit silly, but passing promsises directly in the state
   * was giving me weird timing issues. This way we can keep
   * the promises in check, and pick them up from the respective methods.
   * FUTURE: Could pass the relevant key in Buffering and Loading, so
   * that at least we know where they are from a single source.
   */
  promiseCache: {
    [key: string]: CancelablePromise | Promise<void>;
  } = {};

  initialState = LazyImageFullState.NotAsked();

  constructor(props: LazyImageFullProps) {
    super(props);
    this.state = this.initialState;

    // Bind methods
    // This would be nicer with arrow functions and class properties,
    // but holding off until they are settled.
    this.update = this.update.bind(this);
    this.reducer = this.reducer.bind(this);
  }

  update(action: Action) {
    this.setState((prevState: LazyImageFullState, props) => {
      const nextState = this.reducer(action, prevState, props);

      // TODO: consider how to expose this
      if (props.debugActions) {
        if (process.env.NODE_ENV === "production") {
          console.warn(
            'You are running LazyImage with debugActions="true" in production. This might have performance implications.'
          );
        }
        console.log({ action, prevState, nextState });
      }

      return nextState;
    });
  }

  /** Emit the next state based on actions.
   * The core of the component.
   *
   * FUTURE: Instead of kicking off the promise chain directly,
   * could return a second argument, giving [nextState, cmd], like Elm.
   * Then, the update function would be in charge of calling the cmd, in
   * the react setState callback.
   */
  reducer(
    action: Action,
    prevState: LazyImageFullState,
    props: LazyImageFullProps
  ): LazyImageFullState {
    return Action.match(action, {
      ViewChanged: ({ inView }) => {
        if (inView === true) {
          // If src is not specified, then there is nothing to preload; skip to Loaded state
          if (!props.src) {
            return LazyImageFullState.LoadSuccess(); // Error wtf
          } else {
            // If in view, only load something if NotAsked, otherwise leave untouched
            return LazyImageFullState.match(prevState, {
              NotAsked: () => {
                // If debounce is specified, then start buffering
                if (!!props.debounceDurationMs) {
                  // Make cancelable buffering Promise
                  const bufferingPromise = makeCancelable(
                    delayedPromise(props.debounceDurationMs)
                  );

                  // Kick off promise chain
                  bufferingPromise.promise
                    .then(() => this.update(Action.BufferingEnded()))
                    .catch(
                      _reason => {}
                      //console.log({ isCanceled: _reason.isCanceled })
                    );

                  // Side-effect; set the promise in the cache
                  this.promiseCache["buffering"] = bufferingPromise;

                  return LazyImageFullState.Buffering();
                } else {
                  // If no debounce is specified, then start loading immediately
                  // TODO: this is an exact copy-paste from the BufferingEnded case.
                  // Consider whether splitting it off in a function or a "LoadImage" action
                  // is more desirable.
                  const { src, srcSet, alt, sizes, experimentalDecode } = props;
                  // Kick off request for Image and attach listeners for response
                  const loadingPromise = loadImage(
                    {
                      src,
                      srcSet,
                      alt,
                      sizes
                    },
                    experimentalDecode
                  )
                    .then(_res => this.update(Action.LoadSuccess({})))
                    .catch(_e =>
                      // TODO: think more about the error here
                      this.update(Action.LoadError({ msg: "Failed to load" }))
                    );

                  // Side-effect; set the promise in the cache
                  this.promiseCache["loading"] = loadingPromise;

                  return LazyImageFullState.Loading();
                }
              },
              // Do nothing in other states
              default: () => prevState
            });
          }
        } else {
          // If out of view, cancel if Buffering, otherwise leave untouched
          return LazyImageFullState.match(prevState, {
            Buffering: () => {
              // Side-effect; cancel the promise in the cache
              // We know this exists if we are in a Buffering state
              (this.promiseCache["buffering"] as CancelablePromise).cancel();
              return LazyImageFullState.NotAsked();
            },
            // Do nothing in other states
            default: () => prevState
          });
        }
      },
      // Buffering has ended/succeeded, kick off request for image
      BufferingEnded: () => {
        const { src, srcSet, alt, sizes, experimentalDecode } = props;
        // Kick off request for Image and attach listeners for response
        const loadingPromise = loadImage(
          {
            src,
            srcSet,
            alt,
            sizes
          },
          experimentalDecode
        )
          .then(_res => this.update(Action.LoadSuccess({})))
          .catch(_e =>
            // TODO: think more about the error here
            this.update(Action.LoadError({ msg: "Failed to load" }))
          );

        // Side-effect; set the promise in the cache
        this.promiseCache["loading"] = loadingPromise;

        return LazyImageFullState.Loading();
      },
      // Loading the image succeeded, simple
      LoadSuccess: () => LazyImageFullState.LoadSuccess(),
      // Loading the image failed, simple
      LoadError: e => LazyImageFullState.LoadError(e)
    });
  }

  // Render function
  render() {
    // This destructuring is silly
    const {
      children,
      loadEagerly,
      observerProps,
      experimentalDecode,
      debounceDurationMs,
      debugActions,
      ...imageProps
    } = this.props;

    if (loadEagerly) {
      // If eager, skip the observer and view changing stuff; resolve the imageState as loaded.
      return children({
        // We know that the state tags and the enum match up
        imageState: LazyImageFullState.LoadSuccess().tag as ImageState,
        imageProps
      });
    } else {
      return (
        <Observer
          rootMargin="50px 0px"
          // TODO: reconsider threshold
          threshold={0.01}
          {...observerProps}
          onChange={inView => this.update(Action.ViewChanged({ inView }))}
        >
          {({ ref }) =>
            children({
              // We know that the state tags and the enum match up
              imageState: this.state.tag as ImageState,
              imageProps,
              ref
            })
          }
        </Observer>
      );
    }
  }
}

///// Utilities /////

/** Promise constructor for loading an image */
const loadImage = (
  { src, srcSet, alt, sizes }: ImageProps,
  experimentalDecode = false
) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    if (srcSet) {
      image.srcset = srcSet;
    }
    if (alt) {
      image.alt = alt;
    }
    if (sizes) {
      image.sizes = sizes;
    }
    image.src = src;

    /** @see: https://www.chromestatus.com/feature/5637156160667648 */
    if (experimentalDecode && "decode" in image) {
      return (
        image
          // NOTE: .decode() is not in the TS defs yet
          // TODO: consider writing the .decode() definition and sending a PR
          //@ts-ignore
          .decode()
          .then((image: HTMLImageElement) => resolve(image))
          .catch((err: any) => reject(err))
      );
    }

    image.onload = resolve;
    image.onerror = reject;
  });

/** Promise that resolves after a specified number of ms */
const delayedPromise = (ms: number) =>
  new Promise(resolve => setTimeout(resolve, ms));

interface CancelablePromise {
  promise: Promise<{}>;
  cancel: () => void;
}

/** Make a Promise "cancelable".
 *
 * Rejects with {isCanceled: true} if canceled.
 *
 * The way this works is by wrapping it with internal hasCanceled_ state
 * and checking it before resolving.
 */
const makeCancelable = (promise: Promise<any>): CancelablePromise => {
  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      (val: any) => (hasCanceled_ ? reject({ isCanceled: true }) : resolve(val))
    );
    promise.catch(
      (error: any) =>
        hasCanceled_ ? reject({ isCanceled: true }) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCanceled_ = true;
    }
  };
};
