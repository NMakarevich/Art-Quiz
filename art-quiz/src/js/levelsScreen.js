import createElement from "./createElement";

export default class Levels {
  constructor(quiz) {
    this.quiz = quiz;
    this.container = null;
    this.data = null;
    this.levelsNumber = 0;
    this.playedLevels = null;
  }

  async render() {
    await this.getDataList();
    this.getLocalStorageData();
    this.container = createElement(
      "levels-screen",
      this.levelsTemplate(this.levelsNumber)
    );
    this.eventListeners();
  }

  get elem() {
    return this.container;
  }

  destroy() {
    this.elem.classList.add("hide");
    this.elem.addEventListener("animationend", () => this.elem.remove());
  }

  getLocalStorageData() {
    this.playedLevels =
      JSON.parse(localStorage.getItem(`artQuiz${this.quiz}`)) ||
      this.defaultLocalStorage();
  }

  defaultLocalStorage() {
    const levels = new Array(this.levelsNumber);
    levels.fill(null);
    localStorage.setItem(`artQuiz${this.quiz}`, JSON.stringify(levels));
    return levels;
  }

  async getDataList() {
    const res = await fetch("./json/images.json");
    const data = await res.json();
    const dataLength = Math.floor(data.length / 2);
    this.levelsNumber = Math.floor(dataLength / 10);
    this.data =
      this.quiz === "Artist"
        ? data.slice(0, dataLength)
        : data.slice(dataLength, dataLength * 2);
  }

  get settingsButton() {
    return this.container.querySelector(".button-settings");
  }

  get homeButton() {
    return this.container.querySelector(".home");
  }

  get levelsContainer() {
    return this.container.querySelector(".levels-container");
  }
  
  showScore = (evt) => {
    const {target} = evt;
    if (!target.classList.contains('level-score')) return;
    const event = new CustomEvent('show-results', {
      detail: {
        level: Number(target.closest(".level-card").dataset.level),
        quiz: this.quiz,
        data: this.data
      },
      bubbles: true
    })

    this.elem.dispatchEvent(event)
  }

  goToStartScreen = () => {
    const event = new CustomEvent("to-start", {
      detail: this,
      bubbles: true,
    });
    this.elem.dispatchEvent(event);
  };

  openSettings = () => {
    const event = new CustomEvent("open-settings", {
      detail: this,
      bubbles: true,
    });
    this.elem.dispatchEvent(event);
  };

  runLevel = (event) => {
    const { target } = event;
    if (!target.closest(".level-card") || target.classList.contains('level-score')) return;
    const evt = new CustomEvent("run-quiz", {
      detail: {
        level: Number(target.closest(".level-card").dataset.level),
        quiz: this.quiz,
        data: this.data,
        source: this
      },
      bubbles: true,
    });
    this.elem.dispatchEvent(evt);
  };

  eventListeners() {
    this.settingsButton.addEventListener("click", this.openSettings);
    this.homeButton.addEventListener("click", this.goToStartScreen);
    this.levelsContainer.addEventListener("click", this.runLevel);
    this.levelsContainer.addEventListener("click", this.showScore)
  }

  levelsTemplate(levelsNumber) {
    return `
    <header class="header-levels">
        <div class="logo"></div>
        <button type="button" class="button button-settings"></button>
      </header>
      <main class="main-levels">
        <h2>${this.quiz === "Artist" ? "Художники" : "Картины"}</h2>
        <div class="levels-container">
          ${this.cardTemplate(levelsNumber)}
        </div>
      </main>
      <footer class="levels-footer">
        <nav class="footer-nav">
          <ul class="nav-list">
            <li class="nav-list--item home"><span>На главную</span></li>
            <li class="nav-list--item levels active"><span>Уровни</span></li>
            <li class="nav-list--item results"><span>Результаты</span></li>
          </ul>
        </nav>
      </footer>
    `;
  }

  cardTemplate(levelsNumber) {
    let html = "";
    const startNum = this.quiz === "Artist" ? 0 : 120;
    for (let i = 0; i < levelsNumber; i += 1) {
      html += `<div class="level-card ${
        this.playedLevels[i] == null ? "not-played" : ""
      }" data-level="${i}">
      <header class="card-header">
        <span class="level-number">Уровень ${i + 1}</span>
        <span class="level-score">${
          this.playedLevels[i] == null
            ? 0
            : this.playedLevels[i].filter((item) => item).length
        }/10</span>
      </header>
      <img class="card-image" src="./assets/img/arts/squared/${
        i * 10 + startNum
      }.jpg">
    </div>`;
    }
    return html;
  }
}
