import React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withInfo} from '@storybook/addon-info';
import {LazyImageFull, ImageState} from '../src/index';
import {Container} from './utils';

// Component that preloads the image and passes the loading state in render prop
//@ts-ignore
const stories = storiesOf('LazyImageFull', module);

stories
  .add(
    'Basic use',
    withInfo(
      `LazyImageFull gives you more fine-grained control over the rendering, by passing the state to the render prop.
    Useful if you are doing css transitions, and where only some parts of the tree need to change.
    Anything you can implement with LazyImage, you can implement with LazyImageFull.`
    )(() => (
      <Container>
        <LazyImageFull
          src="img/porto_buildings_large.jpg"
          alt="Buildings with tiled exteriors, lit by the sunset."
        >
          {({imageState, src, alt}) => (
            <img
              src={
                imageState === ImageState.LoadSuccess
                  ? src
                  : 'img/porto_buildings_lowres.jpg'
              }
              alt={alt}
              className="w-100"
            />
          )}
        </LazyImageFull>
      </Container>
    ))
  )
  .add(
    'With render prop',
    withInfo()(() => (
      <Container>
        <LazyImageFull
          src="img/porto_buildings_large.jpg"
          alt="Buildings with tiled exteriors, lit by the sunset."
          render={({imageState, src, alt}) => (
            <img
              src={
                imageState === ImageState.LoadSuccess
                  ? src
                  : 'img/porto_buildings_lowres.jpg'
              }
              alt={alt}
              className="w-100"
            />
          )}
        />
      </Container>
    ))
  );
