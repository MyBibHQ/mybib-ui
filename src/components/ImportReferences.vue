<template>
  <div class="paper">
    <div>
      <router-link :to="$route.params.projectId ? {name: 'Project', params:{projectId: $route.params.projectId}} : {name: 'Root'}" class="main-back">
        <i class="material-icons">arrow_back</i>
      </router-link>
      <router-link :to="$route.params.projectId ? {name: 'Project', params:{projectId: $route.params.projectId}} : {name: 'Root'}" class="main-close">
        <i class="material-icons">close</i>
      </router-link>
    </div>

    <h1>Add {{$t('References')}}</h1>

    <Spinner v-if="isLoading"/>

    <div v-if="!isLoading">
      <div class="center-column">
        <div class="import-results">
          <div v-if="!isLoading && references.length === 0" class="no-results-found">
            <p>There was an error while trying to add your {{$t('references')}}.</p>
            <p>Please try again, or contact support@mybib.com for more help.</p>
          </div>
          <ul ref="importResults">
            <li v-for="(reference, index) in references" :key="index">
              <ListReferenceDetailed :reference="reference" />
            </li>
          </ul>
        </div>

        <TooltipLg v-if="references.length > 0" tooltipId="importResults" category="intro" placement="left start" :target="importResultsTooltipTarget">
          <p>You're about the add the following {{$t('references')}} to your project. Click the Add button at the bottom of the list to continue.</p>
        </TooltipLg>
      </div>

      <div class="actions">
        <div v-if="showProjectsDropdown" style="align-items:center; display:flex;">
          <label>Save to project:</label>
          <mu-select-field v-model="selectedProject" :maxHeight="200">
            <mu-menu-item v-for="project in user.projects" :key="project.id" :value="project" :title="project.title" />
          </mu-select-field>
        </div>
        <mu-raised-button @click="doImport()" :disabled="references.length === 0 || isSaving" :label="isSaving ? 'Saving...' : `Add ${references.length} ${references.length == 1 ? $t('reference') : $t('references')}`" icon="check" secondary />
      </div>
    </div>
  </div>
</template>

<script>
import SnackBar from '@/services/snackBar.js';
import referenceImporter from '@/services/referenceImporter.js';

import ListReferenceDetailed from '@/components/ListReferenceDetailed';
import TooltipLg from '@/components/TooltipLg';
import Spinner from '@/components/Spinner';

import Cookies from 'js-cookie';
import Config from '@/config.js';

export default {
  name: 'ImportReferences',
  components: {
    ListReferenceDetailed,
    TooltipLg,
    Spinner
  },
  data () {
    return {
      isLoading: true,
      isSaving: false,
      references: [],
      showProjectsDropdown: false,
      selectedProject: {},
      importResultsTooltipTarget: null
    }
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    async doImport () {
      this.isSaving = true;
      const newReferences = await this.selectedProject.addReferences(this.references);
      this.isSaving = false;

      if (newReferences) {
        const referencesStr = this.$t('references');
        const referenceStr = this.$t('reference');
        SnackBar.addSnack({
          message: `👍 Import complete. ${newReferences.length} ${newReferences.length > 1 ? referencesStr : referenceStr} added!`
        });
        this.$router.push({ name: 'Project', params: { projectId: this.selectedProject.id } })
      }
    }
  },
  async created () {
    // load the imported references
    this.references = await referenceImporter.retrieve(this.$route.params.importToken);

    // check for if we need to show the project dropdown
    // if the project route param is selected, use that
    if (this.$route.params.projectId) {
      this.selectedProject = this.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    } else if (this.user.projects.length === 1) {
      // if the user has one project, use that
      this.selectedProject = this.user.projects[0];
    } else {
      // show the dropdown
      this.showProjectsDropdown = true;
      if (Cookies.get(Config.cookiePrefixString + '-lastSelectedProject')) {
        // if the user has a lastSelectedProject cookie
        this.selectedProject = this.user.projects.find((p) => {
          return p.id === parseInt(Cookies.get(Config.cookiePrefixString + '-lastSelectedProject'));
        });
      } else {
        this.selectedProject = this.user.projects[0];
      }
    }

    this.isLoading = false;
  },
  updated () {
    this.$nextTick(() => {
      this.importResultsTooltipTarget = this.$refs.importResults;
    })
  }
}
</script>

<style lang="scss" scoped>
  .import-results {
    .no-results-found { align-items: center; display:flex; flex-direction:column; justify-content: center; height:200px; }
  }

  .actions { align-items:center; border-top:1px dotted #e9eaed; display:flex; justify-content:center; padding:20px;
    label { font-size:13px; font-weight:500; text-transform:uppercase; }
    .mu-text-field { min-height:auto; margin-bottom:0; margin-left:16px; margin-right:16px; position:relative; top:4px; width:200px;
    }
  }
</style>