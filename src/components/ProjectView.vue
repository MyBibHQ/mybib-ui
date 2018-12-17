<template>
  <div v-if="selectedProject" class="paper">
    <div id="title-bar">
      <div class="title">
        <input ref="titleInput" type="text" :value="selectedProject.title" @keyup.enter="$event.target.blur()" @blur="saveTitle()" />
      </div>
      <div class="right-items">
        <div>
          <mu-raised-button :to="{name: 'NewReferenceSearch', params: {projectId: $route.params.projectId}}" ref="addReferenceBtn" :label="'Add ' + $t('Reference')" icon="add" primary/>
          <TooltipLg v-if="selectedProject.references.length < 1" tooltipId="addReferenceBtn" category="intro" placement="bottom" :target="addReferenceTooltipTarget" primary>
            <p><strong>👋 Welcome to MyBib!</strong></p>
            <p>Let's get started. Click here to generate your first {{$t('reference')}}. You can {{$t('referenceVerb')}} websites, books, journals, and over 30 other sources.</p>
          </TooltipLg>
        </div>
        <!--<li>
          <a class="btn btn-flat blue">
            <i class="material-icons">person_add</i> Group Work
          </a>
        </li>-->
        <div>
          <mu-flat-button @click="showStylesDialog = true" ref="stylesBtn" :label="selectedProject.styleName.length > 18 ? selectedProject.styleName.substring(0, 18) + '…' : selectedProject.styleName + ' Style'" icon="spellcheck" class="outline"/>
          <TooltipLg v-if="selectedProject.references.length > 0" tooltipId="stylesBtn" category="intro" placement="bottom" :target="stylesTooltipTarget">
            <p>✒️ Change the {{$t('reference')}} style for your project here. We've got them all, including APA, Harvard, and MLA 7 &amp; 8.</p>
          </TooltipLg>
          
          <StylesDialog @close="showStylesDialog = false" :open="showStylesDialog"/>
            
        </div>
        <div>
          <mu-flat-button @click="showImportSheet = true" label="Import" icon="file_upload" class="outline"/>
        </div>
        <div>
          <mu-raised-button @click="toggleDownloadSheet" label="Download Bibliography" ref="downloadBtn" icon="file_download" secondary/>
          <TooltipLg v-if="selectedProject.references.length > 0" tooltipId="downloadBtn" category="intro" placement="bottom" :target="downloadTooltipTarget">
            <p>🖨️ When you've finished adding all the {{$t('references')}} to your project you can download your fully formatted bibliography and attach it to your paper.</p>
          </TooltipLg>
        </div>
      </div>
    </div>

    <ProjectViewToolbar v-if="selectedProject.references.length > 0" :project="selectedProject" :toolbarOptions="toolbarOptions" />

    <div v-if="selectedProject.isLoading" style="position:relative; top:94px; width:100%;">
      <Spinner />
    </div>
    <div v-else-if="selectedProject.references.length === 0" style="align-items:center; bottom:20%; display:flex; justify-content:center; left:0; position:absolute; right:0; top:94px;">
      <div style="margin-right:8px;">There are no {{$t('references')}} in this project yet.</div>
      <mu-raised-button :to="{name: 'NewReferenceSearch', params: {projectId: $route.params.projectId}}" :label="'Add ' + $t('Reference')" icon="add" style="text-transform:none;" primary/>
      <div style="margin-left:8px;">?</div>
    </div>
    <transition-group v-else id="references" name="fade-forward" tag="ul">
      <ProjectViewReference v-for="reference in filteredReferences" :key="reference.id" :ref="'reference_' + reference.id" :reference="reference">      
      </ProjectViewReference>
    </transition-group>

    <TooltipLg v-if="selectedProject.references.length === 1" tooltipId="referenceList" category="intro" placement="bottom start" :target="firstReferenceTooltipTarget" primary wide>
      <p><span style="font-weight:500;">🎉 Awesome!</span> You added your first {{$t('reference')}}. Every {{$t('reference')}} you add will be saved in this list.</p>
      <p>📋 You can copy the {{$t('reference')}} to your clipboard by right clicking and selecting copy, or edit it by clicking it normally.</p>
      <p>Next, add the rest of your {{$t('references')}}, and then click the blue Download button in the top-right corner to download your fully formatted bibliography.</p>
      <p style="font-size:12px; opacity:0.6;">Note: Turn these tips off (or back on) by clicking the <i class="material-icons" style="position: relative; bottom: -7px; margin: -10px 0;">help_outline</i> in the top-right corner.</p>
    </TooltipLg>

    <mu-bottom-sheet :open="showImportSheet" @close="showImportSheet = false">
      <div class="options-sheet">
        <button @click="showImportSheet = false" class="main-close">
          <i class="material-icons">close</i>
        </button>

        <div class="sheet-title">Import</div>
        <div class="options">
          <div>
            <ImportButton @onImportComplete="importComplete" acceptFileType=".ris" importType="ris">
              <i class="material-icons">file_upload</i>
            </ImportButton>
            <div>.RIS file</div>
          </div>
          <div>
            <ImportButton @onImportComplete="importComplete" importType="bibtex">
              <img src="~../../static/images/bibtex_logo.svg" style="width:56px;" />
            </ImportButton>
            <div>Bibtex</div>
          </div>
          <div>
            <ImportButton @onImportComplete="importComplete" acceptFileType=".ref" importType="json">
              <i class="material-icons">save</i>
            </ImportButton>
            <div>Load backup</div>
          </div>
        </div>
      </div>
    </mu-bottom-sheet>

    <DownloadOptionsBottomSheet :open="showDownloadSheet" @close="showDownloadSheet = false" :selectedProject="selectedProject" />

  </div>
</template>

<script>
import StylesDialog from '@/components/StylesDialog';
import ProjectViewToolbar from '@/components/ProjectViewToolbar';
import ProjectViewReference from '@/components/ProjectViewReference';
import DownloadOptionsBottomSheet from '@/components/DownloadOptionsBottomSheet';
import Spinner from '@/components/Spinner';
import ImportButton from '@/components/ImportButton';
import TooltipLg from '@/components/TooltipLg';

import _ from 'lodash';

export default {
  name: 'ProjectView',
  components: {
    StylesDialog,
    ProjectViewToolbar,
    ProjectViewReference,
    DownloadOptionsBottomSheet,
    Spinner,
    ImportButton,
    TooltipLg
  },
  data () {
    return {
      toolbarOptions: { searchTerm: '', sources: [] },
      showStylesDialog: false,
      showImportSheet: false,
      showDownloadSheet: false,
      addReferenceTooltipTarget: null,
      firstReferenceTooltipTarget: null,
      stylesTooltipTarget: null,
      downloadTooltipTarget: null
    }
  },
  computed: {
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    },
    filteredReferences () {
      const filteredReferences = this.selectedProject.references.filter(r => (Object.values(r.metadata).join(' ') + ' ' + r.formattedStr).toLowerCase().indexOf(this.toolbarOptions.searchTerm.toLowerCase()) !== -1 && this.toolbarOptions.sources.indexOf(r.sourceId) !== -1);
      // then sort if we're showing details
      return this.selectedProject.referenceDisplayMode === 'details' ? _.sortBy(filteredReferences, 'metadata.title') : filteredReferences;
    }
  },
  methods: {
    saveTitle () {
      const oldProjectTitle = this.selectedProject.title;
      this.selectedProject.title = this.$refs.titleInput.value;
      const updatedProject = this.selectedProject.save();

      if (!updatedProject) {
        // it failed. undo.
        this.selectedProject.title = oldProjectTitle;
      }
    },
    importComplete (importToken) {
      this.$router.push({ name: 'ImportReferences', params: { projectId: this.$route.params.projectId, importToken: importToken } });
    },
    toggleDownloadSheet () {
      if (this.selectedProject.references.length === 0) {
        alert(`This project is empty. You need to add some ${this.$t('references')} before you can download the bibliography.`)
      } else {
        this.showDownloadSheet = true;
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      // scroll to a new or edited reference
      const highlightedReference = this.selectedProject && this.selectedProject.references.find((r) => {
        return r.isHighlighted;
      });
      if (highlightedReference) {
        const highlightedReferenceEl = this.$refs['reference_' + highlightedReference.id][0].$el;
        this.$scrollTo(highlightedReferenceEl, 1, { container: highlightedReferenceEl.parentNode, offset: -200 });
      }
    });

    // assign the tooltip targets
    this.addReferenceTooltipTarget = this.$refs.addReferenceBtn;
    this.stylesTooltipTarget = this.$refs.stylesBtn;
    this.downloadTooltipTarget = this.$refs.downloadBtn;

    this.$nextTick(() => {
      if (this.selectedProject.references.length > 0) {
        const firstReferenceRef = this.$refs['reference_' + this.selectedProject.references[0].id];
        if (firstReferenceRef) {
          this.firstReferenceTooltipTarget = firstReferenceRef[0];
        }
      }
    })

    // change title
    document.title = this.selectedProject ? this.selectedProject.title + ' - MyBib' : 'MyBib';
  }
}
</script>

<style lang="scss" scoped>
  #title-bar { align-items:center; border-bottom:1px dotted #e9eaed; display:flex; height:94px; justify-content: space-between; margin:0 20px;
    .title { align-items:center; color:#2c3e50; display:flex; flex:1 0 0; font-size:22px; margin-right:10px;
      input { background:transparent; border:1px solid transparent; border-radius:3px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap; width:100%;
        &:hover { border:1px solid #d7dbe0; }
      }
    }
    .right-items { align-items:center; display:flex;
      > div { align-items:center; display:flex; margin-right:10px;
        &:last-child { margin-right:0;}
      }
    }
  }
  #references { bottom:0; left:0; overflow-x:hidden; overflow-y:auto; position:absolute; right:0; top:144px; }

  .truncate { max-width: 180px; overflow: hidden; white-space: nowrap; }

  .options-sheet { padding:20px;
    .sheet-title { font-size:22px; font-weight:400; text-align:center; margin-bottom:40px; }
    .options { align-items:center; display:flex; flex-wrap:wrap; margin:auto; width:440px;
      > div { align-items:center; display: flex; flex-direction:column; justify-content:center; margin:0 10px 20px; }
      .btn { align-items:center; display:flex; filter:grayscale(100%); height:90px; justify-content:center; margin-bottom: 10px; width:90px;
        i { font-size:40px; margin:0; }
        &:hover { filter:none;}
      }
    }
  }

  .main-close { position:absolute; right:20px; top:20px; }
</style>