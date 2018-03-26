import React from 'react';
import Observer from 'react-intersection-observer';
// LazyImage component that preloads the image before swapping in
export class LazyImage extends React.Component {
    constructor(props) {
        super(props);
        this.state = { inView: false, imageState: 'NotAsked' };
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
            this.setState({ imageState: 'Loading' });
            loadImage(this.props.src)
                .then(this.onLoadSuccess)
                .catch(this.onLoadError);
        }
    }
    onLoadSuccess() {
        this.setState({ imageState: 'LoadSuccess' });
    }
    onLoadError() {
        this.setState({ imageState: 'LoadError' });
    }
    render() {
        const { src, actual, placeholder, fallback, observerProps } = this.props;
        return (React.createElement(React.Fragment, null,
            React.createElement(Observer, Object.assign({ rootMargin: "50px 0px", threshold: 0.01 }, observerProps, { onChange: this.onInView, triggerOnce: true }), this.state.imageState === 'LoadSuccess'
                ? actual({ cls: 'LazyImage LazyImage-Actual' })
                : placeholder({ cls: 'LazyImage LazyImage-Placeholder' })),
            fallback && (React.createElement("noscript", null, fallback({ src, actual, placeholder })))));
    }
}
// Utilities
// Promise constructor for (pre)loading an image
// NOTE: this seems like the conventional way of doing it, and yet we are not
// using the img element per se. Should we use an explicit fetch(), perhaps?
const loadImage = src => new Promise((resolve, reject) => {
    const image = new Image();
    image.src = src;
    image.onload = resolve;
    image.onerror = reject;
});
// Fallbacks
// Just use the intended image as the fallback
export const renderDefaultFallback = ({ actual }) => (React.createElement(React.Fragment, null, actual));
