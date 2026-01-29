import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Wallet, LogOut, Shield, CheckCircle, XCircle, 
  AlertCircle, Trash2, Edit, Lock, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Settings, PlusCircle, MinusCircle, X, MessageSquare, Send, ThumbsUp, TrendingUp, CheckSquare
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// 错误边界组件
// ==========================================
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">渲染出错</h2>
            </div>
            <p className="text-gray-600 mb-4">
              页面渲染时发生了错误，请刷新页面重试。
            </p>
            <details className="mb-4 text-xs text-gray-500">
              <summary className="cursor-pointer font-medium">错误详情</summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ==========================================
// 1. Supabase 配置
// ==========================================

let isConfigured = true;
let deployMode = 'standalone';

// 事务类型中文映射
const typeLabels = {
  'injection': '注资',
  'withdraw_inj': '撤资',
  'deposit': '存款',
  'withdraw_dep': '取款',
  'deposit_interest': '存款利息',
  'loan': '贷款',
  'loan_interest': '贷款利息',
  'loan_repayment': '还款',
  'planet_fund': '星星基金',
  'planet_card': '星星名片',
  'bank_asset': '银行资产',
  'bond_issue': '债券发售',
  'bond_subscribe': '债券申购',
  'bond_redeem': '债券赎回',
  'fund_subscribe': '基金申购',
  'fund_redeem': '基金赎回',
  'fund_dividend': '基金分红',
  'fund_dividend_withdraw': '基金分红提取',
  'fund_profit_withdraw': '基金盈利提取'
};

const getTypeLabel = (type) => typeLabels[type] || type;

// 获取本地化的类型标签（支持多语言）
const getLocalizedTypeLabel = (type, lang = 'zh') => {
  const labels = translations[lang]?.typeLabels || typeLabels;
  return labels[type] || type;
};

// 多语言翻译
const translations = {
  zh: {
    // 登录页
    loginTitle: 'EUU',
    loginSubtitle: 'Investment Bank',
    serverConnected: '服务器已连接',
    connecting: '正在连接...',
    connectionFailed: '连接失败',
    accountPlaceholder: '账号',
    passwordPlaceholder: '密码',
    loginButton: '登录',
    registerButton: '注册',
    noAccount: '没有账号？注册',
    backToLogin: '返回登录',
    authError: '账号或密码错误',
    // 头部
    currentUser: '当前用户',
    netCashFlow: '净现金流',
    perWeek: '/ 周',
    logout: '退出登录',
    // 公告栏
    noAnnouncement: '暂无公告',
    forum: '论坛',
    backToBank: '返回银行',
    newPost: '发帖',
    postTitle: '标题',
    postContent: '内容',
    publish: '发布',
    reply: '回复',
    likes: '点赞',
    noPostsYet: '暂无帖子',
    replyPlaceholder: '写下你的回复...',
    announcementPlaceholder: '输入公告内容...',
    save: '保存',
    cancel: '取消',
    editAnnouncement: '编辑公告',
    // 星星开发
    planetDev: '星星开发',
    planetCard: '星星名片',
    planetName: '星星名称',
    planetDesc: '星星描述',
    devProgress: '开发进度',
    planetFund: '星星开发资金',
    totalFund: '资金总余额',
    fundForDev: '为星星开发注资',
    fundAmount: '注资金额',
    submitFundRequest: '提交注资申请',
    namePlaceholder: '输入星星名称...',
    descPlaceholder: '输入星星描述内容...',
    updateCard: '更新名片',
    setProgress: '设置进度',
    progressValue: '进度值(%)',
    createCard: '创建名片',
    newCard: '新建星星名片',
    cardFund: '专项资金',
    fundingList: '注资名单',
    noFundingYet: '暂无注资记录',
    // 银行资产
    bankAssets: '银行资产',
    assetManagement: '资产管理',
    planetNameAsset: '星球名称',
    dailyOutput: '每日产出',
    itemName: '物品名称',
    quantity: '日产',
    assetValue: '资产价值',
    registerAsset: '登记资产',
    assetList: '资产列表',
    totalAssetValue: '不动产总价值',
    newAsset: '新增资产',
    itemPlaceholder: '输入物品名称...',
    quantityPlaceholder: '输入日产量...',
    valuePlaceholder: '输入资产价值(m)...',
    submitAsset: '提交资产登记',
    noAssetsYet: '暂无资产记录',
    // 审批
    pendingApproval: '待审批',
    applicant: '申请人',
    // 操作栏
    operations: '业务',
    loan: '贷款',
    injection: '注资',
    withdrawInj: '撤资',
    deposit: '存款',
    withdrawDep: '取款',
    manualSettle: '手动结算',
    // 统计卡片
    totalAssets: '总资产',
    totalLiabilities: '总放贷',
    idleFunds: '闲置资金',
    interestPool: '利息池',
    approvalQueue: '审批队列',
    approved: '已审核通过',
    availableBalance: '可用余额',
    weeklyNetInterest: '周净利息',
    pendingItems: '笔待处理',
    personalBalance: '个人账户',
    totalBalance: '资金余额',
    injectionAndDeposit: '注资+存款+利息',
    // 表格
    loanAssets: '贷款资产',
    injectionAccount: '注资账户',
    depositAccount: '存款账户',
    status: '状态',
    type: '类型',
    client: '客户',
    amount: '金额',
    interestPerWeek: '利息/周',
    settlementCount: '结算次数',
    settlementCycles: '已结算次数',
    time: '时间',
    actions: '操作',
    pending: '待审',
    rejected: '已拒绝',
    effective: '生效',
    noData: '暂无数据',
    repay: '还款',
    productType: '产品类型',
    normalDeposit: '普通存款 (2.5%/周)',
    riskDeposit: '成员理财 (9%/周)',
    riskDeposit5: '普通理财 (5%/周)',
    riskNote: '⚠️ 仅琉璃主权资本成员可申请 9%/周理财；管理员会鉴别并通过/拒绝。风险理财只保本不保利息。',
    riskNote5: '普通客户理财利率为 5%/周。风险理财只保本不保利息。',
    interestLoan: '利息贷款',
    stableLoan: '稳定贷款',
    // 模态框
    create: '新建',
    edit: '编辑',
    clientLabel: '客户/对象',
    amountLabel: '金额 (m)',
    rateLabel: '利率 (%)',
    submit: '提交',
    // 类型标签
    typeLabels: typeLabels
  },
  en: {
    // Login page
    loginTitle: 'EUU',
    loginSubtitle: 'Investment Bank',
    serverConnected: 'Server Connected',
    connecting: 'Connecting...',
    connectionFailed: 'Connection Failed',
    accountPlaceholder: 'Username',
    passwordPlaceholder: 'Password',
    loginButton: 'Login',
    registerButton: 'Register',
    noAccount: 'No account? Register',
    backToLogin: 'Back to Login',
    authError: 'Incorrect username or password',
    // Header
    currentUser: 'Current User',
    netCashFlow: 'Net Cash Flow',
    perWeek: '/ week',
    logout: 'Logout',
    // Announcement
    noAnnouncement: 'No announcements',
    announcementPlaceholder: 'Enter announcement...',
    save: 'Save',
    cancel: 'Cancel',
    editAnnouncement: 'Edit Announcement',
    // Star Development
    planetDev: 'Star Dev',
    planetCard: 'Star Card',
    planetName: 'Star Name',
    planetDesc: 'Description',
    devProgress: 'Progress',
    planetFund: 'Star Fund',
    totalFund: 'Total Fund',
    fundForDev: 'Fund for Development',
    fundAmount: 'Amount',
    submitFundRequest: 'Submit Request',
    namePlaceholder: 'Enter star name...',
    descPlaceholder: 'Enter description...',
    updateCard: 'Update',
    setProgress: 'Set Progress',
    progressValue: 'Progress (%)',
    createCard: 'Create Card',
    newCard: 'New Star Card',
    cardFund: 'Dedicated Fund',
    fundingList: 'Funding List',
    noFundingYet: 'No funding records yet',
    // Approval
    pendingApproval: 'Pending Approval',
    applicant: 'Applicant',
    // Operations
    operations: 'Operations',
    loan: 'Loan',
    injection: 'Injection',
    withdrawInj: 'Withdraw Inj.',
    deposit: 'Deposit',
    withdrawDep: 'Withdraw Dep.',
    manualSettle: 'Manual Settle',
    // Statistics
    totalAssets: 'Total Assets',
    totalLiabilities: 'Total Loans',
    idleFunds: 'Idle Funds',
    interestPool: 'Interest Pool',
    approvalQueue: 'Approval Queue',
    approved: 'Approved',
    availableBalance: 'Available Balance',
    weeklyNetInterest: 'Weekly Net Interest',
    pendingItems: 'Pending',
    personalBalance: 'Personal Account',
    totalBalance: 'Total Balance',
    injectionAndDeposit: 'Injection+Deposit+Interest',
    // Table
    loanAssets: 'Loan Assets',
    injectionAccount: 'Injection Account',
    depositAccount: 'Deposit Account',
    status: 'Status',
    type: 'Type',
    client: 'Client',
    amount: 'Amount',
    interestPerWeek: 'Interest/Week',
    settlementCount: 'Settle Count',
    settlementCycles: 'Settled Cycles',
    time: 'Time',
    actions: 'Actions',
    pending: 'Pending',
    rejected: 'Rejected',
    effective: 'Effective',
    noData: 'No Data',
    repay: 'Repay',
    productType: 'Product Type',
    normalDeposit: 'Normal Deposit (2.5%/week)',
    riskDeposit: 'Member Wealth (9%/week)',
    riskDeposit5: 'Standard Wealth (5%/week)',
    riskNote: '⚠️ Only Liuli Sovereign Capital members can apply for 9%/week. Admin will approve/reject. Principal guaranteed only, interest not guaranteed.',
    riskNote5: 'Standard wealth rate is 5%/week. Principal guaranteed only, interest not guaranteed.',
    // Modal
    create: 'Create',
    edit: 'Edit',
    clientLabel: 'Client/Entity',
    amountLabel: 'Amount (m)',
    rateLabel: 'Rate (%)',
    submit: 'Submit',
    // Type labels
    typeLabels: {
      'loan': 'Loan',
      'injection': 'Injection',
      'withdraw_inj': 'Withdraw Inj.',
      'deposit': 'Deposit',
      'withdraw_dep': 'Withdraw Dep.',
      'interest_income': 'Interest Income',
      'interest_expense': 'Interest Expense',
      'planet_fund': 'Star Fund',
      'planet_card': 'Star Card',
      'bond_issue': 'Bond Issue',
      'bond_subscribe': 'Bond Subscribe',
      'bond_redeem': 'Bond Redeem'
    }
  }
};

// ==========================================
// 2. 主应用程序 (Main App)
// ==========================================

const App = () => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState(isConfigured ? 'connecting' : 'missing_config');
  const [language, setLanguage] = useState('zh'); // 语言状态
  
  // Auth State
  const [authMode, setAuthMode] = useState('login'); 
  const [authInput, setAuthInput] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  // UI State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('loan'); 
  const [formData, setFormData] = useState({ client: '', principal: '', rate: '', product_type: '' });
  const [editId, setEditId] = useState(null);
  const [nextSettleTime, setNextSettleTime] = useState('');
  const [settleCountdown, setSettleCountdown] = useState('');
  
  const [bankAnnouncement, setBankAnnouncement] = useState({ id: '', content: '' });
  const [isEditingBankAnnouncement, setIsEditingBankAnnouncement] = useState(false);
  const [bankAnnouncementInput, setBankAnnouncementInput] = useState('');

  const [fundAnnouncement, setFundAnnouncement] = useState({ id: '', content: '' });
  const [isEditingFundAnnouncement, setIsEditingFundAnnouncement] = useState(false);
  const [fundAnnouncementInput, setFundAnnouncementInput] = useState('');
  
  // 论坛 State
  const [currentPage, setCurrentPage] = useState('bank'); // 'bank', 'forum', 'planet', 'assets', 'fund', 'bonds'
  const [expandedPosts, setExpandedPosts] = useState(new Set()); // 展开的帖子ID
  const [expandedReplies, setExpandedReplies] = useState(new Set()); // 展开的评论ID
  const [posts, setPosts] = useState([]);
  const [newPostModal, setNewPostModal] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: '', content: '' });
  const [replyingTo, setReplyingTo] = useState(null); // { postId, replyId } or postId
  const [replyContent, setReplyContent] = useState('');
  
  // 星星开发 State
  const [planetCards, setPlanetCards] = useState([]);
  const [newCardModal, setNewCardModal] = useState(false);
  const [newCardData, setNewCardData] = useState({ name: '', description: '', progress: 0 });
  const [editingCardId, setEditingCardId] = useState(null);
  const [editCardData, setEditCardData] = useState({ name: '', description: '', progress: 0 });
  const [fundingCardId, setFundingCardId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  
  // 银行资产 State
  const [bankAssets, setBankAssets] = useState([]);
  const [newAssetModal, setNewAssetModal] = useState(false);
  const [newAssetData, setNewAssetData] = useState({ planetName: '', itemName: '', quantity: '', value: '' });
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editAssetData, setEditAssetData] = useState({ planetName: '', itemName: '', quantity: '', value: '' });
  
  // 基金 State
  const FUND_ACCOUNT_KEY = 'global';
  const [fundAccount, setFundAccount] = useState({ balance: 0 });
  const [fundTransactions, setFundTransactions] = useState([]);
  const [transferModal, setTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [transferType, setTransferType] = useState(''); // 'in' or 'out'
  const [fundUserModal, setFundUserModal] = useState(false);
  const [fundUserAction, setFundUserAction] = useState(''); // subscribe | redeem | dividend_withdraw
  const [fundUserAmount, setFundUserAmount] = useState('');

  // 债券 State（本地产品 + 申购走审批队列）
  const [bondProducts, setBondProducts] = useState([]); // localStorage
  const [bondIssueModal, setBondIssueModal] = useState(false);
  const [bondIssueData, setBondIssueData] = useState({
    name: '',
    category: 'short', // short | long
    term_days: '30',
    rate_per_week: '2.0',
    total_supply: '1000'
  });
  const [bondSubscribeModal, setBondSubscribeModal] = useState(false);
  const [bondSubscribeTarget, setBondSubscribeTarget] = useState(null);
  const [bondSubscribeAmount, setBondSubscribeAmount] = useState('');

  const [bondEditModal, setBondEditModal] = useState(false);
  const [bondEditTarget, setBondEditTarget] = useState(null);
  const [bondEditData, setBondEditData] = useState({
    name: '',
    category: 'short',
    term_days: '30',
    rate_per_week: '2.0',
    total_supply: '1000'
  });
  
  // 基金交易记录编辑 State
  const [editingFundTx, setEditingFundTx] = useState(null);
  const [editFundTxData, setEditFundTxData] = useState({ amount: '', remark: '' });
  
  // 添加基金交易记录 State
  const [addFundTxModal, setAddFundTxModal] = useState(false);
  const [newFundTxData, setNewFundTxData] = useState({ type: 'fund_profit', amount: '', remark: '' });
  
  // 批量删除 State
  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showBatchDelete, setShowBatchDelete] = useState(false);
  
  // 利息管理 State
  const [interestManageModal, setInterestManageModal] = useState(false);

  // 翻译函数
  const t = (key) => {
    try {
      return translations[language]?.[key] || key;
    } catch (e) {
      console.error('Translation error:', e, 'key:', key, 'language:', language);
      return key;
    }
  };

  const openBondEditModal = (bond) => {
    if (currentUser?.role !== 'admin') return;
    setBondEditTarget(bond);
    setBondEditData({
      name: bond?.name || '',
      category: bond?.category || 'short',
      term_days: String(bond?.term_days ?? '30'),
      rate_per_week: String(bond?.rate_per_week ?? '2.0'),
      total_supply: String(bond?.total_supply ?? '1000')
    });
    setBondEditModal(true);
  };

  const handleUpdateBondProduct = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      alert('权限不足：只有管理员可以编辑债券');
      return;
    }
    if (!bondEditTarget?.tx_id) {
      alert('未找到债券记录');
      return;
    }

    const termDays = parseInt(bondEditData.term_days, 10);
    const ratePerWeek = parseFloat(bondEditData.rate_per_week);
    const totalSupply = parseFloat(bondEditData.total_supply);

    if (!bondEditData.name.trim()) return alert('请输入债券名称');
    if (!Number.isFinite(termDays) || termDays <= 0) return alert('请输入有效期限');
    if (!Number.isFinite(ratePerWeek) || ratePerWeek < 0) return alert('请输入有效利率');
    if (!Number.isFinite(totalSupply) || totalSupply <= 0) return alert('请输入有效发行额度');

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          client: bondEditData.name.trim(),
          principal: totalSupply,
          rate: ratePerWeek,
          product_type: bondEditData.category === 'long' ? 'bond_long' : 'bond_short',
          remark: `期限:${termDays}天`,
          last_edited_by: currentUser.username,
          last_edited_at: new Date().toLocaleString('zh-CN', { hour12: false })
        })
        .eq('id', bondEditTarget.tx_id);
      if (error) throw error;

      await refreshTransactions();
      setBondEditModal(false);
      setBondEditTarget(null);
    } catch (e2) {
      alert('更新失败: ' + (e2?.message || e2));
    }
  };

  const handleDeleteBondProduct = async (bond) => {
    if (currentUser?.role !== 'admin') {
      alert('权限不足：只有管理员可以删除债券');
      return;
    }
    if (!bond?.tx_id) {
      alert('未找到债券记录');
      return;
    }
    if (!window.confirm('确认删除此债券发售？将同时删除所有相关持仓/申购记录。')) return;

    try {
      // 取消持仓（保留账单历史）：将相关 bond_subscribe 标记为 rejected，使其不再计入持仓/占用
      const { error: cancelSubErr1 } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          approved_by: currentUser.username,
          approved_at: new Date().toLocaleString('zh-CN', { hour12: false }),
          rejected_at: new Date().toISOString()
        })
        .eq('type', 'bond_subscribe')
        .ilike('remark', `%issue_id:${bond.tx_id}%`);
      if (cancelSubErr1) throw cancelSubErr1;

      // 兼容旧数据：早期申购没有 issue_id，只能用名称匹配取消
      const { error: cancelSubErr2 } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          approved_by: currentUser.username,
          approved_at: new Date().toLocaleString('zh-CN', { hour12: false }),
          rejected_at: new Date().toISOString()
        })
        .eq('type', 'bond_subscribe')
        .eq('client', bond.name);
      if (cancelSubErr2) throw cancelSubErr2;

      const { error: delIssueErr } = await supabase
        .from('transactions')
        .delete()
        .eq('id', bond.tx_id);
      if (delIssueErr) throw delIssueErr;

      await refreshTransactions();
    } catch (e2) {
      alert('删除失败: ' + (e2?.message || e2));
    }
  };

  const handleEndBondIssue = async (bond) => {
    if (currentUser?.role !== 'admin') {
      alert('权限不足：只有管理员可以结束发行');
      return;
    }
    if (!bond?.tx_id) {
      alert('未找到债券记录');
      return;
    }
    if (!window.confirm('确认结束该债券发行？结束后将无法继续申购，但已申购持仓会保留。')) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          approved_by: currentUser.username,
          approved_at: new Date().toLocaleString('zh-CN', { hour12: false }),
          rejected_at: new Date().toISOString()
        })
        .eq('id', bond.tx_id);
      if (error) throw error;
      await refreshTransactions();
    } catch (e2) {
      alert('结束发行失败: ' + (e2?.message || e2));
    }
  };

  const handleRedeemAllBond = async (bond) => {
    if (currentUser?.role !== 'admin') {
      alert('权限不足：只有管理员可以全额赎回');
      return;
    }
    if (!bond?.tx_id) {
      alert('未找到债券记录');
      return;
    }
    if (!window.confirm('确认全额赎回该债券？将结束发行并取消所有人的持仓（删除所有相关申购记录）。')) return;

    try {
      // 先结束发行（下架），保留发行记录作为历史
      const { error: endErr } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          approved_by: currentUser.username,
          approved_at: new Date().toLocaleString('zh-CN', { hour12: false }),
          rejected_at: new Date().toISOString()
        })
        .eq('id', bond.tx_id);
      if (endErr) throw endErr;

      // 统计当前债券所有人的已审批持仓总额，用于生成赎回账单
      const approvedAll = (transactions || []).filter(tx => tx.status === 'approved');
      const totalApproved = approvedAll
        .filter(tx => tx.type === 'bond_subscribe')
        .filter(tx => {
          const issueId = parseBondIssueIdFromRemark(tx.remark);
          return issueId ? (String(issueId) === String(bond.tx_id)) : (tx.client === bond.name);
        })
        .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

      // 写入一条全员可见的赎回账单记录
      await handleCRUD('create', {
        type: 'bond_redeem',
        client: bond.name,
        principal: totalApproved,
        rate: 0,
        product_type: bond.category === 'long' ? 'bond_long' : 'bond_short',
        remark: `issue_id:${bond.tx_id} 全额赎回` 
      });

      // 再取消所有持仓/申购（包含 pending/approved），释放占用（保留账单历史）
      const cancelData = {
        status: 'rejected',
        approved_by: currentUser.username,
        approved_at: new Date().toLocaleString('zh-CN', { hour12: false }),
        rejected_at: new Date().toISOString()
      };

      const { error: cancelSubErr1 } = await supabase
        .from('transactions')
        .update(cancelData)
        .eq('type', 'bond_subscribe')
        .ilike('remark', `%issue_id:${bond.tx_id}%`);
      if (cancelSubErr1) throw cancelSubErr1;

      // 兼容旧数据：早期申购没有 issue_id，只能用名称匹配取消
      const { error: cancelSubErr2 } = await supabase
        .from('transactions')
        .update(cancelData)
        .eq('type', 'bond_subscribe')
        .eq('client', bond.name);
      if (cancelSubErr2) throw cancelSubErr2;

      await refreshTransactions();
    } catch (e2) {
      alert('全额赎回失败: ' + (e2?.message || e2));
    }
  };

  const openFundUserModal = (action) => {
    setFundUserAction(action);
    setFundUserAmount('');
    setFundUserModal(true);
  };

  // 债券产品（公共：来自 transactions 的 bond_issue 记录）
  useEffect(() => {
    try {
      const approvedIssues = (transactions || [])
        .filter(tx => tx.status === 'approved' && tx.type === 'bond_issue')
        .map(tx => {
          const termDays = (() => {
            if (!tx.remark) return 0;
            const m = String(tx.remark).match(/期限[:：]\s*(\d+)\s*天/);
            return m ? (parseInt(m[1], 10) || 0) : 0;
          })();

          return {
            tx_id: tx.id,
            id: `bond_issue_${tx.id}`,
            name: tx.client || '未命名债券',
            category: tx.product_type === 'bond_long' ? 'long' : 'short',
            term_days: termDays,
            rate_per_week: parseFloat(tx.rate) || 0,
            total_supply: parseFloat(tx.principal) || 0,
            created_at: tx.created_at || '',
            created_by: tx.created_by || ''
          };
        });

      setBondProducts(approvedIssues);
    } catch (e) {
      console.error('解析债券产品失败:', e);
    }
  }, [transactions]);

  const openBondSubscribeModal = (bond) => {
    setBondSubscribeTarget(bond);
    setBondSubscribeAmount('');
    setBondSubscribeModal(true);
  };

  const parseBondIssueIdFromRemark = (remark) => {
    if (!remark) return null;
    const m = String(remark).match(/issue_id\s*[:：]\s*(\d+)/);
    return m ? m[1] : null;
  };

  const handleCreateBondProduct = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      alert('权限不足：只有管理员可以发售债券');
      return;
    }

    const termDays = parseInt(bondIssueData.term_days, 10);
    const ratePerWeek = parseFloat(bondIssueData.rate_per_week);
    const totalSupply = parseFloat(bondIssueData.total_supply);

    if (!bondIssueData.name.trim()) return alert('请输入债券名称');
    if (!Number.isFinite(termDays) || termDays <= 0) return alert('请输入有效期限');
    if (!Number.isFinite(ratePerWeek) || ratePerWeek < 0) return alert('请输入有效利率');
    if (!Number.isFinite(totalSupply) || totalSupply <= 0) return alert('请输入有效发行额度');

    await handleCRUD('create', {
      type: 'bond_issue',
      client: bondIssueData.name.trim(),
      principal: totalSupply,
      rate: ratePerWeek,
      product_type: bondIssueData.category === 'long' ? 'bond_long' : 'bond_short',
      remark: `期限:${termDays}天`
    });

    await refreshTransactions();
    setBondIssueModal(false);
    setBondIssueData({ name: '', category: 'short', term_days: '30', rate_per_week: '2.0', total_supply: '1000' });
  };

  const submitBondSubscribe = async () => {
    if (!bondSubscribeTarget) return;
    const amount = parseFloat(bondSubscribeAmount) || 0;
    if (amount <= 0) {
      alert('请输入有效金额');
      return;
    }

    // 防止对已结束/已删除的债券继续申购
    const stillActive = (transactions || []).some(
      tx => tx.status === 'approved' && tx.type === 'bond_issue' && String(tx.id) === String(bondSubscribeTarget.tx_id)
    );
    if (!stillActive) {
      alert('该债券已结束发行或已删除，无法继续申购');
      setBondSubscribeModal(false);
      setBondSubscribeTarget(null);
      setBondSubscribeAmount('');
      return;
    }

    await handleCRUD('create', {
      type: 'bond_subscribe',
      client: bondSubscribeTarget.name,
      principal: amount,
      rate: parseFloat(bondSubscribeTarget.rate_per_week) || 0,
      product_type: bondSubscribeTarget.category === 'long' ? 'bond_long' : 'bond_short',
      remark: `issue_id:${bondSubscribeTarget.tx_id} 期限:${bondSubscribeTarget.term_days}天`
    });

    setBondSubscribeModal(false);
    setBondSubscribeTarget(null);
    setBondSubscribeAmount('');
  };

  const submitFundUserRequest = async () => {
    const amount = parseFloat(fundUserAmount) || 0;
    if (amount <= 0) {
      alert('请输入有效金额');
      return;
    }
    let type = '';
    let remark = '';
    if (fundUserAction === 'subscribe') {
      type = 'fund_subscribe';
      remark = '外部准入申购';
    } else if (fundUserAction === 'redeem') {
      type = 'fund_redeem';
      remark = '赎回（含分红）';
    } else if (fundUserAction === 'dividend_withdraw') {
      type = 'fund_dividend_withdraw';
      remark = '提取分红到外部';
    } else {
      return;
    }

    await handleCRUD('create', {
      type,
      client: currentUser.username,
      principal: amount,
      rate: 0,
      remark
    });

    setFundUserModal(false);
    setFundUserAction('');
    setFundUserAmount('');
  };

  // --- 初始化 Supabase Auth (简化为会话管理) ---
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Supabase Auth 与 RLS：每个用户通过 auth.uid() 与 user_id 字段关联
    // 由于我们的用户系统基于本地用户表，不使用 Supabase Auth 的登录
    // 直接设置为已连接状态
    setConnectionStatus('connected');
    setLoading(false);
  }, []);

  // 计算下一个周三12点
  const calculateNextSettle = () => {
    const now = new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
    let next = new Date(now);
    const daysUntilWednesday = (3 - now.getDay() + 7) % 7 || 7;
    next.setDate(next.getDate() + daysUntilWednesday);
    next.setHours(12, 0, 0, 0);
    return next;
  };

  // --- 倒计时更新 ---
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
      const next = calculateNextSettle();
      const diff = next - now;
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setSettleCountdown(`${days}天${hours}小时${mins}分钟`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // 每分钟更新
    return () => clearInterval(interval);
  }, []);

  // --- 检查是否需要自动结算利息 (每周三中午12点) ---
  useEffect(() => {
    const checkAndSettleInterest = async () => {
      if (!currentUser || !supabase) return;
      
      const now = new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
      const dayOfWeek = now.getDay(); // 0=周日，3=周三
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 周三中午12点（检查是否在12:00-12:02分钟内）
      if (dayOfWeek === 3 && hours === 12 && minutes >= 0 && minutes <= 2) {
        // 检查是否已经在这个小时内结算过
        const currentHourKey = `settled_${now.getFullYear()}_${now.getMonth()}_${now.getDate()}_${hours}`;
        const lastSettled = sessionStorage.getItem(currentHourKey);
        
        if (!lastSettled) {
          // 标记为已结算
          sessionStorage.setItem(currentHourKey, 'true');
          await autoSettleInterest();
        }
      }
    };

    checkAndSettleInterest();
  }, [currentUser]);

  // --- 数据同步监听 ---
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const refreshTransactions = async () => {
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!txError && txData) {
        setTransactions(txData);
      }
      return { txData, txError };
    };

    const fetchAndListen = async () => {
      try {
        // 自动删除超过20小时的被拒绝记录
        const twentyHoursAgo = new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString();
        await supabase
          .from('transactions')
          .delete()
          .eq('status', 'rejected')
          .lt('rejected_at', twentyHoursAgo);

        // 获取交易数据
        await refreshTransactions();

        // 获取用户数据
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (!usersError && usersData) {
          setRegisteredUsers(usersData);
          if (usersData.length === 0) seedAdminUser();
        }

        const ensureAnnouncement = async (key, defaultContent) => {
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('title', key)
            .order('id', { ascending: false })
            .limit(1);

          if (!error && data && data.length > 0) return data[0];

          const { data: created, error: createError } = await supabase
            .from('announcements')
            .insert({
              title: key,
              content: defaultContent
            })
            .select('*')
            .single();
          if (createError) throw createError;
          return created;
        };

        const [bankAnn, fundAnn] = await Promise.all([
          ensureAnnouncement('bank_announcement', '欢迎使用 EUU 超级投行系统'),
          ensureAnnouncement('fund_announcement', '欢迎使用 EUU 超级投行系统')
        ]);

        if (bankAnn) setBankAnnouncement(bankAnn);
        if (fundAnn) setFundAnnouncement(fundAnn);

        setLoading(false);
      } catch (err) {
        console.error("Data Fetch Error:", err);
        setLoading(false);
      }
    };

    fetchAndListen();

    // 轮询方式获取更新（而不是 WebSocket 实时订阅）
    const pollInterval = setInterval(() => {
      fetchAndListen();
    }, 5000); // 每 5 秒更新一次

    const savedUser = sessionStorage.getItem('current_bank_user_v2');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  const refreshTransactions = async () => {
    const { data: txData, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .order('timestamp', { ascending: false });

    if (!txError && txData) {
      setTransactions(txData);
    }
    return { txData, txError };
  };

  const seedAdminUser = async () => {
    try {
      await supabase.from('users').insert({
        username: 'EUU', 
        password: 'vkinga79', 
        role: 'admin', 
        created_at: new Date().toISOString()
      });
    } catch (e) { 
      console.error("Seeding admin failed:", e); 
    }
  };

  const handleUpdateBankAnnouncement = async () => {
    if (!bankAnnouncement.id || !bankAnnouncementInput.trim()) return;
    try {
      const nextContent = bankAnnouncementInput;
      const { error } = await supabase
        .from('announcements')
        .update({
          content: nextContent
        })
        .eq('id', bankAnnouncement.id);

      if (error) throw error;

      setBankAnnouncement(prev => ({ ...prev, content: nextContent }));
      setIsEditingBankAnnouncement(false);
      setBankAnnouncementInput('');
    } catch (e) {
      console.error('更新公告失败:', e);
      alert('更新公告失败: ' + (e?.message || e));
    }
  };

  const handleUpdateFundAnnouncement = async () => {
    if (!fundAnnouncement.id || !fundAnnouncementInput.trim()) return;
    try {
      const nextContent = fundAnnouncementInput;
      const { error } = await supabase
        .from('announcements')
        .update({
          content: nextContent
        })
        .eq('id', fundAnnouncement.id);

      if (error) throw error;

      setFundAnnouncement(prev => ({ ...prev, content: nextContent }));
      setIsEditingFundAnnouncement(false);
      setFundAnnouncementInput('');
    } catch (e) {
      console.error('更新公告失败:', e);
      alert('更新公告失败: ' + (e?.message || e));
    }
  };

  // --- 基金功能 ---
  // 获取基金账户信息
  useEffect(() => {
    if (currentPage === 'fund' && currentUser) {
      fetchFundAccount();
      fetchFundTransactions();
    }
  }, [currentPage, currentUser]);

  const fetchFundAccount = async () => {
    try {
      // 设置用户名上下文
      await supabase.rpc('set_app_username', { username: currentUser.username });
      
      const { data, error } = await supabase
        .from('fund_accounts')
        .select('*')
        .eq('user_id', FUND_ACCOUNT_KEY)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }
      
      if (data) {
        setFundAccount(data);
      } else {
        // 创建基金账户
        await createFundAccount();
      }
    } catch (e) {
      console.error('获取基金账户失败:', e);
      // 创建基金账户
      await createFundAccount();
    }
  };

  const createFundAccount = async () => {
    try {
      // 设置用户名上下文
      await supabase.rpc('set_app_username', { username: currentUser.username });
      
      const { data, error } = await supabase
        .from('fund_accounts')
        .insert({
          user_id: FUND_ACCOUNT_KEY,
          balance: 0
        })
        .select()
        .single();
      
      if (error) throw error;
      setFundAccount(data);
    } catch (e) {
      console.error('创建基金账户失败:', e);
    }
  };

  const fetchFundTransactions = async () => {
    try {
      let query = supabase
        .from('transactions')
        .select('*')
        .in('type', ['bank_fund', 'fund_profit', 'fund_loss', 'fund_subscribe', 'fund_redeem', 'fund_dividend', 'fund_dividend_withdraw'])
        .order('created_at', { ascending: false }) // 使用 created_at 字段排序
        .order('timestamp', { ascending: false }); // 如果有 timestamp 字段，也按它排序
      
      // 所有用户都可以看到所有记录，但只有管理员和基金经理可以编辑
      // 移除了基于角色的数据过滤，所有用户都能看到完整的交易记录
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      console.log('基金交易记录排序检查:', data?.map(tx => ({
        type: tx.type,
        timestamp: tx.timestamp,
        created_at: tx.created_at,
        principal: tx.principal
      })));
      
      setFundTransactions(data || []);
    } catch (e) {
      console.error('获取基金交易记录失败:', e);
    }
  };

  // 基金交易记录编辑功能
  const handleEditFundTx = (tx) => {
    setEditingFundTx(tx.id);
    setEditFundTxData({ 
      amount: tx.amount || tx.principal || '', 
      remark: tx.remark || '' 
    });
  };

  const handleSaveFundTx = async () => {
    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          amount: parseFloat(editFundTxData.amount) || 0,
          remark: editFundTxData.remark
        })
        .eq('id', editingFundTx);
      
      if (error) throw error;
      
      // 重新获取交易记录
      await fetchFundTransactions();
      setEditingFundTx(null);
      setEditFundTxData({ amount: '', remark: '' });
      alert('交易记录更新成功！');
    } catch (e) {
      console.error('更新交易记录失败:', e);
      alert('更新失败: ' + e.message);
    }
  };

  const handleCancelEditFundTx = () => {
    setEditingFundTx(null);
    setEditFundTxData({ amount: '', remark: '' });
  };

  const handleDeleteFundTx = async (txId) => {
    if (!confirm('确定要删除这条交易记录吗？')) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txId);
      
      if (error) throw error;
      
      // 重新获取交易记录
      await fetchFundTransactions();
      alert('交易记录删除成功！');
    } catch (e) {
      console.error('删除交易记录失败:', e);
      alert('删除失败: ' + e.message);
    }
  };

  // 检查是否可以编辑基金交易记录
  const canEditFundTransactions = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'fund_manager';
  };

  // 添加基金交易记录功能
  const handleAddFundTx = async () => {
    if (!newFundTxData.amount || parseFloat(newFundTxData.amount) <= 0) {
      alert('请输入有效金额');
      return;
    }

    try {
      const amount = parseFloat(newFundTxData.amount);
      
      if (newFundTxData.type === 'fund_profit') {
        // 添加收益记录 - 正数
        await supabase.from('transactions').insert({
          type: 'fund_profit',
          principal: amount,
          rate: 0,
          client: currentUser.username,
          created_by: currentUser.username,
          remark: newFundTxData.remark || '基金收益',
          status: 'approved',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
          
      } else if (newFundTxData.type === 'fund_loss') {
        // 添加损失记录 - 负数
        await supabase.from('transactions').insert({
          type: 'fund_loss',
          principal: -amount,
          rate: 0,
          client: currentUser.username,
          created_by: currentUser.username,
          remark: newFundTxData.remark || '基金损失',
          status: 'approved',
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
      }
      
      // 重新获取数据
      await fetchFundTransactions();
      
      // 重新获取所有交易数据以确保calculateFundBalance正确计算
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!txError && txData) {
        setTransactions(txData);
      }
      
      // 重置表单
      setAddFundTxModal(false);
      setNewFundTxData({ type: 'fund_profit', amount: '', remark: '' });
      
      alert('交易记录添加成功！');
    } catch (e) {
      console.error('添加交易记录失败:', e);
      alert('添加失败: ' + e.message);
    }
  };

  const handleCancelAddFundTx = () => {
    setAddFundTxModal(false);
    setNewFundTxData({ type: 'fund_profit', amount: '', remark: '' });
  };

  // 批量删除功能
  const handleSelectTransaction = (txId) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(txId)) {
      newSelected.delete(txId);
    } else {
      newSelected.add(txId);
    }
    setSelectedTransactions(newSelected);
  };

  const handleSelectAll = (transactionType) => {
    const transactionsToSelect = fundTransactions.filter(tx => {
      if (transactionType === 'profit') {
        return ['fund_profit', 'fund_loss'].includes(tx.type);
      } else if (transactionType === 'transfer') {
        return tx.type === 'bank_fund';
      }
      return false;
    });
    
    const txIds = transactionsToSelect.map(tx => tx.id);
    const allSelected = txIds.every(id => selectedTransactions.has(id));
    
    if (allSelected) {
      // 取消选择所有
      const newSelected = new Set(selectedTransactions);
      txIds.forEach(id => newSelected.delete(id));
      setSelectedTransactions(newSelected);
    } else {
      // 选择所有
      const newSelected = new Set(selectedTransactions);
      txIds.forEach(id => newSelected.add(id));
      setSelectedTransactions(newSelected);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedTransactions.size === 0) {
      alert('请先选择要删除的记录');
      return;
    }

    if (!confirm(`确定要删除选中的 ${selectedTransactions.size} 条记录吗？此操作不可撤销！`)) {
      return;
    }

    try {
      // 批量删除
      for (const txId of selectedTransactions) {
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', txId);
        if (error) throw error;
      }
      
      // 重新获取数据
      await fetchFundTransactions();
      
      // 重新获取所有交易数据
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!txError && txData) {
        setTransactions(txData);
      }
      
      // 清空选择
      setSelectedTransactions(new Set());
      setShowBatchDelete(false);
      
      alert(`成功删除 ${selectedTransactions.size} 条记录！`);
    } catch (e) {
      console.error('批量删除失败:', e);
      alert('删除失败: ' + e.message);
    }
  };

  const handleFundTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert('请输入有效金额');
      return;
    }

    // 权限检查
    if (currentUser?.role !== 'admin') {
      alert('权限不足：只有管理员可以进行基金转账操作');
      return;
    }

    try {
      const amount = parseFloat(transferAmount); // 用户输入的m单位金额
      
      if (transferType === 'in') {
        // 银行转基金
        const idleCash = calculateIdleCash();
        if (amount > idleCash) {
          alert(`银行闲置资金不足。可用：${formatMoney(idleCash)}，尝试：${formatMoney(amount)}`);
          return;
        }
        
        // 创建银行转基金记录（正数表示转入基金）
        await supabase.from('transactions').insert({
          type: 'bank_fund',
          principal: amount, // 正数表示转入基金
          rate: 0,
          client: currentUser.username,
          created_by: currentUser.username,
          remark: '从银行转入基金',
          status: 'approved'
        });
        
        // 更新基金账户余额
        await supabase.from('fund_accounts')
          .update({ 
            balance: fundAccount.balance + amount, // 直接使用m单位
            updated_at: new Date().toISOString()
          })
          .eq('user_id', FUND_ACCOUNT_KEY);
          
      } else if (transferType === 'out') {
        // 基金转银行
        const fundBalance = calculateFundBalance();
        if (amount > fundBalance) {
          alert(`基金余额不足。可用：${formatMoney(fundBalance)}，尝试：${formatMoney(amount)}`);
          return;
        }
        
        // 创建基金转银行记录（负数表示从基金转出）
        await supabase.from('transactions').insert({
          type: 'bank_fund',
          principal: -amount, // 负数表示从基金转出
          rate: 0,
          client: currentUser.username,
          created_by: currentUser.username,
          remark: '从基金转回银行',
          status: 'approved'
        });
        
        // 更新基金账户余额
        await supabase.from('fund_accounts')
          .update({ 
            balance: fundAccount.balance - amount, // 直接使用m单位
            updated_at: new Date().toISOString()
          })
          .eq('user_id', FUND_ACCOUNT_KEY);
      }
      
      // 刷新数据
      await fetchFundAccount();
      await fetchFundTransactions();
      
      // 重新获取所有交易数据以确保calculateIdleCash正确计算
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false });
      if (!txError && txData) {
        setTransactions(txData);
        console.log('重新获取的交易数据:', txData); // 调试日志
      }
      
      // 强制重新渲染以更新所有依赖数据
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 调试信息
      console.log('转账后基金余额:', fundAccount.balance);
      console.log('转账后闲置资金:', calculateIdleCash());
      // 重置表单
      setTransferModal(false);
      setTransferAmount('');
      setTransferType('');
      
      alert('转账成功！');
    } catch (e) {
      console.error('转账失败:', e);
      alert('转账失败: ' + e.message);
    }
  };

  // --- 论坛功能 ---
  // 获取帖子列表
  useEffect(() => {
    if (currentPage === 'forum' && currentUser) {
      fetchPosts();
    }
  }, [currentPage, currentUser]);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (e) {
      console.error('获取帖子失败:', e);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostData.title.trim() || !newPostData.content.trim()) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .insert([{
          title: newPostData.title,
          content: newPostData.content,
          author: currentUser.username,
          author_id: currentUser.id,
          likes: 0,
          replies: [],
          created_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setNewPostModal(false);
      setNewPostData({ title: '', content: '' });
      fetchPosts();
    } catch (e) {
      console.error('发帖失败:', e);
    }
  };

  const handleLikePost = async (postId, currentLikes) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', postId);
      
      if (error) throw error;
      fetchPosts();
    } catch (e) {
      console.error('点赞失败:', e);
    }
  };

  const handleReply = async (postId, parentReplyId = null) => {
    if (!replyContent.trim()) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      const newReply = {
        id: Date.now(),
        author: currentUser.username,
        content: replyContent,
        timestamp: new Date().toISOString(),
        parentId: parentReplyId,
        replies: []
      };
      
      let updatedReplies;
      
      if (parentReplyId) {
        // 回复评论：需要找到父评论并添加到其replies中
        updatedReplies = addNestedReply(post.replies || [], parentReplyId, newReply);
      } else {
        // 直接回复帖子
        updatedReplies = [
          ...(post.replies || []),
          newReply
        ];
      }
      
      const { error } = await supabase
        .from('posts')
        .update({ replies: updatedReplies })
        .eq('id', postId);
      
      if (error) throw error;
      
      setReplyingTo(null);
      setReplyContent('');
      fetchPosts();
    } catch (e) {
      console.error('回复失败:', e);
    }
  };
  
  // 递归添加嵌套回复
  const addNestedReply = (replies, parentId, newReply) => {
    return replies.map(reply => {
      if (reply.id === parentId) {
        return {
          ...reply,
          replies: [...(reply.replies || []), newReply]
        };
      } else if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: addNestedReply(reply.replies, parentId, newReply)
        };
      }
      return reply;
    });
  };
  
  const handleDeleteReply = async (postId, replyId) => {
    if (!window.confirm('确认删除此评论？')) return;
    
    try {
      const post = posts.find(p => p.id === postId);
      const updatedReplies = deleteReplyById(post.replies || [], replyId);
      
      const { error } = await supabase
        .from('posts')
        .update({ replies: updatedReplies })
        .eq('id', postId);
      
      if (error) throw error;
      fetchPosts();
    } catch (e) {
      console.error('删除评论失败:', e);
    }
  };
  
  // 递归删除评论
  const deleteReplyById = (replies, replyId) => {
    return replies.filter(reply => reply.id !== replyId).map(reply => {
      if (reply.replies && reply.replies.length > 0) {
        return {
          ...reply,
          replies: deleteReplyById(reply.replies, replyId)
        };
      }
      return reply;
    });
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('确认删除此帖子？')) return;
    
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);
      
      if (error) throw error;
      fetchPosts();
    } catch (e) {
      console.error('删除帖子失败:', e);
    }
  };

  // --- 星星开发相关函数 ---
  const handleCreateCard = async (e) => {
    e.preventDefault();
    
    try {
      const cardRecord = {
        type: 'planet_card',
        client: newCardData.name,
        principal: 0, // 初始资金为0
        rate: newCardData.progress,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: isAdmin ? 'approved' : 'pending',
        remark: newCardData.description
      };

      const { error } = await supabase
        .from('transactions')
        .insert([cardRecord]);

      if (error) throw error;

      if (isAdmin) {
        alert('星星名片创建成功');
      } else {
        alert('星星名片申请已提交，等待管理员审批');
      }
      
      setNewCardModal(false);
      setNewCardData({ name: '', description: '', progress: 0 });
    } catch (e) {
      alert('创建失败: ' + e.message);
    }
  };

  const handleUpdateCard = async (cardId) => {
    try {
      const updateData = {
        client: editCardData.name,
        rate: editCardData.progress,
        remark: editCardData.description
      };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', cardId);

      if (error) throw error;

      alert('名片更新成功');
      setEditingCardId(null);
    } catch (e) {
      alert('更新失败: ' + e.message);
    }
  };

  const handlePlanetFundRequest = async (cardId) => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('请输入有效金额');
      return;
    }

    try {
      const card = planetCards.find(c => c.id === cardId);
      
      const fundRecord = {
        type: 'planet_fund',
        client: card.client, // 星星名称
        principal: amount,
        rate: 0,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: 'pending',
        remark: `为 ${card.client} 注入资金`
      };

      const { error } = await supabase
        .from('transactions')
        .insert([fundRecord]);

      if (error) throw error;

      alert('星星开发资金申请已提交，等待管理员审批');
      setFundAmount('');
      setFundingCardId(null);
    } catch (e) {
      alert('提交失败: ' + e.message);
    }
  };

  // 计算每个星星的资金总额
  const getCardFund = (cardName) => {
    return transactions
      .filter(tx => tx.type === 'planet_fund' && tx.client === cardName && tx.status === 'approved')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
  };

  // 获取注资记录列表
  const getCardFundingList = (cardName) => {
    return transactions
      .filter(tx => tx.type === 'planet_fund' && tx.client === cardName && tx.status === 'approved')
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  // 获取所有星星名片
  useEffect(() => {
    const cards = transactions.filter(tx => tx.type === 'planet_card' && tx.status === 'approved');
    setPlanetCards(cards);
  }, [transactions]);
  
  // --- 银行资产管理相关函数 ---
  const handleCreateAsset = async (e) => {
    e.preventDefault();
    
    try {
      const assetRecord = {
        type: 'bank_asset',
        client: newAssetData.planetName, // 星球名称
        principal: parseFloat(newAssetData.quantity) || 0, // 使用principal存储数量
        rate: parseFloat(newAssetData.value) || 0, // 使用rate存储价值
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: 'approved', // 直接批准，不需要管理员审批
        remark: newAssetData.itemName, // 使用remark存储物品名称
        product_type: 'daily_output' // 标记为每日产出
      };

      const { error } = await supabase
        .from('transactions')
        .insert([assetRecord]);

      if (error) throw error;

      alert('银行资产登记成功');
      
      setNewAssetModal(false);
      setNewAssetData({ planetName: '', itemName: '', quantity: '', value: '' });
    } catch (e) {
      alert('登记失败: ' + e.message);
    }
  };
  
  // 获取所有银行资产
  useEffect(() => {
    const assets = transactions.filter(tx => tx.type === 'bank_asset' && tx.status === 'approved');
    setBankAssets(assets);
  }, [transactions]);
  
  // 编辑资产
  const handleUpdateAsset = async (assetId) => {
    try {
      const updateData = {
        client: editAssetData.planetName,
        remark: editAssetData.itemName,
        principal: parseFloat(editAssetData.quantity) || 0,
        rate: parseFloat(editAssetData.value) || 0
      };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', assetId);

      if (error) throw error;

      alert('资产更新成功');
      setEditingAssetId(null);
    } catch (e) {
      alert('更新失败: ' + e.message);
    }
  };

  // --- 自动结算利息 ---
  const autoSettleInterest = async () => {
    try {
      const approved = transactions.filter(tx => tx.status === 'approved');
      
      // 计算各类型利息 - 修复累加逻辑
      const calc = (types) => {
        const result = approved
          .filter(tx => types.includes(tx.type))
          .reduce((acc, cur) => {
            return acc + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100);
          }, 0);
        return result;
      };

      const loanInterest = calc(['loan']);
      const injectionInterest = calc(['injection']);
      const depositInterest = calc(['deposit']);
      
      let settledCount = 0;
      
      const settleTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
      const settleId = Date.now(); // 为本次结算生成唯一ID

      const recordsToInsert = [];

      // 生成利息结算记录
      if (loanInterest > 0) {
        recordsToInsert.push({
          type: 'interest_income',
          client: '利息收入',
          principal: loanInterest,
          rate: 0,
          timestamp: settleTime,
          created_by: 'System',
          creator_id: 'system',
          status: 'approved',
          settle_id: settleId,
          remark: '本周贷款利息自动结算'
        });
        settledCount++;
      }

      if (injectionInterest > 0) {
        recordsToInsert.push({
          type: 'interest_expense',
          client: '注资利息支出',
          principal: injectionInterest,
          rate: 0,
          timestamp: settleTime,
          created_by: 'System',
          creator_id: 'system',
          status: 'approved',
          settle_id: settleId,
          remark: '注资账户利息自动结算'
        });
        settledCount++;
      }

      if (depositInterest > 0) {
        recordsToInsert.push({
          type: 'interest_expense',
          client: '存款利息支出',
          principal: depositInterest,
          rate: 0,
          timestamp: settleTime,
          created_by: 'System',
          creator_id: 'system',
          status: 'approved',
          settle_id: settleId,
          remark: '存款账户利息自动结算'
        });
        settledCount++;
      }

      if (recordsToInsert.length > 0) {
        const { error } = await supabase.from('transactions').insert(recordsToInsert);
        if (error) throw error;

        const msg = language === 'zh' 
          ? `✅ 结算成功！\n收入: +${loanInterest.toFixed(3)}m\n支出: -${(injectionInterest + depositInterest).toFixed(3)}m\n共生成 ${settledCount} 条记录`
          : `✅ Settlement successful!\nIncome: +${loanInterest.toFixed(3)}m\nExpense: -${(injectionInterest + depositInterest).toFixed(3)}m\nGenerated ${settledCount} records`;
        alert(msg);
        console.log('✅ 自动结算利息成功');
      } else {
        alert(language === 'zh' ? '⚠️ 没有可结算的利息' : '⚠️ No interest to settle');
      }
    } catch (e) {
      console.error("自动结算利息失败:", e);
      alert(language === 'zh' ? `❌ 结算失败: ${e.message}` : `❌ Settlement failed: ${e.message}`);
    }
  };

  // --- 业务逻辑 ---

  const handleLogin = (e) => {
    e.preventDefault();
    setAuthError('');
    const user = registeredUsers.find(u => u.username === authInput.username && u.password === authInput.password);
    if (user) {
      setCurrentUser(user);
      sessionStorage.setItem('current_bank_user_v2', JSON.stringify(user));
      setAuthInput({ username: '', password: '' });
    } else {
      setAuthError(t('authError'));
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('current_bank_user_v2');
    setAuthInput({ username: '', password: '' });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    if (registeredUsers.find(u => u.username === authInput.username)) {
      return setAuthError('该用户名已被注册');
    }
    if (authInput.username === 'EUU') {
      return setAuthError('EUU 是保留账号');
    }

    try {
      const newUser = { 
        username: authInput.username, 
        password: authInput.password, 
        role: 'user', 
        created_at: new Date().toISOString() 
      };
      const { data, error } = await supabase
        .from('users')
        .insert([newUser])
        .select();

      if (error) throw error;

      const userWithId = { ...newUser, id: data[0].id };
      setCurrentUser(userWithId);
      sessionStorage.setItem('current_bank_user_v2', JSON.stringify(userWithId));
      setAuthInput({ username: '', password: '' });
    } catch (error) { 
      setAuthError("注册失败，服务器连接异常"); 
    }
  };

  const handleCRUD = async (action, payload = null) => {
    try {
      if (action === 'create') {
        if (payload.type === 'deposit') {
          if (payload.product_type === 'risk') {
            payload = { ...payload, rate: 9 };
          } else if (payload.product_type === 'risk5') {
            payload = { ...payload, rate: 5 };
          } else if (payload.product_type === 'normal') {
            payload = { ...payload, rate: 2.5 };
          }
        }
        // 验证撤资和取款的额度限制
        if (payload.type === 'withdraw_inj') {
          const injections = transactions.filter(tx => tx.status === 'approved' && ['injection'].includes(tx.type))
            .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
          const injInterest = transactions.filter(tx => tx.status === 'approved' && tx.type === 'injection')
            .reduce((sum, tx) => sum + ((parseFloat(tx.principal) || 0) * (parseFloat(tx.rate) || 0) / 100), 0);
          const withdrawnInj = transactions.filter(tx => tx.status === 'approved' && tx.type === 'withdraw_inj')
            .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
          const availableInj = injections + injInterest - withdrawnInj;
          
          if (injections === 0) {
            return alert(language === 'zh' ? '没有注资记录，无法撤资！' : 'No injection records, cannot withdraw!');
          }
          if (parseFloat(payload.principal) > availableInj) {
            return alert(language === 'zh' ? `撤资金额不得超过可用金额 ${availableInj.toFixed(3)}m (注资+利息-已撤资)` : `Withdrawal amount cannot exceed available ${availableInj.toFixed(3)}m`);
          }
        }
        
        if (payload.type === 'withdraw_dep') {
          const deposits = transactions.filter(tx => tx.status === 'approved' && ['deposit'].includes(tx.type))
            .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
          const depInterest = transactions.filter(tx => tx.status === 'approved' && tx.type === 'deposit')
            .reduce((sum, tx) => sum + ((parseFloat(tx.principal) || 0) * (parseFloat(tx.rate) || 0) / 100), 0);
          const withdrawnDep = transactions.filter(tx => tx.status === 'approved' && tx.type === 'withdraw_dep')
            .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
          const bondUsed = transactions
            .filter(tx => tx.status === 'approved' && tx.type === 'bond_subscribe' && tx.created_by === currentUser.username)
            .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
          const availableDep = deposits + depInterest - withdrawnDep - bondUsed;
          
          if (deposits === 0) {
            return alert(language === 'zh' ? '没有存款记录，无法取款！' : 'No deposit records, cannot withdraw!');
          }
          if (parseFloat(payload.principal) > availableDep) {
            return alert(language === 'zh' ? `取款金额不得超过可用金额 ${availableDep.toFixed(3)}m (存款+利息-已取款)` : `Withdrawal amount cannot exceed available ${availableDep.toFixed(3)}m`);
          }
        }
        
        const newItem = {
          ...payload,
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          created_by: currentUser.username,
          creator_id: currentUser.id || 'unknown',
          status: currentUser.role === 'admin' ? 'approved' : 'pending' 
        };
        const { error } = await supabase.from('transactions').insert([newItem]);
        if (error) throw error;
        
        setModalOpen(false);
        setFormData({ client: '', principal: '', rate: '' });
      } else if (action === 'update') {
        const { id, ...data } = payload;
        const { error } = await supabase
          .from('transactions')
          .update({ 
            ...data, 
            last_edited_by: currentUser.username, 
            last_edited_at: new Date().toLocaleString('zh-CN', { hour12: false })
          })
          .eq('id', id);
        if (error) throw error;
        
        setModalOpen(false);
        setFormData({ client: '', principal: '', rate: '' });
      } else if (action === 'delete') {
        if (!window.confirm('确认从服务器永久删除此记录？')) return;
        const { error } = await supabase
          .from('transactions')
          .delete()
          .eq('id', payload);
        if (error) throw error;
      } else if (action === 'approve' || action === 'reject') {
        const txToReview = Array.isArray(transactions) ? transactions.find(tx => tx.id === payload) : null;
        const updateData = {
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: currentUser.username,
          approved_at: new Date().toLocaleString('zh-CN', { hour12: false })
        };
        
        // 如果是拒绝，记录拒绝时间
        if (action === 'reject') {
          updateData.rejected_at = new Date().toISOString();
        }
        
        if (action === 'approve' && txToReview) {
          if (txToReview.type === 'fund_dividend_withdraw') {
            const available = (() => {
              const approvedAll = transactions.filter(t => t.status === 'approved');
              const username = txToReview.created_by;
              const inDiv = approvedAll
                .filter(t => t.type === 'fund_dividend' && (t.client === username || t.created_by === username))
                .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
              const outDiv = approvedAll
                .filter(t => t.type === 'fund_dividend_withdraw' && t.created_by === username)
                .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
              const outRedeemDiv = approvedAll
                .filter(t => t.type === 'fund_redeem' && t.created_by === username)
                .reduce((sum, t) => {
                  if (!t.remark) return sum;
                  const m = String(t.remark).match(/分红[:：]\s*([0-9.]+)/);
                  return sum + (m ? (parseFloat(m[1]) || 0) : 0);
                }, 0);
              return Math.max(0, inDiv - outDiv - outRedeemDiv);
            })();

            const req = parseFloat(txToReview.principal) || 0;
            if (req > available + 0.0000001) {
              throw new Error(`分红可提取不足，可用：${available.toFixed(3)}m`);
            }
          }

          if (txToReview.type === 'fund_redeem') {
            const approvedAll = transactions.filter(t => t.status === 'approved');
            const username = txToReview.created_by;
            const totalSubscribed = approvedAll
              .filter(t => t.type === 'fund_subscribe' && t.created_by === username)
              .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
            const totalRedeemedPrincipal = approvedAll
              .filter(t => t.type === 'fund_redeem' && t.created_by === username)
              .reduce((sum, t) => sum + (parseFloat(t.rate) || 0), 0);
            const availablePrincipal = Math.max(0, totalSubscribed - totalRedeemedPrincipal);

            const totalDividend = approvedAll
              .filter(t => t.type === 'fund_dividend' && (t.client === username || t.created_by === username))
              .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
            const withdrawnDividend = approvedAll
              .filter(t => t.type === 'fund_dividend_withdraw' && t.created_by === username)
              .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
            const usedDividendInRedeem = approvedAll
              .filter(t => t.type === 'fund_redeem' && t.created_by === username)
              .reduce((sum, t) => {
                if (!t.remark) return sum;
                const m = String(t.remark).match(/分红[:：]\s*([0-9.]+)/);
                return sum + (m ? (parseFloat(m[1]) || 0) : 0);
              }, 0);
            const availableDividend = Math.max(0, totalDividend - withdrawnDividend - usedDividendInRedeem);

            const req = parseFloat(txToReview.principal) || 0;
            const principalPart = Math.min(availablePrincipal, req);
            const dividendPart = Math.max(0, req - principalPart);

            if (dividendPart > availableDividend + 0.0000001) {
              throw new Error(`赎回金额超出可用（本金+分红）。可用本金：${availablePrincipal.toFixed(3)}m，可用分红：${availableDividend.toFixed(3)}m`);
            }

            updateData.rate = principalPart;
            updateData.remark = `${txToReview.remark || ''} 本金:${principalPart.toFixed(3)} 分红:${dividendPart.toFixed(3)}`.trim();
          }
        }

        const { error } = await supabase
          .from('transactions')
          .update(updateData)
          .eq('id', payload);
        if (error) throw error;
      } else if (action === 'repay') {
        // 还款操作：删除贷款账单，资金回到资金池
        const loanTx = transactions.find(tx => tx.id === payload);
        if (!loanTx) throw new Error('未找到贷款记录');
        
        // 删除贷款账单
        const { error: delError } = await supabase
          .from('transactions')
          .delete()
          .eq('id', payload);
        if (delError) throw delError;
      } else if (action === 'deleteAll') {
        // payload 应该是交易类型，如 'withdraw_inj' 或 'withdraw_dep'
        if (!window.confirm('确认永久删除此账户的所有账单？此操作不可撤销！')) return;
        
        const allIds = transactions
          .filter(tx => tx.type === payload)
          .map(tx => tx.id);
        
        if (allIds.length === 0) return;
        
        // 分批删除（避免单次请求过大）
        for (const id of allIds) {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', id);
          if (error) throw error;
        }
      } else if (action === 'repay') {
        if (delError) throw delError;
        
        // 创建资金回流记录（可选，用于记录）
        const repayRecord = {
          type: 'repay_loan',
          principal: parseFloat(loanTx.principal) || 0,
          status: 'approved',
          timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
          created_by: loanTx.created_by,
          creator_id: loanTx.creator_id,
          client: `${loanTx.created_by} 还款`,
          remark: `还款自贷款 ID: ${payload}`
        };
        await supabase.from('transactions').insert([repayRecord]);
      }

      // 任何账面变化后立即刷新，确保收益率/个人预估收益等实时更新
      await refreshTransactions();
      await fetchFundTransactions();
      await fetchFundAccount();
    } catch (e) {
      alert("操作失败: " + e.message);
    }
  };

  const openModal = (type, editItem = null) => {
    setModalType(type);
    if (editItem) {
      setEditId(editItem.id);
      setFormData({ 
        client: editItem.client, 
        principal: editItem.principal, 
        rate: editItem.rate,
        product_type: editItem.product_type || ''
      });
    } else {
      setEditId(null);
      let defaultRate = '';
      if (type === 'deposit') defaultRate = '2.5';
      else if (type === 'loan') defaultRate = '3.0';
      else if (type === 'injection') defaultRate = '3';
      else defaultRate = '0';
      
      setFormData({ 
        client: currentUser.role === 'admin' ? '' : currentUser.username, 
        principal: '', 
        rate: defaultRate,
        product_type: type === 'deposit' ? 'normal' : (type === 'loan' ? 'interest' : '')
      });
    }
    setModalOpen(true);
  };

  // 计算当前用户个人的注资和存款账户余额（只统计client字段为当前用户的交易）
  // 包含已结算的利息
  const calcPersonalWithSettled = (types) => {
    const approved = transactions.filter(tx => tx.status === 'approved');
    return approved
      .filter(tx => types.includes(tx.type) && tx.client === currentUser?.username)
      .reduce((acc, cur) => {
        const principal = parseFloat(cur.principal) || 0;
        const rate = parseFloat(cur.rate) || 0;
        const weeklyInterest = (principal * rate / 100);
        
        // 从remark中提取已结算次数
        let settledCount = 0;
        if (cur.remark && cur.remark.includes('利息次数:')) {
          const match = cur.remark.match(/利息次数:(\d+)/);
          if (match) settledCount = parseInt(match[1]);
        }
        
        // 本金 + 已结算利息
        const totalAmount = principal + (weeklyInterest * settledCount);
        
        return {
          p: acc.p + principal,  // 纯本金
          total: acc.total + totalAmount  // 本金 + 已结算利息
        };
      }, { p: 0, total: 0 });
  };

  const calculateFundBalanceForStats = () => {
    const source = fundTransactions.length
      ? fundTransactions
      : (transactions || []).filter(tx => ['bank_fund', 'fund_subscribe', 'fund_redeem'].includes(tx.type));
    if (!source.length) return 0;
    const approved = source.filter(tx => tx.status ? tx.status === 'approved' : true);

    const bankNet = approved
      .filter(tx => tx.type === 'bank_fund')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const subscribed = approved
      .filter(tx => tx.type === 'fund_subscribe')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const redeemedPrincipal = approved
      .filter(tx => tx.type === 'fund_redeem')
      .reduce((sum, tx) => sum + (parseFloat(tx.rate) || 0), 0);

    return bankNet + subscribed - redeemedPrincipal;
  };

  // --- 统计 ---
  const stats = useMemo(() => {
    const approved = transactions.filter(tx => tx.status === 'approved');
    
    const calc = (types) => approved
      .filter(tx => types.includes(tx.type))
      .reduce((acc, cur) => ({
        p: acc.p + (parseFloat(cur.principal) || 0),
        i: acc.i + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100)
      }), { p: 0, i: 0 });

    const loans = calc(['loan']);
    const injections = calc(['injection']);
    const deposits = calc(['deposit']);
    const wInj = calc(['withdraw_inj']);
    const wDep = calc(['withdraw_dep']);

    const fundingBase = (injections.p - wInj.p) + (deposits.p - wDep.p);
    const totalRevenue = loans.i;
    const totalExpense = (injections.i - wInj.i) + (deposits.i - wDep.i);

    // 计算利息池 (每周净利息，利率已按周计)
    const interestPool = (totalRevenue - totalExpense);

    const personalInjections = calcPersonalWithSettled(['injection']);
    const personalDeposits = calcPersonalWithSettled(['deposit']);
    const personalWInj = calcPersonalWithSettled(['withdraw_inj']);
    const personalWDep = calcPersonalWithSettled(['withdraw_dep']);
    
    // 计算个人账户余额（本金 + 已结算的利息）
    const injectionBalance = personalInjections.total - personalWInj.total;
    const bondUsed = approved
      .filter(tx => tx.type === 'bond_subscribe' && tx.created_by === currentUser?.username)
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const depositBalance = personalDeposits.total - personalWDep.total - bondUsed;
    
    // 计算个人总余额（注资+存款+已结算利息）
    const personalTotalBalance = injectionBalance + depositBalance;

    // 计算不动产总价值（银行资产）
    const bankAssetsValue = approved
      .filter(tx => tx.type === 'bank_asset')
      .reduce((sum, tx) => sum + (parseFloat(tx.rate) || 0), 0); // rate字段存储资产价值

    // 计算银行基金转账的净额（仅 bank_fund 影响银行闲置资金）
    const bankFundNetTransfer = approved
      .filter(tx => tx.type === 'bank_fund')
      .reduce((acc, cur) => acc + (parseFloat(cur.principal) || 0), 0);

    const fundBalance = calculateFundBalanceForStats();
    const totalAssets = fundingBase + bankAssetsValue + fundBalance;

    return {
      loanPrincipal: loans.p,
      totalAssets: totalAssets,
      totalLoans: loans.p,
      netCashFlow: totalRevenue - totalExpense,
      // 主页的银行闲置资金计算：仅受 bank_fund 转账影响（申购/赎回/分红提取不影响银行闲置资金）
      idleCash: fundingBase - loans.p - bankFundNetTransfer,
      interestPool: interestPool,
      injectionBalance: injectionBalance,
      depositBalance: depositBalance,
      personalTotalBalance: personalTotalBalance,
      bankAssetsValue: bankAssetsValue,
      fundBalance: fundBalance
    };
  }, [transactions, currentUser, fundTransactions]);

  // 计算银行账户余额
  const calculateBalance = () => {
    if (!currentUser || !transactions.length) return 0;
    
    const personalInjections = calcPersonalWithSettled(['injection']);
    const personalDeposits = calcPersonalWithSettled(['deposit']);
    const personalWInj = calcPersonalWithSettled(['withdraw_inj']);
    const personalWDep = calcPersonalWithSettled(['withdraw_dep']);
    
    const injectionBalance = personalInjections.total - personalWInj.total;
    const bondUsed = transactions
      .filter(tx => tx.status === 'approved' && tx.type === 'bond_subscribe' && tx.created_by === currentUser.username)
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const depositBalance = personalDeposits.total - personalWDep.total - bondUsed;
    
    return injectionBalance + depositBalance;
  };

  // 计算基金本金：只计算银行转入/转出 + 申购/赎回（本金部分）
  const calculateFundPrincipal = () => {
    const source = fundTransactions.length
      ? fundTransactions
      : (transactions || []).filter(tx => ['bank_fund', 'fund_subscribe', 'fund_redeem'].includes(tx.type));
    if (!source.length) return 0;
    const approved = source.filter(tx => tx.status ? tx.status === 'approved' : true);

    const bankNet = approved
      .filter(tx => tx.type === 'bank_fund')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const subscribed = approved
      .filter(tx => tx.type === 'fund_subscribe')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const redeemedPrincipal = approved
      .filter(tx => tx.type === 'fund_redeem')
      .reduce((sum, tx) => sum + (parseFloat(tx.rate) || 0), 0);

    return bankNet + subscribed - redeemedPrincipal;
  };

  // 基金余额显示改为：基金本金
  const calculateFundBalance = () => {
    return calculateFundPrincipal();
  };

  // 计算基金总收益
  const calculateFundProfit = () => {
    if (!fundTransactions.length) return 0;
    
    const approved = fundTransactions.filter(tx => tx.status ? tx.status === 'approved' : true);
    
    // 计算基金收益（正数）
    const fundProfit = approved
      .filter(tx => tx.type === 'fund_profit')
      .reduce((acc, cur) => acc + (parseFloat(cur.principal) || 0), 0);
    
    // 计算基金损失（已经是负数，直接相加）
    const fundLoss = approved
      .filter(tx => tx.type === 'fund_loss')
      .reduce((acc, cur) => acc + (parseFloat(cur.principal) || 0), 0);
    
    // 净收益 = 收益 + 损失（损失已经是负数）
    const netProfit = fundProfit + fundLoss;
    
    return netProfit;
  };

  const calculateFundYieldPercent = () => {
    const source = fundTransactions.length
      ? fundTransactions
      : (transactions || []).filter(tx => ['bank_fund', 'fund_profit', 'fund_loss', 'fund_subscribe', 'fund_redeem', 'fund_dividend', 'fund_dividend_withdraw'].includes(tx.type));
    if (!source.length) return 0;
    const approved = source.filter(tx => tx.status ? tx.status === 'approved' : true);
    const netProfit = approved
      .filter(tx => ['fund_profit', 'fund_loss'].includes(tx.type))
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    const principalBase = calculateFundPrincipal();
    if (principalBase <= 0.0000001) return 0;
    return (netProfit / principalBase) * 100;
  };

  const calculatePersonalFundBalance = () => {
    if (!currentUser) return 0;
    const approvedAll = (transactions || []).filter(tx => tx.status === 'approved');
    const username = currentUser.username;

    const totalSubscribed = approvedAll
      .filter(t => t.type === 'fund_subscribe' && t.created_by === username)
      .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);

    const totalRedeemedPrincipal = approvedAll
      .filter(t => t.type === 'fund_redeem' && t.created_by === username)
      .reduce((sum, t) => sum + (parseFloat(t.rate) || 0), 0);

    const netSubscribed = Math.max(0, totalSubscribed - totalRedeemedPrincipal);
    const inDiv = approvedAll
      .filter(t => t.type === 'fund_dividend' && (t.client === username || t.created_by === username))
      .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
    const outDiv = approvedAll
      .filter(t => t.type === 'fund_dividend_withdraw' && t.created_by === username)
      .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
    const usedDividendInRedeem = approvedAll
      .filter(t => t.type === 'fund_redeem' && t.created_by === username)
      .reduce((sum, t) => {
        if (!t.remark) return sum;
        const m = String(t.remark).match(/分红[:：]\s*([0-9.]+)/);
        return sum + (m ? (parseFloat(m[1]) || 0) : 0);
      }, 0);
    const availableDividend = Math.max(0, inDiv - outDiv - usedDividendInRedeem);

    return netSubscribed + availableDividend;
  };

  const calculatePersonalFundNetSubscribed = () => {
    if (!currentUser) return 0;
    const approvedAll = (transactions || []).filter(tx => tx.status === 'approved');
    const username = currentUser.username;
    const totalSubscribed = approvedAll
      .filter(t => t.type === 'fund_subscribe' && t.created_by === username)
      .reduce((sum, t) => sum + (parseFloat(t.principal) || 0), 0);
    const totalRedeemedPrincipal = approvedAll
      .filter(t => t.type === 'fund_redeem' && t.created_by === username)
      .reduce((sum, t) => sum + (parseFloat(t.rate) || 0), 0);
    return Math.max(0, totalSubscribed - totalRedeemedPrincipal);
  };

  const calculatePersonalFundEstimatedProfit = () => {
    const netSubscribed = calculatePersonalFundNetSubscribed();
    return netSubscribed * (calculateFundYieldPercent() / 100);
  };

  const handleSettleFundDividends = async () => {
    try {
      if (!fundTransactions.length) return;
      const approved = fundTransactions.filter(tx => tx.status ? tx.status === 'approved' : true);
      const netProfit = approved
        .filter(tx => ['fund_profit', 'fund_loss'].includes(tx.type))
        .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
      if (netProfit <= 0.0000001) {
        alert('暂无可结算分红');
        return;
      }

      const fundPrincipal = calculateFundPrincipal();
      if (fundPrincipal <= 0.0000001) {
        alert('基金本金为 0，无法结算');
        return;
      }

      const yieldRate = netProfit / fundPrincipal;

      const approvedAll = transactions.filter(tx => tx.status === 'approved');
      const users = Array.from(new Set(approvedAll.map(tx => tx.created_by).filter(Boolean)));
      const userNet = users
        .map(u => {
          const sub = approvedAll
            .filter(t => t.type === 'fund_subscribe' && t.created_by === u)
            .reduce((s, t) => s + (parseFloat(t.principal) || 0), 0);
          const red = approvedAll
            .filter(t => t.type === 'fund_redeem' && t.created_by === u)
            .reduce((s, t) => s + (parseFloat(t.rate) || 0), 0);
          return { u, net: Math.max(0, sub - red) };
        })
        .filter(x => x.net > 0);

      const totalNet = userNet.reduce((s, x) => s + x.net, 0);
      if (totalNet <= 0) {
        alert('暂无持仓用户，无法结算');
        return;
      }

      const settleId = `fund_dividend_${Date.now()}`;
      const rows = userNet.map(({ u, net }) => ({
        type: 'fund_dividend',
        client: u,
        principal: parseFloat(((net * yieldRate)).toFixed(3)),
        rate: 0,
        remark: `结算批次:${settleId}`,
        status: 'approved',
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || 'unknown'
      })).filter(r => r.principal > 0);

      if (rows.length === 0) {
        alert('暂无可结算分红');
        return;
      }

      const distributedTotal = rows.reduce((s, r) => s + (parseFloat(r.principal) || 0), 0);
      const remainingProfit = Math.max(0, netProfit - distributedTotal);

      const extraRows = [];
      // 从总收益里扣除已分配分红
      if (distributedTotal > 0.0000001) {
        extraRows.push({
          type: 'fund_loss',
          client: 'dividend_settle',
          principal: -parseFloat(distributedTotal.toFixed(3)),
          rate: 0,
          remark: `分红结算扣减:${settleId}`,
          status: 'approved',
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          created_by: currentUser.username,
          creator_id: currentUser.id || 'unknown'
        });
      }

      // 结算后：剩余总收益全部转入本金，记为银行资金转入，同时把收益归零
      if (remainingProfit > 0.0000001) {
        extraRows.push({
          type: 'bank_fund',
          client: 'profit_to_principal',
          principal: parseFloat(remainingProfit.toFixed(3)),
          rate: 0,
          remark: `收益转入本金:${settleId}`,
          status: 'approved',
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          created_by: currentUser.username,
          creator_id: currentUser.id || 'unknown'
        });
        extraRows.push({
          type: 'fund_loss',
          client: 'profit_to_principal',
          principal: -parseFloat(remainingProfit.toFixed(3)),
          rate: 0,
          remark: `收益归零(已转本金):${settleId}`,
          status: 'approved',
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          created_by: currentUser.username,
          creator_id: currentUser.id || 'unknown'
        });
      }

      const { error } = await supabase.from('transactions').insert([...rows, ...extraRows]);
      if (error) throw error;

      await fetchFundTransactions();
      await refreshTransactions();
      alert(`分红结算完成：${rows.length}人，总额 ${distributedTotal.toFixed(3)}m`);
    } catch (e) {
      alert('结算失败: ' + e.message);
    }
  };
  // 计算银行闲置资金（基于当前状态，不受历史删除影响）
  const calculateIdleCash = () => {
    if (!currentUser || !transactions.length) return 0;
    
    const approved = transactions.filter(tx => tx.status === 'approved');
    
    // 计算总负债（注资+存款）
    const injections = approved
      .filter(tx => ['injection', 'deposit'].includes(tx.type))
      .reduce((acc, cur) => ({
        p: acc.p + (parseFloat(cur.principal) || 0),
        i: acc.i + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100)
      }), { p: 0, i: 0 });
    
    // 计算贷款资产
    const loans = approved
      .filter(tx => tx.type === 'loan')
      .reduce((acc, cur) => ({
        p: acc.p + (parseFloat(cur.principal) || 0),
        i: acc.i + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100)
      }), { p: 0, i: 0 });
    
    // 银行闲置资金 = 总负债 - 贷款资产 - 银行→基金净转账额（仅 bank_fund 影响银行闲置资金）
    const bankFundNetTransfer = approved
      .filter(tx => tx.type === 'bank_fund')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    const idleCash = injections.p - loans.p - bankFundNetTransfer;
    
    console.log('银行闲置资金计算（当前状态）:', {
      总负债: injections.p,
      贷款资产: loans.p,
      银行基金净转账: bankFundNetTransfer,
      闲置资金: idleCash
    });
    
    return Math.max(0, idleCash); // 确保不为负数
  };

  const formatMoney = (val) => `${parseFloat(val || 0).toFixed(3)}m`;

  // --- 渲染：未配置引导页 ---
  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-700">
        <div className="max-w-2xl w-full bg-white p-8 rounded-2xl shadow-xl border border-gray-200">
          <div className="flex items-center gap-3 mb-6 text-red-600">
             <Settings className="w-8 h-8" />
             <h1 className="text-2xl font-bold">应用尚未连接至数据库</h1>
          </div>
          <p className="mb-4">检测到您正在独立环境 (如 Vercel) 运行此应用，但尚未配置 Supabase 环境变量。</p>
          
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto mb-6 text-sm font-mono">
            <p className="text-slate-500 mb-2"># 请在 Vercel 项目设置 → Environment Variables 中添加以下变量：</p>
            <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
            <p>VITE_SUPABASE_ANON_KEY=sb_publishable_...</p>
          </div>
          <p className="text-sm text-gray-600">配置完成后，请在 Vercel 中重新部署 (Redeploy)。</p>
        </div>
      </div>
    );
  }

  // --- 渲染：登录页 ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#FFFCF0] flex items-center justify-center p-4 font-sans">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="bg-white/60 hover:bg-white/80 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-300"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
        <div className="bg-white w-full max-w-md p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">{t('loginTitle')}</h1>
            <p className="text-xl text-gray-700 font-semibold">{t('loginSubtitle')}</p>
            <p className="text-gray-500 mt-3 text-sm flex items-center justify-center gap-2">
               <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
               {connectionStatus === 'connected' ? t('serverConnected') : connectionStatus === 'connecting' ? t('connecting') : t('connectionFailed')}
            </p>
          </div>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <input type="text" required placeholder={t('accountPlaceholder')} value={authInput.username} onChange={e => setAuthInput({...authInput, username: e.target.value})} className="w-full border-2 border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
            <input type="password" required placeholder={t('passwordPlaceholder')} value={authInput.password} onChange={e => setAuthInput({...authInput, password: e.target.value})} className="w-full border-2 border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
            {authError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-200"><AlertCircle className="w-4 h-4"/>{authError}</div>}
            <button disabled={connectionStatus !== 'connected'} type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 transition-all shadow-lg">{authMode === 'login' ? t('loginButton') : t('registerButton')}</button>
          </form>
          <div className="mt-6 text-center text-sm"><button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-green-600 hover:text-green-700 hover:underline font-medium">{authMode === 'login' ? t('noAccount') : t('backToLogin')}</button></div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const pendingTx = Array.isArray(transactions) ? transactions.filter(tx => tx && tx.id && tx.status === 'pending') : [];
  // 注资账单公开所有人可见，其他账单显示：自己的所有记录 + 已批准的他人记录
  const displayTx = isAdmin ? transactions : transactions.filter(tx => 
    tx.created_by === currentUser?.username || tx.status === 'approved' || ['injection', 'withdraw_inj'].includes(tx.type)
  );

  // 如果当前在论坛页面，渲染论坛
  if (currentPage === 'forum') {
    return (
      <div className="min-h-screen bg-[#FFFEF9] text-gray-800 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 论坛头部 */}
          <div className="flex justify-between items-center pb-6 border-b border-green-200">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage('bank')}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-medium transition-colors border border-green-200 flex items-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" /> {t('backToBank')}
              </button>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <MessageSquare className="text-blue-400 animate-bounce" />
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent font-black">{t('forum')}</span>
              </h1>
            </div>
            <button
              onClick={() => setNewPostModal(true)}
              className="bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-2 font-bold transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-blue-300 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> {t('newPost')}
            </button>
          </div>

          {/* 帖子列表 */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white p-12 text-center border border-green-200">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">{t('noPostsYet')}</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-white border border-green-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* 帖子头部 */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="font-medium text-indigo-600">{post.author}</span>
                          <span>{new Date(post.created_at).toLocaleString('zh-CN')}</span>
                        </div>
                      </div>
                      {(isAdmin || post.author === currentUser.username) && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* 帖子内容 */}
                    <div className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {(() => {
                        const isExpanded = expandedPosts.has(post.id);
                        const lines = post.content.split('\n');
                        const shouldTruncate = lines.length > 4;
                        const displayContent = isExpanded ? post.content : lines.slice(0, 4).join('\n');
                        return (
                          <>
                            <div>{displayContent}</div>
                            {shouldTruncate && (
                              <button
                                onClick={() => {
                                  const next = new Set(expandedPosts);
                                  if (next.has(post.id)) next.delete(post.id);
                                  else next.add(post.id);
                                  setExpandedPosts(next);
                                }}
                                className="text-indigo-600 hover:text-indigo-700 font-medium mt-2"
                              >
                                {isExpanded ? '收起' : '查看全文'}
                              </button>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    {/* 点赞和回复按钮 */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => handleLikePost(post.id, post.likes || 0)}
                        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.likes || 0}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                        className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">{(post.replies || []).length} {t('reply')}</span>
                      </button>
                    </div>

                    {/* 回复列表 */}
                    {post.replies && post.replies.length > 0 && (
                      <div className="mt-4 space-y-3 pl-6 border-l-2 border-gray-200">
                        {post.replies.map(reply => (
                          <ReplyItem 
                            key={reply.id} 
                            reply={reply} 
                            postId={post.id}
                            currentUser={currentUser}
                            isAdmin={isAdmin}
                            replyingTo={replyingTo}
                            setReplyingTo={setReplyingTo}
                            onDelete={handleDeleteReply}
                            depth={0}
                            expandedReplies={expandedReplies}
                            setExpandedReplies={setExpandedReplies}
                          />
                        ))}
                      </div>
                    )}

                    {/* 回复输入框 - 直接回复帖子 */}
                    {typeof replyingTo === 'string' && replyingTo === post.id && (
                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder={t('replyPlaceholder')}
                          className="flex-1 border border-green-200 px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <button
                          onClick={() => handleReply(post.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 font-medium transition-colors flex items-center gap-2"
                        >
                          <Send className="w-4 h-4" /> {t('reply')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 发帖Modal */}
          {newPostModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white border-2 border-green-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center border-b border-green-200 pb-4">
                  <h3 className="font-bold text-xl text-gray-800">{t('newPost')}</h3>
                  <button onClick={() => setNewPostModal(false)}>
                    <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('postTitle')}</label>
                    <input
                      type="text"
                      required
                      value={newPostData.title}
                      onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                      className="w-full border-2 border-green-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all"
                      placeholder="请输入标题..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('postContent')}</label>
                    <textarea
                      required
                      value={newPostData.content}
                      onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                      rows={6}
                      className="w-full border-2 border-green-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all resize-none"
                      placeholder="写下你想说的..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3 transition-all shadow-md hover:shadow-lg"
                  >
                    {t('publish')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 银行债券页面
  if (currentPage === 'bonds') {
    const approvedAll = (transactions || []).filter(tx => tx.status === 'approved');
    const myBond = approvedAll
      .filter(tx => tx.type === 'bond_subscribe' && tx.created_by === currentUser?.username)
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    const bondBills = (transactions || [])
      .filter(tx => ['bond_subscribe', 'bond_redeem'].includes(tx.type))
      .slice()
      .sort((a, b) => {
        const ta = new Date(a.timestamp || a.created_at || 0).getTime();
        const tb = new Date(b.timestamp || b.created_at || 0).getTime();
        return tb - ta;
      });

    const soldByIssueId = approvedAll
      .filter(tx => tx.type === 'bond_subscribe')
      .reduce((acc, tx) => {
        const issueId = parseBondIssueIdFromRemark(tx.remark);
        if (!issueId) return acc;
        acc[issueId] = (acc[issueId] || 0) + (parseFloat(tx.principal) || 0);
        return acc;
      }, {});

    const soldByName = approvedAll
      .filter(tx => tx.type === 'bond_subscribe')
      .reduce((acc, tx) => {
        const key = tx.client || '未知债券';
        acc[key] = (acc[key] || 0) + (parseFloat(tx.principal) || 0);
        return acc;
      }, {});

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50/30 to-yellow-50/30">
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          <div className="flex justify-between items-center pb-6 border-b border-amber-200">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <TrendingUp className="w-7 h-7 text-amber-600" />
                银行债券
              </h1>
              <p className="text-slate-500 mt-1 text-sm">管理员发售债券，成员申购（申购需审批）</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPage('bank')} className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-medium transition-colors border border-amber-200">
                返回银行
              </button>
              {isAdmin && (
                <button onClick={() => setBondIssueModal(true)} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-4 py-2 font-bold transition-all shadow">
                  发售债券
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">我的债券持仓（已审批）</div>
              <div className="text-base font-semibold text-gray-900">{formatMoney(myBond)}</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">申购会占用你的存款可用额度</div>
          </div>

          <div className="bg-white border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-800">在售债券</div>
              <div className="text-xs text-gray-500">共 {bondProducts.length} 个产品</div>
            </div>
            {bondProducts.length === 0 ? (
              <div className="text-center text-gray-400 py-10">暂无在售债券</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bondProducts.map(p => {
                  const sold = (soldByIssueId[String(p.tx_id)] || 0) + (soldByName[p.name] || 0);
                  const remaining = Math.max(0, (parseFloat(p.total_supply) || 0) - sold);
                  return (
                    <div key={p.id} className="border border-amber-200 p-4 bg-amber-50/30">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-800">{p.name}</div>
                        <div className={`text-xs px-2 py-1 border ${p.category === 'long' ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                          {p.category === 'long' ? '长期' : '短期'}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">期限：{p.term_days} 天</div>
                      <div className="mt-1 text-sm text-gray-600">利率：{parseFloat(p.rate_per_week || 0).toFixed(3)}% / 周</div>
                      <div className="mt-1 text-xs text-gray-500">发行：{formatMoney(p.total_supply)}，已售：{formatMoney(sold)}，剩余：{formatMoney(remaining)}</div>
                      <div className="mt-3 flex items-center justify-end gap-2">
                        {isAdmin && (
                          <>
                            <button
                              onClick={() => handleEndBondIssue(p)}
                              className="text-gray-700 hover:text-gray-900 p-2 hover:bg-gray-50 border border-gray-200"
                              title="发行结束"
                            >
                              <Lock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRedeemAllBond(p)}
                              className="text-green-700 hover:text-green-900 p-2 hover:bg-green-50 border border-green-200"
                              title="全额赎回"
                            >
                              <CheckSquare className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openBondEditModal(p)}
                              className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 border border-blue-200"
                              title="编辑"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteBondProduct(p)}
                              className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 border border-red-200"
                              title="删除"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => openBondSubscribeModal(p)}
                          className="bg-white hover:bg-gray-50 text-amber-700 px-4 py-2 font-bold transition-colors border border-amber-200"
                        >
                          申购
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-800">债券账单（全员可见）</div>
              <div className="text-xs text-gray-500">共 {bondBills.length} 条</div>
            </div>
            {bondBills.length === 0 ? (
              <div className="text-center text-gray-400 py-10">暂无账单记录</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-amber-200">
                      <th className="py-2 pr-3">时间</th>
                      <th className="py-2 pr-3">类型</th>
                      <th className="py-2 pr-3">用户</th>
                      <th className="py-2 pr-3">债券</th>
                      <th className="py-2 pr-3 text-right">金额</th>
                      <th className="py-2 pr-3">状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bondBills.map(row => (
                      <tr key={row.id} className="border-b border-gray-100 text-gray-700">
                        <td className="py-2 pr-3 whitespace-nowrap">{row.timestamp || row.created_at || ''}</td>
                        <td className="py-2 pr-3 whitespace-nowrap font-semibold">{getLocalizedTypeLabel(row.type, language)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{row.created_by || ''}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{row.client || ''}</td>
                        <td className="py-2 pr-3 whitespace-nowrap text-right">{formatMoney(row.principal)}</td>
                        <td className="py-2 pr-3 whitespace-nowrap">{row.status || ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {bondEditModal && isAdmin && bondEditTarget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white border-2 border-amber-200 shadow-2xl max-w-md w-full p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">编辑债券</h3>
                    <p className="text-sm text-gray-500 mt-1">{bondEditTarget.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setBondEditModal(false);
                      setBondEditTarget(null);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdateBondProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">债券名称</label>
                    <input value={bondEditData.name} onChange={e => setBondEditData({ ...bondEditData, name: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">类型</label>
                      <select value={bondEditData.category} onChange={e => setBondEditData({ ...bondEditData, category: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none">
                        <option value="short">短期</option>
                        <option value="long">长期</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">期限(天)</label>
                      <input value={bondEditData.term_days} onChange={e => setBondEditData({ ...bondEditData, term_days: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">利率(%/周)</label>
                      <input value={bondEditData.rate_per_week} onChange={e => setBondEditData({ ...bondEditData, rate_per_week: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">发行额度(m)</label>
                      <input value={bondEditData.total_supply} onChange={e => setBondEditData({ ...bondEditData, total_supply: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 transition-all">
                    保存修改
                  </button>
                </form>
              </div>
            </div>
          )}

          {bondIssueModal && isAdmin && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white border-2 border-amber-200 shadow-2xl max-w-md w-full p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">发售债券</h3>
                    <p className="text-sm text-gray-500 mt-1">创建长期/短期债券产品</p>
                  </div>
                  <button onClick={() => setBondIssueModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateBondProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">债券名称</label>
                    <input value={bondIssueData.name} onChange={e => setBondIssueData({ ...bondIssueData, name: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">类型</label>
                      <select value={bondIssueData.category} onChange={e => setBondIssueData({ ...bondIssueData, category: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none">
                        <option value="short">短期</option>
                        <option value="long">长期</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">期限(天)</label>
                      <input value={bondIssueData.term_days} onChange={e => setBondIssueData({ ...bondIssueData, term_days: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">利率(%/周)</label>
                      <input value={bondIssueData.rate_per_week} onChange={e => setBondIssueData({ ...bondIssueData, rate_per_week: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">发行额度(m)</label>
                      <input value={bondIssueData.total_supply} onChange={e => setBondIssueData({ ...bondIssueData, total_supply: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 transition-all">
                    创建并发售
                  </button>
                </form>
              </div>
            </div>
          )}

          {bondSubscribeModal && bondSubscribeTarget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white border-2 border-amber-200 shadow-2xl max-w-md w-full p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">申购债券</h3>
                    <p className="text-sm text-gray-500 mt-1">{bondSubscribeTarget.name}</p>
                  </div>
                  <button onClick={() => setBondSubscribeModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>类型：{bondSubscribeTarget.category === 'long' ? '长期' : '短期'}</div>
                  <div>期限：{bondSubscribeTarget.term_days} 天</div>
                  <div>利率：{parseFloat(bondSubscribeTarget.rate_per_week || 0).toFixed(3)}% / 周</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">申购金额(m)</label>
                  <input value={bondSubscribeAmount} onChange={e => setBondSubscribeAmount(e.target.value)} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                  <p className="text-xs text-gray-500 mt-2">提交后需管理员审批</p>
                </div>
                <button onClick={submitBondSubscribe} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 transition-all">
                  提交申购
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 如果当前在星星开发页面，渲染星星开发
  if (currentPage === 'planet') {
    return (
      <div className="min-h-screen bg-[#FFFEF9] text-gray-800 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* 星星开发头部 */}
          <div className="flex justify-between items-center pb-6 border-b border-green-200">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setCurrentPage('bank')}
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-medium transition-colors border border-green-200 flex items-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" /> {t('backToBank')}
              </button>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <Activity className="text-blue-700" />
                <span className="bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent animate-gradient">{t('planetDev')}</span>
              </h1>
            </div>
            <button
              onClick={() => setNewCardModal(true)}
              className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 px-6 py-2 font-bold transition-all flex items-center gap-2 border border-blue-300"
            >
              <PlusCircle className="w-4 h-4" /> {t('createCard')}
            </button>
          </div>

          {/* 星星名片列表 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planetCards.length === 0 ? (
              <div className="col-span-full bg-white border border-blue-200 p-12 text-center">
                <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">暂无星星名片</p>
              </div>
            ) : (
              planetCards.map(card => {
                const cardFund = getCardFund(card.client);
                const cardAssetValue = bankAssets
                  .filter(asset => asset.client === card.client)
                  .reduce((sum, asset) => sum + (parseFloat(asset.rate) || 0), 0);
                const isEditing = editingCardId === card.id;
                const isFunding = fundingCardId === card.id;

                return (
                  <div key={card.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-4 shadow-md hover:shadow-lg transition-shadow">
                    {/* 名片标题 */}
                    <div className="mb-3">
                      {isEditing && isAdmin ? (
                        <input
                          type="text"
                          value={editCardData.name}
                          onChange={(e) => setEditCardData({ ...editCardData, name: e.target.value })}
                          className="w-full text-lg font-bold border-2 border-blue-300 px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      ) : (
                        <h3 className="text-lg font-bold text-blue-700">{card.client}</h3>
                      )}
                    </div>

                    {/* 描述 */}
                    <div className="mb-3 min-h-[60px]">
                      {isEditing && (isAdmin || currentUser.role === 'global_admin') ? (
                        <textarea
                          value={editCardData.description}
                          onChange={(e) => setEditCardData({ ...editCardData, description: e.target.value })}
                          className="w-full text-sm border-2 border-blue-300 px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                          rows={2}
                        />
                      ) : (
                        <p className="text-sm text-gray-700 line-clamp-3">{card.remark || '暂无描述'}</p>
                      )}
                    </div>

                    {/* 进度条 */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-600">{t('devProgress')}</span>
                        <span className="text-sm font-bold text-blue-500">{card.rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-3">
                        <div 
                          className="bg-gradient-to-r from-green-300 via-emerald-400 to-green-300 h-full transition-all duration-500 animate-progress"
                          style={{ width: `${card.rate}%` }}
                        ></div>
                      </div>
                      {isEditing && isAdmin && (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={editCardData.progress}
                          onChange={(e) => setEditCardData({ ...editCardData, progress: parseInt(e.target.value) || 0 })}
                          className="w-full mt-2 text-sm border-2 border-blue-300 px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      )}
                    </div>

                    {/* 资金显示 */}
                    <div className="bg-white border border-green-200 p-3 mb-3">
                      <p className="text-xs text-gray-600 mb-1">{t('cardFund')}</p>
                      <p className="text-xl font-bold text-green-600">{formatMoney(cardFund)}</p>
                    </div>

                    {/* 资产价值显示 */}
                    {cardAssetValue > 0 && (
                      <div className="bg-white border border-purple-200 p-3 mb-3">
                        <p className="text-xs text-gray-600 mb-1">{t('totalAssetValue')}</p>
                        <p className="text-xl font-bold text-purple-600">{formatMoney(cardAssetValue)}</p>
                      </div>
                    )}

                    {/* 注资名单 */}
                    <div className="bg-gray-50 border border-gray-200 p-3 mb-3 max-h-40 overflow-y-auto">
                      <p className="text-xs font-medium text-gray-700 mb-2">{t('fundingList')}</p>
                      {(() => {
                        const fundingList = getCardFundingList(card.client);
                        return fundingList.length > 0 ? (
                          <div className="space-y-1">
                            {fundingList.map((fund, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs bg-white px-2 py-1 border border-gray-100">
                                <span className="text-gray-700 font-medium">{fund.created_by || '匿名'}</span>
                                <span className="text-green-600 font-bold">{formatMoney(fund.principal)}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-2">{t('noFundingYet')}</p>
                        );
                      })()}
                    </div>

                    {/* 注资功能 */}
                    {isFunding ? (
                      <div className="space-y-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          className="w-full border-2 border-green-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                          placeholder="输入金额..."
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlanetFundRequest(card.id)}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 text-sm font-bold transition-colors"
                          >
                            {t('submit')}
                          </button>
                          <button
                            onClick={() => { setFundingCardId(null); setFundAmount(''); }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 text-sm font-bold transition-colors"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setFundingCardId(card.id)}
                          className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 text-sm font-bold transition-colors border border-green-300"
                        >
                          {t('fundForDev')}
                        </button>
                        {(isAdmin || currentUser.role === 'global_admin') && (
                          isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdateCard(card.id)}
                                className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 px-3 py-2 text-sm font-bold transition-all border border-blue-300"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingCardId(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 text-sm font-bold transition-colors"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingCardId(card.id);
                                setEditCardData({ name: card.client, description: card.remark, progress: card.rate });
                              }}
                              className="bg-blue-100 hover:bg-blue-200 text-blue-600 px-3 py-2 text-sm font-bold transition-colors border border-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* 创建名片 Modal */}
          {newCardModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white shadow-2xl max-w-md w-full p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="font-bold text-xl text-gray-800">{t('newCard')}</h3>
                  <button onClick={() => setNewCardModal(false)}>
                    <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <form onSubmit={handleCreateCard} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('planetName')}</label>
                    <input
                      type="text"
                      required
                      value={newCardData.name}
                      onChange={(e) => setNewCardData({ ...newCardData, name: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('planetDesc')}</label>
                    <textarea
                      required
                      value={newCardData.description}
                      onChange={(e) => setNewCardData({ ...newCardData, description: e.target.value })}
                      rows={4}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none resize-none"
                      placeholder={t('descPlaceholder')}
                    />
                  </div>
                  {isAdmin && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">{t('progressValue')}</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={newCardData.progress}
                        onChange={(e) => setNewCardData({ ...newCardData, progress: parseInt(e.target.value) || 0 })}
                        className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none"
                      />
                    </div>
                  )}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 font-bold py-3 transition-all border border-blue-300"
                  >
                    {t('createCard')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 银行资产管理页面
  if (currentPage === 'assets') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100/20 via-pink-50/20 to-blue-50/20 animate-gradient-slow">
        <style>{`
          @keyframes gradient-slow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .animate-gradient-slow {
            background-size: 200% 200%;
            animation: gradient-slow 15s ease infinite;
          }
        `}</style>
        {/* 头部 */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black tracking-wider mb-2 flex items-center gap-3">
                <Wallet className="w-10 h-10" />
                <span className="bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent animate-gradient">{t('bankAssets')}</span>
              </h2>
              <p className="text-purple-100 font-medium">{t('assetManagement')}</p>
            </div>
            <div>
              <button onClick={() => setCurrentPage('bank')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 font-bold transition-all border border-white/30">
                {t('backToBank')}
              </button>
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* 新增资产按钮 */}
          <div className="flex justify-end">
            <button
              onClick={() => setNewAssetModal(true)}
              className="bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 px-6 py-3 font-bold transition-all flex items-center gap-2 border border-purple-300 shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              {t('registerAsset')}
            </button>
          </div>

          {/* 资产列表 */}
          <div className="bg-white shadow-2xl border-2 border-purple-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center gap-3">
              <Wallet className="w-6 h-6" />
              <h3 className="text-xl font-bold">{t('assetList')}</h3>
            </div>
            <div className="p-6">
              {bankAssets.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Wallet className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg">{t('noAssetsYet')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-purple-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-purple-700">{t('planetNameAsset')}</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-purple-700">{t('itemName')}</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-purple-700">{t('quantity')}</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-purple-700">{t('assetValue')}</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-purple-700">{t('time')}</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-purple-700">{t('applicant')}</th>
                        {isAdmin && <th className="px-4 py-3 text-center text-sm font-bold text-purple-700">{t('actions')}</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-100">
                      {bankAssets.map((asset) => {
                        const isEditing = editingAssetId === asset.id;
                        return (
                        <tr key={asset.id} className="hover:bg-purple-50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-purple-700">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editAssetData.planetName}
                                onChange={(e) => setEditAssetData({ ...editAssetData, planetName: e.target.value })}
                                className="w-full border border-purple-300 px-2 py-1 rounded focus:ring-2 focus:ring-purple-400 outline-none"
                              />
                            ) : asset.client}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {isEditing ? (
                              <input
                                type="text"
                                value={editAssetData.itemName}
                                onChange={(e) => setEditAssetData({ ...editAssetData, itemName: e.target.value })}
                                className="w-full border border-purple-300 px-2 py-1 rounded focus:ring-2 focus:ring-purple-400 outline-none"
                              />
                            ) : asset.remark}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-gray-600">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                value={editAssetData.quantity}
                                onChange={(e) => setEditAssetData({ ...editAssetData, quantity: e.target.value })}
                                className="w-full border border-purple-300 px-2 py-1 rounded focus:ring-2 focus:ring-purple-400 outline-none text-right"
                              />
                            ) : asset.principal}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-bold text-purple-600">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.001"
                                value={editAssetData.value}
                                onChange={(e) => setEditAssetData({ ...editAssetData, value: e.target.value })}
                                className="w-full border border-purple-300 px-2 py-1 rounded focus:ring-2 focus:ring-purple-400 outline-none text-right"
                              />
                            ) : `${(asset.rate || 0).toFixed(3)}m`}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{asset.timestamp?.split(' ')[0] || '-'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{asset.created_by}</td>
                          {isAdmin && (
                            <td className="px-4 py-3 text-center">
                              {isEditing ? (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => handleUpdateAsset(asset.id)}
                                    className="text-green-600 hover:text-green-800 p-2 hover:bg-green-50 rounded transition-colors"
                                    title="保存"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAssetId(null)}
                                    className="text-gray-600 hover:text-gray-800 p-2 hover:bg-gray-100 rounded transition-colors"
                                    title="取消"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => {
                                      setEditingAssetId(asset.id);
                                      setEditAssetData({
                                        planetName: asset.client,
                                        itemName: asset.remark,
                                        quantity: asset.principal,
                                        value: asset.rate
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded transition-colors"
                                    title="编辑"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm('确认删除此资产记录？')) {
                                        handleCRUD('delete', asset.id);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded transition-colors"
                                    title="删除"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          )}
                        </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 新增资产 Modal */}
          {newAssetModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white shadow-2xl max-w-md w-full p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="font-bold text-xl text-gray-800">{t('newAsset')}</h3>
                  <button onClick={() => setNewAssetModal(false)}>
                    <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <form onSubmit={handleCreateAsset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('planetNameAsset')}</label>
                    <input
                      type="text"
                      required
                      value={newAssetData.planetName}
                      onChange={(e) => setNewAssetData({ ...newAssetData, planetName: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                      placeholder={t('namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('itemName')}</label>
                    <input
                      type="text"
                      required
                      value={newAssetData.itemName}
                      onChange={(e) => setNewAssetData({ ...newAssetData, itemName: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                      placeholder={t('itemPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('quantity')}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.001"
                      value={newAssetData.quantity}
                      onChange={(e) => setNewAssetData({ ...newAssetData, quantity: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                      placeholder={t('quantityPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('assetValue')}</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.001"
                      value={newAssetData.value}
                      onChange={(e) => setNewAssetData({ ...newAssetData, value: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                      placeholder={t('valuePlaceholder')}
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 font-bold py-3 transition-all border border-purple-300"
                  >
                    {t('submitAsset')}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // 利息管理Modal
  if (interestManageModal) {
    const interestTx = transactions.filter(tx => ['interest_income', 'interest_expense'].includes(tx.type));
    const settleIds = {};
    interestTx.forEach(tx => {
      const sid = tx.settle_id || 'unknown';
      if (!settleIds[sid]) settleIds[sid] = [];
      settleIds[sid].push(tx);
    });
    
    const handleDeleteSettlement = async (settleId) => {
      if (!window.confirm(`确认删除结算周期的 ${settleIds[settleId].length} 条记录？此操作不可撤销！`)) return;
      
      try {
        for (const tx of settleIds[settleId]) {
          await supabase.from('transactions').delete().eq('id', tx.id);
        }
        alert('删除成功！');
        setInterestManageModal(false);
      } catch (e) {
        alert('删除失败: ' + e.message);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-xl text-gray-800">利息结算记录管理</h3>
            <button onClick={() => setInterestManageModal(false)}>
              <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.keys(settleIds).sort().reverse().map((sid, idx) => {
              const records = settleIds[sid];
              const time = records[0]?.timestamp || 'N/A';
              const incomeRecords = records.filter(r => r.type === 'interest_income');
              const expenseRecords = records.filter(r => r.type === 'interest_expense');
              const totalIncome = incomeRecords.reduce((sum, r) => sum + (parseFloat(r.principal) || 0), 0);
              const totalExpense = expenseRecords.reduce((sum, r) => sum + (parseFloat(r.principal) || 0), 0);
              
              return (
                <div key={sid} className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-semibold text-gray-700">结算 #{idx + 1}</span>
                        <span className="text-xs text-gray-500">ID: {sid}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>⏰ 时间: {time}</div>
                        <div>📊 记录数: {records.length}条</div>
                        <div className="flex gap-4">
                          <span className="text-green-600">💰 收入: +{totalIncome.toFixed(3)}m</span>
                          <span className="text-red-600">💸 支出: -{totalExpense.toFixed(3)}m</span>
                          <span className="font-semibold text-purple-600">净利: {(totalIncome - totalExpense).toFixed(3)}m</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSettlement(sid)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      删除
                    </button>
                  </div>
                </div>
              );
            })}
            {Object.keys(settleIds).length === 0 && (
              <div className="text-center text-gray-400 py-8">暂无利息结算记录</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 银行基金页面
  if (currentPage === 'fund') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50/20 to-emerald-50/20 animate-gradient-slow">
        <style>{`
          @keyframes gradient-slow {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        
        {/* 头部 */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 shadow-xl">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div>
              <h2 className="text-4xl font-black tracking-wider mb-2 flex items-center gap-3">
                <TrendingUp className="w-10 h-10" />
                银行基金
              </h2>
              <p className="text-orange-100 font-medium">独立的基金投资管理系统</p>
            </div>
            <div>
              <button onClick={() => setCurrentPage('bank')} className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 font-bold transition-all border border-white/30">
                返回银行
              </button>
            </div>
          </div>
        </div>

        {/* 主体内容 */}
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* 账户概览 - 参考个人账户设计 */}
          <div className="bg-white border border-green-200 shadow-sm p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：基金账户信息 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-base">基金账户</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="text-base font-semibold text-gray-900">{formatMoney(calculateFundBalance())}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full h-10 px-3 border border-green-200 bg-green-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">基金余额</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(calculateFundBalance())}</span>
                  </div>
                  <div className="w-full h-10 px-3 border border-green-200 bg-green-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wallet className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">银行余额</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(calculateIdleCash())}</span>
                  </div>
                  <div className="w-full h-10 px-3 border border-purple-200 bg-purple-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">总收益</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(calculateFundProfit())}</span>
                  </div>
                  <div className="w-full h-10 px-3 border border-blue-200 bg-blue-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">收益率</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{calculateFundYieldPercent().toFixed(2)}%</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">基金 + 银行 + 收益统计</p>
              </div>
              {/* 右侧：管理员公告栏 */}
              <div className="border-l border-green-200 pl-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-base">管理员公告</span>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsEditingFundAnnouncement(true);
                        setFundAnnouncementInput(fundAnnouncement.content);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                    >
                      编辑
                    </button>
                  )}
                </div>
                
                {isEditingFundAnnouncement && currentUser?.role === 'admin' ? (
                  <div className="space-y-3">
                    <textarea
                      value={fundAnnouncementInput}
                      onChange={(e) => setFundAnnouncementInput(e.target.value)}
                      className="w-full border border-green-200 px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none"
                      rows={6}
                      placeholder="输入公告内容..."
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateFundAnnouncement}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingFundAnnouncement(false);
                          setFundAnnouncementInput('');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 min-h-[120px]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {fundAnnouncement.content || '暂无公告内容'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              {/* 转账操作 */}
              {currentUser?.role === 'admin' ? (
                <div className="bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <ArrowDownRight className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-base">资金转账</span>
                    </div>
                    <button
                      onClick={handleSettleFundDividends}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      结算分红
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => { setTransferModal(true); setTransferType('in'); }}
                      className="bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 border border-green-300 shadow-sm hover:shadow-md"
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      银行 → 基金
                    </button>
                    <button
                      onClick={() => { setTransferModal(true); setTransferType('out'); }}
                      className="bg-gradient-to-r from-teal-100 to-teal-200 hover:from-teal-200 hover:to-teal-300 text-teal-700 px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 border border-teal-300 shadow-sm hover:shadow-md"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      基金 → 银行
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-base">资金转账</span>
                    </div>
                  </div>
                  <div className="text-center py-6">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">权限不足</p>
                    <p className="text-gray-400 text-xs mt-1">只有管理员可以进行基金转账操作</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* 基金操作 */}
              {currentUser?.role !== 'admin' ? (
                <div className="bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-base">基金操作</span>
                    </div>
                    <div className="text-xs text-gray-500">提交后需管理员审批</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="h-10 w-full border border-blue-200 bg-blue-50 flex items-center justify-center gap-2 px-3">
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                      <span className="text-xs text-gray-600">申购本金</span>
                      <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundNetSubscribed())}</span>
                    </div>
                    <div className="h-10 w-full border border-purple-200 bg-purple-50 flex items-center justify-center gap-2 px-3">
                      <Activity className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">预估收益</span>
                      <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundEstimatedProfit())}</span>
                    </div>
                    <div className="h-10 w-full border border-green-200 bg-green-50 flex items-center justify-center gap-2 px-3">
                      <Wallet className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600">基金余额</span>
                      <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundBalance())}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => openFundUserModal('subscribe')}
                      className="h-10 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-green-700 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-green-200"
                    >
                      <PlusCircle className="w-4 h-4" />
                      申购
                    </button>
                    <button
                      onClick={() => openFundUserModal('redeem')}
                      className="h-10 bg-gradient-to-r from-blue-100 to-sky-100 hover:from-blue-200 hover:to-sky-200 text-blue-700 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-blue-200"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      赎回
                    </button>
                    <button
                      onClick={() => openFundUserModal('dividend_withdraw')}
                      className="h-10 bg-gradient-to-r from-purple-100 to-fuchsia-100 hover:from-purple-200 hover:to-fuchsia-200 text-purple-700 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-purple-200"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      提取分红
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-base">基金操作</span>
                    </div>
                  </div>
                  <div className="text-center py-6">
                    <p className="text-gray-500">该区域为普通用户申购/赎回入口</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 交易记录 */}
          <div className="bg-white border border-green-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-base">基金交易记录</span>
              </div>
              <div className="flex items-center gap-2">
                {canEditFundTransactions() && (
                  <>
                    {selectedTransactions.size > 0 && (
                      <button
                        onClick={handleBatchDelete}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        删除选中 ({selectedTransactions.size})
                      </button>
                    )}
                    <button
                      onClick={() => setShowBatchDelete(!showBatchDelete)}
                      className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                        showBatchDelete 
                          ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      <CheckSquare className="w-4 h-4" />
                      {showBatchDelete ? '完成选择' : '批量选择'}
                    </button>
                    <button
                      onClick={() => setAddFundTxModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      添加记录
                    </button>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* 左侧：基金盈亏记录 */}
              <div className="w-full">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  基金盈亏记录
                </h4>
                <div className="overflow-hidden">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr className="border-b border-green-200">
                        {showBatchDelete && canEditFundTransactions() && (
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs w-16">
                            <input
                              type="checkbox"
                              onChange={() => handleSelectAll('profit')}
                              className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                            />
                          </th>
                        )}
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-32 whitespace-nowrap">时间</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-20 whitespace-nowrap">类型</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs w-24 whitespace-nowrap">金额</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs whitespace-nowrap">备注</th>
                        {canEditFundTransactions() && (
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs w-24">操作</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {fundTransactions.filter(tx => ['fund_profit', 'fund_loss'].includes(tx.type)).length === 0 ? (
                        <tr>
                          <td colSpan={canEditFundTransactions() ? (showBatchDelete ? "6" : "5") : "4"} className="text-center py-6 text-gray-400 text-xs">暂无盈亏记录</td>
                        </tr>
                      ) : (
                        fundTransactions
                          .filter(tx => ['fund_profit', 'fund_loss'].includes(tx.type))
                          .map((tx) => (
                            <tr key={tx.id} className={`border-b border-gray-100 hover:bg-green-50 ${selectedTransactions.has(tx.id) ? 'bg-green-100' : ''}`}>
                              {showBatchDelete && canEditFundTransactions() && (
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedTransactions.has(tx.id)}
                                    onChange={() => handleSelectTransaction(tx.id)}
                                    className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                  />
                                </td>
                              )}
                              <td className="py-2 px-3 text-gray-600 text-xs whitespace-nowrap">
                                {new Date(tx.created_at || tx.timestamp).toLocaleString('zh-CN', { 
                                  year: 'numeric', 
                                  month: '2-digit', 
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium whitespace-nowrap ${
                                  tx.type === 'fund_profit' ? 'bg-emerald-100 text-emerald-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {tx.type === 'fund_profit' ? '收益' : '损失'}
                                </span>
                              </td>
                              <td className={`py-2 px-3 text-right font-medium text-xs ${
                                (tx.principal || 0) > 0 ? 'text-green-600' : 'text-red-600'
                              } whitespace-nowrap`}>
                                {(tx.principal || 0) > 0 ? '+' : ''}{formatMoney(Math.abs(tx.principal || 0))}
                              </td>
                              <td className="py-2 px-3 text-gray-600 text-xs whitespace-nowrap">
                                <div className="max-w-[160px] truncate" title={tx.remark || ''}>{tx.remark || '-'}</div>
                              </td>
                              {canEditFundTransactions() && (
                                <td className="py-2 px-3">
                                  <div className="flex flex-row items-center justify-center gap-4 whitespace-nowrap">
                                    <button
                                      onClick={() => handleEditFundTx(tx)}
                                      className="inline-flex items-center justify-center whitespace-nowrap bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 text-xs font-medium transition-colors"
                                    >
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFundTx(tx.id)}
                                      className="inline-flex items-center justify-center whitespace-nowrap bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-xs font-medium transition-colors"
                                    >
                                      删除
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 右侧：银行资金转入转出记录 */}
              <div className="w-full">
                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ArrowDownRight className="w-4 h-4 text-blue-600" />
                  银行资金记录
                </h4>
                <div className="overflow-hidden">
                  <table className="w-full text-sm table-fixed">
                    <thead>
                      <tr className="border-b border-blue-200">
                        {showBatchDelete && canEditFundTransactions() && (
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs w-16">
                            <input
                              type="checkbox"
                              onChange={() => handleSelectAll('transfer')}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </th>
                        )}
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-32 whitespace-nowrap">时间</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-20 whitespace-nowrap">类型</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs w-24 whitespace-nowrap">金额</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs whitespace-nowrap">备注</th>
                        {canEditFundTransactions() && (
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs w-24">操作</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {fundTransactions.filter(tx => tx.type === 'bank_fund').length === 0 ? (
                        <tr>
                          <td colSpan={canEditFundTransactions() ? (showBatchDelete ? "6" : "5") : "4"} className="text-center py-6 text-gray-400 text-xs">暂无银行资金记录</td>
                        </tr>
                      ) : (
                        fundTransactions
                          .filter(tx => tx.type === 'bank_fund')
                          .map((tx) => (
                            <tr key={tx.id} className={`border-b border-gray-100 hover:bg-blue-50 ${selectedTransactions.has(tx.id) ? 'bg-blue-100' : ''}`}>
                              {showBatchDelete && canEditFundTransactions() && (
                                <td className="py-2 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedTransactions.has(tx.id)}
                                    onChange={() => handleSelectTransaction(tx.id)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                </td>
                              )}
                              <td className="py-2 px-3 text-gray-600 text-xs whitespace-nowrap">
                                {new Date(tx.created_at || tx.timestamp).toLocaleString('zh-CN', { 
                                  year: 'numeric', 
                                  month: '2-digit', 
                                  day: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium whitespace-nowrap ${
                                  tx.principal > 0 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {tx.principal > 0 ? '转入' : '转出'}
                                </span>
                              </td>
                              <td className={`py-2 px-3 text-right font-medium text-xs ${
                                (tx.principal || 0) > 0 ? 'text-green-600' : 'text-blue-600'
                              } whitespace-nowrap`}>
                                {(tx.principal || 0) > 0 ? '+' : ''}{formatMoney(Math.abs(tx.principal || 0))}
                              </td>
                              <td className="py-2 px-3 text-gray-600 text-xs whitespace-nowrap">
                                <div className="max-w-[160px] truncate" title={tx.remark || ''}>{tx.remark || '-'}</div>
                              </td>
                              {canEditFundTransactions() && (
                                <td className="py-2 px-3">
                                  <div className="flex flex-row items-center justify-center gap-2 whitespace-nowrap">
                                    <button
                                      onClick={() => handleEditFundTx(tx)}
                                      className="inline-flex items-center justify-center whitespace-nowrap bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 text-xs font-medium transition-colors"
                                    >
                                      编辑
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFundTx(tx.id)}
                                      className="inline-flex items-center justify-center whitespace-nowrap bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-xs font-medium transition-colors"
                                    >
                                      删除
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

        {/* 转账弹窗 */}
        {transferModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full animate-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                {transferType === 'in' ? '银行转基金' : '基金转银行'}
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">转账金额 (m单位)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full border-2 border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  placeholder="请输入转账金额（如：0.1）"
                />
              </div>
              
              <div className="mb-6 p-4 bg-green-50">
                <p className="text-sm text-gray-600">
                  {transferType === 'in' ? 
                    `将从银行闲置资金转出，银行可用闲置资金：${formatMoney(calculateIdleCash())}` :
                    `将从基金账户转出，基金可用余额：${formatMoney(calculateFundBalance())}`
                  }
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => { setTransferModal(false); setTransferAmount(''); setTransferType(''); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleFundTransfer}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  确认转账
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 添加基金交易记录弹窗 */}
        {addFundTxModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full animate-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">添加基金交易记录</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">记录类型</label>
                <select
                  value={newFundTxData.type}
                  onChange={(e) => setNewFundTxData({...newFundTxData, type: e.target.value})}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                >
                  <option value="fund_profit">基金收益</option>
                  <option value="fund_loss">基金损失</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">金额 (m单位)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newFundTxData.amount}
                  onChange={(e) => setNewFundTxData({...newFundTxData, amount: e.target.value})}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  placeholder="请输入金额（如：0.1）"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">备注说明</label>
                <textarea
                  value={newFundTxData.remark}
                  onChange={(e) => setNewFundTxData({...newFundTxData, remark: e.target.value})}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none"
                  rows={3}
                  placeholder="请输入备注说明（可选）"
                />
              </div>
              
              <div className="mb-6 p-4 bg-green-50">
                <p className="text-sm text-gray-600">
                  {newFundTxData.type === 'fund_profit' ? 
                    `将增加基金收益 ${formatMoney(parseFloat(newFundTxData.amount) || 0)}` :
                    `将记录基金损失 ${formatMoney(parseFloat(newFundTxData.amount) || 0)}`
                  }
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleCancelAddFundTx}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleAddFundTx}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 普通用户申购/赎回/提取分红弹窗 */}
        {fundUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full animate-in">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {fundUserAction === 'subscribe' ? '基金申购申请' : fundUserAction === 'redeem' ? '基金赎回申请' : '提取分红申请'}
                </h3>
                <button onClick={() => setFundUserModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">金额 (m单位)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.001"
                  value={fundUserAmount}
                  onChange={(e) => setFundUserAmount(e.target.value)}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  placeholder="请输入金额（如：0.100）"
                />
              </div>

              <div className="mb-6 p-4 bg-green-50 border border-green-200">
                <p className="text-sm text-gray-600">
                  提交后将进入管理员审批队列。
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setFundUserModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={submitFundUserRequest}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  提交申请
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 管理利息记录弹窗 */}
        {interestManageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full animate-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">管理利息记录</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setInterestManageModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleInterestManage}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  确认
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
 }

 // 计算按用户分组的净余额数据（用于显示在表格中）
 // 对于 injection/deposit，显示 (total - withdraw/取款)，仅计入已批准的交易
 // 对于 withdraw_inj/withdraw_dep，仍显示原始数据
 const getNetBalanceData = (txList, types, withdrawType = null) => {
   const approved = txList.filter(tx => types.includes(tx.type) && tx.status === 'approved');
 
   if (!withdrawType) {
     // 直接返回原始数据（用于撤资/取款）
     return approved;
   }
 
   // 按创建人分组计算净余额
   const userBalances = {};
   approved.forEach(tx => {
     const user = tx.created_by || 'unknown';
     if (!userBalances[user]) {
       userBalances[user] = { ...tx, principal: 0, userBalanceTotal: 0 };
     }
     userBalances[user].principal += parseFloat(tx.principal) || 0;
     userBalances[user].userBalanceTotal = userBalances[user].principal;
   });
 
   // 从撤资/取款中扣除（仅计入已批准的撤资/取款）
   const withdrawn = txList.filter(tx => tx.type === withdrawType && tx.status === 'approved');
   withdrawn.forEach(w => {
     const user = w.created_by || 'unknown';
     if (userBalances[user]) {
       userBalances[user].userBalanceTotal -= parseFloat(w.principal) || 0;
     }
   });
 
   // 将净余额更新到 principal 中供显示
   return Object.values(userBalances)
     .map(item => ({
       ...item,
       principal: item.userBalanceTotal,
       isNetBalance: true // 标记为净余额数据
     }))
     .filter(item => item.principal > 0); // 只显示余额 > 0 的用户
 };

  return (
    <div className="min-h-screen bg-[#FFFEF9] text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-green-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent animate-gradient">{t('loginTitle')}</span> {t('loginSubtitle')}
              <span className="relative overflow-hidden border border-emerald-400 text-emerald-950 text-xs px-2 py-1 font-bold whitespace-nowrap bg-gradient-to-r from-emerald-200 via-emerald-100 to-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)] animate-pulse">
                琉璃主权资本
              </span>
              {isAdmin && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">LSVC</span>}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">{t('currentUser')}: <span className="font-bold">{currentUser.username}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                 className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 font-medium transition-colors border border-green-200 text-sm"
               >
                 {language === 'zh' ? 'EN' : '中文'}
               </button>
               <div className={`px-4 py-2 font-bold text-lg ${stats.netCashFlow >= -0.001 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t('netCashFlow')}: {stats.netCashFlow > 0 ? '+' : ''}{formatMoney(stats.netCashFlow)} {t('perWeek')}
                </div>
             </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"><LogOut className="w-4 h-4" /> {t('logout')}</button>
          </div>
        </div>

        <div className="bg-white border border-green-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-700">
              <MessageSquare className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-base">管理员公告</span>
            </div>
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => {
                  setIsEditingBankAnnouncement(true);
                  setBankAnnouncementInput(bankAnnouncement.content);
                }}
                className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
              >
                编辑
              </button>
            )}
          </div>

          {isEditingBankAnnouncement && currentUser?.role === 'admin' ? (
            <div className="space-y-3">
              <textarea
                value={bankAnnouncementInput}
                onChange={(e) => setBankAnnouncementInput(e.target.value)}
                className="w-full border border-green-200 px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none"
                rows={4}
                placeholder={t('announcementPlaceholder')}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleUpdateBankAnnouncement}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                >
                  {t('save')}
                </button>
                <button
                  onClick={() => {
                    setIsEditingBankAnnouncement(false);
                    setBankAnnouncementInput('');
                  }}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 p-4 min-h-[90px]">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {bankAnnouncement.content || t('noAnnouncement')}
              </p>
            </div>
          )}
        </div>

        {/* 管理员审批 */}
        {isAdmin && pendingTx && pendingTx.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4">
               <AlertCircle className="w-5 h-5"/> {t('pendingApproval')} ({pendingTx.length})
             </h3>
             <div className="grid gap-3">
                {pendingTx.map(tx => (
                  <div key={tx.id} className="bg-white p-4 rounded-lg border border-amber-100 flex justify-between items-center">
                    <div>
                      <span className="font-bold mr-2">[{getLocalizedTypeLabel(tx.type || 'unknown')}]</span>
                      <span>{tx.client || '未知'} - {formatMoney(tx.principal || 0)}</span>
                      <span className="text-xs text-gray-500 block">申请人: {tx.created_by || '未知'}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleCRUD('approve', tx.id)} 
                        className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        <CheckCircle className="w-4 h-4"/>
                      </button>
                      <button 
                        onClick={() => handleCRUD('reject', tx.id)} 
                        className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        <XCircle className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="bg-white p-4 border border-green-200 shadow-sm flex flex-wrap gap-4 items-center">
            <span className="font-bold text-gray-700 mr-2 flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400"/> {t('operations')}:</span>
            <Btn icon={PlusCircle} label={t('loan')} onClick={() => openModal('loan')} color="green" />
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <Btn icon={PlusCircle} label={t('injection')} onClick={() => openModal('injection')} color="blue" />
            <Btn icon={MinusCircle} label={t('withdrawInj')} onClick={() => openModal('withdraw_inj')} color="blue" />
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <button onClick={() => openModal('deposit')} className="bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 text-green-700 px-4 py-2 font-bold transition-all flex items-center gap-2 border border-green-200">
              <PlusCircle className="w-4 h-4" />
              {t('deposit')}
            </button>
            <button onClick={() => openModal('withdraw_dep')} className="bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 text-yellow-700 px-4 py-2 font-bold transition-all flex items-center gap-2 border border-yellow-200">
              <MinusCircle className="w-4 h-4" />
              {t('withdrawDep')}
            </button>
            {isAdmin && <div className="h-6 w-px bg-green-200 mx-2"></div>}
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <Btn icon={MessageSquare} label={t('forum')} onClick={() => setCurrentPage('forum')} color="red" className="px-8" />
            <button onClick={() => setCurrentPage('planet')} className="bg-gradient-to-r from-blue-100 to-blue-200 hover:from-blue-200 hover:to-blue-300 text-blue-700 px-8 py-2 font-bold transition-all flex items-center gap-2 border border-blue-300">
              <Activity className="w-4 h-4" />
              {t('planetDev')}
            </button>
            <button onClick={() => setCurrentPage('assets')} className="bg-gradient-to-r from-purple-100 to-purple-200 hover:from-purple-200 hover:to-purple-300 text-purple-700 px-8 py-2 font-bold transition-all flex items-center gap-2 border border-purple-300">
              <Wallet className="w-4 h-4" />
              {t('bankAssets')}
            </button>
            <button onClick={() => setCurrentPage('fund')} className="bg-gradient-to-r from-green-100 to-emerald-100 hover:from-green-200 hover:to-emerald-200 text-green-700 px-8 py-2 font-bold transition-all duration-300 flex items-center gap-2 border border-green-300 shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95">
              <TrendingUp className="w-4 h-4" />
              银行基金
            </button>
            <button onClick={() => setCurrentPage('bonds')} className="bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-800 px-8 py-2 font-bold transition-all flex items-center gap-2 border border-amber-300">
              <TrendingUp className="w-4 h-4" />
              银行债券
            </button>
            {isAdmin && <Btn icon={PlusCircle} label={`${t('manualSettle')} (${settleCountdown})`} onClick={() => autoSettleInterest()} color="amber" />}
            {isAdmin && <button
              onClick={() => setInterestManageModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              管理利息记录
            </button>}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <StatCard title={t('totalAssets')} value={formatMoney(stats.totalAssets)} subtext={''} icon={<ArrowUpRight className="text-green-600" />} />
          <StatCard title={t('totalLiabilities')} value={formatMoney(stats.totalLoans)} subtext={''} icon={<ArrowDownLeft className="text-red-500" />} />
          <StatCard title={t('idleFunds')} value={formatMoney(stats.idleCash)} subtext={t('availableBalance')} icon={<Wallet className="text-yellow-500" />} />
          <StatCard title={t('totalAssetValue')} value={formatMoney(stats.bankAssetsValue)} subtext="不动产" icon={<Wallet className="text-purple-600" />} />
          <StatCard title={t('interestPool')} value={formatMoney(stats.interestPool)} subtext={t('weeklyNetInterest')} icon={<Activity className="text-purple-600" />} />
          <StatCard title={t('approvalQueue')} value={pendingTx.length} subtext={t('pendingItems')} icon={<Shield className="text-blue-600" />} />
        </div>

        {/* 表格区 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           <TableSection title={t('loanAssets')} color="red" icon={ArrowUpRight} 
             data={isAdmin ? displayTx.filter(tx => tx.type === 'loan') : displayTx.filter(tx => tx.type === 'loan' && (tx.status === 'approved' || tx.created_by === currentUser?.username))} 
             isAdmin={isAdmin} onEdit={(tx) => openModal('loan', tx)} onDelete={(id) => handleCRUD('delete', id)} onRepay={(id) => {if(window.confirm('确认还款此笔贷款？')) handleCRUD('repay', id)}} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel}
             interestRecords={transactions.filter(tx => tx.status === 'approved' && tx.type === 'interest_income')} applyInterest={true} />
           
           <div className="space-y-6">
             {/* 个人账户 */}
             <div className="bg-white border border-green-200 rounded-lg shadow-sm p-4">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2 text-gray-700">
                   <Wallet className="w-5 h-5 text-green-600" />
                   <span className="font-semibold text-base">{t('personalBalance')}</span>
                 </div>
                 <div className="flex items-center gap-2 justify-end">
                   <div className="text-base font-semibold text-gray-900">{formatMoney(stats.personalTotalBalance)}</div>
                   <div className="text-xl leading-none animate-bounce">💲</div>
                 </div>
               </div>
               <div className="flex flex-wrap gap-3">
                 <div className="px-3 py-2 rounded border border-purple-200 bg-purple-50 flex items-center gap-2">
                   <ArrowDownLeft className="w-4 h-4 text-purple-600" />
                   <span className="text-xs text-gray-600">注资</span>
                   <span className="text-sm font-semibold text-gray-900">{formatMoney(stats.injectionBalance)}</span>
                 </div>
                 <div className="px-3 py-2 rounded border border-green-200 bg-green-50 flex items-center gap-2">
                   <Wallet className="w-4 h-4 text-green-600" />
                   <span className="text-xs text-gray-600">存款</span>
                   <span className="text-sm font-semibold text-gray-900">{formatMoney(stats.depositBalance)}</span>
                 </div>
                 <div className="px-3 py-2 rounded border border-blue-200 bg-blue-50 flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-blue-600" />
                   <span className="text-xs text-gray-600">基金</span>
                   <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundBalance())}</span>
                 </div>
               </div>
               <p className="mt-3 text-xs text-gray-500">{t('injectionAndDeposit')}</p>
             </div>

             {/* 注资账户 - 分开显示 */}
              <TableSection title={`${t('injectionAccount')} - ${t('injection')}`} color="orange" icon={ArrowDownLeft} 
                data={isAdmin ? displayTx.filter(tx => tx.type === 'injection') : displayTx.filter(tx => tx.type === 'injection' && (tx.status === 'approved' || tx.created_by === currentUser?.username))} 
               isAdmin={isAdmin} onEdit={(tx) => openModal(tx.type, tx)} onDelete={(id) => handleCRUD('delete', id)} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} 
               interestRecords={transactions.filter(tx => tx.status === 'approved' && tx.type === 'interest_expense' && tx.client === '注资利息支出')} applyInterest={true} />
              
              <TableSection title={`${t('injectionAccount')} - ${t('withdrawInj')}`} color="orange" icon={ArrowDownLeft} 
                data={isAdmin ? displayTx.filter(tx => tx.type === 'withdraw_inj') : displayTx.filter(tx => tx.type === 'withdraw_inj' && (tx.status === 'approved' || tx.created_by === currentUser?.username))}
               isAdmin={isAdmin} onEdit={(tx) => openModal(tx.type, tx)} onDelete={(id) => handleCRUD('delete', id)} onDeleteAll={() => handleCRUD('deleteAll', 'withdraw_inj')} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} applyInterest={false} />
             
             {/* 存款账户总余额 - 已按需求移除显示 */}

              <TableSection title={`${t('depositAccount')} - ${t('deposit')}`} color="blue" icon={Wallet}
                data={isAdmin ? displayTx.filter(tx => tx.type === 'deposit') : displayTx.filter(tx => tx.type === 'deposit' && (tx.status === 'approved' || tx.created_by === currentUser?.username))} 
               isAdmin={isAdmin} onEdit={(tx) => openModal(tx.type, tx)} onDelete={(id) => handleCRUD('delete', id)} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} 
               interestRecords={transactions.filter(tx => tx.status === 'approved' && tx.type === 'interest_expense' && tx.client === '存款利息支出')} applyInterest={true} />
              
              <TableSection title={`${t('depositAccount')} - ${t('withdrawDep')}`} color="blue" icon={Wallet}
                data={isAdmin ? displayTx.filter(tx => tx.type === 'withdraw_dep') : displayTx.filter(tx => tx.type === 'withdraw_dep' && (tx.status === 'approved' || tx.created_by === currentUser?.username))}
               isAdmin={isAdmin} onEdit={(tx) => openModal(tx.type, tx)} onDelete={(id) => handleCRUD('delete', id)} onDeleteAll={() => handleCRUD('deleteAll', 'withdraw_dep')} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} applyInterest={false} />
           </div>
        </div>

        {/* Modal */}
        {modalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white border-2 border-green-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 transition-all hover:border-green-300 hover:shadow-green-200/50">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">{editId ? t('edit') : t('create')}</h3>
                            <p className="text-sm text-gray-500 mt-1">{getLocalizedTypeLabel(modalType)}</p>
                        </div>
                        <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                            <X className="w-6 h-6"/>
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={(e) => { e.preventDefault(); handleCRUD(editId ? 'update' : 'create', editId ? { id: editId, ...formData } : { ...formData, type: modalType }); }} className="space-y-4">
                        
                        {/* 客户/对象 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('clientLabel')}</label>
                            <input 
                                type="text" 
                                required 
                                disabled={!isAdmin && !editId} 
                                value={formData.client} 
                                onChange={e => setFormData({...formData, client: e.target.value})} 
                                className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all hover:border-green-300" 
                                placeholder="输入客户或对象名称"
                            />
                        </div>
                        
                        {/* 产品类型选择 - 存款 */}
                        {modalType === 'deposit' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('productType')}</label>
                            <select 
                              required 
                              value={formData.product_type} 
                              onChange={e => {
                                const newType = e.target.value;
                                setFormData({
                                  ...formData, 
                                  product_type: newType,
                                  rate: newType === 'risk' ? '9' : (newType === 'risk5' ? '5' : '2.5')
                                });
                              }} 
                              className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all hover:border-green-300"
                            >
                              <option value="normal">{t('normalDeposit')}</option>
                              <option value="risk">{t('riskDeposit')}</option>
                              <option value="risk5">{t('riskDeposit5')}</option>
                            </select>
                            {formData.product_type === 'risk' && (
                              <p className="text-xs text-red-700 mt-2 bg-red-50 border border-red-200 p-2 font-semibold">{t('riskNote')}</p>
                            )}
                            {formData.product_type === 'risk5' && (
                              <p className="text-xs text-orange-700 mt-2 bg-orange-50 border border-orange-200 p-2">{t('riskNote5')}</p>
                            )}
                          </div>
                        )}
                        
                        {/* 产品类型选择 - 贷款 */}
                        {modalType === 'loan' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('productType')}</label>
                            <select 
                              required 
                              value={formData.product_type} 
                              onChange={e => setFormData({...formData, product_type: e.target.value})} 
                              className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all hover:border-green-300"
                            >
                              <option value="interest">{t('interestLoan')}</option>
                              <option value="stable">{t('stableLoan')}</option>
                            </select>
                          </div>
                        )}
                        
                        {/* 金额 */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('amountLabel')}</label>
                            <input 
                                type="number" 
                                step="0.001" 
                                required 
                                value={formData.principal} 
                                onChange={e => setFormData({...formData, principal: e.target.value})} 
                                className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all hover:border-green-300" 
                                placeholder="0.000"
                            />
                        </div>
                        
                        {/* 利率字段 */}
                        {modalType === 'injection' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('rateLabel')}</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                disabled 
                                value={formData.rate} 
                                className="w-full border-2 border-green-200 px-3 py-2.5 outline-none bg-gray-100 cursor-not-allowed text-gray-500" 
                            />
                            <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2">💡 固定 3%，不允许更改</p>
                          </div>
                        )}
                        {!['injection', 'withdrawal', 'withdraw_dep', 'withdraw_inj'].includes(modalType) && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('rateLabel')}</label>
                            <input 
                                type="number" 
                                step="0.1" 
                                required 
                                value={formData.rate} 
                                onChange={e => setFormData({...formData, rate: e.target.value})} 
                                className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all hover:border-green-300" 
                                placeholder="0.0"
                            />
                          </div>
                        )}

                        {/* 按钮组 */}
                        <div className="flex gap-3 pt-4">
                            <button 
                                type="submit" 
                                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 px-4 transition-all shadow-md hover:shadow-lg active:scale-95"
                            >
                                {t('submit')}
                            </button>
                            <button 
                                type="button"
                                onClick={() => setModalOpen(false)} 
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 transition-colors active:scale-95"
                            >
                                {t('cancel')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

// --- 内嵌子组件 (Sub-components) ---
const Btn = ({ icon: Icon, label, onClick, color, className = '' }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 bg-${color}-50 text-${color}-700 hover:bg-${color}-100 font-medium border border-${color}-200 transition-colors ${className}`}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);

const StatCard = ({ title, value, subtext, icon }) => (
    <div className="bg-white p-6 shadow-sm border border-green-200 flex flex-col justify-between h-32">
        <div className="flex justify-between items-start"><h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3><div className="p-2 bg-gray-50 rounded-lg">{icon}</div></div>
        <div><div className="text-2xl font-bold text-gray-900">{value}</div><div className="text-xs font-medium text-gray-500 mt-1">{subtext}</div></div>
    </div>
);

const TableSection = ({ title, color, icon: Icon, data, isAdmin, onEdit, onDelete, onRepay, onDeleteAll, language, t, getLocalizedTypeLabel, interestRecords = [], applyInterest = true }) => {
  // 使用单个state管理所有行的展开状态
  const [openActionsId, setOpenActionsId] = React.useState(null);
  const [editingCell, setEditingCell] = React.useState(null); // { id, field, value }
  
  const calculateWeeklyInterest = (principal, rate) => {
    return parseFloat((parseFloat(principal || 0) * parseFloat(rate || 0) / 100).toFixed(4));
  };
  
  const handleCellEdit = async (rowId, field, newValue) => {
    try {
      const numValue = parseFloat(newValue);
      if (isNaN(numValue) || numValue < 0) {
        alert('请输入有效的数字');
        setEditingCell(null);
        return;
      }
      
      if (field === 'settlement_count') {
        // 对于利息次数，存储在备注字段中
        const { error } = await supabase
          .from('transactions')
          .update({ remark: `利息次数:${Math.round(numValue)}` })
          .eq('id', rowId);
        
        if (error) throw error;
      } else {
        // 其他字段正常更新
        const { error } = await supabase
          .from('transactions')
          .update({ [field]: numValue })
          .eq('id', rowId);
        
        if (error) throw error;
      }
      
      setEditingCell(null);
    } catch (e) {
      alert('更新失败: ' + e.message);
      setEditingCell(null);
    }
  };

  const getProductTypeLabel = (row) => {
    if (row.type === 'deposit') {
      if (row.product_type === 'risk') return t('riskDeposit');
      if (row.product_type === 'risk5') return t('riskDeposit5');
      return t('normalDeposit');
    } else if (row.type === 'loan') {
      return row.product_type === 'stable' ? t('stableLoan') : t('interestLoan');
    }
    return '';
  };

  return (
    <div className="bg-white shadow-sm border border-green-200 overflow-hidden">
      <div className="bg-green-50 px-6 py-4 border-b border-green-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${color}-700`} /> <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t('settlementCycles')}:</span>
          <span className="bg-white text-gray-700 border border-gray-200 text-xs px-2 py-1 rounded">{interestRecords.length}</span>
          {isAdmin && onDeleteAll && data.length > 0 && (
            <button 
              onClick={onDeleteAll}
              className="ml-4 bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded text-xs font-medium transition-colors border border-red-300"
            >
              删除所有
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('status')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('type')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('clientLabel')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('productType')}</th>
              <th className="px-1.5 py-1.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{t('amountLabel')}</th>
              <th className="px-1.5 py-1.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">周利息</th>
              <th className="px-1.5 py-1.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">次数</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">日期</th>
              {isAdmin && <th className="px-1.5 py-1.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">操作</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => {
              const isInterestRecord = ['interest_income', 'interest_expense'].includes(row.type);
              const isIncome = row.type === 'interest_income';
              const weeklyInterest = applyInterest && !isInterestRecord && !row.type.includes('withdraw')
                ? calculateWeeklyInterest(row.principal, row.rate)
                : 0;

              const productTypeLabel = getProductTypeLabel(row);

              const rowTime = row.timestamp ? new Date(row.timestamp) : null;
              // 先尝试从 remark 中解析 settlement_count，如果没有则计算
              let cyclesForRow = 0;
              if (row.remark && row.remark.includes('利息次数:')) {
                const match = row.remark.match(/利息次数:(\d+)/);
                cyclesForRow = match ? parseInt(match[1]) : 0;
              } else {
                cyclesForRow = (applyInterest && rowTime)
                  ? interestRecords.filter(r => {
                      if (!r.timestamp) return false;
                      const rt = new Date(r.timestamp);
                      return rt >= rowTime;
                    }).length
                  : 0;
              }

              const totalAmount = isInterestRecord
                ? parseFloat(row.principal || 0)
                : (row.type.includes('withdraw')
                  ? parseFloat(row.principal || 0)
                  : (parseFloat(row.principal || 0) + weeklyInterest * cyclesForRow));

              const showActions = openActionsId === row.id;
              
              // 判断是否正在编辑金额单元格
              const isEditingPrincipal = editingCell?.id === row.id && editingCell?.field === 'principal';
              const isEditingCycles = editingCell?.id === row.id && editingCell?.field === 'settlement_count';
              
              return (
                <tr key={row.id} className={`hover:bg-gray-50 text-xs ${isInterestRecord ? (isIncome ? 'bg-green-50' : 'bg-orange-50') : ''}`}>
                  <td className="px-1.5 py-1.5 whitespace-nowrap">{row.status === 'pending' ? <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-xs">{t('pending')}</span> : row.status === 'rejected' ? <span className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">{t('rejected')}</span> : <span className="text-green-600 bg-green-50 px-1 py-0.5 rounded text-xs">{t('effective')}</span>}</td>
                  <td className={`px-1.5 py-1.5 font-bold whitespace-nowrap ${isIncome ? 'text-green-700' : 'text-orange-700'}`}>{getLocalizedTypeLabel(row.type)}</td>
                  <td className="px-1.5 py-1.5 font-medium truncate max-w-xs">{row.client}</td>
                  <td className="px-1.5 py-1.5 text-xs whitespace-nowrap"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded inline-block text-xs">{productTypeLabel}</span></td>
                  <td className={`px-1.5 py-1.5 text-right font-mono font-bold whitespace-nowrap ${isIncome ? 'text-green-600' : (row.type.includes('withdraw') ? 'text-red-600' : 'text-gray-800')}`}>
                    {isAdmin && !isInterestRecord ? (
                      isEditingPrincipal ? (
                        <input
                          type="number"
                          step="0.001"
                          defaultValue={row.principal}
                          onBlur={(e) => handleCellEdit(row.id, 'principal', e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(row.id, 'principal', e.target.value);
                            }
                          }}
                          autoFocus
                          className="w-20 px-1 py-0.5 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingCell({ id: row.id, field: 'principal', value: row.principal })}
                          className="cursor-pointer hover:bg-blue-100 px-1 rounded"
                          title="点击编辑"
                        >
                          {isIncome ? '+' : (row.type.includes('withdraw') ? '-' : '+')}{(totalAmount || 0).toFixed(3)}m
                        </span>
                      )
                    ) : (
                      <span>{isIncome ? '+' : (row.type.includes('withdraw') ? '-' : '+')}{(totalAmount || 0).toFixed(3)}m</span>
                    )}
                  </td>
                  <td className="px-1.5 py-1.5 text-right font-mono text-xs text-purple-600 whitespace-nowrap">{isInterestRecord ? '-' : (weeklyInterest || 0).toFixed(3) + 'm'}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono text-xs text-gray-600 whitespace-nowrap">
                    {isAdmin && !isInterestRecord ? (
                      isEditingCycles ? (
                        <input
                          type="number"
                          step="1"
                          defaultValue={cyclesForRow}
                          onBlur={(e) => handleCellEdit(row.id, 'settlement_count', e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleCellEdit(row.id, 'settlement_count', e.target.value);
                            }
                          }}
                          autoFocus
                          className="w-12 px-1 py-0.5 border border-blue-300 rounded text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <span 
                          onClick={() => setEditingCell({ id: row.id, field: 'settlement_count', value: cyclesForRow })}
                          className="cursor-pointer hover:bg-blue-100 px-1 rounded"
                          title="点击编辑"
                        >
                          {cyclesForRow}
                        </span>
                      )
                    ) : (
                      <span>{cyclesForRow}</span>
                    )}
                  </td>
                  <td className="px-1.5 py-1.5 text-xs text-gray-500 whitespace-nowrap">{row.timestamp ? row.timestamp.split(' ')[0] : '-'}</td>
                  {isAdmin && <td className="px-1.5 py-1.5 text-center relative">
                    <div className="relative inline-block">
                      <button onClick={() => setOpenActionsId(showActions ? null : row.id)} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200" title="操作">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                      </button>
                      {showActions && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                          <button onClick={() => { onEdit(row); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-indigo-600 flex items-center gap-2">
                            <Edit className="w-3 h-3" /> 编辑
                          </button>
                          {onRepay && row.type === 'loan' && <button onClick={() => { onRepay(row.id); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-blue-600">
                            还款
                          </button>}
                          <button onClick={() => { onDelete(row.id); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">
                            <Trash2 className="w-3 h-3" /> 删除
                          </button>
                        </div>
                      )}
                    </div>
                  </td>}
                </tr>
              );
            })}
            {data.length === 0 && <tr><td colSpan={isAdmin ? "9" : "8"} className="px-6 py-4 text-center text-gray-400">{t('noData')}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ReplyItem 组件 - 递归渲染评论和嵌套回复
const ReplyItem = ({ reply, postId, currentUser, isAdmin, replyingTo, setReplyingTo, onDelete, depth = 0, expandedReplies, setExpandedReplies }) => {
  const [replyContent, setReplyContent] = React.useState('');
  const t = (key) => translations['zh']?.[key] || key;
  
  const canDelete = isAdmin || reply.author === currentUser.username;
  const replyKey = `${postId}-${reply.id}`;
  const isReplying = replyingTo?.postId === postId && replyingTo?.replyId === reply.id;
  
  const handleReplySubmit = async () => {
    if (!replyContent.trim()) return;
    
    try {
      const { data: posts } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();
      
      if (!posts) throw new Error('帖子不存在');
      
      const newReply = {
        id: Date.now(),
        author: currentUser.username,
        content: replyContent,
        timestamp: new Date().toISOString(),
        parentId: reply.id,
        replies: []
      };
      
      const updatedReplies = addNestedReply(posts.replies || [], reply.id, newReply);
      
      const { error } = await supabase
        .from('posts')
        .update({ replies: updatedReplies })
        .eq('id', postId);
      
      if (error) throw error;
      
      setReplyingTo(null);
      setReplyContent('');
      window.location.reload();
    } catch (e) {
      console.error('回复失败:', e);
    }
  };
  
  const addNestedReply = (replies, parentId, newReply) => {
    return replies.map(r => {
      if (r.id === parentId) {
        return {
          ...r,
          replies: [...(r.replies || []), newReply]
        };
      } else if (r.replies && r.replies.length > 0) {
        return {
          ...r,
          replies: addNestedReply(r.replies, parentId, newReply)
        };
      }
      return r;
    });
  };
  
  return (
    <div className={`${depth > 0 ? 'ml-6 mt-3' : ''}`}>
      <div className="bg-gray-50 p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <span className="font-medium text-sm text-indigo-600">{reply.author}</span>
            <span className="text-xs text-gray-400">{new Date(reply.timestamp).toLocaleString('zh-CN')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReplyingTo({ postId, replyId: reply.id })}
              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 inline" /> 回复
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(postId, reply.id)}
                className="text-xs text-gray-400 hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-700">
          {(() => {
            const replyKey = `${postId}-${reply.id}`;
            const isExpanded = expandedReplies.has(replyKey);
            const lines = reply.content.split('\n');
            const shouldTruncate = lines.length > 4;
            const displayContent = isExpanded ? reply.content : lines.slice(0, 4).join('\n');
            return (
              <>
                <div>{displayContent}</div>
                {shouldTruncate && (
                  <button
                    onClick={() => {
                      const newExpanded = new Set(expandedReplies);
                      if (newExpanded.has(replyKey)) newExpanded.delete(replyKey);
                      else newExpanded.add(replyKey);
                      setExpandedReplies(newExpanded);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 font-medium text-xs mt-1"
                  >
                    {isExpanded ? '收起' : '查看全文'}
                  </button>
                )}
              </>
            );
          })()}
        </div>
        
        {/* 回复输入框 */}
        {isReplying && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="写下你的回复..."
              className="flex-1 border border-green-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleReplySubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> 回复
            </button>
          </div>
        )}
      </div>
      
      {/* 嵌套回复 */}
      {reply.replies && reply.replies.length > 0 && (
        <div className="space-y-2">
          {reply.replies.map(nestedReply => (
            <ReplyItem
              key={nestedReply.id}
              reply={nestedReply}
              postId={postId}
              currentUser={currentUser}
              isAdmin={isAdmin}
              replyingTo={replyingTo}
              setReplyingTo={setReplyingTo}
              onDelete={onDelete}
              depth={depth + 1}
              expandedReplies={expandedReplies}
              setExpandedReplies={setExpandedReplies}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// 使用错误边界包裹App组件
const AppWithErrorBoundary = () => (
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);

export default AppWithErrorBoundary;
