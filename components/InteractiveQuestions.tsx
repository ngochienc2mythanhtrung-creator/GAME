
import React, { useState, useMemo, useEffect } from 'react';
import { Question, QuestionType, Option, TrueFalseStatement, MatchingPair } from '../types';

// Utility for sound and fireworks
const playCorrectSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');
  audio.volume = 0.5;
  audio.play().catch(e => console.log("Sound play prevented"));
  // @ts-ignore
  if (window.confetti) {
    // @ts-ignore
    window.confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4f46e5', '#10b981', '#fbbf24', '#ef4444']
    });
  }
};

const playWrongSound = () => {
  const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3');
  audio.volume = 0.3;
  audio.play().catch(e => console.log("Sound play prevented"));
};

interface QuestionProps {
  question: Question;
}

export const MultipleChoice: React.FC<QuestionProps> = ({ question }) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [wrongClicked, setWrongClicked] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === question.correctIndex) {
      playCorrectSound();
    } else {
      playWrongSound();
      setWrongClicked(index);
      setTimeout(() => setWrongClicked(null), 500);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">{question.prompt}</h3>
      <div className="grid gap-3">
        {question.options?.map((option, idx) => {
          let bgColor = "bg-white border-slate-200 hover:border-indigo-300";
          let isWrong = wrongClicked === idx;
          
          if (selected !== null) {
            if (idx === question.correctIndex) bgColor = "bg-green-100 border-green-500 ring-2 ring-green-200";
            else if (idx === selected) bgColor = "bg-red-100 border-red-500 ring-2 ring-red-200";
            else bgColor = "bg-slate-50 border-slate-200 opacity-60";
          }

          return (
            <button
              key={idx}
              disabled={selected !== null}
              onClick={() => handleSelect(idx)}
              className={`text-left p-4 rounded-xl border transition-all ${bgColor} relative overflow-hidden ${isWrong ? 'shake border-red-500' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold shrink-0 ${selected === idx ? 'bg-white' : 'bg-slate-100 text-slate-600'}`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-slate-700">{option.text}</span>
              </div>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <div className={`p-4 rounded-xl mt-4 border-l-4 animate-in slide-in-from-top-2 duration-300 ${selected === question.correctIndex ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold">{selected === question.correctIndex ? '✓ Chính xác!' : '✕ Chưa chính xác.'}</span>
          </div>
          <p className="text-sm opacity-90">{question.options?.[selected]?.feedback || question.explanation}</p>
        </div>
      )}
    </div>
  );
};

export const TrueFalse: React.FC<QuestionProps> = ({ question }) => {
  const [results, setResults] = useState<Record<number, boolean | null>>({});
  const [wrongIdx, setWrongIdx] = useState<number | null>(null);

  const handleChoice = (idx: number, choice: boolean) => {
    if (results[idx] !== undefined) return;
    setResults(prev => ({ ...prev, [idx]: choice }));
    
    if (choice === question.statements?.[idx].isTrue) {
      playCorrectSound();
    } else {
      playWrongSound();
      setWrongIdx(idx);
      setTimeout(() => setWrongIdx(null), 500);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800 leading-relaxed">{question.prompt}</h3>
      <div className="space-y-4">
        {question.statements?.map((item, idx) => {
          const userChoice = results[idx];
          const isCorrect = userChoice === item.isTrue;
          const isWrongSelection = wrongIdx === idx;

          return (
            <div key={idx} className={`bg-slate-50/50 p-4 rounded-2xl border transition-all ${isWrongSelection ? 'shake border-red-300' : 'border-slate-100'}`}>
              <p className="mb-3 text-slate-700 font-medium">{item.statement}</p>
              <div className="flex gap-2">
                <button
                  disabled={userChoice !== undefined}
                  onClick={() => handleChoice(idx, true)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    userChoice === true 
                      ? (isCorrect ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-red-600 text-white shadow-lg shadow-red-100')
                      : (userChoice === undefined ? 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600' : 'bg-slate-50 text-slate-300')
                  }`}
                >
                  Đúng
                </button>
                <button
                  disabled={userChoice !== undefined}
                  onClick={() => handleChoice(idx, false)}
                  className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                    userChoice === false
                      ? (isCorrect ? 'bg-green-600 text-white shadow-lg shadow-green-100' : 'bg-red-600 text-white shadow-lg shadow-red-100')
                      : (userChoice === undefined ? 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600' : 'bg-slate-50 text-slate-300')
                  }`}
                >
                  Sai
                </button>
              </div>
              {userChoice !== undefined && (
                <div className={`mt-3 p-3 rounded-lg text-sm border-l-2 animate-in fade-in duration-300 ${isCorrect ? 'bg-green-50 border-green-400 text-green-800' : 'bg-red-50 border-red-400 text-red-800'}`}>
                  <span className="font-bold">{isCorrect ? 'Giải thích:' : 'Đáp án đúng là ' + (item.isTrue ? 'Đúng' : 'Sai') + '. Giải thích:'}</span>
                  <p className="mt-1 opacity-90">{item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const ShortAnswer: React.FC<QuestionProps> = ({ question }) => {
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const normalize = (str: string) => {
    return str.replace(/\s+/g, '').toLowerCase();
  };

  const checkAnswer = () => {
    if (!answer.trim()) return;
    
    const userNormalized = normalize(answer);
    const correctNormalized = normalize(question.correctAnswer || "");
    
    const correct = userNormalized === correctNormalized;
    setSubmitted(true);
    
    if (correct) {
      playCorrectSound();
    } else {
      playWrongSound();
      setIsWrong(true);
      setTimeout(() => setIsWrong(false), 500);
    }
  };

  const isCorrect = submitted && normalize(answer) === normalize(question.correctAnswer || "");

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-800">{question.prompt}</h3>
      <div className={`flex gap-2 ${isWrong ? 'shake' : ''}`}>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !submitted && answer.trim() && checkAnswer()}
          disabled={submitted}
          placeholder="Nhập câu trả lời..."
          className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-slate-50 transition-all ${isWrong ? 'border-red-500' : 'border-slate-200'}`}
        />
        <button
          onClick={checkAnswer}
          disabled={submitted || !answer.trim()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300 transition-all shadow-md shadow-indigo-100"
        >
          Kiểm tra
        </button>
      </div>
      {submitted && (
        <div className={`p-4 rounded-xl border-l-4 animate-in slide-in-from-top-2 duration-300 ${isCorrect ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'}`}>
          <p className="font-bold">{isCorrect ? '✓ Hoàn hảo!' : `✕ Đáp án chính xác là: ${question.correctAnswer}`}</p>
          {question.explanation && <p className="text-sm mt-1 opacity-90">{question.explanation}</p>}
        </div>
      )}
    </div>
  );
};

export const Matching: React.FC<QuestionProps> = ({ question }) => {
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({}); // leftIndex -> rightIndex
  const [isChecked, setIsChecked] = useState(false);
  const [wrongEffect, setWrongEffect] = useState(false);

  const shuffledRight = useMemo(() => {
    if (!question.matchingPairs) return [];
    return question.matchingPairs
      .map((p, originalIdx) => ({ text: p.right, originalIdx }))
      .sort(() => Math.random() - 0.5);
  }, [question.matchingPairs]);

  const handleLeftClick = (idx: number) => {
    if (isChecked) return;
    setSelectedLeft(idx);
  };

  const handleRightClick = (shuffledIdx: number) => {
    if (isChecked || selectedLeft === null) return;
    const originalRightIdx = shuffledRight[shuffledIdx].originalIdx;
    
    setMatches(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[parseInt(k)] === originalRightIdx) delete next[parseInt(k)];
      });
      next[selectedLeft] = originalRightIdx;
      return next;
    });
    setSelectedLeft(null);
  };

  const handleCheck = () => {
    setIsChecked(true);
    let allCorrect = true;
    Object.entries(matches).forEach(([l, r]) => {
      if (parseInt(l) !== r) allCorrect = false;
    });
    
    if (allCorrect && Object.keys(matches).length === question.matchingPairs?.length) {
      playCorrectSound();
    } else {
      playWrongSound();
      setWrongEffect(true);
      setTimeout(() => setWrongEffect(false), 500);
    }
  };

  const reset = () => {
    setMatches({});
    setIsChecked(false);
    setSelectedLeft(null);
  };

  const isAllMatched = question.matchingPairs && Object.keys(matches).length === question.matchingPairs.length;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-slate-800">{question.prompt}</h3>
      <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Hướng dẫn: Chọn 1 ô bên trái rồi ghép với 1 ô bên phải.
      </p>
      
      <div className={`flex flex-col md:flex-row gap-6 ${wrongEffect ? 'shake' : ''}`}>
        <div className="flex-1 space-y-3">
          {question.matchingPairs?.map((pair, idx) => (
            <button
              key={`left-${idx}`}
              onClick={() => handleLeftClick(idx)}
              className={`w-full text-left p-4 rounded-xl border transition-all text-sm min-h-[70px] flex items-center shadow-sm ${
                selectedLeft === idx 
                  ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200' 
                  : (matches[idx] !== undefined ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-300')
              } ${
                isChecked && matches[idx] === idx ? 'bg-green-50 border-green-500 text-green-800' : ''
              } ${
                isChecked && matches[idx] !== undefined && matches[idx] !== idx ? 'bg-red-50 border-red-500 text-red-800' : ''
              }`}
            >
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold mr-3 shrink-0">{idx + 1}</span>
              <span className="font-medium">{pair.left}</span>
            </button>
          ))}
        </div>

        <div className="flex-1 space-y-3">
          {shuffledRight.map((item, shuffledIdx) => {
            const matchedLeftIdx = Object.keys(matches).find(k => matches[parseInt(k)] === item.originalIdx);
            const isCorrect = isChecked && matchedLeftIdx !== undefined && parseInt(matchedLeftIdx) === item.originalIdx;
            const isWrong = isChecked && matchedLeftIdx !== undefined && parseInt(matchedLeftIdx) !== item.originalIdx;

            return (
              <button
                key={`right-${shuffledIdx}`}
                onClick={() => handleRightClick(shuffledIdx)}
                className={`w-full text-left p-4 rounded-xl border transition-all text-sm min-h-[70px] flex items-center shadow-sm ${
                  matchedLeftIdx !== undefined 
                    ? 'bg-indigo-50 border-indigo-200' 
                    : 'bg-white border-slate-100 hover:border-slate-300'
                } ${
                  isCorrect ? 'bg-green-50 border-green-500 text-green-800' : ''
                } ${
                  isWrong ? 'bg-red-50 border-red-500 text-red-800' : ''
                }`}
              >
                <div className="flex-1 font-medium">{item.text}</div>
                {matchedLeftIdx !== undefined && !isChecked && (
                  <span className="ml-2 px-2 py-1 bg-indigo-600 text-white text-[10px] rounded-lg font-bold">
                    Cặp {parseInt(matchedLeftIdx) + 1}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        {!isChecked ? (
          <button
            onClick={handleCheck}
            disabled={!isAllMatched}
            className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 disabled:bg-slate-200 transition-all shadow-lg shadow-indigo-100"
          >
            Kiểm tra kết quả
          </button>
        ) : (
          <button
            onClick={reset}
            className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
          >
            Làm lại
          </button>
        )}
      </div>

      {isChecked && (
        <div className="p-5 bg-indigo-50 rounded-2xl border border-indigo-100 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex gap-3">
            <div className="shrink-0 w-8 h-8 rounded-full bg-indigo-200 text-indigo-600 flex items-center justify-center font-bold">!</div>
            <div>
              <p className="text-sm font-bold text-indigo-800">Giải thích chi tiết:</p>
              <p className="text-sm text-indigo-700 mt-1 leading-relaxed">{question.explanation || "Đối soát các cặp theo màu sắc: Xanh (Đúng), Đỏ (Sai)."}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
