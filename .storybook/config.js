import React from 'react';
import {configure} from '@storybook/react';
import {setOptions} from '@storybook/addon-options';
import { setDefaults } from '@storybook/addon-info';

import 'tachyons';

// addon-info
setDefaults({
  header: false, // Toggles display of header with component name and description
  inline: true,
});

setOptions({
  name: 'React Lazy Images',
  url: 'https://github.com/fpapado/react-lazy-images',
  addonPanelInRight: true
});

const req = require.context('../stories', true, /story\.tsx?$/)

function loadStories() {
  req.keys().forEach(req)
}

configure(loadStories, module)
