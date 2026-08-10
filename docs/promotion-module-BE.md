# Module Khuyến Mãi

## Tổng quan

Module cho phép admin quản lý chương trình khuyến mãi và cho phép customer xem các chương trình đang hoạt động, còn hiệu lực và phù hợp với điều kiện áp dụng.

## Chức năng

- Admin tạo, xem, cập nhật, bật/tắt và ngừng kích hoạt khuyến mãi.
- Customer xem danh sách và chi tiết khuyến mãi phù hợp.
- Khuyến mãi hỗ trợ các loại `percentage`, `fixed_amount`, `bonus_points` và `free_service`.
- Đối tượng áp dụng gồm `all`, `membership_tier` và `service`.
- Việc áp dụng khuyến mãi được kiểm tra lại ở backend khi customer tạo lịch hẹn.

## Model

`Promotion` lưu các thông tin chính:

- `title`, `description`, `code`, `type` và `discountValue`.
- `bonusPoints`, `targetType`, `membershipTierId` và `serviceId`.
- `startDate`, `endDate`, `usageLimit` và `usedCount`.
- `minOrderAmount`, `maxDiscountAmount` và `isActive`.
- `createdBy`, `updatedBy`, `createdAt` và `updatedAt`.

## API

- `POST /api/promotions`: Admin tạo khuyến mãi.
- `GET /api/promotions`: Admin lấy danh sách khuyến mãi.
- `GET /api/promotions/active`: Customer lấy danh sách khuyến mãi phù hợp.
- `GET /api/promotions/:promotionId`: Lấy chi tiết khuyến mãi theo quyền truy cập.
- `PATCH /api/promotions/:promotionId`: Admin cập nhật khuyến mãi.
- `PATCH /api/promotions/:promotionId/status`: Admin bật hoặc tắt khuyến mãi.
- `DELETE /api/promotions/:promotionId`: Admin ngừng kích hoạt khuyến mãi.

## Validation và quyền truy cập

- Admin quản lý toàn bộ khuyến mãi; customer chỉ xem chương trình đang hoạt động và phù hợp.
- Route params và các trường tham chiếu phải là MongoDB ObjectId hợp lệ.
- `title`, `code`, `type`, `startDate` và `endDate` là các trường bắt buộc khi tạo mới.
- `endDate` phải sau `startDate`; các trường giá trị phải phù hợp với từng loại khuyến mãi.
- Hạng thành viên hoặc dịch vụ được tham chiếu phải tồn tại và đang hoạt động.

## Điểm tích hợp

- `src/routes/index.js` mount module tại `/promotions`.
- `src/services/appointment.service.js` xác thực điều kiện và tính quyền lợi khi tạo lịch hẹn.
- Khuyến mãi theo hạng thành viên được xác định qua `LoyaltyAccount.membershipTierId`.
- Swagger/OpenAPI mô tả các endpoint và schema của module.
