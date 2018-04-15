import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withInfo} from '@storybook/addon-info';
import {LazyImageFull, ImageState} from '../dist/react-lazy-images.es.js';

const Container = ({children}) => (
  <div className="pa3 near-black bg-washed-yellow">
    <div
      className="flex justify-center items-center"
      style={{minHeight: 'calc(100vh + 100px)'}}
    >
      <p className="f3 sans-serif lh-copy measure-narrow">
        Scroll down to see the photos :)<br />
        You might want to throttle the network in your dev tools to see the
        effect.
      </p>
    </div>
    <div className="mw6">{children}</div>
  </div>
);

// Component that preloads the image and only swaps once ready
storiesOf('LazyImageFull', module).add(
  'Basic use',
  withInfo(
    LazyImageFull gives you more fine-grained control over the rendering, by passing the state to the render prop.
    Useful if you are doing css transitions, and where only some parts of the tree need to change.
    Anything you can implement with LazyImage, you can implement with LazyImageFull.
  )(() => (
    <Container>
      <LazyImageFull src="https://www.fillmurray.com/g/600/400">
        {({imageState, src}) => (
          <img
            src={
              imageState === ImageState.LoadSuccess
                ? src
                : 'https://www.fillmurray.com/g/60/40'
            }
            className="w-100"
          />
        )}
      </LazyImageFull>
    </Container>
  ))
);
