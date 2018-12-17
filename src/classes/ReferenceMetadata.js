class Name {
  given = '';
  family = '';
  literal = '';
}

class Date {
  day = '';
  month = '';
  year = '';
}

export default class ReferenceMetadata {
  author = [new Name()];
  collectionEditor = [new Name()];
  composer = [new Name()];
  containerAuthor = [new Name()];
  director = [new Name()];
  editor = [new Name()];
  editorialDirector = [new Name()];
  illustrator = [new Name()];
  interviewer = [new Name()];
  originalAuthor = [new Name()];
  recipient = [new Name()];
  reviewedAuthor = [new Name()];
  translator = [new Name()];

  accessed = new Date();
  eventDate = new Date();
  issued = new Date();
  originalDate = new Date();
  submitted = new Date();

  'abstract';
  annote;
  archive;
  archiveLocation;
  archivePlace;
  authority;
  callNumber;
  citationLabel;
  citationNumber;
  collectionTitle;
  containerTitle;
  containerTitleShort;
  dimensions;
  doi;
  edition;
  event;
  eventPlace;
  firstReferenceNoteNumber;
  genre;
  isbn;
  issn;
  issue;
  jurisdiction;
  keyword;
  locator;
  medium;
  note;
  number;
  numberOfPages;
  originalPublisher;
  originalPublisherPlace;
  originalTitle;
  page;
  pageFirst;
  pmcid;
  pmid;
  publisher;
  publisherPlace;
  references;
  reviewedTitle;
  scale;
  section;
  source;
  status;
  title;
  titleShort;
  url;
  version;
  volume;
  yearSuffix;

  rawStr;

  addNamePlaceholders () {
    if (this.author.length === 0) {
      this.author.push(new Name())
    }
    if (this.collectionEditor.length === 0) {
      this.collectionEditor.push(new Name())
    }
    if (this.composer.length === 0) {
      this.composer.push(new Name())
    }
    if (this.containerAuthor.length === 0) {
      this.containerAuthor.push(new Name())
    }
    if (this.director.length === 0) {
      this.director.push(new Name())
    }
    if (this.editor.length === 0) {
      this.editor.push(new Name())
    }
    if (this.editorialDirector.length === 0) {
      this.editorialDirector.push(new Name())
    }
    if (this.illustrator.length === 0) {
      this.illustrator.push(new Name())
    }
    if (this.interviewer.length === 0) {
      this.interviewer.push(new Name())
    }
    if (this.originalAuthor.length === 0) {
      this.originalAuthor.push(new Name())
    }
    if (this.recipient.length === 0) {
      this.recipient.push(new Name())
    }
    if (this.reviewedAuthor.length === 0) {
      this.reviewedAuthor.push(new Name())
    }
    if (this.translator.length === 0) {
      this.translator.push(new Name())
    }
  }
}
