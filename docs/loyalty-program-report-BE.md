# Loyalty Program - Chương trình khách hàng thân thiết

## 1. Mục tiêu

Chức năng Loyalty Program giúp customer tích điểm sau khi sử dụng dịch vụ đã thanh toán, tăng hạng theo điểm tích trong quý, đổi phần thưởng bằng điểm khả dụng và hỗ trợ staff/admin tra cứu thông tin loyalty khi xử lý lịch hẹn.

## 2. Phạm vi đã làm

- Membership Tier Management: Admin quản lý hạng Bronze, Silver, Gold, Platinum, ngưỡng điểm và phần trăm giảm giá.
- Loyalty Account: mỗi customer có một tài khoản loyalty riêng với điểm hiện tại, tổng điểm đã tích, tổng điểm đã đổi và tổng điểm đã hết hạn.
- Earn Points after Paid Completed Service: hệ thống chỉ cộng điểm khi appointment đã `completed` và `paymentStatus` là `paid`.
- Loyalty Point Transaction: lưu lịch sử `earn`, `redeem`, `adjust` và `expire`, có `remainingPoints` và `expiresAt` để xử lý FIFO và hết hạn điểm.
- Reward Management: Admin quản lý reward, điểm cần đổi, giảm giá, số lượng và hạn sử dụng.
- Reward Redemption: Customer đổi reward bằng điểm chưa hết hạn; Staff/Admin đánh dấu reward redemption là `used`.
- Swagger Documentation: cập nhật endpoint payment-status, schema loyalty và reward redemption.

## 3. Phân quyền

- Customer: xem loyalty profile của mình, xem transaction của mình, xem reward active, đổi reward và xem reward đã đổi.
- Staff: xem loyalty profile/transaction của customer và đánh dấu reward redemption là `used`; không được xác nhận thanh toán.
- Admin: quản lý membership tiers, rewards, xem loyalty của customer, xác nhận payment status và đánh dấu reward redemption là `used`.

## 4. Luồng nghiệp vụ chính

1. Customer đặt lịch và sử dụng dịch vụ.
2. Staff/Admin cập nhật appointment sang `completed`; backend tạo Service History nếu chưa có.
3. Admin cập nhật `paymentStatus` của appointment sang `paid`.
4. Backend chỉ cộng điểm khi appointment đã `completed` và `paid`.
5. Điểm cộng theo công thức `Math.floor(totalPrice / 10000)` và hết hạn đồng loạt vào đầu quý kế tiếp theo giờ Việt Nam.
6. Customer đổi reward bằng điểm khả dụng; hệ thống trừ điểm theo FIFO từ các batch chưa hết hạn.
7. Redemption tạo transaction `redeem` và reward redemption ở trạng thái `available`.
8. Staff/Admin đánh dấu reward redemption là `used` khi customer sử dụng reward.

## 5. API liên quan

### Appointments

- `PATCH /api/appointments/:appointmentId/payment-status`: Admin cập nhật trạng thái thanh toán; khi chuyển completed appointment sang `paid`, hệ thống xử lý cộng điểm đúng một lần.

### Membership Tiers

- `POST /api/membership-tiers`
- `GET /api/membership-tiers`
- `GET /api/membership-tiers/:membershipTierId`
- `PATCH /api/membership-tiers/:membershipTierId`
- `DELETE /api/membership-tiers/:membershipTierId`

### Loyalty

- `GET /api/loyalty/me`
- `GET /api/loyalty/me/transactions`
- `GET /api/loyalty/customers/:customerId`
- `GET /api/loyalty/customers/:customerId/transactions`

### Rewards

- `POST /api/rewards`
- `GET /api/rewards`
- `GET /api/rewards/:rewardId`
- `PATCH /api/rewards/:rewardId`
- `DELETE /api/rewards/:rewardId`
- `POST /api/rewards/:rewardId/redeem`
- `GET /api/rewards/me/redemptions`
- `PATCH /api/rewards/redemptions/:rewardRedemptionId/use`

## 6. Business Rules

- Không cộng điểm nếu appointment chưa `completed` hoặc chưa `paid`.
- Không cộng điểm nếu `totalPrice` không hợp lệ hoặc nhỏ hơn `10000`.
- Chống cộng điểm trùng bằng unique transaction theo `serviceHistoryId` và type `earn`, đồng thời lưu flag trên service history.
- Membership tier tính theo `currentQuarterEarnedPoints`; đổi thưởng không làm giảm điểm xét hạng, nhưng hạng được reset vào đầu quý kế tiếp.
- Điểm earn chưa dùng hết hạn lúc `00:00` ngày 1/1, 1/4, 1/7 và 1/10 theo múi giờ `Asia/Ho_Chi_Minh`.
- Redeem reward dùng FIFO theo `expiresAt`/`createdAt`, chỉ dùng điểm còn `remainingPoints`.
- Redeem reward và earn points được xử lý trong MongoDB transaction để tránh lệch account, transaction, service history và reward counters.
- `User.loyaltyPoints` không còn là nguồn dữ liệu; điểm loyalty nằm trong `LoyaltyAccount`.

## 7. Giới hạn hiện tại

- Chưa có payment gateway riêng; backend chỉ có trạng thái `paymentStatus` trên appointment.
- Chưa có Promotions hoặc Dashboard routes trong backend hiện tại.
- Có scheduler rollover theo quý, catch-up khi khởi động và kiểm tra lazy trước các thao tác dùng điểm hoặc hạng.
