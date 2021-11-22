import createElement from "./createElement";

export default class SettingsScreen {
  constructor() {
    this.container = null;
    this.settings = null;
  }

  render() {
    this.container = createElement(
      "settings-screen",
      this.settingsScreenTemplate()
    );
    this.eventListeners();
    this.getSettings();
    this.setSettings();
    this.updateVolume();
  }

  get elem() {
    return this.container;
  }

  get backButton() {
    return this.container.querySelector(".button-back");
  }

  get timeControl() {
    return this.container.querySelector(".time-control");
  }

  get volumeButton() {
    return this.container.querySelector(".volume-button");
  }

  get volumeBar() {
    return this.container.querySelector("#volume");
  }

  get timeToggle() {
    return this.container.querySelector("#time-game");
  }

  get timePerAnswer() {
    return this.container.querySelector("#time-answer");
  }

  get settingsButtons() {
    return this.container.querySelector(".settings-buttons");
  }

  getSettings = () => {
    this.settings = JSON.parse(localStorage.getItem("artQuizSettings"));
    return this.settings;
  };

  setSettings = () => {
    this.volumeBar.value = this.settings.volume;
    this.timeToggle.checked = this.settings.time;
    this.timePerAnswer.value = this.settings.timePerAnswer;
    this.updateVolume();
  };

  saveSettings = () => {
    this.settings.volume = this.volumeBar.value;
    this.settings.time = this.timeToggle.checked;
    this.settings.timePerAnswer = this.timePerAnswer.value;
    localStorage.setItem("artQuizSettings", JSON.stringify(this.settings));
  };

  settingsDefault = () => {
    this.settings = {
      volume: 0.5,
      time: false,
      timePerAnswer: 20,
    };
    localStorage.setItem("artQuizSettings", JSON.stringify(this.settings));
    this.setSettings();
    return this.settings;
  };

  destroy() {
    this.elem.classList.add("hide");
    this.elem.addEventListener("animationend", () => this.elem.remove());
  }

  updateVolume = () => {
    this.volumeBar.style.background = `linear-gradient(to right, #FFBCA2 0%, #FFBCA2 ${
      this.volumeBar.value * 100
    }%, #A4A4A4 ${this.volumeBar.value * 100}%, #A4A4A4 100%)`;
    if (this.volumeBar.value === "0") {
      this.volumeButton.classList.remove("active");
    } else {
      this.volumeButton.classList.add("active");
    }
  };

  volumeControl = () => {
    this.volumeButton.classList.toggle("active");
    if (this.volumeButton.classList.contains("active")) {
      this.volumeBar.value = this.volumeValue;
      this.updateVolume();
    } else {
      this.volumeValue = this.volumeBar.value;
      this.volumeBar.value = 0;
      this.updateVolume();
    }
  };

  closeSettings = () => {
    const event = new CustomEvent("close-settings", {
      bubbles: true,
    });
    this.elem.dispatchEvent(event);
  };

  changeTime = (event) => {
    const { target } = event;
    const input = this.timeControl.querySelector("input");
    if (target.tagName !== "BUTTON") return;

    if (target.classList.contains("button-minus")) {
      input.stepDown();
    } else {
      input.stepUp();
    }
  };

  applySettings = (event) => {
    const { target } = event;
    if (target.tagName !== "BUTTON") return;

    if (target.classList.contains("button-default")) this.settingsDefault();
    else this.saveSettings();
  };

  eventListeners() {
    this.backButton.addEventListener("click", this.closeSettings);
    this.timeControl.addEventListener("click", this.changeTime);

    this.volumeButton.addEventListener("click", this.volumeControl);
    this.volumeBar.addEventListener("input", this.updateVolume);

    this.settingsButtons.addEventListener("click", this.applySettings);
  }

  settingsScreenTemplate() {
    return `<header class="header-settings">
    <button type="button" class="button button-back"></button>
    <span>Настройки</span>
    <span></span>
  </header>
  <main class="main-settings">
    <div class="setting-item volume">
      <h2>Громкость</h2>
      <div class="volume-control">
        <button type="button" class="button volume-button active"></button>
        <input type="range" min="0" max="1" step="0.01" name="volume" id="volume">
      </div>
    </div>
    <div class="setting-item time-game">
      <h2>Игра на время</h2>
      <label for="time-game">Вкл/Выкл<input type="checkbox" name="time-game" id="time-game"><span class="toggle"></span></label>
    </div>
    <div class="setting-item time-answer">
      <h2>Время на ответ</h2>
      <div class="time-control">
        <button type="button" class="button button-minus">−</button>
        <input type="number" min="5" max="30" step="5" value="20" name="time-answer" id="time-answer" readonly>
        <button type="button" class="button button-plus">+</button>
      </div>
    </div>
    <div class="setting-item settings-buttons">
      <button type="button" class="button button-default">По умолчанию</button>
      <button type="button" class="button button-save">Сохранить</button>
    </div>
  </main>
  <footer class="footer">
    <a href="http://rs.school/js" class="school-logo" target="_blank"></a>
    <a href="https://github.com/NMakarevich" target="_blank">My GitHub</a>
    <span>2021</span>
  </footer>`;
  }
}
