// this is for passing objects to the muse popover trigger when using right-click to open it
export default function createEl (xpos, ypos) {
  const el = {};
  el.getBoundingClientRect = function () {
    return {
      bottom: ypos + 1,
      height: 1,
      left: xpos,
      right: xpos + 1,
      top: ypos,
      width: 1,
      x: xpos,
      y: ypos
    }
  }

  return el;
}
