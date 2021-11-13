import createElement from "./createElement";

export default class StartScreen {
  constructor() {
    this._container = null;

    this.render();
  }

  get elem() {
    return this._container;
  }

  get settingsButton() {
    return this._container.querySelector('.button-settings')
  }

  render() {
    this._container = createElement('start-screen', this.startScreenTemplate())
    this.eventListeners();
  }

  destroy() {
    this.elem.classList.add('hide');
    this.elem.addEventListener('animationend', () => this.elem.remove())
  }

  eventListeners() {
    this.settingsButton.addEventListener('click', () => {
      const event = new CustomEvent('open-settings', {
        bubbles: true
      });
      this.elem.dispatchEvent(event)
    })
  }

  startScreenTemplate() {
    return `
    <header class="header-start">
        <button type="button" class="button button-settings"></button>
      </header>
      <main class="main-start">
        <div class="logo"></div>
        <button type="button" class="button button-quiz" data-quiz="artist">Artist quiz</button>
        <button type="button" class="button button-quiz" data-quiz="pictures">Pictures quiz</button>
      </main>
      <footer class="footer footer-start">
        <a href="http://rs.school/js" class="school-logo" target="_blank"></a>
        <a href="https://github.com/NMakarevich" target="_blank">My GitHub</a>
        <span>2021</span>
      </footer>
    `
  }
}