import ReferenceMetadata from '@/classes/ReferenceMetadata.js';

export default class Reference {
  id;
  projectId;
  sourceId;
  get authorStr () {
    return this.metadata.author.length > 0 ? this.metadata.author.map(a => a.literal ? a.literal : (a.given || '') + ' ' + (a.family || '')).join(', ') : 'Anon';
  }
  urlToImage;
  urlToResource;
  formattedStr;
  citations = [];
  notes = [];
  metadata = new ReferenceMetadata();
  isHighlighted = false;
  isSelected = false;

  mergeWithApiObj (referenceApiObj) {
    Object.assign(this, referenceApiObj);
    this.metadata = Object.assign(new ReferenceMetadata(), referenceApiObj.metadata);
  }
}
