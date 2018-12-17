<template>
  <li class="row" :class="{ highlighted: reference.isHighlighted, selected: reference.isSelected }" @contextmenu.prevent="toggleContextMenu" draggable="true" @dragstart="onDragStart" @dragend="onDragEnd">
    <router-link :to="{ name: 'EditReference', params: { projectId: reference.projectId, referenceId: reference.id, sourceId: reference.sourceId } }" tag="div" class="row-body" draggable="false">
      <mu-checkbox v-model="reference.isSelected" />
      <img v-if="reference.urlToImage" :src="reference.urlToImage" class="avatar square" v-tooltip.left="{content:source && source.name, boundariesElement:'viewport'}" referrerpolicy="no-referrer" />
      <div v-else class="avatar" v-tooltip.left="{content:source && source.name, boundariesElement:'viewport'}">
        <i class="material-icons">{{sourceIdToMaterialIconDictionary[reference.sourceId] || sourceIdToMaterialIconDictionaryDefault}}</i>
      </div>
      <div class="reference">
        <div v-if="selectedProject.referenceDisplayMode === 'formatted'" v-html="reference.formattedStr" class="formatted"></div>
        <div v-if="selectedProject.referenceDisplayMode === 'details' && !reference.metadata.rawStr" class="details">
          <span v-if="reference.metadata.title" class="detail" style="font-weight:500;"><span>{{reference.metadata.title}}</span></span>
          <span class="detail">By <span>{{reference.authorStr}}</span></span>
          <span v-if="reference.metadata.issued && reference.metadata.issued.year" class="detail">Year: <span>{{reference.metadata.issued.year}}</span></span>
          <span v-if="reference.metadata.containerTitle" class="detail">Container: <span>{{reference.metadata.containerTitle}}</span></span>
          <span v-if="reference.metadata.publisher" class="detail">Publisher: <span>{{reference.metadata.publisher}}</span></span>
          <span v-if="reference.metadata.publisherPlace" class="detail">Publisher Place: <span>{{reference.metadata.publisherPlace}}</span></span>
          <span v-if="reference.metadata.edition" class="detail">Edition: <span>{{reference.metadata.edition}}</span></span>
          <span v-if="reference.metadata.volume" class="detail">Volume: <span>{{reference.metadata.volume}}</span></span>
          <span v-if="reference.metadata.issue" class="detail">Issue: <span>{{reference.metadata.issue}}</span></span>
          <span v-if="reference.metadata.page" class="detail">Page: <span>{{reference.metadata.page}}</span></span>
          <span v-if="reference.metadata.doi" class="detail">DOI: <span>{{reference.metadata.doi}}</span></span>
          <span v-if="reference.metadata.isbn" class="detail">ISBN: <span>{{reference.metadata.isbn}}</span></span>
          <span v-if="reference.metadata.url" class="detail">URL: <span style="word-break:break-all;">{{reference.metadata.url}}</span></span>
        </div>
        <div v-if="selectedProject.referenceDisplayMode === 'details' && reference.metadata.rawStr" class="details">
          <span class="detail">Written/pasted {{$t('reference')}}: <span v-html="reference.metadata.rawStr" style="word-break:break-all;"></span></span>
        </div>
        <div class="subline">
          <div v-if="reference.citations">{{citationLabel}}: <span v-for="(citation, index) in reference.citations" :key="index" v-html="citation"></span></div>
        </div>
      </div>    
    </router-link>
    <div class="options">
      <a v-if="false/*reference.sourceId === 'article_journal' && reference.urlToResource*/" @click.stop="/* this is to stop the router picking up the click */" :href="reference.urlToResource" v-tooltip.bottom="'Go to article PDF'" target="_blank" class="btn orange">
        <i class="far fa-file-pdf" style="font-size:20px; width:24px;"></i>
      </a>
      <a v-if="reference.sourceId === 'video' && reference.metadata.url" @click.stop="/* this is to stop the router picking up the click */" :href="reference.metadata.url" v-tooltip.bottom="'Go to video'" target="_blank" class="btn orange">
        <i class="material-icons">play_circle_outline</i>
      </a>
      <a v-if="reference.sourceId !== 'video' && reference.metadata.url && reference.metadata.url.startsWith('http')" @click.stop="/* this is to stop the router picking up the click */" :href="reference.metadata.url" v-tooltip.bottom="'Go to website'" target="_blank" class="btn orange">
        <i class="material-icons">language</i>
      </a>
      <router-link :to="{ name:'ReferenceNotes', params: {projectId: reference.projectId, referenceId: reference.id }}" v-tooltip.bottom="reference.notes.length > 0 ? 'Notes (' + reference.notes.length + ')' : 'Notes'" class="btn" :class="{ orange: reference.notes.length > 0 }">
        <i class="material-icons">format_quote</i> <span v-if="reference.notes.length > 0" style="font-size:13px;">{{reference.notes.length}}</span>
      </router-link>
      <button v-tooltip.bottom="'Show options'" ref="contextMenuBtn" @click="toggleContextMenu()">
        <i class="material-icons">more_vert</i>
      </button>
      <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'right'}" :targetOrigin="contextMenuTargetOrigin" :open="contextMenuIsOpen" :trigger="contextMenuTrigger" @close="handleContextMenuClose">
        <mu-menu desktop>
          <mu-menu-item title="Copy bibliography entry to clipboard" leftIcon="content_paste" @click="copyReferenceToClipboard()" />
          <mu-menu-item :title="`Copy ${citationLabel.toLowerCase()} to clipboard`" leftIcon="content_paste" @click="copyInTextCitationToClipboard()" />
          <mu-divider />
          <mu-menu-item title="Edit" leftIcon="edit" :to="{ name: 'EditReference', params: { projectId: reference.projectId, referenceId: reference.id, sourceId: reference.sourceId } }" />
          <mu-menu-item title="Move to project..." leftIcon="content_cut" @click="openMoveReferenceDialog()" />
          <mu-menu-item title="Copy to project..." leftIcon="content_copy" @click="openCopyReferenceDialog()" />
          <mu-divider />
          <mu-menu-item title="Delete" leftIcon="delete" @click="deleteReference()" titleClass="red" leftIconClass="red" />
        </mu-menu>
      </mu-popover>

      <mu-dialog title="Move reference" :open="moveReferenceDialogIsOpen" @close="handleMoveReferenceDialogClose">
        <ListReferenceDetailed :reference="reference" />
        <div class="move-reference-select-field">
          <label style="font-size: 13px; font-weight: 500; text-transform: uppercase;">Move to project:</label>
          <mu-select-field v-model="moveReferenceDropDownSelectedProject" :maxHeight="200">
            <mu-menu-item v-for="project in projects" :key="project.id" :value="project" :title="project.title" />
          </mu-select-field>
        </div>
        <mu-flat-button slot="actions" @click="handleMoveReferenceDialogClose" label="Cancel"/>
        <mu-flat-button slot="actions" @click="moveReference" primary :label="moveReferenceDialogIsSaving ? 'Moving...' : 'Move'" :disabled="moveReferenceDialogIsSaving"/>
      </mu-dialog>

      <mu-dialog title="Copy reference" :open="copyReferenceDialogIsOpen" @close="handleCopyReferenceDialogClose">
        <ListReferenceDetailed :reference="reference" />
        <div class="move-reference-select-field">
          <label style="font-size: 13px; font-weight: 500; text-transform: uppercase;">Copy to project:</label>
          <mu-select-field v-model="copyReferenceDropDownSelectedProject" :maxHeight="200">
            <mu-menu-item v-for="project in projects" :key="project.id" :value="project" :title="project.title" />
          </mu-select-field>
        </div>
        <mu-flat-button slot="actions" @click="handleCopyReferenceDialogClose" label="Cancel"/>
        <mu-flat-button slot="actions" @click="copyReference" primary :label="copyReferenceDialogIsSaving ? 'Copying...' : 'Copy'" :disabled="copyReferenceDialogIsSaving"/>
      </mu-dialog>
    </div>
  </li>
</template>

<script>
import bowser from 'bowser';

import Config from '@/config.js';
import SnackBar from '@/services/snackBar.js';

import {sourceIdToMaterialIconDictionary, sourceIdToMaterialIconDictionaryDefault} from '@/utils/sourceIdToMaterialIconDictionary.js';
import copyHtmlToClipboard from '@/utils/copyHtmlToClipboard.js';
import createEl from '@/utils/fakeElCreator.js';

import ListReferenceDetailed from '@/components/ListReferenceDetailed';

let draggingEl;

export default {
  name: 'ProjectViewReference',
  props: ['reference'],
  components: {
    ListReferenceDetailed
  },
  data () {
    return {
      contextMenuIsOpen: false,
      contextMenuTrigger: null,
      contextMenuTargetOrigin: {},
      moveReferenceDialogIsOpen: false,
      moveReferenceDropDownSelectedProject: null,
      moveReferenceDialogIsSaving: false,
      copyReferenceDialogIsOpen: false,
      copyReferenceDropDownSelectedProject: null,
      copyReferenceDialogIsSaving: false,
      sourceIdToMaterialIconDictionary: sourceIdToMaterialIconDictionary,
      sourceIdToMaterialIconDictionaryDefault: sourceIdToMaterialIconDictionaryDefault
    };
  },
  computed: {
    source () {
      return Config.sources.find((s) => {
        return s.id === this.reference.sourceId;
      });
    },
    hasPages () {
      return this.source.fields.find((f) => {
        return f.id === 'page';
      })
    },
    projects () {
      return this.$store.getters.user.projects;
    },
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    },
    citationLabel () {
      return this.selectedProject.styleFormat && this.selectedProject.styleFormat.indexOf('note') > -1 ? 'Footnote' : 'In-text citation';
    }
  },
  methods: {
    toggleContextMenu (e) {
      if (e && e.type === 'contextmenu') {
        this.contextMenuTrigger = createEl(e.pageX, e.pageY);
        this.contextMenuTargetOrigin = {vertical: 'top', horizontal: 'left'};
      } else {
        this.contextMenuTrigger = this.$refs.contextMenuBtn;
        this.contextMenuTargetOrigin = {vertical: 'top', horizontal: 'right'};
      }

      this.contextMenuIsOpen = !this.contextMenuIsOpen;
    },
    handleContextMenuClose () {
      this.contextMenuIsOpen = false;
    },
    copyReferenceToClipboard () {
      this.handleContextMenuClose();
      copyHtmlToClipboard(this.reference.formattedStr);
      const referenceStr = this.$t('Reference');
      SnackBar.addSnack({
        message: '📋 ' + referenceStr + ' copied to clipboard.'
      })
    },
    copyInTextCitationToClipboard () {
      this.handleContextMenuClose();
      copyHtmlToClipboard(this.reference.citations[0]);
      SnackBar.addSnack({
        message: '📋 In-text citation copied to clipboard.'
      })
    },
    openMoveReferenceDialog () {
      this.moveReferenceDialogIsOpen = true;
      this.contextMenuIsOpen = false;
    },
    openCopyReferenceDialog () {
      this.copyReferenceDialogIsOpen = true;
      this.contextMenuIsOpen = false;
    },
    handleMoveReferenceDialogClose () {
      this.moveReferenceDialogIsOpen = false;
    },
    handleCopyReferenceDialogClose () {
      this.copyReferenceDialogIsOpen = false;
    },
    async moveReference () {
      this.moveReferenceDialogIsSaving = true;
      const newReference = await this.moveReferenceDropDownSelectedProject.addReference(this.reference);
      this.moveReferenceDialogIsSaving = false;
      this.selectedProject.deleteReference(this.reference);

      const referenceStr = this.$t('Reference');
      SnackBar.addSnack({
        message: '↩️ ' + referenceStr + ' moved to ' + this.moveReferenceDropDownSelectedProject.title + '.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.moveReferenceDropDownSelectedProject.deleteReference(newReference);
          this.selectedProject.restoreReference(this.reference);
        }
      })

      this.handleMoveReferenceDialogClose();
    },
    async copyReference () {
      this.copyReferenceDialogIsSaving = true;
      const newReference = await this.copyReferenceDropDownSelectedProject.addReference(this.reference);
      this.copyReferenceDialogIsSaving = false;

      const referenceStr = this.$t('Reference');
      SnackBar.addSnack({
        message: '📋 ' + referenceStr + ' copied to ' + this.copyReferenceDropDownSelectedProject.title + '.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.copyReferenceDropDownSelectedProject.deleteReference(newReference);
        }
      })

      this.handleCopyReferenceDialogClose();
    },
    deleteReference () {
      this.contextMenuIsOpen = false;
      this.selectedProject.deleteReference(this.reference)

      const referenceStr = this.$t('Reference');
      SnackBar.addSnack({
        message: '😲 ' + referenceStr + ' deleted.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          this.selectedProject.restoreReference(this.reference);
        }
      })
    },
    openResource (url) {
      window.open(url);
    },
    onDragStart (ev) {
      if (bowser.msie || bowser.msedge) {
        return;
      }

      let referencesToMove = [];
      if (this.reference.isSelected) {
        // we're moving multiple selected references
        referencesToMove = this.selectedProject.references.filter(r => r.isSelected);
      } else {
        // just moving one
        referencesToMove = [this.reference];
      }

      ev.dataTransfer.dropEffect = 'move';
      ev.dataTransfer.effectAllowed = 'move';

      draggingEl = document.createElement('div');
      draggingEl.style.alignItems = 'center';
      draggingEl.style.backgroundColor = '#2196f3';
      draggingEl.style.color = '#fff';
      draggingEl.style.display = 'flex';
      draggingEl.style.padding = '20px';
      draggingEl.style.borderRadius = '5px';
      draggingEl.style.position = 'absolute';
      draggingEl.style.top = '-100px';
      draggingEl.innerHTML = `<i class='material-icons' style='margin-right:16px;'>content_cut</i>Move ${referencesToMove.length} ${(referencesToMove.length === 1 ? this.$t('reference') : this.$t('references'))}`;
      document.body.appendChild(draggingEl);

      ev.dataTransfer.setDragImage(draggingEl, 0, 0);
      ev.dataTransfer.setData('references', JSON.stringify(referencesToMove));
    },
    onDragEnd (ev) {
      document.body.removeChild(draggingEl);
    }
  },
  mounted () {
    this.contextMenuTrigger = this.$refs.contextMenuBtn;

    this.moveReferenceDropDownSelectedProject = this.projects[0];
    this.copyReferenceDropDownSelectedProject = this.projects[0];
  }
}
</script>

<style lang="scss" scoped>
  @import '../variables.scss';

  .row { position:relative; transition:all 0.5s ease; 
    .row-body { cursor:pointer; display:flex; padding: 16px 20px; width:100%;
      .mu-checkbox { margin-right:18px; margin-top:12px; opacity:0.3;

      }
    }
    .avatar { align-items:center; background:#bdbdbd; border-radius:50%; color:#fff; display:flex; height:40px; justify-content:center; margin-right:16px; margin-top:4px; width:40px;
      &.square { background:#fff; border-radius:5px; box-shadow:0 1px 2px rgba(0,0,0,0.2); object-fit:cover; }
    }
    .reference { flex:1; margin-right:150px;
      .formatted { line-height:1.5em; }
      .details { color:#959eba; line-height:1.6em;
        .detail { margin-right:6px; padding-right:8px;
          span { color:#2c3e50; }
          &:after { background:#959eba; content:''; display:inline-block; height:10px; left:8px; opacity:0.6; position:relative; width:1px;}
          &:last-child:after { display:none; }
        }
      }
      .subline { align-items:center; color:#747f8b; display:flex;
        .btn > i { margin-right:4px; }
      }
    }
    .options { background:rgba(255,255,255,0.9); border-radius:100px; display:flex; margin-top:-20px; padding:6px; position: absolute; right:10px; top:50%;
      button, .btn { align-items:center; display:flex; font-size:20px; margin-right:4px; padding:1px 6px; }
    }
    &:hover { background: linear-gradient(to right, #ffffff 0%,#f5f7f9 100%);
      .mu-checkbox { opacity:1; }
    }
    &.highlighted { background:linear-gradient(to right, #ffffff 0%,lighten(#fcc107, 30%) 100%); }
    &.selected { background:linear-gradient(to right, #ffffff 0%, lighten($secondary-color, 30%) 100%);
      .mu-checkbox { opacity:1; }
    }
  }

  .move-reference-select-field, .copy-reference-select-field { align-items:center; display:flex;
    .mu-text-field { min-height:auto; margin-bottom:0; margin-left:16px; margin-right:16px; position:relative; top:4px; width:200px; }
  }
</style>