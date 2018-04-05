import React from 'react';
import Observer from 'react-intersection-observer';

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
  /** Placeholder component to display while image has not loaded */
  placeholder: (RenderPropArgs) => React.ReactElement<{}>;
  /** The component to display once image has loaded */
  actual: (RenderPropArgs) => React.ReactElement<{}>;
  /** Whether to skip checking for viewport and always show the 'actual' component
   * @see https://github.com/fpapado/react-lazy-images/#eager-loading--server-side-rendering-ssr
   */
  loadEagerly?: boolean;
  /** Subset of props for the IntersectionObserver
   * @see https://github.com/thebuilder/react-intersection-observer#props
   */
  observerProps?: any; // TODO: fix this by using IntersectionObserverProps, limit to RootMargin etc.
}

interface LazyImageState {
  inView: boolean;
  imageState: ImageState;
}

type ImageState = 'NotAsked' | 'Loading' | 'LoadSuccess' | 'LoadError';

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
  }

  // Update functions
  onInView(inView) {
    if (inView) {
      // Kick off request for Image and attach listeners for response
      this.setState({imageState: 'Loading'});
      loadImage(this.props.src)
        .then(this.onLoadSuccess)
        .catch(this.onLoadError);
    }
  }

  onLoadSuccess() {
    this.setState({imageState: 'LoadSuccess'});
  }

  onLoadError() {
    this.setState({imageState: 'LoadError'});
  }

  // Render functions
  render() {
    if (this.props.loadEagerly) return this.renderEager(this.props);
    return this.renderLazy(this.props);
  }

  renderEager({actual}: LazyImageProps) {
    return (
      <React.Fragment>
        {actual({cls: 'LazyImage LazyImage-Actual'})}
      </React.Fragment>
    );
  }

  renderLazy({src, actual, placeholder, observerProps}: LazyImageProps) {
    return (
      <React.Fragment>
        <Observer
          rootMargin="50px 0px"
          threshold={0.01}
          {...observerProps}
          onChange={this.onInView}
          triggerOnce
        >
          {this.state.imageState === 'LoadSuccess'
            ? actual({cls: 'LazyImage LazyImage-Actual'})
            : placeholder({cls: 'LazyImage LazyImage-Placeholder'})}
        </Observer>
      </React.Fragment>
    );
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
