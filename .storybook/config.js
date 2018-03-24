import React from 'react';
import {configure} from '@storybook/react';
import {setOptions} from '@storybook/addon-options';
import pack from '../package.json';
import 'tachyons';

setOptions({
  name: pack.name,
  url: pack.repository
});

const req = require.context('../stories', true, /story\.js$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
