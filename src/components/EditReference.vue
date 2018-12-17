<template>
  <div class="paper">
    <a href="javascript:history.back(1)" class="main-back">
      <i class="material-icons">arrow_back</i>
    </a>
    <router-link :to="{name: 'Project', params:{projectId: $route.params.projectId}}" class="main-close">
      <i class="material-icons">close</i>
    </router-link>

    <ReferenceForm v-if="reference" actionWord="Edit" :referenceMetadata="reference.metadata"></ReferenceForm>

    <div class="formatted-preview">
      <div>
        <span style="color:#2a3c4e; font-size:12px; font-weight:500; text-transform:uppercase;">Preview: </span><span v-html="formattedPreview"></span>
      </div>
      <mu-circular-progress v-if="formattedPreviewIsLoading" :size="20" color="#2196f3" style="margin-left:10px;"/>
    </div>

    <div class="actions">
      <mu-raised-button @click="saveReference()" :disabled="isSaving" :label="isSaving ? 'Updating...' : 'Update'" icon="check" secondary />
    </div>
  </div>
</template>

<script>
import _ from 'lodash';

import Config from '@/config.js';
import SnackBar from '@/services/snackBar.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';
import PreviewApi from '@/services/previewApi.js';

import ReferenceForm from '@/components/ReferenceForm';

export default {
  name: 'EditReference',
  components: {
    ReferenceForm
  },
  data () {
    return {
      reference: {},
      formattedPreview: '',
      formattedPreviewIsLoading: false,
      isSaving: false
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
    'reference.metadata': {
      handler: _.debounce(async function () {
        this.formattedPreviewIsLoading = true;
        this.formattedPreview = await PreviewApi.generatePreview(this.selectedProject.styleId, this.$route.params.sourceId, this.reference.metadata);
        this.formattedPreviewIsLoading = false;
      }, 1000),
      deep: true,
      immediate: true
    }
  },
  methods: {
    async saveReference () {
      this.isSaving = true;
      this.reference.sourceId = this.source.id;
      const referenceToUpdate = Object.assign(this.selectedProject.references.find((r) => { return r.id === parseInt(this.$route.params.referenceId) }), this.reference);
      const updatedReference = await this.selectedProject.updateReference(referenceToUpdate);
      if (updatedReference) {
        const referenceStr = this.$t('Reference');
        SnackBar.addSnack({
          message: '👍 ' + referenceStr + ' updated!',
          action: 'Copy to clipboard',
          actionColor: '#d6d6d6',
          actionClick: () => {
            copyHtmlToClipboard(updatedReference.formattedStr);
            setTimeout(() => {
              SnackBar.addSnack({
                message: '📋 ' + referenceStr + ' copied to clipboard.'
              });
            }, 100)
          }
        });
        this.$router.push({ name: 'Project', params: { projectId: this.$route.params.projectId } })
      } else {
        this.isSaving = false;
      }
    }
  },
  created () {
    const reference = this.selectedProject.references.find((r) => { return r.id === parseInt(this.$route.params.referenceId) })
    // if no reference, redirect
    if (reference) {
      this.reference = _.cloneDeep(reference);
      this.reference.metadata.addNamePlaceholders();
    } else {
      this.$router.push({ name: 'Project', params: { projectId: this.$route.params.projectId } });
    }
  }
}
</script>

<style lang="scss">
  .formatted-preview { align-items:center; background:#fff; bottom:77px; border-top:1px dotted #e9eaed; color:#747f8b; display:flex; justify-content:center; left:0; padding:6px 20px; position:sticky; right:0; text-align:center }
</style>