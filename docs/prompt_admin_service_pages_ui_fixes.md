# Prompt FE - Chỉnh sửa UI Admin: Quản lý danh mục dịch vụ và Quản lý dịch vụ

## 1. Vai trò

Bạn là **Senior Frontend Developer React + TypeScript + UI/UX Designer**.

Hãy kiểm tra và chỉnh sửa UI cho 2 màn hình thuộc **role Admin** trong hệ thống **Shinecraft / Gara CRM**:

```txt
/admin/service-categories
/admin/services
```

Nếu route thực tế trong project khác, hãy dùng đúng route hiện tại.

Mục tiêu là làm giao diện **gọn hơn, đồng bộ hơn, dễ thao tác hơn**, đặc biệt ở phần card thống kê, filter/search và cột thao tác trong bảng.

---

## 2. Nguyên tắc chung

Khi chỉnh UI, cần tuân thủ:

- Không phá layout Admin hiện tại.
- Không dùng mock data.
- Không đổi API nếu không cần.
- Không làm phát sinh horizontal scroll toàn trang.
- Với bảng lớn, chỉ cho scroll ngang trong table wrapper nếu thật sự cần.
- Các card thống kê phải gọn, không quá cao so với lượng nội dung.
- Số tiền không được bị xuống dòng.
- Text dài trong table cần dùng `truncate`, `line-clamp` hoặc tooltip/detail.
- Các trang admin nên đồng bộ pattern thao tác, ưu tiên dùng cột `Thao tác` với dropdown ba chấm `...`.
- Search/filter nên nằm trước bảng để admin dễ lọc dữ liệu.
- Các trạng thái nên dùng badge rõ ràng: `Đang hoạt động`, `Tạm ẩn`.

---

# 3. Màn Quản lý danh mục dịch vụ

Route gợi ý:

```txt
/admin/service-categories
```

## 3.1. Card thống kê

### Vấn đề

Card hiện tại nhìn ổn nhưng có thể gọn hơn và tên card nên thống nhất hơn.

### Yêu cầu chỉnh

- Giảm padding/gap nếu card đang cao.
- Tên card nên thống nhất thành 4 card:

```txt
Tổng danh mục
Đang hoạt động
Tạm ẩn
Dịch vụ đã gắn
```

Ý nghĩa:

- `Tổng danh mục`: tổng số service category.
- `Đang hoạt động`: số category active.
- `Tạm ẩn`: số category inactive hoặc bị soft delete theo logic BE.
- `Dịch vụ đã gắn`: tổng số service đang thuộc các danh mục, nếu data hiện có hỗ trợ.

Nếu BE chưa trả số `Dịch vụ đã gắn`, có thể tính từ danh sách services đã fetch nếu màn đã có dữ liệu. Nếu chưa có dữ liệu, hiển thị `0` hoặc `--`, không tạo mock data.

### Gợi ý UI

```tsx
<Card className="p-4">
  <div className="flex items-center justify-between gap-3">
    <div className="min-w-0">
      <p className="truncate text-sm text-muted-foreground">Tổng danh mục</p>
      <p className="text-2xl font-semibold">12</p>
    </div>
    <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
  </div>
</Card>
```

---

## 3.2. Search và lọc trạng thái

### Vấn đề

Trang đang thiếu thanh tìm kiếm / lọc trạng thái.

### Yêu cầu chỉnh

Thêm khu vực search/filter trước bảng.

Gợi ý layout:

```txt
[Tìm kiếm danh mục...] [Tất cả trạng thái]
```

Trong đó:

- Search theo tên danh mục hoặc mô tả.
- Trạng thái gồm:
  - `Tất cả trạng thái`
  - `Đang hoạt động`
  - `Tạm ẩn`

Nếu Backend có hỗ trợ query params thì dùng server-side filter. Nếu Backend chưa hỗ trợ thì filter client-side từ data đã fetch.

### Gợi ý UI

```tsx
<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
  <Input placeholder="Tìm kiếm danh mục..." className="md:max-w-sm" />

  <Select>
    <SelectTrigger className="md:w-[180px]">
      <SelectValue placeholder="Tất cả trạng thái" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tất cả trạng thái</SelectItem>
      <SelectItem value="active">Đang hoạt động</SelectItem>
      <SelectItem value="inactive">Tạm ẩn</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 3.3. Bảng danh mục dịch vụ

### Vấn đề 1: Thiếu cột `Thao tác`

Bảng hiện thiếu cột thao tác.

### Yêu cầu chỉnh

Thêm cột:

```txt
Thao tác
```

Các action gợi ý:

- `Xem chi tiết`
- `Chỉnh sửa`
- `Tạm ẩn`
- Nếu danh mục đang tạm ẩn thì đổi thành `Kích hoạt lại`

Nên dùng dropdown ba chấm để đồng bộ với các trang admin khác:

```txt
[...]
  - Xem chi tiết
  - Chỉnh sửa
  - Tạm ẩn / Kích hoạt lại
```

Nếu BE có API delete/status riêng, dùng đúng API hiện tại của project. Không tạo action nếu Backend chưa hỗ trợ.

---

### Vấn đề 2: `Chưa có mô tả` đang quá nổi

Nếu danh mục chưa có mô tả, text `Chưa có mô tả` nên hiển thị nhẹ hơn.

### Yêu cầu chỉnh

- Dùng màu muted.
- Dùng italic nhẹ nếu phù hợp.
- Không để text này nổi bật như dữ liệu chính.

Gợi ý:

```tsx
<span className="text-sm italic text-muted-foreground">Chưa có mô tả</span>
```

---

### Vấn đề 3: Cột `Tổng giá niêm yết` nên căn phải

### Yêu cầu chỉnh

- Header của cột `Tổng giá niêm yết` căn phải.
- Cell value căn phải.
- Format tiền theo kiểu Việt Nam.
- Không để số tiền xuống dòng.

Gợi ý:

```tsx
<TableHead className="text-right">Tổng giá niêm yết</TableHead>

<TableCell className="text-right whitespace-nowrap font-medium">
  {formatCurrencyVi(totalListPrice)}
</TableCell>
```

---

## 3.4. Acceptance checklist cho Quản lý danh mục dịch vụ

- [ ] Có cột `Thao tác`.
- [ ] Action dùng dropdown ba chấm nếu các trang admin khác đang dùng pattern này.
- [ ] Có thanh tìm kiếm.
- [ ] Có lọc trạng thái.
- [ ] Card thống kê gọn hơn.
- [ ] Tên card thống nhất: `Tổng danh mục`, `Đang hoạt động`, `Tạm ẩn`, `Dịch vụ đã gắn`.
- [ ] `Chưa có mô tả` hiển thị nhẹ hơn.
- [ ] Cột `Tổng giá niêm yết` căn phải.
- [ ] Tiền tệ format kiểu Việt Nam và không xuống dòng.
- [ ] Không phát sinh horizontal scroll toàn trang.

---

# 4. Màn Quản lý dịch vụ

Route gợi ý:

```txt
/admin/services
```

## 4.1. Card thống kê

### Vấn đề 1: Card `Giá trung bình` bị vỡ dòng

Số tiền trong card `Giá trung bình` đang bị xuống dòng.

### Yêu cầu chỉnh

- Không để số tiền bị xuống dòng.
- Dùng `whitespace-nowrap`.
- Nếu số tiền dài, giảm font-size riêng cho card này.
- Format tiền theo kiểu Việt Nam.

Gợi ý:

```tsx
<p className="whitespace-nowrap text-xl font-bold xl:text-2xl">{formatCurrencyVi(averagePrice)}</p>
```

---

### Vấn đề 2: Card thống kê hơi cao

### Yêu cầu chỉnh

- Giảm padding card.
- Giảm gap giữa title, icon và value.
- Giữ chiều cao thống nhất nhưng không quá lớn.
- Tránh để card chiếm quá nhiều chiều dọc.

Gợi ý:

```tsx
<Card className="p-4">...</Card>
```

---

## 4.2. Bỏ phần `Dịch vụ mới nhất`

### Vấn đề

Phần `Dịch vụ mới nhất` có thể đang dư, làm trang dài và phân tán sự chú ý khỏi bảng quản lý chính.

### Yêu cầu chỉnh

- Bỏ section `Dịch vụ mới nhất`.
- Nếu cần xem dịch vụ mới, có thể sort bảng theo `createdAt` mới nhất.
- Không giữ section này nếu không có nghiệp vụ rõ ràng.

---

## 4.3. Thêm thanh search/filter trước bảng

### Vấn đề

Trang đang thiếu thanh search/filter trước bảng.

### Yêu cầu chỉnh

Thêm khu vực filter trước bảng quản lý dịch vụ.

Gợi ý layout:

```txt
[Tìm kiếm dịch vụ...] [Tất cả danh mục] [Tất cả trạng thái] [Khoảng giá nếu cần]
```

Tối thiểu cần có:

- Search theo tên dịch vụ.
- Filter danh mục.
- Filter trạng thái.

Nếu Backend có hỗ trợ query params thì dùng server-side filter. Nếu chưa có thì filter client-side.

### Gợi ý UI

```tsx
<div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
  <Input placeholder="Tìm kiếm dịch vụ..." />

  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Tất cả danh mục" />
    </SelectTrigger>
    <SelectContent>...</SelectContent>
  </Select>

  <Select>
    <SelectTrigger>
      <SelectValue placeholder="Tất cả trạng thái" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">Tất cả trạng thái</SelectItem>
      <SelectItem value="active">Đang hoạt động</SelectItem>
      <SelectItem value="inactive">Tạm ẩn</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## 4.4. Table danh sách dịch vụ

### Vấn đề: Cột `Thao tác` chưa đồng bộ

Cột thao tác hiện chưa đồng bộ với các trang admin khác.

### Yêu cầu chỉnh

- Đồng bộ cột `Thao tác` theo pattern chung.
- Nếu các trang khác dùng dropdown ba chấm, trang này cũng dùng dropdown ba chấm.
- Các action gợi ý:
  - `Xem chi tiết`
  - `Chỉnh sửa`
  - `Tạm ẩn`
  - Nếu dịch vụ đang tạm ẩn thì đổi thành `Kích hoạt lại`

Không để quá nhiều button inline làm table bị rộng.

### Gợi ý action menu

```txt
[...]
  - Xem chi tiết
  - Chỉnh sửa
  - Tạm ẩn / Kích hoạt lại
```

---

## 4.5. Table text và tiền tệ

Yêu cầu thêm:

- Cột tên dịch vụ nếu dài thì dùng `truncate` hoặc `line-clamp-2`.
- Cột mô tả nếu dài thì dùng `line-clamp-2`.
- Cột giá căn phải và `whitespace-nowrap`.
- Cột thời lượng gọn, ví dụ `60 phút`.
- Cột trạng thái dùng badge:
  - `Đang hoạt động`
  - `Tạm ẩn`

Gợi ý:

```tsx
<TableCell className="max-w-[240px]">
  <div className="line-clamp-2 font-medium">
    {service.name}
  </div>
</TableCell>

<TableCell className="text-right whitespace-nowrap font-medium">
  {formatCurrencyVi(service.price)}
</TableCell>
```

---

## 4.6. Acceptance checklist cho Quản lý dịch vụ

- [ ] Card `Giá trung bình` không bị vỡ dòng.
- [ ] Card thống kê gọn hơn, thấp hơn.
- [ ] Bỏ section `Dịch vụ mới nhất`.
- [ ] Có thanh search/filter trước bảng.
- [ ] Filter tối thiểu gồm search, danh mục, trạng thái.
- [ ] Cột `Thao tác` đồng bộ với các trang admin khác.
- [ ] Action nên dùng dropdown ba chấm nếu project đang dùng pattern này.
- [ ] Cột giá căn phải và không xuống dòng.
- [ ] Text dài trong tên/mô tả dịch vụ không làm vỡ table.
- [ ] Không phát sinh horizontal scroll toàn trang.

---

# 5. Component/helper nên tạo hoặc cập nhật

## 5.1. Admin Service Categories

```txt
features/admin/service-categories/components/AdminServiceCategorySummaryCards.tsx
features/admin/service-categories/components/AdminServiceCategoryFilters.tsx
features/admin/service-categories/components/AdminServiceCategoryTable.tsx
features/admin/service-categories/components/AdminServiceCategoryActionsMenu.tsx
features/admin/service-categories/components/AdminServiceCategoryDetailDialog.tsx
features/admin/service-categories/components/AdminServiceCategoryFormDialog.tsx
features/admin/service-categories/utils/serviceCategoryDisplay.ts
```

---

## 5.2. Admin Services

```txt
features/admin/services/components/AdminServiceSummaryCards.tsx
features/admin/services/components/AdminServiceFilters.tsx
features/admin/services/components/AdminServiceTable.tsx
features/admin/services/components/AdminServiceActionsMenu.tsx
features/admin/services/components/AdminServiceDetailDialog.tsx
features/admin/services/components/AdminServiceFormDialog.tsx
features/admin/services/utils/serviceDisplay.ts
```

---

## 5.3. Shared helpers

Nếu project chưa có, tạo hoặc cập nhật:

```txt
src/lib/formatDateVi.ts
src/lib/formatCurrencyVi.ts
src/lib/tableText.ts
```

Gợi ý format tiền:

```ts
export const formatCurrencyVi = (value?: number | null) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '0đ';
  }

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value);
};
```

Gợi ý fallback mô tả:

```ts
export const formatDescriptionFallback = (description?: string | null) => {
  return description?.trim() ? description : 'Chưa có mô tả';
};
```

---

# 6. Không được làm

- Không thêm mock data.
- Không làm table kéo ngang toàn page.
- Không để số tiền xuống dòng trong card hoặc table.
- Không để action button inline quá nhiều làm table rộng.
- Không giữ section `Dịch vụ mới nhất` nếu không có nghiệp vụ rõ.
- Không để `Chưa có mô tả` nổi bật như dữ liệu chính.
- Không để search/filter quá cao hoặc quá nhiều khoảng trắng.
- Không đổi API nếu không cần.
- Không xóa hoặc ẩn dữ liệu bằng FE nếu Backend chưa hỗ trợ action tương ứng.

---

# 7. Checklist tổng sau khi hoàn thành

## Quản lý danh mục dịch vụ

- [ ] Card thống kê gọn hơn.
- [ ] Tên card thống nhất.
- [ ] Có search/filter trạng thái.
- [ ] Có cột `Thao tác`.
- [ ] `Chưa có mô tả` hiển thị nhẹ hơn.
- [ ] `Tổng giá niêm yết` căn phải.
- [ ] Table không gây horizontal scroll toàn trang.

## Quản lý dịch vụ

- [ ] Card `Giá trung bình` không bị xuống dòng.
- [ ] Card thống kê thấp hơn.
- [ ] Bỏ `Dịch vụ mới nhất`.
- [ ] Có search/filter trước bảng.
- [ ] Cột `Thao tác` đồng bộ.
- [ ] Giá tiền căn phải, không xuống dòng.
- [ ] Text dài không làm vỡ bảng.

---

# 8. Kết quả mong muốn

Sau khi chỉnh xong:

1. Trang quản lý danh mục dịch vụ có đủ search/filter và cột thao tác.
2. Card thống kê của danh mục và dịch vụ gọn, rõ, không bị vỡ dòng.
3. Trang quản lý dịch vụ bỏ phần dư `Dịch vụ mới nhất`.
4. Bảng của 2 trang đồng bộ pattern admin, đặc biệt cột `Thao tác`.
5. Tiền tệ căn phải, không xuống dòng và format theo kiểu Việt Nam.
6. UI gọn hơn, dễ dùng hơn và không gây scroll ngang toàn trang.
