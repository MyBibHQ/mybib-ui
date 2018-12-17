import Cookies from 'js-cookie';
import Config from '@/config.js';

class AccessToken {
  constructor () {
    this._tokenId = Config.cookiePrefixString;
  }

  get () {
    return Cookies.get(this._tokenId);
  }

  set (accessToken) {
    Cookies.set(this._tokenId, accessToken, { expires: 730 });
  }
}

const singleton = new AccessToken();
export default singleton;
