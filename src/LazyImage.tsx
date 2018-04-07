import React from 'react';
import Observer, {IntersectionObserverProps} from 'react-intersection-observer';

/**
 * Values that the render props take
 */
interface RenderPropArgs {
  cls: string;
}

/**
 * Valid props for LazyImage
 */
export interface LazyImageProps {
  /** The source of the image to load */
  src: string;
  /** The component to display while image has not loaded */
  placeholder: (RenderPropArgs) => React.ReactElement<{}>;

  /** The component to display once image has loaded */
  actual: (RenderPropArgs) => React.ReactElement<{}>;

  /** The component to display while the image is loading */
  loading: (RenderPropArgs) => React.ReactElement<{}>;

  /** The component to display if the image fails to load */
  error: (RenderPropArgs) => React.ReactElement<{}>;

  /** Whether to skip checking for viewport and always show the 'actual' component
   * @see https://github.com/fpapado/react-lazy-images/#eager-loading--server-side-rendering-ssr
   */

  loadEagerly?: boolean;
  /** Subset of props for the IntersectionObserver
   * @see https://github.com/thebuilder/react-intersection-observer#props
   */

  /** Props for the IntersectionObserver */
  observerProps?: ObserverProps;
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
   * @default `0.1`
   */
  threshold?: number;
}

export interface LazyImageState {
  inView: boolean;
  imageState: ImageState;
}

export type ImageState = 'NotAsked' | 'Loading' | 'LoadSuccess' | 'LoadError';

/**
 * Component that preloads the image once it is in the viewport,
 * and then swaps it in.
 */
export class LazyImage extends React.Component<LazyImageProps, LazyImageState> {
  constructor(props) {
    super(props);
    this.state = {inView: false, imageState: 'NotAsked'};

    // Bind methods
    // This would be nicer with arrow functions and class properties,
    // but holding off until they are settled.
    this.onInView = this.onInView.bind(this);
    this.onLoadSuccess = this.onLoadSuccess.bind(this);
    this.onLoadError = this.onLoadError.bind(this);
    this.renderEager = this.renderEager.bind(this);
    this.renderLazy = this.renderLazy.bind(this);
    this.renderState = this.renderState.bind(this);
  }

  // Update functions
  onInView(inView) {
    if (inView) {
      // Kick off request for Image and attach listeners for response
      this.setState((state, props) => ({...state, imageState: 'Loading'}));

      loadImage(this.props.src)
        .then(this.onLoadSuccess)
        .catch(this.onLoadError);
    }
  }

  onLoadSuccess() {
    this.setState((state, props) => ({...state, imageState: 'LoadSuccess'}));
  }

  onLoadError() {
    this.setState((state, props) => ({...state, imageState: 'LoadError'}));
  }

  // Render functions
  render() {
    if (this.props.loadEagerly) return this.renderEager(this.props);
    return this.renderLazy(this.state, this.props);
  }

  renderEager({actual}: LazyImageProps) {
    return (
      <React.Fragment>
        {actual({cls: 'LazyImage LazyImage-Actual'})}
      </React.Fragment>
    );
  }

  renderLazy(state, {observerProps, ...rest}: LazyImageProps) {
    return (
      <React.Fragment>
        <Observer
          rootMargin="50px 0px"
          threshold={0.01}
          {...observerProps}
          onChange={this.onInView}
          triggerOnce
        >
          {this.renderState(state.imageState, rest)}
        </Observer>
      </React.Fragment>
    );
  }

  /** Render the appropriate component based on state */
  renderState(
    imageState: ImageState,
    {actual, placeholder, loading, error}: LazyImageProps
  ) {
    switch (imageState) {
      case 'NotAsked':
        return placeholder({cls: 'LazyImage LazyImage-Placeholder'});

      case 'Loading':
        // Only render loading if specified, otherwise placeholder
        return !!loading
          ? loading({cls: 'LazyImage LazyImage-Loading'})
          : placeholder({cls: 'LazyImage LazyImage-Placeholder'});

      case 'LoadSuccess':
        return actual({cls: 'LazyImage LazyImage-Placeholder'});

      case 'LoadError':
        // Only render error if specified, otherwise actual
        return !!error
          ? error({cls: 'LazyImage LazyImage-Error'})
          : actual({cls: 'LazyImage LazyImage-Placeholder'});
    }
  }
}

// Utilities

/* NOTE: this seems like the conventional way of doing it, and yet we are not
   using the img element per se. Should we use an explicit fetch(), perhaps?
 */
/** Promise constructor for loading an image */
const loadImage = src =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
  });
