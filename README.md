# Hướng dẫn sử dụng Website Fujirise

Chào mừng bạn đến với hệ thống website thang máy gia đình cao cấp Fujirise. Đây là website được lập trình với cấu trúc chuyên nghiệp, dễ dàng mở rộng và tối ưu cho SEO.

## 1. Thông tin quản trị (Supabase)
Hệ thống đã được chuyển sang sử dụng **Supabase** để lưu trữ dữ liệu và xác thực:
- **Đường dẫn Admin:** `/fujirise/admin`
- **Xác thực:** Sử dụng Google Login qua Supabase Auth.
- **Cách cấp quyền Admin:**
  1. Truy cập [Supabase Dashboard](https://supabase.com/).
  2. Tạo một Table tên là `admins`.
  3. Cấu trúc Table `admins`:
     - `id`: uuid (Primary Key, khớp với User ID trong Auth).
     - `email`: text.
  4. Thêm một dòng mới với ID là **UID** của bạn (Lấy UID sau khi bạn nhấn đăng nhập Google lần đầu trên web, nếu bị báo lỗi, hãy copy UID đó dán vào bảng).

## 2. Cấu trúc Database (Supabase)
Hệ thống sử dụng 3 bảng dữ liệu chính và 1 kho lưu trữ (Storage bucket `images`):

**Bảng `leads` (Lưu thông tin Form tư vấn & ứng tuyển):**
- `id`: uuid (Primary Key)
- `name`: text (Tên khách hàng)
- `phone`: text (Số điện thoại)
- `email`: text (Email - optional)
- `message`: text (Nội dung tư vấn)
- `status`: text (Mặc định là 'new')
- `created_at`: timestamptz (Mặc định `now()`)

**Bảng `admins` (Lưu tài khoản nhân viên):**
- `id`: uuid (Primary Key, tự động tạo)
- `email`: text (Email đăng nhập)
- `password`: text (Mật khẩu)
- `full_name`: text (Tên hiển thị)
- `role`: text (Vai trò: `admin` cho toàn quyền, `editor` cho quyền sửa nội dung)

**Bảng `site_settings`:** Chứa `id` ('default') và `content_dict` (JSONB) lưu toàn bộ cài đặt động của website (sản phẩm, mô phỏng, tuyển dụng, giao diện).

## 3. Deploy lên Vercel
1. Upload toàn bộ code này lên Github.
2. Truy cập [Vercel](https://vercel.com/) và Import dự án từ Github.
3. Thêm các **Environment Variables** (Biến môi trường) sau vào Vercel Settings:
   - `VITE_SUPABASE_URL`: Link Supabase của bạn.
   - `VITE_SUPABASE_ANON_KEY`: Mã Anon Key của Supabase.
   - `VITE_TELEGRAM_BOT_TOKEN`: `8650537472:AAEL9KW4PazTORaf05am8dti6OsIQcA12mo`
4. Nhấn **Deploy**. Vercel sẽ tự động build và cấp link website cho bạn.

## 3. Quản lý nhận thông báo qua Telegram
Thông tin từ Form liên hệ sẽ gửi thẳng về Bot Telegram của bạn:
1. Mở file `src/lib/telegram.ts`
2. Thay đổi `CHAT_ID` bằng ID tài khoản của bạn (Dùng bot @userinfobot để lấy ID).
3. Token bot đã được cài đặt sẵn: `8650537472:AAEL9KW4PazTORaf05am8dti6OsIQcA12mo`.

## 4. Cấu trúc thư mục (Cho người mới)
- `src/components`: Chứa các "viên gạch" của web (Menu, Banner, Chân trang...). Nếu bạn muốn sửa giao diện phần nào, hãy vào đây.
- `src/pages`: Chứa các trang chính (Trang chủ Home, Trang quản trị Admin).
- `src/index.css`: Nơi quản lý màu sắc chủ đạo. Tìm `--color-fuji-blue` để đổi màu xanh thương hiệu.
- `src/constants.ts`: Nơi chứa dữ liệu "cứng" như danh sách sản phẩm, tin tức.

## 5. Triển khai lên Github và Vercel
1. Tạo một Repository mới trên Github của bạn.
2. Tải toàn bộ source code này lên (trừ thư mục `node_modules`).
3. Truy cập [Vercel.com](https://vercel.com), kết nối với Github.
4. Chọn dự án này và nhấn **Deploy**. Vercel sẽ tự động làm mọi thứ còn lại.

## 6. Lưu ý về Database (Firebase)
Website này đã sẵn sàng để kết nối với **Google Firebase** để lưu trữ dữ liệu Admin lâu dài. 
Khi bạn triển khai chính thức, hãy tạo một project trên Firebase Console và dán file cấu hình vào dự án.

---
**Chúc bạn sở hữu một website đẳng cấp và kinh doanh hồng phát!**
