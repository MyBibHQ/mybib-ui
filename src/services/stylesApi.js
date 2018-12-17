import axios from 'axios';

import {BASE_API_URL} from '@/config.js';

class StylesApi {
  async search (q) {
    let results = [];
    try {
      const response = await axios.get(BASE_API_URL + '/styles/search?q=' + q);
      results = response.data.styles;
    } catch (error) {

    }

    return results;
  }

  async preview (styleId) {
    try {
      const response = await axios.get(BASE_API_URL + '/styles/preview/' + styleId);
      return response.data;
    } catch (error) {

    }
  }
}

const singleton = new StylesApi();
export default singleton;
