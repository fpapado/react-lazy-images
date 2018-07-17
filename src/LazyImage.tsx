import React from "react";
import {
  LazyImageFull,
  CommonLazyImageProps,
  ImageState
} from "./LazyImageFull";

/**
 * Valid props for LazyImage
 */
export interface LazyImageRenderPropArgs {
  src?: string;
  srcSet?: string;
  alt?: string;
  sizes?: string;
}

export interface LazyImageProps extends CommonLazyImageProps {
  /** Component to display once image has loaded */
  actual: (args: LazyImageRenderPropArgs) => React.ReactElement<{}>;

  /** Component to display while image has not been requested
   * @default: undefined
   */
  placeholder?: (
    args: Pick<LazyImageRenderPropArgs, "alt">
  ) => React.ReactElement<{}>;

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
    {({ imageState, imageProps }) => {
      // Call the appropriate render callback based on the state
      // and the props specified, passing on relevant props.
      switch (imageState) {
        case ImageState.NotAsked:
          return !!placeholder && placeholder(imageProps);

        case ImageState.Loading:
          // Only render loading if specified, otherwise placeholder
          return !!loading
            ? loading()
            : !!placeholder && placeholder(imageProps);

        case ImageState.LoadSuccess:
          return actual(imageProps);

        case ImageState.LoadError:
          // Only render error if specified, otherwise actual (broken image)
          return !!error ? error() : actual(imageProps);
      }
    }}
  </LazyImageFull>
);

LazyImage.displayName = "LazyImage";
