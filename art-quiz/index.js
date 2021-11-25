/******/ (() => {
  // webpackBootstrap
  /******/ "use strict";
  var __webpack_exports__ = {}; // CONCATENATED MODULE: ./src/js/createElement.js

  function createElement(className, html) {
    const div = document.createElement("div");
    div.classList = className;
    div.innerHTML = html;
    return div;
  } // CONCATENATED MODULE: ./src/js/levelsScreen.js

  class Levels {
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
        "screen levels-screen",
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

    get homeButtons() {
      return this.container.querySelectorAll(".home");
    }

    get levelsContainer() {
      return this.container.querySelector(".levels-container");
    }

    showScore = (evt) => {
      const { target } = evt;
      if (!target.classList.contains("level-score")) return;
      const event = new CustomEvent("show-results", {
        detail: {
          level: Number(target.closest(".level-card").dataset.level),
          quiz: this.quiz,
          data: this.data,
        },
        bubbles: true,
      });

      this.elem.dispatchEvent(event);
    };

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
      if (
        !target.closest(".level-card") ||
        target.classList.contains("level-score")
      )
        return;
      const evt = new CustomEvent("run-quiz", {
        detail: {
          level: Number(target.closest(".level-card").dataset.level),
          quiz: this.quiz,
          data: this.data,
          source: this,
        },
        bubbles: true,
      });
      this.elem.dispatchEvent(evt);
    };

    eventListeners() {
      this.homeButtons.forEach((button) =>
        button.addEventListener("click", this.goToStartScreen)
      );
      this.settingsButton.addEventListener("click", this.openSettings);
      this.levelsContainer.addEventListener("click", this.runLevel, {
        once: true,
      });
      this.levelsContainer.addEventListener("click", this.showScore);
    }

    levelsTemplate(levelsNumber) {
      return `
    <header class="header-levels">
        <div class="logo"></div>
        <ul class="nav-list">
            <li class="nav-list--item home"><span>На главную</span></li>
            <li class="nav-list--item levels active"><span>Уровни</span></li>
            <li class="nav-list--item results"><span>Результаты</span></li>
        </ul>
        <button type="button" class="button button-settings"></button>
      </header>
      <main class="main main-levels">
        <h2>${this.quiz === "Artist" ? "Художники" : "Картины"}</h2>
        <div class="levels-container">
          ${this.cardTemplate(levelsNumber)}
        </div>
      </main>
      <footer class="footer-levels">
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
  } // CONCATENATED MODULE: ./src/js/quiz.js

  class Quiz {
    constructor({ level, quiz, data }) {
      this.level = level;
      this.quiz = quiz;
      this.data = data;
      this.container = null;
      this.modal = null;
      this.levelList = [];
      this.answersList = [];
      this.userAnswers = [];
      this.questionNum = 0;
      this.render();
    }

    render() {
      this.createLevelList();
      this.createAnsewrsList();
      this.getSettings();
      this.createModalsTemplates();
      this.container = createElement(
        "screen question-screen",
        this.questionTemplate()
      );
      this.eventListeners();
      this.audio = new Audio();
      this.audio.volume = this.settings.volume;
      this.audioSources = {
        true: "./assets/sounds/true.wav",
        false: "./assets/sounds/false.wav",
        finish: "./assets/sounds/finish.wav",
      };
      this.roundTimer();
    }

    destroy() {
      this.elem.classList.add("hide");
      this.elem.addEventListener("animationend", () => this.elem.remove());
    }

    get elem() {
      return this.container;
    }

    get timerProgress() {
      return this.container.querySelector(".progress");
    }

    get timeIndicator() {
      return this.container.querySelector(".time");
    }

    get closeButton() {
      return this.container.querySelector(".button-close");
    }

    get answers() {
      return this.container.querySelector(".answers");
    }

    get answersProgress() {
      return this.container.querySelectorAll(".answers-progress li");
    }

    renderModal({ name, template }) {
      this.modal = createElement(name, template);
      this.container.append(this.modal);
      this.modal.addEventListener("click", this.modalClick);
    }

    destroyModal() {
      this.modal.classList.add("hide");
      this.modal.addEventListener("animationend", () => this.modal.remove());
    }

    getSettings = () => {
      this.settings = JSON.parse(localStorage.getItem("artQuizSettings"));
    };

    createLevelList() {
      this.levelList = this.data.slice(this.level * 10, this.level * 10 + 10);
    }

    updateProgress() {
      this.userAnswers.forEach((item, index) => {
        this.answersProgress[index].classList.add(item);
      });
    }

    roundTimer() {
      if (!this.settings.time) return;
      const duration = Number(this.settings.timePerAnswer);
      let time = duration + 1;

      this.timer = setInterval(() => {
        if (this.userAnswers.length === this.questionNum + 1) {
          clearInterval(this.timer);
          return;
        }

        if (this.container.classList.contains("hide")) {
          clearInterval(this.timer);
          return;
        }

        time -= 1;
        const progress = (100 * (duration - time)) / duration;

        this.timeIndicator.textContent = `0:${time >= 10 ? time : `0${time}`}`;
        this.timerProgress.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${progress}%, white ${progress}%, white 100%)`;

        if (time <= 0) {
          clearInterval(this.timer);
          this.userAnswers.push(false);
          this.updateProgress();
          this.audio.src =
            this.audioSources[this.userAnswers[this.questionNum]];
          this.showModalAnswer();
          this.audio.play();
        }
      }, 1000);
    }

    nextQuestion = () => {
      this.container.classList.add("hide");
      this.container.addEventListener(
        "animationend",
        () => {
          this.destroyModal();
          this.questionNum += 1;
          this.container.innerHTML = this.questionTemplate();
          this.updateProgress();
          this.container.classList.remove("hide");
          this.eventListeners();
        },
        { once: true }
      );
      this.roundTimer();
    };

    selectAnswer = (event) => {
      const { target } = event;
      if (
        !target.classList.contains("answer") ||
        this.container.querySelector(".modal")
      )
        return;

      const { answer } = target.dataset;
      if (this.quiz === "Artist")
        this.userAnswers.push(
          answer === this.levelList[this.questionNum].author
        );
      else
        this.userAnswers.push(
          answer === this.levelList[this.questionNum].imageNum
        );

      this.updateProgress();

      this.audio.src = this.audioSources[this.userAnswers[this.questionNum]];

      this.showModalAnswer();
      this.audio.play();
    };

    showModalClose = () => {
      if (this.container.querySelector(".modal")) return;
      this.renderModal(this.modalsTemplates.modalClose);
    };

    showModalAnswer = () => {
      this.createModalsTemplates();
      this.renderModal(this.modalsTemplates.modalAnswer);
      this.modal
        .querySelector(".user-answer")
        .classList.add(this.userAnswers[this.questionNum]);
    };

    showModalResult = () => {
      this.destroyModal();
      this.createModalsTemplates();
      setTimeout(() => {
        this.renderModal(this.modalsTemplates.modalResults);
        this.audio.src = this.audioSources.finish;
        this.audio.play();
      }, 500);
      this.writeResultsToLS();
    };

    writeResultsToLS() {
      const LSResults = JSON.parse(localStorage.getItem(`artQuiz${this.quiz}`));
      LSResults[this.level] = this.userAnswers;
      localStorage.setItem(`artQuiz${this.quiz}`, JSON.stringify(LSResults));
    }

    toLevels = () => {
      const evt = new CustomEvent("select-quiz", {
        detail: {
          quiz: this.quiz,
          source: this,
        },
        bubbles: true,
      });
      this.elem.dispatchEvent(evt);
    };

    modalClick = (event) => {
      const { target } = event;
      if (target.tagName !== "BUTTON") return;
      if (target.classList.contains("button-cancel")) this.destroyModal();
      if (target.classList.contains("button-exit")) this.toLevels();

      if (target.classList.contains("button-next")) this.nextQuestion();
      if (target.classList.contains("button-results")) this.showModalResult();
    };

    eventListeners() {
      this.closeButton.addEventListener("click", this.showModalClose);
      this.answers.addEventListener("click", this.selectAnswer);
    }

    createAnsewrsList() {
      for (let i = 0; i < 10; i += 1) {
        const answers = [];
        if (this.quiz === "Artist") {
          answers.push(this.levelList[i].author);
          while (answers.length < 4) {
            const randNum = Math.round(Math.random() * (this.data.length - 1));
            if (!answers.includes(this.data[randNum].author))
              answers.push(this.data[randNum].author);
          }
        } else {
          const tmpArr = [];
          tmpArr.push(this.levelList[i].author);
          answers.push(this.levelList[i].imageNum);
          while (answers.length < 4) {
            const randNum = Math.round(Math.random() * (this.data.length - 1));
            if (!tmpArr.includes(this.data[randNum].author)) {
              tmpArr.push(this.data[randNum].author);
              answers.push(this.data[randNum].imageNum);
            }
          }
        }

        let j;
        let temp;
        for (let k = answers.length - 1; k > 0; k -= 1) {
          j = Math.floor(Math.random() * (k + 1));
          temp = answers[j];
          answers[j] = answers[k];
          answers[k] = temp;
        }
        this.answersList.push(answers);
      }
    }

    createModalsTemplates() {
      this.modalsTemplates = {
        modalClose: {
          name: "modal modal-close",
          template: `
          <p>Вы точно хотите завершить игру?</p>
          <div class="buttons modal-buttons">
            <button type="button" class="button button-cancel">Отмена</button>
            <button type="button" class="button button-exit">Завершить</button>
          </div>
        `,
        },
        modalAnswer: {
          name: "modal modal-answer",
          template: `
          <div class="question-img">
            <div class="user-answer"></div>
            <img src="./assets/img/arts/full/${
              this.levelList[this.questionNum].imageNum
            }full.jpg" alt="${this.levelList[this.questionNum].imageNum}">
          </div>
          <div class="image-data">
            <p class="image-name">${this.levelList[this.questionNum].name}</p>
            <p class="image-author">${
              this.levelList[this.questionNum].author
            }</p>
            <p class="image-year">${this.levelList[this.questionNum].year}</p> 
          </div>
          <button type="button" class="button ${
            this.questionNum !== 9 ? "button-next" : "button-results"
          }">
            ${this.questionNum !== 9 ? "Далее" : "Результат"}
          </button>
        `,
        },
        modalResults: {
          name: "modal modal-results",
          template: `
          <div class="results">${
            this.userAnswers.filter((item) => item).length
          }/10</div>
          <button type="button" class="button button-exit">К уровням</button>
        `,
        },
      };
    }

    questionTemplate() {
      const question = {
        Artist: `Кто автор картины "<span class="painting-name">${
          this.levelList[this.questionNum].name
        }</span>"?`,
        Pictures: `Какую картину написал <span class="artist-name">${
          this.levelList[this.questionNum].author
        }</span>?`,
      };
      const time = this.settings.timePerAnswer;
      const html = `<header class="question-header">
    <button type="button" class="button button-close"></button>
    <div class="timer ${this.settings.time ? "" : "hidden"}">
      <div class="progress"></div>
      <div class="time">0:${time >= 10 ? time : `0${time}`}</div>
    </div>
  </header>
  <main class="main main-question">
    <p class="question">${question[this.quiz]}</p>
    <div class="question-img ${this.quiz === "Artist" ? "" : "hidden"}">
      ${
        this.quiz === "Artist"
          ? `<img src="./assets/img/arts/full/${
              this.levelList[this.questionNum].imageNum
            }full.jpg" alt="${this.levelList[this.questionNum].imageNum}">`
          : ""
      }
    </div>
    <ul class="answers-progress">
      ${this.levelList.map(() => `<li></li>`).join("")}
    </ul>
    <div class="answers">
      ${this.answersTemplate()}
    </div>
  </main>
  <footer class="footer">
    <a href="http://rs.school/js" class="school-logo" target="_blank"></a>
    <a href="https://github.com/NMakarevich" target="_blank">My GitHub</a>
    <span>2021</span>
  </footer>`;
      return html;
    }

    answersTemplate() {
      return this.answersList[this.questionNum]
        .map(
          (item) => `<div class="answer ${
            this.quiz === "Artist" ? "artist" : ""
          }" data-answer="${item}">
        ${
          this.quiz === "Artist"
            ? item
            : `<img src="./assets/img/arts/squared/${item}.jpg" alt="${item}">`
        }
      </div>`
        )
        .join("\n");
    }
  } // CONCATENATED MODULE: ./src/js/resultsScreen.js

  class Results {
    constructor({ level, quiz, data }) {
      this.level = level;
      this.quiz = quiz;
      this.data = data;
      this.container = null;
      this.levelList = [];
      this.answers = [];
      this.render();
    }

    render() {
      this.createLevelList();
      this.getAnswersList();
      this.container = createElement(
        "screen result-screen",
        this.resultsTemplate()
      );
      this.eventListeners();
    }

    destroy() {
      this.container.classList.add("hide");
      this.container.addEventListener("animationend", () =>
        this.container.remove()
      );
    }

    destroyModal() {
      this.modal.classList.add("hide");
      this.modal.addEventListener("animationend", () => this.modal.remove());
    }

    get elem() {
      return this.container;
    }

    get answersContainer() {
      return this.container.querySelector(".answers-container");
    }

    get navLists() {
      return this.container.querySelectorAll(".nav-list");
    }

    showImageInfo = (event) => {
      const { target } = event;
      if (target.tagName !== "IMG") return;

      const targetNum = Number(target.alt);
      this.modal = createElement("modal", this.modalTemplate(targetNum));
      this.container.append(this.modal);
      this.modal.addEventListener("click", (evt) => {
        const targetBtn = evt.target;
        if (targetBtn.tagName !== "BUTTON") return;
        this.destroyModal();
      });
    };

    navigate = (event) => {
      const { target } = event;

      if (!target.classList.contains("nav-list--item")) return;

      if (target.classList.contains("home")) {
        const evt = new CustomEvent("to-start", {
          detail: this,
          bubbles: true,
        });
        this.elem.dispatchEvent(evt);
      }

      if (target.classList.contains("levels")) {
        const evt = new CustomEvent("select-quiz", {
          detail: {
            quiz: this.quiz,
            source: this,
          },
          bubbles: true,
        });
        this.elem.dispatchEvent(evt);
      }
    };

    createLevelList() {
      this.levelList = this.data.slice(this.level * 10, this.level * 10 + 10);
    }

    getAnswersList() {
      const answersList = JSON.parse(
        localStorage.getItem(`artQuiz${this.quiz}`)
      );
      this.answers = answersList[this.level];
    }

    eventListeners() {
      this.answersContainer.addEventListener("click", this.showImageInfo);
      this.navLists.forEach((navList) =>
        navList.addEventListener("click", this.navigate)
      );
    }

    resultsTemplate() {
      return `
    <header class="header-levels">
        <div class="logo"></div>
        <ul class="nav-list">
            <li class="nav-list--item home"><span>На главную</span></li>
            <li class="nav-list--item levels"><span>Уровни</span></li>
            <li class="nav-list--item results active"><span>Результаты</span></li>
        </ul>
    </header>
    <main class="main main-results">
      <h2>${this.quiz === "Artist" ? "Художники" : "Картины"}. Уровень ${
        this.level + 1
      }</h2>
      <div class="answers-container">
        ${this.levelList
          .map(
            (item, index) =>
              `<img class="${this.answers[index]}" src="./assets/img/arts/squared/${item.imageNum}.jpg" alt="${index}">`
          )
          .join("")}
      </div>
    </main>
    <footer class="footer-levels">
      <nav class="footer-nav">
        <ul class="nav-list">
          <li class="nav-list--item home"><span>На главную</span></li>
          <li class="nav-list--item levels"><span>Уровни</span></li>
          <li class="nav-list--item results active"><span>Результаты</span></li>
        </ul>
      </nav>
    </footer>
    `;
    }

    modalTemplate(index) {
      return `
    <div class="question-img">
      <img src="./assets/img/arts/full/${this.levelList[index].imageNum}full.jpg" alt="${this.levelList[index].imageNum}">
    </div>
    <div class="image-data">
      <p class="image-name">${this.levelList[index].name}</p>
      <p class="image-author">${this.levelList[index].author}</p>
      <p class="image-year">${this.levelList[index].year}</p> 
    </div>
    <button type="button" class="button button-close">Закрыть</button>
    `;
    }
  } // CONCATENATED MODULE: ./src/js/settingsScreen.js

  class SettingsScreen {
    constructor() {
      this.container = null;
      this.settings = null;
    }

    render() {
      this.getSettings();
      this.container = createElement(
        "screen settings-screen",
        this.settingsScreenTemplate()
      );
      this.eventListeners();
      this.timeToggle.checked = this.settings.time;
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
  <main class="main main-settings">
    <div class="setting-item volume">
      <h2>Громкость</h2>
      <div class="volume-control">
        <button type="button" class="button volume-button active"></button>
        <input type="range" min="0" max="1" step="0.01" value="${this.settings.volume}" name="volume" id="volume">
      </div>
    </div>
    <div class="setting-item time-game">
      <h2>Игра на время</h2>
      <label for="time-game">Вкл/Выкл<input type="checkbox" name="time-game" id="time-game">
        <span class="toggle"></span>
      </label>
    </div>
    <div class="setting-item time-answer">
      <h2>Время на ответ</h2>
      <div class="time-control">
        <button type="button" class="button button-minus">−</button>
        <input type="number" min="5" max="30" step="5" value="${this.settings.timePerAnswer}" name="time-answer" id="time-answer" readonly>
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
  } // CONCATENATED MODULE: ./src/js/startScreen.js

  class StartScreen {
    constructor() {
      this.container = null;

      this.render();
    }

    get elem() {
      return this.container;
    }

    get settingsButton() {
      return this.container.querySelector(".button-settings");
    }

    get quizButtons() {
      return this.container.querySelector(".select-quiz");
    }

    render() {
      this.container = createElement(
        "screen start-screen",
        this.startScreenTemplate()
      );
      this.getSettings();
      this.eventListeners();
    }

    destroy() {
      this.elem.classList.add("hide");
      this.elem.addEventListener("animationend", () => this.elem.remove());
    }

    selectQuiz = (event) => {
      const { target } = event;
      if (!target.dataset.quiz) return;
      const evt = new CustomEvent("select-quiz", {
        detail: {
          quiz: target.dataset.quiz,
          source: this,
        },
        bubbles: true,
      });

      this.elem.dispatchEvent(evt);
    };

    getSettings = () => {
      this.settings =
        JSON.parse(localStorage.getItem("artQuizSettings")) ||
        this.settingsDefault();
    };

    settingsDefault = () => {
      this.settings = {
        volume: 0.5,
        time: false,
        timePerAnswer: 20,
      };
      localStorage.setItem("artQuizSettings", JSON.stringify(this.settings));
    };

    openSettings = () => {
      const event = new CustomEvent("open-settings", {
        detail: this,
        bubbles: true,
      });
      this.elem.dispatchEvent(event);
    };

    eventListeners() {
      this.settingsButton.addEventListener("click", this.openSettings);

      this.quizButtons.addEventListener("click", this.selectQuiz);
    }

    startScreenTemplate() {
      return `
    <header class="header-start">
        <button type="button" class="button button-settings"></button>
      </header>
      <main class="main main-start">
        <div class="logo"></div>
        <div class="select-quiz">
          <button type="button" class="button button-quiz" data-quiz="Artist">Художники</button>
          <button type="button" class="button button-quiz" data-quiz="Pictures">Картины</button>
        </div>
      </main>
      <footer class="footer footer-start">
        <a href="http://rs.school/js" class="school-logo" target="_blank"></a>
        <a href="https://github.com/NMakarevich" target="_blank">My GitHub</a>
        <span>2021</span>
      </footer>
    `;
    }
  } // CONCATENATED MODULE: ./src/index.js

  const container = document.querySelector(".container");

  const startScreen = new StartScreen();
  const settingsScreen = new SettingsScreen();
  let levels;
  container.append(startScreen.elem);

  let settingsSource;

  document.addEventListener("open-settings", (event) => {
    settingsScreen.render();
    settingsSource = event.detail;
    settingsSource.destroy();
    settingsSource.elem.addEventListener("animationend", () =>
      container.append(settingsScreen.elem)
    );
  });

  document.addEventListener("close-settings", () => {
    settingsSource.render();
    settingsScreen.destroy();
    settingsScreen.elem.addEventListener("animationend", () =>
      container.append(settingsSource.elem)
    );
  });

  document.addEventListener("select-quiz", async (event) => {
    levels = new Levels(event.detail.quiz);
    await levels.render();
    event.detail.source.destroy();
    event.detail.source.elem.addEventListener("animationend", () =>
      container.append(levels.elem)
    );
  });

  document.addEventListener("to-start", (event) => {
    startScreen.render();
    event.detail.destroy();
    event.detail.elem.addEventListener("animationend", () =>
      container.append(startScreen.elem)
    );
  });

  document.addEventListener("run-quiz", (event) => {
    const quiz = new Quiz(event.detail);
    event.detail.source.destroy();
    event.detail.source.elem.addEventListener("animationend", () =>
      container.append(quiz.elem)
    );
  });

  document.addEventListener("show-results", (event) => {
    const results = new Results(event.detail);
    levels.destroy();
    levels.elem.addEventListener("animationend", () =>
      container.append(results.elem)
    );
  });

  /******/
})();
