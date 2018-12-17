<template>
  <mu-dialog :open="open" title="Change style" @close="$emit('close')" :scrollable="true" :fullscreen="true">
    <div class="center-column">
      <div class="current-style">
        <div>Current style:</div>
        <div style="font-weight:500;">{{selectedProject.styleName}}</div>
      </div>

      <div ref="styleSearchBox" class="search-box">
        <input v-model="searchTerm" @keyup="doSearch()" type="text" :placeholder="'Search for ' + $t('reference') + ' styles. Tip: try searching for your school!'" />
        <i class="material-icons">search</i>
      </div>

    </div>
    <div v-if="isLoading"  style="height:140px; position:relative;">
      <Spinner/>
    </div>
    <div class="search-results">
      <ul>
        <li v-for="(searchResult, index) in searchResults" :key="index">
          <button @click="selectStyle(searchResult.id)" :disabled="isSaving">
            {{ searchResult.name}}
          </button>
          <i class="material-icons style-preview-icon" @mouseover="showStylePreview(searchResult.id, $event)" @mouseout="previewIsOpen = false">help</i>
        </li>
      </ul>
      <StylePreview :open="previewIsOpen" :trigger="previewTrigger" :styleId="previewStyleId" />
    </div>
    <div class="powered-by-csl">
      Powered by <a href="http://citationstyles.org/" target="_new">CSL</a> (<a href="https://github.com/Juris-M/citeproc-js" target="_new">citeproc-js</a>)
    </div>
    <mu-flat-button slot="actions" @click="$emit('close')" label="Cancel"/>
  </mu-dialog>
</template>

<script>
import _ from 'lodash';

import TooltipLg from '@/components/TooltipLg';
import Spinner from '@/components/Spinner';
import StylePreview from '@/components/StylePreview';

import StylesApi from '@/services/stylesApi.js';

export default {
  name: 'StylesDialog',
  props: ['open'],
  components: {
    TooltipLg,
    Spinner,
    StylePreview
  },
  data () {
    return {
      searchTerm: '',
      searchResults: [],
      isLoading: false,
      isSaving: false,
      previewIsOpen: false,
      previewTrigger: null,
      previewStyleId: null
    }
  },
  watch: {
    open (newVal, oldVal) {
      // on close clear the search
      if (!newVal) {
        this.searchTerm = '';
        this.doSearch();
      }
    }
  },
  computed: {
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      })
    }
  },
  methods: {
    doSearch: _.debounce(async function () {
      this.isLoading = true;
      this.searchResults = await StylesApi.search(this.searchTerm);
      this.isLoading = false;
    }, 200),
    async selectStyle (styleId) {
      this.isSaving = true;
      await this.selectedProject.changeStyle(styleId);
      this.isSaving = false;
      this.$emit('close');
    },
    showStylePreview (styleId, event) {
      this.previewIsOpen = true;
      this.previewTrigger = event.target;
      this.previewStyleId = styleId;
    }
  },
  mounted () {
    this.doSearch();
  }
}
</script>

<style lang="scss" scoped>
  @import '../variables.scss';

  .center-column { margin-bottom:20px; }
  .current-style { margin:20px 0 20px; text-align:center; }
  .search-box { position:relative;
    input[type=text] { border:1px solid #d7dbe0; font-size:14px; padding:10px 12px 10px 50px; width:100%;
      &:focus { border-color:$secondary-color; }
    }
    i { color:#7e8994; left:16px; position:absolute; top:10px; }
  }
  .search-results { border-top:1px dotted #e9eaed; font-size:15px;
    li { align-items:center; display:flex; flex-grow:1; position:relative; }
    button { color:#7e8994; border-radius:50px; padding: 12px 20px; text-align:left; width:100%;
      &:hover { background:#f4f6f8; }
    }
    .style-preview-icon { cursor:help; opacity:0.3; padding:5px; }
  }
  .powered-by-csl { background:#ffffff; bottom:17px; font-size:13px; left:17px; opacity:0.6; position:absolute; right:0;}
</style>