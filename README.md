# EUU 超级投行 - Vercel 部署版

一个基于 React + Firebase 的专业银行/投资管理系统。

## 📋 项目特性

- ✨ 现代化 React 18 + Tailwind CSS 界面
- 🔐 用户认证与角色管理（Admin/User）
- 💼 完整的交易管理系统（贷款、注资、存款等）
- 📊 实时数据同步与统计分析
- 🔄 待审批工作流
- 📱 响应式设计，支持移动设备
- 🚀 Vercel 一键部署

## 🛠️ 本地开发

### 前置需求
- Node.js >= 18.0.0
- npm 或 yarn

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/EUU-Bank-Vercel.git
cd EUU-Bank-Vercel

# 安装依赖
npm install
```

### 配置 Firebase

1. 在 [Firebase Console](https://console.firebase.google.com/) 创建项目
2. 获取项目配置信息
3. 复制 `.env.example` 为 `.env.local`
4. 填入 Firebase 环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`：
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 本地运行

```bash
npm run dev
```

访问 http://localhost:5173

### 生产构建

```bash
npm run build
```

## 🚀 Vercel 部署

### 方式一：连接 GitHub（推荐）

1. 推送项目到 GitHub
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/your-username/EUU-Bank-Vercel.git
   git push -u origin main
   ```

2. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
3. 点击 "Add New" → "Project"
4. 导入 GitHub 仓库
5. 在 "Environment Variables" 中添加以下变量：
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

6. 点击 "Deploy"

### 方式二：Vercel CLI

```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 部署
vercel

# 添加环境变量后重新部署
vercel --prod
```

## 👤 默认账号

- **用户名**: EUU
- **密码**: vkinga79
- **角色**: 管理员

## 📚 功能说明

### 用户角色

- **管理员 (Admin)**：可以审批所有待处理交易、编辑/删除任何记录、查看所有用户数据
- **普通用户 (User)**：只能查看和编辑自己的交易，需要等待管理员审批

### 业务类型

| 类型 | 说明 | 创建者审批 |
|------|------|---------|
| 贷款 (Loan) | 向客户发放贷款 | 需审批 |
| 注资 (Injection) | 注入资金 | 需审批 |
| 撤资 (Withdraw_Inj) | 撤出注入的资金 | 需审批 |
| 存款 (Deposit) | 接收客户存款 | 需审批 |
| 取款 (Withdraw_Dep) | 客户取出存款 | 需审批 |

## 📊 仪表板统计

- **总资产**：所有已审核通过的贷款本金
- **总负债**：所有已审核通过的注资和存款本金
- **闲置资金**：负债扣除贷款后的余额
- **审批队列**：等待审批的交易数量
- **净现金流**：利息收入减去利息支出

## 🔒 数据安全

- Firebase Firestore 数据库，企业级加密
- 用户密码存储在 Firestore（建议后续迁移到 Firebase Auth）
- Session 存储认证信息
- 所有敏感操作都有删除确认

## 🎯 未来优化方向

- [ ] 迁移用户认证到 Firebase Authentication
- [ ] 添加数据导出功能 (CSV/Excel)
- [ ] 支持多币种
- [ ] 添加交易历史版本控制
- [ ] 数据备份与恢复功能

## 📝 许可证

MIT

## 🤝 支持

遇到问题？请创建 Issue 或联系开发者。

---

**开发者**: EUU  
**最后更新**: 2026年1月
