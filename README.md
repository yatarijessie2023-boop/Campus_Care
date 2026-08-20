# 逢甲校園修繕與清潔通報系統

第一版可執行骨架，採用 Vue 3、Node.js、Express、MySQL，固定淺色模式。

## 已納入功能

- 一般使用者建立通報
- JPG / PNG / WEBP 多圖上傳（最多 5 張、單張 5MB）
- 多條件搜尋與分頁 API
- 瀏覽器定位座標
- 管理員 JWT 登入
- 管理員案件狀態更新 API
- Email 狀態通知服務
- Dashboard 統計 API 與基本頁面
- PWA 設定
- RWD 淺色介面

## 啟動步驟

1. 安裝 Node.js 20+ 與 MySQL 8+。
2. 在 MySQL Workbench 執行 `database/schema.sql`。
3. 複製環境設定：
   - `backend/.env.example` → `backend/.env`
   - `frontend/.env.example` → `frontend/.env`
4. 建立管理員資料。
   - 你可以直接執行範例 seed 指令：

```bash
cd backend
npm run seed:admin -- admin 1234 "系統管理員" admin
```

   - 如果你的 MySQL 是走 socket，請先在 `backend/.env` 加上：

```env
DB_SOCKET=/tmp/mysql.sock
```

5. 安裝套件：

```bash
npm install
npm run install:all
```

6. 啟動前後端：

```bash
npm run dev
```

- 前端：http://localhost:5173
- 後端：http://localhost:3000
- 健康檢查：http://localhost:3000/api/health

## 第一階段驗收

- [ ] MySQL schema 可成功建立
- [ ] `/api/health` 回傳成功
- [ ] 通報表單可寫入資料庫
- [ ] 圖片可儲存在 `backend/uploads`
- [ ] 通報看板可讀取資料
- [ ] 管理員可登入並取得 JWT
- [ ] Dashboard 可取得統計資料

## Email 通知設定

通報人的 Email 為必填欄位。管理員更新案件狀態後，系統會使用 SMTP 寄送狀態通知；請在 `backend/.env` 填入 SMTP 設定：

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_account@example.com
SMTP_PASS=your_password
MAIL_FROM="FCU Campus Report <your_account@example.com>"
```

若尚未設定 SMTP，案件仍會更新成功，但後台會提示通知尚未寄出。

## 安全提醒

目前為教學專題骨架。正式部署前應加入速率限制、Helmet、輸入清理、圖片內容驗證、Refresh Token、HTTPS 與雲端物件儲存。


## 後台帳號管理

- `admin`：可管理案件、基礎資料，以及後台帳號。
- `staff`：可登入後台與處理案件，但不能進入帳號管理。
- 帳號管理支援新增帳號、修改顯示姓名/角色、啟用或停用帳號，以及重設密碼。
- 新密碼至少 8 個字元；系統管理員不能停用目前登入中的自己。

## 通報必填欄位

學號／員工編號、姓名、地點、問題分類、詳細位置與問題說明皆為必填。
