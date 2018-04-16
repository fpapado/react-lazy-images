import * as React from 'react';
import {storiesOf} from '@storybook/react';
import {action} from '@storybook/addon-actions';
import {withInfo} from '@storybook/addon-info';
import {
  LazyImage,
  renderDefaultFallback
} from '../dist/react-lazy-images.es.js';

const PlaceholderImage = () => (
  <img
    src="img/porto_buildings_lowres.jpg"
    alt="Buildings with tiled exteriors, lit by the sunset."
    className="w-100"
  />
);

const ActualImage = () => (
  <img
    src="img/porto_buildings_large.jpg"
    alt="Buildings with tiled exteriors, lit by the sunset."
    className="w-100"
  />
);

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
storiesOf('LazyImage', module)
  .add(
    'Basic use',
    withInfo(
      'Component that preloads the image once in the viewport and only swaps once ready'
    )(() => (
      <Container>
        <LazyImage
          src="img/porto_buildings_large.jpg"
          placeholder={() => <PlaceholderImage />}
          actual={() => <ActualImage />}
        />
      </Container>
    ))
  )
  // With srcSet
  .add(
    'With srcSet',
    withInfo(
      'With srcset, the browser decides which image to load. In that case, src is not informative enough for preloading. You can use the `srcSet` prop to provide that additional information to LazyImage.'
    )(() => (
      <Container>
        <LazyImage
          src="https://www.fillmurray.com/g/300/200"
          srcSet="https://www.fillmurray.com/g/900/600 900w, https://www.fillmurray.com/g/600/400 600w, https://www.fillmurray.com/g/300/200 300w"
          placeholder={() => (
            <img
              src="https://www.fillmurray.com/g/60/40"
              className="w-100"
              alt="A portrait of Bill Murray."
            />
          )}
          actual={() => (
            <img
              src="https://www.fillmurray.com/g/300/200"
              srcSet="https://www.fillmurray.com/g/900/600 900w, https://www.fillmurray.com/g/600/400 600w, https://www.fillmurray.com/g/300/200 300w"
              className="w-100"
              alt="A portrait of Bill Murray."
            />
          )}
        />
      </Container>
    ))
  )
  // With srcSet
  .add(
    'Without preloading (no src or srcSet)',
    withInfo(
      'Sometimes, it might be impractical to specify the src with your current setup. For example, it is possible that you are generating the sources for an Image CDN and have a dedicated component for it. In those cases, changing the component might be impractical in the short-term. If you provide no src or srcSet, then the preload-before-swap behaviour is not used. We believe that showing a possibly still-downloading image is better than having lazy-loading at all.'
    )(() => (
      <Container>
        <LazyImage
          placeholder={() => <PlaceholderImage />}
          actual={() => <ActualImage />}
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
          placeholder={() => <PlaceholderImage />}
          actual={() => <ActualImage />}
        />
      </Container>
    ))
  )
  // This isn't even specific to this library; just demonstrating how you might
  // eagerly load content above the fold, and defer the rest
  .add(
    'Eagerly load some images',
    withInfo(
      'This is an example of how you can use loadEagerly to load important content directly, and defer the rest.'
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
            placeholder={() => (
              <img
                src={`https://www.fillmurray.com/g/${placeholder}`}
                className="w-100"
                alt="A portrait of Bill Murray."
              />
            )}
            actual={() => (
              <img
                src={`https://www.fillmurray.com/g/${actual}`}
                className="w-100"
                alt="A portrait of Bill Murray."
              />
            )}
          />
        ))}
      </Container>
    ))
  )
  // Loading state as render prop
  .add(
    'Loading state',
    withInfo('Loading')(() => (
      <Container>
        <div className="bg-light-silver h5 w-100">
          <LazyImage
            src="img/porto_buildings_large.jpg"
            placeholder={() => <div />}
            actual={() => <ActualImage />}
            loading={() => (
              <div>
                <p className="pa3 f5 lh-copy near-white">Loading...</p>
              </div>
            )}
          />
        </div>
      </Container>
    ))
  )
  // Loading and Error states as render props
  .add(
    'Loading and Error states',
    withInfo('Loading and Error states are exposed as render props')(() => (
      <Container>
        <div className="bg-light-silver h5 w-100">
          <LazyImage
            src="https://www.fillmurray.com/notanimage"
            placeholder={() => <div />}
            actual={() => <img src="https://www.fillmurray.com/notanimage" />}
            loading={() => (
              <div>
                <p className="pa3 f5 lh-copy near-white">Loading...</p>
              </div>
            )}
            error={() => (
              <div className={`bg-light-red h-100 w-100 $`}>
                <p>There was an error fetching this image :(</p>
              </div>
            )}
          />
        </div>
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
                placeholder={() => (
                  <img
                    src={`https://www.fillmurray.com/g/${placeholder}`}
                    className="w-100"
                  />
                )}
                actual={() => (
                  <img
                    src={`https://www.fillmurray.com/g/${actual}`}
                    className="w-100"
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
      'You are in control of what gets rendered, so you can set the url of the background image, and swap in a component that uses it on load. It is not much different from the basic use case.'
    )(() => {
      const BgImage = ({bgSrc}) => (
        <div
          className={`$ w5 h5 contain bg-center`}
          style={{backgroundImage: `url(${bgSrc})`}}
        />
      );
      return (
        <Container>
          <LazyImage
            src="https://www.fillmurray.com/g/500/700"
            src="img/porto_buildings_large.jpg"
            placeholder={() => (
              <BgImage bgSrc="img/porto_buildings_lowres.jpg" />
            )}
            actual={() => <BgImage bgSrc="img/porto_buildings_large.jpg" />}
          />
        </Container>
      );
    })
  );
