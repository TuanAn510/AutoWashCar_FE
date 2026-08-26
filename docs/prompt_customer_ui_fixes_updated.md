# Prompt FE - Chỉnh sửa UI Role Customer: Lịch hẹn, Lịch sử dịch vụ, Xe cá nhân

## 1. Vai trò

Bạn là **Senior Frontend Developer React + TypeScript + UI/UX Designer**.

Hãy kiểm tra và chỉnh sửa UI cho các màn hình thuộc **role Customer** trong hệ thống **Shinecraft / Gara CRM**.  
Mục tiêu là làm giao diện gọn hơn, dễ đọc hơn, đúng logic nghiệp vụ hơn và không bị rối khi danh sách có nhiều dữ liệu.

Các màn hình cần chỉnh:

```txt
/customer/appointments
/customer/service-histories
/customer/vehicles
```

Nếu route thực tế trong project khác, hãy dùng đúng route hiện tại của project.

---

## 2. Nguyên tắc chung

Khi chỉnh UI, cần tuân thủ:

- Không phá layout Customer hiện tại.
- Không đổi API nếu không cần.
- Không dùng mock data.
- Không làm phát sinh horizontal scroll.
- Không dùng `w-screen` trong content nằm cạnh sidebar.
- Ưu tiên card/list gọn, dễ đọc, phù hợp Customer.
- Giảm padding, font size và khoảng trắng nếu card đang quá cao.
- Với text dài, dùng `truncate`, `line-clamp-1` hoặc `line-clamp-2` để tránh vỡ layout.
- Nếu thiếu dữ liệu như ghi chú, hiển thị fallback rõ ràng: `Không có ghi chú`.
- Không lặp lại cùng một thông tin nhiều lần trong cùng một card.
- Các action quan trọng như hủy lịch phải đúng business rule.
- Modal/dialog không được tạo lỗi 2 thanh scroll gây khó thao tác.

---

# 3. Màn Lịch hẹn Customer

Route:

```txt
/customer/appointments
```

---

## 3.1. Form đặt lịch hẹn

### Vấn đề: Form đặt lịch hẹn xuất hiện 2 thanh scroll

Hiện tại form đặt lịch hẹn có **2 thanh scroll**. Đây là UI bug / UX issue vì:

- Người dùng khó biết cần scroll ở vùng nào.
- Modal/drawer nhìn rối.
- Trên mobile rất dễ bị kẹt thao tác.
- Nếu nội dung dài, phần button submit/cancel có thể bị khó tiếp cận.

### Yêu cầu chỉnh

- Chỉ giữ **một vùng scroll chính** trong modal/drawer.
- Không để cả `body/modal container` và `form content` cùng scroll nếu không cần.
- Header và footer của modal nên cố định, chỉ phần nội dung form được scroll.
- Footer chứa button `Hủy` và `Đặt lịch` nên luôn dễ thấy.
- Không để modal vượt quá chiều cao màn hình.

### Gợi ý layout modal

```tsx
<DialogContent className="max-h-[90vh] overflow-hidden">
  <DialogHeader className="shrink-0">...</DialogHeader>

  <div className="max-h-[calc(90vh-140px)] overflow-y-auto pr-1">
    <form className="space-y-4">...</form>
  </div>

  <DialogFooter className="shrink-0 border-t pt-4">...</DialogFooter>
</DialogContent>
```

### Lưu ý kỹ thuật

- Không đặt `overflow-y-auto` ở quá nhiều lớp cha/con cùng lúc.
- Tránh pattern gây 2 scroll như:

```tsx
<DialogContent className="overflow-y-auto">
  <form className="overflow-y-auto">...</form>
</DialogContent>
```

- Nếu dùng Drawer trên mobile, kiểm tra riêng mobile height.
- Nếu dùng Radix Dialog/shadcn Dialog, nên để `DialogContent` `overflow-hidden`, còn content bên trong scroll.

### Acceptance checklist

- [ ] Form đặt lịch hẹn không còn 2 thanh scroll.
- [ ] Chỉ có một vùng nội dung form được scroll.
- [ ] Header/footer modal không bị cuộn mất nếu có thể.
- [ ] Button submit/cancel luôn dễ thao tác.
- [ ] Modal không vượt quá 90vh.
- [ ] Mobile không bị kẹt scroll.

---

## 3.2. Search và bộ lọc

Hiện tại phần search/filter đang chiếm nhiều không gian và làm UI hơi rối.

### Yêu cầu chỉnh

- Gom search và filter vào **một nút lọc** hoặc **filter dropdown/popover**.
- Mục tiêu:
  - Gọn UI.
  - Đỡ chiếm chỗ.
  - Dễ responsive trên mobile.
  - Nhìn danh sách lịch hẹn sạch hơn.

Gợi ý UI:

```txt
[ Tìm kiếm lịch hẹn... ] [ Bộ lọc ]
```

Hoặc:

```txt
[ Bộ lọc & tìm kiếm ]
```

Khi bấm `Bộ lọc`, xổ xuống các trường:

- Từ khóa tìm kiếm.
- Trạng thái lịch hẹn.
- Trạng thái thanh toán.
- Khoảng ngày hẹn nếu project đã hỗ trợ.
- Nút `Áp dụng`.
- Nút `Xóa lọc`.

Không để toàn bộ filter luôn hiển thị nếu làm trang bị cao và rối.

---

## 3.3. Danh sách lịch hẹn của bạn

### Vấn đề 1: Card quá cao, nhiều khoảng trống thừa

Các ô như:

- `Thời gian hẹn`
- `Thời lượng dự kiến`
- `Xe của bạn`
- `Biển số xe`

đang chiếm chiều cao lớn nhưng nội dung chỉ có một dòng.

### Yêu cầu chỉnh

- Giảm padding trong các info box.
- Giảm font size của label/value nếu đang quá lớn.
- Có thể chuyển layout từ nhiều box cao sang dạng compact grid hoặc inline meta.
- Ưu tiên card thấp hơn nhưng vẫn dễ đọc.

Gợi ý layout compact:

```txt
[Trạng thái ở góc phải]

Tên dịch vụ chính...
Xe: Toyota Vios · 51A-12345
Thời gian: 20/06/2026 · 09:00
Thời lượng: 60 phút
Ghi chú: Không có ghi chú

[2 dịch vụ] [Chưa thanh toán]                 [Xem chi tiết] [Hủy lịch]
```

Nếu vẫn giữ box, dùng box nhỏ:

```txt
grid grid-cols-2 gap-2 md:grid-cols-4
p-2 hoặc p-3
text-xs cho label
text-sm cho value
```

---

### Vấn đề 2: Card bị trống phần ghi chú

Nếu appointment không có ghi chú, hiện phần ghi chú bị trống.

### Yêu cầu chỉnh

- Nếu `note`, `customerNote` hoặc field ghi chú không có dữ liệu, hiển thị:

```txt
Không có ghi chú
```

Không để khoảng trắng lớn.

---

### Vấn đề 3: Trạng thái bị lặp

Hiện trạng thái lịch hẹn đang xuất hiện nhiều lần làm UI rối.

### Yêu cầu chỉnh

- Chỉ giữ **trạng thái lịch hẹn chính** ở góc trên bên phải card.
- Phần chip/badge bên dưới chỉ nên hiển thị:
  - Số lượng dịch vụ.
  - Trạng thái thanh toán.
- Không lặp lại badge status appointment ở footer hoặc trong meta section.

Ví dụ:

```txt
Góc trên phải:
[Đã xác nhận]

Footer/chip:
[2 dịch vụ] [Chưa thanh toán]
```

Không hiển thị thêm `[Đã xác nhận]` lần thứ hai.

---

### Vấn đề 4: Bug logic hủy lịch khi trạng thái đã xác nhận

Hiện Customer vẫn có thể hủy lịch khi trạng thái là `Đã xác nhận`.

### Yêu cầu chỉnh logic

- Customer chỉ được thấy nút `Hủy lịch` khi appointment còn ở trạng thái được phép hủy.
- Nếu Backend rule chỉ cho hủy ở `pending`, thì FE chỉ hiển thị nút hủy khi:

```ts
status === 'pending';
```

- Không hiển thị nút hủy với các trạng thái:

```txt
confirmed
in_progress
completed
cancelled
```

- Nếu business rule của Backend có khác, hãy đọc Swagger/service thật và làm theo BE.
- Nếu Backend trả lỗi khi hủy, phải toast lỗi rõ ràng.

Gợi ý helper:

```ts
export const canCustomerCancelAppointment = (status: string) => {
  return status === 'pending';
};
```

UI:

```tsx
{
  canCustomerCancelAppointment(appointment.status) && (
    <Button variant="destructive">Hủy lịch</Button>
  );
}
```

---

### Vấn đề 5: Font và khoảng cách hơi to

Card đang nổi bật nhưng khi danh sách có nhiều lịch hẹn sẽ bị nặng.

### Yêu cầu chỉnh

- Giảm padding tổng thể của card.
- Giảm gap giữa các section.
- Giảm font size của label/meta.
- Footer action gọn hơn.
- Dùng `text-sm`, `text-xs` cho meta.
- Title giữ nổi bật nhưng không quá lớn.

Gợi ý:

```txt
Title: text-base hoặc text-lg
Meta: text-sm
Label: text-xs uppercase hoặc text-muted
Card padding: p-4 thay vì p-6/p-8
Info box padding: p-2/p-3
Gap: gap-3 hoặc gap-4
```

---

### Vấn đề 6: Tiêu đề dài dễ vỡ layout

Nếu appointment có nhiều dịch vụ, title có thể rất dài và làm vỡ layout.

### Yêu cầu chỉnh

- Giới hạn title bằng `line-clamp-1` hoặc `line-clamp-2`.
- Nếu nhiều dịch vụ, hiển thị tên 1-2 dịch vụ đầu + số lượng còn lại.
- Nút `Xem chi tiết` hiển thị đầy đủ danh sách dịch vụ trong modal/detail.

Gợi ý format:

```txt
Rửa xe, Thay nhớt +2 dịch vụ
```

Hoặc:

```txt
Rửa xe, Sửa xe...
```

Gợi ý helper:

```ts
export const formatAppointmentServicesTitle = (services: ServiceSnapshot[]) => {
  if (!services?.length) return 'Dịch vụ chưa xác định';

  const visible = services
    .slice(0, 2)
    .map((service) => service.name)
    .join(', ');
  const remaining = services.length - 2;

  return remaining > 0 ? `${visible} +${remaining} dịch vụ` : visible;
};
```

---

## 3.4. Acceptance checklist cho Lịch hẹn Customer

- [ ] Form đặt lịch hẹn không còn 2 thanh scroll.
- [ ] Search/filter được gom vào nút dropdown/popover.
- [ ] Appointment card gọn hơn, ít khoảng trắng hơn.
- [ ] Không còn ghi chú bị trống; hiển thị `Không có ghi chú`.
- [ ] Status appointment chỉ hiển thị một lần ở góc trên phải.
- [ ] Footer chỉ hiển thị số dịch vụ và payment status.
- [ ] Customer không thể hủy lịch khi trạng thái là `confirmed`.
- [ ] Nút hủy chỉ hiện khi status được phép hủy.
- [ ] Title dịch vụ dài không làm vỡ layout.
- [ ] Card responsive tốt trên mobile/tablet/desktop.

---

# 4. Màn Lịch sử dịch vụ Customer

Route:

```txt
/customer/service-histories
```

---

## 4.1. Danh sách lịch sử dịch vụ

### Vấn đề 1: Card bị dư khoảng trắng

### Yêu cầu chỉnh

- Giảm padding/gap tương tự appointment card.
- Không để khu vực ghi chú hoặc meta tạo khoảng trống lớn.
- Nếu không có ghi chú, hiển thị:

```txt
Không có ghi chú
```

---

### Vấn đề 2: Thông tin xe bị lặp

Hiện có thể đang hiển thị xe và biển số ở nhiều vị trí.

### Yêu cầu chỉnh

- Không lặp thông tin xe.
- Có thể đổi ô `XE` thành `BIỂN SỐ`.
- Hoặc gộp xe + biển số vào một dòng.

Gợi ý:

```txt
Xe: Toyota Vios · 51A-12345
```

Hoặc nếu dùng box:

```txt
BIỂN SỐ
51A-12345
```

Không nên vừa có ô `Xe` vừa có ô `Biển số` nếu gây lặp.

---

### Vấn đề 3: Label “Hoàn thành” gây nhầm

Label hiện tại `Hoàn thành` trong ô thông tin có thể gây nhầm với status.

### Yêu cầu chỉnh

Đổi label thành:

```txt
THỜI GIAN HOÀN THÀNH
```

hoặc nếu UI dùng chữ thường:

```txt
Thời gian hoàn thành
```

Không dùng label `Hoàn thành` đơn lẻ trong info box.

---

### Vấn đề 4: Button “Xem chi tiết” cần đưa sang bên phải

### Yêu cầu chỉnh

- Đưa button `Xem chi tiết` sang bên phải ở footer card.
- Trên mobile có thể full width hoặc căn phải tùy layout, nhưng không làm vỡ giao diện.
- Footer nên gọn:

```txt
[Thông tin phụ / tổng tiền]                      [Xem chi tiết]
```

Gợi ý class:

```tsx
<div className="flex items-center justify-between gap-3">
  <div className="min-w-0 text-sm text-muted-foreground">...</div>
  <Button className="shrink-0">Xem chi tiết</Button>
</div>
```

---

## 4.2. Acceptance checklist cho Lịch sử dịch vụ Customer

- [ ] Service history card gọn hơn, ít khoảng trắng.
- [ ] Ghi chú trống hiển thị `Không có ghi chú`.
- [ ] Không lặp thông tin xe.
- [ ] Ô `XE` được đổi thành `BIỂN SỐ` hoặc gộp xe + biển số một dòng.
- [ ] Label `Hoàn thành` đổi thành `Thời gian hoàn thành`.
- [ ] Button `Xem chi tiết` nằm bên phải card.
- [ ] UI không bị vỡ khi tên dịch vụ dài.
- [ ] Responsive tốt.

---

# 5. Màn Xe Customer

Route:

```txt
/customer/vehicles
```

---

## 5.1. Danh sách phương tiện

### Vấn đề 1: Vị trí biển số chưa đồng bộ

### Yêu cầu chỉnh

- Biển số phải có vị trí cố định và đồng bộ giữa các card.
- Không để biển số xuống dòng do tên xe quá dài.
- Nên đặt biển số ở góc phải hoặc dưới tên xe nhưng có layout ổn định.

Gợi ý layout card header:

```txt
Toyota Vios 2022                         [51A-12345]
```

Hoặc:

```txt
Toyota Vios 2022
Biển số: 51A-12345
```

Nếu đặt cùng hàng, cần:

```tsx
<div className="flex items-start justify-between gap-3">
  <div className="min-w-0">
    <h3 className="truncate">Toyota Vios phiên bản rất dài...</h3>
    <p className="text-sm text-muted-foreground truncate">Sedan · 2022</p>
  </div>

  <Badge className="shrink-0 whitespace-nowrap">51A-12345</Badge>
</div>
```

---

### Vấn đề 2: Tên xe dài làm ảnh hưởng layout

### Yêu cầu chỉnh

- Tên xe dài phải dùng `truncate` hoặc `line-clamp-1`.
- Không để tên xe đẩy biển số xuống dòng.
- Có thể hiển thị full tên xe trong tooltip hoặc detail modal.

Gợi ý:

```tsx
<h3 className="truncate text-base font-semibold">{vehicleName}</h3>
```

Badge biển số:

```tsx
<Badge className="shrink-0 whitespace-nowrap">{vehicle.licensePlate}</Badge>
```

---

## 5.2. Acceptance checklist cho Xe Customer

- [ ] Biển số nằm vị trí đồng bộ giữa các card.
- [ ] Tên xe dài hiển thị `...`.
- [ ] Biển số không bị xuống dòng.
- [ ] Card không bị vỡ layout khi brand/model dài.
- [ ] UI responsive tốt trên mobile.
- [ ] Không làm thay đổi API vehicle hiện tại.

---

# 6. Component/helper nên tạo hoặc cập nhật

## 6.1. Appointment

```txt
features/customer/appointments/components/CustomerAppointmentCard.tsx
features/customer/appointments/components/CustomerAppointmentFiltersPopover.tsx
features/customer/appointments/components/CreateAppointmentDialog.tsx
features/customer/appointments/components/AppointmentStatusBadge.tsx
features/customer/appointments/utils/appointmentDisplay.ts
features/customer/appointments/utils/appointmentGuards.ts
```

Gợi ý helper:

```ts
export const canCustomerCancelAppointment = (status: string) => {
  return status === 'pending';
};

export const getAppointmentNote = (note?: string | null) => {
  return note?.trim() ? note : 'Không có ghi chú';
};
```

---

## 6.2. Service History

```txt
features/customer/service-histories/components/CustomerServiceHistoryCard.tsx
features/customer/service-histories/utils/serviceHistoryDisplay.ts
```

Gợi ý helper:

```ts
export const getServiceHistoryNote = (note?: string | null) => {
  return note?.trim() ? note : 'Không có ghi chú';
};

export const formatVehicleLine = (vehicle?: Vehicle) => {
  if (!vehicle) return 'Xe chưa xác định';

  const name = [vehicle.brand, vehicle.model].filter(Boolean).join(' ');
  const plate = vehicle.licensePlate ? ` · ${vehicle.licensePlate}` : '';

  return `${name || 'Xe chưa xác định'}${plate}`;
};
```

---

## 6.3. Vehicles

```txt
features/customer/vehicles/components/VehicleCard.tsx
features/customer/vehicles/utils/vehicleDisplay.ts
```

Gợi ý helper:

```ts
export const formatVehicleName = (vehicle: Vehicle) => {
  return [vehicle.brand, vehicle.model, vehicle.year].filter(Boolean).join(' ');
};
```

---

# 7. Responsive và layout kỹ thuật

Áp dụng ở cả 3 màn:

```txt
Không dùng w-screen cho content nằm trong layout có sidebar.
Main content dùng min-w-0 flex-1 overflow-x-hidden.
Wrapper dùng w-full max-w-full min-w-0.
Card dùng min-w-0.
Text dài dùng truncate hoặc line-clamp.
Badge biển số dùng shrink-0 whitespace-nowrap.
Dialog content dùng max-h + overflow-hidden.
Chỉ một vùng form content được overflow-y-auto.
```

Gợi ý page wrapper:

```tsx
<div className="min-w-0 flex-1 overflow-x-hidden">
  <div className="w-full max-w-full min-w-0 space-y-4 p-4 md:p-6">...</div>
</div>
```

Gợi ý dialog wrapper:

```tsx
<DialogContent className="max-h-[90vh] overflow-hidden">
  <DialogHeader className="shrink-0" />

  <div className="max-h-[calc(90vh-140px)] overflow-y-auto">...</div>

  <DialogFooter className="shrink-0" />
</DialogContent>
```

---

# 8. Không được làm

- Không dùng mock data mới.
- Không đổi response API.
- Không gọi API sai role.
- Không để Customer thấy action nội bộ của Staff/Admin.
- Không để trạng thái appointment lặp lại nhiều lần.
- Không để nút hủy xuất hiện khi appointment đã `confirmed`, `in_progress`, `completed`, `cancelled`.
- Không để ghi chú trống tạo khoảng trắng.
- Không để tên dài làm vỡ card.
- Không để biển số xe xuống dòng vì tên xe dài.
- Không làm card quá cao nếu nội dung ít.
- Không để modal đặt lịch có 2 thanh scroll.
- Không để button submit/cancel bị cuộn mất hoặc khó thao tác.

---

# 9. Kết quả mong muốn

Sau khi chỉnh xong:

1. Form đặt lịch hẹn không còn bug 2 thanh scroll.
2. Trang `/customer/appointments` gọn hơn, filter nằm trong dropdown/popover, card thấp hơn và không bị lặp trạng thái.
3. Customer không thể hủy lịch đã xác nhận nếu business rule không cho phép.
4. Ghi chú trống ở appointment và service history hiển thị `Không có ghi chú`.
5. Trang `/customer/service-histories` gọn hơn, không lặp thông tin xe, label thời gian rõ nghĩa.
6. Button `Xem chi tiết` trong service history được căn phải.
7. Trang `/customer/vehicles` có biển số đồng bộ vị trí, không bị xuống dòng.
8. Tên xe/dịch vụ dài được truncate hoặc line-clamp.
9. UI responsive tốt, nhìn sạch và phù hợp với role Customer.
