import React from 'react';
import {LazyImageFull, CommonLazyImageProps, ImageState} from './LazyImageFull';

/**
 * Valid props for LazyImage
 */
export interface LazyImageProps extends CommonLazyImageProps {
  /** Component to display once image has loaded */
  actual: () => React.ReactElement<{}>;

  /** Component to display while image has not been requested
   * @default: undefined
   */
  placeholder?: () => React.ReactElement<{}>;

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
    {({src, srcSet, imageState}) => {
      switch (imageState) {
        case ImageState.NotAsked:
          return !!placeholder && placeholder();

        case ImageState.Loading:
          // Only render loading if specified, otherwise placeholder
          return !!loading ? loading() : !!placeholder && placeholder();

        case ImageState.LoadSuccess:
          return actual();

        case ImageState.LoadError:
          // Only render error if specified, otherwise actual
          return !!error ? error() : actual();
      }
    }}
  </LazyImageFull>
);

LazyImage.displayName = 'LazyImage';
