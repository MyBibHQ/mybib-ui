<template>
  <div class="paper">
    <a href="javascript:history.back(1)" class="main-back">
      <i class="material-icons">arrow_back</i>
    </a>
    <router-link :to="{name: 'Project', params:{projectId: $route.params.projectId}}" class="main-close">
      <i class="material-icons">close</i>
    </router-link>

    <ReferenceForm actionWord="New" :referenceMetadata="referenceMetadata"></ReferenceForm>

    <div class="formatted-preview">
      <div>
        <span style="color:#2a3c4e; font-size:12px; font-weight:500; text-transform:uppercase;">Preview: </span><span v-html="formattedPreview"></span>
      </div>
      <mu-circular-progress v-if="formattedPreviewIsLoading" :size="20" color="#2196f3" style="margin-left:10px;"/>
    </div>

    <div class="actions">
      <mu-raised-button @click="saveReference()" :disabled="isSaving" :label="isSaving? 'Saving...' : 'Save'" icon="check" secondary/>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js';
import MessageBus from '@/services/messageBus.js';
import SnackBar from '@/services/snackBar.js';
import ReferenceMetadata from '@/classes/ReferenceMetadata.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';
import PreviewApi from '@/services/previewApi.js';

import ReferenceForm from '@/components/ReferenceForm';

import _ from 'lodash';

export default {
  name: 'NewReference',
  components: {
    ReferenceForm
  },
  data () {
    return {
      referenceMetadata: {},
      urlToImage: '',
      formattedPreview: '',
      formattedPreviewIsLoading: false,
      isSaving: false,
      referenceFormTooltipTarget: null
    };
  },
  computed: {
    source () {
      return Config.sources.find((s) => {
        return s.id === this.$route.params.sourceId;
      });
    },
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    }
  },
  watch: {
    referenceMetadata: {
      handler: _.debounce(async function () {
        this.formattedPreviewIsLoading = true;
        this.formattedPreview = await PreviewApi.generatePreview(this.selectedProject.styleId, this.$route.params.sourceId, this.referenceMetadata);
        this.formattedPreviewIsLoading = false;
      }, 1000),
      deep: true
    }
  },
  methods: {
    async saveReference () {
      this.isSaving = true;
      const selectedProject = this.$store.getters.user.projects.find((p) => { return p.id === parseInt(this.$route.params.projectId) });
      const newReference = await selectedProject.addReference({sourceId: this.$route.params.sourceId, urlToImage: this.urlToImage, metadata: this.referenceMetadata})
      // await selectedProject.loadReferences();
      if (newReference) {
        const referenceStr = this.$t('Reference');
        SnackBar.addSnack({
          message: '👍 ' + referenceStr + ' added!',
          action: 'Copy to clipboard',
          actionColor: '#d6d6d6',
          actionClick: () => {
            copyHtmlToClipboard(newReference.formattedStr);
            setTimeout(() => {
              SnackBar.addSnack({
                message: '📋 ' + referenceStr + ' copied to clipboard.'
              });
            }, 100)
          }
        });
        this.$router.push({ name: 'Project', params: { projectId: selectedProject.id } })
      } else {
        this.isSaving = false;
      }
    }
  },
  beforeMount () {
    // if the source type doesn't exist, redirect
    if (!this.source) {
      this.$router.push({name: 'NewReferenceSearch'});
    }

    this.referenceMetadata = Object.assign(new ReferenceMetadata(), MessageBus.newReference.metadata);
    this.referenceMetadata.addNamePlaceholders();
    this.urlToImage = MessageBus.newReference.urlToImage;
  }
}
</script>

<style lang="scss">
  .formatted-preview { align-items:center; background:#fff; bottom:77px; border-top:1px dotted #e9eaed; color:#747f8b; display:flex; justify-content:center; left:0; padding:6px 20px; position:sticky; right:0; text-align:center; }
</style>