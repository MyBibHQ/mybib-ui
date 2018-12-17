import axios from 'axios';

import Reference from '@/classes/Reference.js';

import {BASE_API_URL} from '@/config.js';

class ReferenceImporter {
  importedReferences = [];

  async import (importType, fileText) {
    let importToken;
    try {
      const response = await axios.post(BASE_API_URL + '/import/stash/' + importType, {importStr: fileText});
      importToken = response.data.token;
    } catch (error) {

    }

    return importToken;
  }

  async retrieve (importToken) {
    this.importedReferences = [];

    try {
      const response = await axios.get(BASE_API_URL + '/import/retrieve/' + importToken);
      this.importedReferences = response.data.references.map((r) => {
        const reference = new Reference();
        reference.mergeWithApiObj(r);
        return reference;
      });
    } catch (error) {
    }

    return this.importedReferences;
  }
}

const singleton = new ReferenceImporter();
export default singleton;
