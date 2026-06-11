const loveValue = document.getElementById("loveValue");
const loveBar = document.getElementById("loveBar");
const studyValue = document.getElementById("studyValue");
const exerciseValue = document.getElementById("exerciseValue");
const senseValue = document.getElementById("senseValue");
const sincerityValue = document.getElementById("sincerityValue");
const responsibilityValue = document.getElementById("responsibilityValue");
const familyValue = document.getElementById("familyValue");

const stageText = document.getElementById("stageText");
const dayText = document.getElementById("dayText");
const relationText = document.getElementById("relationText");
const speech = document.getElementById("speech");

const missionTitle = document.getElementById("missionTitle");
const missionDesc = document.getElementById("missionDesc");
const missionBox = document.getElementById("missionBox");

const logList = document.getElementById("logList");

const resetBtn = document.getElementById("resetBtn");
const confessBtn = document.getElementById("confessBtn");
const relationshipBtn = document.getElementById("relationshipBtn");
const proposeBtn = document.getElementById("proposeBtn");
const familyBtn = document.getElementById("familyBtn");

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const restartBtn = document.getElementById("restartBtn");

const actionButtons = document.querySelectorAll(".action-btn");

let activeTimer = null;
let activeAnimation = null;

let game = {
  day: 1,
  stage: "썸",
  love: 30,
  study: 10,
  exercise: 10,
  sense: 10,
  sincerity: 10,
  responsibility: 0,
  family: 0,
  ended: false,
  logs: ["DAY 1: 소개팅이 시작됐다."]
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function stopRunningMission() {
  if (activeTimer) {
    clearInterval(activeTimer);
    clearTimeout(activeTimer);
    activeTimer = null;
  }

  if (activeAnimation) {
    cancelAnimationFrame(activeAnimation);
    activeAnimation = null;
  }
}

function saveGame() {
  localStorage.setItem("touchDatingMissionGame", JSON.stringify(game));
}

function loadGame() {
  const saved = localStorage.getItem("touchDatingMissionGame");

  if (saved) {
    game = JSON.parse(saved);
  }
}

function addLog(text) {
  game.logs.unshift(`DAY ${game.day}: ${text}`);

  if (game.logs.length > 7) {
    game.logs.pop();
  }
}

function clearMission() {
  stopRunningMission();
  missionBox.innerHTML = "";
}

function applyEffect(effect) {
  game.love = clamp(game.love + (effect.love || 0), 0, 100);
  game.study = clamp(game.study + (effect.study || 0), 0, 100);
  game.exercise = clamp(game.exercise + (effect.exercise || 0), 0, 100);
  game.sense = clamp(game.sense + (effect.sense || 0), 0, 100);
  game.sincerity = clamp(game.sincerity + (effect.sincerity || 0), 0, 100);
  game.responsibility = clamp(game.responsibility + (effect.responsibility || 0), 0, 100);
  game.family = clamp(game.family + (effect.family || 0), 0, 3);
}

function finishMission(successText, effect, options = {}) {
  stopRunningMission();
  applyEffect(effect);

  speech.textContent = successText;
  addLog(successText);

  if (!options.noDayPlus) {
    game.day += 1;
  }

  if (game.day % 6 === 0 && game.stage !== "결혼") {
    game.love = clamp(game.love - 3, 0, 100);
    addLog("시간이 지나면서 관심이 조금 식었다. 호감도 -3");
  }

  missionTitle.textContent = "다음 미션을 선택해!";
  missionDesc.textContent = "아래 버튼을 눌러 다음 행동을 진행하자.";
  missionBox.innerHTML = "";

  checkEnding();
  saveGame();
  render();
}

function renderRelation() {
  if (game.stage === "썸") {
    if (game.love < 35) relationText.textContent = "아직은 어색한 사이";
    else if (game.love < 70) relationText.textContent = "조금씩 가까워지는 중";
    else relationText.textContent = "고백 타이밍이 보인다";
  }

  if (game.stage === "연애") {
    if (game.love < 80) relationText.textContent = "연애 중, 더 노력해야 함";
    else relationText.textContent = "진지한 연애로 발전 중";
  }

  if (game.stage === "결혼") {
    relationText.textContent = "가족 엔딩을 준비하는 중";
  }
}

function renderSpecialButtons() {
  confessBtn.classList.toggle("locked", !(game.stage === "썸" && game.love >= 70 && game.sincerity >= 25));
  relationshipBtn.classList.toggle("locked", game.stage === "썸");
  proposeBtn.classList.toggle("locked", !(game.stage === "연애" && game.love >= 90 && game.responsibility >= 45));
  familyBtn.classList.toggle("locked", game.stage !== "결혼");
}

function renderLog() {
  logList.innerHTML = "";

  game.logs.forEach((log) => {
    const li = document.createElement("li");
    li.textContent = log;
    logList.appendChild(li);
  });
}

function render() {
  loveValue.textContent = game.love;
  loveBar.style.width = `${game.love}%`;

  studyValue.textContent = game.study;
  exerciseValue.textContent = game.exercise;
  senseValue.textContent = game.sense;
  sincerityValue.textContent = game.sincerity;
  responsibilityValue.textContent = game.responsibility;
  familyValue.textContent = `${game.family}/3`;

  stageText.textContent = `현재 단계: ${game.stage}`;
  dayText.textContent = `DAY ${game.day}`;

  renderRelation();
  renderSpecialButtons();
  renderLog();
}

function showModal(title, text) {
  game.ended = true;
  saveGame();

  modalTitle.textContent = title;
  modalText.innerHTML = text;
  modal.classList.remove("hidden");
}

function checkEnding() {
  if (game.love <= 0 && !game.ended) {
    showModal(
      "배드 엔딩 💔",
      "호감도가 0이 되었다.<br>배려 없는 행동이 반복되어 소개팅이 끝났다."
    );
  }

  if (
    game.stage === "결혼" &&
    game.family >= 3 &&
    game.love >= 95 &&
    game.responsibility >= 55 &&
    !game.ended
  ) {
    showModal(
      "해피 엔딩 💖",
      "연애와 결혼을 거쳐 가족 준비까지 성공했다.<br>두 사람은 행복한 가정을 이루며 게임이 끝났다!"
    );
  }
}

function showChoiceMission(title, desc, choices) {
  clearMission();

  missionTitle.textContent = title;
  missionDesc.textContent = desc;

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = choice.text;

    btn.addEventListener("click", () => {
      finishMission(choice.result, choice.effect);
    });

    missionBox.appendChild(btn);
  });
}

/* 1. 공부 미션: 제한시간 퀴즈 */
function showStudyMission() {
  clearMission();

  const quizList = [
    {
      q: "상대가 말한 생일은 5월 8일이었다. 올바른 답은?",
      answers: ["3월 2일", "5월 8일", "8월 5일"],
      correct: 1
    },
    {
      q: "12 × 8 = ?",
      answers: ["84", "96", "108"],
      correct: 1
    },
    {
      q: "상대가 좋아한다고 말한 과목은?",
      answers: ["체육", "문학", "기억 안 남"],
      correct: 1
    }
  ];

  const quiz = randomItem(quizList);
  let timeLeft = 10;

  missionTitle.textContent = "공부 미션: 10초 퀴즈";
  missionDesc.textContent = "10초 안에 정답을 고르면 공부와 호감도가 올라간다.";

  missionBox.innerHTML = `
    <div class="timer-card">
      <div class="timer-row">
        <span>남은 시간</span>
        <strong id="quizTimer">10초</strong>
      </div>
      <p><strong>${quiz.q}</strong></p>
      <div id="quizChoices" class="mission-box"></div>
    </div>
  `;

  const quizTimer = document.getElementById("quizTimer");
  const quizChoices = document.getElementById("quizChoices");

  quiz.answers.forEach((answer, index) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn";
    btn.textContent = answer;

    btn.addEventListener("click", () => {
      if (index === quiz.correct) {
        finishMission("공부 미션 성공! 똑똑하고 성실한 모습에 호감도가 올랐다.", {
          love: 8,
          study: 9,
          sincerity: 2
        });
      } else {
        finishMission("공부 미션 실패! 제대로 기억하지 못해서 호감도가 조금 떨어졌다.", {
          love: -6,
          study: 2
        });
      }
    });

    quizChoices.appendChild(btn);
  });

  activeTimer = setInterval(() => {
    timeLeft -= 1;
    quizTimer.textContent = `${timeLeft}초`;

    if (timeLeft <= 0) {
      finishMission("시간 초과! 공부 미션에 실패해서 호감도가 떨어졌다.", {
        love: -7,
        study: 1
      });
    }
  }, 1000);
}

/* 2. 운동 미션: 5초 안에 20번 터치 */
function showExerciseMission() {
  clearMission();

  let tapCount = 0;
  let timeLeft = 5.0;
  const target = 20;
  let playing = false;

  missionTitle.textContent = "운동 미션: 5초 터치";
  missionDesc.textContent = "5초 안에 화면을 20번 터치하면 성공이다.";

  missionBox.innerHTML = `
    <div class="tap-card">
      <div class="tap-row">
        <span id="tapCountText">터치: 0/${target}</span>
        <span id="tapTimeText">남은 시간: 5.0초</span>
      </div>
      <button id="tapArea" class="tap-area" disabled>🔥 준비</button>
      <button id="tapStart" class="start-btn">시작하기</button>
    </div>
  `;

  const tapCountText = document.getElementById("tapCountText");
  const tapTimeText = document.getElementById("tapTimeText");
  const tapArea = document.getElementById("tapArea");
  const tapStart = document.getElementById("tapStart");

  function finishTap(success) {
    if (success) {
      finishMission("운동 미션 성공! 활동적인 모습으로 호감도가 올랐다.", {
        love: 8,
        exercise: 10,
        sincerity: 2
      });
    } else {
      finishMission("운동 미션 실패! 체력이 부족해 보여서 호감도가 떨어졌다.", {
        love: -8,
        exercise: 2
      });
    }
  }

  tapStart.addEventListener("click", () => {
    if (playing) return;

    playing = true;
    tapCount = 0;
    timeLeft = 5.0;
    tapArea.disabled = false;
    tapArea.textContent = "🔥 빠르게 터치!";
    tapStart.disabled = true;
    tapStart.textContent = "진행 중...";

    activeTimer = setInterval(() => {
      timeLeft -= 0.1;
      tapTimeText.textContent = `남은 시간: ${timeLeft.toFixed(1)}초`;

      if (timeLeft <= 0) {
        finishTap(false);
      }
    }, 100);
  });

  tapArea.addEventListener("pointerdown", () => {
    if (!playing) return;

    tapCount += 1;
    tapCountText.textContent = `터치: ${tapCount}/${target}`;

    if (tapCount >= target) {
      finishTap(true);
    }
  });
}

/* 3. 연락 미션: 좋은 답장 고르기 */
function showMessageMission() {
  const missions = [
    {
      title: "연락 미션: 힘든 하루",
      desc: '상대가 "오늘 좀 힘들었어..."라고 보냈다.',
      choices: [
        {
          text: "무슨 일 있었어? 괜찮아?",
          result: "좋은 답장 성공! 진심 어린 말로 호감도가 올랐다.",
          effect: { love: 8, sincerity: 7, sense: 3 }
        },
        {
          text: "나도 힘들어",
          result: "공감이 부족해서 호감도가 떨어졌다.",
          effect: { love: -6, sincerity: -2 }
        },
        {
          text: "ㅋㅋ 어쩌라고",
          result: "최악의 답장! 호감도가 크게 떨어졌다.",
          effect: { love: -15, sincerity: -5 }
        }
      ]
    },
    {
      title: "연락 미션: 약속 잡기",
      desc: "주말에 만날 시간을 정해야 한다.",
      choices: [
        {
          text: "네가 편한 시간에 맞출게.",
          result: "배려 있는 답장으로 호감도가 올랐다.",
          effect: { love: 8, sincerity: 5 }
        },
        {
          text: "무조건 내 시간에 맞춰.",
          result: "이기적인 태도 때문에 호감도가 떨어졌다.",
          effect: { love: -12, sincerity: -4 }
        },
        {
          text: "후보 3개 보내줄게. 같이 고르자.",
          result: "센스 있는 답장으로 호감도가 올랐다.",
          effect: { love: 9, sense: 6, sincerity: 3 }
        }
      ]
    }
  ];

  const m = randomItem(missions);
  showChoiceMission(m.title, m.desc, m.choices);
}

/* 4. 데이트 미션: 기억력 게임 */
function showDateMemoryMission() {
  clearMission();

  const profiles = [
    {
      food: "마라탕",
      color: "하늘색",
      movie: "로맨스 영화",
      question: "상대가 좋아하는 음식은?",
      answers: ["마라탕", "초밥", "햄버거"],
      correct: 0
    },
    {
      food: "떡볶이",
      color: "보라색",
      movie: "공포 영화",
      question: "상대가 좋아하는 색은?",
      answers: ["노란색", "보라색", "검은색"],
      correct: 1
    }
  ];

  const profile = randomItem(profiles);

  missionTitle.textContent = "데이트 미션: 취향 기억하기";
  missionDesc.textContent = "3초 동안 상대의 취향을 기억해라.";

  missionBox.innerHTML = `
    <div class="memory-card">
      <p><strong>3초 동안 기억!</strong></p>
      <div class="memory-list">
        <div class="memory-item">좋아하는 음식: ${profile.food}</div>
        <div class="memory-item">좋아하는 색: ${profile.color}</div>
        <div class="memory-item">좋아하는 영화: ${profile.movie}</div>
      </div>
    </div>
  `;

  activeTimer = setTimeout(() => {
    missionTitle.textContent = "데이트 미션: 기억력 문제";
    missionDesc.textContent = profile.question;
    missionBox.innerHTML = "";

    profile.answers.forEach((answer, index) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.textContent = answer;

      btn.addEventListener("click", () => {
        if (index === profile.correct) {
          finishMission("데이트 미션 성공! 상대의 취향을 기억해서 호감도가 크게 올랐다.", {
            love: 12,
            sense: 7,
            sincerity: 4
          });
        } else {
          finishMission("데이트 미션 실패! 상대의 말을 기억하지 못해서 호감도가 떨어졌다.", {
            love: -8,
            sense: -2
          });
        }
      });

      missionBox.appendChild(btn);
    });
  }, 3000);
}

/* 5. 선물 미션: 예산 안에서 선물 고르기 */
function showGiftMission() {
  showChoiceMission(
    "선물 미션: 예산 30,000원",
    "무조건 비싼 선물이 아니라 상대 취향을 기억한 선물을 골라야 한다.",
    [
      {
        text: "300,000원 명품 지갑",
        result: "예산을 무시해서 부담스럽게 느껴졌다. 호감도 하락.",
        effect: { love: -8, sense: -3, responsibility: -2 }
      },
      {
        text: "상대가 좋아한다고 했던 간식 세트 12,000원",
        result: "선물 미션 성공! 취향을 기억해서 호감도가 올랐다.",
        effect: { love: 10, sense: 7, sincerity: 4, responsibility: 2 }
      },
      {
        text: "아무거나 급하게 산 선물",
        result: "성의가 부족해 보여서 호감도가 떨어졌다.",
        effect: { love: -6, sincerity: -2 }
      }
    ]
  );
}

/* 6. 위기 미션: 실수 대처하기 */
function showCrisisMission() {
  const crises = [
    {
      title: "위기 미션: 약속 지각",
      desc: "데이트 약속에 10분 늦었다. 어떻게 할까?",
      choices: [
        {
          text: "바로 사과하고 이유를 설명한다.",
          result: "위기 대처 성공! 솔직한 사과로 신뢰가 조금 올라갔다.",
          effect: { love: 3, sincerity: 8, responsibility: 5 }
        },
        {
          text: "겨우 10분인데 왜 그래?",
          result: "위기 대처 실패! 호감도가 크게 떨어졌다.",
          effect: { love: -15, sincerity: -4, responsibility: -4 }
        },
        {
          text: "아무 말 없이 넘어간다.",
          result: "책임감 없는 모습으로 호감도가 떨어졌다.",
          effect: { love: -10, responsibility: -3 }
        }
      ]
    },
    {
      title: "위기 미션: 말실수",
      desc: "대화 중 실수로 상대가 기분 나쁠 말을 했다.",
      choices: [
        {
          text: "바로 인정하고 미안하다고 말한다.",
          result: "실수를 인정해서 분위기가 회복됐다.",
          effect: { love: 4, sincerity: 7, responsibility: 4 }
        },
        {
          text: "장난인데 왜 진지해?",
          result: "상대 기분을 무시해서 호감도가 떨어졌다.",
          effect: { love: -13, sincerity: -4 }
        },
        {
          text: "못 들은 척한다.",
          result: "어색한 침묵 때문에 호감도가 떨어졌다.",
          effect: { love: -8, sincerity: -2 }
        }
      ]
    }
  ];

  const crisis = randomItem(crises);
  showChoiceMission(crisis.title, crisis.desc, crisis.choices);
}

/* 7. 타이밍 미션: 하트가 중앙에 왔을 때 터치 */
function showTimingMission() {
  clearMission();

  let pos = 0;
  let direction = 1;
  let running = true;

  missionTitle.textContent = "타이밍 미션: 고백 타이밍 잡기";
  missionDesc.textContent = "하트가 초록색 중앙 영역에 들어왔을 때 멈추면 성공이다.";

  missionBox.innerHTML = `
    <div class="timing-card">
      <div class="timing-lane" id="timingLane">
        <div class="center-zone"></div>
        <div class="moving-heart" id="movingHeart">💘</div>
      </div>
      <button id="stopTiming" class="stop-btn">지금 터치!</button>
    </div>
  `;

  const movingHeart = document.getElementById("movingHeart");
  const stopTiming = document.getElementById("stopTiming");

  function animate() {
    if (!running) return;

    pos += direction * 2.7;

    if (pos >= 90) direction = -1;
    if (pos <= 0) direction = 1;

    movingHeart.style.left = `${pos}%`;
    activeAnimation = requestAnimationFrame(animate);
  }

  animate();

  stopTiming.addEventListener("click", () => {
    running = false;
    cancelAnimationFrame(activeAnimation);

    if (pos >= 40 && pos <= 60) {
      finishMission("타이밍 미션 성공! 완벽한 순간을 잡아서 호감도가 올랐다.", {
        love: 10,
        sense: 6,
        sincerity: 3
      });
    } else {
      finishMission("타이밍 미션 실패! 분위기를 잘못 읽어서 호감도가 떨어졌다.", {
        love: -7,
        sense: -2
      });
    }
  });
}

/* 8. 랜덤 사건 미션 */
function showRandomEventMission() {
  const events = [
    {
      title: "랜덤 사건: 갑자기 비가 온다",
      desc: "데이트 중 갑자기 비가 오기 시작했다.",
      choices: [
        {
          text: "우산을 같이 쓰자고 한다.",
          result: "랜덤 사건 성공! 자연스럽게 가까워졌다.",
          effect: { love: 8, sense: 5, sincerity: 3 }
        },
        {
          text: "나는 먼저 갈게.",
          result: "상대를 두고 가서 호감도가 크게 떨어졌다.",
          effect: { love: -14, sincerity: -5 }
        },
        {
          text: "가까운 카페로 같이 이동한다.",
          result: "센스 있는 대처로 호감도가 올랐다.",
          effect: { love: 9, sense: 6 }
        }
      ]
    },
    {
      title: "랜덤 사건: 친구의 이상한 조언",
      desc: "친구가 일부러 질투하게 만들라고 조언했다.",
      choices: [
        {
          text: "그런 장난은 하지 않는다.",
          result: "성숙한 판단으로 진심이 올랐다.",
          effect: { love: 6, sincerity: 6, responsibility: 3 }
        },
        {
          text: "일부러 질투 작전을 쓴다.",
          result: "상대가 실망해서 호감도가 떨어졌다.",
          effect: { love: -12, sincerity: -4 }
        },
        {
          text: "상대에게 솔직하게 마음을 표현한다.",
          result: "솔직함이 통해서 호감도가 올랐다.",
          effect: { love: 9, sincerity: 7 }
        }
      ]
    }
  ];

  const event = randomItem(events);
  showChoiceMission(event.title, event.desc, event.choices);
}

/* 9. 연애 단계 전용 미션 */
function showRelationshipMission() {
  if (game.stage === "썸") {
    speech.textContent = "아직 연애 단계가 아니라 연애 미션을 할 수 없다. 먼저 고백에 성공해야 한다.";
    addLog("연애 미션은 고백 성공 후 가능하다.");
    render();
    saveGame();
    return;
  }

  showChoiceMission(
    "연애 미션: 기념일 기억하기",
    "연애 중에는 호감도뿐 아니라 책임감과 진심도 중요하다.",
    [
      {
        text: "기념일을 기억하고 작은 편지를 준비한다.",
        result: "연애 미션 성공! 진심과 책임감이 올랐다.",
        effect: { love: 9, sincerity: 7, responsibility: 7 }
      },
      {
        text: "기념일을 까먹고 아무렇지 않은 척한다.",
        result: "기념일을 잊어서 호감도가 크게 떨어졌다.",
        effect: { love: -13, sincerity: -4, responsibility: -5 }
      },
      {
        text: "늦게라도 사과하고 다시 약속을 잡는다.",
        result: "실수를 만회해서 관계가 회복됐다.",
        effect: { love: 4, sincerity: 5, responsibility: 5 }
      }
    ]
  );
}

/* 10. 결혼 후 가족 준비 미션 */
function showFamilyMission() {
  if (game.stage !== "결혼") {
    speech.textContent = "가족 준비 미션은 결혼 신청에 성공한 뒤에 가능하다.";
    addLog("가족 준비 미션은 결혼 단계에서 가능하다.");
    render();
    saveGame();
    return;
  }

  const familyMissions = [
    {
      title: "가족 준비 미션: 생활 계획",
      desc: "결혼 후 생활비와 시간을 어떻게 관리할까?",
      choices: [
        {
          text: "생활비, 집안일, 시간을 함께 계획한다.",
          result: "가족 준비 성공! 책임감 있는 모습으로 엔딩에 가까워졌다.",
          effect: { love: 7, sincerity: 6, responsibility: 8, family: 1 }
        },
        {
          text: "계획 없이 대충 살자고 한다.",
          result: "불안한 태도 때문에 호감도가 떨어졌다.",
          effect: { love: -12, responsibility: -5 }
        },
        {
          text: "상대에게 전부 맡긴다.",
          result: "무책임하게 보여서 호감도가 떨어졌다.",
          effect: { love: -10, responsibility: -6 }
        }
      ]
    },
    {
      title: "가족 준비 미션: 아이 돌보기 연습",
      desc: "가족 엔딩을 위해 책임감 있는 선택을 해야 한다.",
      choices: [
        {
          text: "함께 역할을 나누고 책임 있게 준비한다.",
          result: "가족 준비 성공! 가족 엔딩에 한 걸음 가까워졌다.",
          effect: { love: 8, sincerity: 6, responsibility: 9, family: 1 }
        },
        {
          text: "나는 잘 모르겠으니 피한다.",
          result: "책임감 부족으로 호감도가 떨어졌다.",
          effect: { love: -12, responsibility: -6 }
        },
        {
          text: "서로 배우면서 준비하자고 말한다.",
          result: "현실적인 태도 덕분에 신뢰가 올랐다.",
          effect: { love: 7, sincerity: 5, responsibility: 7, family: 1 }
        }
      ]
    }
  ];

  const m = randomItem(familyMissions);
  showChoiceMission(m.title, m.desc, m.choices);
}

function confess() {
  if (game.stage !== "썸") {
    speech.textContent = "이미 고백 이후 단계다.";
    return;
  }

  if (game.love >= 70 && game.sincerity >= 25) {
    game.stage = "연애";
    game.love = clamp(game.love + 8, 0, 100);
    game.sincerity = clamp(game.sincerity + 5, 0, 100);
    speech.textContent = "고백 성공! 이제 연애 단계로 발전했다.";
    addLog("고백 성공! 연애가 시작됐다.");
  } else {
    game.love = clamp(game.love - 12, 0, 100);
    speech.textContent = "아직 고백하기에는 호감도나 진심이 부족했다.";
    addLog("고백 실패. 호감도 -12");
  }

  game.day += 1;
  clearMission();
  checkEnding();
  saveGame();
  render();
}

function propose() {
  if (game.stage !== "연애") {
    speech.textContent = "결혼 신청은 연애 단계에서만 가능하다.";
    return;
  }

  if (game.love >= 90 && game.responsibility >= 45) {
    game.stage = "결혼";
    game.love = clamp(game.love + 5, 0, 100);
    game.responsibility = clamp(game.responsibility + 5, 0, 100);
    speech.textContent = "결혼 신청 성공! 이제 가족 준비 미션을 진행할 수 있다.";
    addLog("결혼 신청 성공! 결혼 단계가 시작됐다.");
  } else {
    game.love = clamp(game.love - 15, 0, 100);
    speech.textContent = "아직 결혼을 생각하기에는 책임감이나 호감도가 부족했다.";
    addLog("결혼 신청 실패. 호감도 -15");
  }

  game.day += 1;
  clearMission();
  checkEnding();
  saveGame();
  render();
}

function resetGame() {
  stopRunningMission();
  localStorage.removeItem("touchDatingMissionGame");

  game = {
    day: 1,
    stage: "썸",
    love: 30,
    study: 10,
    exercise: 10,
    sense: 10,
    sincerity: 10,
    responsibility: 0,
    family: 0,
    ended: false,
    logs: ["DAY 1: 소개팅이 시작됐다."]
  };

  modal.classList.add("hidden");
  missionTitle.textContent = "오늘의 미션을 선택해!";
  missionDesc.textContent = "아래 버튼을 눌러 미션을 진행하자. 성공하면 호감도가 오르고, 실패하면 떨어진다.";
  missionBox.innerHTML = "";
  speech.textContent = "미션을 성공해서 호감도를 올려봐!";

  saveGame();
  render();
}

actionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (game.ended) return;

    const mission = button.dataset.mission;

    if (mission === "study") showStudyMission();
    if (mission === "exercise") showExerciseMission();
    if (mission === "message") showMessageMission();
    if (mission === "date") showDateMemoryMission();
    if (mission === "gift") showGiftMission();
    if (mission === "crisis") showCrisisMission();
    if (mission === "timing") showTimingMission();
    if (mission === "random") showRandomEventMission();
  });
});

confessBtn.addEventListener("click", confess);
relationshipBtn.addEventListener("click", showRelationshipMission);
proposeBtn.addEventListener("click", propose);
familyBtn.addEventListener("click", showFamilyMission);
resetBtn.addEventListener("click", resetGame);
restartBtn.addEventListener("click", resetGame);

loadGame();
render();