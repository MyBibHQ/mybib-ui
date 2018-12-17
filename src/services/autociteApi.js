import axios from 'axios'

import {BASE_API_URL} from '@/config.js';

class AutociteApi {
  async search (searchTerm, sourceId) {
    const encodedSearchTerm = encodeURIComponent(searchTerm);
    try {
      const response = await axios.get(BASE_API_URL + `/autocite/search?q=${encodedSearchTerm}&sourceId=${sourceId}`);

      return response.data.results;
    } catch (error) {

    }
  }

  async autocitePdf (pdfBlob) {
    try {
      const formData = new FormData();
      formData.append('pdf', pdfBlob);
      formData.append('styleId', 'default-harvard');
      const response = await axios.post(BASE_API_URL + '/autocite/pdf', formData, {headers: { 'content-type': 'multipart/form-data' }});
      return response.data.result;
    } catch (error) {
    }
  }
}

const singleton = new AutociteApi();
export default singleton;
