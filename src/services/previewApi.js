import axios from 'axios'

import {BASE_API_URL} from '@/config.js';

class PreviewApi {
  async generatePreview (styleId, sourceId, referenceMetadata) {
    if (!styleId || !sourceId || !referenceMetadata) {
      return;
    }

    try {
      const response = await axios.post(BASE_API_URL + `/preview/single?styleId=${styleId}&sourceId=${sourceId}`, referenceMetadata);

      return response.data.formattedStr;
    } catch (error) {
    }
  }
}

const singleton = new PreviewApi();
export default singleton;
