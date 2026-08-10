# Module Dashboard & Báo cáo

## 1. Tổng quan

Module Dashboard & Báo cáo cung cấp các API phân tích dữ liệu dành riêng cho admin trong backend Smart Vehicle Care CRM.

Báo cáo được tạo trực tiếp theo thời gian thực từ các collection MongoDB hiện có trong dự án. Module này không thêm
quy trình nghiệp vụ mới, background job, cache analytics, data warehouse, WebSocket hoặc xử lý thanh toán.

## 2. Chỉ số Dashboard

`GET /api/dashboard/overview`

Trả về các chỉ số tổng quan của hệ thống:

- Tổng số khách hàng
- Tổng số xe
- Tổng số cuộc hẹn
- Tổng số cuộc hẹn đã hoàn thành
- Tổng số dịch vụ đã hoàn thành
- Tổng số khuyến mãi đang hoạt động
- Tổng số thành viên loyalty
- Tổng số điểm đã phát hành
- Tổng số điểm đã đổi
- Tổng quan doanh thu

Doanh thu được tính từ `Appointment.finalAmount` của các lịch có `paymentStatus=paid`.

## 3. Các endpoint báo cáo

Tất cả endpoint bên dưới yêu cầu người dùng đã đăng nhập và có quyền admin.

- `GET /api/reports/revenue`
- `GET /api/reports/appointments`
- `GET /api/reports/customers`
- `GET /api/reports/services`
- `GET /api/reports/loyalty`
- `GET /api/reports/promotions`
- `GET /api/reports/vehicles`

Các báo cáo phù hợp có hỗ trợ lọc theo ngày:

- `startDate=YYYY-MM-DD`
- `endDate=YYYY-MM-DD`

Trang Reports sử dụng hợp đồng lọc theo tháng:

- `startMonth=YYYY-MM`
- `endMonth=YYYY-MM`

Hai tháng biên được tính bao gồm toàn bộ tháng. Backend chuyển khoảng tháng thành điều kiện nửa mở
`[đầu startMonth, đầu tháng kế tiếp sau endMonth)` theo múi giờ `+07:00`. Không được trộn tham số tháng và ngày trong cùng request.

Báo cáo doanh thu hỗ trợ:

- `period=daily`
- `period=weekly`
- `period=monthly`
- `period=yearly`

Các alias `day`, `week`, `month` và `year` cũng được chấp nhận.

Với `period=monthly`, doanh thu và lịch hẹn trả đủ mọi tháng trong khoảng đã chọn. Tháng không có dữ liệu vẫn có bucket giá trị `0`:

```json
[
  {
    "year": 2026,
    "month": 6,
    "period": "2026-06",
    "revenue": 1200000,
    "completedServicesCount": 3
  },
  { "year": 2026, "month": 7, "period": "2026-07", "revenue": 0, "completedServicesCount": 0 }
]
```

Các KPI khách hàng, loyalty, xe và bảng xếp hạng liên quan dùng tập đối tượng có hoạt động trong khoảng tháng. Khuyến mãi được tính từ lịch hẹn không bị hủy có sử dụng khuyến mãi trong khoảng, thay vì dùng bộ đếm toàn thời gian của promotion.

Báo cáo dịch vụ hỗ trợ `limit`, mặc định là `10` và tối đa là `50`.

## 4. Định nghĩa chỉ số

Doanh thu:

- `revenue`: Tổng `Appointment.finalAmount` của lịch đã thanh toán, lọc và gom tháng theo `paidAt`.
- `completedServicesCount`: Số lượng service snapshot trong các service history đã ghi nhận.

Cuộc hẹn:

- `totalAppointments`: Tổng số cuộc hẹn trong khoảng `scheduledAt` được chọn.
- `completedAppointments`: Số cuộc hẹn có trạng thái `completed`.
- `cancelledAppointments`: Số cuộc hẹn có trạng thái `cancelled`.
- `pendingAppointments`: Số cuộc hẹn có trạng thái `pending`.
- `completionRate`: Tỷ lệ cuộc hẹn hoàn thành trên tổng số cuộc hẹn.
- `cancellationRate`: Tỷ lệ cuộc hẹn bị hủy trên tổng số cuộc hẹn.

Khách hàng:

- `totalCustomers` / `activeCustomers`: Số khách hàng khác nhau có lịch hẹn không bị hủy, service history đang hoạt động hoặc giao dịch loyalty trong khoảng được chọn.
- `newCustomersInRange`: Số khách hàng được tạo trong khoảng được chọn (`newCustomersThisMonth` được giữ làm alias tương thích).
- `activeCustomers`: Số khách hàng có ít nhất một cuộc hẹn hoặc service history đang hoạt động trong khoảng ngày được chọn.
- `returningCustomers`: Số khách hàng có từ hai service history đang hoạt động trở lên trong khoảng ngày được chọn.

Dịch vụ:

- `mostBookedServices`: Danh sách dịch vụ được xếp hạng theo số lần sử dụng, sau đó theo doanh thu.
- `leastBookedServices`: Danh sách dịch vụ được xếp hạng theo số lần sử dụng thấp nhất, sau đó theo doanh thu.
- `revenue`: Tổng giá snapshot của dịch vụ trong service history.

Loyalty:

- `totalLoyaltyMembers`: Số loyalty account thuộc tập khách hàng có hoạt động trong khoảng được chọn.
- `pointsIssued`: Tổng điểm dương từ giao dịch `earn` và giao dịch `adjust` dương.
- `pointsRedeemed`: Tổng điểm từ giao dịch `redeem` và giao dịch `adjust` âm.
- `pointsExpired`: Tổng điểm từ giao dịch `expire`.
- `membershipTierDistribution`: Phân bố hạng hiện tại của loyalty account thuộc tập khách hàng có hoạt động trong khoảng.

Khuyến mãi:

- `totalPromotions`: Số khuyến mãi khác nhau được dùng bởi lịch hẹn không bị hủy trong khoảng.
- `promotionUsageCount`: Số lượt dùng khuyến mãi bởi lịch hẹn không bị hủy trong khoảng.
- `distributionByType`: Phân bố lượt dùng theo loại snapshot của khuyến mãi.
- `activePromotions` được giữ làm alias tương thích của `totalPromotions`; `expiredPromotions` trả `0` vì không còn là KPI trạng thái toàn hệ thống.

Xe:

- `totalVehicles`: Số xe chưa bị xóa mềm có lịch hẹn không bị hủy hoặc service history đang hoạt động trong khoảng.
- `vehiclesByBrand`: Top 10 thương hiệu trong tập xe có hoạt động trong khoảng.
- `mostCommonVehicleBrands`: Cùng danh sách thương hiệu đã xếp hạng, dùng thuận tiện cho frontend.

## 5. Chiến lược aggregation

Module sử dụng MongoDB aggregation pipeline và các truy vấn đếm thay vì tải toàn bộ collection vào bộ nhớ.

- Doanh thu dùng `$match`, `$group`, `$dateToString` và `$sum` trên `Appointment.paidAt`/`finalAmount`.
- Phân tích cuộc hẹn dùng `$group` với các biểu thức `$sum` có điều kiện trên `Appointment`.
- Phân tích dịch vụ dùng `$unwind` trên `ServiceHistory.services`, sau đó group theo service ID snapshot.
- Phân bố hạng loyalty dùng `$lookup` từ loyalty account sang membership tier.
- Phân bố khuyến mãi và xe dùng các aggregation pipeline dạng group.

## 6. Quy tắc phân quyền

Các API dashboard và báo cáo chỉ dành cho admin.

Mỗi route sử dụng:

- `authMiddleware`
- `roleMiddleware(USER_ROLES.ADMIN)`

Customer và staff không được truy cập dữ liệu phân tích toàn hệ thống.

## 7. Giả định đã sử dụng

- Dự án không có collection `Customer` riêng, nên chỉ số khách hàng dùng document `User` có role `customer`.
- Doanh thu được tính từ lịch đã thanh toán; số dịch vụ hoàn thành vẫn lấy từ `ServiceHistory` đang hoạt động.
- Bộ lọc ngày của báo cáo cuộc hẹn dùng `Appointment.scheduledAt`.
- Doanh thu, hoạt động khách hàng, mức độ sử dụng dịch vụ và loyalty dùng các field ngày phù hợp nhất với từng chỉ số:
  `servicedAt` cho service history và `createdAt` cho loyalty transaction.
- Khách hàng quay lại là khách hàng có từ hai service history đang hoạt động trở lên.
- Mức độ sử dụng khuyến mãi chỉ dựa trên `Promotion.usedCount` vì chưa có workflow redemption riêng.

## 8. Hạn chế hiện tại

- Chưa triển khai xử lý thanh toán.
- Doanh thu phản ánh các lịch đã được hệ thống đánh dấu thanh toán, chưa thay thế quy trình đối soát kế toán bên ngoài.
- Báo cáo dịch vụ chỉ xếp hạng các dịch vụ đã xuất hiện trong service history; dịch vụ chưa từng được sử dụng sẽ không xuất hiện.
- Hiệu quả khuyến mãi bị giới hạn bởi các field promotion hiện có và không suy diễn thêm hành vi redemption.
- Báo cáo được tạo theo thời gian thực từ MongoDB, nên dữ liệu rất lớn có thể cần cache hoặc pre-aggregation trong tương lai.

## 9. Cải tiến trong tương lai

- Thêm index cho các field ngày thường dùng trong báo cáo nếu dữ liệu production tăng lớn.
- Thêm chức năng xuất CSV cho báo cáo admin.
- Bổ sung báo cáo đối soát theo nhà cung cấp thanh toán khi cần nghiệp vụ kế toán chi tiết hơn.
- Thêm tracking redemption nếu khuyến mãi được tích hợp vào checkout hoặc quy trình đặt lịch.
- Bổ sung cấu hình chia bucket theo ngày và timezone cho triển khai đa vùng.
