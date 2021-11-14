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

  get quizButtons() {
    return this._container.querySelector('.select-quiz');
  }

  render() {
    this._container = createElement('start-screen', this.startScreenTemplate())
    this.eventListeners();
  }

  destroy() {
    this.elem.classList.add('hide');
    this.elem.addEventListener('animationend', () => this.elem.remove())
  }

  selectQuiz = (event) => {
    const target = event.target;
    if (!target.dataset.quiz) return;

    const evt = new CustomEvent('select-quiz', {
      detail: target.dataset.quiz,
      bubbles: true
    })

    this.elem.dispatchEvent(evt)
  }

  openSettings = () => {
    const event = new CustomEvent('open-settings', {
      bubbles: true
    });
    this.elem.dispatchEvent(event)
  } 

  eventListeners() {
    this.settingsButton.addEventListener('click', this.openSettings)

    this.quizButtons.addEventListener('click', this.selectQuiz)
  }

  startScreenTemplate() {
    return `
    <header class="header-start">
        <button type="button" class="button button-settings"></button>
      </header>
      <main class="main-start">
        <div class="logo"></div>
        <div class="select-quiz">
          <button type="button" class="button button-quiz" data-quiz="artist">Artist quiz</button>
          <button type="button" class="button button-quiz" data-quiz="pictures">Pictures quiz</button>
        </div>
      </main>
      <footer class="footer footer-start">
        <a href="http://rs.school/js" class="school-logo" target="_blank"></a>
        <a href="https://github.com/NMakarevich" target="_blank">My GitHub</a>
        <span>2021</span>
      </footer>
    `
  }
}