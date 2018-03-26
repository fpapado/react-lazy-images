import React from 'react';
import Observer from 'react-intersection-observer';

interface _LazyImageProps {
  src: string;
  placeholder: (RenderPropArgs) => React.ReactElement<{}>;
  actual: (RenderPropArgs) => React.ReactElement<{}>;
}

interface RenderPropArgs {
  cls: string;
}

export interface LazyImageProps extends _LazyImageProps {
  fallback?: Fallback;
  observerProps?: any; // TODO: fix this by using IntersectionObserverProps
}

type Fallback = ((_LazyImageProps) => React.ReactElement<{}>);

interface LazyImageState {
  inView: boolean;
  imageState: ImageState;
}

type ImageState = 'NotAsked' | 'Loading' | 'LoadSuccess' | 'LoadError';

// LazyImage component that preloads the image before swapping in
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
  }

  // Updates
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

  render() {
    const {src, actual, placeholder, fallback, observerProps} = this.props;
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

        {/* Display this if JS is disabled */}
        {fallback && (
          <noscript>{fallback({src, actual, placeholder})}</noscript>
        )}
      </React.Fragment>
    );
  }
}

// Utilities

// Promise constructor for (pre)loading an image
// NOTE: this seems like the conventional way of doing it, and yet we are not
// using the img element per se. Should we use an explicit fetch(), perhaps?
const loadImage = src =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
  });

// Fallbacks
// Just use the intended image as the fallback
export const renderDefaultFallback: Fallback = ({actual}) => (
  <React.Fragment>{actual}</React.Fragment>
);
