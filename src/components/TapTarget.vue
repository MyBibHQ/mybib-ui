<template>  
  <div class="tap-target">
    <transition name="zoom">
      <div v-show="show" class="tap-target-surround" ref="surround">
        <div class="tap-target-pulse">

        </div>
        <div class="tap-target-content" ref="content">
          <slot />
        </div>
      </div>
    </transition>

    <div v-if="show" @click="close" class="tap-target-overlay" ref="overlayTop"></div>
    <div v-if="show" @click="close" class="tap-target-overlay" ref="overlayRight"></div>
    <div v-if="show" @click="close" class="tap-target-overlay" ref="overlayBottom"></div>
    <div v-if="show" @click="close" class="tap-target-overlay" ref="overlayLeft"></div>
  </div>
</template>

<script>
export default {
  name: 'TapTarget',
  props: ['target', 'contentLocation', 'show'],
  data () {
    return {}
  },
  computed: {
  },
  methods: {
    updatePosition () {
      if (this.show && this.target) {
        this.$nextTick(() => {
          // get the boundingRect of the target
          const targetBoundingRect = this.target.$el ? this.target.$el.getBoundingClientRect() : this.target.getBoundingClientRect();

          const padding = 30;
          // position the surround over the target el
          const width = targetBoundingRect.width + padding;
          const height = targetBoundingRect.width + padding;
          const top = targetBoundingRect.top + (targetBoundingRect.height / 2) - (height / 2);
          const left = targetBoundingRect.left + (targetBoundingRect.width / 2) - (width / 2);

          this.$refs.surround.style.width = Math.ceil(width) + 'px';
          this.$refs.surround.style.height = Math.ceil(height) + 'px';
          this.$refs.surround.style.top = Math.ceil(top) + 'px';
          this.$refs.surround.style.left = Math.ceil(left) + 'px';

          document.body.appendChild(this.$el);

          // position the overlays
          // top
          this.$refs.overlayTop.style.top = 0;
          this.$refs.overlayTop.style.left = 0;
          this.$refs.overlayTop.style.right = 0;
          this.$refs.overlayTop.style.height = top + 'px';
          // right
          this.$refs.overlayRight.style.top = 0;
          this.$refs.overlayRight.style.bottom = 0;
          this.$refs.overlayRight.style.right = 0;
          this.$refs.overlayRight.style.left = left + width + 'px';
          // bottom
          this.$refs.overlayBottom.style.bottom = 0;
          this.$refs.overlayBottom.style.left = 0;
          this.$refs.overlayBottom.style.right = 0;
          this.$refs.overlayBottom.style.top = top + height + 'px';
          // left
          this.$refs.overlayLeft.style.top = 0;
          this.$refs.overlayLeft.style.bottom = 0;
          this.$refs.overlayLeft.style.left = 0;
          this.$refs.overlayLeft.style.width = left + 'px';

          // position the content
          switch (this.contentLocation) {
            case 'n':
              this.$refs.content.style.left = '50%';
              this.$refs.content.style.bottom = '120%';
              this.$refs.content.style.transform = 'translate(-50%, 0)'
              break;
            case 'ne':
              this.$refs.content.style.left = '100%';
              this.$refs.content.style.bottom = '120%';
              break;
            case 'e':
              this.$refs.content.style.left = '120%';
              this.$refs.content.style.top = '50%';
              this.$refs.content.style.transform = 'translate(0, -50%)'
              break;
            case 'se':
              this.$refs.content.style.left = '100%';
              this.$refs.content.style.top = '120%';
              break;
            case 's':
              this.$refs.content.style.left = '50%';
              this.$refs.content.style.top = '120%';
              this.$refs.content.style.transform = 'translate(-50%, 0)'
              break;
            case 'sw':
              this.$refs.content.style.right = '100%';
              this.$refs.content.style.top = '100%';
              break;
            case 'w':
              this.$refs.content.style.right = '120%';
              this.$refs.content.style.top = '50%';
              this.$refs.content.style.transform = 'translate(0, -50%)'
              break;
            case 'nw':
              this.$refs.content.style.right = '100%';
              this.$refs.content.style.bottom = '100%';
              break;
          }
        })
      }
    },
    close () {
      this.$emit('close');
    }
  },
  mounted () {
    this.updatePosition();
    window.addEventListener('resize', this.updatePosition);
  },
  beforeUpdate () {
    this.updatePosition();
  },
  beforeDestroy () {
    window.removeEventListener('resize', this.updatePosition);
    this.$el.remove();
  }
}
</script>

<style lang="scss" scoped>
.tap-target { pointer-events:none; z-index:100000; }
.tap-target-surround { border-radius:500px; border:10px solid #fff; box-shadow: 0 0 0 500px rgba(119, 186, 250, 0.95); position:fixed; pointer-events:none; transition:opacity 0.2s, transform 0.2s; z-index:10; }
.tap-target-pulse { 
  &:after { animation: pulse 1s cubic-bezier(0.24, 0, 0.38, 1) infinite; content: ''; border-radius: 50%; box-shadow:0 0 0 20px #ffffff; display: block; height: 100%; position: absolute; width: 100%;  }
}
.tap-target-content { color:#ffffff; font-weight:500; font-size:22px; line-height:1.5em; opacity:0.9; position:absolute; width:400px; }
.tap-target-overlay { background:transparent; position:fixed; pointer-events: auto; z-index:10000; }

.zoom-enter { opacity:0; transform:scale(0); }
.zoom-enter-to { opacity:1; transform:scale(1); }
.zoom-leave { opacity:1; transform:scale(1); }
.zoom-leave-to { opacity:0; transform:scale(0); }

// @keyframes pulse-animation{0%{opacity:1;transform:scale(1)}50%{opacity:0;transform:scale(1.5)}100%{opacity:0;transform:scale(1.5)}}
@keyframes pulse{0%{opacity:1;box-shadow:0 0 0 0 #ffffff}50%{opacity:0;box-shadow:0 0 0 50px #ffffff}100%{opacity:0;box-shadow:0 0 0 50px #ffffff}}
</style>