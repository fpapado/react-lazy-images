import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withInfo} from '@storybook/addon-info';
import {
  LazyImage,
  renderDefaultFallback
} from '../dist/react-lazy-images.es.js';

const Container = ({children}) => (
  <div className="pa3 near-black bg-washed-yellow">
    <div className="min-vh-100 flex justify-center items-center">
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
storiesOf('LazyImage', module)
  .add(
    'Basic use',
    withInfo(
      'Component that preloads the image once in the viewport and only swaps once ready'
    )(() => (
      <Container>
        <LazyImage
          src="https://www.fillmurray.com/g/600/400"
          placeholder={({cls}) => (
            <img
              src="https://www.fillmurray.com/g/60/40"
              className={`${cls} w-100`}
            />
          )}
          actual={({cls}) => (
            <img
              src="https://www.fillmurray.com/g/600/400"
              className={`${cls} w-100`}
            />
          )}
        />
        <LazyImage
          src="https://www.fillmurray.com/g/300/200"
          placeholder={({cls}) => (
            <img
              src="https://www.fillmurray.com/g/30/20"
              className={`${cls} w-100`}
            />
          )}
          actual={({cls}) => (
            <img
              src="https://www.fillmurray.com/g/300/200"
              className={`${cls} w-100`}
            />
          )}
        />
      </Container>
    ))
  )
  // Always load an image (aka "eagerly"; how the browser does it already.
  // Useful if you want to load the actual content without waiting for Javascript.
  .add(
    'Eager loading (Server-Side Rendering)',
    withInfo(
      'Always load an image (i.e. eagerly; how the browser does it already). Useful if you want to load the actual content without waiting for Javascript. You should consider where you need this pattern. See the relevant section in README.md for more.'
    )(() => (
      <Container>
        <LazyImage
          loadEagerly
          placeholder={({cls}) => (
            <img
              src="https://www.fillmurray.com/g/60/40"
              className={`${cls} w-100`}
            />
          )}
          actual={({cls}) => (
            <img
              src="https://www.fillmurray.com/g/600/400"
              className={`${cls} w-100`}
            />
          )}
        />
      </Container>
    ))
  )
  // This isn't even specific to this library; just demonstrating how you might
  // eagerly load content above the fold, and defer the rest
  .add(
    'Eagerly load some images',
    withInfo(
      'This is not specific to this library; just demonstrating how you might eagerly load content above the fold, and defer the rest'
    )(() => (
      <Container>
        {[
          ['first', '30/20', '300/200'],
          ['second', '60/40', '600/400'],
          ['third', '90/60', '900/600']
        ].map(([key, placeholder, actual], i) => (
          <LazyImage
            loadEagerly={i === 0}
            key={key}
            src={`https://www.fillmurray.com/g/${actual}`}
            placeholder={({cls}) => (
              <img
                src={`https://www.fillmurray.com/g/${placeholder}`}
                className={`${cls} w-100`}
              />
            )}
            actual={({cls}) => (
              <img
                src={`https://www.fillmurray.com/g/${actual}`}
                className={`${cls} w-100`}
              />
            )}
          />
        ))}
      </Container>
    ))
  )
  .add(
    'Horizontal scroll',
    withInfo('Horizontal scrolling should work out of the box.')(() => (
      <Container>
        <div className="flex flex-row mw6 overflow-x-auto">
          {[
            ['first', '30/20', '300/200'],
            ['second', '60/40', '600/400'],
            ['third', '90/60', '900/600']
          ].map(([key, placeholder, actual], i) => (
            <div
              key={key}
              className="w5 pa3 mr3 ba bw1 b--near-black flex-shrink-0"
            >
              <LazyImage
                key={key}
                src={`https://www.fillmurray.com/g/${actual}`}
                placeholder={({cls}) => (
                  <img
                    src={`https://www.fillmurray.com/g/${placeholder}`}
                    className={`${cls} w-100`}
                  />
                )}
                actual={({cls}) => (
                  <img
                    src={`https://www.fillmurray.com/g/${actual}`}
                    className={`${cls} w-100`}
                  />
                )}
              />
            </div>
          ))}
        </div>
      </Container>
    ))
  )
  .add(
    'Background image',
    withInfo(
      'You are in control of what gets rendered, so you can just do this.'
    )(() => {
      const BgImage = ({cls, bgSrc}) => (
        <div className={`${cls} w5 h5 contain bg-center`} style={{backgroundImage: `url(${bgSrc})`}} />
      );
      return (
        <Container>
          <LazyImage
            src="https://www.fillmurray.com/g/500/700"
            placeholder={({cls}) => (
              <BgImage
                bgSrc="https://www.fillmurray.com/g/50/70"
                cls={cls}
              />
            )}
            actual={({cls}) => (
              <BgImage
                bgSrc="https://www.fillmurray.com/g/500/700"
                cls={cls}
              />
            )}
          />
        </Container>
      );
    })
  );
