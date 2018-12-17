<template>
  <div class="project-row" :class="[{ 'is-renaming': isRenaming, 'hovering-top': isHoveringTop, 'hovering-middle': isHoveringMiddle, 'hovering-bottom': isHoveringBottom }, 'n'+project.id%10]" draggable="true" @dragstart="onDragStart" @dragover.stop="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
    <router-link @contextmenu.native.prevent="toggleContextMenu" :to="{name: 'Project', params: {projectId: project.id}}" tag="div" :class="{selected: isSelected, disabled: project.isLoading}" class="project-row-btn" draggable="false">
      <i>{{ project.references.length }}</i>
      <input type="text" @keyup.enter="$event.target.blur()" @blur="saveRename" @keyup.esc="cancelRename" :value="project.title" :disabled="!isRenaming" ref="titleInput" class="title" />
    </router-link>
    <div class="right-icon" ref="contextMenuTrigger">
      <mu-circular-progress v-if="project.isLoading || isBusy" :size="26" color="#d8d8d8" :strokeWidth="2"/>
      <button v-if="!project.isLoading && !isBusy" @click="toggleContextMenu">
        <span>
          <i class="material-icons">more_vert</i>
        </span>
      </button>
    </div>
    <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'right'}" :targetOrigin="{vertical:'top', horizontal:'right'}" :open="contextMenuIsOpen" :trigger="contextMenuTrigger" @close="handleContextMenuClose">
      <mu-menu desktop>
        <mu-menu-item title="Rename" leftIcon="edit" @click="renameProject" />
        <mu-menu-item title="Duplicate" leftIcon="content_copy" @click="duplicateProject" />
        <mu-menu-item title="Merge with..." leftIcon="call_merge" @click="mergeProjectDialogIsOpen = true" />
        <mu-divider />
        <mu-menu-item title="Delete" leftIcon="delete" @click="deleteProject" titleClass="red" leftIconClass="red" />
      </mu-menu>
    </mu-popover>

    <mu-dialog title="Merge project" :open="mergeProjectDialogIsOpen" @close="handleMergeProjectDialogClose">
      <div class="project-row" :class="'n'+project.id%10" style="font-size:15px; width:264px;">
        <div class="selected project-row-btn">
          <i>{{ project.references.length }}</i>
          <span class="title" >{{ project.title }}</span>
        </div>
      </div>
      <div class="merge-project-select-field">
        <label style="font-size: 13px; font-weight: 500; text-transform: uppercase;">Merge with project:</label>
        <mu-select-field v-model="mergeProjectDropDownSelectedProject" :maxHeight="200">
          <mu-menu-item v-for="project in user.projects" :key="project.id" :value="project" :title="project.title" />
        </mu-select-field>
      </div>
      <mu-flat-button slot="actions" @click="handleMergeProjectDialogClose" label="Cancel"/>
      <mu-flat-button slot="actions" @click="mergeProject" primary :label="mergeProjectDialogIsSaving ? 'Merging...' : 'Merge'" :disabled="mergeProjectDialogIsSaving"/>
    </mu-dialog>
  </div>
</template>

<script>
import bowser from 'bowser';

import SnackBar from '@/services/snackBar.js';

export default {
  name: 'ProjectsRow',
  props: ['project', 'folder', 'isSelected'],
  data () {
    return {
      contextMenuIsOpen: false,
      contextMenuTrigger: null,
      isRenaming: false,
      isBusy: false,
      isHoveringTop: false,
      isHoveringMiddle: false,
      isHoveringBottom: false,
      mergeProjectDialogIsOpen: false,
      mergeProjectDropDownSelectedProject: {},
      mergeProjectDialogIsSaving: false
    };
  },
  computed: {
    user () {
      return this.$store.getters.user;
    }
  },
  methods: {
    toggleContextMenu () {
      this.contextMenuIsOpen = !this.contextMenuIsOpen;
    },
    handleContextMenuClose () {
      this.contextMenuIsOpen = false;
    },
    renameProject () {
      this.contextMenuIsOpen = false;
      this.isRenaming = true;
      this.$nextTick(() => {
        this.$refs.titleInput.select();
      })
    },
    cancelRename (e) {
      this.$refs.titleInput.value = this.project.title;
      this.isRenaming = false;
      e.target.blur();
    },
    saveRename (e) {
      window.getSelection().removeAllRanges();
      const oldProjectTitle = this.project.title;
      this.project.title = this.$refs.titleInput.value;
      this.$refs.titleInput.value = ''; // this is a workaround to make IE reset the input to the beginning of the value
      const updatedProject = this.project.save();

      if (!updatedProject) {
        // it failed. undo.
        this.selectedProject.title = oldProjectTitle;
      }

      this.isRenaming = false;
    },
    async duplicateProject () {
      this.contextMenuIsOpen = false;
      this.isBusy = true;

      const duplicatedProject = await this.$store.getters.user.addProject({ title: this.project.title + ' (copy)', styleId: this.project.styleId });
      this.isBusy = false;
      await duplicatedProject.addReferences(this.project.references);

      SnackBar.addSnack({
        message: '👍 Project duplicated.'
      });

      this.$router.push({ name: 'Project', params: {projectId: duplicatedProject.id} });
    },
    handleMergeProjectDialogClose () {
      this.mergeProjectDialogIsOpen = false;
    },
    async mergeProject () {
      this.mergeProjectDialogIsSaving = true;
      // first add all the references from this project into the selected one
      await this.mergeProjectDropDownSelectedProject.addReferences(this.project.references);
      // then delete this project
      this.user.deleteProject(this.project);

      this.mergeProjectDialogIsSaving = false;

      SnackBar.addSnack({
        message: '👍 Project merged.'
      });

      this.$router.push({ name: 'Project', params: {projectId: this.mergeProjectDropDownSelectedProject.id} });
    },
    deleteProject () {
      this.contextMenuIsOpen = false;
      // redirect to the top project if the selected one was deleted and there's another project available
      if (this.isSelected && this.user.projects.length > 1) {
        // if the top one is being deleted then redirect to the second
        const projectToRedirectTo = this.project === this.user.projects[0] ? this.user.projects[1] : this.user.projects[0];
        this.$router.push({ name: 'Project', params: {projectId: projectToRedirectTo.id} });
      }

      this.user.deleteProject(this.project);

      SnackBar.addSnack({
        message: '😲 Project deleted.',
        action: 'Undo',
        actionColor: '#d6d6d6',
        actionClick: () => {
          const restoredProject = this.user.restoreLastDeletedProject();
          this.$router.push({ name: 'Project', params: {projectId: restoredProject.id} });
        }
      })
    },
    onDragStart (ev) {
      if (bowser.msie || bowser.msedge) {
        alert('This browser doesn\'t support project reordering or folders. Please use another browser like Chrome or Firefox if you want to use these features.');
        return;
      }

      ev.dataTransfer.dropEffect = 'move';
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setDragImage(ev.target, 0, 0)
      ev.dataTransfer.setData('project', JSON.stringify(this.project));
    },
    onDragOver (ev) {
      ev.preventDefault();
      const dragType = ev.dataTransfer.types[0];
      if (dragType === 'folder' && this.project.folderName) {
        // it's a folder being dragged onto a project in a folder. Return.
        ev.dataTransfer.dropEffect = 'none';
        ev.dataTransfer.effectAllowed = 'none';
        return;
      } else if (dragType === 'project' || dragType === 'folder') {
        const targetBoundingClientRect = ev.currentTarget.getBoundingClientRect();
        const topPx = ev.pageY - targetBoundingClientRect.top;

        if (topPx < 16) {
          this.isHoveringTop = true;
          this.isHoveringMiddle = false;
          this.isHoveringBottom = false;
        } else if (topPx > targetBoundingClientRect.height - 16) {
          this.isHoveringTop = false;
          this.isHoveringMiddle = false;
          this.isHoveringBottom = true;
        } else if (!this.folder && dragType === 'project') { // only allowed to drag over if the row isn't in a folder, we're dragging a project, and we're not dragging it into itself
          this.isHoveringTop = false;
          this.isHoveringMiddle = true;
          this.isHoveringBottom = false;
        }
      } else if (dragType === 'references') {
        this.isHoveringMiddle = true;
      } else {
        // it's something it shouldn't be (like a file or a tag)
        ev.dataTransfer.dropEffect = 'none';
        ev.dataTransfer.effectAllowed = 'none';
        return;
      }
    },
    onDragLeave (ev) {
      ev.preventDefault();
      this.isHoveringTop = false;
      this.isHoveringMiddle = false;
      this.isHoveringBottom = false;
    },
    async onDrop (ev) {
      ev.preventDefault();
      const dragType = ev.dataTransfer.types[0];
      const itemBeingDragged = JSON.parse(ev.dataTransfer.getData(dragType));
      if (dragType === 'project') {
        if (itemBeingDragged.id !== this.project.id) { // if the projects are the same then do nothing
          if (this.isHoveringTop) {
            this.$emit('onMoveProject', itemBeingDragged.id, this.project, 0);
          } else if (this.isHoveringMiddle) {
            this.$emit('onCreateFolder', itemBeingDragged.id, this.project);
          } else {
            this.$emit('onMoveProject', itemBeingDragged.id, this.project, 1);
          }
        }
      } else if (dragType === 'folder') {
        if (this.isHoveringTop) {
          this.$emit('onMoveFolder', itemBeingDragged.name, this.project, 0);
        } else if (this.isHoveringBottom) {
          this.$emit('onMoveFolder', itemBeingDragged.name, this.project, 1);
        }
      } else if (dragType === 'references') {
        const originalProject = this.user.projects.find(p => p.id === itemBeingDragged[0].projectId);
        const originalReferences = originalProject.references.filter(r => itemBeingDragged.some(i => i.id === r.id));

        const newReferences = await this.project.addReferences(originalReferences);
        originalProject.deleteReferences(originalReferences)

        const referenceStr = newReferences.length > 1 ? this.$t('references') : this.$t('reference');
        SnackBar.addSnack({
          message: `↩️ ${newReferences.length} ${referenceStr} moved to ${this.project.title}.`,
          action: 'Undo',
          actionColor: '#d6d6d6',
          actionClick: () => {
            this.project.deleteReferences(newReferences);
            originalProject.restoreReferences(originalReferences);
          }
        })
      }

      this.isHoveringTop = false;
      this.isHoveringMiddle = false;
      this.isHoveringBottom = false;
    }
  },
  mounted () {
    this.contextMenuTrigger = this.$refs.contextMenuTrigger;

    this.mergeProjectDropDownSelectedProject = this.user.projects[0];
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .project-row { padding: 3px 0; position:relative;
    .project-row-btn { align-items: center; background:#ffffff; border-left:4px solid; border-radius:0 100px 100px 0; box-shadow:0 1px 2px rgba(0,0,0,0.2); cursor:pointer; display:flex; height:53px; padding:0 16px; 
      i { font-style: normal; width:34px; }
      .title { background:transparent; border:none; color:inherit; cursor:inherit; margin-right:24px; overflow: hidden; pointer-events: none; text-overflow: ellipsis; white-space: nowrap; width:170px; } // the width is to keep Edge happy
      &.selected { box-shadow:inset 0 1px 1px rgba(0,0,0,0.2); font-weight:500; }
      &.disabled { pointer-events: none; }
    }
    .right-icon { position:absolute; top:17px; right:10px;
      button { visibility:hidden; opacity:0.7;
        &:hover { opacity:1 }
      }
    }
    &:hover .right-icon button { visibility:visible; }
    &.is-renaming {
      .project-row-btn { background:rgba(214, 214, 214, 0.3) !important; border-color: #d6d6d6 !important;
        .title { cursor:text; font-style: italic; pointer-events: all; }
      }
    }
    &.hovering-top {
      &:before { background:$secondary-color; top:-1px; content:''; position:absolute; pointer-events: none; width:100%; height:3px; z-index:2;}
    }
    &.hovering-middle {
      .project-row-btn { outline: 3px solid $secondary-color; }
    }
    &.hovering-bottom {
      &:after { background:$secondary-color; bottom:-2px; content:''; position:absolute; pointer-events: none; width:100%; height:3px; z-index:2;}
    }
    &.n1 {
      .project-row-btn { border-color: #673AB7;
        &.selected { background:rgba(103, 58, 183, 0.3); }
      }
    }
    &.n2 {
      .project-row-btn { border-color: #3F51B5;
        &.selected { background:rgba(63, 81, 181, 0.3); }
      }
    }
    &.n3 {
      .project-row-btn { border-color: #009688;
        &.selected { background:rgba(0, 150, 136, 0.3); }
      }
    }
    &.n4 {
      .project-row-btn { border-color: #4CAF50;
        &.selected { background:rgba(76, 175, 80, 0.3); }
      }
    }
    &.n5 {
      .project-row-btn { border-color: #CDDC39;
        &.selected { background:rgba(205, 220, 57, 0.3); }
      }
    }
    &.n6 {
      .project-row-btn { border-color: #FFC107;
        &.selected { background:rgba(255, 193, 7, 0.3); }
      }
    }
    &.n7 {
      .project-row-btn { border-color: #FF9800;
        &.selected { background:rgba(255, 152, 0, 0.3); }
      }
    }
    &.n8 {
      .project-row-btn { border-color: #FF5722;
        &.selected { background:rgba(255, 87, 34, 0.3); }
      }
    }
    &.n9 {
      .project-row-btn { border-color: #E91E63;
        &.selected { background:rgba(232, 32, 99, 0.3); }
      }
    }
    &.n0 {
      .project-row-btn { border-color: #9C27B0;
        &.selected { background:rgba(156, 39, 176, 0.3); }
      }
    }
  }
  
  .project-folder {
    .project-row { padding:0; 
      .project-row-btn { border-color: $secondary-color; border-radius:0; box-shadow:0; }
      .right-icon { top:14px; }
      &:last-child {
        .project-row-btn { border-radius: 0 0 30px 0; }
      }
    }
  }

  .merge-project-select-field { align-items:center; display:flex;
    .mu-text-field { min-height:auto; margin-bottom:0; margin-left:16px; margin-right:16px; position:relative; top:4px; width:200px; }
  }
</style>