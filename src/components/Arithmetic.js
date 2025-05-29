import React, { useState, useEffect, useRef } from 'react';

function Arithmetic() {
  const [minRange, setMinRange] = useState(1);
  const [maxRange, setMaxRange] = useState(10);
  const [number1, setNumber1] = useState(0);
  const [number2, setNumber2] = useState(0);
  const [operator, setOperator] = useState('?');
  const [result, setResult] = useState('');
  const [resultClass, setResultClass] = useState('');
  const [questionTime, setQuestionTime] = useState(10);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Audio refs
  const themeAudioRef = useRef(null);
  const correctAudioRef = useRef(null);
  const wrongAudioRef = useRef(null);

  useEffect(() => {
    let timer;
    if (isTimerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimeUp();
    }
    return () => clearInterval(timer);
  }, [isTimerRunning, timeLeft]);

  // Handle theme music play/stop and mute
  useEffect(() => {
    const themeAudio = themeAudioRef.current;
    if (themeAudio) {
      themeAudio.muted = muted;
    }
    if (isGameStarted && themeAudio) {
      themeAudio.volume = 0.15;
      themeAudio.loop = true;
      if (!muted) themeAudio.play().catch(() => {});
    } else if (!isGameStarted && themeAudio) {
      themeAudio.pause();
      themeAudio.currentTime = 0;
    }
  }, [isGameStarted, muted]);

  // Mute/unmute correct/wrong sounds
  useEffect(() => {
    if (correctAudioRef.current) correctAudioRef.current.muted = muted;
    if (wrongAudioRef.current) wrongAudioRef.current.muted = muted;
  }, [muted]);

  const handleTimeUp = () => {
    setIsTimerRunning(false);
    setResult('Hết thời gian! ⏰');
    setResultClass('incorrect');
    setOperator('?');
    if (wrongAudioRef.current && !muted) {
      wrongAudioRef.current.currentTime = 0;
      wrongAudioRef.current.play();
    }
    setTimeout(generateNumbers, 1500);
  };

  const generateWrongAnswer = (correctAnswer) => {
    let wrongAnswer;
    do {
      // Tạo đáp án sai trong khoảng ±5 của đáp án đúng
      const offset = Math.floor(Math.random() * 11) - 5;
      wrongAnswer = correctAnswer + offset;
    } while (wrongAnswer === correctAnswer || wrongAnswer < 0);
    return wrongAnswer;
  };

  const generateNumbers = () => {
    if (minRange >= maxRange) {
      alert('Số nhỏ nhất phải nhỏ hơn số lớn nhất!');
      return;
    }
    const newNumber1 = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    const newNumber2 = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    
    // Random chọn phép cộng hoặc trừ
    let newOperator;
    if (newNumber1 >= newNumber2) {
      // Nếu số thứ nhất lớn hơn hoặc bằng số thứ hai, có thể chọn cả cộng và trừ
      newOperator = Math.random() < 0.5 ? '+' : '-';
    } else {
      // Nếu số thứ nhất nhỏ hơn số thứ hai, chỉ chọn phép cộng
      newOperator = '+';
    }
    
    setNumber1(newNumber1);
    setNumber2(newNumber2);
    setOperator(newOperator);
    
    // Tính đáp án đúng
    const correctAnswer = newOperator === '+' ? newNumber1 + newNumber2 : newNumber1 - newNumber2;
    
    // Tạo 3 đáp án sai
    const wrongAnswers = [];
    while (wrongAnswers.length < 3) {
      const wrongAnswer = generateWrongAnswer(correctAnswer);
      if (!wrongAnswers.includes(wrongAnswer)) {
        wrongAnswers.push(wrongAnswer);
      }
    }
    
    // Tạo mảng 4 đáp án và xáo trộn
    const allAnswers = [correctAnswer, ...wrongAnswers];
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    setAnswers(allAnswers);
    setResult('');
    setResultClass('');
    setTimeLeft(questionTime);
    setIsTimerRunning(true);
  };

  const startGame = () => {
    setIsGameStarted(true);
    setScore(0);
    setTotalQuestions(0);
    setTimeLeft(questionTime);
    generateNumbers();
  };

  const checkAnswer = (selectedAnswer) => {
    if (!isGameStarted) return;
    const correctAnswer = operator === '+' ? number1 + number2 : number1 - number2;
    const isCorrect = selectedAnswer === correctAnswer;
    setIsTimerRunning(false);
    if (isCorrect) {
      setResult('Chính xác! 👏');
      setResultClass('correct');
      setScore(prev => prev + 1);
      if (correctAudioRef.current && !muted) {
        correctAudioRef.current.currentTime = 0;
        correctAudioRef.current.play();
      }
    } else {
      setResult(`Chưa đúng, đáp án là: ${correctAnswer} 💪`);
      setResultClass('incorrect');
      if (wrongAudioRef.current && !muted) {
        wrongAudioRef.current.currentTime = 0;
        wrongAudioRef.current.play();
      }
    }
    setTotalQuestions(prev => prev + 1);
    setTimeout(generateNumbers, 1500);
  };

  const handleExit = () => {
    const finalScore = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
    alert(`Kết thúc!\nSố câu đúng: ${score}/${totalQuestions}\nTỷ lệ đúng: ${finalScore}%`);
    setIsGameStarted(false);
    setIsTimerRunning(false);
    setTimeLeft(questionTime);
    setScore(0);
    setTotalQuestions(0);
    setNumber1(0);
    setNumber2(0);
    setOperator('?');
    setResult('');
    setResultClass('');
    setAnswers([]);
    if (themeAudioRef.current) {
      themeAudioRef.current.pause();
      themeAudioRef.current.currentTime = 0;
    }
  };

  const handleMuteToggle = () => {
    setMuted((prev) => !prev);
  };

  const handleTimeChange = (e) => {
    const value = parseInt(e.target.value);
    setQuestionTime(value);
    setTimeLeft(value);
  };

  return (
    <div className="App">
      <audio ref={themeAudioRef} src={require('../sound/theme.mp3')} />
      <audio ref={correctAudioRef} src={require('../sound/correct.mp3')} />
      <audio ref={wrongAudioRef} src={require('../sound/wrong.mp3')} />
      <div className="container">
        <h1>Học Phép Tính Cộng Trừ</h1>
        {!isGameStarted && (
          <form className="setting-form" onSubmit={e => { e.preventDefault(); startGame(); }}>
            <div className="range-selector">
              <div className="range-row">
                <label htmlFor="minRange">Số nhỏ nhất:</label>
                <input
                  type="number"
                  id="minRange"
                  value={minRange}
                  onChange={(e) => setMinRange(parseInt(e.target.value))}
                  min="0"
                  max="100"
                  disabled={isGameStarted}
                />
              </div>
              <div className="range-row">
                <label htmlFor="maxRange">Số lớn nhất:</label>
                <input
                  type="number"
                  id="maxRange"
                  value={maxRange}
                  onChange={(e) => setMaxRange(parseInt(e.target.value))}
                  min="1"
                  max="100"
                  disabled={isGameStarted}
                />
              </div>
              <div className="time-select">
                <label htmlFor="timeSelect">Thời gian mỗi câu:</label>
                <select
                  id="timeSelect"
                  value={questionTime}
                  onChange={handleTimeChange}
                  disabled={isGameStarted}
                >
                  <option value={5}>5 giây</option>
                  <option value={10}>10 giây</option>
                  <option value={15}>15 giây</option>
                  <option value={20}>20 giây</option>
                </select>
              </div>
              <div className="action-row">
                <button type="button" onClick={handleMuteToggle} className="mute-btn">
                  {muted ? '🔇 Tắt tiếng' : '🔊 Có tiếng'}
                </button>
                <button type="submit">Bắt đầu</button>
                <button type="button" onClick={() => window.location.reload()} className="menu-btn">
                  Về Menu Chính
                </button>
              </div>
            </div>
          </form>
        )}
        {isGameStarted && (
          <div className="study-form">
            <div className="stats">
              <div className="timer">Thời gian: {timeLeft}s</div>
              <div className="score">Điểm: {score}/{totalQuestions}</div>
            </div>
            <div className="numbers">
              <div className="number">{number1}</div>
              <div className="operator">{operator}</div>
              <div className="number">{number2}</div>
              <div className="operator">=</div>
              <div className="number">?</div>
            </div>
            <div className="answer-buttons">
              {answers.map((answer, index) => (
                <button
                  key={index}
                  className="answer-btn"
                  onClick={() => checkAnswer(answer)}
                >
                  {answer}
                </button>
              ))}
            </div>
            <div className={`result ${resultClass}`}>{result}</div>
            <button className="exit-btn" onClick={handleExit}>Thoát</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Arithmetic; 