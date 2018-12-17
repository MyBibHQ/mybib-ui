<template>
  <div class="project-toolbar">
    <div class="left">
      <div class="select-all-references-checkbox" :class="{ 'is-checked': selectAllReferencesIsChecked}">
        <mu-checkbox v-model="selectAllReferencesIsChecked"/>
      </div>
      <div class="search-wrapper">
        <i class="material-icons" :class="{'active': toolbarOptions.searchTerm && toolbarOptions.searchTerm.length > 0}">search</i>
        <input v-model="toolbarOptions.searchTerm" type="text" class="search-box" :placeholder="'Search my ' + $t('references') + '...'" />
      </div>
      <button @click="toggleFilterReferencesMenu" ref="filterReferencesMenuBtn" :class="{'filter-references-menu-btn':true, 'active': sourcesAvailableForFiltering.length != toolbarOptions.sources.length}">
        <span>
          Filter <i class="material-icons" style="color:rgba(0,0,0,0.12)">arrow_drop_down</i>
        </span>
      </button>
      <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'left'}" :targetOrigin="{vertical:'top', horizontal:'left'}" :open="showFilterReferencesMenu" :trigger="filterReferencesMenuTrigger" @close="handleFilterReferencesMenuClose">
        <div class="filter-references-menu">
          <div v-for="(source, index) in sourcesAvailableForFiltering" :key="index">
            <mu-checkbox name="group" :nativeValue="source.id" v-model="toolbarOptions.sources" :label="source.name + ' ('+ project.references.filter(r => r.sourceId === source.id).length +')'" />
          </div>
        </div>
      </mu-popover>
      <button v-if="filteredReferences.length !== selectedProject.references.length" @click="resetFilter" class="showing-count-btn">
        <span>
          Showing {{filteredReferences.length}} of {{selectedProject.references.length}} {{$t('references')}} (show all)
        </span>
      </button>
      <div class="reference-actions" :class="{'reference-actions--show': project.references.some((r) => { return r.isSelected })}">
        <mu-icon-button @click="deleteSelectedReferences" v-tooltip.bottom="`Delete selected ${$t('references')}`" icon="delete" iconClass="red"/>
      </div>
    </div>
    <div class="right">
      <div class="display-mode-wrapper">
        <i class="material-icons">format_align_left</i>
        <mu-dropDown-menu :value="selectedProject.referenceDisplayMode" @change="handleDisplayModeDropDownChange" labelClass="display-mode-dropdown-label" iconClass="display-mode-dropdown-caret" underlineClass="display-mode-dropdown-line" :autoWidth="true">
          <mu-menu-item value="formatted" title="Show: formatted"/>
          <mu-menu-item value="details" title="Show: details"/>
        </mu-dropDown-menu>
      </div>
    </div>
  </div>
</template>

<script>
import Config from '@/config.js';
import SnackBar from '@/services/snackBar.js';

export default {
  name: 'ProjectViewToolbar',
  props: ['project', 'toolbarOptions'],
  data () {
    return {
      config: Config,
      showFilterReferencesMenu: false,
      filterReferencesMenuTrigger: null,
      selectAllReferencesIsChecked: false
    }
  },
  computed: {
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    },
    sourcesAvailableForFiltering () {
      return this.config.sources.filter(s => this.project.references.some(function (r) { return r.sourceId === s.id; }));
    },
    filteredReferences () {
      return this.selectedProject.references.filter(r => (Object.values(r.metadata).join(' ') + ' ' + r.formattedStr).toLowerCase().indexOf(this.toolbarOptions.searchTerm.toLowerCase()) !== -1 && this.toolbarOptions.sources.indexOf(r.sourceId) !== -1);
    },
    selectedReferences () {
      return this.selectedProject.references.filter(r => r.isSelected);
    }
  },
  watch: {
    selectAllReferencesIsChecked (newVal) {
      for (let reference of this.project.references) {
        reference.isSelected = newVal;
      }
    }
  },
  methods: {
    toggleFilterReferencesMenu () {
      this.showFilterReferencesMenu = !this.showFilterReferencesMenu;
    },
    handleFilterReferencesMenuClose () {
      this.showFilterReferencesMenu = false;
    },
    resetFilter () {
      this.toolbarOptions.searchTerm = '';
      this.toolbarOptions.sources = this.sourcesAvailableForFiltering.map(s => s.id);
    },
    handleDisplayModeDropDownChange (val) {
      this.selectedProject.referenceDisplayMode = val;
    },
    deleteSelectedReferences () {
      const selectedReferencesCopy = this.selectedReferences;

      this.selectedProject.deleteReferences(selectedReferencesCopy);

      const referencesStr = this.$t('References');
      SnackBar.addSnack({
        message: `😲 ${selectedReferencesCopy.length} ${referencesStr} deleted.`,
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.selectedProject.restoreReferences(selectedReferencesCopy);
        }
      });
    }
  },
  mounted () {
    this.filterReferencesMenuTrigger = this.$refs.filterReferencesMenuBtn;
    this.resetFilter();
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .project-toolbar { align-items:center; display:flex; border-bottom:1px dotted #e9eaed; height:50px; justify-content: space-between; left:0; margin:0 20px; position:absolute; right:0; top:94px;
    .left { align-items:center; display:flex;
      .select-all-references-checkbox { align-items:center; display:flex; margin-right:14px; opacity:0.3;
        &.is-checked { opacity:1; }
      }
      .search-wrapper { align-items:center; border-right:1px dotted #e9eaed; display:flex; margin-right:10px; position:relative;
        i { left:4px; position:absolute;
          &.active { color: $secondary-color; }
        }
        .search-box { font-size:14px; padding:4px 6px 4px 32px; transition:width 0.3s ease-in-out; width:200px;
          &:focus { width:250px; }
        }
      }
      .filter-references-menu-btn { border-right:1px dotted #e9eaed; font-size:13px; font-weight:500; margin-right:10px; text-transform:uppercase;
        &.active { color: $secondary-color; }
      }
      .reference-actions { left:10px; opacity:0; position:relative; transition: all 0.2s ease-in-out; visibility: hidden;
        &.reference-actions--show { left:0; opacity:1; visibility:visible; }
      }
    }
    .right { align-items:center; display:flex;
      .display-mode-wrapper { align-items:center; display:flex;
        .mu-dropDown-menu { height:auto !important; }
        .display-mode-dropdown-label { font-size:13px; font-weight:500; padding:0 26px 0 10px; text-transform:uppercase; }
        .display-mode-dropdown-caret { right:0; }
        .display-mode-dropdown-line { display:none; }
      }
    }
    .showing-count-btn { font-size:13px; font-weight:500; text-transform:uppercase; }
  }
  .filter-references-menu { padding:12px 14px 6px; }
</style>