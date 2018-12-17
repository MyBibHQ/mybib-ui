export default function copyHtmlToClipboard (html) {
  var container = document.createElement('div');
  container.innerHTML = html;
  container.style.position = 'fixed'
  container.style.pointerEvents = 'none'
  container.style.opacity = 0
  container.style.background = '#ffffff'
  container.style.color = '#000000'
  container.style.fontFamily = 'Times New Roman'
  document.body.appendChild(container)
  window.getSelection().removeAllRanges()
  var range = document.createRange()
  range.selectNode(container)
  window.getSelection().addRange(range)
  document.execCommand('copy')
  document.body.removeChild(container)
}
