import createElement from './createElement'

export default class Quiz {
  constructor({level, quiz, data}) {
    this.level = level;
    this.quiz = quiz;
    this.data = data;
    this._container = null;
    this.levelList = [];
    this.answers = [];
    this.createLevelList();
    this.createAnsewrs();
    console.log(this.answers)
  }

  render() {

  }

  createLevelList() {
    for (let i = 0; i < 10; i++) {
        this.levelList.push(this.data[this.level * 10 + i]) 
    }
  }

  shuffleQuestions(questionSet) {
    let j, temp;
    const question = Array.from(questionSet);
    for(let i = question.length - 1; i > 0; i--) {
      j = Math.floor(Math.random()*(i + 1));
		  temp = question[j];
		  question[j] = question[i];
		  question[i] = temp;
    }
    return question
  }

  createAnsewrs() {
    for (let i = 0; i < 10; i++) {
      const questionSet = new Set();
      if (this.quiz === 'Artist') {
        questionSet.add(this.levelList[i]["author"]);
        while (questionSet.size < 4) {
          const randNum = Math.floor(Math.random() * 119);
          questionSet.add(this.data[randNum]["author"])
        }
      }
      else {
        
      }
      this.answers.push(this.shuffleQuestions(questionSet));
    }
  }
}