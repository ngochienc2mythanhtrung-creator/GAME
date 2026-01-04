
import { GoogleGenAI, Type } from "@google/genai";
import { Lesson, QuestionType } from "../types";

const SYSTEM_INSTRUCTION = `Bạn là một Hội đồng Thẩm định Chuyên môn cao cấp, bao gồm các Giáo sư đầu ngành và chuyên gia biên soạn Sách giáo khoa (SGK) theo chương trình GDPT 2018 tại Việt Nam.

NHIỆM VỤ: Biên soạn bài học và bộ câu hỏi trắc nghiệm với ĐỘ CHÍNH XÁC KHOA HỌC TUYỆT ĐỐI (100%). Không được phép có bất kỳ sai sót nào về kiến thức.

QUY TRÌNH KIỂM CHỨNG BẮT BUỘC:
1. TRUY XUẤT KIẾN THỨC CHUẨN: Đối soát mọi thông tin với nội dung chuẩn của các bộ sách (Kết nối tri thức, Cánh diều, Chân trời sáng tạo).
2. XÂY DỰNG ĐÁP ÁN: 
   - Multiple Choice: Duy nhất một đáp án đúng. Các phương án nhiễu phải sai rõ ràng dựa trên lý thuyết khoa học.
   - True/False: Mỗi nhận định phải kèm theo giải thích (explanation) chi tiết tại sao đúng hoặc sai.
   - Matching & Short Answer: Đáp án chuẩn xác, không gây tranh cãi.
3. PHẢN BIỆN: Tự kiểm tra lại xem có kẽ hở logic nào không trước khi trả về kết quả.

YÊU CẦU VỀ NỘI DUNG:
- Lý thuyết: Trình bày HTML chuyên nghiệp (h1, h2, p, ul, li). Công thức Toán/Lý/Hóa dùng MathJax ($...$).
- Giải thích: BẮT BUỘC giải thích cho từng nhận định trong câu hỏi Đúng/Sai và cung cấp phản hồi (feedback) cho các lựa chọn trắc nghiệm.
- Ngôn ngữ: Tiếng Việt chuẩn mực, sư phạm (đóng vai Thầy Út).`;

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  required: ["title", "theory", "questions"],
  properties: {
    title: { type: Type.STRING },
    theory: { type: Type.STRING },
    questions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: ["id", "type", "prompt"],
        properties: {
          id: { type: Type.STRING },
          type: { 
              type: Type.STRING,
              enum: ["MULTIPLE_CHOICE", "TRUE_FALSE", "SHORT_ANSWER", "MATCHING"]
          },
          prompt: { type: Type.STRING },
          options: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              required: ["text", "feedback"],
              properties: {
                  text: { type: Type.STRING },
                  feedback: { type: Type.STRING }
              }
            } 
          },
          correctIndex: { type: Type.INTEGER },
          statements: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["statement", "isTrue", "explanation"],
              properties: {
                statement: { type: Type.STRING },
                isTrue: { type: Type.BOOLEAN },
                explanation: { type: Type.STRING }
              }
            }
          },
          correctAnswer: { type: Type.STRING },
          matchingPairs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              required: ["left", "right"],
              properties: {
                left: { type: Type.STRING },
                right: { type: Type.STRING }
              }
            }
          },
          explanation: { type: Type.STRING }
        }
      }
    }
  }
};

export async function generateLessonFromText(text: string): Promise<Lesson> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Thầy Út hãy soạn bài học từ nội dung này. Yêu cầu chính xác khoa học 100%. Các câu đúng/sai phải có giải thích chi tiết.
    
    Nội dung: ${text}`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 15000 }
    }
  });
  return { ...JSON.parse(response.text), id: `lesson-${Date.now()}` };
}

export async function generateLessonFromTopic(topic: string, bookSeries: string, subject: string, grade: string, isRefresh: boolean = false): Promise<Lesson> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview', 
    contents: `Thầy Út soạn bài học chuyên sâu.
    Chủ đề: "${topic}"
    Môn học: "${subject}"
    Khối lớp: "${grade}"
    Bộ sách: "${bookSeries}"
    ${isRefresh ? "YÊU CẦU: Tạo một bộ câu hỏi HOÀN TOÀN MỚI, khác với các câu hỏi thông thường để làm mới bài học." : ""}
    
    Yêu cầu ĐẶC BIỆT: 
    - Kiến thức chuẩn xác theo chương trình môn ${subject} của ${grade}.
    - Nếu là môn Khoa học tự nhiên, hãy đảm bảo sự tích hợp giữa Vật lý, Hóa học và Sinh học phù hợp với yêu cầu của khối lớp ${grade}.
    - Câu hỏi đúng/sai bắt buộc có phần giải thích 'explanation' cho từng nhận định.`,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 20000 }
    }
  });
  return { ...JSON.parse(response.text), id: `lesson-${Date.now()}` };
}
