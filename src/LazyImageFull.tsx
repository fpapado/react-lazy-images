import React from "react";
import Observer from "react-intersection-observer";

/**
 * Valid props for LazyImage components
 */
export type CommonLazyImageProps = ImageProps & {
  /** Whether to skip checking for viewport and always show the 'actual' component
   * @see https://github.com/fpapado/react-lazy-images/#eager-loading--server-side-rendering-ssr
   */
  loadEagerly?: boolean;

  /** Subset of props for the IntersectionObserver
   * @see https://github.com/thebuilder/react-intersection-observer#props
   */
  observerProps?: ObserverProps;
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
  ref?: React.RefObject<{}>;
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

/** The component's state */
export type LazyImageFullState = {
  hasBeenInView: boolean;
  imageState: ImageState;
};

/** States that the image loading can be in.
 * Used together with LazyImageFull render props
 * */
export enum ImageState {
  NotAsked = "NotAsked",
  Loading = "Loading",
  LoadSuccess = "LoadSuccess",
  LoadError = "LoadError"
}

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

  initialState = { hasBeenInView: false, imageState: ImageState.NotAsked };

  constructor(props: LazyImageFullProps) {
    super(props);
    this.state = this.initialState;

    // Bind methods
    // This would be nicer with arrow functions and class properties,
    // but holding off until they are settled.
    this.onInView = this.onInView.bind(this);
    this.onLoadSuccess = this.onLoadSuccess.bind(this);
    this.onLoadError = this.onLoadError.bind(this);
  }

  // Update functions
  onInView(inView: boolean) {
    if (inView === true) {
      // If src is not specified, then there is nothing to preload; skip to Loaded state
      if (!this.props.src) {
        this.setState((state, _props) => ({
          ...state,
          imageState: ImageState.LoadSuccess
        }));
      } else {
        // Kick off request for Image and attach listeners for response
        this.setState((state, _props) => ({
          ...state,
          imageState: ImageState.Loading
        }));

        loadImage({
          src: this.props.src,
          srcSet: this.props.srcSet,
          alt: this.props.alt,
          sizes: this.props.sizes
        })
          .then(this.onLoadSuccess)
          .catch(this.onLoadError);
      }
    }
  }

  onLoadSuccess() {
    this.setState((state, _props) => ({
      ...state,
      imageState: ImageState.LoadSuccess
    }));
  }

  onLoadError() {
    this.setState((state, _props) => ({
      ...state,
      imageState: ImageState.LoadError
    }));
  }

  // Render function
  render() {
    const { children, loadEagerly, observerProps, ...imageProps } = this.props;

    if (loadEagerly) {
      // If eager, skip the observer and view changing stuff; resolve the imageState as loaded.
      return children({ imageState: ImageState.LoadSuccess, imageProps });
    } else {
      return (
        <Observer
          rootMargin="50px 0px"
          threshold={0.01}
          {...observerProps}
          onChange={this.onInView}
          triggerOnce
        >
          {({ ref }) =>
            children({ imageState: this.state.imageState, imageProps, ref })
          }
        </Observer>
      );
    }
  }
}

// Utilities

/** Promise constructor for loading an image */
const loadImage = ({ src, srcSet, alt, sizes }: ImageProps) =>
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
    image.onload = resolve;
    image.onerror = reject;
  });
