export const CONTACT_INFO = {
  hotline: "0868822210",
  email: "info.fujirise@gmail.com",
  address: "Tầng 2, VA03B-6 Villa Hoàng Thành, Mỗ Lao, Hà Đông, Hà Nội",
  zalo: "https://zalo.me/0868822210",
  facebook: "https://facebook.com/fujirise",
};

export const NAVIGATION = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '#products' },
  { name: 'Về chúng tôi', href: '#about' },
  { name: 'Tuyển dụng', href: '#careers' },
  { name: 'Hỏi đáp', href: '#faq' },
  { name: 'Tư vấn', href: '#contact' },
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
    title: "Thang máy gia đình Mini",
    description: "Giải pháp tối ưu cho không gian nhỏ hẹp, sang trọng và tiện nghi.",
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
    description: "Tầm nhìn panorama đẳng cấp, nâng tầm kiến trúc ngôi nhà.",
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
  {
    id: 3,
    title: "Thang máy Inox vàng gương",
    description: "Vẻ đẹp quý tộc với họa tiết chạm khắc tinh xảo.",
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1618219908412-a29a1bb7b86e?auto=format&fit=crop&q=80&w=1000",
      "https://images.unsplash.com/photo-1600607687940-4e2a09695d51?auto=format&fit=crop&q=80&w=1000"
    ],
    specs: {
      load: "450kg - 630kg",
      speed: "1.0m/s",
      pit: "1200mm",
      power: "5.5kW",
      origin: "Đông bộ Fuji Global",
      material: "Inox gương mạ vàng PVD",
    }
  },
];

export const FAQS = [
  {
    q: "Thang máy gia đình cần diện tích tối thiểu bao nhiêu?",
    a: "Với công nghệ hiện đại, Fujirise có thể lắp đặt thang máy chỉ với diện tích thông thủy từ 1m x 1m (phù hợp cho thang 250kg)."
  },
  {
    q: "Hố Pit là gì? Có cần phải đào sâu không?",
    a: "Hố Pit là phần hố dưới chân thang. Với thang máy Fujirise, chúng tôi cung cấp giải pháp Pit nông chỉ từ 15cm - 30cm, không làm ảnh hưởng đến móng nhà."
  },
  {
    q: "Thang máy có tốn điện không?",
    a: "Thang máy gia đình hiện nay sử dụng biến tần tiết kiệm điện. Tiêu thụ điện năng chỉ tương đương với một chiếc tủ lạnh hoặc điều hòa 1.5 HP."
  },
  {
    q: "Cần lưu ý gì khi lắp thang máy cho nhà cũ (nhà cải tạo)?",
    a: "Nhà cải tạo thường ưu tiên thang khung thép để tiết kiệm diện tích và không cần xây cột bê tông. Fujirise chuyên cung cấp các giải pháp may đo riêng cho loại hình này."
  },
  {
    q: "Bao lâu thì cần bảo trì thang máy một lần?",
    a: "Để đảm bảo an toàn tuyệt đối, thang máy gia đình nên được bảo trì định kỳ 1-2 tháng/lần tùy tần suất sử dụng."
  },
  {
    q: "Thang máy có hoạt động khi mất điện không?",
    a: "Có. Tất cả thang máy Fujirise đều trang bị bộ cứu hộ tự động (ARD), giúp đưa thang về tầng gần nhất và mở cửa khi mất điện lưới."
  },
  {
    q: "Thang nội địa và thang nhập khẩu khác nhau thế nào?",
    a: "Thang nhập khẩu nguyên chiếc thường có kích thước cố định, trong khi thang Fujirise là dòng thang đồng bộ linh kiện nhập khẩu được lắp ráp trong nước, cho phép tùy chỉnh linh hoạt theo kích thước thực tế của từng nhà."
  },
  {
    q: "Chế độ bảo hành của Fujirise như thế nào?",
    a: "Chúng tôi bảo hành 24 tháng cho toàn bộ linh kiện và bảo trì miễn phí trong 12 tháng đầu tiên."
  },
  {
    q: "Lắp đặt thang máy mất bao lâu?",
    a: "Tổng thời gian từ khi đặt hàng đến khi bàn giao vận hành thường dao động từ 45 - 60 ngày (bao gồm thời gian sản xuất và lắp đặt)."
  },
  {
    q: "Tiếng ồn khi vận hành có lớn không?",
    a: "Với máy kéo không bánh răng Fuji Global, độ ồn chỉ dưới 50dB, cực kỳ êm ái và không làm ảnh hưởng đến sinh hoạt gia đình."
  },
  {
    q: "Có bao nhiêu loại cửa thang máy?",
    a: "Có 2 loại chính: Cửa mở tự động (2 cánh mở về 2 bên hoặc 1 bên) và cửa mở bằng tay (như cửa phòng, phù hợp cho nhà siêu nhỏ)."
  },
  {
    q: "Vật liệu nội thất có thể tùy chọn không?",
    a: "Khách hàng hoàn toàn có thể chọn inox sọc, inox gương, mạ vàng, vân gỗ hoặc kính cường lực tùy theo phong cách nội thất."
  },
  {
    q: "Tải trọng thang máy bao nhiêu là phù hợp?",
    a: "Gia đình 4-5 người thường dùng thang 320kg. Gia đình 6-8 người hoặc có nhu cầu vận chuyển đồ đạc nên dùng thang 450kg."
  },
  {
    q: "Cơ quan nào kiểm định an toàn thang máy?",
    a: "Sau khi lắp đặt, thang sẽ được Trung tâm kiểm định của Bộ Lao động - Thương binh và Xã hội cấp giấy chứng nhận an toàn mới được đưa vào sử dụng."
  }
];
