# Prompt FE - Chỉnh sửa UI Role Admin: Lịch hẹn, Lịch sử dịch vụ, Khách hàng, Hạng thành viên

## 1. Vai trò

Bạn là **Senior Frontend Developer React + TypeScript + UI/UX Designer**.

Hãy kiểm tra và chỉnh sửa UI cho các màn hình thuộc **role Admin** trong hệ thống **Shinecraft / Gara CRM**.  
Mục tiêu là làm giao diện gọn hơn, ít khoảng trắng thừa, đồng bộ thao tác giữa các trang, đúng format Việt Nam và kết nối API thật khi thêm các hành động mới.

Các màn hình cần chỉnh:

```txt
/admin/appointments
/admin/service-histories
/admin/customers
/admin/membership-programs
/admin/membership-tiers
```

Nếu route thực tế trong project khác, hãy dùng đúng route hiện tại.

---

## 2. Nguyên tắc chung

Khi chỉnh UI, cần tuân thủ:

- Không phá layout Admin hiện tại.
- Không dùng mock data.
- Không đổi API nếu không cần.
- Không làm phát sinh horizontal scroll toàn trang.
- Với bảng lớn, chỉ cho scroll ngang trong table wrapper nếu thật sự cần.
- Giảm khoảng trắng thừa trong filter panel, card thống kê và table.
- Format ngày theo kiểu Việt Nam: `dd/mm/yyyy`.
- Nếu input date chưa chọn ngày, placeholder nên là `Chọn ngày`.
- Text dài trong table phải dùng `truncate`, `line-clamp-1`, `line-clamp-2` hoặc tooltip/detail.
- Action của table nên đồng bộ giữa các trang, ưu tiên dùng nút ba chấm `...` nếu các trang khác đang dùng pattern này.
- Không hiển thị thông tin kỹ thuật như ID trong bảng chính nếu không cần.
- Các thông tin kỹ thuật như ID chỉ nên nằm trong modal chi tiết.
- Khi thêm action mới, phải kiểm tra và kết nối API thật.

---

# 3. Màn Lịch hẹn Role Admin

Route gợi ý:

```txt
/admin/appointments
```

## 3.1. Khu vực filter

### Vấn đề

1. Khu vực filter đang chiếm nhiều không gian.
2. Date input đang hiển thị `mm/dd/yyyy`.
3. Filter panel có nhiều khoảng trắng dọc.
4. UI filter chưa đủ gọn cho màn admin có nhiều dữ liệu.

### Yêu cầu chỉnh

- Gọn lại khu vực filter.
- Đổi date input từ `mm/dd/yyyy` sang format hiển thị `dd/mm/yyyy` hoặc placeholder `Chọn ngày`.
- Giảm padding/gap trong filter panel.
- Filter nên nằm trên một hàng nếu đủ rộng, tự xuống dòng khi màn nhỏ.
- Các trường filter nên có label rõ ràng nhưng không quá chiếm chỗ.

Gợi ý layout:

```txt
[Tìm kiếm lịch hẹn / khách hàng / biển số...] [Trạng thái] [Staff] [Chọn ngày] [Dịch vụ] [Lọc] [Xóa]
```

Gợi ý class:

```tsx
<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">...</div>
```

Nếu dùng filter panel dạng collapsible/popover, cần đảm bảo không làm thao tác admin chậm hơn.

---

## 3.2. Table danh sách lịch hẹn

### Vấn đề lớn nhất: Thanh scroll ngang

Table đang có thanh scroll ngang, đây là điểm yếu lớn nhất của UI hiện tại.

### Yêu cầu chỉnh

- Giảm độ rộng các cột không cần nhiều không gian.
- Giới hạn chiều rộng cột có text dài.
- Dùng truncate/line-clamp thay vì để cột kéo rộng table.
- Chỉ giữ scroll ngang trong table wrapper như phương án cuối cùng, không để toàn trang bị scroll ngang.

### Cột `Dịch vụ`

Vấn đề:

- Tên dịch vụ dài làm table bị rộng.

Yêu cầu:

- Giới hạn width cột `Dịch vụ`.
- Nếu dài thì hiển thị dấu `...`.
- Có thể dùng tooltip hoặc modal chi tiết để xem đầy đủ.

Gợi ý:

```tsx
<TableCell className="max-w-[220px]">
  <div className="truncate" title={serviceNames}>
    {serviceNames}
  </div>
</TableCell>
```

Hoặc tối đa 2 dòng:

```tsx
<div className="line-clamp-2 max-w-[240px]">{serviceNames}</div>
```

### Cột `Xe`

Vấn đề:

- Thông tin xe dài làm table bị rộng.

Yêu cầu:

- Giới hạn width cột `Xe`.
- Cho phép tối đa 2 dòng.
- Nếu dài hơn thì dùng dấu `...`.

Gợi ý:

```tsx
<TableCell className="max-w-[180px]">
  <div className="line-clamp-2">
    {vehicleName} · {licensePlate}
  </div>
</TableCell>
```

### Cột `Staff`

Vấn đề:

- Text như `Chưa phân công` hoặc `SHINE CRAFT STAFF` đang chiếm nhiều chiều ngang.

Yêu cầu:

- Cột Staff chỉ nên rộng khoảng `130px - 150px`.
- Dùng truncate nếu tên dài.
- `Chưa phân công` có thể hiển thị dạng badge nhỏ.

Gợi ý:

```tsx
<TableCell className="w-[140px] max-w-[150px]">
  <div className="truncate" title={staffName}>
    {staffName || 'Chưa phân công'}
  </div>
</TableCell>
```

---

## 3.3. Acceptance checklist cho Admin Appointments

- [ ] Filter gọn hơn.
- [ ] Date input hiển thị `dd/mm/yyyy` hoặc placeholder `Chọn ngày`.
- [ ] Filter panel giảm khoảng trắng dọc.
- [ ] Table không gây scroll ngang toàn trang.
- [ ] Cột `Dịch vụ` giới hạn width và truncate/line-clamp.
- [ ] Cột `Xe` giới hạn width, tối đa 2 dòng.
- [ ] Cột `Staff` nhỏ hơn, khoảng 130–150px.
- [ ] UI vẫn responsive tốt.

---

# 4. Màn Quản lý lịch sử dịch vụ

Route gợi ý:

```txt
/admin/service-histories
```

## 4.1. Card thống kê

### Vấn đề 1: Card `Tổng doanh thu` bị xuống dòng

Số tiền doanh thu không nên bị xuống dòng vì làm card xấu và khó đọc.

### Yêu cầu chỉnh

- Cho số tiền `white-space: nowrap`.
- Nếu số tiền dài, giảm font-size riêng cho value doanh thu.
- Không để đơn vị tiền và số tiền tách dòng.

Gợi ý:

```tsx
<p className="whitespace-nowrap text-2xl font-bold tracking-tight">
  {formatCurrency(totalRevenue)}
</p>
```

Nếu vẫn tràn:

```tsx
<p className="whitespace-nowrap text-xl font-bold xl:text-2xl">{formatCurrency(totalRevenue)}</p>
```

---

### Vấn đề 2: Card thống kê hơi cao

Yêu cầu:

- Giảm padding card.
- Giảm gap giữa icon/title/value.
- Giữ chiều cao card đồng bộ nhưng không quá cao.

Gợi ý:

```tsx
<Card className="p-4">...</Card>
```

---

### Vấn đề 3: Tiêu đề card bị xuống dòng chưa đẹp

Yêu cầu:

- Tăng nhẹ width vùng text nếu có thể.
- Hoặc giảm font-size title card.
- Có thể dùng `whitespace-nowrap` cho title ngắn.
- Không để title xuống dòng lẻ gây xấu UI.

---

## 4.2. Bộ lọc

### Vấn đề

1. Date input vẫn hiển thị `mm/dd/yyyy`.
2. Khu vực filter hơi trống, nhiều khoảng trắng dọc.
3. Nhãn filter chưa rõ.

### Yêu cầu chỉnh

- Đổi date format sang `dd/mm/yyyy`.
- Nếu chưa chọn ngày, hiển thị placeholder:
  - `Từ ngày`
  - `Đến ngày`
- Thêm nhãn rõ hơn:
  - `[Tìm kiếm...]`
  - `[Từ ngày]`
  - `[Đến ngày]`
- Giảm padding/gap trong filter panel.

Gợi ý layout:

```txt
[Tìm kiếm theo khách hàng, xe, dịch vụ...] [Từ ngày] [Đến ngày] [Lọc] [Xóa]
```

---

## 4.3. Acceptance checklist cho Service Histories Admin

- [ ] Card `Tổng doanh thu` không bị xuống dòng.
- [ ] Card thống kê thấp và gọn hơn.
- [ ] Tiêu đề card không xuống dòng xấu.
- [ ] Date input dùng `dd/mm/yyyy` hoặc placeholder tiếng Việt.
- [ ] Filter có nhãn rõ: `Tìm kiếm`, `Từ ngày`, `Đến ngày`.
- [ ] Filter panel giảm khoảng trắng dọc.

---

# 5. Màn Quản lý khách hàng

Route gợi ý:

```txt
/admin/customers
```

## 5.1. Khu vực filter/search

### Vấn đề

1. Tab `Tất cả khách hàng / Hoạt động` bị dư vì bên dưới đã có dropdown `Tất cả trạng thái`.
2. Nút `Thêm bộ lọc` chưa cần thiết.
3. Dòng `Dữ liệu từ server` không cần hiển thị với admin.
4. Filter đang hơi rối và trùng chức năng.

### Yêu cầu chỉnh

- Bỏ tab:
  - `Tất cả khách hàng`
  - `Hoạt động`
- Bỏ nút:
  - `Thêm bộ lọc`
- Bỏ dòng:
  - `Dữ liệu từ server`
- Chỉ giữ filter trong thanh search.

Gợi ý layout:

```txt
[Tìm theo tên hoặc số điện thoại...] [Tất cả trạng thái]
```

Nếu cần thêm filter nâng cao sau này thì dùng dropdown/popover, không hiển thị sẵn quá nhiều.

---

## 5.2. Card thống kê khách hàng

### Vấn đề

Cả 4 card đều dùng icon nhóm người, gây đơn điệu và khó phân biệt.

### Yêu cầu chỉnh icon

- `Tổng khách hàng`: icon `users`
- `Đang hoạt động`: icon `user-check`
- `Khách mới tháng này`: icon `user-plus`
- `Tạm khóa`: icon `lock`

Dùng icon từ `lucide-react` nếu project đang dùng.

Gợi ý:

```tsx
import { Users, UserCheck, UserPlus, Lock } from 'lucide-react';
```

---

## 5.3. Bảng danh sách khách hàng

### Vấn đề 1: Thiếu cột `Thao tác`

Bảng hiện thiếu cột thao tác nên admin không thể thao tác nhanh trên từng khách hàng.

### Yêu cầu thêm cột `Thao tác`

Thêm cột:

```txt
Thao tác
```

Các action nên có:

1. `Xem chi tiết`
2. `Chỉnh sửa thông tin`
3. `Xem lịch sử dịch vụ`
4. `Xem loyalty`
5. `Tạm khóa khách hàng`

Nếu khách hàng đã bị tạm khóa, action đổi thành:

```txt
Mở khóa khách hàng
```

Nên dùng dropdown menu ba chấm để đồng bộ UI:

```txt
[...]
  - Xem chi tiết
  - Chỉnh sửa thông tin
  - Xem lịch sử dịch vụ
  - Xem loyalty
  - Tạm khóa khách hàng / Mở khóa khách hàng
```

---

### Vấn đề 2: Cần kết nối API chi tiết và cập nhật user

Khi thêm cột `Thao tác`, phải kiểm tra và kết nối đúng 2 API sau:

```http
GET /api/users/{userId}
```

Mục đích:

```txt
Admin/Staff lấy chi tiết user
```

Dùng cho action:

```txt
Xem chi tiết
```

---

```http
PATCH /api/users/{userId}
```

Mục đích:

```txt
Admin/Staff cập nhật user
```

Theo Swagger, API này cập nhật các field quản trị của user:

```json
{
  "role": "staff",
  "isActive": true
}
```

Lưu ý quan trọng:

```txt
Điểm loyalty được quản lý qua LoyaltyAccount và các endpoint loyalty riêng.
Không cập nhật điểm loyalty bằng API users.
```

Dùng cho action:

- `Chỉnh sửa thông tin` nếu BE cho phép sửa field phù hợp.
- `Tạm khóa khách hàng` bằng `isActive: false`.
- `Mở khóa khách hàng` bằng `isActive: true`.

Không dùng API này để chỉnh loyalty points.

---

### API layer cần tạo/cập nhật

Tạo hoặc cập nhật file API theo cấu trúc project, ví dụ:

```txt
src/features/admin/customers/api/adminCustomerApi.ts
```

hoặc:

```txt
src/services/userApi.ts
```

Gợi ý function:

```ts
export const getUserDetail = async (userId: string) => {
  const response = await api.get(`/api/users/${userId}`);
  return response.data;
};

export const updateUserByAdmin = async (userId: string, payload: UpdateUserPayload) => {
  const response = await api.patch(`/api/users/${userId}`, payload);
  return response.data;
};
```

Gợi ý hook:

```ts
export const useUserDetail = (userId?: string) => {
  return useQuery({
    queryKey: ['user-detail', userId],
    queryFn: () => getUserDetail(userId!),
    enabled: Boolean(userId),
  });
};
```

```ts
export const useUpdateUserByAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: UpdateUserPayload }) =>
      updateUserByAdmin(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
```

---

### Vấn đề 3: ID khách hàng đang hiển thị quá kỹ thuật

Yêu cầu:

- Ẩn ID khỏi bảng danh sách.
- Chỉ hiển thị ID trong modal chi tiết nếu cần.
- Bảng nên ưu tiên thông tin business:
  - Tên khách hàng
  - Số điện thoại
  - Email
  - Trạng thái
  - Ngày tham gia
  - Tổng lịch hẹn / tổng xe nếu có
  - Thao tác

---

### Vấn đề 4: Ngày cần format kiểu Việt Nam

Yêu cầu:

- Format ngày theo `dd/mm/yyyy`.
- Nếu có giờ thì dùng `dd/mm/yyyy HH:mm`.

Gợi ý:

```ts
export const formatDateVi = (date?: string | Date | null) => {
  if (!date) return 'Không có dữ liệu';
  return new Intl.DateTimeFormat('vi-VN').format(new Date(date));
};
```

---

## 5.4. Modal chi tiết khách hàng

Khi bấm `Xem chi tiết`:

- Gọi `GET /api/users/{userId}`.
- Mở modal/drawer.
- Hiển thị:
  - Tên khách hàng
  - Số điện thoại
  - Email
  - Role
  - Trạng thái hoạt động
  - Ngày tạo
  - ID user ở phần thông tin kỹ thuật nếu cần
- Có loading/error state trong modal.

---

## 5.5. Modal chỉnh sửa / tạm khóa / mở khóa

### Chỉnh sửa thông tin

Khi bấm `Chỉnh sửa thông tin`:

- Mở modal.
- Chỉ hiển thị field mà API cho phép cập nhật.
- Nếu API hiện chỉ cho cập nhật `role`, `isActive`, không tạo form chỉnh các field profile khác nếu BE chưa hỗ trợ.

### Tạm khóa / mở khóa

Khi bấm `Tạm khóa khách hàng`:

- Mở confirm dialog.
- Gọi:

```http
PATCH /api/users/{userId}
```

Payload:

```json
{
  "isActive": false
}
```

Khi bấm `Mở khóa khách hàng`:

Payload:

```json
{
  "isActive": true
}
```

Sau thành công:

- Đóng dialog.
- Toast success.
- Invalidate customer list.
- Invalidate user detail nếu đang mở.

---

## 5.6. Acceptance checklist cho Customers Admin

- [ ] Bỏ tab `Tất cả khách hàng / Hoạt động`.
- [ ] Bỏ nút `Thêm bộ lọc`.
- [ ] Bỏ dòng `Dữ liệu từ server`.
- [ ] Search/filter chỉ còn: `Tìm theo tên hoặc số điện thoại...` + `Tất cả trạng thái`.
- [ ] Icon 4 card thống kê được đổi đúng ý nghĩa.
- [ ] Bảng có cột `Thao tác`.
- [ ] Action dùng dropdown ba chấm nếu project đang dùng pattern này.
- [ ] `Xem chi tiết` gọi `GET /api/users/{userId}`.
- [ ] `Chỉnh sửa/Tạm khóa/Mở khóa` gọi `PATCH /api/users/{userId}`.
- [ ] Không cập nhật loyalty points bằng API users.
- [ ] Ẩn ID khách hàng khỏi bảng.
- [ ] Ngày format kiểu Việt Nam.

---

# 6. Màn Quản lý hạng thành viên

Route gợi ý:

```txt
/admin/membership-programs
/admin/membership-tiers
```

## 6.1. Mô tả trang

### Vấn đề

Câu mô tả trang hiện chưa giải thích rõ logic hạng thành viên.

### Yêu cầu chỉnh

Đổi mô tả trang thành:

```txt
Thiết lập hạng thành viên theo tổng điểm tích lũy. Việc đổi thưởng không làm giảm hạng hiện tại của khách hàng.
```

---

## 6.2. Modal thêm/sửa hạng thành viên

### Vấn đề

Modal thêm hạng đang thiếu label và bố cục chưa rõ.

### Yêu cầu chỉnh

Modal cần có label rõ ràng cho từng field:

```txt
Tên hạng
Placeholder: Nhập tên hạng, ví dụ: Diamond

Ngưỡng tổng điểm
Placeholder: Nhập số điểm tối thiểu
Suffix: điểm

Ưu đãi
Placeholder: Nhập phần trăm ưu đãi
Suffix: %

Mô tả
Placeholder: Nhập mô tả hạng thành viên

Trạng thái
Control: Đang hoạt động toggle
```

### Bố cục modal

- Các field phải có label rõ ràng.
- Number input có suffix `điểm` hoặc `%`.
- Toggle trạng thái có text giải thích.
- Footer modal có:
  - `Hủy`
  - `Lưu hạng` hoặc `Cập nhật hạng`
- Không để modal quá cao hoặc có 2 scroll.

Gợi ý:

```txt
[ Tên hạng                         ]
[ Ngưỡng tổng điểm        ][điểm]
[ Ưu đãi                  ][%]
[ Mô tả                            ]
[ Trạng thái: Đang hoạt động       ]
```

---

## 6.3. Tên nút trạng thái

### Vấn đề

Nút `Tắt` hơi cụt và chưa rõ nghĩa.

### Yêu cầu chỉnh

- Nếu hạng đang hoạt động, action nên là:

```txt
Tạm ngưng
```

- Nếu hạng đang tạm ngưng, action nên là:

```txt
Kích hoạt lại
```

Không dùng từ `Tắt`.

---

## 6.4. Đồng bộ thao tác table

### Vấn đề

Thao tác chưa đồng bộ với các trang khác.

### Yêu cầu chỉnh

- Nếu các trang quản trị khác đang dùng nút ba chấm `...` cho thao tác, trang membership tier cũng dùng cùng pattern.
- Menu action gợi ý:
  - `Chỉnh sửa`
  - `Tạm ngưng` hoặc `Kích hoạt lại`
  - `Xem khách hàng thuộc hạng` nếu có route/data phù hợp

---

## 6.5. Validate hạng thành viên

Cần thêm validate cho form và logic trước khi submit.

### Rule bắt buộc

- Tên hạng không được để trống.
- Ngưỡng tổng điểm không được âm.
- Ưu đãi phải từ `0%` đến `100%`.
- Ngưỡng điểm không được trùng với hạng khác.
- Ngưỡng điểm của các hạng nên tăng dần.
- Không cho xóa hoặc tạm ngưng hạng nếu đang có khách hàng thuộc hạng đó, nếu Backend có trả lỗi hoặc có API kiểm tra.
- Nếu Backend không có API kiểm tra số khách thuộc hạng, FE phải handle lỗi từ Backend và hiển thị toast rõ ràng.

Gợi ý Zod:

```ts
const membershipTierSchema = z.object({
  name: z.string().min(1, 'Tên hạng không được để trống'),
  minPoints: z.coerce.number().min(0, 'Ngưỡng tổng điểm không được âm'),
  discountPercent: z.coerce
    .number()
    .min(0, 'Ưu đãi không được âm')
    .max(100, 'Ưu đãi không được vượt quá 100%'),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
});
```

Validate trùng ngưỡng điểm trước submit:

```ts
const isDuplicateThreshold = tiers.some(
  (tier) => tier._id !== editingTierId && getTierThreshold(tier) === formValues.minPoints
);

if (isDuplicateThreshold) {
  form.setError('minPoints', {
    message: 'Ngưỡng điểm không được trùng với hạng khác',
  });
  return;
}
```

---

## 6.6. Giao diện bảng

### Yêu cầu chỉnh nhẹ

- Giảm padding row nếu bảng đang quá cao.
- Cột tên hạng rõ ràng.
- Cột ngưỡng điểm format số dễ đọc.
- Cột ưu đãi hiển thị dạng `%`.
- Cột trạng thái dùng badge:
  - `Đang hoạt động`
  - `Tạm ngưng`
- Cột thao tác dùng dropdown ba chấm.
- Không làm table quá rộng.

---

## 6.7. Acceptance checklist cho Membership Tiers Admin

- [ ] Mô tả trang được đổi đúng nội dung.
- [ ] Modal thêm/sửa có label đầy đủ.
- [ ] Placeholder đúng: tên hạng, ngưỡng điểm, ưu đãi, mô tả.
- [ ] Number input có suffix `điểm` và `%`.
- [ ] Có toggle `Đang hoạt động`.
- [ ] Modal bố cục rõ hơn, không 2 scroll.
- [ ] Nút `Tắt` đổi thành `Tạm ngưng`.
- [ ] Nếu inactive, action đổi thành `Kích hoạt lại`.
- [ ] Action table dùng ba chấm nếu các trang khác dùng.
- [ ] Validate đầy đủ.
- [ ] Không cho trùng ngưỡng điểm.
- [ ] Handle lỗi khi không thể xóa/tạm ngưng hạng đang có khách hàng.
- [ ] Giao diện bảng gọn và đồng bộ.

---

# 7. Component/helper/API nên tạo hoặc cập nhật

## 7.1. Admin Appointments

```txt
features/admin/appointments/components/AdminAppointmentFilters.tsx
features/admin/appointments/components/AdminAppointmentsTable.tsx
features/admin/appointments/utils/appointmentTableDisplay.ts
```

---

## 7.2. Admin Service Histories

```txt
features/admin/service-histories/components/AdminServiceHistorySummaryCards.tsx
features/admin/service-histories/components/AdminServiceHistoryFilters.tsx
features/admin/service-histories/utils/serviceHistoryDisplay.ts
```

---

## 7.3. Admin Customers

```txt
features/admin/customers/api/adminCustomerApi.ts
features/admin/customers/hooks/useUserDetail.ts
features/admin/customers/hooks/useUpdateUserByAdmin.ts
features/admin/customers/components/AdminCustomerFilters.tsx
features/admin/customers/components/AdminCustomersTable.tsx
features/admin/customers/components/AdminCustomerActionsMenu.tsx
features/admin/customers/components/AdminCustomerDetailDialog.tsx
features/admin/customers/components/AdminCustomerEditDialog.tsx
features/admin/customers/components/AdminCustomerStatusDialog.tsx
features/admin/customers/utils/customerDisplay.ts
```

---

## 7.4. Admin Membership Tiers

```txt
features/admin/membership-tiers/components/AdminMembershipTierTable.tsx
features/admin/membership-tiers/components/AdminMembershipTierActionsMenu.tsx
features/admin/membership-tiers/components/AdminMembershipTierFormDialog.tsx
features/admin/membership-tiers/components/AdminMembershipTierStatusDialog.tsx
features/admin/membership-tiers/utils/membershipTierValidation.ts
features/admin/membership-tiers/utils/membershipTierDisplay.ts
```

---

## 7.5. Shared helpers

Nếu project có `src/lib` hoặc `src/utils`, thêm/cập nhật:

```txt
formatDateVi.ts
formatCurrencyVi.ts
truncateText.ts
```

Gợi ý format date:

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

Gợi ý format datetime:

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

# 8. Không được làm

- Không thêm mock data.
- Không gọi sai API theo role.
- Không dùng API users để chỉnh loyalty points.
- Không để ID kỹ thuật xuất hiện trong bảng khách hàng nếu không cần.
- Không để date format kiểu `mm/dd/yyyy` trong UI admin.
- Không để số tiền doanh thu xuống dòng trong card thống kê.
- Không để table làm page scroll ngang toàn trang.
- Không để filter panel quá cao hoặc nhiều khoảng trắng thừa.
- Không dùng từ `Tắt` cho trạng thái membership tier.
- Không bỏ validate form membership tier.
- Không xóa/tạm ngưng tier mà không xử lý lỗi khi tier đang có customer.

---

# 9. Checklist tổng sau khi hoàn thành

## Admin Appointments

- [ ] Filter gọn.
- [ ] Date format `dd/mm/yyyy` hoặc `Chọn ngày`.
- [ ] Table giảm scroll ngang.
- [ ] Cột `Dịch vụ`, `Xe`, `Staff` có width hợp lý.

## Admin Service Histories

- [ ] Card doanh thu không xuống dòng.
- [ ] Card thống kê gọn hơn.
- [ ] Date filter dùng format Việt Nam.
- [ ] Filter có nhãn rõ và ít khoảng trắng.

## Admin Customers

- [ ] Bỏ tab dư.
- [ ] Bỏ nút `Thêm bộ lọc`.
- [ ] Bỏ dòng `Dữ liệu từ server`.
- [ ] Đổi icon card thống kê.
- [ ] Ẩn ID khỏi bảng.
- [ ] Thêm cột `Thao tác`.
- [ ] Kết nối `GET /api/users/{userId}` cho chi tiết.
- [ ] Kết nối `PATCH /api/users/{userId}` cho chỉnh sửa/tạm khóa/mở khóa.
- [ ] Không dùng users API để chỉnh loyalty points.
- [ ] Ngày format Việt Nam.

## Admin Membership Tiers

- [ ] Sửa mô tả trang.
- [ ] Modal có label/placeholder rõ.
- [ ] Có validate đầy đủ.
- [ ] Nút `Tắt` đổi thành `Tạm ngưng`.
- [ ] Inactive thì action là `Kích hoạt lại`.
- [ ] Action table đồng bộ bằng ba chấm.
- [ ] Bảng gọn hơn.

---

# 10. Kết quả mong muốn

Sau khi chỉnh xong:

1. Giao diện Admin gọn hơn và đồng bộ hơn.
2. Filter của các trang ít chiếm chỗ, date hiển thị theo kiểu Việt Nam.
3. Table không bị kéo ngang quá nhiều do text dài.
4. Trang khách hàng có thao tác đầy đủ và kết nối đúng API user detail/update.
5. Trang hạng thành viên rõ logic loyalty hơn, validate tốt hơn và thao tác dễ hiểu hơn.
6. UI không còn các text kỹ thuật hoặc dư thừa như ID trong bảng, `Dữ liệu từ server`, `Tắt`.
7. Code sạch, dễ bảo trì, đúng role và đúng API.
