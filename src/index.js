import React from 'react';
import Observer from 'react-intersection-observer';

// Most basic implementation
export const LazyImage = ({placeholder, actual, loadEagerly}) => (
  <Observer rootMargin="50px 0px" threshold={0.01} triggerOnce>
    {inView => (loadEagerly || inView ? actual : placeholder)}
  </Observer>
);
