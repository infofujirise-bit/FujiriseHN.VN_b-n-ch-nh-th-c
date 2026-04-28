import { supabase } from "../lib/supabase";


export const analyzeMarketingData = async () => {
  try {
    let apiKey = import.meta.env.VITE_GEMINI_API_KEY || "AIzaSyDzUO_-yu0h0gWMSB5asCZjOuYXviXpBus";
    try {
      const { data: settings } = await supabase.from('site_settings').select('content_dict').eq('id', 'default').single();
      if (settings?.content_dict?.api_config?.aiKey) {
        apiKey = settings.content_dict.api_config.aiKey;
      }
    } catch (e) {
      console.error("Could not fetch dynamic Gemini Key");
    }
    
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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Unknown AI API error");
    
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không nhận được nội dung từ AI.";
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return `Lỗi khi phân tích dữ liệu AI: ${error.message || "Chi tiết lỗi không xác định."}`;
  }
};
