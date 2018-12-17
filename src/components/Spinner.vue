<template>
  <div class="spinner">
    <svg width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
        <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
    </svg>
  </div>
</template>

<script>
export default {
  name: 'Spinner'
}
</script>

<style scoped>
  .spinner { align-items:center; bottom:0; display:flex; justify-content:center; left:0; position:absolute; right:0; top:0; z-index:10; }
  .spinner svg {
    -webkit-animation: rotator 1.4s linear infinite;
    animation: rotator 1.4s linear infinite;
  }

  @-webkit-keyframes rotator {
    0% {
      -webkit-transform: rotate(0deg);
              transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(270deg);
              transform: rotate(270deg);
    }
  }

  @keyframes rotator {
    0% {
      -webkit-transform: rotate(0deg);
              transform: rotate(0deg);
    }
    100% {
      -webkit-transform: rotate(270deg);
              transform: rotate(270deg);
    }
  }
  .spinner .path {
    stroke-dasharray: 187;
    stroke-dashoffset: 0;
    -webkit-transform-origin: center;
            transform-origin: center;
    -webkit-animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
            animation: dash 1.4s ease-in-out infinite, colors 5.6s ease-in-out infinite;
  }

  @-webkit-keyframes colors { 0% { stroke: #ff8065; } 25% { stroke: #fcede6; } 50% { stroke: #2196f3; } 75% { stroke: #2e80b0; } 100% { stroke: #ff8065; }}
  @keyframes colors { 0% { stroke: #ff8065; } 25% { stroke: #fcede6; } 50% { stroke: #2196f3; } 75% { stroke: #2e80b0; } 100% { stroke: #ff8065; }}
  @-webkit-keyframes dash {
    0% {
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 46.75;
      -webkit-transform: rotate(135deg);
              transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      -webkit-transform: rotate(450deg);
              transform: rotate(450deg);
    }
  }
  @keyframes dash {
    0% {
      stroke-dashoffset: 187;
    }
    50% {
      stroke-dashoffset: 46.75;
      -webkit-transform: rotate(135deg);
              transform: rotate(135deg);
    }
    100% {
      stroke-dashoffset: 187;
      -webkit-transform: rotate(450deg);
              transform: rotate(450deg);
    }
  }
</style>