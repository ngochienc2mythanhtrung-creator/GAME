
import { Lesson, QuestionType } from "../types";

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: "lesson-intro",
    title: "Chào mừng bạn đến với Edu-Path",
    theory: `
      <h2 class="text-2xl font-bold mb-4">Hướng dẫn sử dụng</h2>
      <p class="mb-4">Hệ thống này cho phép bạn tạo ra các bài học tương tác từ tài liệu của chính mình. Chỉ cần tải lên file PDF hoặc Text, AI sẽ tự động phân tích và tạo bài học.</p>
      <div class="bg-indigo-50 border-l-4 border-indigo-500 p-4 my-4">
        <p class="text-indigo-700"><strong>Ví dụ Toán học:</strong> Bạn có thể chèn các công thức toán học như $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$ và nó sẽ được hiển thị đẹp mắt nhờ MathJax.</p>
      </div>
      <p>Dưới đây là một số câu hỏi mẫu để bạn làm quen với các dạng tương tác:</p>
    `,
    questions: [
      {
        id: "q1",
        type: QuestionType.MULTIPLE_CHOICE,
        prompt: "Ai là người tạo ra bài học này?",
        options: [
          { text: "Người dùng tải lên", feedback: "Đúng rồi! Bạn có thể tải bất kỳ tài liệu nào." },
          { text: "Hệ thống tự có sẵn", feedback: "Sai rồi, hệ thống linh hoạt theo nội dung bạn cung cấp." },
          { text: "ChatGPT", feedback: "Không, đây là sức mạnh của Gemini!" }
        ],
        correctIndex: 0
      },
      {
        id: "q2",
        type: QuestionType.TRUE_FALSE,
        prompt: "Đánh giá các nhận định sau về hệ thống:",
        statements: [
          { statement: "Hệ thống hỗ trợ file PDF.", isTrue: true, explanation: "Hệ thống sử dụng PDF.js để đọc file." },
          { statement: "MathJax không được hỗ trợ.", isTrue: false, explanation: "Ngược lại, MathJax được hỗ trợ mạnh mẽ cho các biểu thức toán học." }
        ]
      },
      {
        id: "q3",
        type: QuestionType.SHORT_ANSWER,
        prompt: "Thủ đô của Việt Nam là gì?",
        correctAnswer: "Hà Nội",
        explanation: "Hà Nội là thủ đô ngàn năm văn hiến của Việt Nam."
      }
    ]
  }
];
