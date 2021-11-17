import createElement from './createElement'

export default class Quiz {
  constructor({level, quiz, data}) {
    this.level = level;
    this.quiz = quiz;
    this.data = data;
    this.container = null;
    this.levelList = [];
    this.answersList = [];
    this.questionNum = 0;
    this.render();
  }

  render() {
    this.createLevelList();
    this.createAnsewrsList();
    this.getSettings();
    this.container = createElement('question-screen', this.questionTemplate());
  }

  get elem() {
    return this.container;
  }

  getSettings = () => {
    this.settings = JSON.parse(localStorage.getItem('artQuizSettings'));
  }

  createLevelList() {
    this.levelList = this.data.slice(this.level * 10, this.level * 10 + 10)
  }

  nextQuestion() {
    this.container.classList.add('hide');
    this.questionNum += 1;
  }

  createAnsewrsList() {
    for (let i = 0; i < 10; i += 1) {
      const answers = [];
      if (this.quiz === 'Artist') {
        answers.push(this.levelList[i].author);
        while (answers.length < 4) {
          const randNum = Math.round(Math.random() * (this.data.length - 1));
          if (!answers.includes(this.data[randNum].author)) answers.push(this.data[randNum].author)
        }
      }
      else {
        const tmpArr = [];
        tmpArr.push(this.levelList[i].author)
        answers.push(this.levelList[i].imageNum)
        while (answers.length < 4) {
          const randNum = Math.round(Math.random() * (this.data.length - 1));
          if (!tmpArr.includes(this.data[randNum].author)) {
            tmpArr.push(this.data[randNum].author);
            answers.push(this.data[randNum].imageNum)
          }
        }
      }

      let j;
      let temp;
      for (let k = answers.length - 1; k > 0; k -= 1) {
      j = Math.floor(Math.random()*(k + 1));
		  temp = answers[j];
		  answers[j] = answers[k];
		  answers[k] = temp;
    }
      this.answersList.push(answers);
    }
  }

  questionTemplate() {
    const question = {
      Artist: `Кто автор картины "<span class="painting-name">${this.levelList[this.questionNum].name}</span>"?`,
      Pictures: `Какую картину написал <span class="artist-name">${this.levelList[this.questionNum].author}</span>?`
    }
    const html = `<header class="question-header">
    <button type="button" class="button button-close"></button>
    <div class="timer ${this.settings.time ? '' : 'hidden'}">
      <div class="progress"></div>
      <div class="time">0:30</div>
    </div>
  </header>
  <main class="question-main">
    <p class="question">${question[this.quiz]}</p>
    <div class="question-img ${this.quiz === 'Artist' ? '' : 'hidden'}">
      ${this.quiz === 'Artist' ? 
        `<img src="../assets/img/arts/full/${this.levelList[this.questionNum].imageNum}full.jpg" alt="${this.levelList[this.questionNum].imageNum}">` :
        ''
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
  </footer>`
  return html;
  }

  answersTemplate() {
    return this.answersList[0]
      .map(item => `<div class="answer ${this.quiz === 'Artist' ? 'artist' : ''}" data-answer="${item}">
        ${this.quiz === 'Artist' ? item : `<img src="../assets/img/arts/squared/${item}.jpg" alt="${item}">`}
      </div>`)
      .join('\n')
  }
}