import axios from 'axios'
import AccessToken from '@/services/accessToken.js';

import {BASE_API_URL} from '@/config.js';

class ExportApi {
  async saveBibliographyToGoogleDrive (projectId, bearerToken) {
    try {
      const response = await axios.post(BASE_API_URL + `/export/${projectId}/google-drive`, bearerToken, { headers: { 'Access-Token': AccessToken.get() } });

      return response.data;
    } catch (error) {

    }
  }
}

const singleton = new ExportApi();
export default singleton;
