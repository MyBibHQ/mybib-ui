<template>
  <div class="tooltip-lg" :class="{show: show, primary: primary === '', secondary: secondary === '', wide: wide === ''}" :data-placement="placement.split(' ')[0]" :style="{ left: left + 'px', top: top + 'px'}">
    <button class="close-btn" @click="close"><i class="material-icons">close</i></button>
    <slot></slot>
    <mu-raised-button @click="close">Got it</mu-raised-button>
  </div>
</template>

<script>
import Tooltips from '@/services/tooltips.js';

export default {
  name: 'TooltipLg',
  props: {
    tooltipId: {
      type: String
    },
    category: {
      type: String
    },
    placement: {
      type: String,
      default: 'bottom'
    },
    target: {
      required: true,
      default: null
    },
    primary: {
    },
    secondary: {
    },
    wide: {
    }
  },
  data () {
    return {
      tooltips: Tooltips,
      left: 0,
      top: 0
    }
  },
  computed: {
    show () {
      return !this.tooltips.tooltipsToHide.some(t => t.tooltipId === this.tooltipId) && this.tooltips.categoriesToHide.indexOf(this.category);
    }
  },
  methods: {
    toggleShow () {
      this.reposition();
    },
    reposition () {
      if (this.target) {
        // check if it's a vue object or an actual HTML el
        const targetBoundingRect = this.target.hasOwnProperty('$el') ? this.target.$el.getBoundingClientRect() : this.target.getBoundingClientRect();

        const popover = this.$el;
        const popoverBoundingRect = popover.getBoundingClientRect();

        // parse the placement string
        const placements = this.placement.split(' ');
        const placementMain = placements[0];
        const placementSecondary = placements[1];

        const offset = 20;
        let left;
        let top;
        switch (placementMain) {
          case 'top':
            if (placementSecondary) {
              if (placementSecondary === 'start') {
                left = targetBoundingRect.left;
              } else if (placementSecondary === 'end') {
                left = targetBoundingRect.left + targetBoundingRect.width - popoverBoundingRect.width;
              }
            } else {
              left = targetBoundingRect.left + (targetBoundingRect.width / 2) - (popoverBoundingRect.width / 2);
            }
            top = targetBoundingRect.top - popoverBoundingRect.height - offset;
            break;
          case 'right':
            left = targetBoundingRect.left + targetBoundingRect.width + offset;
            if (placementSecondary) {
              if (placementSecondary === 'start') {
                top = targetBoundingRect.top;
              } else if (placementSecondary === 'end') {
                top = targetBoundingRect.top + targetBoundingRect.height - popoverBoundingRect.height;
              }
            } else {
              top = targetBoundingRect.top + (targetBoundingRect.height / 2) - (popoverBoundingRect.height / 2);
            }
            break;
          case 'bottom':
            if (placementSecondary) {
              if (placementSecondary === 'start') {
                left = targetBoundingRect.left;
              } else if (placementSecondary === 'end') {
                left = targetBoundingRect.left + targetBoundingRect.width - popoverBoundingRect.width;
              }
            } else {
              left = targetBoundingRect.left + (targetBoundingRect.width / 2) - (popoverBoundingRect.width / 2);
            }
            top = targetBoundingRect.top + targetBoundingRect.height + offset;
            break;
          case 'left':
            left = targetBoundingRect.left - popoverBoundingRect.width - offset;
            if (placementSecondary) {
              if (placementSecondary === 'start') {
                top = targetBoundingRect.top;
              } else if (placementSecondary === 'end') {
                top = targetBoundingRect.top + targetBoundingRect.height - popoverBoundingRect.height;
              }
            } else {
              top = targetBoundingRect.top + (targetBoundingRect.height / 2) - (popoverBoundingRect.height / 2);
            }
            break;
          case 'center':
            left = targetBoundingRect.left + (targetBoundingRect.width / 2) - (popoverBoundingRect.width / 2);
            top = targetBoundingRect.top + (targetBoundingRect.height / 2) - (popoverBoundingRect.height / 2);
            break;
        }

        this.left = Math.round(left);
        this.top = Math.round(top);
      }
    },
    close () {
      this.tooltips.hideTooltip({ tooltipId: this.tooltipId, category: this.category });
    }
  },
  mounted () {
    const i = setInterval(() => {
      this.reposition();
    }, 5); // this is so that any entrance animations are tracked too
    setTimeout(() => {
      clearInterval(i)
    }, 500) // ...then stop tracking after 500ms

    document.body.appendChild(this.$el);

    window.addEventListener('resize', this.reposition);
  },
  updated () {
    this.reposition();
  },
  beforeDestroy () {
    try {
      document.body.removeChild(this.$el); // this is inside a try because if the tooltip is displayed with a v-if then we don't need to remove it manually
    } catch (ex) {

    }

    window.removeEventListener('resize', this.reposition);
  }
}
</script>

<style lang="scss" scoped>
  @import '../variables.scss';

  .tooltip-lg { background:rgba(255,255,255,0.95); border:5px solid rgba($secondary-color, 0.5); border-radius:2px; opacity:0; position:absolute; transition:transform 0.4s ease-in-out, opacity 0.4s ease-in-out, visibility 0s linear 0.4s; padding:10px; transform: rotate3d(1,1,0,15deg); transform-origin: 0 100%; visibility:hidden; width:220px; z-index:2;
    &:before { background: #fff; content: ''; border-color:rgba($secondary-color, 0.5); border-style: solid; border-width: 5px 0 0 5px; border-radius: 0 0 20px 3px; height: 20px; transform: rotate(45deg); position: absolute; width: 20px; }
    &[data-placement='top'] {
      &:before { bottom:-13px; left:calc(50% - 10px); transform: rotate(225deg); }
    }
    &[data-placement='right'] {
      &:before { top:calc(50% - 10px); left:-13px; transform: rotate(-45deg); }
    }
    &[data-placement='bottom'] {
      &:before { top:-13px; left:calc(50% - 10px); }
    }
    &[data-placement='left'] {
      &:before { top:calc(50% - 10px); right:-13px; transform: rotate(-225deg); }
    }
    &[data-placement='center'] {
      &:before { display:none; }
    }    
    &.show { visibility: visible; opacity:1; transform: none; transition: transform 0.4s ease-in-out, opacity 0.4s ease-in-out, visibility 0s linear; }

    &.primary { border-color: rgba($primary-color,0.5); z-index: 4;
      &:before { border-color: rgba($primary-color,0.5); }
      .mu-raised-button { color: $primary-color; }
    }
    &.secondary { border-color:rgba(172,119,250,0.5); z-index: 3;
      &:before { border-color:rgba(172,119,250,0.5); }
      .mu-raised-button { color: rgb(172,119,250); }
    }

    &.wide { width: 400px; }

    p { margin-top:0;
      &:last-child { margin-bottom:0; }
    }

    .mu-raised-button { color:$secondary-color; }

    .close-btn { opacity:0.4; float:right; margin:-10px -16px 0 0; }
  }
</style>