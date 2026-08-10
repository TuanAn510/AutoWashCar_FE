# Prompt FE - Tổng hợp chỉnh UI ADMIN: Báo cáo, Lịch hẹn, Lịch sử dịch vụ, Khách hàng và đồng bộ layout

## 1. Vai trò

Bạn là **Senior Frontend Developer React + TypeScript + UI/UX Designer**.

Hãy chỉnh sửa và hoàn thiện các màn hình thuộc **role Admin** trong hệ thống **Shinecraft / Gara CRM** theo các yêu cầu bên dưới.

Người phụ trách phần ADMIN: **Hoàng Châu**.

Mục tiêu chính:

- Làm lại UI Admin đẹp hơn, gọn hơn và đồng bộ layout giữa các trang.
- Không để mỗi page một kiểu giao diện khác nhau.
- Loại bỏ các thông tin kỹ thuật gây khó hiểu cho người dùng cuối.
- Cải thiện dashboard/báo cáo, lịch hẹn, lịch sử dịch vụ và quản lý khách hàng.
- Đồng bộ cách hiển thị trạng thái trong các form tạo/sửa.
- Hiện tại API thanh toán **chưa integrate trên UI**, phần này sẽ cập nhật sau, không fake thanh toán ở FE.

---

## 2. Nguyên tắc UI chung cho toàn bộ Admin

Áp dụng cho tất cả màn Admin:

- Layout thống nhất giữa các page:
  - Header page.
  - KPI / summary cards nếu có.
  - Search/filter.
  - Table/list.
  - Dialog/modal.
- Không để mỗi page một kiểu card, spacing, button, filter khác nhau.
- Giảm khoảng trắng dư.
- Table phải gọn, dễ scan thông tin.
- Text dài cần dùng `truncate`, `line-clamp-1`, `line-clamp-2` hoặc tooltip.
- Số liệu, tiền tệ và ngày tháng phải format nhất quán theo kiểu Việt Nam.
- Không hiển thị các dòng kỹ thuật kiểu:
  - `Nguồn: service_histories.totalPrice`
  - `Source: ...`
  - `_id MongoDB`
  - Tên field database
- Người dùng Admin chỉ cần hiểu ý nghĩa nghiệp vụ, không cần biết nguồn collection/database.
- Action trong table nên đồng bộ, ưu tiên dùng dropdown ba chấm `...`.
- Các button destructive như `Hủy`, `Xóa`, `Tạm khóa` phải có confirm dialog.
- Không thêm mock data.
- Không đổi API nếu không cần.
- Không làm phát sinh horizontal scroll toàn trang.
- Nếu table bắt buộc scroll ngang, chỉ scroll trong table wrapper.

---

## 3. Quy chuẩn format chung

### 3.1. Format số

Dùng format Việt Nam:

```ts
export const formatNumberVi = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return new Intl.NumberFormat('vi-VN').format(value);
};
```

Ví dụ:

```txt
1.250
12.500
1.000.000
```

### 3.2. Format tiền tệ

Dùng format VND thống nhất:

```ts
export const formatCurrencyVi = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0đ';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};
```

Không để số tiền xuống dòng.

Gợi ý class:

```tsx
<span className="whitespace-nowrap">{formatCurrencyVi(value)}</span>
```

### 3.3. Format ngày

Dùng format Việt Nam:

```ts
export const formatDateVi = (date?: string | Date | null) => {
  if (!date) return 'Không có dữ liệu';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};
```

Nếu có giờ:

```ts
export const formatDateTimeVi = (date?: string | Date | null) => {
  if (!date) return 'Không có dữ liệu';

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
```

---

# 4. Báo cáo & Thống kê Admin

Route gợi ý:

```txt
/admin/reports
/admin/dashboard
```

Nếu project dùng route khác, hãy dùng route hiện tại.

## 4.1. Chỉ hiển thị Top 3

Chỉ hiển thị **Top 3** cho các khối:

```txt
Dịch vụ đặt nhiều
Dịch vụ đặt ít
Hãng xe phổ biến
```

Nếu API trả nhiều item, FE chỉ render 3 item đầu:

```ts
const topItems = items.slice(0, 3);
```

Không render quá 3 item trên dashboard. Nếu muốn xem đầy đủ, có thể thêm nút `Xem báo cáo chi tiết` nhưng không bắt buộc.

## 4.2. Card KPI nên dùng màu nhấn

Hiện tại KPI card đang toàn màu trắng nên dashboard nhìn nhạt và thiếu điểm nhấn.

Yêu cầu:

- KPI card nên có màu nhấn nhẹ.
- Không dùng màu quá gắt.
- Có thể dùng nền nhạt, border màu hoặc icon background.
- Mỗi nhóm KPI nên có màu khác nhau nhưng vẫn đồng bộ.

Gợi ý:

```txt
Doanh thu: xanh lá nhẹ
Lịch hẹn: xanh dương nhẹ
Khách hàng: tím nhẹ
Dịch vụ: cam nhẹ
Loyalty: vàng nhẹ
```

Ví dụ:

```tsx
<Card className="border-emerald-200 bg-emerald-50">...</Card>
```

hoặc:

```tsx
<div className="rounded-xl border bg-card p-4">
  <div className="rounded-lg bg-primary/10 p-2">
    <Icon className="text-primary" />
  </div>
</div>
```

## 4.3. Biểu đồ doanh thu

Biểu đồ doanh thu nên dùng:

```txt
Bar Chart
```

hoặc:

```txt
Line Chart
```

Tùy dữ liệu:

- Bar Chart: phù hợp so sánh doanh thu theo ngày/tháng.
- Line Chart: phù hợp thể hiện xu hướng doanh thu theo thời gian.

Yêu cầu UI:

- Có title rõ ràng: `Doanh thu theo thời gian`.
- Có tooltip khi hover.
- Tooltip format tiền VND.
- Nếu không có dữ liệu, hiển thị empty state thay vì chart rỗng:

```txt
Chưa có dữ liệu doanh thu trong khoảng thời gian này
```

## 4.4. Thêm thông tin thay đổi so với kỳ trước

Các KPI quan trọng nên hiển thị thay đổi so với kỳ trước:

```txt
+12% so với kỳ trước
-5% so với kỳ trước
Không đổi so với kỳ trước
```

Áp dụng nếu có thể tính từ dữ liệu hiện tại:

- Doanh thu.
- Tổng lịch hẹn.
- Lịch hẹn hoàn thành.
- Khách hàng mới.
- Dịch vụ hoàn thành.
- Điểm loyalty đã phát hành nếu có.

Nếu API chưa trả dữ liệu kỳ trước, không hard-code phần trăm. Hiển thị trung tính:

```txt
Chưa có dữ liệu kỳ trước
```

Gợi ý helper:

```ts
export const calculateChangePercent = (current: number, previous: number) => {
  if (!previous) return null;
  return ((current - previous) / previous) * 100;
};
```

## 4.5. Định dạng số và tiền tệ nhất quán

Yêu cầu:

- Tất cả số lượng dùng `formatNumberVi`.
- Tất cả tiền dùng `formatCurrencyVi`.
- Không hiển thị lẫn lộn nhiều kiểu format khác nhau.

## 4.6. Loại bỏ text nguồn dữ liệu kỹ thuật

Không hiển thị các text như:

```txt
Nguồn: service_histories.totalPrice
Nguồn: appointments.status
```

Nếu cần giải thích, dùng ngôn ngữ nghiệp vụ:

```txt
Tổng doanh thu từ các dịch vụ đã hoàn thành
```

Hoặc bỏ hẳn nếu không cần.

## 4.7. Checklist Báo cáo & Thống kê

- [ ] `Dịch vụ đặt nhiều` chỉ hiển thị Top 3.
- [ ] `Dịch vụ đặt ít` chỉ hiển thị Top 3.
- [ ] `Hãng xe phổ biến` chỉ hiển thị Top 3.
- [ ] KPI card có màu nhấn, không còn toàn bộ màu trắng.
- [ ] Biểu đồ doanh thu dùng Bar Chart hoặc Line Chart.
- [ ] KPI có thông tin thay đổi so với kỳ trước nếu có dữ liệu.
- [ ] Số và tiền tệ format nhất quán.
- [ ] Không còn text nguồn dữ liệu kỹ thuật.
- [ ] Dashboard có empty state rõ khi không có dữ liệu.

---

# 5. Lịch hẹn Admin

Route gợi ý:

```txt
/admin/appointments
```

## 5.1. Action theo trạng thái lịch hẹn

Nếu lịch hẹn đang ở trạng thái:

```txt
pending
```

hoặc hiển thị tiếng Việt:

```txt
Chờ xác nhận
```

thì chỉ hiển thị các action chính:

```txt
Xác nhận
Hủy
```

Không hiển thị các action không phù hợp như:

- Bắt đầu xử lý.
- Hoàn thành.
- Đổi lịch nếu chưa cần.
- Phân công staff nếu workflow chưa xác nhận.

Nếu Admin bấm `Hủy`, phải yêu cầu nhập lý do hủy.

## 5.2. Xác nhận lịch hẹn

Action:

```txt
Xác nhận
```

Gọi API cập nhật status theo BE hiện tại, ví dụ:

```http
PATCH /api/appointments/:appointmentId/status
```

Payload gợi ý:

```json
{
  "status": "confirmed"
}
```

Sau thành công:

- Toast success.
- Refetch danh sách lịch hẹn.
- Refetch detail nếu đang mở.

## 5.3. Hủy lịch hẹn cần lý do

Action:

```txt
Hủy
```

Yêu cầu UI:

- Mở confirm dialog hoặc modal.
- Có textarea nhập lý do hủy.
- Không cho submit nếu lý do trống.
- Gọi API hủy lịch theo BE hiện tại, ví dụ:

```http
PATCH /api/appointments/:appointmentId/cancel
```

Payload gợi ý:

```json
{
  "reason": "Khách yêu cầu hủy lịch"
}
```

Nếu BE dùng field khác như `cancelReason`, hãy map đúng schema BE.

Sau thành công:

- Toast success.
- Refetch danh sách lịch hẹn.
- Refetch detail nếu đang mở.

## 5.4. Thêm bộ lọc theo ngày hẹn

Có thêm bộ lọc theo từng ngày hẹn để Admin mở ra ngày hôm nay xem có lịch nào không.

Ví dụ:

```txt
Hôm nay 23/06
```

UI gợi ý:

```txt
[Hôm nay] [Ngày mai] [Chọn ngày]
```

Hoặc trong filter panel:

```txt
Ngày hẹn: [Chọn ngày]
```

Placeholder:

```txt
Chọn ngày hẹn
```

Format hiển thị:

```txt
dd/mm/yyyy
```

Khi chọn ngày:

- Nếu BE có hỗ trợ query filter theo ngày, gửi params đúng schema.
- Nếu BE chưa hỗ trợ, filter client-side từ field ngày hẹn hiện có.
- Không dùng `mm/dd/yyyy`.

Empty state khi không có lịch:

```txt
Không có lịch hẹn nào trong ngày đã chọn
```

## 5.5. Lưu ý Payment API

Hiện tại API thanh toán **chưa integrate trên UI**.

Yêu cầu:

- Không ép làm payment status ở bước này.
- Không hiển thị action thanh toán nếu chưa sẵn sàng.
- Có thể để TODO rõ ràng trong code:

```ts
// TODO: Integrate payment status API later
```

- Không tự fake thanh toán ở FE.

## 5.6. Checklist Lịch hẹn Admin

- [ ] Lịch `pending/chờ xác nhận` chỉ hiện `Xác nhận` và `Hủy`.
- [ ] Hủy lịch yêu cầu nhập lý do.
- [ ] Có filter theo ngày hẹn.
- [ ] Có quick filter `Hôm nay` hoặc date picker `Chọn ngày`.
- [ ] Không dùng format `mm/dd/yyyy`.
- [ ] Empty state rõ khi ngày được chọn không có lịch.
- [ ] Không integrate payment API ở bước này.
- [ ] Không fake thanh toán ở FE.

---

# 6. Lịch sử dịch vụ Admin

Route gợi ý:

```txt
/admin/service-histories
```

## 6.1. Xem chi tiết lịch sử dịch vụ

Trong phần xem chi tiết đang hiển thị:

```txt
Appointment ID
```

và giá trị là `_id` của MongoDB. Thông tin này không cần thiết với Admin ở UI chính, gây kỹ thuật và khó hiểu.

Yêu cầu:

- Bỏ `Appointment ID` khỏi modal/drawer xem chi tiết.
- Nếu thật sự cần để debug, chỉ để trong khu vực `Thông tin kỹ thuật` collapse, mặc định đóng.
- Ưu tiên hiển thị thông tin nghiệp vụ:
  - Khách hàng.
  - Số điện thoại.
  - Xe.
  - Biển số.
  - Dịch vụ đã làm.
  - Staff xử lý.
  - Thời gian hoàn thành.
  - Tổng tiền.
  - Ghi chú.

Không hiển thị `_id MongoDB` ở nội dung chính.

## 6.2. Checklist Lịch sử dịch vụ Admin

- [ ] Modal chi tiết không còn hiển thị `Appointment ID`.
- [ ] Không hiển thị `_id MongoDB` ở khu vực chính.
- [ ] Thông tin chi tiết ưu tiên dữ liệu nghiệp vụ.
- [ ] Layout modal gọn và dễ đọc.

---

# 7. Quản lý khách hàng Admin

Route gợi ý:

```txt
/admin/customers
```

## 7.1. Bỏ cột Email nếu dữ liệu không có

Khách hàng hiện không có email, nên cột email trong bảng bị trống hoặc không có giá trị.

Yêu cầu:

- Bỏ cột `Email` khỏi bảng danh sách khách hàng.
- Nếu email tồn tại trong detail response thì có thể hiển thị trong modal chi tiết.
- Bảng chính chỉ giữ các cột hữu ích.

Cột gợi ý:

```txt
Khách hàng
Số điện thoại
Trạng thái
Ngày tham gia
Thao tác
```

Nếu có dữ liệu tổng xe/tổng lịch hẹn thì có thể thêm, nhưng không bắt buộc.

## 7.2. Nút thao tác chỉ gồm xem/sửa/xóa

Menu `Thao tác` trong bảng quản lý khách hàng chỉ gồm:

```txt
Xem
Sửa
Xóa
```

hoặc rõ hơn:

```txt
Xem chi tiết
Chỉnh sửa
Xóa / Tạm khóa
```

Không cần action:

- Xem lịch sử dịch vụ.
- Xem tích điểm / loyalty.

Nếu nghiệp vụ đang dùng soft delete/tạm khóa thay vì xóa vật lý, label nên là:

```txt
Tạm khóa
```

Nếu khách hàng đã bị tạm khóa:

```txt
Mở khóa
```

Nhưng menu cần gọn, không lặp chức năng với các page khác.

## 7.3. API cho xem/sửa/xóa

### Xem chi tiết

Dùng:

```http
GET /api/users/{userId}
```

Mục đích:

```txt
Admin/Staff lấy chi tiết user
```

### Sửa thông tin / trạng thái

Dùng:

```http
PATCH /api/users/{userId}
```

Mục đích:

```txt
Admin/Staff cập nhật user
```

Theo Swagger, API cập nhật các field quản trị:

```json
{
  "role": "staff",
  "isActive": true
}
```

Lưu ý:

- Không dùng API users để chỉnh loyalty points.
- Loyalty được quản lý qua LoyaltyAccount và endpoint loyalty riêng.
- Nếu action `Xóa` thực tế là tạm khóa, dùng `isActive: false`.
- Nếu cần mở khóa, dùng `isActive: true`.

## 7.4. Checklist Quản lý khách hàng

- [ ] Bỏ cột `Email` khỏi bảng nếu khách hàng không có email.
- [ ] Menu thao tác chỉ còn `Xem`, `Sửa`, `Xóa`.
- [ ] Không còn action lịch sử dịch vụ/tích điểm trong menu khách hàng.
- [ ] `Xem` gọi `GET /api/users/{userId}`.
- [ ] `Sửa/Xóa` dùng `PATCH /api/users/{userId}` nếu BE hiện hỗ trợ qua `isActive`.
- [ ] Không dùng API users để chỉnh loyalty.
- [ ] Bảng gọn hơn và không có cột trống.

---

# 8. Đồng bộ trạng thái trong form tạo/sửa

Áp dụng cho các page:

```txt
/admin/membership-programs
/admin/membership-tiers
/admin/rewards
/admin/promotions
/admin/service-categories
/admin/services
```

và các form tương tự có field trạng thái.

## 8.1. Vấn đề

Hiện các form tạo/sửa có thể đang dùng không đồng nhất:

- Trang này dùng checkbox.
- Trang kia dùng switch.
- Trang khác dùng select.
- Label trạng thái không đồng bộ.

Điều này làm UX thiếu nhất quán.

## 8.2. Yêu cầu

Chọn **một kiểu duy nhất** cho trạng thái trong form tạo/sửa.

Khuyến nghị dùng:

```txt
Switch
```

Vì trạng thái thường là boolean:

```txt
Đang hoạt động / Tạm ẩn
```

Áp dụng đồng bộ cho:

- Chương trình thành viên.
- Hạng thành viên.
- Phần thưởng.
- Khuyến mãi.
- Dịch vụ.
- Danh mục dịch vụ.

## 8.3. Label chuẩn

Dùng label:

```txt
Trạng thái
```

Switch text:

Nếu bật:

```txt
Đang hoạt động
```

Nếu tắt:

```txt
Tạm ẩn
```

Không dùng lẫn lộn:

```txt
Active
Inactive
Tắt
Enable
Disable
```

## 8.4. Gợi ý component dùng chung

Tạo component dùng chung nếu phù hợp:

```txt
components/admin/AdminStatusSwitch.tsx
```

Hoặc:

```txt
components/common/StatusSwitch.tsx
```

Gợi ý props:

```ts
type StatusSwitchProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  activeText?: string;
  inactiveText?: string;
};
```

Gợi ý UI:

```tsx
<div className="flex items-center justify-between rounded-lg border p-3">
  <div>
    <p className="text-sm font-medium">Trạng thái</p>
    <p className="text-xs text-muted-foreground">{checked ? 'Đang hoạt động' : 'Tạm ẩn'}</p>
  </div>

  <Switch checked={checked} onCheckedChange={onCheckedChange} />
</div>
```

## 8.5. Checklist trạng thái

- [ ] Các form tạo/sửa dùng cùng một kiểu control trạng thái.
- [ ] Ưu tiên dùng switch.
- [ ] Label là `Trạng thái`.
- [ ] Text bật là `Đang hoạt động`.
- [ ] Text tắt là `Tạm ẩn`.
- [ ] Không còn lẫn checkbox/switch/select cho cùng một kiểu trạng thái boolean.

---

# 9. Đồng bộ layout toàn bộ Admin

## 9.1. Page header

Mỗi page nên có header thống nhất:

```txt
Title
Description ngắn
Action chính nếu có
```

Ví dụ:

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight">...</h1>
    <p className="text-sm text-muted-foreground">...</p>
  </div>

  <div className="flex items-center gap-2">...</div>
</div>
```

## 9.2. KPI cards

- Cùng chiều cao.
- Cùng border radius.
- Cùng style icon.
- Có màu nhấn nhẹ.
- Không quá cao.
- Số liệu không xuống dòng.

## 9.3. Filter/search

- Đặt ngay trước table/list.
- Không quá nhiều khoảng trắng.
- Search luôn nằm bên trái.
- Filter trạng thái/date/category nằm bên phải hoặc cùng hàng.
- Responsive tự xuống dòng.

## 9.4. Table

- Header rõ.
- Row height vừa phải.
- Text dài truncate/line-clamp.
- Cột tiền căn phải.
- Cột thao tác ở cuối.
- Action menu đồng bộ.
- Không hiển thị field kỹ thuật nếu không cần.

## 9.5. Modal/dialog

- Header rõ.
- Body không bị 2 scroll.
- Footer có action rõ.
- Destructive action phải confirm.
- Form field có label đầy đủ.
- Status field dùng switch đồng bộ.

---

# 10. Không được làm

- Không thêm mock data.
- Không fake payment.
- Không integrate payment API ở thời điểm này nếu chưa sẵn sàng.
- Không hiển thị `_id MongoDB` trong UI chính.
- Không hiển thị text nguồn dữ liệu kỹ thuật.
- Không dùng format số/tiền tệ lộn xộn.
- Không để mỗi page một kiểu layout.
- Không để các form trạng thái lúc checkbox, lúc switch.
- Không để menu thao tác quá dài và trùng chức năng.
- Không dùng API users để chỉnh loyalty points.
- Không để table scroll ngang toàn trang.

---

# 11. Checklist tổng sau khi hoàn thành

## Báo cáo & thống kê

- [ ] Top ranking chỉ hiển thị Top 3.
- [ ] KPI card có màu nhấn.
- [ ] Biểu đồ doanh thu là Bar Chart hoặc Line Chart.
- [ ] Có thay đổi so với kỳ trước nếu dữ liệu hỗ trợ.
- [ ] Số và tiền format nhất quán.
- [ ] Loại bỏ text nguồn dữ liệu kỹ thuật.

## Lịch hẹn

- [ ] Lịch pending chỉ hiện `Xác nhận` và `Hủy`.
- [ ] Hủy lịch bắt buộc nhập lý do.
- [ ] Có filter theo từng ngày hẹn.
- [ ] Có thể xem lịch hôm nay.
- [ ] Không fake payment / chưa integrate payment API.

## Lịch sử dịch vụ

- [ ] Modal chi tiết bỏ `Appointment ID`.
- [ ] Không hiển thị `_id MongoDB` ở nội dung chính.

## Quản lý khách hàng

- [ ] Bỏ cột email nếu không có dữ liệu.
- [ ] Thao tác chỉ gồm `Xem`, `Sửa`, `Xóa`.
- [ ] Bỏ action lịch sử/tích điểm trong menu.
- [ ] Kết nối đúng `GET /api/users/{userId}` và `PATCH /api/users/{userId}`.
- [ ] Không dùng users API chỉnh loyalty.

## Đồng bộ form trạng thái

- [ ] Membership dùng switch.
- [ ] Reward dùng switch.
- [ ] Promotion dùng switch.
- [ ] Service category dùng switch.
- [ ] Service dùng switch.
- [ ] Label/text trạng thái đồng bộ.

## Layout Admin

- [ ] Header, cards, filter, table, modal đồng bộ giữa các page.
- [ ] Không còn UI mỗi page một kiểu.
- [ ] Không còn text kỹ thuật ảnh hưởng UX.
- [ ] Giao diện đẹp hơn, gọn hơn, dễ dùng hơn.

---

# 12. Kết quả mong muốn

Sau khi hoàn thành:

1. Admin Dashboard trực quan hơn với KPI có màu nhấn, Top 3 ranking và chart doanh thu phù hợp.
2. Lịch hẹn Admin có workflow rõ cho lịch mới đặt: xác nhận hoặc hủy có lý do.
3. Admin có thể lọc lịch theo từng ngày, đặc biệt xem nhanh lịch hôm nay.
4. Lịch sử dịch vụ không còn hiển thị ID kỹ thuật trong chi tiết.
5. Quản lý khách hàng gọn hơn, bỏ email trống và action thừa.
6. Các form trạng thái dùng switch đồng bộ.
7. UI toàn bộ Admin thống nhất layout, spacing, format số, format tiền và format ngày.
8. Không fake payment, phần thanh toán sẽ integrate sau.
