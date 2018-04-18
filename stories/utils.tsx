import React from 'react';

export const Container = ({children}) => (
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

