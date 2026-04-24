import { GoogleGenAI } from "@google/genai";
import { supabase } from "../lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "AIzaSyDzUO_-yu0h0gWMSB5asCZjOuYXviXpBus" });

export const analyzeMarketingData = async () => {
  try {
    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (!leads || leads.length === 0) return "Chưa có dữ liệu leads để phân tích.";

    const prompt = `
      Bạn là một chuyên gia Marketing cao cấp cho thương hiệu thang máy FUJIRISE.
      Dưới đây là danh sách các khách hàng tiềm năng (Leads) gần đây:
      ${JSON.stringify(leads)}

      Hãy thực hiện các việc sau:
      1. Phân tích xu hướng nhu cầu khách hàng (loại thang, khu vực, vấn đề họ quan tâm).
      2. Đưa ra 3 chiến lược Marketing cụ thể để tăng tỷ lệ chuyển đổi.
      3. Gợi ý nội dung quảng cáo hoặc bài viết mạng xã hội phù hợp với dữ liệu này.
      4. Đánh giá chất lượng leads hiện tại.

      Yêu cầu: Viết ngắn gọn, chuyên nghiệp, bằng tiếng Việt, dưới định dạng văn bản có thể gửi qua Telegram.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis Error:", error);
    return "Lỗi khi phân tích dữ liệu AI.";
  }
};
