import createElement from "./createElement";

export default class SettingsScreen {
  constructor() {
    this._container = null;
  }

  render() {
    this._container = createElement('settings-screen', this.settingsScreenTemplate())
    this.eventListeners();
  }

  get elem() {
    return this._container;
  }

  get backButton() {
    return this._container.querySelector('.button-back')
  }

  get timeControl() {
    return this._container.querySelector('.time-control');
  }

  destroy() {
    this.elem.classList.add('hide');
    this.elem.addEventListener('animationend', () => this.elem.remove())
  }

  eventListeners() {
    this.backButton.addEventListener('click', () => {
      const event = new CustomEvent('close-settings', {
        bubbles: true
      });
      this.elem.dispatchEvent(event)
    })
    this.timeControl.addEventListener('click', (event) => {
      const target = event.target;
      const input = this.timeControl.querySelector('input')
      if (target.tagName !== 'BUTTON') return;

      if (target.classList.contains('button-minus')) {
        input.stepDown()
      }
      else {
        input.stepUp()
      }
    })
  }

  settingsScreenTemplate() {
    return `<header class="header-settings">
    <button type="button" class="button button-back"></button>
    <span>Settings</span>
    <span></span>
  </header>
  <main class="main-settings">
    <div class="setting-item volume">
      <h2>Volume</h2>
      <div class="volume-control">
        <button type="button" class="button volume-button"></button>
        <input type="range" min="0" max="1" value="0.5" step="0.01" name="volume" id="volume">
      </div>
    </div>
    <div class="setting-item time-game">
      <h2>Time game</h2>
      <label for="time-game">On/Off<input type="checkbox" name="time-game" id="time-game"><span class="toggle"></span></label>
    </div>
    <div class="setting-item time-answer">
      <h2>Time to answer</h2>
      <div class="time-control">
        <button type="button" class="button button-minus">−</button>
        <input type="number" min="5" max="30" step="5" value="20" name="time-answer" id="time-answer" readonly>
        <button type="button" class="button button-plus">+</button>
      </div>
    </div>
    <div class="setting-item setting-buttons">
      <button type="button" class="button button-default">Default</button>
      <button type="button" class="button button-save">Save</button>
    </div>
  </main>
  <footer class="footer footer-settings">
    <a href="http://rs.school/js" class="school-logo" target="_blank"></a>
    <a href="https://github.com/NMakarevich" target="_blank">My GitHub</a>
    <span>2021</span>
  </footer>`
  }
}