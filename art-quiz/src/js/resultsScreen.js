import createElement from './createElement'

export default class Results {
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
    this.container = createElement("result-screen", this.resultsTemplate())
    this.eventListeners();
  }

  destroy() {
    this.container.classList.add('hide');
    this.container.addEventListener('animationend', () => this.container.remove())
  }

  destroyModal() {
    this.modal.classList.add('hide');
    this.modal.addEventListener('animationend', () => this.modal.remove())
  }

  get elem() {
    return this.container;
  }

  get answersContainer() {
    return this.container.querySelector('.answers-container')
  }

  get navList() {
    return this.container.querySelector('.nav-list')
  }

  showImageInfo = (event) => {
    const {target} = event;
    if (target.tagName !== "IMG") return;

    const targetNum = Number(target.alt);
    this.modal = createElement("modal", this.modalTemplate(targetNum));
    this.container.append(this.modal);
    this.modal.addEventListener("click", (evt) => {
      const targetBtn = evt.target;
      if(targetBtn.tagName !== "BUTTON") return;
      this.destroyModal();
    })
  }

  navigate = (event) => {
    const {target} = event;

    if (!target.classList.contains("nav-list--item")) return;

    if (target.classList.contains("home")) {
      const evt = new CustomEvent("to-start", {
        detail: this,
        bubbles: true,
      });
      this.elem.dispatchEvent(evt);
    }

    if (target.classList.contains("levels")) {
      const evt = new CustomEvent('select-quiz', {
        detail: {
          quiz: this.quiz,
          source: this
        },
        bubbles: true
      })
      this.elem.dispatchEvent(evt)
    }
  }

  createLevelList() {
    this.levelList = this.data.slice(this.level * 10, this.level * 10 + 10);
  }

  getAnswersList() {
    const answersList = JSON.parse(localStorage.getItem(`artQuiz${this.quiz}`));
    this.answers = answersList[this.level];
  }

  eventListeners() {
    this.answersContainer.addEventListener("click", this.showImageInfo);
    this.navList.addEventListener("click", this.navigate)
  }

  resultsTemplate() {
    return `
    <header class="header-levels">
        <div class="logo"></div>
    </header>
    <main>
      <h2>${this.quiz === "Artist" ? "Художники" : "Картины"}. Уровень ${this.level + 1}</h2>
      <div class="answers-container">
        ${this.levelList.map((item, index) => 
          `<img class="${this.answers[index]}" src="./assets/img/arts/squared/${item.imageNum}.jpg" alt="${index}">`
        ).join("")}
      </div>
    </main>
    <footer class="levels-footer">
      <nav class="footer-nav">
        <ul class="nav-list">
          <li class="nav-list--item home"><span>На главную</span></li>
          <li class="nav-list--item levels"><span>Уровни</span></li>
          <li class="nav-list--item results active"><span>Результаты</span></li>
        </ul>
      </nav>
    </footer>
    `
  }

  modalTemplate(index) {
    return `
    <div class="question-img">
      <img src="../assets/img/arts/full/${this.levelList[index].imageNum}full.jpg" alt="${this.levelList[index].imageNum}">
    </div>
    <div class="image-data">
      <p class="image-name">${this.levelList[index].name}</p>
      <p class="image-author">${this.levelList[index].author}</p>
      <p class="image-year">${this.levelList[index].year}</p> 
    </div>
    <button type="button" class="button button-close">Закрыть</button>
    `
  }
}