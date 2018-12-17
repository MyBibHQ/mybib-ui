<template>
  <div class="name">
    <div class="label">
      <button @click="dropdownIsOpen = true" ref="dropdownTrigger">
        <span>
          {{labelToDisplay}}  <i class="material-icons">arrow_drop_down</i>
        </span>
      </button>
      <mu-popover :trigger="dropdownTrigger" :open="dropdownIsOpen" @close="dropdownIsOpen = false">
        <mu-menu>
          <mu-menu-item :title="label" @click="useLiteralName(false)"/>
          <mu-menu-item title="Organization" @click="useLiteralName(true)"/>
        </mu-menu>
      </mu-popover>
    </div>
    <div class="input">
      <input v-if="!literalNameIsSelected" type="text" v-model="name.given" :class="{'important': isImportant && !name.given}" v-tooltip.left="{content: tooltip, classes: ['reference-form-field__tooltip'], offset:166, trigger:'focus', hideOnTargetClick:false }" placeholder="First name(s)" />
      <input v-if="!literalNameIsSelected" type="text" v-model="name.family" :class="{'important': isImportant && !name.family}" v-tooltip.left="{content: tooltip, classes: ['reference-form-field__tooltip'], offset:303, trigger:'focus', hideOnTargetClick:false }" placeholder="Surname"/>
      <input v-if="literalNameIsSelected" type="text" v-model="name.literal" class="expand" placeholder="Company or organization name"/>
      <button class="remove-name-btn red" title="Remove person" @click="$emit('onDelete')"><i class="material-icons">remove_circle_outline</i></button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReferenceFormName',
  props: ['label', 'name', 'isImportant', 'tooltip'],
  data () {
    return {
      dropdownIsOpen: false,
      literalNameIsSelected: false,
      dropdownTrigger: null
    }
  },
  computed: {
    labelToDisplay () {
      return this.literalNameIsSelected ? 'Organization' : this.label
    }
  },
  methods: {
    useLiteralName (useLiteralName) {
      this.literalNameIsSelected = useLiteralName;
      if (useLiteralName) {
        this.name.given = null;
        this.name.family = null;
      } else {
        this.name.literal = null;
      }

      this.dropdownIsOpen = false;
    }
  },
  beforeMount () {
    if (this.name.literal) {
      this.literalNameIsSelected = true;
    }
  },
  mounted () {
    this.dropdownTrigger = this.$refs.dropdownTrigger
  }
}
</script>

<style lang="scss" scoped>
  .name { display:flex; margin-bottom:10px; }
  .label { align-items:center; display:flex; font-size:14px; font-weight:500; justify-content:flex-end; padding-right:18px; position:relative; text-align:right; text-transform:uppercase; width:150px;
    button { padding:0; text-transform:uppercase;}
    i { margin-right:-8px; }
  }
  input { width:50%;
    &.expand { width:100%; }
  }
</style>