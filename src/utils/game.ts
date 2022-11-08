import QuestionPad from './questionPad';
import { EventBus } from './eventBus';

type GameConfig = {
  cityData: any[];
  blood: number;
}

class Game {
  cityData: any[];
  usedTime: number;
  finishedPercent: number;
  finishedCount: number;
  initialDataSize: number;
  blood: number;
  currentCity: any;
  questionPad: QuestionPad;
  lostCities: any[];
  timerId: number;
  

  constructor(config: GameConfig) {
    this.usedTime = 0;
    const {
      cityData,
      blood,
    } = config;
    // slice if cityData is too long for testing
    this.cityData = cityData.slice(0,5);
    // this.cityData = cityData;
    this.blood = blood;
    this.finishedPercent = 0;
    this.finishedCount = 0;
    this.initialDataSize = cityData.length;
    this.currentCity = null;
    this.lostCities = [];
    this.timerId = 0;
    this.questionPad = new QuestionPad({
      removingTime: 300,
      addingTime: 300,
      gapTime: 100,
      answerDisplayTime: 600,
    });
  }

  play() {
    // 1. render scratches
    console.log('game start');
    EventBus.$emit('renderScratches', () => {
      // the following code will be executed after scratches are rendered
      // 2. add first question
      console.log('loading first question');
      this.currentCity = this.getNextCurrentCityCandidate();
      this.questionPad.addOneQuestion(this.currentCity);
      // 3. start timer
      this.startTimer();
    });
  }

  startTimer() {
    this.timerId = setInterval(() => {
      this.usedTime += 1;
    }, 1000);
  }

  selectAnswer(answer: string) {
    this.questionPad.allowClicking = false;
    this.judgeAnswer(answer);
  }

  judgeAnswer(answer: string) {
    if (answer === this.currentCity.name_chn) {
      this.ifAnswerCorrect();
    } else {
      this.ifAnswerWrong();
    }
  }

  ifAnswerCorrect() {
    // 1. display answer on the pad
    this.questionPad.displayAnswer();
    // 2. scratch off of the correspond city
    EventBus.$emit('scratchOff', this.currentCity.id);
    // 3. update finishedCount
    this.finishedCount += 1;
    // 4. update finishedPercent
    this.finishedPercent = this.getFinishedPercent();
    // 4. check if win
    if (this.checkIfWin()) {
      this.gameWin();
    } else {
      // 5.if not win, add a new question
      this.updateCurrentCity();
    }
  }

  ifAnswerWrong() {
    // 1.display answer on the pad
    this.questionPad.displayAnswer();
    // 2.blood - 1
    this.blood -= 1;
    // 3.scratch down
    EventBus.$emit('scratchDown', this.currentCity.id);
    // 4.add to lostCities
    this.lostCities.push(this.currentCity);
    // 5.check if game over
    if (this.checkIfLost()) {
      // 6.if game over, game over
      this.gameOver();
    } else {
      // 6.if not game over, push current city back to the dataQueue.
      this.cityData.push(this.currentCity);
      // 7.if not game over, add a new question
      this.updateCurrentCity();
    }
  }

  async updateCurrentCity() {
    // 1. get nextCurrentCityCandidate
    const nextCurrentCity = this.getNextCurrentCityCandidate();
    await this.questionPad.displayAnswer();
    this.questionPad.removeAndAddQuestion(nextCurrentCity);
    this.currentCity = nextCurrentCity;

  }

  getFinishedPercent() {
    return Math.round((this.finishedCount / this.initialDataSize) * 100);
  }

  getNextCurrentCityCandidate() {
    const nextCurrentCityCandidate = this.cityData.shift();
    console.log('getNextCurrentCityCandidate', nextCurrentCityCandidate);
    console.log('this.cityData.shift()', this.cityData);
    return nextCurrentCityCandidate;
  }

  checkIfWin() {
    return this.cityData.length === 0;
  }

  checkIfLost() {
    return this.blood === 0;
  }

  gameOver() {
    console.log('game over');
    // 1.display lost window
    this.questionPad.changeLostWindowDisplay(true);
    // 2.stop timer
    clearInterval(this.timerId);
    // 3.hide question pad
    this.questionPad.displayingQuestionPad = false;
  }

  gameWin() {
    // 1.display win window
    this.questionPad.changeWinWindowDisplay(true);
    // 2.stop timer
    clearInterval(this.timerId);
    // 3.display confetti
    this.questionPad.displayingConfetti = true;
    // 4.hide question pad
    this.questionPad.displayingQuestionPad = false;
  }

  destroyGame() {
    this.questionPad.displayingConfetti = false;
    // clearInterval(this.timerId);
    // console.log('game destroyed', this.questionPad);
  }


}

export default Game;




