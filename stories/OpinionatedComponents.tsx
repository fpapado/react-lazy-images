import React from "react";
import { LazyImage } from "../src/index";

/* Have you settled on how the actual images render in your application?
 * For instance, you might have a container and a class. You might have
 * tuned some options that match your use case, and just want to pass
 * the src.
 * Then you can easily abstract away to a level that works for you
 * and your team.
*/
interface IOpinionated {
  src: string;
  alt: string;
}

/** Component that shows a box as placeholder, fades the image in, and keeps the aspect ratio at 3x2
 * This is probably not what you would name things, but it works for demonstration :)
 */
export const LazyImageOpinionated: React.SFC<IOpinionated> = ({ src, alt }) => (
  <div className="bg-near-white intrinsic intrinsic--3x2">
    <LazyImage
      src={src}
      alt={alt}
      placeholder={({ ref }) => <div ref={ref} className="intrinsic-item" />}
      actual={({ imageProps }) => (
        <img {...imageProps} className="intrinsic-item animated fadeIn" />
      )}
      debounceDurationMs={1000}
      debugActions={true}
    />
  </div>
);

/** Component that shows an image as placeholder, fades the image in, and keeps the aspect ratio at 3x2
 * Note that since we want the image to cross-fade on top of the placeholder one,
 * we have to always show the placeholder.
 * You could just as well toggle the placeholder/actual props to do this; it's mostly preference.
 */
export const LazyImageHoCWithPlaceholderSrc: React.SFC<
  IOpinionated & { placeholderSrc: string }
> = ({ src, alt, placeholderSrc }) => (
  <div className="bg-near-white intrinsic intrinsic--3x2">
    <img src={placeholderSrc} className="intrinsic-item" alt={alt} />
    <LazyImage
      src={src}
      alt={alt}
      placeholder={({ ref }) => <div ref={ref} className="intrinsic-item" />}
      actual={({ imageProps }) => (
        <img {...imageProps} className="intrinsic-item animated fadeIn" />
      )}
      debounceDurationMs={1000}
    />
  </div>
);
