# TECHNOVA

## Chạy local

1. Cài Node.js và MongoDB.
2. `cd backend`
3. `npm install`
4. `npm run seed`
5. `npm run dev`
6. Mở `http://localhost:5000`
7. Admin: `http://localhost:5000/admin.html`

Admin mặc định:
- Email: `admin@technova.com`
- Password: `admin123`

## Các lỗi đã xử lý
- Không dùng MongoDB transaction để tương thích MongoDB standalone local.
- Seed admin dùng `save()` để bcrypt hash password đúng cách.
- Tách JavaScript ra file ngoài để không bị CSP chặn inline script/event handler.
- Cho phép ảnh Unsplash trong CSP.
- Cart tự loại sản phẩm đã bị xóa/ẩn và giới hạn theo stock.
- Checkout tạo order, giảm stock atomic và clear cart khi thành công.
- Admin có thêm/sửa/xóa sản phẩm, cập nhật trạng thái order và khóa/mở customer.
- Trang chủ có danh mục, dịch vụ, liên hệ và footer.


## Authentication flow
- New users register at `/register.html`. Registration redirects to `/login.html`; it does not automatically log the user in.
- The storefront `/` requires a logged-in customer. If not logged in, it redirects to `/login.html`.
- After login, the user enters the storefront. The header shows `Đăng xuất`.
- The cart remains in browser localStorage across login/logout.

## Product image persistence
Product edits are stored in MongoDB. The seed script is non-destructive and no longer overwrites existing product images/prices/stock when `npm run seed` is run. Restarting `npm run dev` therefore keeps admin changes.

## v4 fixes
- Removed stale auth-modal JavaScript that referenced missing `switchAuth` / `authForm` elements and crashed the storefront.
- Storefront initialization is now DOM-safe and redirects unauthenticated visitors to `/login.html`.
- Logged-in users see `Đăng xuất` in the header.
- Product images are persisted in MongoDB; the seed script is non-destructive and does not overwrite admin-edited images when restarting or reseeding.


## v5 fixes
- Admin login screen does not show the Logout button until an admin is authenticated.
- Admin logout clears the auth cookie even if the session is already expired.
- Customer registration creates the account without logging in; frontend redirects to login.
