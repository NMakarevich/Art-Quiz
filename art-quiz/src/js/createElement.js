export default function createElement(className, html) {
  const div = document.createElement("div");
  div.classList = className;
  div.innerHTML = html;
  return div;
}
