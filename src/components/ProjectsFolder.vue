<template>
  <div class="project-folder" :class="{hovering: isHoveringOver}">
    <div class="project-folder-btn" :class="{ open:isOpen }" @click="toggleFolderState" @contextmenu.prevent="toggleContextMenu" draggable="true" @dragstart="onDragStart" @dragover.stop="onDragOver" @dragleave="onDragLeave" @drop="onDrop">
      <i class="project-folder-icon-left material-icons">{{ isOpen ? 'folder_open' : 'folder' }}</i>
      <input type="text" @keyup.enter="$event.target.blur()" @blur="saveRename" @keyup.esc="cancelRename" :value="name" :disabled="!isRenaming" ref="nameInput" class="project-folder-title" :class="{ 'is-renaming': isRenaming }" />
      <div class="project-folder-icons-right">
        <mu-circular-progress v-if="isBusy" :size="26" color="#d8d8d8" :strokeWidth="2"/>
        <button v-if="!isBusy" @click.stop="toggleContextMenu" ref="contextMenuTrigger" class="project-folder-context-menu-btn">
          <span>
            <i class="material-icons">more_vert</i>
          </span>
        </button>
        <i class="material-icons">{{ isOpen ? 'expand_less' : 'expand_more' }}</i>
      </div>
    </div>
    <mu-popover :anchorOrigin="{vertical:'bottom', horizontal:'right'}" :targetOrigin="{vertical:'top', horizontal:'right'}" :open="contextMenuIsOpen" :trigger="contextMenuTrigger" @close="handleContextMenuClose">
      <mu-menu desktop>
        <mu-menu-item title="Rename" leftIcon="edit" @click="renameFolder" />
        <mu-divider />
        <mu-menu-item title="Ungroup" leftIcon="format_line_spacing" @click="ungroupFolder" titleClass="red" leftIconClass="red" />
      </mu-menu>
    </mu-popover>
    <transition-group name="fade" tag="div">
      <slot v-if="isOpen"></slot>
    </transition-group>
  </div>
</template>

<script>
import bowser from 'bowser';

export default {
  name: 'ProjectsFolder',
  props: ['name', 'projects'],
  data () {
    return {
      isRenaming: false,
      isBusy: false,
      isOpen: false,
      contextMenuIsOpen: false,
      contextMenuTrigger: null,
      isHoveringOver: false
    }
  },
  computed: {
    selectedProject () {
      return this.$store.getters.user.projects.find((p) => {
        return p.id === parseInt(this.$route.params.projectId);
      });
    }
  },
  methods: {
    toggleFolderState () {
      if (!this.isRenaming) this.isOpen = !this.isOpen;
    },
    toggleContextMenu () {
      this.contextMenuIsOpen = !this.contextMenuIsOpen;
    },
    handleContextMenuClose () {
      this.contextMenuIsOpen = false;
    },
    renameFolder () {
      this.contextMenuIsOpen = false;
      this.isRenaming = true;
      this.$nextTick(() => {
        this.$refs.nameInput.select();
      })
    },
    cancelRename () {},
    saveRename () {
      window.getSelection().removeAllRanges();
      this.isRenaming = false;
      if (this.$refs.nameInput.value === this.name) {
        // it didn't change
        return;
      }
      this.$emit('onRenameFolder', this.name, this.$refs.nameInput.value)
      this.$refs.nameInput.value = ''; // this is a workaround to make IE reset the input to the beginning of the value
    },
    ungroupFolder () {
      this.$emit('onUngroupFolder');
    },
    onDragStart (ev) {
      if (bowser.msie || bowser.msedge) {
        alert('This browser doesn\'t support folders. Please use another browser like Chrome if you want to use folders.');
      }

      ev.dataTransfer.dropEffect = 'move';
      ev.dataTransfer.effectAllowed = 'move';
      ev.dataTransfer.setDragImage(ev.target, 0, 0);
      ev.dataTransfer.setData('folder', JSON.stringify({ name: this.name }));
    },
    onDragOver (ev) {
      ev.preventDefault();
      const dragType = ev.dataTransfer.types[0];
      if (dragType === 'folder') {
        // it's a folder being dragged. Return.
        ev.dataTransfer.dropEffect = 'none';
        ev.dataTransfer.effectAllowed = 'none';
        return;
      } else if (dragType === 'project') {
        this.isHoveringOver = true;
      } else {
        // it's something it shouldn't be (like a file or a tag)
        ev.dataTransfer.dropEffect = 'none';
        ev.dataTransfer.effectAllowed = 'none';
        return;
      }
    },
    onDragLeave (ev) {
      ev.preventDefault();
      this.isHoveringOver = false;
    },
    onDrop (ev) {
      ev.preventDefault();
      const dragType = ev.dataTransfer.types[0];
      const itemBeingDragged = JSON.parse(ev.dataTransfer.getData(dragType));
      if (dragType === 'folder') {
        // can't drag a folder onto a folder
        this.isHoveringOver = false;
        return;
      } else if (dragType === 'project') {
        this.$emit('onMoveProject', itemBeingDragged.id, this.projects[0], 0);
      }

      this.isHoveringOver = false;
    }
  },
  updated () {
    this.contextMenuTrigger = this.$refs.contextMenuTrigger;

    // open the folder if the currently selected project is in it
    if (this.selectedProject && this.projects.some(p => p.id === this.selectedProject.id)) {
      this.isOpen = true;
    }
  }
}
</script>

<style lang="scss">
  @import '../variables.scss';

  .project-folder { padding: 3px 0; position:relative;
    .project-folder-btn { align-items: center; background:#ffffff; border-left:4px solid $secondary-color; border-radius:0 100px 100px 0; box-shadow:0 1px 2px rgba(0,0,0,0.2); cursor:pointer; display:flex; height:53px; padding:0 16px; width:100%;
      .project-folder-icon-left { color:$secondary-color; left:-2px; position:relative; text-align:left; width:34px; }
      .project-folder-title { background:transparent; border:none; color:inherit; cursor:inherit; margin-right:24px; overflow: hidden; pointer-events: none; text-overflow: ellipsis; white-space: nowrap; width:146px; // this is to keep Edge happy
        &.is-renaming { cursor:text; font-style: italic; pointer-events: all; }
      }
      .project-folder-icons-right { align-items:center; display:flex; position:absolute; top:17px; right:10px;
        button { opacity:0.7;
          &:hover { opacity:1 }
        }
        .project-folder-context-menu-btn { visibility:hidden; }
      }
      &.selected { font-weight:500; }
      &.disabled { pointer-events: none; }
      &:hover {
        .project-folder-context-menu-btn { visibility:visible; }
      }
      &.open { border-radius:0 30px 0 0; }
    }
    &.hovering { outline: 3px solid $secondary-color; }
  }
</style>