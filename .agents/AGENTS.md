# Nexo Mobile App - Quy tắc & Hướng dẫn dành cho AI Agent

Tài liệu này định nghĩa các quy tắc phát triển, kiến trúc dự án và quy trình làm việc dành cho AI Agent khi tương tác và lập trình trong repository `nexo-app`.

---

## 1. Giới thiệu Dự án & Công nghệ

- **Dự án**: Nexo Mobile App (Ứng dụng di động quản lý tài chính cá nhân, giao dịch thu chi).
- **Ngôn ngữ & Framework**: React Native 0.79+, Expo SDK 53+ (Expo Router v5, TypeScript).
- **UI & Animations**: Lucide Icons, Moti, React Native Reanimated, Expo Blur/LinearGradient.
- **Form & Validation**: React Hook Form (`@hookform/resolvers`), Yup validation.
- **Thời gian & Đa ngôn ngữ**: Moment.js (quản lý ngày tháng/múi giờ).
- **Backend API Integration**: Axios giao tiếp với `nexo-app-api` (Golang REST API tại `http://localhost:3001/api/v1`).

---

## 2. Kiến trúc & Cấu trúc Dự án (Architecture)

Mã nguồn được tổ chức theo mô hình Expo Router & Component-Driven Architecture:

```
nexo-app/
├── src/
│   ├── app/             # Router & Navigation (Expo Router file-based routing)
│   ├── components/      # UI Components dùng chung & theo màn hình
│   ├── services/        # HTTP API Client & Services (Axios, Auth, Transactions)
│   ├── hooks/           # Custom React Hooks
│   ├── constants/       # Hằng số, Color tokens, Enums
│   ├── utils/           # Helper functions (Moment formatting, currency format, v.v.)
│   └── types/           # TypeScript interfaces & types
```

---

## 3. Quy tắc Bắt buộc dành cho AI Agent (Agent Rules)

### 🚫 Quy tắc về Git & Kiểm soát Mã nguồn
1. **Không tự động commit code**: Agent KHÔNG ĐƯỢC tự động chạy `git commit` trừ khi có chỉ định trực tiếp từ User.
2. **Không tự động push code**: Agent KHÔNG ĐƯỢC tự động chạy `git push` lên bất kỳ branch/remote nào.

### 🕒 Quy tắc Xử lý Thời gian (Date & Time Handling)
- Tất cả các thao tác xử lý, định dạng, tính toán ngày tháng và chuyển đổi múi giờ **bắt buộc phải sử dụng `moment`** (Moment.js) thay vì `Date` thuần của JavaScript để đảm bảo tính đồng bộ với `nexo-web` và `nexo-app-api`.
- Ví dụ gửi API / Hiển thị: `moment(date).format('YYYY-MM-DD')` hoặc `moment(date).toISOString()`.

### 🎨 Quy tắc Styling & UI/UX Mobile
- Ưu tiên sử dụng `StyleSheet.create` chuẩn của React Native hoặc các component được đóng gói sẵn.
- Đảm bảo layout responsive với Safe Area (`react-native-safe-area-context`) và hỗ trợ mượt mà trên cả iOS & Android.
- Tất cả icon sử dụng `lucide-react-native` hoặc `@expo/vector-icons`.

### 🏷️ Hằng số & Enum (Constants & Enums)
- Khai báo hằng số rõ ràng cho loại giao dịch (`INCOME` / `EXPENSE`), status, API endpoints. Tránh hardcode string trực tiếp trong UI components.

### 📂 Quy tắc Barrel Export (Import Cleaner)
- Sử dụng file `index.ts` ở cấp thư mục (ví dụ `src/components/index.ts`, `src/utils/index.ts`) để gộp export. Import gọn gàng từ folder gốc thay vì gọi deep path.

### 📱 Quy tắc Kiểm thử & Native Build
- Luôn kiểm tra tính tương thích TypeScript (`npx tsc --noEmit` hoặc `npm run lint`) trước khi xác nhận hoàn thành công việc.
