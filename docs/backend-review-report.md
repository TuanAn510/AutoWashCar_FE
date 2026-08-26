# Báo cáo đánh giá Backend

## 1. Tổng quan dự án

Backend là ứng dụng Node.js + Express.js + MongoDB cho nền tảng CRM chăm sóc xe. Hệ thống đã có các luồng chính: authentication, user/role guard, vehicle management, service catalog, appointment management, service history, loyalty program, rewards, promotions, dashboard và reports.

API được mount dưới `/api`, Swagger UI dưới `/api-docs`. Codebase dùng ESM, alias import `#app/*`, Mongoose cho database, Zod cho validation và JWT cho authentication.

## 2. Kiến trúc hiện tại

Kiến trúc hiện tại theo mô hình phân lớp rõ ràng:

- `routes`: khai báo endpoint, auth, role guard và validation.
- `controllers`: nhận request, gọi service, trả JSON response.
- `services`: chứa business logic và thao tác database.
- `models`: định nghĩa Mongoose schema, index, default, enum và reference.
- `validations`: định nghĩa Zod schema cho body, params, query.
- `middlewares`: auth, role, validation, upload và error handling.
- `providers`: JWT và Cloudinary.
- `utils`: constants, formatter, validators và `ApiError`.

Thiết kế này phù hợp với backend Express.js quy mô capstone, internship project hoặc SME production project. Chưa cần microservices hoặc event-driven architecture.

## 3. Các module đã triển khai

| Module             | Tình trạng    | Ghi chú                                                                        |
| ------------------ | ------------- | ------------------------------------------------------------------------------ |
| Auth               | Đã triển khai | Signup, signin, signout, fetch me, refresh token.                              |
| Users              | Đã triển khai | Admin/staff list user, admin list staff, update profile, update role/isActive. |
| Vehicles           | Đã triển khai | CRUD theo quyền, upload ảnh, soft delete bằng `deletedAt`.                     |
| Service Categories | Đã triển khai | Admin quản lý, public active list/detail.                                      |
| Services           | Đã triển khai | Admin quản lý, active service cho client, validate active category.            |
| Appointments       | Đã triển khai | Booking, status lifecycle, assign staff, reschedule, cancel, payment status.   |
| Service Histories  | Đã triển khai | Tự tạo từ completed appointment, admin/customer/staff read paths.              |
| Membership Tiers   | Đã triển khai | CRUD mềm bằng `isActive`.                                                      |
| Loyalty            | Đã triển khai | Loyalty account, transactions, earn/consume/adjust points, tier update.        |
| Rewards            | Đã triển khai | Reward CRUD, redeem reward, mark redemption used.                              |
| Promotions         | Đã triển khai | Promotion CRUD, active promotions, status update.                              |
| Dashboard          | Đã triển khai | Admin overview.                                                                |
| Reports            | Đã triển khai | Revenue, appointment, customer, service, loyalty, promotion, vehicle reports.  |

## 4. Điểm mạnh

- Cấu trúc thư mục rõ ràng, dễ tìm route/controller/service/model theo module.
- Service layer đang giữ phần lớn business rules, phù hợp với định hướng không nhồi nghiệp vụ vào model.
- Zod validation được dùng nhất quán ở route layer.
- Role guard đơn giản, dễ đọc và phù hợp với ba role hiện tại.
- Appointment có snapshot service để tránh sai lệch dữ liệu khi service đổi giá/tên sau này.
- Service History được tạo tự động từ appointment hoàn tất, tránh để frontend tự tạo dữ liệu hậu xử lý.
- Loyalty, reward, promotion và report đã có model/service riêng, không trộn vào appointment.
- Một số collection đã có index quan trọng như appointment theo customer/staff, vehicle unique license plate còn active, service unique theo category/slug, session TTL.

## 5. Điểm yếu và Technical Debt

- Error response hiện trả cả `stack`; trong production nên ẩn để giảm rủi ro lộ nội bộ.
- Response format giữa các controller chưa được chuẩn hóa tuyệt đối; có nơi trả list với pagination, có nơi trả object đơn giản.
- CORS whitelist đang hardcode trong constants, chưa cấu hình linh hoạt bằng environment.
- Một số comment hoặc message trong file nguồn có dấu hiệu mojibake khi xem qua PowerShell; cần kiểm tra encoding UTF-8 trong editor.
- Chưa thấy test tự động cho service logic, auth/role guard, validation và report aggregation.
- Chưa có audit log cho thao tác admin như đổi role, adjust points, hủy appointment, update promotion hoặc mark reward used.
- Swagger cần được giữ đồng bộ thường xuyên vì route surface đã lớn.

## 6. Đánh giá thiết kế API

API được chia module hợp lý theo resource: `/auth`, `/users`, `/vehicles`, `/services`, `/appointments`, `/service-histories`, `/loyalty`, `/rewards`, `/promotions`, `/dashboard`, `/reports`.

Route tĩnh như `/active`, `/me`, `/staff/my`, `/me/unread-count` nhìn chung được đặt trước route động `/:id`, đây là điểm tốt trong Express. Naming path tương đối rõ ràng, nhưng có một số khác biệt nhỏ như `/my`, `/staff/my`, `/customers/:customerId`, `/redemptions/:id/use`; vẫn chấp nhận được vì phản ánh use case cụ thể.

## 7. Đánh giá Database & MongoDB Models

Models được thiết kế phù hợp với nghiệp vụ:

- `User` lưu phone, password hash, displayName, role, avatar và trạng thái active.
- `Vehicle` gắn customer, có soft delete bằng `deletedAt`.
- `ServiceCategory` và `Service` tách riêng, service ref category.
- `Appointment` lưu service snapshot, assigned staff, status, payment status và cancel metadata.
- `ServiceHistory` ref appointment unique, tránh tạo lịch sử trùng.
- `LoyaltyAccount`, `LoyaltyPointTransaction`, `MembershipTier`, `Reward`, `RewardRedemption` hỗ trợ loyalty flow.
- `Promotion` có index phục vụ truy vấn active theo thời gian.
- `Session` dùng TTL index cho refresh token session.

Điểm cần cải thiện là chuẩn hóa chiến lược soft delete: hiện có module dùng `deletedAt`, module dùng `isActive`, và một số thao tác dùng hard delete. Điều này cần được ghi rõ theo từng resource.

## 8. Đánh giá Validation

Validation dùng Zod ở `src/validations` và middleware chung `validate`. Cách làm này giúp route khai báo rõ input contract. Các schema đã bao phủ params ObjectId, enum status, số điểm, ngày, boolean coercion, mô tả tối đa và query date range.

Một số cải thiện nên cân nhắc:

- Chuẩn hóa ngôn ngữ message validation sang tiếng Việt đầy đủ.
- Thêm validation cho query pagination/filter ở tất cả endpoint list nếu chưa có.
- Kiểm tra lại các message bị thiếu ký tự tiếng Việt như reward validation.

## 9. Đánh giá Authentication & Authorization

Authentication dùng JWT access token từ `Authorization: Bearer` hoặc cookie `accessToken`. Refresh token được quản lý qua `Session`. Authorization dùng `roleMiddleware` với constants `USER_ROLES`.

Thiết kế này phù hợp với quy mô hiện tại. Điểm cần cải thiện là thống nhất error response của `roleMiddleware` với `ApiError`, vì middleware này đang trả response trực tiếp trong một số nhánh thay vì đi qua error handler.

## 10. Đánh giá Error Handling

`ApiError` và `errorHandlingMiddleware` tạo luồng lỗi tập trung đơn giản. Services ném lỗi với HTTP status phù hợp như `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `CONFLICT`.

Technical debt chính:

- Response lỗi có `stack` ở mọi môi trường.
- Error format chưa có `errors` array cho validation chi tiết.
- Một số middleware trả response trực tiếp, làm giảm tính thống nhất.

## 11. Đánh giá Security

Điểm tốt:

- Có `helmet`.
- Có CORS policy.
- Có JWT authentication.
- Có role guard.
- Password được hash.
- Refresh token có session lưu database và TTL.
- File upload đi qua Multer và Cloudinary provider.

Điểm cần cải thiện:

- Ẩn stack trace trong production.
- Đưa CORS whitelist vào `.env`.
- Bổ sung rate limit cho auth endpoints.
- Bổ sung audit log cho thao tác admin.
- Rà soát cookie options như `httpOnly`, `secure`, `sameSite` theo môi trường deploy.

## 12. Đánh giá Performance

Hiệu năng hiện tại phù hợp với ứng dụng vừa và nhỏ. Code đã có một số index quan trọng và dùng aggregation cho reports. Service list và report nên tiếp tục kiểm soát pagination, date range và limit để tránh query quá lớn.

Rủi ro chính là report aggregation trên dữ liệu lớn có thể chậm nếu thiếu index theo ngày/trạng thái. Khi dữ liệu tăng, nên bổ sung index theo `createdAt`, `servicedAt`, `status`, `isActive` ở các collection được report dùng nhiều.

## 13. Đánh giá Maintainability

Maintainability tốt nhờ module hóa rõ ràng. File naming theo `*.route.js`, `*.controller.js`, `*.service.js`, `*.model.js`, `*.validation.js` dễ theo dõi.

Điểm cần cải thiện:

- Chuẩn hóa response envelope.
- Thêm test để bảo vệ các lifecycle quan trọng.
- Giữ Swagger sync với route/validation.
- Làm sạch encoding tiếng Việt trong comment/message nếu có file bị lưu sai encoding.

## 14. Những phần còn thiếu

- Audit logs cho admin actions.
- Rate limiting cho auth và endpoint nhạy cảm.
- Test tự động.
- Export reports.
- Advanced filtering/sorting cho list endpoints.
- Inventory integration nếu mở rộng sang quản lý vật tư hoặc phụ tùng.
- Centralized API response helper.

## 15. Đề xuất cải thiện

### Bắt buộc nên làm

| Đề xuất                                                     | Vì sao                                                                      | Lợi ích kỳ vọng                                        | Độ phức tạp |
| ----------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------ | ----------- |
| Ẩn `stack` trong production                                 | Stack trace có thể lộ đường dẫn, file nội bộ và logic hệ thống.             | Tăng an toàn khi deploy thật.                          | Low         |
| Chuẩn hóa error response qua `ApiError`                     | Một số middleware trả response trực tiếp, làm response lỗi không đồng nhất. | Frontend xử lý lỗi dễ hơn, code backend nhất quán hơn. | Low         |
| Rà soát encoding tiếng Việt trong source/docs               | Một số nội dung hiển thị mojibake trong terminal.                           | Tài liệu, message và Swagger chuyên nghiệp hơn.        | Low         |
| Thêm test cho auth, appointment lifecycle và loyalty points | Đây là các flow có rủi ro nghiệp vụ cao.                                    | Giảm regression khi thay đổi logic.                    | Medium      |
| Giữ `src/swagger.json` đồng bộ route thật                   | Backend đã có nhiều module; docs drift sẽ làm frontend dùng sai API.        | Frontend tích hợp nhanh hơn, giảm lỗi contract.        | Medium      |

### Nên làm

| Đề xuất                                                                    | Vì sao                                                           | Lợi ích kỳ vọng                                     | Độ phức tạp |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------- | ----------- |
| Đưa CORS whitelist vào environment                                         | Hardcode domain khó deploy nhiều môi trường.                     | Linh hoạt cho dev/staging/production.               | Low         |
| Thêm audit log cho admin actions                                           | Các thao tác như đổi role, adjust points, hủy lịch cần truy vết. | Dễ kiểm tra sai sót và hỗ trợ vận hành.             | Medium      |
| Chuẩn hóa response envelope                                                | Response list/detail hiện chưa hoàn toàn thống nhất.             | Frontend giảm logic rẽ nhánh.                       | Medium      |
| Bổ sung advanced filtering cho appointments, service histories, promotions | Admin cần tra cứu dữ liệu vận hành nhanh.                        | Tăng khả dụng thực tế cho dashboard và back office. | Medium      |
| Thêm export reports                                                        | Report hiện mới trả JSON.                                        | Phù hợp nhu cầu quản lý, kế toán, vận hành.         | Medium      |

### Có thể làm trong tương lai

| Đề xuất                             | Vì sao                                              | Lợi ích kỳ vọng                 | Độ phức tạp |
| ----------------------------------- | --------------------------------------------------- | ------------------------------- | ----------- |
| Inventory integration               | Hữu ích nếu garage cần quản lý vật tư/phụ tùng.     | Mở rộng nghiệp vụ sau bán hàng. | High        |
| Report caching hoặc pre-aggregation | Khi dữ liệu lớn, aggregation trực tiếp có thể chậm. | Tăng tốc dashboard/report.      | High        |

## 16. Kiểm tra tính nhất quán kiến trúc

| Hạng mục                      | Đánh giá       | Vi phạm hoặc lưu ý                                                                              |
| ----------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| Naming conventions            | Tốt            | File naming theo module nhất quán; path dùng kebab-case.                                        |
| Route consistency             | Tốt            | Route tĩnh được đặt trước dynamic route ở các module quan trọng.                                |
| Controller/service separation | Tốt            | Controller chủ yếu điều phối, service giữ nghiệp vụ.                                            |
| DTO/validator consistency     | Khá            | Zod có mặt ở hầu hết route; nên bổ sung query validation đồng đều hơn cho list endpoints.       |
| Response format consistency   | Khá            | Có message/data phổ biến nhưng chưa có response helper chung.                                   |
| Error format consistency      | Trung bình khá | `ApiError` tốt, nhưng role middleware còn trả response trực tiếp; error handler luôn trả stack. |
| Soft delete consistency       | Trung bình khá | `deletedAt`, `isActive` và hard delete cùng tồn tại; cần document rõ theo resource.             |

## 17. Missing feature analysis

Các feature còn thiếu nhưng thực tế cho loại dự án này:

- Audit logs cho thao tác admin/staff.
- Rate limiting cho auth và endpoint nhạy cảm.
- Advanced filtering, sorting và pagination chuẩn hóa.
- Export reports CSV/XLSX.
- Inventory integration ở mức đơn giản.
- Activity timeline cho customer hoặc vehicle.
- Test tự động và seed data cho môi trường demo.
- Health check chi tiết hơn `/api/status`, ví dụ kiểm tra database.

Không nên ưu tiên microservices, Kafka, Event Sourcing hoặc hệ thống phân tán phức tạp ở giai đoạn này vì codebase hiện tại vẫn phù hợp với modular monolith Express.js.

## 18. Kết luận

Backend đã đạt mức hoàn thiện tốt cho một dự án capstone hoặc sản phẩm SME giai đoạn đầu. Kiến trúc phân lớp rõ ràng, module nghiệp vụ khá đầy đủ, service layer chứa nhiều rule quan trọng và MongoDB models có các index cần thiết. Các điểm cần ưu tiên tiếp theo không phải là viết lại kiến trúc, mà là làm sạch technical debt vận hành: chuẩn hóa response/error, ẩn stack production, bổ sung test, audit log, Swagger sync và cải thiện report/filtering.

# Tóm tắt thực hiện

## File đã tạo

- `docs/backend-review-report.md`

## File đã cập nhật

- `README.md`

## Các vấn đề chính phát hiện được

- Error handler đang trả `stack` trong response.
- Response format chưa có helper chuẩn chung.
- Role middleware có nhánh trả response trực tiếp thay vì đi qua error handler.
- Chiến lược xóa mềm chưa đồng nhất tuyệt đối giữa các module.
- Chưa có test tự động cho các flow nghiệp vụ rủi ro cao.
- CORS whitelist đang hardcode.
- Một số nội dung tiếng Việt cần được kiểm tra encoding khi hiển thị mojibake.

## Các đề xuất ưu tiên cao

- Ẩn stack trace trong production.
- Chuẩn hóa error/response envelope.
- Bổ sung test cho auth, appointment lifecycle, service history và loyalty.
- Thêm audit log cho admin actions.
- Giữ Swagger đồng bộ với route thật.

## Đánh giá tổng thể dự án

| Tiêu chí          | Điểm   |
| ----------------- | ------ |
| Kiến trúc         | 8/10   |
| Code organization | 8/10   |
| Security          | 7/10   |
| Maintainability   | 7.5/10 |
| Scalability       | 7/10   |

Điểm tổng thể: **7.5/10**.
