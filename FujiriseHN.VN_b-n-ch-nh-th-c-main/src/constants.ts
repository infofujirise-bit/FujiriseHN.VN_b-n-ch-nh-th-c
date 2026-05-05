export const CONTACT_INFO = {
  hotline: "0868.882.210",
  email: "info.fujirise@gmail.com",
  address: "Tầng 2 VA03B-6, Villa Hoàng Thành, KĐT mới Mỗ Lao, Phường Đại Mỗ, TP Hà Nội",
  zalo: "https://zalo.me/0868822210",
  facebook: "https://facebook.com/fujirise",
};

export const NAVIGATION = [
  { name: 'Về chúng tôi', href: '/#about' },
  { 
    name: 'Sản phẩm', 
    href: '/#products',
    isMegaMenu: true,
    children: [
      { name: 'Thang máy gia đình sàn nâng', href: '/#products', image: 'https://images.unsplash.com/photo-1544427920-c49ccf08c334?auto=format&fit=crop&q=80&w=400', desc: 'Giải pháp tối ưu cho không gian nhỏ hẹp' },
      { name: 'Thang máy Kính quan sát', href: '/#products', image: 'https://images.unsplash.com/photo-1518177581177-380e2270dd7a?auto=format&fit=crop&q=80&w=400', desc: 'Tầm nhìn panorama đẳng cấp' },
    ]
  },
  { name: 'Công trình', href: '/#projects' },
  { 
    name: 'Tin tức', 
    href: '/#news',
    children: [
      { name: 'Tin tức và sự kiện', href: '/#news' },
      { name: 'Tuyển dụng', href: '/#careers' }
    ]
  },
  { 
    name: 'Liên hệ', 
    href: '/#contact',
    children: [
      { name: 'Tư vấn', href: '/#contact' },
      { name: 'FAQ', href: '/#faq' }
    ]
  },
];

export const CAREERS = [
  {
    id: 1,
    title: "Nhân viên Kinh doanh (Sales)",
    location: "Hà Nội",
    type: "Toàn thời gian",
    description: "Tìm kiếm và chăm sóc khách hàng tiềm năng cho giải pháp thang máy gia đình cao cấp.",
  },
  {
    id: 2,
    id_code: "TECH-01",
    title: "Kỹ thuật viên Lắp đặt",
    location: "Hà Nội/Toàn quốc",
    type: "Toàn thời gian",
    description: "Lắp đặt và vận hành hệ thống thang máy theo tiêu chuẩn an toàn quốc tế.",
  },
  {
    id: 3,
    title: "Chuyên viên Marketing",
    location: "Hà Nội",
    type: "Toàn thời gian",
    description: "Xây dựng hình ảnh thương hiệu Fujirise trên các nền tảng số.",
  },
];

export const PRODUCTS = [
  {
    id: 1,
    title: "thang máy gia đình sàn nâng",
    category: "Homelift",
    description: "Giải pháp tối ưu cho không gian nhỏ hẹp, sang trọng và tiện nghi. Thiết kế tối giản, dễ dàng lắp đặt cho nhà cải tạo.",
    image: "https://images.unsplash.com/photo-1544427920-c49ccf08c334?auto=format&fit=crop&q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1544427920-c49ccf08c334?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=1000"
    ],
    specs: {
      load: "250kg - 320kg",
      speed: "0.4m/s",
      pit: "Chỉ từ 300mm",
      power: "2.2kW",
      origin: "Máy kéo Fuji (Nhập khẩu)",
      material: "Inox sọc nhuyễn cao cấp",
    }
  },
  {
    id: 2,
    title: "Thang máy Kính quan sát",
    category: "Homelift",
    description: "Tầm nhìn panorama đẳng cấp, nâng tầm kiến trúc ngôi nhà. Kính cường lực an toàn tạo cảm giác không gian mở rộng.",
    image: "https://images.unsplash.com/photo-1518177581177-380e2270dd7a?auto=format&fit=crop&q=80&w=1000",
    images: [
      "https://images.unsplash.com/photo-1518177581177-380e2270dd7a?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1550503192-23fdd43b593a?auto=format&fit=crop&q=80&w=1000"
    ],
    specs: {
      load: "320kg - 450kg",
      speed: "0.6m/s - 1.0m/s",
      pit: "500mm",
      power: "3.7kW",
      origin: "Công nghệ không phòng máy",
      material: "Kính cường lực 2 lớp an toàn",
    }
  },
];

export const FAQS = [
  {
    q: "Chi phí lắp thang máy gia đình khoảng bao nhiêu?",
    a: "Tùy vào dòng thang, số tầng và vật liệu, chi phí thường từ 300 triệu đến hơn 1 tỷ đồng. Chúng tôi sẽ khảo sát thực tế để tư vấn phương án phù hợp nhất với ngân sách."
  },
  {
    q: "Nhà tôi có diện tích nhỏ, có lắp được không?",
    a: "Hoàn toàn được. Hiện nay có nhiều giải pháp thang máy hố nhỏ, không cần phòng máy, phù hợp cả nhà phố diện tích hạn chế.\n•  Với thang nhỏ (2–3 người):\n👉 Có thể làm hố thang từ 1000 x 1000 mm\n•  Với thang phổ biến (4–5 người):\n👉 Nên từ 1300 x 1300 mm trở lên"
  },
  {
    q: "Lắp thang máy có cần xây hố thang từ đầu không?",
    a: "Nếu là nhà xây mới, nên thiết kế từ đầu. Với nhà cải tạo, vẫn có thể lắp bằng khung thép hoặc kính, không ảnh hưởng nhiều đến kết cấu."
  },
  {
    q: "Thang máy gia đình có tốn điện không?",
    a: "Mức tiêu thụ điện tương đương một thiết bị gia dụng lớn (như điều hòa), khá tiết kiệm nhờ công nghệ hiện đại."
  },
  {
    q: "Khi mất điện thì thang có hoạt động không?",
    a: "Thang được trang bị hệ thống cứu hộ tự động (ARD), giúp đưa cabin về tầng gần nhất và mở cửa an toàn."
  },
  {
    q: "Thang máy có an toàn cho trẻ em và người lớn tuổi không?",
    a: "Rất an toàn. Thang có đầy đủ cảm biến, chống kẹt cửa, dừng khẩn cấp… phù hợp cho mọi thành viên trong gia đình."
  },
  {
    q: "Thời gian lắp đặt thang máy là bao lâu?",
    a: "Thông thường từ 120 ngày, tính từ ngày ký hợp đồng, báo giá thang máy."
  },
  {
    q: "Có cần bảo trì thường xuyên không?",
    a: "Nên bảo trì định kỳ 1–2 tháng/lần để đảm bảo thang luôn vận hành ổn định và kéo dài tuổi thọ."
  },
  {
    q: "Thang máy có gây tiếng ồn không?",
    a: "Các dòng thang hiện đại vận hành rất êm ái, gần như không gây ảnh hưởng đến sinh hoạt gia đình."
  },
  {
    q: "Có thể thiết kế thang theo nội thất nhà không?",
    a: "Hoàn toàn có thể. Khách hàng có thể tùy chọn vật liệu như kính, inox, gỗ… để phù hợp phong cách kiến trúc."
  },
  {
    q: "Nên chọn thang máy kính hay thang truyền thống?",
    a: "•\tThang kính: đẹp, hiện đại, phù hợp nhà mới\n•\tThang truyền thống: chi phí tốt hơn, bền bỉ\n→ Tùy nhu cầu và ngân sách"
  },
  {
    q: "Chiều cao tầng trên cùng tối thiểu bao nhiêu?",
    a: "→ Chiều cao tầng trên cùng (OH) tối thiểu Từ 2600 mm, tùy theo loại thang. Đội ngũ kỹ thuật sẽ khảo sát và tư vấn phương án phù hợp để đảm bảo an toàn và thẩm mỹ."
  },
  {
    q: "Có cần xin giấy phép khi lắp thang máy không?",
    a: "Thông thường không cần giấy phép riêng, nhưng cần tuân thủ thiết kế xây dựng và tiêu chuẩn an toàn."
  },
  {
    q: "Lắp thang máy có làm tăng giá trị ngôi nhà không?",
    a: "Có. Thang máy giúp tăng tiện nghi, thẩm mỹ và giá trị bất động sản đáng kể."
  },
  {
    q: "Tôi nên chọn dòng thang nào phù hợp?",
    a: "•\tNgân sách vừa: chọn dòng tiêu chuẩn\n•\tƯu tiên thẩm mỹ: chọn dòng kính\n•\tCao cấp: chọn dòng luxury\n→ Chúng tôi sẽ tư vấn chi tiết theo nhu cầu thực tế của bạn."
  }
];

export let cachedSettingsPromise: Promise<any> | null = null;

export const getCachedSettings = async (supabaseClient: any) => {
  if (!cachedSettingsPromise) {
    cachedSettingsPromise = supabaseClient.from('site_settings').select('content_dict').eq('id', 'default').single().then((res: any) => {
      if (res.error) {
        console.error("Lỗi Supabase (Có thể do RLS đang chặn quyền ĐỌC):", res.error.message);
      }
      return res;
    });
  }
  return cachedSettingsPromise;
};

export const clearSettingsCache = () => {
  cachedSettingsPromise = null;
};

export const DUMMY_POSTS = [
  {
    id: 1,
    title: "Triển lãm Công nghệ Thang máy Gia đình Quốc tế 2024",
    category: "Sự kiện",
    summary: "Fujirise hân hạnh góp mặt tại triển lãm công nghệ lớn nhất năm với hệ sinh thái thang máy thông minh mới nhất.",
    content: "Nội dung chi tiết đang được cập nhật. Đây là bản xem trước của hệ thống...\n\nSự kiện này đánh dấu sự phát triển vượt bậc của hệ sinh thái thang máy gia đình.",
    imageUrl: "https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1555505012-1c94d6983d7b?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Ra mắt dòng thang máy kính không hố pit hoàn toàn mới",
    category: "Tin tức",
    summary: "Giải pháp đột phá cho nhà cải tạo: Thang máy kính 360 độ không yêu cầu đào sâu nền móng, giữ nguyên cấu trúc nhà.",
    content: "Nội dung chi tiết đang được cập nhật. Thang máy kính đang dần trở thành xu hướng...\n\nPhù hợp cho mọi dạng kiến trúc từ tân cổ điển đến hiện đại.",
    imageUrl: "https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1515260268569-9271009adfdb?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 3,
    title: "Hội thảo: Giải pháp di chuyển an toàn cho người cao tuổi",
    category: "Sự kiện",
    summary: "Cùng các chuyên gia y tế và kỹ sư phân tích tầm quan trọng của hệ thống cứu hộ tự động trong thang máy gia đình.",
    content: "Nội dung chi tiết đang được cập nhật. Hệ thống ARD (Auto Rescue Device) là thiết yếu...",
    imageUrl: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
    images: ["https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800"],
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];
