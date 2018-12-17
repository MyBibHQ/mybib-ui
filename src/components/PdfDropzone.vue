<template>
  <div @drop.stop.prevent="onDrop" :class="{show: isDraggingOver}" class="dnd-dropzone">{{message}}</div>
</template>

<script>
  import MessageBus from '@/services/messageBus.js';
  import bowser from 'bowser';

  const defaultMessage = 'Now drop!';

  export default {
    name: 'pdfdropzone',
    data () {
      return {
        isDraggingOver: false,
        message: defaultMessage
      }
    },
    methods: {
      onDragOver (ev) {
        ev.stopPropagation();
        ev.preventDefault();

        if (bowser.msie) {
          alert('This browser doesn\'t support Drag and Drop. Please use another browser like Chrome or Firefox if you want to use this feature.');
          return;
        }
        // check for indexOf because Edge don't got it
        if (ev.dataTransfer.types && [...ev.dataTransfer.types].includes('Files')) {
          this.isDraggingOver = true;
          this.message = 'Now drop!';
          ev.dataTransfer.dropEffect = 'copy';
        } else {
          ev.dataTransfer.dropEffect = 'none';
          ev.dataTransfer.effectAllowed = 'none';
        }
      },
      onDragLeave (ev) {
        ev.preventDefault();
        this.isDraggingOver = false;
      },
      onDrop (ev) {
        ev.stopPropagation();
        ev.preventDefault();

        const file = ev.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          if (file.size < 1024000) {
            MessageBus.droppedPdf = file;
            this.isDraggingOver = false;
            this.$router.push({name: 'NewReferenceSearch', query: { pdf: +new Date() }});
          } else {
            this.message = 'That PDF is too big to upload. Try searching for it with auto-cite instead'
            setTimeout(() => {
              this.isDraggingOver = false
              this.message = defaultMessage;
            }, 2000)
          }
        } else {
          this.message = 'PDFs only!';
          setTimeout(() => {
            this.isDraggingOver = false;
            this.message = defaultMessage;
          }, 2000)
        }
      }
    },
    mounted () {
      document.body.addEventListener('dragover', this.onDragOver);
      document.body.addEventListener('dragleave', this.onDragLeave)
    }
  }
</script>

<style lang="scss" scoped>
  .dnd-dropzone { align-items:center; background:rgba(#2196f3, 0.8); bottom:0; color:#fff; display:flex; font-size:28px; font-weight:500; justify-content:center; left:0; opacity:0; position:fixed; right:0; transition:all 250ms ease-in-out; top:0; visibility: hidden; z-index:3;
    &.show { opacity:1; visibility: visible; }
  }
</style>