import Cookies from 'js-cookie'
import Config from '@/config.js';

class Tooltips {
  categoriesToHide = [];
  tooltipsToHide = [];

  constructor () {
    // check cookies for existing settings
    const existingSettingsJson = Cookies.get(Config.cookiePrefixString + '-tooltips');
    if (existingSettingsJson) {
      // they exist. Update the store
      const existingSettings = JSON.parse(existingSettingsJson);
      this.categoriesToHide = existingSettings.categoriesToHide;
      this.tooltipsToHide = existingSettings.tooltipsToHide;
    } else {
      // add the cookie
      this._saveCookie();
    }
  }

  showAll () {
    this.categoriesToHide.length = 0;
    this.tooltipsToHide = 0;

    this._saveCookie();
  }

  hideCategory (category) {
    this.categoriesToHide.push(category);

    this._saveCookie();
  }
  showCategory (category) {
    this.categoriesToHide.splice(this.categoriesToHide.indexOf(category), 1);

    // and also remove all the tooltips that have this category
    this.tooltipsToHide = this.tooltipsToHide.filter(t => {
      return t.category !== category;
    });

    this._saveCookie();
  }

  hideTooltip (tooltip) {
    this.tooltipsToHide.push(tooltip);

    this._saveCookie();
  }
  showTooltip (tooltip) {
    this.tooltipsToHide.splice(this.tooltipsToHide.indexOf(tooltip), 1);

    this._saveCookie();
  }

  _saveCookie () {
    Cookies.set(Config.cookiePrefixString + '-tooltips', JSON.stringify(this), { expires: 730 });
  }
}

const singleton = new Tooltips();
export default singleton;
