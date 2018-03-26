import React from 'react';
import Observer from 'react-intersection-observer';

interface _LazyImageProps {
  src: string;
  placeholder: () => React.ReactElement<{}>;
  actual: () => React.ReactElement<{}>;
}

export interface LazyImageProps extends _LazyImageProps {
  fallbackStrategy?: FallbackStrategy;
  observerProps?: any; // TODO: fix this by using IntersectionObserverProps
}

type FallbackStrategy =
  | 'Off'
  | 'NoScriptActual'
  | ((_LazyImageProps) => React.ReactElement<{}>);

interface LazyImageState {
  inView: boolean;
  imageState: ImageState;
}

type ImageState = 'NotAsked' | 'Loading' | 'LoadSuccess' | 'LoadError';

// LazyImage component that preloads the image before swapping in
// TODO: cancel loading on componentWillUnmount
// TODO: loadEagerly
// TODO: customisable Observer props, defaultProps
// TODO: example of abstraction with further HoC
// TODO: pass ({lazyClass}) to actual/placeholder and note why it is important
// TODO: handle different states/provide hooks
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

  // WIP: noscript fallback; could place it on top of the placeholder
  // and tell the user to figure out whether they want to hide it,
  // e.g. with <noscript><style>.LazyImage { display: none }</style></noscript>
  render() {
    const {
      src,
      actual,
      placeholder,
      fallbackStrategy,
      observerProps
    } = this.props;
    return (
      <React.Fragment>
        <Observer
          rootMargin="50px 0px"
          threshold={0.01}
          {...observerProps}
          onChange={this.onInView}
          triggerOnce
        >
          {this.state.imageState === 'LoadSuccess' ? actual : placeholder}
        </Observer>

        {/* Display this if JS is disabled */}
        <Fallback
          strategy={fallbackStrategy || 'Off'}
          src={src}
          actual={actual}
          placeholder={placeholder}
        />
      </React.Fragment>
    );
  }
}

// Utilities

// Promise constructor for (pre)loading an image
// IDEA: this seems like the conventional way of doing it, and yet we are not
// using the img element per se. Should we use an explicit fetch(), perhaps?
const loadImage = src =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
  });

// TODO: could actually export this!
const Fallback = ({strategy, src, actual, placeholder}) => {
  // Render prop, custom fallback
  // TODO: naive, make explicit instead with fallback=... prop
  if (typeof strategy === 'function') {
    return <noscript>{strategy({src, actual, placeholder})}</noscript>;
  }
  // Predefined Strategies
  if (strategy === 'NoScriptActual') {
    return <noscript>{actual}</noscript>;
  }
  if (strategy === 'Off') {
    return null;
  }
};

// Most basic implementation
// TODO: customisable Observer props, defaultProps
export const LazyImageBasic = ({placeholder, actual, loadEagerly}) => (
  <Observer rootMargin="50px 0px" threshold={0.01} triggerOnce>
    {inView => (loadEagerly || inView ? actual : placeholder)}
  </Observer>
);
