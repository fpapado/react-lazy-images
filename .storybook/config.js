import React from 'react';
import {configure} from '@storybook/react';
import {setOptions} from '@storybook/addon-options';
import 'tachyons';

setOptions({
  name: 'React Lazy Images',
  url: 'https://github.com/fpapado/react-lazy-images',
  addonPanelInRight: true
});

const req = require.context('../stories', true, /story\.js$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
