import createElement from "./createElement";

export default class Quiz {
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
    this.container = createElement("question-screen", this.questionTemplate());
    this.eventListeners();
    this.audio = new Audio();
    this.audio.volume = this.settings.volume;
    this.audioSources = {
      true: "./assets/sounds/true.wav",
      false: "./assets/sounds/false.wav",
      finish: "./assets/sounds/finish.wav",
    };
    this.elem.addEventListener("animationend", () => this.timer());
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

  timer = () => {
    if (this.settings.time === "false") return;
    const duration = Number(this.settings.timePerAnswer);
    let time = duration;

    const timer = setInterval(() => {
      time -= 1;
      const progress = (100 * (duration - time)) / duration;

      this.timeIndicator.textContent = `0:${time >= 10 ? time : `0${time}`}`;
      this.timerProgress.style.background = `linear-gradient(to right, #ffbca2 0%, #ffbca2 ${progress}%, white ${progress}%, white 100%)`;

      if (time === 0) {
        this.userAnswers.push(false);
        this.audio.src = this.audioSources[this.userAnswers[this.questionNum]];
        this.showModalAnswer();
        this.audio.play();
        clearInterval(timer);
      }

      if (this.userAnswers.length === this.questionNum + 1)
        clearInterval(timer);

      if (this.elem.classList.contains("hide")) clearInterval(timer);
    }, 1000);
  };

  nextQuestion = () => {
    this.container.classList.add("hide");
    this.container.addEventListener(
      "animationend",
      () => {
        this.destroyModal();
        this.questionNum += 1;
        this.container.innerHTML = this.questionTemplate();
        this.container.classList.remove("hide");
        this.timer();
        this.eventListeners();
      },
      { once: true }
    );
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
      this.userAnswers.push(answer === this.levelList[this.questionNum].author);
    else
      this.userAnswers.push(
        answer === this.levelList[this.questionNum].imageNum
      );

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
            <img src="../assets/img/arts/full/${
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
  <main class="question-main">
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
            : `<img src="../assets/img/arts/squared/${item}.jpg" alt="${item}">`
        }
      </div>`
      )
      .join("\n");
  }
}
