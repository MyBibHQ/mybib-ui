<template>
  <div class="paper">
    <router-link :to="{name: 'Project', params:{projectId: $route.params.projectId}}" class="main-back">
      <i class="material-icons">arrow_back</i>
    </router-link>
    <router-link :to="{name: 'Project', params:{projectId: $route.params.projectId}}" class="main-close">
      <i class="material-icons">close</i>
    </router-link>

    <h1>New {{$t('Reference')}}</h1>

    <div class="center-column">
      <div class="search-widget" ref="searchWidget">
        <ul class="tabs">
          <li v-for="(specialSource, index) in specialSources" :key="index" :class="{selected: selectedSourceId === specialSource.id}" class="tab">
            <button @click="changeSource(specialSource.id)">{{specialSource.name}}</button>
          </li>

          <li class="more tab" :class="{open: moreDropdownOpen, selected: moreSourceIsSelected}">
            <button @click="openMoreDropdown()">{{moreDropdownText}} <i class="material-icons">arrow_drop_down</i></button>
            <div class="more-sources-dropdown">
              <div style="font-weight:500;">Select a source</div>

              <div class="sources-container">
                <button v-for="(source, index) in config.sources.filter((s) => { return s.name.toLowerCase().indexOf(sourceFilterTerm.toLowerCase()) > -1 })" :key="index" @click="changeSource(source.id)">{{source.name}}</button>
              </div>
            </div>
          </li>
        </ul>

        <div v-if="!moreDropdownOpen" class="body">
          <div class="input-wrapper">
            <input type="text" ref="searchTerm" v-model="searchTerm" :placeholder="inputPlaceholderText" @keyup.enter="doSearch()"/>
            <button class="btn btn-raised bg-blue white" :disabled="isSearching" @click="doSearch()">
              <span>
                <i class="material-icons">search</i> Search
              </span>
            </button>
          </div>
        </div>

        <div v-if="showFileUrlWarning" style="background:rgb(242, 222, 222); color:rgb(169, 68, 66); padding:10px;">
          We can't autocite a file on your computer, but if it's a PDF try drag and dropping it into the zone below.
        </div>
        
        <div v-if="selectedSourceId && !hasSearched && !isSearching" style="text-align:center;">
          <div class="or-break">or</div>
          <router-link :to="{ name: 'NewReference', params:{ sourceId:selectedSourceId } }" class="btn btn-outline btn-inline">enter manually</router-link>
          <div class="or-break">or</div>
          <div style="align-items:center; border: 10px dashed #f4f6f8; color:#747f8b; display:flex; height:100px; justify-content:center;">
            Drag and drop a scholarly PDF here!
          </div>
        </div>
      
        <TooltipLg v-if="!hasSearched && !moreDropdownOpen" tooltipId="autociteSearchBox" category="intro" placement="left" :target="searchWidgetTooltipTarget" primary>
          <p>👉 First, select the type of source you want to {{$t('referenceVerb')}}, then search for it in the search box.</p>
          <p>Tip: use the ISBN, ISSN, DOI, or URL for the best accuracy.</p>
        </TooltipLg>
      </div>

      <div v-if="isSearching" style="height:200px; position:relative;">
        <Spinner />
      </div>

      <div v-if="hasSearched" class="search-results" ref="searchResults">
        <div v-if="searchResults.length === 0" class="no-results-found">No results found. Try again or <router-link :to="{ name: 'NewReference', params:{ sourceId:selectedSourceId } }" class="btn btn-outline btn-inline">enter manually</router-link></div>
        <div v-if="searchResults.length > 0">
          <ul ref="searchResults" style="margin-bottom:50px;">
            <li v-for="(result, index) in searchResults" :key="index" class="result">
              <button @click="selectResult(result)">
                <ListReferenceDetailed :reference="result" />
              </button>
            </li>
          </ul>
          <div style="text-align:center;">
            <div class="or-break">or</div>
            <router-link :to="{ name: 'NewReference', params:{ sourceId:selectedSourceId } }" class="btn btn-outline btn-inline">enter manually</router-link>
          </div>
          <TooltipLg v-if="searchResults.length > 0" tooltipId="autociteSearchResults" category="intro" placement="left start" :target="searchResultsTooltipTarget" primary>
            <p>🙌 We found some results! Now select one to auto-generate your {{$t('reference')}}.</p>
          </TooltipLg>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js';
import MessageBus from '@/services/messageBus.js';
import AutociteApi from '@/services/autociteApi.js';

import ListReferenceDetailed from '@/components/ListReferenceDetailed';
import Spinner from '@/components/Spinner';
import TooltipLg from '@/components/TooltipLg';

export default {
  name: 'NewReferenceSearch',
  components: {
    ListReferenceDetailed,
    Spinner,
    TooltipLg
  },
  data () {
    return {
      config: Config,
      selectedSourceId: null,
      specialSources: [{
        id: 'webpage',
        name: '🌐 Website',
        inputPlaceholderText: 'Search for the page title or paste a URL address. PDFs supported.'
      }, {
        id: 'book',
        name: '📚 Book',
        inputPlaceholderText: 'Search for the book title or ISBN'
      }, {
        id: 'article_journal',
        name: '📜 Journal',
        inputPlaceholderText: 'Search for the journal article title or DOI'
      }, {
        id: 'video',
        name: '📹 Video',
        inputPlaceholderText: 'Search for the video title or paste a URL address'
      }],
      moreDropdownOpen: false,
      sourceFilterTerm: '',
      searchTerm: '',
      hasSearched: false,
      isSearching: false,
      searchResults: [],
      searchWidgetTooltipTarget: null,
      searchResultsTooltipTarget: null
    };
  },
  computed: {
    selectedSource () {
      return Config.sources.find((s) => { return s.id === this.selectedSourceId });
    },
    moreSourceIsSelected () {
      return this.selectedSourceId && !this.specialSources.find((s) => { return s.id === this.selectedSourceId });
    },
    moreDropdownText () {
      return this.moreSourceIsSelected ? this.selectedSource.name : 'More';
    },
    inputPlaceholderText () {
      return this.moreSourceIsSelected ? 'Search for the title or enter a URL' : this.selectedSourceId !== null ? this.specialSources.find((s) => { return s.id === this.selectedSourceId }).inputPlaceholderText : '';
    },
    showFileUrlWarning () {
      return this.searchTerm.toLowerCase().startsWith('file://');
    }
  },
  methods: {
    changeSource (sourceId) {
      this.clearSearch();
      this.selectedSourceId = sourceId;
      this.moreDropdownOpen = false;
      // if the source type doesn't have autocite then redirect straight to the manual form
      if (!this.selectedSource.hasAutocite) {
        this.$router.push({ name: 'NewReference', params: { sourceId: sourceId } });
      } else {
        setTimeout(() => {
          this.$refs.searchTerm.focus();
        }, 50)
      }
    },
    openMoreDropdown () {
      this.clearSearch();
      this.selectedSourceId = null;
      this.moreDropdownOpen = true;
      // setTimeout(() => {
      //   this.$refs.sourceFilterTerm.focus();
      // }, 50)
    },
    clearSearch () {
      this.hasSearched = false;
      this.searchResults.length = 0;
    },
    async doSearch () {
      window.history.replaceState({}, null, `#${this.$route.path}?q=${encodeURIComponent(this.searchTerm)}&source=${this.selectedSourceId}`);
      if (this.searchTerm && this.searchTerm.length > 1) {
        this.clearSearch();
        this.isSearching = true;

        let searchResults = await AutociteApi.search(this.searchTerm, this.selectedSourceId);
        if (searchResults && searchResults.length > 0) {
          this.searchResults = searchResults;
        }
        this.isSearching = false;
        this.hasSearched = true;
      }
    },
    async handleFileDropped () {
      this.clearSearch();
      this.isSearching = true;

      const pdfAutociteResult = await AutociteApi.autocitePdf(MessageBus.droppedPdf);
      if (pdfAutociteResult) {
        this.searchResults = [pdfAutociteResult];
      }
      this.isSearching = false;
      this.hasSearched = true;
      MessageBus.droppedPdf = null;
    },
    selectResult (result) {
      MessageBus.newReference = {
        metadata: result.metadata,
        urlToImage: result.urlToImage
      }
      this.$router.push({ name: 'NewReference', params: { sourceId: result.sourceId } });
    }
  },
  created () {
    MessageBus.newReference = {};
  },
  mounted () {
    this.changeSource('webpage');

    this.searchWidgetTooltipTarget = this.$refs.searchWidget;

    // check for pre-populated q and source params
    if (this.$route.query.q && this.$route.query.source) {
      this.searchTerm = this.$route.query.q;
      this.changeSource(this.$route.query.source);
      this.$nextTick(() => {
        this.doSearch(); // this is in a nextTick because otherwise the tooltip breaks the enter manually button
      })
    }

    // check for pre-populated pdf
    if (MessageBus.droppedPdf) {
      this.handleFileDropped();
    }
  },
  updated () {
    this.searchResultsTooltipTarget = this.$refs.searchResults;
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .search-widget {
    .tabs { display:flex;
      .tab { border-radius:3px 3px 0 0; border-bottom:3px solid #ffffff; position:relative; width:20%;
        >button { align-items:center; display:flex; height:40px; justify-content: center; width:100%; }
        &.selected { font-weight:500;
          &:nth-child(1n) { border-color: $primary-color;}
          &:nth-child(2n) { border-color: #fcede6;}
          &:nth-child(3n) { border-color: $secondary-color;}
          &:nth-child(4n) { border-color: #2e80b0;}
          &:nth-child(5n) { border-color: #000000;}
        }
        &.more {
          &.open { background:#ffffff; border-bottom:3px solid #000; font-weight:500;
            .border-cover { display:block; }
            .more-sources-dropdown { display:block; font-weight:400; }
          }
          &.selected { width:40%; }
        }
        &:hover { font-weight:500;}
      }

      .more-sources-dropdown { background:#ffffff; border:1px solid #d5d8dc; border-radius:3px 0 3px 3px; box-shadow:0 2px 6px rgba(0,0,0,0.1); display:none; padding:15px; position:absolute; right:-1px; top:100%; width:638px; z-index:5;
        input { border:1px solid #d7dbe0; border-radius:3px; font-size:14px; margin:10px 0; padding:8px 12px; width:100%; }
        .sources-container { display:flex; flex-wrap: wrap; flex-direction:column; height:468px;
          button { border-radius:3px; padding:10px; text-align:left; width:33%;
            &:hover { background: #f4f6f8; font-weight:500; }
          }
        }
      }
    }
    .body { background: #f4f6f8; padding:10px;
      .input-wrapper { display:flex;
        input { border-radius:2px 0 0 2px; border:none; flex:1 0 0; padding:10px; }
        button { border-radius:0 2px 2px 0; font-size:14px; font-weight:500; justify-content: center; width:100px;}
      }
    }
  }

  .or-break { font-size:13px; margin: 10px 0; text-transform:uppercase; }
  .or-break:before, .or-break:after { background-color: rgba(0,0,0,0.1); content: ""; display: inline-block; height: 1px; position: relative; vertical-align: middle; width: 15%; }
  .or-break:before { right: 0.5em; margin-left: -50%; }
  .or-break:after { left: 0.5em; margin-right: -50%; }

  .search-results {
    .no-results-found { align-items: center; display:flex; justify-content: center; height:200px; }
    .result {
      >button { padding:0; width:100%; }
    }
  }
</style>