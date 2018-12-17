import axios from 'axios';

class Config {
  cookiePrefixString = 'myb';
  sources = [];

  async loadServerSideConfig () {
    try {
      const response = await axios.get(BASE_API_URL + '/config');
      if (response.status === 200) {
        this.sources = response.data.sources;
      }
    } catch (e) {

    }
  }
}

const singleton = new Config();
export default singleton;

export const BASE_API_URL = process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:52075/api';
