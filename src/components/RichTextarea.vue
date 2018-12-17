<template>
  <div @input="handleInput" @paste.prevent="handlePaste" contenteditable="true" class="rich-textarea"></div>
</template>

<script>
export default {
  name: 'RichTextarea',
  props: ['content'],
  watch: {
    content () {
      this.$el.innerHTML = this.content;
    }
  },
  methods: {
    handlePaste (e) {
      e.preventDefault();
      let cleanedPaste = stripTags(e.clipboardData.getData('text/html'), '<i><em>').trim();
      cleanedPaste = cleanedPaste.replace(/(<\w+?)( .+?)(>)/g, '$1$3');
      this.$el.innerHTML = cleanedPaste;
      this.handleInput();
    },
    handleInput () {
      let inputStr = this.$el.innerHTML;
      this.$emit('update:content', inputStr);
    }
  },
  mounted () {
    this.$el.innerHTML = this.content || '';
  }
}

function stripTags (input, allowed) {
  // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
  allowed = (((allowed || '') + '').toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join('')

  var tags = /<\/?([a-z0-9]*)\b[^>]*>?/gi
  var commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi

  var after = input
  // removes tha '<' char at the end of the string to replicate PHP's behaviour
  after = (after.substring(after.length - 1) === '<') ? after.substring(0, after.length - 1) : after

  // recursively remove tags to ensure that the returned string doesn't contain forbidden tags after previous passes (e.g. '<<bait/>switch/>')
  while (true) {
    var before = after
    after = before.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
      return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : ''
    })

    // return once no more tags are removed
    if (before === after) {
      return after
    }
  }
}
</script>

<style lang="scss">
  .rich-textarea { border:1px solid #d7dbe0; border-radius:3px; color:#000; font-size:14px; min-height:100px; padding:12px 12px; width:100%; }
</style>