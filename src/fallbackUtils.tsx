import ReactDOMServer from 'react-dom/server';

{/* Display this if JS is disabled
  * WARN: See https://github.com/facebook/react/issues/11423 for why
  * this is here. Not ideal at all tbh.
  *
  * If you just use <noscript>, the browser will fetch the fallback directly.
  * There is really no common case where the <noscript> would be client-react-rendered
  * (since JS would be disabled anyway), so this is fine to use on the server side.
  *
  * I would advise against using dangerouslySetInnerHTML,
  * unless you trust the input, which is why we cannot offer this as the
  * default in `LazyImage`. It will probably be more typing, and effort.
  * Just decide what is best for your users and use case :)
  *
  * If the React <noscript> issue is fixed, then expect the library to offer
  * a fallback API as it did in v0.3.0.
  */
}

const Fallback = (fallback: React.Component<{}>) => (
  <noscript>{ReactDOMServer.renderToStaticMarkup(fallback)}</noscript>
);
