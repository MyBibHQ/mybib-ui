import axios from 'axios';
import AccessToken from '@/services/accessToken.js';

import Reference from '@/classes/Reference.js';

import {BASE_API_URL} from '@/config.js';

export default class Project {
  id;
  title;
  styleId;
  styleName;
  styleFormat;
  referenceDisplayMode = 'formatted';
  hasHangingIndent = false;
  lineSpacing;
  entrySpacing;
  titleText;
  titleAlign;
  titleSize;
  titleSpacing;
  isLoading = false;
  references = [];

  async save () {
    try {
      const response = await axios.put(BASE_API_URL + '/projects/' + this.id, { title: this.title, styleId: this.styleId, folderName: this.folderName }, { headers: { 'Access-Token': AccessToken.get() } })
      Object.assign(this, response.data.project);
    } catch (error) {

    }
  }

  async changeStyle (styleId) {
    this.styleId = styleId;
    await this.save();
    await this.loadReferences();
  }

  async loadReferences () {
    this.isLoading = true;

    try {
      const response = await axios.get(BASE_API_URL + '/projects/' + this.id + '/references', { headers: { 'Access-Token': AccessToken.get() } });
      this.references.length = 0;
      this.references = response.data.references.map((r) => {
        const reference = new Reference();
        reference.mergeWithApiObj(r);
        return reference;
      });
      this.hasHangingIndent = response.data.hasHangingIndent;
      this.lineSpacing = response.data.lineSpacing;
      this.entrySpacing = response.data.entrySpacing;
      this.titleText = response.data.titleText;
      this.titleAlign = response.data.titleAlign;
      this.titleSize = response.data.titleSize;
      this.titleSpacing = response.data.titleSpacing;
    } catch (error) {
      // location.reload();
    } finally {
      this.isLoading = false;
    }
  }

  async addReference (reference) {
    this.isLoading = true;

    try {
      const response = await axios.post(BASE_API_URL + '/projects/' + this.id + '/references', reference, { headers: { 'Access-Token': AccessToken.get() } });
      await this.loadReferences();
      // now highlight it
      const newReference = this.references.find((r) => {
        return r.id === response.data.reference.id;
      });
      newReference.isHighlighted = true;
      setTimeout(() => {
        newReference.isHighlighted = false;
      }, 8000)

      return newReference;
    } catch (error) {
      // location.reload();
    } finally {
      this.isLoading = false;
    }
  }

  async addReferences (references) {
    this.isLoading = true;

    try {
      const response = await axios.post(BASE_API_URL + '/projects/' + this.id + '/references/multi', references, { headers: { 'Access-Token': AccessToken.get() } });
      await this.loadReferences();
      const newReferences = this.references.filter((r) => {
        return response.data.references.find((rr) => {
          return rr.id === r.id
        });
      });
      newReferences.forEach((r) => {
        r.isHighlighted = true;
        setTimeout(() => {
          r.isHighlighted = false;
        }, 8000)
      })

      return newReferences;
    } catch (error) {
      // location.reload();
    } finally {
      this.isLoading = false;
    }
  }

  async updateReference (reference) {
    try {
      const response = await axios.put(BASE_API_URL + '/projects/' + this.id + '/references/' + reference.id, reference, { headers: { 'Access-Token': AccessToken.get() } })
      await this.loadReferences();
      const updatedReference = this.references.find((r) => {
        return r.id === response.data.reference.id;
      });
      updatedReference.isHighlighted = true;
      setTimeout(() => {
        updatedReference.isHighlighted = false;
      }, 8000)

      return updatedReference;
    } catch (error) {
    }
  }

  async deleteReference (reference) {
    reference.indexWhenDeleted = this.references.indexOf(reference);
    const removedReference = this.references.splice(reference.indexWhenDeleted, 1)[0];

    try {
      await axios.delete(BASE_API_URL + '/projects/' + this.id + '/references/' + reference.id, { headers: { 'Access-Token': AccessToken.get() } })
    } catch (error) {
      // it failed. Put it back.
      this.references.splice(reference.indexWhenDeleted, 0, removedReference);
    }
  }

  async deleteReferences (references) {
    for (let reference of references.reverse()) {
      this.deleteReference(reference);
    }
  }

  async restoreReference (reference) {
    this.references.splice(reference.indexWhenDeleted, 0, reference);

    await axios.put(BASE_API_URL + '/projects/' + this.id + '/references/' + reference.id + '/restore', { }, { headers: { 'Access-Token': AccessToken.get() } })
      .then(() => {
        // it worked. Nothing to do
      }, () => {
        // it failed. remove it again
        this.references.splice(reference.indexWhenDeleted, 1);
      })
  }

  async restoreReferences (references) {
    for (let reference of references.reverse()) {
      this.restoreReference(reference);
    }
  }
}
