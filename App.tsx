
import React, { useState, useEffect } from 'react';
import { Lesson, QuestionType } from './types';
import { INITIAL_LESSONS } from './services/mockData';
import { extractTextFromPDF, extractTextFromTextFile } from './services/pdfService';
import { generateLessonFromTopic, generateLessonFromText } from './services/geminiService';
import { MultipleChoice, TrueFalse, ShortAnswer, Matching } from './components/InteractiveQuestions';

const App: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const [currentLessonId, setCurrentLessonId] = useState<string>(INITIAL_LESSONS[0].id);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // States for AI generation
  const [topic, setTopic] = useState('');
  const [bookSeries, setBookSeries] = useState('Kết nối tri thức');
  const [subject, setSubject] = useState('Khoa học tự nhiên');
  const [grade, setGrade] = useState('Lớp 6');

  const currentLesson = lessons.find(l => l.id === currentLessonId) || lessons[0];

  useEffect(() => {
    if (window.innerWidth >= 1024) setSidebarOpen(true);
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (window.MathJax && window.MathJax.typesetPromise) {
      // @ts-ignore
      window.MathJax.typesetPromise();
    }
  }, [currentLesson]);

  const handleGenerateFromTopic = async (e?: React.FormEvent, isRefresh: boolean = false) => {
    if (e) e.preventDefault();
    
    // If refreshing, we use the title of the current lesson as the topic
    const searchTopic = isRefresh ? currentLesson.title : topic;
    if (!searchTopic.trim()) return;

    setIsUploading(true);
    setUploadProgress(isRefresh ? `Thầy Út đang làm mới câu hỏi...` : `Thầy Út đang soạn bài '${searchTopic}'...`);
    
    try {
      const newLesson = await generateLessonFromTopic(searchTopic, bookSeries, subject, grade, isRefresh);
      
      if (isRefresh) {
        // Update the current lesson in the list instead of adding a new one
        setLessons(prev => prev.map(l => l.id === currentLessonId ? { ...newLesson, id: l.id } : l));
      } else {
        setLessons(prev => [...prev, newLesson]);
        setCurrentLessonId(newLesson.id);
        setTopic('');
        if (window.innerWidth < 1024) setSidebarOpen(false);
      }
    } catch (error) {
      alert('Có lỗi khi soạn bài. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setUploadProgress('Đang đọc file tài liệu...');
    try {
      let text = (file.type === 'application/pdf') ? await extractTextFromPDF(file) : await extractTextFromTextFile(file);
      setUploadProgress('Thầy Út đang phân tích nội dung...');
      const newLesson = await generateLessonFromText(text);
      setLessons(prev => [...prev, newLesson]);
      setCurrentLessonId(newLesson.id);
      if (window.innerWidth < 1024) setSidebarOpen(false);
    } catch (error) {
      alert('Lỗi xử lý file.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
    event.target.value = '';
  };

  const handleDownloadPDF = () => {
    const element = document.getElementById('lesson-content');
    if (!element) return;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${currentLesson.title}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        logging: false
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'translate-x-0 w-72 md:w-80' : '-translate-x-full w-0'} fixed lg:relative z-50 h-full bg-white border-r border-slate-200 transition-all duration-300 overflow-hidden flex flex-col shrink-0 no-print`}>
        <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-100">E</div>
            <div>
              <h1 className="font-bold text-lg text-slate-800">Edu-Path</h1>
              <p className="text-[9px] text-slate-400 font-bold uppercase">Thầy Út - THCS Mỹ Thạnh Trung</p>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {/* Inputs Section */}
          <div className="px-4 md:px-6">
            <label className="block text-[10px] font-bold text-indigo-500 uppercase mb-3">Soạn bài mới</label>
            <form onSubmit={(e) => handleGenerateFromTopic(e)} className="space-y-3">
              <input
                type="text" placeholder="Tên bài học (VD: Quang hợp)..." value={topic} onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                disabled={isUploading}
              />
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Khối lớp</label>
                <select value={grade} onChange={(e) => setGrade(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border bg-slate-50 outline-none" disabled={isUploading}>
                  {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"].map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Môn học</label>
                  <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border bg-slate-50 outline-none" disabled={isUploading}>
                    {["Khoa học tự nhiên", "Toán học", "Ngữ văn", "Tiếng Anh", "Lịch sử & Địa lý", "Tin học", "Công nghệ", "GD Kinh tế & Pháp luật"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Bộ sách</label>
                  <select value={bookSeries} onChange={(e) => setBookSeries(e.target.value)} className="w-full px-2 py-1.5 text-xs rounded-lg border bg-slate-50 outline-none" disabled={isUploading}>
                    {["Kết nối tri thức", "Cánh diều", "Chân trời sáng tạo", "Sách cũ (2006)"].map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={isUploading || !topic.trim()} className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-50 transition-all">
                {isUploading ? 'Đang soạn...' : 'Thầy Út soạn bài ngay'}
              </button>
            </form>
          </div>

          <div className="px-4 md:px-6">
             <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-3">Bài học hiện có</label>
             <div className="space-y-1">
               {lessons.map(lesson => (
                 <button key={lesson.id} onClick={() => { setCurrentLessonId(lesson.id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
                   className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${currentLessonId === lesson.id ? 'bg-indigo-50 text-indigo-700 font-semibold border-indigo-200 border' : 'text-slate-600 hover:bg-slate-50'}`}>
                   <p className="truncate">{lesson.title}</p>
                 </button>
               ))}
             </div>
          </div>
        </div>

        <div className="p-4 md:p-6 border-t bg-slate-50/50">
           <label className="cursor-pointer block">
             <div className={`w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-slate-300 rounded-xl text-xs text-slate-500 hover:border-indigo-400 transition-all ${isUploading ? 'opacity-50' : ''}`}>
               <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20"><path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" /></svg>
               Tải file giáo án
             </div>
             <input type="file" className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} disabled={isUploading} />
           </label>
           {isUploading && <p className="text-[9px] text-center text-slate-400 mt-2 animate-pulse">{uploadProgress}</p>}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen bg-slate-50 relative overflow-hidden print-container">
        {/* Header - Compact & Full of tools */}
        <header className="h-14 md:h-16 bg-white border-b border-slate-200 px-3 md:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 no-print">
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
            <h2 className="text-sm md:text-base font-bold text-slate-800 truncate">{currentLesson.title}</h2>
          </div>
          
          <div className="flex items-center gap-1.5 md:gap-2 ml-2">
            {/* Refresh Button */}
            <button 
              onClick={() => handleGenerateFromTopic(undefined, true)} 
              disabled={isUploading || currentLessonId === 'lesson-intro'}
              title="Làm mới câu hỏi"
              className={`p-1.5 md:px-2.5 md:py-1.5 text-slate-600 rounded-lg font-bold border border-slate-200 hover:bg-slate-100 transition-all flex items-center gap-1.5 text-[10px] md:text-xs ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <svg className={`h-3.5 w-3.5 ${isUploading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            <button 
              onClick={handleDownloadPDF} 
              className="p-1.5 md:px-2.5 md:py-1.5 bg-slate-50 text-slate-600 rounded-lg font-bold border border-slate-200 hover:bg-slate-100 transition-colors text-[10px] md:text-xs flex items-center gap-1.5"
            >
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 3a1 1 0 011 1v5.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 111.414-1.414L9 9.586V4a1 1 0 011-1zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" /></svg>
              <span className="hidden sm:inline">Tải PDF</span>
            </button>
            
            <button onClick={() => setShowSuccessModal(true)} className="px-2.5 py-1.5 md:px-3 md:py-1.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-sm text-[10px] md:text-xs flex items-center gap-1.5 transition-all">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>
              <span>Xong</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 print:p-0">
          <div id="lesson-content" className="max-w-4xl mx-auto space-y-8 md:space-y-10 pb-12 print:space-y-8">
            <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-8">
              <div className="flex justify-between items-end"><h1 className="text-3xl font-bold">{currentLesson.title}</h1><span className="text-sm font-bold">Thầy Út - THCS Mỹ Thạnh Trung</span></div>
            </div>
            <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-10 relative print:p-0 print:border-none print:shadow-none transition-all">
              <div className="prose prose-indigo prose-sm md:prose-base max-w-none text-slate-700 theory-content" dangerouslySetInnerHTML={{ __html: currentLesson.theory }} />
            </section>
            
            <section className="space-y-6 relative">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center no-print">Luyện tập & Thực hành</h3>
              
              {isUploading && (
                <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                   <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 animate-bounce">
                     <div className="w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
                     <span className="text-xs font-bold text-slate-600">Thầy Út đang biên soạn câu hỏi mới...</span>
                   </div>
                </div>
              )}

              <div className={`space-y-4 md:space-y-6 transition-all ${isUploading ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                {currentLesson.questions.map((q, idx) => (
                  <div key={q.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 print:p-6 print:page-break-inside-avoid hover:shadow-md transition-shadow">
                    <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-bold uppercase mb-4 inline-block">Câu {idx + 1}</span>
                    {q.type === QuestionType.MULTIPLE_CHOICE && <MultipleChoice question={q} />}
                    {q.type === QuestionType.TRUE_FALSE && <TrueFalse question={q} />}
                    {q.type === QuestionType.SHORT_ANSWER && <ShortAnswer question={q} />}
                    {q.type === QuestionType.MATCHING && <Matching question={q} />}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm no-print">
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in duration-300">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Hoàn thành!</h3>
              <p className="text-sm text-slate-600 mb-6">Thầy Út chúc mừng bạn đã học xong bài <strong>{currentLesson.title}</strong>.</p>
              <button onClick={() => setShowSuccessModal(false)} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Quay lại</button>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .theory-content h1, .theory-content h2 { font-weight: 700; color: #1e293b; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .theory-content h1 { font-size: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
        .theory-content h2 { font-size: 1.25rem; }
        .theory-content p { margin-bottom: 1rem; line-height: 1.6; }
        .theory-content ul { list-style-type: disc; padding-left: 1.25rem; margin-bottom: 1rem; }
        @media print { .no-print { display: none !important; } .print-container { height: auto; overflow: visible; } body { background: white; } }
      `}</style>
    </div>
  );
};

export default App;
