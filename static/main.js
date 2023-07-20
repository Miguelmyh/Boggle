const form = document.querySelector(".submit-form");
const start_btn = document.querySelector("#start-btn");

class BoggleGame {
  constructor(boardId, secs = 60) {
    this.secs = secs; // game length
    this.showTimer();
    this.score = 0;
    this.words = new Set();
    this.board = "#" + boardId;

    // every 1000 msec, "tick
    this.timer = start_btn.addEventListener(
      "click",
      this.handleStart.bind(this)
    ); //tick
    form.addEventListener("submit", this.handleSubmit.bind(this));

    // catch the board based on the id this.board = boardId;
  }
  /* show word in list of words */

  async handleSubmit(evt) {
    evt.preventDefault();

    let input = document.querySelector(".word");
    let word = input.value;
    console.log(word);

    if (this.words.has(word)) {
      this.showMsg(`already added ${word}`, "err");
      return;
    }

    const resp = await axios.get("/check", { params: { word: word } });
    if (resp.data.result === "not-word") {
      this.showMsg("Error: not a valid word", "err");
    } else if (resp.data.result === "not-on-board") {
      this.showMsg("Error: not on board", "err");
    } else {
      this.score += word.length;
      document.querySelector(".score").textContent = this.score;
      this.secs += word.length;
      this.words.add(word);
      this.showMsg(`Added ${word}. +${word.length}`, "ok");
    }
  }

  showTimer() {
    let time = document.querySelector(".time");

    time.innerHTML = this.secs;
  }

  showMsg(msg, cls) {
    let txt = document.querySelector(".msg");
    txt.innerHTML = msg;
    txt.className = "msg";
    txt.classList.add(cls);
    setTimeout(() => {
      txt.innerHTML = "";
    }, 1000);
  }

  handleStart(evt) {
    this.showHiddenItems();
    if (evt.target.classList.contains("clicked")) {
      return;
    } else {
      evt.target.classList.toggle("clicked");
      console.log(evt.target);
      this.timer = setInterval(this.tick.bind(this), 1000);
    }
  }

  showHiddenItems() {
    let timer = document.querySelector(".timer");
    let score = document.querySelector(".scorer");
    score.classList.remove("hidden");
    timer.classList.remove("hidden");
  }
  // timer starts when the start button is deployed
  // tick "function" is called inside the timer

  async tick() {
    this.secs -= 1;
    this.showTimer();

    if (this.secs <= 0) {
      clearInterval(this.timer);
      await this.scoreGame();
    }
    //show timer
    console.log("Tick: " + this.secs);
  }

  // scoreGame should post the scores to the server and save the value as highscore

  async scoreGame() {
    form.classList.add("hidden");
    //submit highscore and times played
    const resp = await axios.post("/post-score", { score: this.score });
    console.log(resp);
    if (resp.data.brokeRecord) {
      this.showMsg(`new record:  ${this.score}`, "ok");
    } else {
      this.showMsg(`score: ${this.score}`, "ok");
    }
  }
}
