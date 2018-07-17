import React from "react";
import {
  LazyImageFull,
  CommonLazyImageProps,
  ImageState,
  ImageProps
} from "./LazyImageFull";

/**
 * Valid props for LazyImage
 */
export interface LazyImageRenderPropArgs {
  imageProps: ImageProps;
  /** When not loading eagerly, a ref to bind to the DOM element. This is needed for the intersection calculation to work. */
  ref?: React.RefObject<{}>;
}

export interface LazyImageProps extends CommonLazyImageProps {
  /** Component to display once image has loaded */
  actual: (args: LazyImageRenderPropArgs) => React.ReactElement<{}>;

  /** Component to display while image has not been requested
   * @default: undefined
   */
  placeholder?: (args: LazyImageRenderPropArgs) => React.ReactElement<{}>;

  /** Component to display while the image is loading
   * @default placeholder, if defined
   */
  loading?: () => React.ReactElement<{}>;

  /** Component to display if the image fails to load
   * @default actual (broken image)
   */
  error?: () => React.ReactElement<{}>;
}

/**
 * Component that preloads the image once it is in the viewport,
 * and then swaps it in. Has predefined rendering logic, but the
 * specifics are up to the caller.
 */
export const LazyImage: React.StatelessComponent<LazyImageProps> = ({
  actual,
  placeholder,
  loading,
  error,
  ...rest
}) => (
  <LazyImageFull {...rest}>
    {({ imageState, imageProps, ref }) => {
      // Call the appropriate render callback based on the state
      // and the props specified, passing on relevant props.
      switch (imageState) {
        case ImageState.NotAsked:
          return !!placeholder && placeholder({ imageProps, ref });

        case ImageState.Loading:
          // Only render loading if specified, otherwise placeholder
          return !!loading
            ? loading()
            : !!placeholder && placeholder({ imageProps });

        case ImageState.LoadSuccess:
          return actual({ imageProps, ref });

        case ImageState.LoadError:
          // Only render error if specified, otherwise actual (broken image)
          return !!error ? error() : actual({ imageProps });
      }
    }}
  </LazyImageFull>
);

LazyImage.displayName = "LazyImage";
