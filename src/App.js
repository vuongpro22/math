import React, { useState } from 'react';
import './App.css';
import Comparison from './components/Comparison';
import Arithmetic from './components/Arithmetic';

function App() {
  const [selectedLesson, setSelectedLesson] = useState(null);

  const renderLesson = () => {
    switch (selectedLesson) {
      case 'comparison':
        return <Comparison />;
      case 'arithmetic':
        return <Arithmetic />;
      default:
        return (
          <div className="menu">
            <h1>Chọn Bài Học</h1>
            <div className="lesson-buttons">
              <button onClick={() => setSelectedLesson('comparison')}>
                So Sánh Số
              </button>
              <button onClick={() => setSelectedLesson('arithmetic')}>
                Phép Tính Cộng Trừ
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="App">
      {renderLesson()}
    </div>
  );
}

export default App;
