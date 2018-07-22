import React from "react";
import { storiesOf } from "@storybook/react";
import { action } from "@storybook/addon-actions";
import { withInfo } from "@storybook/addon-info";
import { LazyImage } from "../src/index";
import { Container, Divider } from "./utils";
import { LazyImageOpinionated } from "./OpinionatedComponents";
import "./styles.css";

// Helpers to save typing. You can imagine that in
// some cases, you too will have more specific components.
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

// Utils for scrolling
const scrollToRef = (ref: React.RefObject<any>) =>
  ref.current.scrollIntoView({ behavior: "smooth" });
const endRef: React.RefObject<any> = React.createRef();

// Component that preloads the image and only swaps once ready
//@ts-ignore
const stories = storiesOf("LazyImage", module);

stories
  .add(
    "Basic use",
    withInfo(
      "Component that preloads the image once in the viewport and only swaps once ready"
    )(() => (
      <Container>
        <LazyImage
          src="img/porto_buildings_large.jpg"
          alt="Buildings with tiled exteriors, lit by the sunset."
          placeholder={({ imageProps, ref }) => (
            <img
              ref={ref}
              src="img/porto_buildings_lowres.jpg"
              alt={imageProps.alt}
              className="w-100"
            />
          )}
          actual={({ imageProps }) => <img {...imageProps} className="w-100" />}
        />
      </Container>
    ))
  )
  // With srcSet
  .add(
    "With srcSet",
    withInfo(
      "With srcset, the browser decides which image to load. In that case, src is not informative enough for preloading. You can use the `srcSet` prop to provide that additional information to LazyImage."
    )(() => (
      <Container>
        <LazyImage
          src="https://www.fillmurray.com/g/300/200"
          srcSet="https://www.fillmurray.com/g/900/600 900w, https://www.fillmurray.com/g/600/400 600w, https://www.fillmurray.com/g/300/200 300w"
          alt="A portrait of Bill Murray."
          placeholder={({ imageProps, ref }) => (
            <img
              ref={ref}
              src="https://www.fillmurray.com/g/60/40"
              alt={imageProps.alt}
              className="w-100"
            />
          )}
          actual={({ imageProps }) => <img {...imageProps} className="w-100" />}
        />
      </Container>
    ))
  )
  // Always load an image ("eagerly"; how the browser does it already.
  // Useful if you want to load the actual content without waiting for Javascript.
  .add(
    "Eager loading (Server-Side Rendering)",
    withInfo(
      "Always load an image (i.e. eagerly; how the browser does it already). Useful if you want to load the actual content without waiting for Javascript. You should consider where you need this pattern. See the relevant section in README.md for more."
    )(() => (
      <Container>
        <LazyImage
          loadEagerly
          src="img/porto_buildings_large.jpg"
          placeholder={() => <PlaceholderImage />}
          actual={() => <ActualImage />}
        />
      </Container>
    ))
  )
  // This isn't even specific to this library; just demonstrating how you might
  // eagerly load content above the fold, and defer the rest
  .add(
    "Eagerly load some images",
    withInfo(
      "This is an example of how you can use loadEagerly to load important content directly, and defer the rest."
    )(() => (
      <Container>
        {[
          ["first", "30/20", "300/200"],
          ["second", "60/40", "600/400"],
          ["third", "90/60", "900/600"]
        ].map(([key, placeholder, actual], i) => (
          <LazyImage
            loadEagerly={i === 0}
            key={key}
            src={`https://www.fillmurray.com/g/${actual}`}
            alt="A portrait of Bill Murray."
            placeholder={({ imageProps, ref }) => (
              <img
                src={`https://www.fillmurray.com/g/${placeholder}`}
                ref={ref}
                alt={imageProps.alt}
                className="w-100"
              />
            )}
            actual={({ imageProps }) => (
              <img {...imageProps} className="w-100" />
            )}
          />
        ))}
      </Container>
    ))
  )
  // Loading state as render prop
  .add(
    "Loading state",
    withInfo("Loading")(() => (
      <Container>
        <div className="bg-light-silver h5 w-100">
          <LazyImage
            src="img/porto_buildings_large.jpg"
            placeholder={({ ref }) => <div ref={ref} />}
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
    "Loading and Error states",
    withInfo("Loading and Error states are exposed as render props")(() => (
      <Container>
        <div className="bg-light-silver h5 w-100">
          <LazyImage
            src="https://www.fillmurray.com/notanimage"
            placeholder={({ ref }) => <div ref={ref} />}
            actual={({ imageProps }) => <img {...imageProps} />}
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
    "Horizontal scroll",
    withInfo("Horizontal scrolling should work out of the box.")(() => (
      <Container>
        <div className="flex flex-row mw6 overflow-x-auto">
          {[
            ["first", "30/20", "300/200"],
            ["second", "60/40", "600/400"],
            ["third", "90/60", "900/600"]
          ].map(([key, placeholder, actual], i) => (
            <div
              key={key}
              className="w5 pa3 mr3 ba bw1 b--near-black flex-shrink-0"
            >
              <LazyImage
                key={key}
                src={`https://www.fillmurray.com/g/${actual}`}
                alt="A portrait of Bill Murray."
                placeholder={({ imageProps, ref }) => (
                  <img
                    src={`https://www.fillmurray.com/g/${placeholder}`}
                    ref={ref}
                    alt={imageProps.alt}
                    className="w-100"
                  />
                )}
                actual={({ imageProps }) => (
                  <img {...imageProps} className="w-100" />
                )}
              />
            </div>
          ))}
        </div>
      </Container>
    ))
  )
  .add(
    "Experimental decode",
    withInfo(
      "Decode off-main-thread before appending. Only supported in some browsers, but uses normal API otherwise. Test before using!"
    )(() => (
      <Container>
        <LazyImage
          src="img/porto_buildings_large.jpg"
          alt="Buildings with tiled exteriors, lit by the sunset."
          placeholder={({ imageProps, ref }) => (
            <img
              ref={ref}
              src="img/porto_buildings_lowres.jpg"
              alt={imageProps.alt}
              className="w-100"
            />
          )}
          actual={({ imageProps }) => <img {...imageProps} className="w-100" />}
          experimentalDecode={true}
        />
      </Container>
    ))
  )
  .add(
    "Background image",
    withInfo(
      "You are in control of what gets rendered, so you can set the url of the background image, and swap in a component that uses it on load. It is not much different from the basic use case."
    )(() => {
      return (
        <Container>
          <LazyImage
            src="img/porto_buildings_large.jpg"
            placeholder={({ ref }) => (
              <div
                ref={ref}
                className={`$ w5 h5 contain bg-center`}
                style={{
                  backgroundImage: "url(img/porto_buildings_lowres.jpg)"
                }}
              />
            )}
            actual={({ imageProps }) => (
              <div
                className={`$ w5 h5 contain bg-center`}
                style={{
                  backgroundImage: `url(${imageProps.src})`
                }}
              />
            )}
          />
        </Container>
      );
    })
  )
  .add(
    "Delayed loading",
    withInfo("TODO")(() => {
      return (
        <div className="mw6">
          <Divider>
            <h1>react-lazy-images Debounce test</h1>
            <p>NOTE: not yet implemented</p>
            <p>
              The desired behaviour is to not to start loading the images before
              them being in the viewport for X amount of time. Press the button
              to scroll alll the way to the end of the page. Only the final
              image should be loaded.
            </p>
            <p>
              Open your devTools network monitor and check the "Img" tab. Only
              the last image should load.
            </p>
            <p>
              (Note that smooth scrolling should be working in your browser for
              the test to be realistic. If not, you can scroll manually. Instant
              scrolling does not trigger the IntersectionObserver afaict).
            </p>
            <button onClick={() => scrollToRef(endRef)}>
              Click here to scroll to the end
            </button>
          </Divider>

          <LazyImageOpinionated
            src="https://endangered.photo/1200/800 "
            alt=""
          />

          <Divider />

          <h2 ref={endRef}>Only things below here should be loaded</h2>
          <LazyImageOpinionated
            src="https://endangered.photo/300/200 "
            alt=""
          />
        </div>
      );
    })
  );
