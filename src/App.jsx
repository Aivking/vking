import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Wallet, LogOut, Shield, CheckCircle, XCircle,
  AlertCircle, Trash2, Edit, Lock, ArrowUpRight, ArrowDownLeft, ArrowDownRight, Settings, PlusCircle, MinusCircle, X, MessageSquare, Send, ThumbsUp, TrendingUp, CheckSquare, Users
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from './supabaseClient';

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
      const t = this.props.t || ((k) => k);
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <AlertCircle className="w-8 h-8" />
              <h2 className="text-2xl font-bold">{t('renderError')}</h2>
            </div>
            <p className="text-gray-600 mb-4">
              {t('renderErrorHint')}
            </p>
            <details className="mb-4 text-xs text-gray-500">
              <summary className="cursor-pointer font-medium">{t('errorDetails')}</summary>
              <pre className="mt-2 p-2 bg-gray-50 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {t('reloadPage')}
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

let isConfigured = isSupabaseConfigured;
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
  'loan_repay_request': '还款申请',
  'planet_fund': '星星基金',
  'bank_planet_fund': '划拨银行注星',
  'bank_planet_withdraw': '撤回星星资金',
  'planet_card': '星星名片',
  'bank_asset': '风投项目',
  'bond_issue': '债券发售',
  'bond_subscribe': '债券申购',
  'bond_redeem': '债券赎回',
  'bond_redeem_user': '债券赎回明细',
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
    announcement: '公告',
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
    editShort: '编辑',
    unknown: '未知',
    applicantLabel: '申请人',
    bankFund: '银行基金',
    bankBonds: '银行债券',
    manageInterestRecords: '管理利息记录',
    confirm: '确认',
    realEstate: '风投项目',
    confirmTransfer: '确认转账',
    addFundTx: '添加基金交易记录',
    recordType: '记录类型',
    fundProfit: '基金收益',
    fundLoss: '基金损失',
    amountM: '金额 (m单位)',
    amountPlaceholder01: '请输入金额（如：0.1）',
    remarkLabel: '备注说明',
    remarkPlaceholderOptional: '请输入备注说明（可选）',
    willIncreaseFundProfit: '将增加基金收益',
    willRecordFundLoss: '将记录基金损失',
    confirmAdd: '确认添加',
    fundSubscribeRequest: '基金申购申请',
    fundRedeemRequest: '基金赎回申请',
    fundDividendWithdrawRequest: '提取分红申请',
    amountPlaceholder0100: '请输入金额（如：0.100）',
    submitWillEnterApproval: '提交后将进入管理员审批队列。',
    submitRequest: '提交申请',
    manageInterestTitle: '管理利息记录',
    titlePlaceholder: '请输入标题...',
    contentPlaceholder: '写下你想说的...',
    bondsTitle: '银行债券',
    bondsSubtitle: '管理员发售债券，成员申购（申购需审批）',
    issueBond: '发售债券',
    myBondHolding: '我的债券持仓（已审批）',
    bondSubscribeOccupyNote: '申购会占用你的存款可用额度',
    onSaleBonds: '在售债券',
    productCount: '共 {count} 个产品',
    noOnSaleBonds: '暂无在售债券',
    longTerm: '长期',
    shortTerm: '短期',
    termLabel: '期限',
    rateLabelPerWeek: '利率',
    issueLabel: '发行',
    soldLabel: '已售',
    remainingLabel: '剩余',
    endIssue: '发行结束',
    redeemAll: '全额赎回',
    subscribe: '申购',
    bondBillsPublic: '债券账单（全员可见）',
    billCount: '共 {count} 条',
    noBills: '暂无账单记录',
    bondEditTitle: '编辑债券',
    bondName: '债券名称',
    category: '类型',
    termDays: '期限(天)',
    ratePerWeek: '总利率(%)',
    totalSupplyM: '发行额度(m)',
    saveChanges: '保存修改',
    createBondTitle: '发售债券',
    createBondSubtitle: '创建长期/短期债券产品',
    createAndIssue: '创建并发售',
    subscribeBondTitle: '申购债券',
    subscribeAmountM: '申购金额(m)',
    requiresApproval: '提交后需管理员审批',
    submitSubscribe: '提交申购',
    billTime: '时间',
    billType: '类型',
    billUser: '用户',
    billBond: '债券',
    billAmount: '金额',
    billStatus: '状态',

    fundPageTitle: '银行基金',
    fundPageSubtitle: '独立的基金投资管理系统',
    fundAccountTitle: '基金账户',
    fundBalanceLabel: '基金余额',
    bankBalanceLabel: '银行余额',
    totalProfitLabel: '总收益',
    transferBankToFund: '银行转基金',
    transferFundToBank: '基金转银行',
    transferAmountLabel: '转账金额 (m单位)',
    transferAmountPlaceholder: '请输入转账金额（如：0.1）',
    transferHintIn: '将从银行闲置资金转出，银行可用闲置资金：{amount}',
    transferHintOut: '将从基金账户转出，基金可用余额：{amount}',
    noPlanetCards: '暂无星星名片',
    noSettlementRecords: '暂无利息结算记录',
    settlementPrefix: '结算',
    settlementTime: '时间',
    settlementCountLabel: '记录数',
    incomeLabel: '收入',
    expenseLabel: '支出',
    netProfitLabel: '净利',
    yieldRateLabel: '收益率',
    interestSettlementManageTitle: '利息结算记录管理',
    settlementIdLabel: '结算周期 ID',
    confirmDeleteSettlement: '确认删除结算周期的 {count} 条记录？此操作不可撤销！',
    deleteSuccess: '删除成功！',
    deleteFailed: '删除失败',
    bankFundRecords: '银行资金记录',
    transferIn: '转入',
    transferOut: '转出',
    noBankFundRecords: '暂无银行资金记录',
    fundStatsHint: '基金 + 银行 + 收益统计',
    profitLossRecords: '基金盈亏记录',
    profit: '收益',
    loss: '损失',
    noProfitLossRecords: '暂无盈亏记录',
    addRecord: '添加记录',
    doneSelect: '完成选择',
    batchSelect: '批量选择',
    deleteSelected: '删除选中',
    confirmDeleteSelected: '确定要删除选中的 {count} 条记录吗？此操作不可撤销！',
    selectRecordsToDelete: '请先选择要删除的记录',
    batchDeleteFailed: '批量删除失败',
    batchDeleteSuccess: '成功删除 {count} 条记录！',
    fundActionsTitle: '基金操作',
    fundActionsHint: '该区域为普通用户申购/赎回入口',
    fundTransactionsTitle: '基金交易记录',
    subscribeFund: '申购',
    redeemFund: '赎回',
    withdrawDividend: '提取分红',
    clickToEdit: '点击编辑',
    fundTxUpdated: '交易记录更新成功！',
    updateFailed: '更新失败',
    validAmountRequired: '请输入有效金额',
    permissionDeniedAdminOnly: '权限不足：只有管理员可以执行此操作',
    bankIdleInsufficient: '银行闲置资金不足。可用：{available}，尝试：{attempt}',
    fundBalanceInsufficient: '基金余额不足。可用：{available}，尝试：{attempt}',
    transferSuccess: '转账成功！',
    transferFailed: '转账失败',
    confirmDeleteTx: '确定要删除这条交易记录吗？',
    fundTxDeleted: '交易记录删除成功！',
    fundTxAdded: '交易记录添加成功！',
    addFailed: '添加失败',
    fundProfitRemark: '基金收益',
    fundLossRemark: '基金损失',
    fundOperationsTitle: '基金操作',
    requiresAdminApproval: '提交后需管理员审批',
    subscribedPrincipal: '申购本金',
    estimatedProfit: '预估收益',
    bondUnavailable: '该债券已结束发行或已删除，无法继续申购',
    adminOnlyRedeemAll: '权限不足：只有管理员可以全额赎回',
    bondNotFound: '未找到债券记录',
    renderError: '渲染出错',
    renderErrorHint: '页面渲染时发生了错误，请刷新页面重试。',
    errorDetails: '错误详情',
    reloadPage: '刷新页面',
    confirmDeleteRecordServer: '确认从服务器永久删除此记录？',
    confirmRepayLoan: '确认还款此笔贷款？',
    confirmRepayRequest: '确认提交还款申请？管理员审批后贷款账单将消失。',
    repayPending: '还款申请中',
    repayAlreadyPending: '该笔贷款已有待审批的还款申请',
    confirmEndBondIssue: '确认结束该债券发行？结束后将无法继续申购，但已申购持仓会保留。',
    endBondIssueFailed: '结束发行失败',
    confirmRedeemAllBond: '确认全额赎回该债券？将结束发行并取消所有人的持仓（删除所有相关申购记录）。',
    redeemAllBondFailed: '全额赎回失败',
    adminOnlyBondEdit: '权限不足：只有管理员可以编辑债券',
    adminOnlyBondDelete: '权限不足：只有管理员可以删除债券',
    adminOnlyBondIssue: '权限不足：只有管理员可以发售债券',
    bondNameRequired: '请输入债券名称',
    bondTermInvalid: '请输入有效期限',
    bondRateInvalid: '请输入有效利率',
    bondSupplyInvalid: '请输入有效发行额度',
    bondUpdateFailed: '更新失败',
    confirmDeleteBondIssue: '确认删除此债券发售？将同时删除所有相关持仓/申购记录。',
    deleteBondFailed: '删除失败',
    announcementUpdateFailed: '更新公告失败',
    starCardCreated: '星星名片创建成功',
    starCardSubmitted: '星星名片申请已提交，等待管理员审批',
    createFailed: '创建失败',
    starCardUpdated: '名片更新成功',
    submitFailed: '提交失败',
    assetRegistered: '风投项目登记成功',
    registerFailed: '登记失败',
    assetUpdated: '风投项目更新成功',
    settleFailed: '结算失败',
    fundPrincipalZeroCannotSettle: '基金本金为 0，无法结算',
    fundDividendSettled: '分红结算完成：{count}人，总额 {amount}',
    invalidNumber: '请输入有效的数字',
    confirmDeleteReply: '确认删除此评论？',
    confirmDeletePost: '确认删除此帖子？',
    confirmDeleteAllBills: '确认永久删除此账户的所有账单？此操作不可撤销！',
    confirmDeleteAssetRecord: '确认删除此风投项目记录？',
    bondTermRemark: '期限:{days}天',
    bondSubscribeRemark: 'issue_id:{id} 期限:{days}天',
    interestCountPrefix: '利息次数',
    authUserExists: '该用户名已被注册',
    authReservedAccount: 'EUU 是保留账号',
    authRegisterFailed: '注册失败，服务器连接异常',
    collapse: '收起',
    viewFull: '查看全文',
    postNotFound: '帖子不存在',
    weeklyInterestLabel: '周利息',
    cyclesLabel: '次数',
    dateLabel: '日期',
    deleteAll: '删除所有',
    appNotConnectedTitle: '应用尚未连接至数据库',
    appNotConnectedHint: '未检测到 Supabase 环境变量。可在本地 .env.local 或部署平台（如 Vercel）中配置。',
    appNotConnectedVarsHint: '# 请添加以下变量（本地 .env.local，或 Vercel Project Settings -> Environment Variables）：',
    appNotConnectedRedeployHint: '配置完成后：本地请重启 npm run dev；线上请重新部署。',
    fixedRateHint: '💡 固定 3%，不允许更改',
    langChinese: '中文',
    clientPlaceholderText: '输入客户或对象名称',
    injectionShort: '注资',
    depositShort: '存款',
    fundShort: '基金',
    fundTransferTitle: '资金转账',
    settleDividends: '结算分红',
    amountInputPlaceholder: '输入金额...',
    fundTransferPermissionHint: '只有管理员可以进行基金转账操作',
    noDividendToSettle: '暂无可结算分红',
    noHoldersToSettle: '暂无持仓用户，无法结算',
    noDescription: '暂无描述',
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
    // 风投项目
    bankAssets: '风投项目',
    assetManagement: '项目管理',
    planetNameAsset: '项目名称',
    dailyOutput: '每日产出',
    itemName: '物品名称',
    quantity: '日产',
    assetValue: '项目估值',
    registerAsset: '登记项目',
    assetList: '项目列表',
    totalAssetValue: '风投总估值',
    newAsset: '新增项目',
    itemPlaceholder: '输入物品名称...',
    quantityPlaceholder: '输入日产量...',
    valuePlaceholder: '输入项目估值(m)...',
    submitAsset: '提交项目登记',
    noAssetsYet: '暂无项目记录',
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
    forceSettle: '强制结算',
    dailyProfit: '日利润',
    operatorName: '运营人',
    dailyProfitPlaceholder: '输入日利润(m)...',
    operatorNamePlaceholder: '输入运营人名称...',
    settleCountdownLabel: '结算倒计时',
    alreadySettledToday: '今日已结算，已跳过。若需重复结算请使用“强制结算”。',
    forceSettleConfirm1: '将跳过今日重复检查并立即结算，是否继续？',
    forceSettleConfirm2: '请再次确认：本操作会新增一批利息记录，继续吗？',
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
    accountList: '账户列表',
    openAccountList: '打开账户列表',
    searchByName: '搜索名称',
    searchAccountPlaceholder: '输入账号名称...',
    noAccountsFound: '未找到匹配账户',
    roleAdmin: '管理员',
    roleFundManager: '基金管理员',
    roleUser: '普通账户',
    roleLiuliMember: '琉璃成员',
    grantLiuliMember: '授予琉璃成员',
    revokeLiuliMember: '取消琉璃成员',
    memberGranted: '已授予琉璃成员资格',
    memberRevoked: '已取消琉璃成员资格',
    membershipUpdateFailed: '成员资格更新失败',
    liuliMemberRequired: '仅琉璃成员可使用成员理财 (9%/周)',
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
    announcement: 'Announcement',
    announcementPlaceholder: 'Enter announcement...',
    save: 'Save',
    cancel: 'Cancel',
    editAnnouncement: 'Edit Announcement',
    editShort: 'Edit',
    unknown: 'Unknown',
    applicantLabel: 'Applicant',
    bankFund: 'Bank Fund',
    bankBonds: 'Bank Bonds',
    manageInterestRecords: 'Manage Interest Records',
    confirm: 'Confirm',
    realEstate: 'VC Projects',
    confirmTransfer: 'Confirm Transfer',
    addFundTx: 'Add Fund Transaction',
    recordType: 'Record Type',
    fundProfit: 'Fund Profit',
    fundLoss: 'Fund Loss',
    amountM: 'Amount (m)',
    amountPlaceholder01: 'Enter amount (e.g., 0.1)',
    remarkLabel: 'Remark',
    remarkPlaceholderOptional: 'Enter remark (optional)',
    willIncreaseFundProfit: 'Will increase fund profit',
    willRecordFundLoss: 'Will record fund loss',
    confirmAdd: 'Confirm Add',
    fundSubscribeRequest: 'Fund Subscription Request',
    fundRedeemRequest: 'Fund Redemption Request',
    fundDividendWithdrawRequest: 'Dividend Withdrawal Request',
    amountPlaceholder0100: 'Enter amount (e.g., 0.100)',
    submitWillEnterApproval: 'After submission, it will enter the admin approval queue.',
    submitRequest: 'Submit Request',
    manageInterestTitle: 'Manage Interest Records',
    titlePlaceholder: 'Enter title...',
    contentPlaceholder: 'Write what you want to say...',
    bondsTitle: 'Bank Bonds',
    bondsSubtitle: 'Admin issues bonds, members subscribe (requires approval)',
    issueBond: 'Issue Bond',
    myBondHolding: 'My Bond Holdings (Approved)',
    bondSubscribeOccupyNote: 'Subscriptions occupy your available deposit balance',
    onSaleBonds: 'On-sale Bonds',
    productCount: '{count} products',
    noOnSaleBonds: 'No bonds on sale',
    longTerm: 'Long-term',
    shortTerm: 'Short-term',
    termLabel: 'Term',
    rateLabelPerWeek: 'Rate',
    issueLabel: 'Issued',
    soldLabel: 'Sold',
    remainingLabel: 'Remaining',
    endIssue: 'End Issue',
    redeemAll: 'Redeem All',
    subscribe: 'Subscribe',
    bondBillsPublic: 'Bond Ledger (Public)',
    billCount: '{count} records',
    noBills: 'No records',
    bondEditTitle: 'Edit Bond',
    bondName: 'Bond Name',
    category: 'Category',
    termDays: 'Term (days)',
    ratePerWeek: 'Total Rate (%)',
    totalSupplyM: 'Total Supply (m)',
    saveChanges: 'Save Changes',
    createBondTitle: 'Issue Bond',
    createBondSubtitle: 'Create long/short bond product',
    createAndIssue: 'Create & Issue',
    subscribeBondTitle: 'Subscribe Bond',
    subscribeAmountM: 'Amount (m)',
    requiresApproval: 'Requires admin approval',
    submitSubscribe: 'Submit Subscription',
    billTime: 'Time',
    billType: 'Type',
    billUser: 'User',
    billBond: 'Bond',
    billAmount: 'Amount',
    billStatus: 'Status',

    fundPageTitle: 'Bank Fund',
    fundPageSubtitle: 'Independent fund investment management system',
    fundAccountTitle: 'Fund Account',
    fundBalanceLabel: 'Fund Balance',
    bankBalanceLabel: 'Bank Balance',
    totalProfitLabel: 'Total Profit',
    transferBankToFund: 'Bank → Fund',
    transferFundToBank: 'Fund → Bank',
    transferAmountLabel: 'Transfer Amount (m)',
    transferAmountPlaceholder: 'Enter transfer amount (e.g., 0.1)',
    transferHintIn: 'Will transfer out from bank idle funds. Available idle funds: {amount}',
    transferHintOut: 'Will transfer out from fund account. Available fund balance: {amount}',
    noPlanetCards: 'No star cards yet',
    noSettlementRecords: 'No interest settlement records',
    settlementPrefix: 'Settlement',
    settlementTime: 'Time',
    settlementCountLabel: 'Records',
    incomeLabel: 'Income',
    expenseLabel: 'Expense',
    netProfitLabel: 'Net',
    yieldRateLabel: 'Yield Rate',
    interestSettlementManageTitle: 'Interest Settlement Records',
    settlementIdLabel: 'Settlement ID',
    confirmDeleteSettlement: 'Delete {count} records in this settlement? This cannot be undone.',
    deleteSuccess: 'Deleted successfully!',
    deleteFailed: 'Delete failed',
    bankFundRecords: 'Bank Fund Records',
    transferIn: 'In',
    transferOut: 'Out',
    noBankFundRecords: 'No bank fund records',
    fundStatsHint: 'Fund + Bank + Profit Stats',
    profitLossRecords: 'Fund P/L Records',
    profit: 'Profit',
    loss: 'Loss',
    noProfitLossRecords: 'No P/L records',
    addRecord: 'Add Record',
    doneSelect: 'Done',
    batchSelect: 'Batch Select',
    deleteSelected: 'Delete Selected',
    confirmDeleteSelected: 'Delete selected {count} records? This cannot be undone.',
    selectRecordsToDelete: 'Please select records to delete first',
    batchDeleteFailed: 'Batch delete failed',
    batchDeleteSuccess: 'Deleted {count} records successfully!',
    fundActionsTitle: 'Fund Actions',
    fundActionsHint: 'This area is for user subscribe/redeem actions',
    fundTransactionsTitle: 'Fund Transactions',
    subscribeFund: 'Subscribe',
    redeemFund: 'Redeem',
    withdrawDividend: 'Withdraw Dividend',
    clickToEdit: 'Click to edit',
    fundTxUpdated: 'Transaction updated successfully!',
    updateFailed: 'Update failed',
    validAmountRequired: 'Please enter a valid amount',
    permissionDeniedAdminOnly: 'Permission denied: admin only',
    bankIdleInsufficient: 'Insufficient bank idle funds. Available: {available}, Attempt: {attempt}',
    fundBalanceInsufficient: 'Insufficient fund balance. Available: {available}, Attempt: {attempt}',
    transferSuccess: 'Transfer successful!',
    transferFailed: 'Transfer failed',
    confirmDeleteTx: 'Delete this transaction record?',
    fundTxDeleted: 'Transaction deleted successfully!',
    fundTxAdded: 'Transaction added successfully!',
    addFailed: 'Add failed',
    fundProfitRemark: 'Fund profit',
    fundLossRemark: 'Fund loss',
    fundOperationsTitle: 'Fund Actions',
    requiresAdminApproval: 'Requires admin approval',
    subscribedPrincipal: 'Subscribed Principal',
    estimatedProfit: 'Estimated Profit',
    bondUnavailable: 'This bond is no longer available for subscription.',
    adminOnlyRedeemAll: 'Permission denied: admin only',
    bondNotFound: 'Bond record not found',
    renderError: 'Render Error',
    renderErrorHint: 'An error occurred while rendering. Please refresh the page and try again.',
    errorDetails: 'Error Details',
    reloadPage: 'Reload Page',
    confirmDeleteRecordServer: 'Permanently delete this record from server?',
    confirmRepayLoan: 'Confirm repayment for this loan?',
    confirmRepayRequest: 'Submit repayment request? The loan will disappear after admin approval.',
    repayPending: 'Repay Pending',
    repayAlreadyPending: 'A repayment request for this loan is already pending',
    confirmEndBondIssue: 'End this bond issuance? Subscriptions will be disabled, existing holdings remain.',
    endBondIssueFailed: 'End issuance failed',
    confirmRedeemAllBond: 'Redeem all for this bond? It will end issuance and cancel all holdings.',
    redeemAllBondFailed: 'Redeem all failed',
    adminOnlyBondEdit: 'Permission denied: admin only',
    adminOnlyBondDelete: 'Permission denied: admin only',
    adminOnlyBondIssue: 'Permission denied: admin only',
    bondNameRequired: 'Please enter bond name',
    bondTermInvalid: 'Please enter a valid term',
    bondRateInvalid: 'Please enter a valid rate',
    bondSupplyInvalid: 'Please enter a valid total supply',
    bondUpdateFailed: 'Update failed',
    confirmDeleteBondIssue: 'Delete this bond issue? It will also cancel all related holdings/subscriptions.',
    deleteBondFailed: 'Delete failed',
    announcementUpdateFailed: 'Update announcement failed',
    starCardCreated: 'Star card created successfully',
    starCardSubmitted: 'Star card request submitted. Waiting for admin approval.',
    createFailed: 'Create failed',
    starCardUpdated: 'Card updated successfully',
    submitFailed: 'Submit failed',
    assetRegistered: 'VC project registered successfully',
    registerFailed: 'Register failed',
    assetUpdated: 'VC project updated successfully',
    settleFailed: 'Settlement failed',
    fundPrincipalZeroCannotSettle: 'Fund principal is 0. Cannot settle.',
    fundDividendSettled: 'Dividend settlement completed: {count} users, total {amount}',
    invalidNumber: 'Please enter a valid number',
    confirmDeleteReply: 'Delete this comment?',
    confirmDeletePost: 'Delete this post?',
    confirmDeleteAllBills: 'Permanently delete all bills in this account? This cannot be undone.',
    confirmDeleteAssetRecord: 'Delete this VC project record?',
    bondTermRemark: 'Term:{days}d',
    bondSubscribeRemark: 'issue_id:{id} Term:{days}d',
    interestCountPrefix: 'Interest Count',
    authUserExists: 'Username already registered',
    authReservedAccount: 'EUU is a reserved account',
    authRegisterFailed: 'Registration failed due to server connection error',
    collapse: 'Collapse',
    viewFull: 'View full',
    postNotFound: 'Post not found',
    weeklyInterestLabel: 'Weekly Interest',
    cyclesLabel: 'Cycles',
    dateLabel: 'Date',
    deleteAll: 'Delete All',
    appNotConnectedTitle: 'App is not connected to the database',
    appNotConnectedHint: 'Supabase environment variables are missing. Configure them in local .env.local or on a deployment platform (e.g., Vercel).',
    appNotConnectedVarsHint: '# Add the following variables (local .env.local, or Vercel Project Settings -> Environment Variables):',
    appNotConnectedRedeployHint: 'After configuration: restart npm run dev locally, or redeploy in production.',
    fixedRateHint: '💡 Fixed at 3%, cannot be changed',
    langChinese: '中文',
    clientPlaceholderText: 'Enter client or target name',
    injectionShort: 'Injection',
    depositShort: 'Deposit',
    fundShort: 'Fund',
    fundTransferTitle: 'Fund Transfers',
    settleDividends: 'Settle Dividends',
    amountInputPlaceholder: 'Enter amount...',
    fundTransferPermissionHint: 'Only admins can perform fund transfers',
    noDividendToSettle: 'No dividends to settle',
    noHoldersToSettle: 'No holders, cannot settle',
    noDescription: 'No description',
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
    // VC Projects
    bankAssets: 'VC Projects',
    assetManagement: 'Project Management',
    planetNameAsset: 'Project Name',
    assetValue: 'Project Valuation',
    registerAsset: 'Register Project',
    assetList: 'Project List',
    totalAssetValue: 'Total VC Valuation',
    newAsset: 'New Project',
    valuePlaceholder: 'Enter project valuation (m)...',
    submitAsset: 'Submit Project Registration',
    noAssetsYet: 'No project records',
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
    forceSettle: 'Force Settle',
    dailyProfit: 'Daily Profit',
    operatorName: 'Operator',
    dailyProfitPlaceholder: 'Enter daily profit (m)...',
    operatorNamePlaceholder: 'Enter operator name...',
    settleCountdownLabel: 'Settle Countdown',
    alreadySettledToday: 'Already settled today. Use Force Settle to run again.',
    forceSettleConfirm1: 'This will bypass today duplicate check and settle now. Continue?',
    forceSettleConfirm2: 'Please confirm again: this will add a new batch of interest records. Continue?',
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
    accountList: 'Account List',
    openAccountList: 'Open Account List',
    searchByName: 'Search Name',
    searchAccountPlaceholder: 'Enter account name...',
    noAccountsFound: 'No matching accounts',
    roleAdmin: 'Admin',
    roleFundManager: 'Fund Manager',
    roleUser: 'Regular Account',
    roleLiuliMember: 'Liuli Member',
    grantLiuliMember: 'Grant Liuli Member',
    revokeLiuliMember: 'Revoke Liuli Member',
    memberGranted: 'Liuli membership granted',
    memberRevoked: 'Liuli membership revoked',
    membershipUpdateFailed: 'Membership update failed',
    liuliMemberRequired: 'Only Liuli members can use Member Wealth (9%/week)',
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
      'deposit_interest': 'Deposit Interest',
      'loan_interest': 'Loan Interest',
      'loan_repayment': 'Repayment',
      'loan_repay_request': 'Repay Request',
      'interest_income': 'Interest Income',
      'interest_expense': 'Interest Expense',
      'planet_fund': 'Star Fund',
      'bank_planet_fund': 'Bank→Star Transfer',
      'bank_planet_withdraw': 'Star→Bank Recall',
      'planet_card': 'Star Card',
      'bank_asset': 'VC Project',
      'bond_issue': 'Bond Issue',
      'bond_subscribe': 'Bond Subscribe',
      'bond_redeem': 'Bond Redeem',
      'bond_redeem_user': 'Bond Redeem Detail',
      'fund_subscribe': 'Fund Subscribe',
      'fund_redeem': 'Fund Redeem',
      'fund_dividend': 'Fund Dividend',
      'fund_dividend_withdraw': 'Fund Dividend Withdraw',
      'fund_profit_withdraw': 'Fund Profit Withdraw',
      'fund_profit': 'Fund Profit',
      'fund_loss': 'Fund Loss',
      'bank_fund': 'Bank ↔ Fund Transfer'
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
  const [forceSettleConfirmStep, setForceSettleConfirmStep] = useState(0);
  const [nextSettleTime, setNextSettleTime] = useState('');
  const [settleCountdown, setSettleCountdown] = useState('');
  const [showRiskEligibilityHint, setShowRiskEligibilityHint] = useState(false);
  const [accountListModalOpen, setAccountListModalOpen] = useState(false);
  const [accountSearch, setAccountSearch] = useState('');
  const [updatingMemberUserId, setUpdatingMemberUserId] = useState(null);
  
  const [bankAnnouncement, setBankAnnouncement] = useState({ id: '', content: '' });
  const [isEditingBankAnnouncement, setIsEditingBankAnnouncement] = useState(false);
  const [bankAnnouncementInput, setBankAnnouncementInput] = useState('');

  const [fundAnnouncement, setFundAnnouncement] = useState({ id: '', content: '' });
  const [isEditingFundAnnouncement, setIsEditingFundAnnouncement] = useState(false);
  const [fundAnnouncementInput, setFundAnnouncementInput] = useState('');

  const [assetsAnnouncement, setAssetsAnnouncement] = useState({ id: '', content: '' });
  const [isEditingAssetsAnnouncement, setIsEditingAssetsAnnouncement] = useState(false);
  const [assetsAnnouncementInput, setAssetsAnnouncementInput] = useState('');
  
  // 论坛 State
  const [currentPage, setCurrentPage] = useState('bank'); // 'bank', 'loans', 'forum', 'planet', 'assets', 'fund', 'bonds'
  const [expandedPosts, setExpandedPosts] = useState(new Set()); // 展开的帖子ID

  const [liuliFlights, setLiuliFlights] = useState([]);
  const [liuliProducts, setLiuliProducts] = useState([]);
  const [liuliFlightForm, setLiuliFlightForm] = useState({ name: '', from: '', to: '', note: '', roundTrip: false, returnFrom: '', returnTo: '', returnNote: '', shipType: 'SCB' });
  const [liuliProductForm, setLiuliProductForm] = useState({ name: '', itemName: '', perDay: '', pickup: '', note: '' });
  const [liuliMaterialDemandForm, setLiuliMaterialDemandForm] = useState({
    applicant: '',
    items: [{ materialName: '', quantity: '' }],
    note: ''
  });
  const [liuliMaterialDemandXitInput, setLiuliMaterialDemandXitInput] = useState('');
  const [liuliMaterialSupplyForm, setLiuliMaterialSupplyForm] = useState({
    producer: '',
    items: [{ materialName: '', perDay: '', unitPrice: '' }],
    pickup: '',
    note: ''
  });

  const [liuliFlightSearch, setLiuliFlightSearch] = useState('');
  const [liuliProductSearch, setLiuliProductSearch] = useState('');
  const [liuliMaterialDemandSearch, setLiuliMaterialDemandSearch] = useState('');
  const [liuliMaterialSupplySearch, setLiuliMaterialSupplySearch] = useState('');
  const [liuliFlightPage, setLiuliFlightPage] = useState(1);
  const [liuliProductPage, setLiuliProductPage] = useState(1);
  const [liuliMaterialDemandPage, setLiuliMaterialDemandPage] = useState(1);
  const [liuliMaterialSupplyPage, setLiuliMaterialSupplyPage] = useState(1);
  const [liuliFlightModal, setLiuliFlightModal] = useState(false);
  const [liuliProductModal, setLiuliProductModal] = useState(false);
  const [liuliMaterialDemandModal, setLiuliMaterialDemandModal] = useState(false);
  const [liuliMaterialSupplyModal, setLiuliMaterialSupplyModal] = useState(false);
  const [liuliActiveTab, setLiuliActiveTab] = useState('flights');

  const parseInterestCountFromRemark = (remark) => {
    if (!remark) return null;
    const prefixes = [
      `${translations.zh?.interestCountPrefix || '利息次数'}:`,
      `${translations.en?.interestCountPrefix || 'Interest cycles'}:`,
      '利息次数:',
      'Interest cycles:'
    ];
    for (const p of prefixes) {
      if (!remark.includes(p)) continue;
      const m = remark.match(new RegExp(`${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\d+)`));
      if (m && m[1] != null) return parseInt(m[1], 10);
    }
    return null;
  };

  const getAccruedInterestForTx = (tx, interestExpenseRecords = []) => {
    if (!tx) return 0;
    const principal = parseFloat(tx.principal) || 0;
    const rate = parseFloat(tx.rate) || 0;
    if (!principal || !rate) return 0;

    const overrideCycles = parseInterestCountFromRemark(tx.remark);
    const txTime = tx.timestamp ? new Date(tx.timestamp) : null;
    const cycles = overrideCycles != null
      ? overrideCycles
      : (txTime
          ? interestExpenseRecords.filter(r => {
              if (!r.timestamp) return false;
              const rt = new Date(r.timestamp);
              return rt >= txTime;
            }).length
          : 0);

    const weekly = principal * rate / 100;
    return weekly * (cycles || 0);
  };

  const parseBankAssetMeta = (tx) => {
    const remark = String(tx?.remark || '');
    const itemMatch = remark.match(/(?:^|\n)itemName:\s*(.*?)(?:\n|$)/i);
    const profitMatch = remark.match(/(?:^|\n)dailyProfit:\s*([+-]?\d*\.?\d+)(?:\n|$)/i);

    const fallbackItem = remark.includes('\n') ? remark.split('\n')[0] : remark;
    const itemName = (itemMatch ? itemMatch[1] : fallbackItem || '').trim();
    const dailyProfit = parseFloat(profitMatch ? profitMatch[1] : 0) || 0;
    const operatorName = String(tx?.product_type || '').trim();

    return { itemName, dailyProfit, operatorName };
  };

  const buildBankAssetRemark = (itemName, dailyProfit) => {
    const cleanItemName = String(itemName || '').trim();
    const profitNum = parseFloat(dailyProfit) || 0;
    return `itemName:${cleanItemName}\ndailyProfit:${profitNum}`;
  };

  const aggregateAccountByClient = (rows, interestExpenseRecords, type, getGroupKey = null) => {
    const map = new Map();
    for (const tx of rows) {
      const clientKey = tx.client || tx.created_by || 'unknown';
      const groupKey = getGroupKey ? getGroupKey(tx, clientKey) : clientKey;
      const prev = map.get(groupKey);
      const principal = parseFloat(tx.principal) || 0;
      const weekly = (parseFloat(tx.principal) || 0) * (parseFloat(tx.rate) || 0) / 100;
      const accrued = getAccruedInterestForTx(tx, interestExpenseRecords);
      if (!prev) {
        map.set(groupKey, {
          ...tx,
          id: `agg-${type}-${groupKey}`,
          client: clientKey,
          source_ids: [tx.id],
          principal_sum: principal,
          weekly_sum: weekly,
          accrued_sum: accrued,
          tx_count: 1,
          product_type: tx.product_type || ''
        });
      } else {
        prev.source_ids = [...(prev.source_ids || []), tx.id];
        prev.principal_sum += principal;
        prev.weekly_sum += weekly;
        prev.accrued_sum += accrued;
        prev.tx_count += 1;
        prev.timestamp = prev.timestamp || tx.timestamp;
        prev.product_type = prev.product_type === (tx.product_type || '') ? prev.product_type : 'mixed';
      }
    }

    return Array.from(map.values()).map(r => {
      const principal = r.principal_sum || 0;
      const rate = principal > 0 ? (r.weekly_sum / principal) * 100 : 0;
      return {
        ...r,
        principal: principal,
        rate: rate
      };
    });
  };

  const getAvailableForClient = (accountType, clientName, productType = null) => {
    const approved = transactions.filter(tx => tx.status === 'approved');
    const interestExpenseRecords = approved.filter(tx => tx.type === 'interest_expense' && (accountType === 'injection'
      ? tx.client === '注资利息支出'
      : tx.client === '存款利息支出'));

    const baseType = accountType;
    const withdrawType = accountType === 'injection' ? 'withdraw_inj' : 'withdraw_dep';

    const principals = approved
      .filter(tx => {
        if (tx.type !== baseType) return false;
        if ((tx.client || tx.created_by) !== clientName) return false;
        if (accountType === 'deposit' && productType) return (tx.product_type || 'normal') === productType;
        return true;
      })
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    const interest = approved
      .filter(tx => {
        if (tx.type !== baseType) return false;
        if ((tx.client || tx.created_by) !== clientName) return false;
        if (accountType === 'deposit' && productType) return (tx.product_type || 'normal') === productType;
        return true;
      })
      .reduce((sum, tx) => sum + getAccruedInterestForTx(tx, interestExpenseRecords), 0);

    const withdrawn = approved
      .filter(tx => {
        if (tx.type !== withdrawType) return false;
        if ((tx.client || tx.created_by) !== clientName) return false;
        if (accountType === 'deposit' && productType) return (tx.product_type || 'normal') === productType;
        return true;
      })
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    // 说明：已实现“撤资/取款会从对应账单扣减本金”的机制。
    // 因此 principals 已经是扣减后的余额，不需要再减 withdrawn，否则会重复扣减。
    let available = principals + interest;

    if (accountType === 'deposit') {
      const bondUsed = approved
        .filter(tx => tx.type === 'bond_subscribe' && tx.created_by === clientName)
        .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
      available -= bondUsed;
    }

    return { principals, interest, withdrawn, available };
  };

  const applyApprovedWithdrawalToBills = async (withdrawTx) => {
    if (!withdrawTx) return;
    const amount = parseFloat(withdrawTx.principal) || 0;
    if (amount <= 0) return;

    const isDepositWithdraw = withdrawTx.type === 'withdraw_dep';
    const baseType = isDepositWithdraw ? 'deposit' : 'injection';
    const clientName = withdrawTx.client || withdrawTx.created_by;
    if (!clientName) return;

    const productType = isDepositWithdraw ? (withdrawTx.product_type || 'normal') : null;

    // 利息支出记录：用于计算每条存款/注资的已结算利息（与账单表格逻辑一致）
    const approvedAll = (transactions || []).filter(t => t.status === 'approved');
    const interestExpenseRecs = approvedAll.filter(t =>
      t.type === 'interest_expense' &&
      t.client === (isDepositWithdraw ? '存款利息支出' : '注资利息支出')
    );

    // 从”已批准”的账单里扣减（优先扣早的）
    const baseBills = approvedAll
      .filter(t => t.type === baseType)
      .filter(t => (t.client || t.created_by) === clientName)
      .filter(t => {
        if (!isDepositWithdraw) return true;
        return (t.product_type || 'normal') === productType;
      })
      .filter(t => parseFloat((parseFloat(t.principal) || 0).toFixed(3)) > 0)
      .slice()
      .sort((a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0));

    let remaining = amount;
    for (const bill of baseBills) {
      if (remaining <= 0.0000001) break;
      const cur = parseFloat(bill.principal) || 0;
      const next = Math.max(0, cur - remaining);
      const nextRounded = parseFloat(next.toFixed(3));
      const deducted = cur - next;
      remaining -= deducted;

      // 该账单的已结算利息（使用与表格相同的计算方式）
      const originalAccrued = getAccruedInterestForTx(bill, interestExpenseRecs);

      if (nextRounded === 0) {
        // 本金完全取走 —— 保留已结算利息（若有）
        const settledInterest = parseFloat(originalAccrued.toFixed(3));
        if (settledInterest > 0) {
          const { error } = await supabase
            .from('transactions')
            .update({ principal: settledInterest, rate: 0, remark: '利息余额（本金已取）' })
            .eq('id', bill.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('transactions')
            .delete()
            .eq('id', bill.id);
          if (error) throw error;
        }
      } else {
        // 本金部分取走 —— 更新剩余本金，并将取走部分对应的利息单独保留
        const { error: updateErr } = await supabase
          .from('transactions')
          .update({ principal: nextRounded })
          .eq('id', bill.id);
        if (updateErr) throw updateErr;

        // 被取走部分的利息 = 原利息 × (取走本金 / 原本金)
        const orphanedInterest = cur > 0
          ? parseFloat((originalAccrued * (cur - nextRounded) / cur).toFixed(3))
          : 0;
        if (orphanedInterest > 0) {
          const { error: insertErr } = await supabase
            .from('transactions')
            .insert([{
              type: baseType,
              client: bill.client || clientName,
              created_by: bill.created_by || clientName,
              creator_id: bill.creator_id || 'system',
              principal: orphanedInterest,
              rate: 0,
              product_type: bill.product_type || '',
              status: 'approved',
              timestamp: bill.timestamp,
              remark: '利息余额（部分取款）'
            }]);
          if (insertErr) throw insertErr;
        }
      }
    }
  };
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
  const [editingFlightId, setEditingFlightId] = useState(null);
  const [editFlightData, setEditFlightData] = useState({ name: '', from: '', to: '', note: '', returnFrom: '', returnTo: '', returnNote: '', shipType: 'SCB' });
  const [editingHoldingId, setEditingHoldingId] = useState(null);
  const [editHoldingData, setEditHoldingData] = useState({ client: '', principal: '', rate: '' });
  const [editingRedeemId, setEditingRedeemId] = useState(null);
  const [editRedeemData, setEditRedeemData] = useState({ client: '', principal: '', rate: '' });
  const [selectedRedeemIds, setSelectedRedeemIds] = useState(new Set());
  const [fundingCardId, setFundingCardId] = useState(null);
  const [fundAmount, setFundAmount] = useState('');
  const [fundSource, setFundSource] = useState('personal'); // 'personal' | 'bank'
  const [withdrawingCardId, setWithdrawingCardId] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [expandedFundingCards, setExpandedFundingCards] = useState({});
  
  // 银行资产 State
  const [bankAssets, setBankAssets] = useState([]);
  const [newAssetModal, setNewAssetModal] = useState(false);
  const [newAssetData, setNewAssetData] = useState({ planetName: '', itemName: '', quantity: '', value: '', dailyProfit: '', operatorName: '' });
  const [editingAssetId, setEditingAssetId] = useState(null);
  const [editAssetData, setEditAssetData] = useState({ planetName: '', itemName: '', quantity: '', value: '', dailyProfit: '', operatorName: '' });
  
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
    total_supply: '1000',
    description: ''
  });
  const [bondSubscribeModal, setBondSubscribeModal] = useState(false);
  const [bondSubscribeTarget, setBondSubscribeTarget] = useState(null);
  const [bondSubscribeAmount, setBondSubscribeAmount] = useState('');
  const [bondSubscribeNote, setBondSubscribeNote] = useState('');

  const [bondEditModal, setBondEditModal] = useState(false);
  const [bondEditTarget, setBondEditTarget] = useState(null);
  const [bondEditData, setBondEditData] = useState({
    name: '',
    category: 'short',
    term_days: '30',
    rate_per_week: '2.0',
    total_supply: '1000',
    description: ''
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

  // 项目人员招募 State
  const [recruitmentPosts, setRecruitmentPosts] = useState([]);
  const [isAddingRecruitment, setIsAddingRecruitment] = useState(false);
  const [recruitmentForm, setRecruitmentForm] = useState({ title: '', description: '', contact: '' });

  // 分类发言区 State
  const [speechData, setSpeechData] = useState({ categories: ['综合', '市场', '建议'], posts: [] });
  const [activeSpeechCategory, setActiveSpeechCategory] = useState('综合');
  const [speechInput, setSpeechInput] = useState('');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [editingFundTxId, setEditingFundTxId] = useState(null);
  const [editingFundTxData, setEditingFundTxData] = useState({ principal: '', rate: '', remark: '' });

  // 利息管理 State
  const [interestManageModal, setInterestManageModal] = useState(false);

  const liuliFlightsForTable = useMemo(() => {
    const approved = (transactions || []).filter(tx => tx.status === 'approved');
    return approved
      .filter(tx => tx.type === 'liuli_flight')
      .map(tx => {
        const remark = String(tx.remark || '');
        const toMatch = remark.match(/(?:^|\n)to:\s*(.*?)(?:\n|$)/i);
        const noteMatch = remark.match(/(?:^|\n)note:\s*([\s\S]*?)(?=\nreturnFrom:|\nreturnTo:|\nreturnNote:|\nshipType:|$)/i);
        const returnFromMatch = remark.match(/(?:^|\n)returnFrom:\s*(.*?)(?:\n|$)/i);
        const returnToMatch = remark.match(/(?:^|\n)returnTo:\s*(.*?)(?:\n|$)/i);
        const returnNoteMatch = remark.match(/(?:^|\n)returnNote:\s*([\s\S]*?)(?=\nshipType:|$)/i);
        const shipTypeMatch = remark.match(/(?:^|\n)shipType:\s*(.*?)(?:\n|$)/i);
        const to = toMatch ? (toMatch[1] || '').trim() : (tx.rate != null ? String(tx.rate) : '');
        const note = (noteMatch ? (noteMatch[1] || '').trim() : remark)
          .replace(/\n?(returnFrom|returnTo|returnNote|shipType):\s*[^\n]*/gi, '').trim();
        const returnFrom = returnFromMatch ? (returnFromMatch[1] || '').trim() : '';
        const returnTo = returnToMatch ? (returnToMatch[1] || '').trim() : '';
        const returnNote = returnNoteMatch ? (returnNoteMatch[1] || '').trim() : '';
        const shipType = shipTypeMatch ? (shipTypeMatch[1] || '').trim() : 'SCB';
        return {
          id: tx.id,
          name: tx.client || '',
          from: tx.product_type || '',
          to,
          note,
          returnFrom,
          returnTo,
          returnNote,
          shipType,
          created_at: tx.timestamp || ''
        };
      });
  }, [transactions]);

  const liuliFlightsFiltered = useMemo(() => {
    const q = (liuliFlightSearch || '').trim().toLowerCase();
    if (!q) return liuliFlightsForTable || [];
    return (liuliFlightsForTable || []).filter(f => {
      const hay = [f.name, f.from, f.to, f.note, f.returnFrom, f.returnTo, f.returnNote, f.shipType].map(x => String(x || '').toLowerCase()).join(' ');
      return hay.includes(q);
    });
  }, [liuliFlightsForTable, liuliFlightSearch]);

  const liuliFlightsPageSize = 12;
  const liuliFlightsTotalPages = useMemo(() => {
    const len = (liuliFlightsFiltered || []).length;
    return Math.max(1, Math.ceil(len / liuliFlightsPageSize));
  }, [liuliFlightsFiltered]);

  const liuliFlightsPaged = useMemo(() => {
    const page = Math.min(Math.max(1, liuliFlightPage), liuliFlightsTotalPages);
    const start = (page - 1) * liuliFlightsPageSize;
    return (liuliFlightsFiltered || []).slice(start, start + liuliFlightsPageSize);
  }, [liuliFlightsFiltered, liuliFlightPage, liuliFlightsTotalPages]);

  useEffect(() => {
    setLiuliFlightPage(1);
  }, [liuliFlightSearch]);

  useEffect(() => {
    setLiuliFlightPage(p => Math.min(Math.max(1, p), liuliFlightsTotalPages));
  }, [liuliFlightsTotalPages]);

  const liuliProductsForTable = useMemo(() => {
    const approved = (transactions || []).filter(tx => tx.status === 'approved');
    return approved
      .filter(tx => tx.type === 'liuli_product')
      .map(tx => {
        const remark = String(tx.remark || '');
        const pickupMatch = remark.match(/(?:^|\n)pickup:\s*(.*?)(?:\n|$)/i);
        const noteMatch = remark.match(/(?:^|\n)note:\s*([\s\S]*)$/i);
        const pickup = pickupMatch ? (pickupMatch[1] || '').trim() : '';
        const note = noteMatch ? (noteMatch[1] || '').trim() : '';
        return {
          id: tx.id,
          name: tx.client || '',
          itemName: tx.product_type || '',
          perDay: parseFloat(tx.principal) || 0,
          pickup,
          note,
          created_at: tx.timestamp || ''
        };
      });
  }, [transactions]);

  const liuliProductsFiltered = useMemo(() => {
    const q = (liuliProductSearch || '').trim().toLowerCase();
    if (!q) return liuliProductsForTable || [];
    return (liuliProductsForTable || []).filter(p => {
      const hay = [p.name, p.itemName, p.perDay, p.pickup, p.note].map(x => String(x || '').toLowerCase()).join(' ');
      return hay.includes(q);
    });
  }, [liuliProductsForTable, liuliProductSearch]);

  const liuliProductsPageSize = 24;
  const liuliProductsTotalPages = useMemo(() => {
    const len = (liuliProductsFiltered || []).length;
    return Math.max(1, Math.ceil(len / liuliProductsPageSize));
  }, [liuliProductsFiltered]);

  const liuliProductsPaged = useMemo(() => {
    const page = Math.min(Math.max(1, liuliProductPage), liuliProductsTotalPages);
    const start = (page - 1) * liuliProductsPageSize;
    return (liuliProductsFiltered || []).slice(start, start + liuliProductsPageSize);
  }, [liuliProductsFiltered, liuliProductPage, liuliProductsTotalPages]);

  useEffect(() => {
    setLiuliProductPage(1);
  }, [liuliProductSearch]);

  useEffect(() => {
    setLiuliProductPage(p => Math.min(Math.max(1, p), liuliProductsTotalPages));
  }, [liuliProductsTotalPages]);

  const liuliMaterialDemandsForTable = useMemo(() => {
    const approved = (transactions || []).filter(tx => tx.status === 'approved');
    return approved
      .filter(tx => tx.type === 'liuli_material_demand')
      .map(tx => {
        const remark = String(tx.remark || '');
        const itemsMatch = remark.match(/(?:^|\n)items:\s*(.*?)(?:\n|$)/i);
        const summaryMatch = remark.match(/(?:^|\n)summary:\s*([\s\S]*?)(?=\nnote:|$)/i);
        const noteMatch = remark.match(/(?:^|\n)note:\s*([\s\S]*)$/i);
        let items = [];
        if (itemsMatch && itemsMatch[1]) {
          try {
            const raw = decodeURIComponent((itemsMatch[1] || '').trim());
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              items = parsed
                .map(it => ({
                  materialName: String(it?.materialName || '').trim(),
                  quantity: Math.round(Number(it?.quantity) || 0)
                }))
                .filter(it => it.materialName && it.quantity > 0);
            }
          } catch (_) {
            items = [];
          }
        }
        return {
          id: tx.id,
          applicant: tx.client || tx.created_by || '',
          items,
          summary: summaryMatch ? (summaryMatch[1] || '').trim() : remark,
          note: noteMatch ? (noteMatch[1] || '').trim() : '',
          created_at: tx.timestamp || '',
          created_by: tx.created_by || ''
        };
      });
  }, [transactions]);

  const liuliMaterialDemandsFiltered = useMemo(() => {
    const q = (liuliMaterialDemandSearch || '').trim().toLowerCase();
    if (!q) return liuliMaterialDemandsForTable || [];
    return (liuliMaterialDemandsForTable || []).filter(d => {
      const itemsText = (d.items || []).map(it => `${it.materialName} ${it.quantity}`).join(' ');
      const hay = [d.applicant, d.summary, d.note, itemsText].map(x => String(x || '').toLowerCase()).join(' ');
      return hay.includes(q);
    });
  }, [liuliMaterialDemandsForTable, liuliMaterialDemandSearch]);

  const liuliMaterialDemandPageSize = 12;
  const liuliMaterialDemandTotalPages = useMemo(() => {
    const len = (liuliMaterialDemandsFiltered || []).length;
    return Math.max(1, Math.ceil(len / liuliMaterialDemandPageSize));
  }, [liuliMaterialDemandsFiltered]);

  const liuliMaterialDemandsPaged = useMemo(() => {
    const page = Math.min(Math.max(1, liuliMaterialDemandPage), liuliMaterialDemandTotalPages);
    const start = (page - 1) * liuliMaterialDemandPageSize;
    return (liuliMaterialDemandsFiltered || []).slice(start, start + liuliMaterialDemandPageSize);
  }, [liuliMaterialDemandsFiltered, liuliMaterialDemandPage, liuliMaterialDemandTotalPages]);

  useEffect(() => {
    setLiuliMaterialDemandPage(1);
  }, [liuliMaterialDemandSearch]);

  useEffect(() => {
    setLiuliMaterialDemandPage(p => Math.min(Math.max(1, p), liuliMaterialDemandTotalPages));
  }, [liuliMaterialDemandTotalPages]);

  const liuliMaterialSuppliesForTable = useMemo(() => {
    const approved = (transactions || []).filter(tx => tx.status === 'approved');
    return approved
      .filter(tx => tx.type === 'liuli_material_supply')
      .map(tx => {
        const remark = String(tx.remark || '');
        const pickupMatch = remark.match(/(?:^|\n)pickup:\s*(.*?)(?:\n|$)/i);
        const noteMatch = remark.match(/(?:^|\n)note:\s*([\s\S]*)$/i);
        return {
          id: tx.id,
          producer: tx.client || '',
          materialName: tx.product_type || '',
          perDay: Math.round(parseFloat(tx.principal) || 0),
          unitPrice: parseFloat(tx.rate) || 0,
          pickup: pickupMatch ? (pickupMatch[1] || '').trim() : '',
          note: noteMatch ? (noteMatch[1] || '').trim() : '',
          created_at: tx.timestamp || ''
        };
      });
  }, [transactions]);

  const liuliMaterialSuppliesFiltered = useMemo(() => {
    const q = (liuliMaterialSupplySearch || '').trim().toLowerCase();
    if (!q) return liuliMaterialSuppliesForTable || [];
    return (liuliMaterialSuppliesForTable || []).filter(s => {
      const hay = [s.producer, s.materialName, s.perDay, s.unitPrice, s.pickup, s.note]
        .map(x => String(x || '').toLowerCase())
        .join(' ');
      return hay.includes(q);
    });
  }, [liuliMaterialSuppliesForTable, liuliMaterialSupplySearch]);

  const liuliMaterialSupplyPageSize = 12;
  const liuliMaterialSupplyTotalPages = useMemo(() => {
    const len = (liuliMaterialSuppliesFiltered || []).length;
    return Math.max(1, Math.ceil(len / liuliMaterialSupplyPageSize));
  }, [liuliMaterialSuppliesFiltered]);

  const liuliMaterialSuppliesPaged = useMemo(() => {
    const page = Math.min(Math.max(1, liuliMaterialSupplyPage), liuliMaterialSupplyTotalPages);
    const start = (page - 1) * liuliMaterialSupplyPageSize;
    return (liuliMaterialSuppliesFiltered || []).slice(start, start + liuliMaterialSupplyPageSize);
  }, [liuliMaterialSuppliesFiltered, liuliMaterialSupplyPage, liuliMaterialSupplyTotalPages]);

  useEffect(() => {
    setLiuliMaterialSupplyPage(1);
  }, [liuliMaterialSupplySearch]);

  useEffect(() => {
    setLiuliMaterialSupplyPage(p => Math.min(Math.max(1, p), liuliMaterialSupplyTotalPages));
  }, [liuliMaterialSupplyTotalPages]);

  const addLiuliMaterialDemand = async () => {
    const applicant = (liuliMaterialDemandForm.applicant || '').trim() || currentUser?.username || '';
    const note = (liuliMaterialDemandForm.note || '').trim();
    const normalizedItems = (liuliMaterialDemandForm.items || [])
      .map(it => ({
        materialName: String(it?.materialName || '').trim(),
        quantity: Number(it?.quantity)
      }))
      .filter(it => it.materialName && Number.isInteger(it.quantity) && it.quantity > 0);

    if (!applicant) {
      alert(language === 'zh' ? '请填写申请人' : 'Please fill in applicant');
      return false;
    }
    if (normalizedItems.length === 0) {
      alert(language === 'zh' ? '请至少填写一条有效建材（名称+整数数量）' : 'Please add at least one valid material item (integer quantity)');
      return false;
    }

    try {
      const summary = normalizedItems
        .map(it => `${it.materialName} x ${it.quantity}`)
        .join('\n');
      const encodedItems = encodeURIComponent(JSON.stringify(normalizedItems));
      const newItem = {
        type: 'liuli_material_demand',
        client: applicant,
        principal: 0,
        rate: 0,
        product_type: '',
        remark: `items:${encodedItems}\nsummary:${summary}\nnote:${note}`,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser?.username || 'unknown',
        creator_id: currentUser?.id || 'unknown',
        status: 'approved'
      };

      const { error } = await supabase.from('transactions').insert([newItem]);
      if (error) throw error;
      await refreshTransactions();
      setLiuliMaterialDemandForm({ applicant: '', items: [{ materialName: '', quantity: '' }], note: '' });
      setLiuliMaterialDemandXitInput('');
      return true;
    } catch (e) {
      alert((language === 'zh' ? '提交失败' : 'Submit failed') + ': ' + (e?.message || e));
      return false;
    }
  };

  const importLiuliMaterialDemandFromXit = () => {
    const rawInput = String(liuliMaterialDemandXitInput || '').trim();
    if (!rawInput) {
      alert(language === 'zh' ? '请先粘贴 XIT/PRUNplanner JSON' : 'Please paste XIT/PRUNplanner JSON first');
      return;
    }

    try {
      let jsonText = rawInput;
      const fenced = rawInput.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
      if (fenced && fenced[1]) jsonText = fenced[1];

      const parsed = JSON.parse(jsonText);
      const matMap = new Map();
      const visited = new Set();

      const collectMaterials = (node) => {
        if (!node || typeof node !== 'object') return;
        if (visited.has(node)) return;
        visited.add(node);

        if (node.materials && typeof node.materials === 'object' && !Array.isArray(node.materials)) {
          Object.entries(node.materials).forEach(([name, qty]) => {
            const materialName = String(name || '').trim();
            const quantity = Math.round(Number(qty));
            if (!materialName || !Number.isFinite(quantity) || quantity <= 0) return;
            matMap.set(materialName, (matMap.get(materialName) || 0) + quantity);
          });
        }

        if (Array.isArray(node)) {
          node.forEach(collectMaterials);
          return;
        }

        Object.values(node).forEach(collectMaterials);
      };

      collectMaterials(parsed);

      if (matMap.size === 0) {
        alert(language === 'zh' ? '未识别到 materials 字段中的建材数据' : 'No materials found in JSON');
        return;
      }

      const importedItems = Array.from(matMap.entries()).map(([materialName, quantity]) => ({
        materialName,
        quantity: String(Math.round(Number(quantity)))
      }));

      setLiuliMaterialDemandForm(prev => ({
        ...prev,
        items: importedItems
      }));

      alert(
        language === 'zh'
          ? `已导入 ${importedItems.length} 种建材`
          : `Imported ${importedItems.length} material items`
      );
    } catch (e) {
      alert((language === 'zh' ? 'XIT JSON 解析失败' : 'Failed to parse XIT JSON') + ': ' + (e?.message || e));
    }
  };

  const deleteLiuliMaterialDemand = (id) => {
    (async () => {
      try {
        const tx = (transactions || []).find(t => t.id === id);
        if (!tx) return;
        const isOwner = (tx.created_by && currentUser?.username && tx.created_by === currentUser.username);
        if (!isOwner && currentUser?.role !== 'admin') {
          alert(language === 'zh' ? '无权限删除' : 'No permission');
          return;
        }
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await refreshTransactions();
      } catch (e) {
        alert((language === 'zh' ? '删除失败' : 'Delete failed') + ': ' + (e?.message || e));
      }
    })();
  };

  const addLiuliMaterialSupply = async () => {
    const producer = (liuliMaterialSupplyForm.producer || '').trim() || currentUser?.username || '';
    const pickup = (liuliMaterialSupplyForm.pickup || '').trim();
    const note = (liuliMaterialSupplyForm.note || '').trim();
    const normalizedItems = (liuliMaterialSupplyForm.items || [])
      .map(it => ({
        materialName: String(it?.materialName || '').trim(),
        perDay: Number(it?.perDay),
        unitPrice: parseFloat(it?.unitPrice)
      }))
      .filter(it =>
        it.materialName &&
        Number.isInteger(it.perDay) &&
        it.perDay >= 0 &&
        Number.isFinite(it.unitPrice) &&
        it.unitPrice >= 0
      );

    if (!producer) {
      alert(language === 'zh' ? '请填写生产者名称' : 'Please fill in producer');
      return false;
    }
    if (normalizedItems.length === 0) {
      alert(language === 'zh' ? '请至少填写一条有效建材（名称+整数日产量+单价）' : 'Please add at least one valid material item (integer output + price)');
      return false;
    }

    try {
      const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
      const rows = normalizedItems.map(it => ({
        type: 'liuli_material_supply',
        client: producer,
        principal: it.perDay,
        rate: it.unitPrice,
        product_type: it.materialName,
        remark: `pickup:${pickup}\nnote:${note}`,
        timestamp: now,
        created_by: currentUser?.username || 'unknown',
        creator_id: currentUser?.id || 'unknown',
        status: 'approved'
      }));

      const { error } = await supabase.from('transactions').insert(rows);
      if (error) throw error;
      await refreshTransactions();
      setLiuliMaterialSupplyForm({
        producer: '',
        items: [{ materialName: '', perDay: '', unitPrice: '' }],
        pickup: '',
        note: ''
      });
      return true;
    } catch (e) {
      alert((language === 'zh' ? '登记失败' : 'Add failed') + ': ' + (e?.message || e));
      return false;
    }
  };

  const deleteLiuliMaterialSupply = (id) => {
    (async () => {
      try {
        const tx = (transactions || []).find(t => t.id === id);
        if (!tx) return;
        const isOwner = (tx.created_by && currentUser?.username && tx.created_by === currentUser.username);
        if (!isOwner && currentUser?.role !== 'admin') {
          alert(language === 'zh' ? '无权限删除' : 'No permission');
          return;
        }
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await refreshTransactions();
      } catch (e) {
        alert((language === 'zh' ? '删除失败' : 'Delete failed') + ': ' + (e?.message || e));
      }
    })();
  };

  const addLiuliFlight = async () => {
    const name = (liuliFlightForm.name || '').trim();
    const from = (liuliFlightForm.from || '').trim();
    const to = (liuliFlightForm.to || '').trim();
    const note = (liuliFlightForm.note || '').trim();
    const roundTrip = liuliFlightForm.roundTrip;
    const returnFrom = (liuliFlightForm.returnFrom || '').trim();
    const returnTo = (liuliFlightForm.returnTo || '').trim();
    const returnNote = (liuliFlightForm.returnNote || '').trim();
    const shipType = (liuliFlightForm.shipType || 'SCB').trim();

    if (!name) {
      alert(language === 'zh' ? '请填写名称' : 'Please fill in name');
      return false;
    }
    if (!from || !to) {
      alert(language === 'zh' ? '请填写出发地与目的地' : 'Please fill in From and To');
      return false;
    }
    if (roundTrip && (!returnFrom || !returnTo)) {
      alert(language === 'zh' ? '往返模式下请填写返程出发地与目的地' : 'Please fill in return From and To for round trip');
      return false;
    }

    try {
      let remark = `to:${to}\nnote:${note}`;
      if (roundTrip) {
        remark += `\nreturnFrom:${returnFrom}\nreturnTo:${returnTo}\nreturnNote:${returnNote}`;
      }
      remark += `\nshipType:${shipType}`;

      const newItem = {
        type: 'liuli_flight',
        client: name,
        principal: 0,
        rate: 0,
        product_type: from,
        remark,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser?.username || 'unknown',
        creator_id: currentUser?.id || 'unknown',
        status: 'approved'
      };

      const { error } = await supabase.from('transactions').insert([newItem]);
      if (error) throw error;
      await refreshTransactions();
      setLiuliFlightForm({ name: '', from: '', to: '', note: '', roundTrip: false, returnFrom: '', returnTo: '', returnNote: '', shipType: 'SCB' });
      return true;
    } catch (e) {
      alert((language === 'zh' ? '登记失败' : 'Add failed') + ': ' + (e?.message || e));
      return false;
    }
  };

  const deleteLiuliFlight = (id) => {
    (async () => {
      try {
        const tx = (transactions || []).find(t => t.id === id);
        if (!tx) return;
        const isOwner = (tx.created_by && currentUser?.username && tx.created_by === currentUser.username);
        if (!isOwner && currentUser?.role !== 'admin') {
          alert(language === 'zh' ? '无权限删除' : 'No permission');
          return;
        }
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await refreshTransactions();
      } catch (e) {
        alert((language === 'zh' ? '删除失败' : 'Delete failed') + ': ' + (e?.message || e));
      }
    })();
  };

  const handleDeleteHolding = async (id) => {
    if (!window.confirm(language === 'zh' ? '确认删除该持仓记录？' : 'Confirm delete this holding?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await refreshTransactions();
    } catch (e) {
      alert((language === 'zh' ? '删除失败：' : 'Delete failed: ') + (e?.message || e));
    }
  };

  const handleUpdateHolding = async (id) => {
    const principal = parseFloat(editHoldingData.principal);
    const rate = parseFloat(editHoldingData.rate);
    if (!editHoldingData.client.trim() || !Number.isFinite(principal) || principal <= 0) {
      alert(language === 'zh' ? '请填写有效的债券名称和金额' : 'Please fill in valid bond name and amount');
      return;
    }
    try {
      const { error } = await supabase.from('transactions').update({
        client: editHoldingData.client.trim(),
        principal,
        rate: Number.isFinite(rate) ? rate : 0,
      }).eq('id', id);
      if (error) throw error;
      await refreshTransactions();
      setEditingHoldingId(null);
    } catch (e) {
      alert((language === 'zh' ? '更新失败：' : 'Update failed: ') + (e?.message || e));
    }
  };

  const handleDeleteRedeem = async (id) => {
    if (!window.confirm(language === 'zh' ? '确定删除此赎回记录？' : 'Delete this redeem record?')) return;
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      await refreshTransactions();
    } catch (e) {
      alert((language === 'zh' ? '删除失败：' : 'Delete failed: ') + (e?.message || e));
    }
  };

  const handleUpdateRedeem = async (id) => {
    const principal = parseFloat(editRedeemData.principal);
    const rate = parseFloat(editRedeemData.rate);
    if (!editRedeemData.client.trim() || !Number.isFinite(principal) || principal <= 0) {
      alert(language === 'zh' ? '请填写有效的债券名称和本金' : 'Please fill in valid bond name and principal');
      return;
    }
    try {
      const { error } = await supabase.from('transactions').update({
        client: editRedeemData.client.trim(),
        principal,
        rate: Number.isFinite(rate) ? rate : 0,
      }).eq('id', id);
      if (error) throw error;
      await refreshTransactions();
      setEditingRedeemId(null);
    } catch (e) {
      alert((language === 'zh' ? '更新失败：' : 'Update failed: ') + (e?.message || e));
    }
  };

  const handleBatchDeleteRedeem = async () => {
    if (selectedRedeemIds.size === 0) return;
    if (!window.confirm(language === 'zh' ? `确定删除选中的 ${selectedRedeemIds.size} 条赎回记录？` : `Delete ${selectedRedeemIds.size} selected records?`)) return;
    try {
      for (const id of selectedRedeemIds) {
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
      }
      setSelectedRedeemIds(new Set());
      await refreshTransactions();
    } catch (e) {
      alert((language === 'zh' ? '批量删除失败：' : 'Batch delete failed: ') + (e?.message || e));
    }
  };

  const handleUpdateFlight = async (id) => {
    const { name, from, to, note, returnFrom, returnTo, returnNote, shipType } = editFlightData;
    if (!name.trim() || !from.trim() || !to.trim()) {
      alert(language === 'zh' ? '名称、出发地、目的地不能为空' : 'Name, From, To are required');
      return;
    }
    try {
      let remark = `to:${to.trim()}\nnote:${note.trim()}`;
      if (returnFrom.trim() && returnTo.trim()) {
        remark += `\nreturnFrom:${returnFrom.trim()}\nreturnTo:${returnTo.trim()}\nreturnNote:${returnNote.trim()}`;
      }
      remark += `\nshipType:${shipType}`;
      const { error } = await supabase.from('transactions').update({
        client: name.trim(),
        product_type: from.trim(),
        remark,
      }).eq('id', id);
      if (error) throw error;
      await refreshTransactions();
      setEditingFlightId(null);
    } catch (e) {
      alert((language === 'zh' ? '更新失败' : 'Update failed') + ': ' + (e?.message || e));
    }
  };

  const addLiuliProduct = async () => {
    const name = (liuliProductForm.name || '').trim();
    const itemName = (liuliProductForm.itemName || '').trim();
    const pickup = (liuliProductForm.pickup || '').trim();
    const note = (liuliProductForm.note || '').trim();
    const perDayNum = parseFloat(liuliProductForm.perDay);

    if (!name) {
      alert(language === 'zh' ? '请填写名称' : 'Please fill in name');
      return false;
    }
    if (!itemName) {
      alert(language === 'zh' ? '请填写物品名称' : 'Please fill in item name');
      return false;
    }
    if (!Number.isFinite(perDayNum) || perDayNum < 0) {
      alert(language === 'zh' ? '每天产量必须是有效数字' : 'Per-day output must be a valid number');
      return false;
    }

    try {
      const newItem = {
        type: 'liuli_product',
        client: name,
        principal: perDayNum,
        rate: 0,
        product_type: itemName,
        remark: `pickup:${pickup}\nnote:${note}`,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser?.username || 'unknown',
        creator_id: currentUser?.id || 'unknown',
        status: 'approved'
      };

      const { error } = await supabase.from('transactions').insert([newItem]);
      if (error) throw error;
      await refreshTransactions();
      setLiuliProductForm({ name: '', itemName: '', perDay: '', pickup: '', note: '' });
      return true;
    } catch (e) {
      alert((language === 'zh' ? '登记失败' : 'Add failed') + ': ' + (e?.message || e));
      return false;
    }
  };

  const deleteLiuliProduct = (id) => {
    (async () => {
      try {
        const tx = (transactions || []).find(t => t.id === id);
        if (!tx) return;
        const isOwner = (tx.created_by && currentUser?.username && tx.created_by === currentUser.username);
        if (!isOwner && currentUser?.role !== 'admin') {
          alert(language === 'zh' ? '无权限删除' : 'No permission');
          return;
        }
        const { error } = await supabase.from('transactions').delete().eq('id', id);
        if (error) throw error;
        await refreshTransactions();
      } catch (e) {
        alert((language === 'zh' ? '删除失败' : 'Delete failed') + ': ' + (e?.message || e));
      }
    })();
  };

  // 翻译函数
  const t = (key) => {
    try {
      return translations[language]?.[key] || key;
    } catch (e) {
      console.error('Translation error:', e, 'key:', key, 'language:', language);
      return key;
    }
  };

  const getRoleDisplayKey = (role) => {
    if (role === 'admin') return 'roleAdmin';
    if (role === 'fund_manager') return 'roleFundManager';
    if (role === 'liuli_member') return 'roleLiuliMember';
    return 'roleUser';
  };

  const getUserByName = (username) => {
    return (registeredUsers || []).find(u => u.username === username);
  };

  const isLiuliEligibleUser = (user) => {
    const role = String(user?.role || '').toLowerCase();
    return role === 'admin' || role === 'liuli_member';
  };

  const handleToggleLiuliMember = async (userRow) => {
    try {
      if (currentUser?.role !== 'admin') return;
      if (!userRow?.id) return;
      if (userRow.role === 'admin' || userRow.role === 'fund_manager') return;

      const nextRole = userRow.role === 'liuli_member' ? 'user' : 'liuli_member';
      setUpdatingMemberUserId(userRow.id);

      const { error } = await supabase
        .from('users')
        .update({ role: nextRole })
        .eq('id', userRow.id);
      if (error) throw error;

      setRegisteredUsers(prev => (prev || []).map(u => (u.id === userRow.id ? { ...u, role: nextRole } : u)));

      if (currentUser?.id === userRow.id || currentUser?.username === userRow.username) {
        const updatedCurrent = { ...currentUser, role: nextRole };
        setCurrentUser(updatedCurrent);
        sessionStorage.setItem('current_bank_user_v2', JSON.stringify(updatedCurrent));
      }

      alert(nextRole === 'liuli_member' ? t('memberGranted') : t('memberRevoked'));
    } catch (e) {
      alert(`${t('membershipUpdateFailed')}: ${e?.message || e}`);
    } finally {
      setUpdatingMemberUserId(null);
    }
  };

  const handleAggregatedDelete = async (row) => {
    try {
      if (!row?.source_ids?.length) return;
      if (!window.confirm(t('confirmDeleteTx'))) return;

      const { error } = await supabase
        .from('transactions')
        .delete()
        .in('id', row.source_ids);

      if (error) throw error;
      await refreshTransactions();
    } catch (e) {
      alert(t('deleteFailed') + ': ' + (e?.message || e));
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
      total_supply: String(bond?.total_supply ?? '1000'),
      description: bond?.description || ''
    });
    setBondEditModal(true);
  };

  const handleUpdateBondProduct = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'admin') {
      alert(t('adminOnlyBondEdit'));
      return;
    }
    if (!bondEditTarget?.tx_id) {
      alert(t('bondNotFound'));
      return;
    }

    const termDays = parseInt(bondEditData.term_days, 10);
    const ratePerWeek = parseFloat(bondEditData.rate_per_week);
    const totalSupply = parseFloat(bondEditData.total_supply);

    if (!bondEditData.name.trim()) return alert(t('bondNameRequired'));
    if (!Number.isFinite(termDays) || termDays <= 0) return alert(t('bondTermInvalid'));
    if (!Number.isFinite(ratePerWeek) || ratePerWeek < 0) return alert(t('bondRateInvalid'));
    if (!Number.isFinite(totalSupply) || totalSupply <= 0) return alert(t('bondSupplyInvalid'));

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          client: bondEditData.name.trim(),
          principal: totalSupply,
          rate: ratePerWeek,
          product_type: bondEditData.category === 'long' ? 'bond_long' : 'bond_short',
          remark: bondEditData.description.trim()
            ? `${bondEditData.description.trim()}|||${String(t('bondTermRemark')).replace('{days}', termDays)}`
            : String(t('bondTermRemark')).replace('{days}', termDays),
          last_edited_by: currentUser.username,
          last_edited_at: new Date().toLocaleString('zh-CN', { hour12: false })
        })
        .eq('id', bondEditTarget.tx_id);
      if (error) throw error;

      await refreshTransactions();
      setBondEditModal(false);
      setBondEditTarget(null);
    } catch (e2) {
      alert(t('bondUpdateFailed') + ': ' + (e2?.message || e2));
    }
  };

  const handleDeleteBondProduct = async (bond) => {
    if (currentUser?.role !== 'admin') {
      alert(t('adminOnlyBondDelete'));
      return;
    }
    if (!bond?.tx_id) {
      alert(t('bondNotFound'));
      return;
    }
    if (!window.confirm(t('confirmDeleteBondIssue'))) return;

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
      alert(t('deleteBondFailed') + ': ' + (e2?.message || e2));
    }
  };

  const handleEndBondIssue = async (bond) => {
    if (currentUser?.role !== 'admin') return;
    if (!bond?.tx_id) {
      alert(t('bondNotFound'));
      return;
    }
    if (!window.confirm(t('confirmEndBondIssue'))) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .update({
          status: 'rejected',
          approved_by: currentUser.username,
          rejected_at: new Date().toISOString()
        })
        .eq('id', bond.tx_id);
      if (error) throw error;
      await refreshTransactions();
    } catch (e2) {
      alert(t('endBondIssueFailed') + ': ' + (e2?.message || e2));
    }
  };

  const handleRedeemAllBond = async (bond) => {
    if (currentUser?.role !== 'admin') {
      alert(t('adminOnlyRedeemAll'));
      return;
    }
    if (!bond?.tx_id) {
      alert(t('bondNotFound'));
      return;
    }
    if (!window.confirm(t('confirmRedeemAllBond'))) return;

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

      // 统计当前债券所有人的已审批持仓，用于生成赎回账单
      const approvedAll = (transactions || []).filter(tx => tx.status === 'approved');
      const subscriberRecords = approvedAll
        .filter(tx => tx.type === 'bond_subscribe')
        .filter(tx => {
          const issueId = parseBondIssueIdFromRemark(tx.remark);
          return issueId ? (String(issueId) === String(bond.tx_id)) : (tx.client === bond.name);
        });
      const totalApproved = subscriberRecords.reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
      const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });

      // 先写入每位认购人的个人赎回明细记录（在状态刷新前完成）
      if (subscriberRecords.length > 0) {
        const perUserRecords = subscriberRecords.map(sub => ({
          type: 'bond_redeem_user',
          client: bond.name,
          principal: parseFloat(sub.principal) || 0,
          rate: parseFloat(sub.rate) || parseFloat(bond.rate_per_week) || 0,
          timestamp: now,
          created_by: sub.created_by,
          creator_id: sub.creator_id || sub.created_by,
          status: 'approved',
          remark: `issue_id:${bond.tx_id} 个人赎回`,
          product_type: bond.category === 'long' ? 'bond_long' : 'bond_short'
        }));
        const { error: perUserErr } = await supabase.from('transactions').insert(perUserRecords);
        if (perUserErr) throw new Error('创建赎回明细失败: ' + perUserErr.message);
      }

      // 再写入全员可见的赎回汇总记录（handleCRUD 会内部刷新一次）
      const { error: summaryErr } = await supabase.from('transactions').insert([{
        type: 'bond_redeem',
        client: bond.name,
        principal: totalApproved,
        rate: parseFloat(bond.rate_per_week) || 0,
        product_type: bond.category === 'long' ? 'bond_long' : 'bond_short',
        remark: `issue_id:${bond.tx_id} 全额赎回`,
        timestamp: now,
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: 'approved'
      }]);
      if (summaryErr) throw new Error('创建汇总记录失败: ' + summaryErr.message);

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
      alert(t('redeemAllBondFailed') + ': ' + (e2?.message || e2));
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
          const remark = String(tx.remark || '');
          const hasSep = remark.includes('|||');
          const description = hasSep ? remark.split('|||')[0].trim() : '';
          const termRemark = hasSep ? remark.split('|||')[1] : remark;
          const termDays = (() => {
            const m = termRemark.match(/期限[:：]\s*(\d+)\s*天/);
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
            description,
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
      alert(t('adminOnlyBondIssue'));
      return;
    }

    const termDays = parseInt(bondIssueData.term_days, 10);
    const ratePerWeek = parseFloat(bondIssueData.rate_per_week);
    const totalSupply = parseFloat(bondIssueData.total_supply);

    if (!bondIssueData.name.trim()) return alert(t('bondNameRequired'));
    if (!Number.isFinite(termDays) || termDays <= 0) return alert(t('bondTermInvalid'));
    if (!Number.isFinite(ratePerWeek) || ratePerWeek < 0) return alert(t('bondRateInvalid'));
    if (!Number.isFinite(totalSupply) || totalSupply <= 0) return alert(t('bondSupplyInvalid'));

    await handleCRUD('create', {
      type: 'bond_issue',
      client: bondIssueData.name.trim(),
      principal: totalSupply,
      rate: ratePerWeek,
      product_type: bondIssueData.category === 'long' ? 'bond_long' : 'bond_short',
      remark: bondIssueData.description.trim()
        ? `${bondIssueData.description.trim()}|||${String(t('bondTermRemark')).replace('{days}', termDays)}`
        : String(t('bondTermRemark')).replace('{days}', termDays)
    });

    await refreshTransactions();
    setBondIssueModal(false);
    setBondIssueData({ name: '', category: 'short', term_days: '30', rate_per_week: '2.0', total_supply: '1000', description: '' });
  };

  const submitBondSubscribe = async () => {
    if (!bondSubscribeTarget) return;
    const amount = parseFloat(bondSubscribeAmount) || 0;
    if (amount <= 0) {
      alert(t('validAmountRequired'));
      return;
    }

    // 防止对已结束/已删除的债券继续申购
    const stillActive = (transactions || []).some(
      tx => tx.status === 'approved' && tx.type === 'bond_issue' && String(tx.id) === String(bondSubscribeTarget.tx_id)
    );
    if (!stillActive) {
      alert(t('bondUnavailable'));
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
      remark: String(t('bondSubscribeRemark'))
        .replace('{id}', bondSubscribeTarget.tx_id)
        .replace('{days}', bondSubscribeTarget.term_days)
        + (bondSubscribeNote.trim() ? ` 备注：${bondSubscribeNote.trim()}` : '')
    });

    setBondSubscribeModal(false);
    setBondSubscribeTarget(null);
    setBondSubscribeAmount('');
    setBondSubscribeNote('');
  };

  const submitFundUserRequest = async () => {
    const amount = parseFloat(fundUserAmount) || 0;
    if (amount <= 0) {
      alert(t('validAmountRequired'));
      return;
    }
    let type = '';
    let remark = '';
    if (fundUserAction === 'subscribe') {
      type = 'fund_subscribe';
      remark = language === 'zh' ? '外部准入申购' : 'External access subscription';
    } else if (fundUserAction === 'redeem') {
      type = 'fund_redeem';
      remark = language === 'zh' ? '赎回（含分红）' : 'Redeem (incl. dividends)';
    } else if (fundUserAction === 'dividend_withdraw') {
      type = 'fund_dividend_withdraw';
      remark = language === 'zh' ? '提取分红到外部' : 'Withdraw dividends to external';
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

  const getShanghaiNow = () => new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));

  const getShanghaiDateKey = (d) => {
    if (!d) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // 返回"当前时间对应的本次结算周key"
  // 结算时间：每周三 12:00 上海时间；若还未到本周三 12:00，则返回上周三的 key
  const getSettleWeekKey = (now) => {
    const d = new Date(now);
    const day = d.getDay(); // 0=Sun, 3=Wed
    const daysToLastWed = (day - 3 + 7) % 7;
    const lastWed = new Date(d);
    lastWed.setDate(d.getDate() - daysToLastWed);
    lastWed.setHours(12, 0, 0, 0);
    // 今天是周三但还没到 12:00，用上周三
    if (daysToLastWed === 0 && d < lastWed) {
      lastWed.setDate(lastWed.getDate() - 7);
    }
    return getShanghaiDateKey(lastWed);
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

        const fetchLatestAnnouncement = async (key) => {
          const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .eq('title', key)
            .order('id', { ascending: false })
            .limit(1);
          if (error) throw error;
          return data && data.length > 0 ? data[0] : null;
        };

        const [bankAnn, fundAnn, assetsAnn] = await Promise.all([
          fetchLatestAnnouncement('bank_announcement'),
          fetchLatestAnnouncement('fund_announcement'),
          fetchLatestAnnouncement('assets_announcement')
        ]);

        if (bankAnn) setBankAnnouncement(bankAnn);
        if (fundAnn) setFundAnnouncement(fundAnn);
        if (assetsAnn) setAssetsAnnouncement(assetsAnn);

        // 获取招募信息
        const recruitAnn = await fetchLatestAnnouncement('recruitment_board');
        if (recruitAnn) {
          try { setRecruitmentPosts(JSON.parse(recruitAnn.content || '[]')); } catch { setRecruitmentPosts([]); }
        }

        // 获取分类发言区数据
        const speechAnn = await fetchLatestAnnouncement('speech_board');
        if (speechAnn) {
          try {
            const parsed = JSON.parse(speechAnn.content || '{}');
            if (parsed.categories?.length) setSpeechData(parsed);
          } catch { }
        }

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
      alert(t('announcementUpdateFailed') + ': ' + (e?.message || e));
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

  const handleUpdateAssetsAnnouncement = async () => {
    if (!assetsAnnouncementInput.trim()) return;
    try {
      const nextContent = assetsAnnouncementInput;
      let targetId = assetsAnnouncement.id;

      if (!targetId) {
        const { data: existingRows, error: existingError } = await supabase
          .from('announcements')
          .select('id')
          .eq('title', 'assets_announcement')
          .order('id', { ascending: false })
          .limit(1);
        if (existingError) throw existingError;
        targetId = existingRows && existingRows.length > 0 ? existingRows[0].id : '';
      }

      if (targetId) {
        const { error } = await supabase
          .from('announcements')
          .update({ content: nextContent })
          .eq('id', targetId);
        if (error) throw error;
        setAssetsAnnouncement(prev => ({ ...prev, id: targetId, content: nextContent }));
      } else {
        const { data: insertedRow, error } = await supabase
          .from('announcements')
          .insert({
            title: 'assets_announcement',
            content: nextContent
          })
          .select('*')
          .single();
        if (error) throw error;
        setAssetsAnnouncement(insertedRow || { id: '', content: nextContent });
      }

      setIsEditingAssetsAnnouncement(false);
      setAssetsAnnouncementInput('');
    } catch (e) {
      console.error('更新公告失败:', e);
      alert(t('announcementUpdateFailed') + ': ' + (e?.message || e));
    }
  };

  // --- 项目人员招募 ---
  const saveRecruitmentToDb = async (posts) => {
    const content = JSON.stringify(posts);
    const { data: existing } = await supabase.from('announcements').select('id').eq('title', 'recruitment_board').limit(1);
    if (existing && existing.length > 0) {
      await supabase.from('announcements').update({ content }).eq('id', existing[0].id);
    } else {
      await supabase.from('announcements').insert({ title: 'recruitment_board', content });
    }
  };

  const handleAddRecruitmentPost = async () => {
    if (!recruitmentForm.title.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      title: recruitmentForm.title.trim(),
      description: recruitmentForm.description.trim(),
      contact: recruitmentForm.contact.trim(),
      postedBy: currentUser.username,
      postedAt: new Date().toISOString().split('T')[0],
    };
    const newPosts = [newPost, ...recruitmentPosts];
    setRecruitmentPosts(newPosts);
    await saveRecruitmentToDb(newPosts);
    setRecruitmentForm({ title: '', description: '', contact: '' });
    setIsAddingRecruitment(false);
  };

  const handleDeleteRecruitmentPost = async (id) => {
    const newPosts = recruitmentPosts.filter(p => p.id !== id);
    setRecruitmentPosts(newPosts);
    await saveRecruitmentToDb(newPosts);
  };

  // --- 分类发言区 ---
  const saveSpeechData = async (data) => {
    const content = JSON.stringify(data);
    const { data: existing } = await supabase.from('announcements').select('id').eq('title', 'speech_board').limit(1);
    if (existing && existing.length > 0) {
      await supabase.from('announcements').update({ content }).eq('id', existing[0].id);
    } else {
      await supabase.from('announcements').insert({ title: 'speech_board', content });
    }
  };

  const handleAddSpeechPost = async () => {
    if (!speechInput.trim()) return;
    const newPost = {
      id: Date.now().toString(),
      category: activeSpeechCategory,
      content: speechInput.trim(),
      author: currentUser.username,
      time: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
    };
    const newData = { ...speechData, posts: [newPost, ...speechData.posts] };
    setSpeechData(newData);
    await saveSpeechData(newData);
    setSpeechInput('');
  };

  const handleDeleteSpeechPost = async (id) => {
    const newData = { ...speechData, posts: speechData.posts.filter(p => p.id !== id) };
    setSpeechData(newData);
    await saveSpeechData(newData);
  };

  const handleAddSpeechCategory = async () => {
    const name = newCategoryInput.trim();
    if (!name || speechData.categories.includes(name)) return;
    const newData = { ...speechData, categories: [...speechData.categories, name] };
    setSpeechData(newData);
    await saveSpeechData(newData);
    setNewCategoryInput('');
  };

  const handleDeleteSpeechCategory = async (cat) => {
    if (!window.confirm(`删除分类"${cat}"及其所有发言？`)) return;
    const newData = {
      categories: speechData.categories.filter(c => c !== cat),
      posts: speechData.posts.filter(p => p.category !== cat),
    };
    setSpeechData(newData);
    await saveSpeechData(newData);
    if (activeSpeechCategory === cat) setActiveSpeechCategory(newData.categories[0] || '');
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
      alert(t('fundTxUpdated'));
    } catch (e) {
      console.error('更新交易记录失败:', e);
      alert(t('updateFailed') + ': ' + e.message);
    }
  };

  const handleCancelEditFundTx = () => {
    setEditingFundTx(null);
    setEditFundTxData({ amount: '', remark: '' });
  };

  const handleDeleteFundTx = async (txId) => {
    if (!confirm(t('confirmDeleteTx'))) return;
    
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', txId);
      
      if (error) throw error;
      
      // 重新获取交易记录
      await fetchFundTransactions();
      alert(t('fundTxDeleted'));
    } catch (e) {
      console.error('删除交易记录失败:', e);
      alert(`${t('deleteFailed')}: ${e.message}`);
    }
  };

  // 检查是否可以编辑基金交易记录
  const canEditFundTransactions = () => {
    return currentUser?.role === 'admin' || currentUser?.role === 'fund_manager';
  };

  // 添加基金交易记录功能
  const handleAddFundTx = async () => {
    if (!newFundTxData.amount || parseFloat(newFundTxData.amount) <= 0) {
      alert(t('amountPlaceholder01'));
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
          remark: newFundTxData.remark || t('fundProfitRemark'),
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
          remark: newFundTxData.remark || t('fundLossRemark'),
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
      
      alert(t('fundTxAdded'));
    } catch (e) {
      console.error('添加交易记录失败:', e);
      alert(t('addFailed') + ': ' + e.message);
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
      alert(t('selectRecordsToDelete'));
      return;
    }

    if (!confirm(String(t('confirmDeleteSelected')).replace('{count}', selectedTransactions.size))) {
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
      
      alert(String(t('batchDeleteSuccess')).replace('{count}', selectedTransactions.size));
    } catch (e) {
      console.error('批量删除失败:', e);
      alert(`${t('batchDeleteFailed')}: ${e.message}`);
    }
  };

  const handleFundTransfer = async () => {
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      alert(t('validAmountRequired'));
      return;
    }

    // 权限检查
    if (currentUser?.role !== 'admin') {
      alert(t('permissionDeniedAdminOnly'));
      return;
    }

    try {
      const amount = parseFloat(transferAmount); // 用户输入的m单位金额
      
      if (transferType === 'in') {
        // 银行转基金
        const idleCash = calculateIdleCash();
        if (amount > idleCash) {
          alert(String(t('bankIdleInsufficient'))
            .replace('{available}', formatMoney(idleCash))
            .replace('{attempt}', formatMoney(amount)));
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
          alert(String(t('fundBalanceInsufficient'))
            .replace('{available}', formatMoney(fundBalance))
            .replace('{attempt}', formatMoney(amount)));
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
      
      alert(t('transferSuccess'));
    } catch (e) {
      console.error('转账失败:', e);
      alert(t('transferFailed') + ': ' + e.message);
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
    if (!window.confirm(t('confirmDeleteReply'))) return;
    
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
    if (!window.confirm(t('confirmDeletePost'))) return;
    
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
        alert(t('starCardCreated'));
      } else {
        alert(t('starCardSubmitted'));
      }
      
      setNewCardModal(false);
      setNewCardData({ name: '', description: '', progress: 0 });
    } catch (e) {
      alert(t('createFailed') + ': ' + e.message);
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

      alert(t('starCardUpdated'));
      setEditingCardId(null);
    } catch (e) {
      alert(t('updateFailed') + ': ' + e.message);
    }
  };

  const handlePlanetFundRequest = async (cardId) => {
    const amount = parseFloat(fundAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t('invalidNumber'));
      return;
    }

    const isBankTransfer = isAdmin && fundSource === 'bank';

    if (isBankTransfer) {
      const available = calculateIdleCash();
      if (amount > available) {
        alert(language === 'zh' ? `银行可用余额不足，当前余额：${formatMoney(available)}` : `Insufficient bank balance: ${formatMoney(available)}`);
        return;
      }
    }

    try {
      const card = planetCards.find(c => c.id === cardId);

      const fundRecord = {
        type: isBankTransfer ? 'bank_planet_fund' : 'planet_fund',
        client: card.client,
        principal: amount,
        rate: 0,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: isBankTransfer ? 'approved' : 'pending',
        remark: isBankTransfer ? `银行划拨资金注入 ${card.client}` : `为 ${card.client} 注入资金`
      };

      const { error } = await supabase
        .from('transactions')
        .insert([fundRecord]);

      if (error) throw error;

      await refreshTransactions();
      alert(isBankTransfer
        ? (language === 'zh' ? `已成功划拨 ${formatMoney(amount)} 注入 ${card.client}` : `Successfully transferred ${formatMoney(amount)} to ${card.client}`)
        : t('starCardSubmitted')
      );
      setFundAmount('');
      setFundingCardId(null);
      setFundSource('personal');
    } catch (e) {
      alert(t('submitFailed') + ': ' + e.message);
    }
  };

  const handlePlanetFundWithdraw = async (cardId) => {
    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert(t('invalidNumber'));
      return;
    }
    const card = planetCards.find(c => c.id === cardId);
    const available = getCardFund(card.client);
    if (amount > available) {
      alert(language === 'zh' ? `星星可用资金不足，当前：${formatMoney(available)}` : `Insufficient star fund: ${formatMoney(available)}`);
      return;
    }
    try {
      const { error } = await supabase.from('transactions').insert([{
        type: 'bank_planet_withdraw',
        client: card.client,
        principal: amount,
        rate: 0,
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: 'approved',
        remark: `从 ${card.client} 撤回资金至银行`
      }]);
      if (error) throw error;
      await refreshTransactions();
      alert(language === 'zh' ? `已成功从 ${card.client} 撤回 ${formatMoney(amount)}` : `Recalled ${formatMoney(amount)} from ${card.client}`);
      setWithdrawAmount('');
      setWithdrawingCardId(null);
    } catch (e) {
      alert(t('submitFailed') + ': ' + e.message);
    }
  };

  // 计算每个星星的资金总额
  const getCardFund = (cardName) => {
    const inflow = transactions
      .filter(tx => ['planet_fund', 'bank_planet_fund'].includes(tx.type) && tx.client === cardName && tx.status === 'approved')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const outflow = transactions
      .filter(tx => tx.type === 'bank_planet_withdraw' && tx.client === cardName && tx.status === 'approved')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    return Math.max(0, inflow - outflow);
  };

  // 获取注资记录列表
  const getCardFundingList = (cardName) => {
    return transactions
      .filter(tx => ['planet_fund', 'bank_planet_fund', 'bank_planet_withdraw'].includes(tx.type) && tx.client === cardName && tx.status === 'approved')
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
      const isAdminUser = currentUser?.role === 'admin';
      const assetRecord = {
        type: 'bank_asset',
        client: newAssetData.planetName, // 星球名称
        principal: parseFloat(newAssetData.quantity) || 0, // 使用principal存储数量
        rate: parseFloat(newAssetData.value) || 0, // 使用rate存储价值
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        created_by: currentUser.username,
        creator_id: currentUser.id || currentUser.username,
        status: isAdminUser ? 'approved' : 'pending',
        remark: buildBankAssetRemark(newAssetData.itemName, newAssetData.dailyProfit),
        product_type: String(newAssetData.operatorName || '').trim()
      };

      const { error } = await supabase
        .from('transactions')
        .insert([assetRecord]);

      if (error) throw error;

      alert(isAdminUser ? t('assetRegistered') : t('submitWillEnterApproval'));
      
      setNewAssetModal(false);
      setNewAssetData({ planetName: '', itemName: '', quantity: '', value: '', dailyProfit: '', operatorName: '' });
    } catch (e) {
      alert(t('registerFailed') + ': ' + e.message);
    }
  };
  
  // 获取所有银行资产
  useEffect(() => {
    const isAdminUser = String(currentUser?.role || '').toLowerCase() === 'admin';
    const assets = (transactions || [])
      .filter(tx => tx.type === 'bank_asset')
      .filter((tx) => {
        if (isAdminUser) return true;
        if (tx.status === 'approved') return true;
        return tx.created_by === currentUser?.username;
      })
      .sort((a, b) => {
        const ta = new Date(a.created_at || a.timestamp || 0).getTime();
        const tb = new Date(b.created_at || b.timestamp || 0).getTime();
        return tb - ta;
      });
    setBankAssets(assets);
  }, [transactions, currentUser?.username, currentUser?.role]);
  
  // 编辑资产
  const handleUpdateAsset = async (assetId) => {
    try {
      const updateData = {
        client: editAssetData.planetName,
        remark: buildBankAssetRemark(editAssetData.itemName, editAssetData.dailyProfit),
        product_type: String(editAssetData.operatorName || '').trim(),
        principal: parseFloat(editAssetData.quantity) || 0,
        rate: parseFloat(editAssetData.value) || 0
      };

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', assetId);

      if (error) throw error;

      alert(t('assetUpdated'));
      setEditingAssetId(null);
    } catch (e) {
      alert(t('updateFailed') + ': ' + e.message);
    }
  };

  // --- 自动结算利息 ---
  const autoSettleInterest = async (settleKeyParam, force = false, silent = false) => {
    try {
      const now = getShanghaiNow();
      const settleKey = settleKeyParam || getSettleWeekKey(now);

      const { data: exists, error: existsError } = await supabase
        .from('transactions')
        .select('id')
        .eq('status', 'approved')
        .in('type', ['interest_income', 'interest_expense', 'injection', 'withdraw_inj'])
        .ilike('remark', `%autoSettleKey:${settleKey}%`)
        .limit(1);

      if (existsError) throw existsError;
      if (!force && (exists || []).length > 0) {
        if (!silent) alert(t('alreadySettledToday'));
        console.log('⚠️ 本周已结算过，跳过自动结算', settleKey);
        return;
      }

      // 直接从 DB 查询最新数据，避免使用可能过时的 state
      const { data: freshTx } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'approved');
      const approved = freshTx || [];

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
      const assetDailyProfit = approved
        .filter(tx => tx.type === 'bank_asset')
        .reduce((sum, tx) => sum + parseBankAssetMeta(tx).dailyProfit, 0);
      const assetWeeklyProfit = assetDailyProfit * 7;
      
      let settledCount = 0;
      
      const settleTime = now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
      const settleId = Date.now(); // 为本次结算生成唯一ID

      const recordsToInsert = [];

      // 生成利息结算记录
      const forcedMark = force ? '\nforceSettle:true' : '';

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
          remark: `本周贷款利息自动结算\nautoSettleKey:${settleKey}${forcedMark}`
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
          remark: `注资账户利息自动结算\nautoSettleKey:${settleKey}${forcedMark}`
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
          remark: `存款账户利息自动结算\nautoSettleKey:${settleKey}${forcedMark}`
        });
        settledCount++;
      }

      if (assetWeeklyProfit > 0) {
        recordsToInsert.push({
          type: 'injection',
          client: 'EUU',
          principal: assetWeeklyProfit,
          rate: 0,
          timestamp: settleTime,
          created_by: 'System',
          creator_id: 'system',
          status: 'approved',
          settle_id: settleId,
          remark: `银行资产日利润自动结算 -> EUU注资\nautoSettleKey:${settleKey}${forcedMark}`
        });
        settledCount++;
      } else if (assetWeeklyProfit < 0) {
        recordsToInsert.push({
          type: 'withdraw_inj',
          client: 'EUU',
          principal: Math.abs(assetWeeklyProfit),
          rate: 0,
          timestamp: settleTime,
          created_by: 'System',
          creator_id: 'system',
          status: 'approved',
          settle_id: settleId,
          remark: `银行资产日利润自动结算(亏损) -> EUU扣款\nautoSettleKey:${settleKey}${forcedMark}`
        });
        settledCount++;
      }

      if (recordsToInsert.length > 0) {
        const { error } = await supabase.from('transactions').insert(recordsToInsert);
        if (error) throw error;

        const settledIncome = loanInterest;
        const settledExpense = injectionInterest + depositInterest;
        const euuInjection = Math.max(0, assetWeeklyProfit);
        const euuDeduction = Math.max(0, -assetWeeklyProfit);
        const msg = language === 'zh'
          ? `✅ 结算成功！\n收入: +${settledIncome.toFixed(3)}m\n支出: -${settledExpense.toFixed(3)}m\nEUU注资(资产周利润): +${euuInjection.toFixed(3)}m\nEUU扣款(资产周亏损): -${euuDeduction.toFixed(3)}m\n共生成 ${settledCount} 条记录`
          : `✅ Settlement successful!\nIncome: +${settledIncome.toFixed(3)}m\nExpense: -${settledExpense.toFixed(3)}m\nEUU injection (asset weekly profit): +${euuInjection.toFixed(3)}m\nEUU deduction (asset weekly loss): -${euuDeduction.toFixed(3)}m\nGenerated ${settledCount} records`;
        if (!silent) alert(msg);
        console.log('✅ 自动结算利息成功', settleKey);
      } else {
        if (!silent) alert(language === 'zh' ? '⚠️ 没有可结算的利息' : '⚠️ No interest to settle');
      }
    } catch (e) {
      console.error("自动结算利息失败:", e);
      if (!silent) alert(language === 'zh' ? `❌ 结算失败: ${e.message}` : `❌ Settlement failed: ${e.message}`);
    }
  };

  const handleForceSettleInterest = () => {
    setForceSettleConfirmStep(1);
  };

  const cancelForceSettleConfirm = () => {
    setForceSettleConfirmStep(0);
  };

  const confirmForceSettleInterest = async () => {
    if (forceSettleConfirmStep === 1) {
      setForceSettleConfirmStep(2);
      return;
    }
    setForceSettleConfirmStep(0);
    await autoSettleInterest(undefined, true);
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
      return setAuthError(t('authUserExists'));
    }
    if (authInput.username === 'EUU') {
      return setAuthError(t('authReservedAccount'));
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
      setAuthError(t('authRegisterFailed')); 
    }
  };

  const handleCRUD = async (action, payload = null) => {
    try {
      if (action === 'create') {
        if (payload.type === 'deposit') {
          if (payload.product_type === 'risk') {
            const targetClientName = String(payload.client || '').trim() || currentUser?.username;
            const targetClientUser = getUserByName(targetClientName) || (targetClientName === currentUser?.username ? (getUserByName(currentUser?.username) || currentUser) : null);
            if (!isLiuliEligibleUser(targetClientUser)) {
              return alert(t('liuliMemberRequired'));
            }
          }
          if (payload.product_type === 'risk') {
            payload = { ...payload, rate: 9 };
          } else if (payload.product_type === 'risk5') {
            payload = { ...payload, rate: 5 };
          } else if (payload.product_type === 'normal') {
            payload = { ...payload, rate: 2.5 };
          }
        }
        // 验证撤资和取款的额度限制（按目标用户名）
        if (payload.type === 'withdraw_inj') {
          const targetClient = payload.client || currentUser?.username;
          const { principals, available } = getAvailableForClient('injection', targetClient);
          if (principals === 0) {
            return alert(language === 'zh' ? '没有注资记录，无法撤资！' : 'No injection records, cannot withdraw!');
          }
          if (parseFloat(payload.principal) > available) {
            return alert(language === 'zh'
              ? `撤资金额不得超过可用金额 ${available.toFixed(3)}m (该用户注资+利息-已撤资)`
              : `Withdrawal amount cannot exceed available ${available.toFixed(3)}m`);
          }
        }

        if (payload.type === 'withdraw_dep') {
          const targetClient = payload.client || currentUser?.username;
          const pt = payload.product_type || 'normal';
          const { principals, available } = getAvailableForClient('deposit', targetClient, pt);
          if (principals === 0) {
            return alert(language === 'zh' ? '没有存款记录，无法取款！' : 'No deposit records, cannot withdraw!');
          }
          if (parseFloat(payload.principal) > available) {
            return alert(language === 'zh'
              ? `取款金额不得超过可用金额 ${available.toFixed(3)}m (该用户该产品存款+利息-已取款-债券占用)`
              : `Withdrawal amount cannot exceed available ${available.toFixed(3)}m`);
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

        if (newItem.status === 'approved' && ['withdraw_inj', 'withdraw_dep'].includes(newItem.type)) {
          await applyApprovedWithdrawalToBills(newItem);
        }
        
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
        if (!window.confirm(t('confirmDeleteRecordServer'))) return;
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
          if (txToReview.type === 'deposit' && txToReview.product_type === 'risk') {
            const targetClientName = String(txToReview.client || txToReview.created_by || '').trim();
            const targetClientUser = getUserByName(targetClientName);
            if (!isLiuliEligibleUser(targetClientUser)) {
              throw new Error(t('liuliMemberRequired'));
            }
          }

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

        if (action === 'approve' && txToReview && ['withdraw_inj', 'withdraw_dep'].includes(txToReview.type)) {
          await applyApprovedWithdrawalToBills({
            ...txToReview,
            ...updateData
          });
        }

        if (action === 'approve' && txToReview && txToReview.type === 'loan_repay_request') {
          const m = (txToReview.remark || '').match(/loan_id:([^\s]+)/);
          if (m) {
            const { error: loanDelError } = await supabase.from('transactions').delete().eq('id', m[1]);
            if (loanDelError) throw loanDelError;
          }
        }
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
        if (!window.confirm(t('confirmDeleteAllBills'))) return;
        
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

  const handleUserRepayLoan = async (loanId) => {
    if (!window.confirm(t('confirmRepayRequest'))) return;
    const loanTx = transactions.find(tx => tx.id === loanId);
    if (!loanTx) return alert('贷款记录不存在');
    const alreadyPending = transactions.some(
      tx => tx.type === 'loan_repay_request' && tx.status === 'pending' && (tx.remark || '').includes(`loan_id:${loanId}`)
    );
    if (alreadyPending) return alert(t('repayAlreadyPending'));
    try {
      const { error } = await supabase.from('transactions').insert([{
        type: 'loan_repay_request',
        client: loanTx.client || loanTx.created_by,
        principal: parseFloat(loanTx.principal) || 0,
        rate: parseFloat(loanTx.rate) || 0,
        status: 'pending',
        created_by: currentUser.username,
        creator_id: currentUser.id || 'unknown',
        timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
        remark: `loan_id:${loanId}`
      }]);
      if (error) throw error;
      await refreshTransactions();
    } catch (e) {
      alert('提交失败: ' + e.message);
    }
  };

  const openModal = (type, editItem = null) => {
    setModalType(type);
    setShowRiskEligibilityHint(false);
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
        product_type: (type === 'deposit' || type === 'withdraw_dep') ? 'normal' : (type === 'loan' ? 'interest' : '')
      });
    }
    setModalOpen(true);
  };

  // 计算当前用户个人的注资和存款账户余额（只统计client字段为当前用户的交易）
  // 包含已结算的利息
  const calcPersonalWithSettled = (types) => {
    const approved = transactions.filter(tx => tx.status === 'approved');

    // 获取对应类型的利息支出记录（用于计算已结算利息，与表格逻辑保持一致）
    const isDeposit = types.some(t => t === 'deposit');
    const isInjection = types.some(t => t === 'injection');
    const interestExpenseRecords = isDeposit
      ? approved.filter(tx => tx.type === 'interest_expense' && tx.client === '存款利息支出')
      : isInjection
        ? approved.filter(tx => tx.type === 'interest_expense' && tx.client === '注资利息支出')
        : [];

    return approved
      .filter(tx => types.includes(tx.type) && tx.client === currentUser?.username)
      .reduce((acc, cur) => {
        const principal = parseFloat(cur.principal) || 0;
        // 使用与账单表格相同的 getAccruedInterestForTx 计算已结算利息
        // 优先读 remark 中的手动覆盖次数，否则按 interest_expense 记录时间计算
        const accruedInterest = getAccruedInterestForTx(cur, interestExpenseRecords);
        return {
          p: acc.p + principal,
          total: acc.total + principal + accruedInterest
        };
      }, { p: 0, total: 0 });
  };

  const calculateFundBalanceForStats = () => {
    const source = fundTransactions.length
      ? fundTransactions
      : (transactions || []).filter(tx => ['bank_fund', 'fund_subscribe', 'fund_redeem', 'fund_profit', 'fund_loss', 'fund_profit_withdraw', 'fund_dividend_withdraw'].includes(tx.type));
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

    const fundProfit = approved
      .filter(tx => tx.type === 'fund_profit')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const fundLoss = approved
      .filter(tx => tx.type === 'fund_loss')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const profitWithdraw = approved
      .filter(tx => tx.type === 'fund_profit_withdraw')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const dividendWithdraw = approved
      .filter(tx => tx.type === 'fund_dividend_withdraw')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    const principalBase = bankNet + subscribed - redeemedPrincipal;
    const nav = principalBase + (fundProfit + fundLoss) - profitWithdraw - dividendWithdraw;
    return nav;
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
    // withdraw_inj/withdraw_dep 审批时已通过 applyApprovedWithdrawalToBills 直接
    // 修改了原注资/存款记录的 principal，无需再次扣减，否则会双重计算。
    const bondSubscribes = calc(['bond_subscribe']);
    // 债券赎回利息支出（本金已由申购记录变 rejected 自然消除）
    const bondRedeemInterest = approved
      .filter(tx => tx.type === 'bond_redeem_user')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0) * (parseFloat(tx.rate) || 0) / 100, 0);
    const fundingBase = injections.p + deposits.p + bondSubscribes.p - bondRedeemInterest;
    const totalRevenue = loans.i;
    const totalExpense = injections.i + deposits.i;
    const assetDailyProfit = approved
      .filter(tx => tx.type === 'bank_asset')
      .reduce((sum, tx) => sum + parseBankAssetMeta(tx).dailyProfit, 0);

    // 计算利息池 (每周净利息，利率已按周计)
    const interestPool = (totalRevenue - totalExpense) + (assetDailyProfit * 7);

    const personalInjections = calcPersonalWithSettled(['injection']);
    const personalDeposits = calcPersonalWithSettled(['deposit']);

    // withdraw_inj/withdraw_dep 审批时已通过 applyApprovedWithdrawalToBills 直接
    // 修改了原注资/存款记录的 principal，无需再次扣减，否则会双重计算。
    const injectionBalance = personalInjections.total;
    const bondUsed = approved
      .filter(tx => tx.type === 'bond_subscribe' && tx.created_by === currentUser?.username)
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const depositBalance = Math.max(0, personalDeposits.total - bondUsed);

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

    // 划拨银行注星：从闲置资金扣除
    const bankPlanetFundTotal = approved
      .filter(tx => tx.type === 'bank_planet_fund')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    // 从星星撤回资金：归还到银行余额
    const bankPlanetWithdrawTotal = approved
      .filter(tx => tx.type === 'bank_planet_withdraw')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    // 已结算利息净额：正数增加闲置资金，负数扣减闲置资金
    const settledInterestNet = approved.reduce((sum, tx) => {
      if (tx.type === 'interest_income') return sum + (parseFloat(tx.principal) || 0);
      if (tx.type === 'interest_expense') return sum - (parseFloat(tx.principal) || 0);
      return sum;
    }, 0);

    const fundBalance = calculateFundBalanceForStats();
    const totalAssets = (fundingBase - bankFundNetTransfer - bankPlanetFundTotal + bankPlanetWithdrawTotal + settledInterestNet) + bankAssetsValue + fundBalance;

    return {
      loanPrincipal: loans.p,
      totalAssets: totalAssets,
      totalLoans: loans.p,
      netCashFlow: interestPool,
      idleCash: fundingBase - loans.p - bankFundNetTransfer - bankPlanetFundTotal + bankPlanetWithdrawTotal + settledInterestNet,
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

    // withdraw_inj/withdraw_dep 已通过 applyApprovedWithdrawalToBills 修改了原记录 principal，
    // 无需再次扣减，否则会双重计算。
    const injectionBalance = personalInjections.total;
    const bondUsed = transactions
      .filter(tx => tx.status === 'approved' && tx.type === 'bond_subscribe' && tx.created_by === currentUser.username)
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const depositBalance = Math.max(0, personalDeposits.total - bondUsed);

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
    const source = fundTransactions.length
      ? fundTransactions
      : (transactions || []).filter(tx => ['bank_fund', 'fund_subscribe', 'fund_redeem', 'fund_profit', 'fund_loss', 'fund_profit_withdraw', 'fund_dividend_withdraw'].includes(tx.type));
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

    const fundProfit = approved
      .filter(tx => tx.type === 'fund_profit')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const fundLoss = approved
      .filter(tx => tx.type === 'fund_loss')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const profitWithdraw = approved
      .filter(tx => tx.type === 'fund_profit_withdraw')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    const dividendWithdraw = approved
      .filter(tx => tx.type === 'fund_dividend_withdraw')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    const principalBase = bankNet + subscribed - redeemedPrincipal;
    const nav = principalBase + (fundProfit + fundLoss) - profitWithdraw - dividendWithdraw;
    return nav;
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
        alert(t('noDividendToSettle'));
        return;
      }

      const fundPrincipal = calculateFundPrincipal();
      if (fundPrincipal <= 0.0000001) {
        alert(t('fundPrincipalZeroCannotSettle'));
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
        alert(t('noHoldersToSettle'));
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
        alert(t('noDividendToSettle'));
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
      alert(String(t('fundDividendSettled'))
        .replace('{count}', rows.length)
        .replace('{amount}', distributedTotal.toFixed(3) + 'm'));
    } catch (e) {
      alert(t('settleFailed') + ': ' + e.message);
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

    // 划拨银行注星：从银行余额中扣除
    const bankPlanetFundTotal = approved
      .filter(tx => tx.type === 'bank_planet_fund')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    // 从星星撤回资金：归还到银行余额
    const bankPlanetWithdrawTotal = approved
      .filter(tx => tx.type === 'bank_planet_withdraw')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    // 债券申购：计入银行总余额（已批准的认购资金归银行管理；赎回后申购记录变 rejected 自动清零）
    const bondSubscribeTotal = approved
      .filter(tx => tx.type === 'bond_subscribe')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);

    // 债券赎回利息支出：银行额外付出利息（本金已通过申购记录变 rejected 自然消除）
    const bondRedeemInterest = approved
      .filter(tx => tx.type === 'bond_redeem_user')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0) * (parseFloat(tx.rate) || 0) / 100, 0);

    // 已结算利息净额：每周结算后会进入闲置资金（负数则扣减）
    const settledInterestNet = approved.reduce((sum, tx) => {
      if (tx.type === 'interest_income') return sum + (parseFloat(tx.principal) || 0);
      if (tx.type === 'interest_expense') return sum - (parseFloat(tx.principal) || 0);
      return sum;
    }, 0);

    const idleCash = injections.p + bondSubscribeTotal - bondRedeemInterest - loans.p - bankFundNetTransfer - bankPlanetFundTotal + bankPlanetWithdrawTotal + settledInterestNet;
    
    console.log('银行闲置资金计算（当前状态）:', {
      总负债: injections.p,
      贷款资产: loans.p,
      银行基金净转账: bankFundNetTransfer,
      已结算利息净额: settledInterestNet,
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
             <h1 className="text-2xl font-bold">{t('appNotConnectedTitle')}</h1>
          </div>
          <p className="mb-4">{t('appNotConnectedHint')}</p>
          
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto mb-6 text-sm font-mono">
            <p className="text-slate-500 mb-2">{t('appNotConnectedVarsHint')}</p>
            <p>VITE_SUPABASE_URL=https://xxx.supabase.co</p>
            <p>VITE_SUPABASE_ANON_KEY=sb_publishable_...</p>
          </div>
          <p className="text-sm text-gray-600">{t('appNotConnectedRedeployHint')}</p>
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
            {language === 'zh' ? 'EN' : t('langChinese')}
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
            <div>
              <input type="text" required placeholder={t('accountPlaceholder')} value={authInput.username} onChange={e => setAuthInput({...authInput, username: e.target.value})} className="w-full border-2 border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
              <p className="mt-1.5 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 flex items-center gap-1.5">
                <span className="shrink-0">⚠️</span>
                {language === 'zh'
                  ? (authMode === 'register' ? '请使用您的公司董事名称作为账号，勿使用邮箱或其他格式' : '账号为您的公司董事名称')
                  : (authMode === 'register' ? 'Use your company director name as username, not email or other formats' : 'Your username is your company director name')}
              </p>
            </div>
            <input type="password" required placeholder={t('passwordPlaceholder')} value={authInput.password} onChange={e => setAuthInput({...authInput, password: e.target.value})} className="w-full border-2 border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none" />
            {authError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 border border-red-200"><AlertCircle className="w-4 h-4"/>{authError}</div>}
            <button disabled={connectionStatus !== 'connected'} type="submit" className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-slate-400 text-white font-bold py-3 transition-all shadow-lg">{authMode === 'login' ? t('loginButton') : t('registerButton')}</button>
          </form>
          <div className="mt-6 text-center text-sm"><button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-green-600 hover:text-green-700 hover:underline font-medium">{authMode === 'login' ? t('noAccount') : t('backToLogin')}</button></div>
        </div>
      </div>
    );
  }

  const currentUserRecord = getUserByName(currentUser?.username) || currentUser;
  const currentUserRole = currentUserRecord?.role || currentUser?.role || 'user';
  const isAdmin = currentUserRole === 'admin';
  const canUseRiskDeposit = isLiuliEligibleUser(currentUserRecord);
  const depositTargetNameForForm = isAdmin ? String(formData?.client || '').trim() : String(currentUser?.username || '').trim();
  const depositTargetUserForForm = depositTargetNameForForm ? (getUserByName(depositTargetNameForForm) || (depositTargetNameForForm === currentUser?.username ? currentUserRecord : null)) : null;
  const canSelectRiskDeposit = modalType === 'deposit' ? isLiuliEligibleUser(depositTargetUserForForm) : canUseRiskDeposit;

  const accountUsersFiltered = (() => {
    const q = String(accountSearch || '').trim().toLowerCase();
    const sorted = [...(registeredUsers || [])].sort((a, b) => String(a.username || '').localeCompare(String(b.username || '')));
    if (!q) return sorted;
    return sorted.filter(u => String(u.username || '').toLowerCase().includes(q));
  })();

  const pendingTx = Array.isArray(transactions) ? transactions.filter(tx => tx && tx.id && tx.status === 'pending') : [];
  // 注资账单公开所有人可见，其他账单显示：自己的所有记录 + 已批准的他人记录
  const displayTx = isAdmin ? transactions : transactions.filter(tx => 
    tx.created_by === currentUser?.username || tx.status === 'approved' || ['injection', 'withdraw_inj'].includes(tx.type)
  );

  const approvedInterestExpense = transactions.filter(tx => tx.status === 'approved' && tx.type === 'interest_expense');
  const injectionInterestExpense = approvedInterestExpense.filter(tx => tx.client === '注资利息支出');
  const depositInterestExpense = approvedInterestExpense.filter(tx => tx.client === '存款利息支出');

  const getProductTypeLabelForTx = (row) => {
    if (row.type === 'deposit') {
      if (row.product_type === 'risk') return t('riskDeposit');
      if (row.product_type === 'risk5') return t('riskDeposit5');
      return t('normalDeposit');
    } else if (row.type === 'loan') {
      return row.product_type === 'stable' ? t('stableLoan') : t('interestLoan');
    }
    return '';
  };

  const injectionRows = displayTx.filter(tx => tx.type === 'injection');
  const depositRows = displayTx.filter(tx => tx.type === 'deposit');

  const injectionDataForTable = isAdmin
    ? injectionRows
    : aggregateAccountByClient(
        injectionRows,
        injectionInterestExpense,
        'injection',
        (tx, clientKey) => `${clientKey}::${tx.status || 'approved'}`
      );

  const depositDataForTable = isAdmin
    ? depositRows
    : aggregateAccountByClient(
        depositRows,
        depositInterestExpense,
        'deposit',
        (tx, clientKey) => `${clientKey}::${tx.status || 'approved'}`
      );

  const handleAggregatedEdit = async (row, field, newValue) => {
    try {
      if (!row?.source_ids?.length) return;

      const numValue = parseFloat(newValue);
      if (isNaN(numValue) || numValue < 0) {
        alert(t('invalidNumber'));
        return;
      }

      const repId = row.source_ids[0];
      const otherIds = row.source_ids.slice(1);

      if (field === 'settlement_count') {
        const { error } = await supabase
          .from('transactions')
          .update({ remark: `${t('interestCountPrefix')}:${Math.round(numValue)}` })
          .eq('id', repId);
        if (error) throw error;
        return;
      }

      if (field === 'principal') {
        const { error: repError } = await supabase
          .from('transactions')
          .update({ principal: numValue, rate: row.rate })
          .eq('id', repId);
        if (repError) throw repError;

        if (otherIds.length > 0) {
          const { error: othersError } = await supabase
            .from('transactions')
            .delete()
            .in('id', otherIds);
          if (othersError) throw othersError;
        }
      }
    } catch (e) {
      alert(t('updateFailed') + ': ' + e.message);
    }
  };

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
                          <span>{new Date(post.created_at).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}</span>
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
                                {isExpanded ? t('collapse') : t('viewFull')}
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
                            language={language}
                            t={t}
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
                      placeholder={t('titlePlaceholder')}
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
                      placeholder={t('contentPlaceholder')}
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
        const key = tx.client || t('unknown');
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
                {t('bondsTitle')}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">{t('bondsSubtitle')}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setCurrentPage('bank')} className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-medium transition-colors border border-amber-200">
                {t('backToBank')}
              </button>
              {isAdmin && (
                <button onClick={() => setBondIssueModal(true)} className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-4 py-2 font-bold transition-all shadow">
                  {t('issueBond')}
                </button>
              )}
            </div>
          </div>

          <div className="bg-white border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">{t('myBondHolding')}</div>
              <div className="text-base font-semibold text-gray-900">{formatMoney(myBond)}</div>
            </div>
            <div className="text-xs text-gray-400 mt-2">{t('bondSubscribeOccupyNote')}</div>
          </div>

          <div className="bg-white border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-800">{t('onSaleBonds')}</div>
              <div className="text-xs text-gray-500">{String(t('productCount')).replace('{count}', bondProducts.length)}</div>
            </div>
            {bondProducts.length === 0 ? (
              <div className="text-center text-gray-400 py-10">{t('noOnSaleBonds')}</div>
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
                          {p.category === 'long' ? t('longTerm') : t('shortTerm')}
                        </div>
                      </div>
                      {p.description && (
                        <div className="mt-2 text-xs text-gray-500 leading-relaxed border-l-2 border-amber-300 pl-2">{p.description}</div>
                      )}
                      <div className="mt-2 text-sm text-gray-600">{t('termLabel')}：{p.term_days} {language === 'zh' ? '天' : 'days'}</div>
                      <div className="mt-1 text-sm text-gray-600">{t('rateLabelPerWeek')}：{parseFloat(p.rate_per_week || 0).toFixed(2)}%</div>
                      <div className="mt-1 text-xs text-gray-500">{t('issueLabel')}：{formatMoney(p.total_supply)}，{t('soldLabel')}：{formatMoney(sold)}，{t('remainingLabel')}：{formatMoney(remaining)}</div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <button
                          onClick={() => { setBondSubscribeTarget(p); setBondSubscribeModal(true); }}
                          className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-4 py-1.5 text-sm font-bold transition-all"
                        >
                          {t('subscribe')}
                        </button>
                        {isAdmin && (
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleEndBondIssue(p)} className="text-gray-700 hover:text-gray-900 p-2 hover:bg-gray-50 border border-gray-200" title={t('endIssue')}><Lock className="w-4 h-4" /></button>
                            <button onClick={() => handleRedeemAllBond(p)} className="text-green-700 hover:text-green-900 p-2 hover:bg-green-50 border border-green-200" title={t('redeemAll')}><CheckSquare className="w-4 h-4" /></button>
                            <button onClick={() => openBondEditModal(p)} className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 border border-blue-200" title={t('editShort')}><Edit className="w-4 h-4" /></button>
                            <button onClick={() => handleDeleteBondProduct(p)} className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 border border-red-200" title={t('delete')}><Trash2 className="w-4 h-4" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* 我的持仓明细 + 赎回账单 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 左：持仓明细 */}
            {(() => {
              const myHoldings = approvedAll.filter(tx => tx.type === 'bond_subscribe' && tx.created_by === currentUser?.username);
              return (
                <div className="bg-white border border-amber-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-800">{language === 'zh' ? '我的持仓明细（已审批）' : 'My Holdings'}</div>
                    <div className="text-xs text-gray-500">{language === 'zh' ? `共 ${myHoldings.length} 笔` : `${myHoldings.length} records`}</div>
                  </div>
                  {myHoldings.length === 0 ? (
                    <div className="text-center text-gray-400 py-6 text-sm">{language === 'zh' ? '暂无持仓' : 'No holdings'}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-amber-200">
                            <th className="py-2 pr-3">{language === 'zh' ? '债券名称' : 'Bond'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '申购金额' : 'Amount'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '总利率' : 'Rate'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '申购时间' : 'Date'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {myHoldings.map(row => (
                            <tr key={row.id} className="border-b border-gray-100 text-gray-700">
                              <td className="py-2 pr-3 font-semibold text-amber-700">{row.client || '-'}</td>
                              <td className="py-2 pr-3 font-bold">{formatMoney(row.principal)}</td>
                              <td className="py-2 pr-3">{parseFloat(row.rate || 0).toFixed(2)}%</td>
                              <td className="py-2 pr-3 whitespace-nowrap text-gray-500">{row.timestamp || row.created_at || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-amber-200">
                            <td className="py-2 pr-3 font-bold text-gray-700">{language === 'zh' ? '合计' : 'Total'}</td>
                            <td className="py-2 pr-3 font-bold text-amber-600">{formatMoney(myHoldings.reduce((s, r) => s + (parseFloat(r.principal) || 0), 0))}</td>
                            <td colSpan={2}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* 右：赎回账单 */}
            {(() => {
              const allRedeems = (transactions || [])
                .filter(tx => tx.type === 'bond_redeem_user' && (isAdmin || tx.created_by === currentUser?.username))
                .slice().sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));
              return (
                <div className="bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="font-semibold text-gray-800">{language === 'zh' ? (isAdmin ? '全员赎回账单（管理员）' : '我的赎回账单') : (isAdmin ? 'All Redeem Bills (Admin)' : 'My Redeem Bills')}</div>
                    <div className="flex items-center gap-2">
                      {isAdmin && selectedRedeemIds.size > 0 && (
                        <button
                          onClick={handleBatchDeleteRedeem}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1 rounded"
                        >
                          {language === 'zh' ? `删除选中 (${selectedRedeemIds.size})` : `Delete (${selectedRedeemIds.size})`}
                        </button>
                      )}
                      <div className="text-xs text-gray-500">{language === 'zh' ? `共 ${allRedeems.length} 笔` : `${allRedeems.length} records`}</div>
                    </div>
                  </div>
                  {allRedeems.length === 0 ? (
                    <div className="text-center text-gray-400 py-6 text-sm">{language === 'zh' ? '暂无赎回记录' : 'No redeem records'}</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-green-200">
                            {isAdmin && (
                              <th className="py-2 pr-2 w-6">
                                <input
                                  type="checkbox"
                                  checked={allRedeems.length > 0 && allRedeems.every(r => selectedRedeemIds.has(r.id))}
                                  onChange={e => {
                                    if (e.target.checked) setSelectedRedeemIds(new Set(allRedeems.map(r => r.id)));
                                    else setSelectedRedeemIds(new Set());
                                  }}
                                  className="cursor-pointer"
                                />
                              </th>
                            )}
                            {isAdmin && <th className="py-2 pr-3">{language === 'zh' ? '用户' : 'User'}</th>}
                            <th className="py-2 pr-3">{language === 'zh' ? '债券' : 'Bond'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '本金' : 'Principal'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '利息' : 'Interest'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '合计' : 'Total'}</th>
                            <th className="py-2 pr-3">{language === 'zh' ? '时间' : 'Date'}</th>
                            {isAdmin && <th className="py-2 pr-3">{language === 'zh' ? '操作' : 'Actions'}</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {allRedeems.map(row => {
                            const p = parseFloat(row.principal) || 0;
                            const interest = p * (parseFloat(row.rate) || 0) / 100;
                            const total = p + interest;
                            const isSelected = selectedRedeemIds.has(row.id);
                            return editingRedeemId === row.id ? (
                              <tr key={row.id} className="border-b border-green-100 bg-green-50">
                                {isAdmin && <td className="py-2 pr-2"><input type="checkbox" checked={isSelected} onChange={() => {}} className="cursor-pointer opacity-50" disabled /></td>}
                                {isAdmin && <td className="py-2 pr-2 text-blue-700 font-semibold">{row.created_by || '-'}</td>}
                                <td className="py-2 pr-2">
                                  <input className="border border-green-300 rounded px-1.5 py-1 text-xs w-full outline-none" value={editRedeemData.client} onChange={e => setEditRedeemData(d => ({ ...d, client: e.target.value }))} />
                                </td>
                                <td className="py-2 pr-2">
                                  <input type="number" className="border border-green-300 rounded px-1.5 py-1 text-xs w-20 outline-none" value={editRedeemData.principal} onChange={e => setEditRedeemData(d => ({ ...d, principal: e.target.value }))} />
                                </td>
                                <td className="py-2 pr-2">
                                  <input type="number" className="border border-green-300 rounded px-1.5 py-1 text-xs w-14 outline-none" value={editRedeemData.rate} onChange={e => setEditRedeemData(d => ({ ...d, rate: e.target.value }))} placeholder="%" />
                                </td>
                                <td className="py-2 pr-2 text-gray-400 text-[10px]">{language === 'zh' ? '(自动)' : 'auto'}</td>
                                <td className="py-2 pr-2 whitespace-nowrap text-gray-500">{row.timestamp || '-'}</td>
                                {isAdmin && (
                                  <td className="py-2 pr-2">
                                    <div className="flex gap-1">
                                      <button onClick={() => handleUpdateRedeem(row.id)} className="bg-green-500 hover:bg-green-600 text-white text-[10px] font-bold px-2 py-1 rounded">{language === 'zh' ? '保存' : 'Save'}</button>
                                      <button onClick={() => setEditingRedeemId(null)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-bold px-2 py-1 rounded">{language === 'zh' ? '取消' : 'Cancel'}</button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ) : (
                              <tr key={row.id} className={`border-b border-gray-100 text-gray-700 hover:bg-green-50 ${isSelected ? 'bg-red-50' : ''}`}>
                                {isAdmin && (
                                  <td className="py-2 pr-2">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => {
                                        setSelectedRedeemIds(prev => {
                                          const next = new Set(prev);
                                          if (next.has(row.id)) next.delete(row.id);
                                          else next.add(row.id);
                                          return next;
                                        });
                                      }}
                                      className="cursor-pointer"
                                    />
                                  </td>
                                )}
                                {isAdmin && <td className="py-2 pr-3 font-semibold text-blue-700">{row.created_by || '-'}</td>}
                                <td className="py-2 pr-3 font-semibold text-amber-700">{row.client || '-'}</td>
                                <td className="py-2 pr-3 font-bold">{formatMoney(p)}</td>
                                <td className="py-2 pr-3 text-green-600 font-semibold">+{formatMoney(interest)}</td>
                                <td className="py-2 pr-3 font-bold text-emerald-700">{formatMoney(total)}</td>
                                <td className="py-2 pr-3 whitespace-nowrap text-gray-500">{row.timestamp || row.created_at || '-'}</td>
                                {isAdmin && (
                                  <td className="py-2 pr-3 whitespace-nowrap">
                                    <div className="flex gap-1">
                                      <button onClick={() => { setEditingRedeemId(row.id); setEditRedeemData({ client: row.client || '', principal: row.principal || '', rate: row.rate || '' }); }} className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">{language === 'zh' ? '编辑' : 'Edit'}</button>
                                      <button onClick={() => handleDeleteRedeem(row.id)} className="bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold px-2 py-1 rounded">{language === 'zh' ? '删除' : 'Delete'}</button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-green-200">
                            <td colSpan={isAdmin ? 3 : 1} className="py-2 pr-3 font-bold text-gray-700">{language === 'zh' ? '合计' : 'Total'}</td>
                            <td className="py-2 pr-3 font-bold text-amber-600">{formatMoney(allRedeems.reduce((s, r) => s + (parseFloat(r.principal) || 0), 0))}</td>
                            <td className="py-2 pr-3 font-bold text-green-600">+{formatMoney(allRedeems.reduce((s, r) => s + (parseFloat(r.principal) || 0) * (parseFloat(r.rate) || 0) / 100, 0))}</td>
                            <td className="py-2 pr-3 font-bold text-emerald-700">{formatMoney(allRedeems.reduce((s, r) => { const p = parseFloat(r.principal) || 0; return s + p + p * (parseFloat(r.rate) || 0) / 100; }, 0))}</td>
                            <td colSpan={isAdmin ? 2 : 1}></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* 管理员：全员持仓总账单 */}
          {isAdmin && (() => {
            const allHoldings = approvedAll.filter(tx => tx.type === 'bond_subscribe').slice().sort((a, b) => new Date(b.timestamp || b.created_at || 0) - new Date(a.timestamp || a.created_at || 0));
            return (
              <div className="bg-white border border-amber-300 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-gray-800">{language === 'zh' ? '全员持仓总账单（管理员）' : 'All Holdings (Admin)'}</div>
                  <div className="text-xs text-gray-500">{language === 'zh' ? `共 ${allHoldings.length} 笔` : `${allHoldings.length} records`}</div>
                </div>
                {allHoldings.length === 0 ? (
                  <div className="text-center text-gray-400 py-6 text-sm">{language === 'zh' ? '暂无记录' : 'No records'}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-amber-300">
                          <th className="py-2 pr-4">{language === 'zh' ? '用户' : 'User'}</th>
                          <th className="py-2 pr-4">{language === 'zh' ? '债券名称' : 'Bond'}</th>
                          <th className="py-2 pr-4">{language === 'zh' ? '申购金额' : 'Amount'}</th>
                          <th className="py-2 pr-4">{language === 'zh' ? '总利率' : 'Rate'}</th>
                          <th className="py-2 pr-4">{language === 'zh' ? '申购时间' : 'Date'}</th>
                          <th className="py-2 pr-4">{language === 'zh' ? '操作' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allHoldings.map(row => (
                          editingHoldingId === row.id ? (
                            <tr key={row.id} className="border-b border-amber-200 bg-amber-50">
                              <td className="py-2 pr-2 font-semibold text-blue-700">{row.created_by || '-'}</td>
                              <td className="py-2 pr-2">
                                <input
                                  className="border border-amber-300 rounded px-1.5 py-1 text-xs w-full outline-none focus:border-amber-500"
                                  value={editHoldingData.client}
                                  onChange={e => setEditHoldingData(p => ({ ...p, client: e.target.value }))}
                                  placeholder={language === 'zh' ? '债券名称' : 'Bond name'}
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  className="border border-amber-300 rounded px-1.5 py-1 text-xs w-24 outline-none focus:border-amber-500"
                                  value={editHoldingData.principal}
                                  onChange={e => setEditHoldingData(p => ({ ...p, principal: e.target.value }))}
                                  placeholder="0"
                                />
                              </td>
                              <td className="py-2 pr-2">
                                <input
                                  type="number"
                                  className="border border-amber-300 rounded px-1.5 py-1 text-xs w-16 outline-none focus:border-amber-500"
                                  value={editHoldingData.rate}
                                  onChange={e => setEditHoldingData(p => ({ ...p, rate: e.target.value }))}
                                  placeholder="0"
                                />
                              </td>
                              <td className="py-2 pr-2 whitespace-nowrap text-gray-500">{row.timestamp || row.created_at || '-'}</td>
                              <td className="py-2 pr-2 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleUpdateHolding(row.id)}
                                    className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold px-2 py-1 rounded"
                                  >{language === 'zh' ? '保存' : 'Save'}</button>
                                  <button
                                    onClick={() => setEditingHoldingId(null)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-bold px-2 py-1 rounded"
                                  >{language === 'zh' ? '取消' : 'Cancel'}</button>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            <tr key={row.id} className="border-b border-gray-100 text-gray-700 hover:bg-amber-50">
                              <td className="py-2 pr-4 font-semibold text-blue-700">{row.created_by || '-'}</td>
                              <td className="py-2 pr-4 font-semibold text-amber-700">{row.client || '-'}</td>
                              <td className="py-2 pr-4 font-bold">{formatMoney(row.principal)}</td>
                              <td className="py-2 pr-4">{parseFloat(row.rate || 0).toFixed(2)}%</td>
                              <td className="py-2 pr-4 whitespace-nowrap text-gray-500">{row.timestamp || row.created_at || '-'}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => { setEditingHoldingId(row.id); setEditHoldingData({ client: row.client || '', principal: row.principal || '', rate: row.rate || '' }); }}
                                    className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-[10px] font-bold px-2 py-1 rounded"
                                  >{language === 'zh' ? '编辑' : 'Edit'}</button>
                                  <button
                                    onClick={() => handleDeleteHolding(row.id)}
                                    className="bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-bold px-2 py-1 rounded"
                                  >{language === 'zh' ? '删除' : 'Delete'}</button>
                                </div>
                              </td>
                            </tr>
                          )
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-amber-300">
                          <td colSpan={2} className="py-2 pr-4 font-bold text-gray-700">{language === 'zh' ? '总计' : 'Total'}</td>
                          <td className="py-2 pr-4 font-bold text-amber-600">{formatMoney(allHoldings.reduce((s, r) => s + (parseFloat(r.principal) || 0), 0))}</td>
                          <td colSpan={3}></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            );
          })()}

          {isAdmin && <div className="bg-white border border-amber-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-gray-800">{t('bondBillsPublic')}</div>
              <div className="text-xs text-gray-500">{String(t('billCount')).replace('{count}', bondBills.length)}</div>
            </div>
            {bondBills.length === 0 ? (
              <div className="text-center text-gray-400 py-10">{t('noBills')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-amber-200">
                      <th className="py-2 pr-3">{t('billTime')}</th>
                      <th className="py-2 pr-3">{t('billType')}</th>
                      <th className="py-2 pr-3">{t('billUser')}</th>
                      <th className="py-2 pr-3">{t('billBond')}</th>
                      <th className="py-2 pr-3 text-right">{t('billAmount')}</th>
                      <th className="py-2 pr-3">{t('billStatus')}</th>
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
          </div>}

          {bondEditModal && isAdmin && bondEditTarget && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
              <div className="bg-white border-2 border-amber-200 shadow-2xl max-w-md w-full p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">{t('bondEditTitle')}</h3>
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('bondName')}</label>
                    <input value={bondEditData.name} onChange={e => setBondEditData({ ...bondEditData, name: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{language === 'zh' ? '债券描述（选填）' : 'Description (optional)'}</label>
                    <textarea
                      rows={2}
                      value={bondEditData.description}
                      onChange={e => setBondEditData({ ...bondEditData, description: e.target.value })}
                      className="w-full border-2 border-amber-200 px-3 py-2 outline-none resize-none text-sm"
                      placeholder={language === 'zh' ? '简要描述债券用途、风险等信息…' : 'Brief description of the bond…'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('category')}</label>
                      <select value={bondEditData.category} onChange={e => setBondEditData({ ...bondEditData, category: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none">
                        <option value="short">{t('shortTerm')}</option>
                        <option value="long">{t('longTerm')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('termDays')}</label>
                      <input value={bondEditData.term_days} onChange={e => setBondEditData({ ...bondEditData, term_days: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{language === 'zh' ? '总利率(%)' : 'Total Rate (%)'}</label>
                      <input value={bondEditData.rate_per_week} onChange={e => setBondEditData({ ...bondEditData, rate_per_week: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('totalSupplyM')}</label>
                      <input value={bondEditData.total_supply} onChange={e => setBondEditData({ ...bondEditData, total_supply: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 transition-all">
                    {t('saveChanges')}
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
                    <h3 className="font-bold text-xl text-gray-900">{t('createBondTitle')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{t('createBondSubtitle')}</p>
                  </div>
                  <button onClick={() => setBondIssueModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form onSubmit={handleCreateBondProduct} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t('bondName')}</label>
                    <input value={bondIssueData.name} onChange={e => setBondIssueData({ ...bondIssueData, name: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{language === 'zh' ? '债券描述（选填）' : 'Description (optional)'}</label>
                    <textarea
                      rows={2}
                      value={bondIssueData.description}
                      onChange={e => setBondIssueData({ ...bondIssueData, description: e.target.value })}
                      className="w-full border-2 border-amber-200 px-3 py-2 outline-none resize-none text-sm"
                      placeholder={language === 'zh' ? '简要描述债券用途、风险等信息…' : 'Brief description of the bond…'}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('category')}</label>
                      <select value={bondIssueData.category} onChange={e => setBondIssueData({ ...bondIssueData, category: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none">
                        <option value="short">{t('shortTerm')}</option>
                        <option value="long">{t('longTerm')}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('termDays')}</label>
                      <input value={bondIssueData.term_days} onChange={e => setBondIssueData({ ...bondIssueData, term_days: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{language === 'zh' ? '总利率(%)' : 'Total Rate (%)'}</label>
                      <input value={bondIssueData.rate_per_week} onChange={e => setBondIssueData({ ...bondIssueData, rate_per_week: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t('totalSupplyM')}</label>
                      <input value={bondIssueData.total_supply} onChange={e => setBondIssueData({ ...bondIssueData, total_supply: e.target.value })} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 transition-all">
                    {t('createAndIssue')}
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
                    <h3 className="font-bold text-xl text-gray-900">{t('subscribeBondTitle')}</h3>
                    <p className="text-sm text-gray-500 mt-1">{bondSubscribeTarget.name}</p>
                  </div>
                  <button onClick={() => { setBondSubscribeModal(false); setBondSubscribeNote(''); }} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>{t('category')}：{bondSubscribeTarget.category === 'long' ? t('longTerm') : t('shortTerm')}</div>
                  <div>{t('termLabel')}：{bondSubscribeTarget.term_days} {language === 'zh' ? '天' : 'days'}</div>
                  <div>{t('rateLabelPerWeek')}：{parseFloat(bondSubscribeTarget.rate_per_week || 0).toFixed(2)}%</div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t('subscribeAmountM')}</label>
                  <input value={bondSubscribeAmount} onChange={e => setBondSubscribeAmount(e.target.value)} className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none" />
                  <p className="text-xs text-gray-500 mt-2">{t('requiresApproval')}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{language === 'zh' ? '备注说明（选填）' : 'Note (optional)'}</label>
                  <textarea
                    value={bondSubscribeNote}
                    onChange={e => setBondSubscribeNote(e.target.value)}
                    rows={3}
                    placeholder={language === 'zh' ? '可填写申购说明...' : 'Optional note...'}
                    className="w-full border-2 border-amber-200 px-3 py-2.5 outline-none resize-none text-sm"
                  />
                  <p className="text-xs text-amber-600 mt-1 font-medium">{language === 'zh' ? '请同时将购买合同发送给 EUU' : 'Please also send the purchase contract to EUU'}</p>
                </div>
                <button onClick={submitBondSubscribe} className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold py-3 transition-all">
                  {t('submitSubscribe')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'liuli') {
    return (
      <div className="min-h-screen bg-[#F0FAF4] text-gray-800 p-4 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage('bank')}
              className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-medium transition-colors border border-emerald-200 flex items-center gap-2"
            >
              {language === 'zh' ? '返回主页' : 'Back'}
            </button>
            <div className="text-right">
              <h1 className="text-3xl font-black tracking-wide bg-gradient-to-r from-emerald-400 via-teal-500 to-green-600 bg-clip-text text-transparent animate-gradient">琉璃</h1>
              <div className="text-xs text-gray-500">Liuli</div>
            </div>
          </div>

          <div className="bg-white border border-emerald-200 p-2">
            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setLiuliActiveTab('flights')}
                className={`px-4 py-2 text-sm font-bold border transition-colors whitespace-nowrap ${
                  liuliActiveTab === 'flights'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {language === 'zh' ? '飞船航班信息' : 'Flights'}
              </button>
              <button
                onClick={() => setLiuliActiveTab('productivity')}
                className={`px-4 py-2 text-sm font-bold border transition-colors whitespace-nowrap ${
                  liuliActiveTab === 'productivity'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {language === 'zh' ? '生产力信息' : 'Productivity'}
              </button>
              <button
                onClick={() => setLiuliActiveTab('material_requests')}
                className={`px-4 py-2 text-sm font-bold border transition-colors whitespace-nowrap ${
                  liuliActiveTab === 'material_requests'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {language === 'zh' ? '建材汇总申请' : 'Material Requests'}
              </button>
              <button
                onClick={() => setLiuliActiveTab('material_supply')}
                className={`px-4 py-2 text-sm font-bold border transition-colors whitespace-nowrap ${
                  liuliActiveTab === 'material_supply'
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                }`}
              >
                {language === 'zh' ? '建材生产信息' : 'Material Supply'}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {liuliFlightModal ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white border-2 border-emerald-200 shadow-2xl max-w-lg w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-black text-lg">{language === 'zh' ? '飞船航班登记' : 'Flight Register'}</div>
                    <button
                      onClick={() => setLiuliFlightModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <input
                    value={liuliFlightForm.name}
                    onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={language === 'zh' ? '名称' : 'Name'}
                    className="w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input
                      value={liuliFlightForm.from}
                      onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, from: e.target.value }))}
                      placeholder={language === 'zh' ? '出发地' : 'From'}
                      className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                    />
                    <input
                      value={liuliFlightForm.to}
                      onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, to: e.target.value }))}
                      placeholder={language === 'zh' ? '目的地' : 'To'}
                      className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                    />
                  </div>
                  <textarea
                    value={liuliFlightForm.note}
                    onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder={language === 'zh' ? '注释' : 'Note'}
                    rows={2}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200 resize-none"
                  />
                  <select
                    value={liuliFlightForm.shipType}
                    onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, shipType: e.target.value }))}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                  >
                    <option value="SCB">SCB (500/500)</option>
                    <option value="WCB">WCB (3000/1000)</option>
                    <option value="LCB">LCB (2000/2000)</option>
                    <option value="HCB">HCB (5000/5000)</option>
                    <option value="VCB">VCB (1000/3000)</option>
                  </select>
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="liuliRoundTrip"
                      checked={liuliFlightForm.roundTrip}
                      onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, roundTrip: e.target.checked }))}
                      className="w-4 h-4 text-teal-600 border-2 border-emerald-100 rounded focus:ring-2 focus:ring-emerald-300"
                    />
                    <label htmlFor="liuliRoundTrip" className="text-sm text-gray-700 select-none cursor-pointer">
                      {language === 'zh' ? '往返' : 'Round Trip'}
                    </label>
                  </div>
                  {liuliFlightForm.roundTrip && (
                    <>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <input
                          value={liuliFlightForm.returnFrom}
                          onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, returnFrom: e.target.value }))}
                          placeholder={language === 'zh' ? '返程出发地' : 'Return From'}
                          className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                        />
                        <input
                          value={liuliFlightForm.returnTo}
                          onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, returnTo: e.target.value }))}
                          placeholder={language === 'zh' ? '返程目的地' : 'Return To'}
                          className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                        />
                      </div>
                      <textarea
                        value={liuliFlightForm.returnNote}
                        onChange={(e) => setLiuliFlightForm(prev => ({ ...prev, returnNote: e.target.value }))}
                        placeholder={language === 'zh' ? '返程注释' : 'Return Note'}
                        rows={2}
                        className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200 resize-none"
                      />
                    </>
                  )}

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLiuliFlightModal(false)}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-bold transition-colors border border-emerald-200"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await addLiuliFlight();
                        if (ok) setLiuliFlightModal(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition-colors"
                    >
                      {language === 'zh' ? '登记航班' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {liuliProductModal ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white border-2 border-emerald-200 shadow-2xl max-w-lg w-full p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-black text-lg">{language === 'zh' ? '生产力登记' : 'Productivity Register'}</div>
                    <button
                      onClick={() => setLiuliProductModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <input
                    value={liuliProductForm.name}
                    onChange={(e) => setLiuliProductForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={language === 'zh' ? '名称' : 'Name'}
                    className="w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                  />
                  <input
                    value={liuliProductForm.itemName}
                    onChange={(e) => setLiuliProductForm(prev => ({ ...prev, itemName: e.target.value }))}
                    placeholder={language === 'zh' ? '物品名称' : 'Item Name'}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                  />
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input
                      value={liuliProductForm.perDay}
                      onChange={(e) => setLiuliProductForm(prev => ({ ...prev, perDay: e.target.value }))}
                      placeholder={language === 'zh' ? '每天产量' : 'Per Day'}
                      type="number"
                      step="0.001"
                      className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                    />
                    <input
                      value={liuliProductForm.pickup}
                      onChange={(e) => setLiuliProductForm(prev => ({ ...prev, pickup: e.target.value }))}
                      placeholder={language === 'zh' ? '取货地' : 'Pickup'}
                      className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                    />
                  </div>
                  <textarea
                    value={liuliProductForm.note}
                    onChange={(e) => setLiuliProductForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder={language === 'zh' ? '注释' : 'Note'}
                    rows={2}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200 resize-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLiuliProductModal(false)}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-bold transition-colors border border-emerald-200"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await addLiuliProduct();
                        if (ok) setLiuliProductModal(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition-colors"
                    >
                      {language === 'zh' ? '登记产量' : 'Add'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {liuliMaterialDemandModal ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white border-2 border-emerald-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-black text-lg">{language === 'zh' ? '建材汇总申请' : 'Material Request Summary'}</div>
                    <button
                      onClick={() => setLiuliMaterialDemandModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <input
                    value={liuliMaterialDemandForm.applicant}
                    onChange={(e) => setLiuliMaterialDemandForm(prev => ({ ...prev, applicant: e.target.value }))}
                    placeholder={language === 'zh' ? '申请人（默认当前账号）' : 'Applicant (default current user)'}
                    className="w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                  />
                  <div className="mt-3 border-2 border-emerald-100 p-3 space-y-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {language === 'zh' ? 'XIT/PRUNplanner 快捷导入（JSON）' : 'XIT/PRUNplanner Quick Import (JSON)'}
                    </div>
                    <textarea
                      value={liuliMaterialDemandXitInput}
                      onChange={(e) => setLiuliMaterialDemandXitInput(e.target.value)}
                      placeholder={language === 'zh'
                        ? '粘贴 XIT JSON（会自动提取 groups/materials）'
                        : 'Paste XIT JSON (extracts groups/materials automatically)'}
                      rows={4}
                      className="w-full border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 resize-y"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={importLiuliMaterialDemandFromXit}
                        className="text-xs px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 font-semibold"
                      >
                        {language === 'zh' ? '解析导入建材明细' : 'Parse & Import'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-3 border-2 border-emerald-100 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700">
                        {language === 'zh' ? '建材明细（名称 + 数量）' : 'Material Items (Name + Quantity)'}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setLiuliMaterialDemandForm(prev => ({
                            ...prev,
                            items: [...(prev.items || []), { materialName: '', quantity: '' }]
                          }))
                        }
                        className="text-xs px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        {language === 'zh' ? '新增一行' : 'Add Row'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(liuliMaterialDemandForm.items || []).map((item, idx) => (
                        <div key={`mat-demand-${idx}`} className="grid grid-cols-[1fr_140px_64px] gap-2">
                          <input
                            value={item.materialName}
                            onChange={(e) =>
                              setLiuliMaterialDemandForm(prev => {
                                const next = [...(prev.items || [])];
                                next[idx] = { ...next[idx], materialName: e.target.value };
                                return { ...prev, items: next };
                              })
                            }
                            placeholder={language === 'zh' ? '建材名称' : 'Material Name'}
                            className="border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                          />
                          <input
                            value={item.quantity}
                            onChange={(e) =>
                              setLiuliMaterialDemandForm(prev => {
                                const next = [...(prev.items || [])];
                                next[idx] = { ...next[idx], quantity: e.target.value };
                                return { ...prev, items: next };
                              })
                            }
                            placeholder={language === 'zh' ? '数量' : 'Qty'}
                            type="number"
                            step="1"
                            min="1"
                            className="border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLiuliMaterialDemandForm(prev => {
                                const oldItems = prev.items || [];
                                if (oldItems.length <= 1) return prev;
                                const next = oldItems.filter((_, i) => i !== idx);
                                return { ...prev, items: next };
                              })
                            }
                            className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold"
                          >
                            {language === 'zh' ? '删除' : 'Remove'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <textarea
                    value={liuliMaterialDemandForm.note}
                    onChange={(e) => setLiuliMaterialDemandForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder={language === 'zh' ? '备注（可选）' : 'Note (optional)'}
                    rows={2}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200 resize-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLiuliMaterialDemandModal(false)}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-bold transition-colors border border-emerald-200"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await addLiuliMaterialDemand();
                        if (ok) setLiuliMaterialDemandModal(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition-colors"
                    >
                      {language === 'zh' ? '提交申请' : 'Submit'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {liuliMaterialSupplyModal ? (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white border-2 border-emerald-200 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="font-black text-lg">{language === 'zh' ? '建材产能登记' : 'Material Supply Register'}</div>
                    <button
                      onClick={() => setLiuliMaterialSupplyModal(false)}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      value={liuliMaterialSupplyForm.producer}
                      onChange={(e) => setLiuliMaterialSupplyForm(prev => ({ ...prev, producer: e.target.value }))}
                      placeholder={language === 'zh' ? '生产者（默认当前账号）' : 'Producer (default current user)'}
                      className="border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                    />
                    <div />
                  </div>

                  <div className="mt-3 border-2 border-emerald-100 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-700">
                        {language === 'zh' ? '建材明细（名称 + 日产量 + 单价）' : 'Material Items (Name + Output + Price)'}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setLiuliMaterialSupplyForm(prev => ({
                            ...prev,
                            items: [...(prev.items || []), { materialName: '', perDay: '', unitPrice: '' }]
                          }))
                        }
                        className="text-xs px-2 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                      >
                        {language === 'zh' ? '新增一行' : 'Add Row'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(liuliMaterialSupplyForm.items || []).map((item, idx) => (
                        <div key={`mat-supply-${idx}`} className="grid grid-cols-[1fr_130px_120px_64px] gap-2">
                          <input
                            value={item.materialName}
                            onChange={(e) =>
                              setLiuliMaterialSupplyForm(prev => {
                                const next = [...(prev.items || [])];
                                next[idx] = { ...next[idx], materialName: e.target.value };
                                return { ...prev, items: next };
                              })
                            }
                            placeholder={language === 'zh' ? '建材名称' : 'Material Name'}
                            className="border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                          />
                          <input
                            value={item.perDay}
                            onChange={(e) =>
                              setLiuliMaterialSupplyForm(prev => {
                                const next = [...(prev.items || [])];
                                next[idx] = { ...next[idx], perDay: e.target.value };
                                return { ...prev, items: next };
                              })
                            }
                            placeholder={language === 'zh' ? '日产量' : 'Output'}
                            type="number"
                            step="1"
                            min="0"
                            className="border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                          />
                          <input
                            value={item.unitPrice}
                            onChange={(e) =>
                              setLiuliMaterialSupplyForm(prev => {
                                const next = [...(prev.items || [])];
                                next[idx] = { ...next[idx], unitPrice: e.target.value };
                                return { ...prev, items: next };
                              })
                            }
                            placeholder={language === 'zh' ? '单价' : 'Price'}
                            type="number"
                            step="0.001"
                            className="border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setLiuliMaterialSupplyForm(prev => {
                                const oldItems = prev.items || [];
                                if (oldItems.length <= 1) return prev;
                                const next = oldItems.filter((_, i) => i !== idx);
                                return { ...prev, items: next };
                              })
                            }
                            className="border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold"
                          >
                            {language === 'zh' ? '删除' : 'Remove'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <input
                    value={liuliMaterialSupplyForm.pickup}
                    onChange={(e) => setLiuliMaterialSupplyForm(prev => ({ ...prev, pickup: e.target.value }))}
                    placeholder={language === 'zh' ? '交付/取货地点（可选）' : 'Delivery/Pickup (optional)'}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200"
                  />
                  <textarea
                    value={liuliMaterialSupplyForm.note}
                    onChange={(e) => setLiuliMaterialSupplyForm(prev => ({ ...prev, note: e.target.value }))}
                    placeholder={language === 'zh' ? '备注（可选）' : 'Note (optional)'}
                    rows={2}
                    className="mt-3 w-full border-2 border-emerald-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-300 transition-all hover:border-emerald-200 resize-none"
                  />

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setLiuliMaterialSupplyModal(false)}
                      className="w-full bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 font-bold transition-colors border border-emerald-200"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                    <button
                      onClick={async () => {
                        const ok = await addLiuliMaterialSupply();
                        if (ok) setLiuliMaterialSupplyModal(false);
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 font-bold transition-colors"
                    >
                      {language === 'zh' ? '登记建材' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {liuliActiveTab === 'flights' && (
            <div className="bg-white border border-emerald-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black">{language === 'zh' ? '飞船航班信息' : 'Flights'}</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">{(liuliFlightsFiltered || []).length}</div>
                  <button
                    onClick={() => setLiuliFlightModal(true)}
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 text-emerald-700 px-4 py-2 text-sm font-bold transition-all border border-emerald-300"
                  >
                    {language === 'zh' ? '登记航班' : 'Add'}
                  </button>
                </div>
              </div>
              <input
                value={liuliFlightSearch}
                onChange={(e) => setLiuliFlightSearch(e.target.value)}
                placeholder={language === 'zh' ? '搜索航班...' : 'Search flights...'}
                className="w-full border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all mb-3"
              />
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setLiuliFlightPage(p => Math.max(1, p - 1))}
                  disabled={liuliFlightPage <= 1}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '上一页' : 'Prev'}
                </button>
                <div className="text-xs text-gray-500">
                  {liuliFlightPage}/{liuliFlightsTotalPages}
                </div>
                <button
                  onClick={() => setLiuliFlightPage(p => Math.min(liuliFlightsTotalPages, p + 1))}
                  disabled={liuliFlightPage >= liuliFlightsTotalPages}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '下一页' : 'Next'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 min-h-[320px] items-start">
                {(liuliFlightsFiltered || []).length === 0 ? (
                  <div className="text-gray-400 text-sm">{language === 'zh' ? '暂无航班记录' : 'No flights yet'}</div>
                ) : (
                  (liuliFlightsPaged || []).map((f, idx) => {
                    const isEditingThis = editingFlightId === f.id;
                    const badgeColors = {
                      SCB: 'from-sky-400 to-blue-500',
                      WCB: 'from-emerald-400 to-teal-500',
                      LCB: 'from-amber-400 to-orange-500',
                      HCB: 'from-rose-400 to-red-500',
                      VCB: 'from-violet-400 to-purple-500',
                    };
                    const badge = badgeColors[f.shipType] || badgeColors.SCB;
                    return isEditingThis ? (
                      /* ── 编辑模式 ── */
                      <div key={f.id} className="bg-white border-2 border-emerald-300 p-2.5 shadow-md flex flex-col gap-1.5 col-span-1">
                        <div className="text-[11px] font-bold text-emerald-700 mb-0.5">{language === 'zh' ? '编辑航班' : 'Edit Flight'}</div>
                        <input className="w-full border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '名称' : 'Name'} value={editFlightData.name} onChange={e => setEditFlightData(d => ({ ...d, name: e.target.value }))} />
                        <div className="flex gap-1">
                          <input className="flex-1 border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '出发地' : 'From'} value={editFlightData.from} onChange={e => setEditFlightData(d => ({ ...d, from: e.target.value }))} />
                          <input className="flex-1 border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '目的地' : 'To'} value={editFlightData.to} onChange={e => setEditFlightData(d => ({ ...d, to: e.target.value }))} />
                        </div>
                        <select className="w-full border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" value={editFlightData.shipType} onChange={e => setEditFlightData(d => ({ ...d, shipType: e.target.value }))}>
                          <option value="SCB">SCB (500/500)</option>
                          <option value="WCB">WCB (3000/1000)</option>
                          <option value="LCB">LCB (2000/2000)</option>
                          <option value="HCB">HCB (5000/5000)</option>
                          <option value="VCB">VCB (1000/3000)</option>
                        </select>
                        <input className="w-full border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '备注' : 'Note'} value={editFlightData.note} onChange={e => setEditFlightData(d => ({ ...d, note: e.target.value }))} />
                        <div className="text-[10px] text-gray-400 font-medium">{language === 'zh' ? '回程（选填）' : 'Return (optional)'}</div>
                        <div className="flex gap-1">
                          <input className="flex-1 border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '回程出发' : 'Ret.From'} value={editFlightData.returnFrom} onChange={e => setEditFlightData(d => ({ ...d, returnFrom: e.target.value }))} />
                          <input className="flex-1 border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '回程目的地' : 'Ret.To'} value={editFlightData.returnTo} onChange={e => setEditFlightData(d => ({ ...d, returnTo: e.target.value }))} />
                        </div>
                        <input className="w-full border border-emerald-200 px-2 py-1 text-[11px] outline-none focus:ring-1 focus:ring-emerald-300" placeholder={language === 'zh' ? '回程备注' : 'Ret.Note'} value={editFlightData.returnNote} onChange={e => setEditFlightData(d => ({ ...d, returnNote: e.target.value }))} />
                        <div className="flex gap-1.5 mt-0.5">
                          <button onClick={() => handleUpdateFlight(f.id)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold py-1">{language === 'zh' ? '保存' : 'Save'}</button>
                          <button onClick={() => setEditingFlightId(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-[11px] font-bold py-1">{language === 'zh' ? '取消' : 'Cancel'}</button>
                        </div>
                      </div>
                    ) : (
                      /* ── 显示模式 ── */
                      <div key={f.id} className="bg-white border border-emerald-200 p-2.5 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col h-[120px] overflow-hidden">
                        {/* 顶部：名称 + 按钮 */}
                        <div className="flex justify-between items-center mb-1">
                          <div className="font-extrabold text-[13px] text-gray-800 leading-tight truncate flex-1 pr-1">{f.name || '-'}</div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {isAdmin && (
                              <button onClick={() => { setEditingFlightId(f.id); setEditFlightData({ name: f.name, from: f.from, to: f.to, note: f.note || '', returnFrom: f.returnFrom || '', returnTo: f.returnTo || '', returnNote: f.returnNote || '', shipType: f.shipType || 'SCB' }); }} className="text-[10px] text-emerald-600 hover:text-emerald-800">
                                {language === 'zh' ? '编辑' : 'Edit'}
                              </button>
                            )}
                            <button onClick={() => deleteLiuliFlight(f.id)} className="text-[10px] text-gray-300 hover:text-red-400">
                              {language === 'zh' ? '删除' : 'Del'}
                            </button>
                          </div>
                        </div>
                        {/* 航线 + 型号标签 */}
                        <div className="flex items-center gap-1 mb-0.5 flex-wrap">
                          <span className="font-semibold text-[12px] text-emerald-700 truncate">{f.from}</span>
                          <span className="text-gray-300 text-[11px]">→</span>
                          <span className="font-semibold text-[12px] text-emerald-700 truncate">{f.to}</span>
                          <span className={`inline-flex items-center text-[9px] font-extrabold tracking-wider bg-gradient-to-r ${badge} text-white px-1.5 py-0.5 rounded-full shrink-0`}>{f.shipType || 'SCB'}</span>
                        </div>
                        {/* 备注 */}
                        {f.note ? <div className="text-[10px] text-gray-400 line-clamp-1 leading-snug">{f.note}</div> : null}
                        {/* 回程 */}
                        {(f.returnFrom && f.returnTo) ? (
                          <div className="mt-1 border-t border-emerald-100 pt-1 flex items-center gap-1 flex-wrap">
                            <span className="font-semibold text-[11px] text-emerald-600 truncate">{f.returnFrom}</span>
                            <span className="text-gray-300 text-[10px]">→</span>
                            <span className="font-semibold text-[11px] text-emerald-600 truncate">{f.returnTo}</span>
                            {f.returnNote ? <span className="text-[10px] text-gray-400 truncate w-full">{f.returnNote}</span> : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            )}

            {liuliActiveTab === 'productivity' && (
            <div className="bg-white border border-emerald-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black">{language === 'zh' ? '生产力信息' : 'Productivity'}</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">{(liuliProductsFiltered || []).length}</div>
                  <button
                    onClick={() => setLiuliProductModal(true)}
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 text-emerald-700 px-4 py-2 text-sm font-bold transition-all border border-emerald-300"
                  >
                    {language === 'zh' ? '登记产量' : 'Add'}
                  </button>
                </div>
              </div>
              <input
                value={liuliProductSearch}
                onChange={(e) => setLiuliProductSearch(e.target.value)}
                placeholder={language === 'zh' ? '搜索生产力...' : 'Search productivity...'}
                className="w-full border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all mb-3"
              />
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setLiuliProductPage(p => Math.max(1, p - 1))}
                  disabled={liuliProductPage <= 1}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '上一页' : 'Prev'}
                </button>
                <div className="text-xs text-gray-500">
                  {liuliProductPage}/{liuliProductsTotalPages}
                </div>
                <button
                  onClick={() => setLiuliProductPage(p => Math.min(liuliProductsTotalPages, p + 1))}
                  disabled={liuliProductPage >= liuliProductsTotalPages}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '下一页' : 'Next'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 min-h-[320px] items-start">
                {(liuliProductsFiltered || []).length === 0 ? (
                  <div className="text-gray-400 text-sm">{language === 'zh' ? '暂无登记' : 'No items yet'}</div>
                ) : (
                  (liuliProductsPaged || []).map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-white border border-emerald-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col h-[105px] overflow-hidden"
                    >
                      {/* 顶部色带：名称 */}
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-2 py-1 flex justify-between items-center">
                        <div className="font-extrabold text-white text-[12px] leading-tight truncate flex-1 pr-1">{p.name || '-'}</div>
                        <button onClick={() => deleteLiuliProduct(p.id)} className="text-[10px] text-white/60 hover:text-white shrink-0">✕</button>
                      </div>
                      {/* 产品名标签 */}
                      <div className="px-2 pt-1 pb-0.5">
                        <span className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-[10px] px-1.5 py-0.5 rounded-sm truncate max-w-full">{p.itemName || '-'}</span>
                      </div>
                      {/* 日产量 */}
                      <div className="px-2">
                        <span className="text-[10px] text-gray-500">{language === 'zh' ? '日产' : '/day'} <span className="text-emerald-600 font-extrabold text-[12px]">{Math.round(Number(p.perDay) || 0)}</span></span>
                      </div>
                      {/* 取货地 */}
                      {p.pickup ? <div className="px-2 text-[10px] text-gray-400 truncate">📍 <span className="text-teal-600 font-semibold">{p.pickup}</span></div> : null}
                      {p.note ? <div className="px-2 text-[9px] text-gray-400 line-clamp-1 mt-0.5">{p.note}</div> : null}
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {liuliActiveTab === 'material_requests' && (
            <div className="bg-white border border-emerald-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black">{language === 'zh' ? '建材汇总申请' : 'Material Requests'}</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">{(liuliMaterialDemandsFiltered || []).length}</div>
                  <button
                    onClick={() => setLiuliMaterialDemandModal(true)}
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 text-emerald-700 px-4 py-2 text-sm font-bold transition-all border border-emerald-300"
                  >
                    {language === 'zh' ? '填写申请' : 'Add Request'}
                  </button>
                </div>
              </div>
              <input
                value={liuliMaterialDemandSearch}
                onChange={(e) => setLiuliMaterialDemandSearch(e.target.value)}
                placeholder={language === 'zh' ? '搜索建材申请...' : 'Search material requests...'}
                className="w-full border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all mb-3"
              />
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setLiuliMaterialDemandPage(p => Math.max(1, p - 1))}
                  disabled={liuliMaterialDemandPage <= 1}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '上一页' : 'Prev'}
                </button>
                <div className="text-xs text-gray-500">
                  {liuliMaterialDemandPage}/{liuliMaterialDemandTotalPages}
                </div>
                <button
                  onClick={() => setLiuliMaterialDemandPage(p => Math.min(liuliMaterialDemandTotalPages, p + 1))}
                  disabled={liuliMaterialDemandPage >= liuliMaterialDemandTotalPages}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '下一页' : 'Next'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 min-h-[220px] items-start">
                {(liuliMaterialDemandsFiltered || []).length === 0 ? (
                  <div className="text-gray-400 text-sm">{language === 'zh' ? '暂无建材申请' : 'No material requests yet'}</div>
                ) : (
                  (liuliMaterialDemandsPaged || []).map((d) => (
                    <div
                      key={d.id}
                      className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 p-2 hover:shadow-md transition-shadow flex justify-between items-start h-fit self-start"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-[12px] text-gray-800">{d.applicant || '-'}</div>
                        {(d.items || []).length > 0 ? (
                          <div className="mt-2 space-y-1.5">
                            {(d.items || []).map((it, i) => (
                              <div
                                key={`${d.id}-item-${i}`}
                                className="flex items-center justify-between gap-2 bg-white border border-emerald-100 px-2 py-1"
                              >
                                <span className="text-[13px] font-extrabold tracking-wide text-emerald-700">
                                  {it.materialName}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 text-[12px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200">
                                  x {Math.round(Number(it.quantity) || 0)}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-1 text-[11px] text-gray-700 whitespace-pre-wrap leading-snug">{d.summary || '-'}</div>
                        )}
                        {d.note ? (
                          <div className="mt-1 text-[11px] text-gray-500 whitespace-pre-wrap leading-snug">
                            {language === 'zh' ? '备注' : 'Note'}: {d.note}
                          </div>
                        ) : null}
                      </div>
                      <button
                        onClick={() => deleteLiuliMaterialDemand(d.id)}
                        className="text-[10px] text-red-600 hover:text-red-700 ml-2"
                      >
                        {language === 'zh' ? '删除' : 'Delete'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}

            {liuliActiveTab === 'material_supply' && (
            <div className="bg-white border border-emerald-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black">{language === 'zh' ? '建材生产信息' : 'Material Supply'}</h2>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-gray-500">{(liuliMaterialSuppliesFiltered || []).length}</div>
                  <button
                    onClick={() => setLiuliMaterialSupplyModal(true)}
                    className="bg-gradient-to-r from-emerald-100 to-emerald-50 hover:from-emerald-200 hover:to-emerald-100 text-emerald-700 px-4 py-2 text-sm font-bold transition-all border border-emerald-300"
                  >
                    {language === 'zh' ? '登记建材' : 'Add Supply'}
                  </button>
                </div>
              </div>
              <input
                value={liuliMaterialSupplySearch}
                onChange={(e) => setLiuliMaterialSupplySearch(e.target.value)}
                placeholder={language === 'zh' ? '搜索建材产能...' : 'Search material supply...'}
                className="w-full border border-emerald-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all mb-3"
              />
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setLiuliMaterialSupplyPage(p => Math.max(1, p - 1))}
                  disabled={liuliMaterialSupplyPage <= 1}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '上一页' : 'Prev'}
                </button>
                <div className="text-xs text-gray-500">
                  {liuliMaterialSupplyPage}/{liuliMaterialSupplyTotalPages}
                </div>
                <button
                  onClick={() => setLiuliMaterialSupplyPage(p => Math.min(liuliMaterialSupplyTotalPages, p + 1))}
                  disabled={liuliMaterialSupplyPage >= liuliMaterialSupplyTotalPages}
                  className="px-3 py-1.5 text-sm font-bold border border-emerald-200 text-emerald-700 bg-white hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {language === 'zh' ? '下一页' : 'Next'}
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 min-h-[220px] items-start">
                {(liuliMaterialSuppliesFiltered || []).length === 0 ? (
                  <div className="text-gray-400 text-sm">{language === 'zh' ? '暂无建材产能登记' : 'No material supply yet'}</div>
                ) : (
                  (liuliMaterialSuppliesPaged || []).map((s) => (
                    <div
                      key={s.id}
                      className="bg-gradient-to-br from-white to-emerald-50 border border-emerald-200 p-2 hover:shadow-md transition-shadow flex justify-between items-start h-fit self-start"
                    >
                      <div>
                        <div className="font-bold text-gray-800 text-[11px] leading-tight">{s.producer || '-'}</div>
                        <div className="text-[11px] text-gray-600 mt-0.5 leading-tight">{s.materialName || '-'}</div>
                        <div className="text-[11px] text-gray-600 mt-0.5 leading-tight">
                          {language === 'zh' ? '日产量' : 'Per day'}: <span className="text-teal-600 font-semibold">{Math.round(Number(s.perDay) || 0)}</span>
                        </div>
                        <div className="text-[11px] text-gray-600 mt-0.5 leading-tight">
                          {language === 'zh' ? '单价' : 'Unit Price'}: <span className="text-teal-600 font-semibold">{Number(s.unitPrice).toFixed(3)}</span>
                        </div>
                        {s.pickup ? (
                          <div className="text-[11px] text-gray-600 mt-0.5 leading-tight">
                            {language === 'zh' ? '交付地' : 'Delivery'}: <span className="text-emerald-700 font-semibold">{s.pickup}</span>
                          </div>
                        ) : null}
                        {s.note ? <div className="text-[11px] text-gray-600 mt-1 whitespace-pre-wrap leading-snug">{s.note}</div> : null}
                      </div>
                      <button
                        onClick={() => deleteLiuliMaterialSupply(s.id)}
                        className="text-[10px] text-red-600 hover:text-red-700"
                      >
                        {language === 'zh' ? '删除' : 'Delete'}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            )}
          </div>
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {planetCards.length === 0 ? (
              <div className="col-span-full bg-white border border-blue-200 p-12 text-center">
                <Activity className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">{t('noPlanetCards')}</p>
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
                  <div key={card.id} className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-3 shadow-md hover:shadow-lg transition-shadow">
                    {/* 名片标题 */}
                    <div className="mb-2">
                      {isEditing && isAdmin ? (
                        <input
                          type="text"
                          value={editCardData.name}
                          onChange={(e) => setEditCardData({ ...editCardData, name: e.target.value })}
                          className="w-full text-sm font-bold border-2 border-blue-300 px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      ) : (
                        <h3 className="text-sm font-bold text-blue-700">{card.client}</h3>
                      )}
                    </div>

                    {/* 描述 */}
                    <div className="mb-2 min-h-[36px]">
                      {isEditing && (isAdmin || currentUser.role === 'global_admin') ? (
                        <textarea
                          value={editCardData.description}
                          onChange={(e) => setEditCardData({ ...editCardData, description: e.target.value })}
                          className="w-full text-xs border-2 border-blue-300 px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none resize-none"
                          rows={2}
                        />
                      ) : (
                        <p className="text-xs text-gray-700 line-clamp-2">{card.remark || '暂无描述'}</p>
                      )}
                    </div>

                    {/* 进度条 */}
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-medium text-gray-600">{t('devProgress')}</span>
                        <span className="text-xs font-bold text-blue-500">{card.rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 h-2">
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
                          className="w-full mt-1 text-xs border-2 border-blue-300 px-2 py-1 focus:ring-2 focus:ring-blue-400 outline-none"
                        />
                      )}
                    </div>

                    {/* 资金显示 */}
                    <div className="bg-white border border-green-200 p-2 mb-2">
                      <p className="text-[10px] text-gray-600 mb-0.5">{t('cardFund')}</p>
                      <p className="text-sm font-bold text-green-600">{formatMoney(cardFund)}</p>
                    </div>

                    {/* 资产价值显示 */}
                    {cardAssetValue > 0 && (
                      <div className="bg-white border border-purple-200 p-2 mb-2">
                        <p className="text-[10px] text-gray-600 mb-0.5">{t('totalAssetValue')}</p>
                        <p className="text-sm font-bold text-purple-600">{formatMoney(cardAssetValue)}</p>
                      </div>
                    )}

                    {/* 注资名单（折叠） */}
                    {(() => {
                      const fundingList = getCardFundingList(card.client);
                      const isExpanded = expandedFundingCards[card.id];
                      return (
                        <div className="mb-2">
                          <button
                            onClick={() => setExpandedFundingCards(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                            className="w-full flex items-center justify-between text-[10px] font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 px-2 py-1 transition-colors"
                          >
                            <span>{t('fundingList')}（{fundingList.length}）</span>
                            <span>{isExpanded ? '▲' : '▼'}</span>
                          </button>
                          {isExpanded && (
                            <div className="border border-t-0 border-gray-200 bg-gray-50 p-1.5 max-h-28 overflow-y-auto">
                              {fundingList.length > 0 ? (
                                <div className="space-y-0.5">
                                  {fundingList.map((fund, idx) => (
                                    <div key={idx} className={`flex justify-between items-center text-[10px] px-1.5 py-0.5 border ${fund.type === 'bank_planet_withdraw' ? 'bg-orange-50 border-orange-100' : fund.type === 'bank_planet_fund' ? 'bg-blue-50 border-blue-100' : 'bg-white border-gray-100'}`}>
                                      <span className="text-gray-700 font-medium">
                                        {fund.created_by || '匿名'}
                                        {fund.type === 'bank_planet_fund' && <span className="ml-1 text-blue-500 text-[9px]">[银行注]</span>}
                                        {fund.type === 'bank_planet_withdraw' && <span className="ml-1 text-orange-500 text-[9px]">[撤回]</span>}
                                      </span>
                                      <span className={`font-bold ${fund.type === 'bank_planet_withdraw' ? 'text-orange-600' : fund.type === 'bank_planet_fund' ? 'text-blue-600' : 'text-green-600'}`}>
                                        {fund.type === 'bank_planet_withdraw' ? '-' : '+'}{formatMoney(fund.principal)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-[10px] text-gray-400 text-center py-1">{t('noFundingYet')}</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* 注资功能 */}
                    {isFunding ? (
                      <div className="space-y-2">
                        {/* 管理员资金来源选择 */}
                        {isAdmin && (
                          <div className="flex gap-1 border border-green-200 rounded overflow-hidden text-[11px] font-semibold">
                            <button
                              onClick={() => setFundSource('personal')}
                              className={`flex-1 py-1.5 transition-colors ${fundSource === 'personal' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                            >{language === 'zh' ? '个人注资' : 'Personal'}</button>
                            <button
                              onClick={() => setFundSource('bank')}
                              className={`flex-1 py-1.5 transition-colors ${fundSource === 'bank' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                            >{language === 'zh' ? '划拨银行资金' : 'Bank Transfer'}</button>
                          </div>
                        )}
                        {/* 划拨模式显示可用银行余额 */}
                        {isAdmin && fundSource === 'bank' && (
                          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-2 py-1 rounded text-[11px]">
                            <span className="text-blue-700">{language === 'zh' ? '银行可用余额' : 'Bank Available'}</span>
                            <span className="text-blue-800 font-bold">{formatMoney(calculateIdleCash())}</span>
                          </div>
                        )}
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={fundAmount}
                          onChange={(e) => setFundAmount(e.target.value)}
                          className={`w-full border-2 px-3 py-2 text-sm outline-none focus:ring-2 ${isAdmin && fundSource === 'bank' ? 'border-blue-300 focus:ring-blue-500' : 'border-green-300 focus:ring-green-500'}`}
                          placeholder={t('amountInputPlaceholder')}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlanetFundRequest(card.id)}
                            className={`flex-1 text-white px-3 py-2 text-sm font-bold transition-colors ${isAdmin && fundSource === 'bank' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}`}
                          >
                            {isAdmin && fundSource === 'bank' ? (language === 'zh' ? '确认划拨' : 'Transfer') : t('submit')}
                          </button>
                          <button
                            onClick={() => { setFundingCardId(null); setFundAmount(''); setFundSource('personal'); }}
                            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 text-sm font-bold transition-colors"
                          >
                            {t('cancel')}
                          </button>
                        </div>
                      </div>
                    ) : withdrawingCardId === card.id ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-orange-50 border border-orange-200 px-2 py-1 rounded text-[11px]">
                          <span className="text-orange-700">{language === 'zh' ? '可撤回余额' : 'Withdrawable'}</span>
                          <span className="text-orange-800 font-bold">{formatMoney(cardFund)}</span>
                        </div>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={withdrawAmount}
                          onChange={e => setWithdrawAmount(e.target.value)}
                          className="w-full border-2 border-orange-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-400"
                          placeholder={t('amountInputPlaceholder')}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePlanetFundWithdraw(card.id)}
                            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 text-sm font-bold transition-colors"
                          >
                            {language === 'zh' ? '确认撤回' : 'Confirm'}
                          </button>
                          <button
                            onClick={() => { setWithdrawingCardId(null); setWithdrawAmount(''); }}
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
                        {isAdmin && cardFund > 0 && (
                          <button
                            onClick={() => { setWithdrawingCardId(card.id); setWithdrawAmount(''); }}
                            className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-2 text-sm font-bold transition-colors border border-orange-300"
                            title={language === 'zh' ? '撤回资金至银行' : 'Recall funds to bank'}
                          >
                            {language === 'zh' ? '撤回' : 'Recall'}
                          </button>
                        )}
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

          <div className="bg-white shadow-2xl border-2 border-purple-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <h3 className="text-xl font-bold">{t('announcement')}</h3>
              </div>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => {
                    setIsEditingAssetsAnnouncement(true);
                    setAssetsAnnouncementInput(assetsAnnouncement.content || '');
                  }}
                  className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
                >
                  {t('editShort')}
                </button>
              )}
            </div>

            <div className="p-4">
              {isEditingAssetsAnnouncement && currentUser?.role === 'admin' ? (
                <div className="space-y-3">
                  <textarea
                    value={assetsAnnouncementInput}
                    onChange={(e) => setAssetsAnnouncementInput(e.target.value)}
                    className="w-full border border-purple-300 px-3 py-2 text-sm focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none resize-none"
                    rows={5}
                    placeholder={t('announcementPlaceholder')}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateAssetsAnnouncement}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {t('save')}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingAssetsAnnouncement(false);
                        setAssetsAnnouncementInput('');
                      }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {t('cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-purple-50 border border-purple-200 p-4 min-h-[100px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {assetsAnnouncement.content || t('noAnnouncement')}
                  </p>
                </div>
              )}
            </div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 items-start">
                  {bankAssets.map((asset) => {
                    const isEditing = editingAssetId === asset.id;
                    const assetMeta = parseBankAssetMeta(asset);
                    const statusLabel = asset.status === 'pending'
                      ? t('pending')
                      : asset.status === 'rejected'
                        ? t('rejected')
                        : t('approved');
                    const statusClass = asset.status === 'pending'
                      ? 'text-amber-700 bg-amber-100 border-amber-200'
                      : asset.status === 'rejected'
                        ? 'text-red-700 bg-red-100 border-red-200'
                        : 'text-green-700 bg-green-100 border-green-200';

                    return (
                      <div
                        key={asset.id}
                        className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 p-3 shadow-sm hover:shadow-md transition-shadow h-fit"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editAssetData.planetName}
                                onChange={(e) => setEditAssetData({ ...editAssetData, planetName: e.target.value })}
                                className="border border-purple-300 px-2 py-1 rounded text-sm font-semibold text-purple-700 focus:ring-2 focus:ring-purple-400 outline-none"
                              />
                            ) : (
                              <div className="font-bold text-purple-700 text-sm">{asset.client}</div>
                            )}
                            <div className="text-xs text-gray-500 mt-0.5">{asset.timestamp?.split(' ')[0] || '-'}</div>
                            <div className={`inline-flex items-center mt-1 px-1.5 py-0.5 text-[10px] font-bold border rounded ${statusClass}`}>
                              {statusLabel}
                            </div>
                          </div>
                          {asset.status === 'rejected' && (isAdmin || asset.created_by === currentUser?.username) && (
                            <button
                              onClick={() => {
                                if (window.confirm(t('confirmDeleteAssetRecord'))) {
                                  handleCRUD('delete', asset.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors"
                              title={t('delete')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          {isAdmin && asset.status === 'approved' && (
                            <div className="flex items-center gap-1">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateAsset(asset.id)}
                                    className="text-green-600 hover:text-green-800 p-1.5 hover:bg-green-50 rounded transition-colors"
                                    title={t('save')}
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingAssetId(null)}
                                    className="text-gray-600 hover:text-gray-800 p-1.5 hover:bg-gray-100 rounded transition-colors"
                                    title={t('cancel')}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => {
                                      setEditingAssetId(asset.id);
                                      const editMeta = parseBankAssetMeta(asset);
                                      setEditAssetData({
                                        planetName: asset.client,
                                        itemName: editMeta.itemName,
                                        quantity: asset.principal,
                                        value: asset.rate,
                                        dailyProfit: editMeta.dailyProfit,
                                        operatorName: editMeta.operatorName
                                      });
                                    }}
                                    className="text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-50 rounded transition-colors"
                                    title={t('editShort')}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(t('confirmDeleteAssetRecord'))) {
                                        handleCRUD('delete', asset.id);
                                      }
                                    }}
                                    className="text-red-600 hover:text-red-800 p-1.5 hover:bg-red-50 rounded transition-colors"
                                    title={t('delete')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-3 space-y-1.5 text-sm">
                          <div className="text-gray-700">
                            <span className="text-gray-500 mr-1">{t('itemName')}:</span>
                            {isEditing ? (
                              <input
                                type="text"
                                value={editAssetData.itemName}
                                onChange={(e) => setEditAssetData({ ...editAssetData, itemName: e.target.value })}
                                className="border border-purple-300 px-2 py-1 rounded text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                              />
                            ) : (
                              <span className="font-medium">{assetMeta.itemName}</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white border border-purple-100 px-2 py-1 rounded">
                              <div className="text-[11px] text-gray-500">{t('quantity')}</div>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.001"
                                  value={editAssetData.quantity}
                                  onChange={(e) => setEditAssetData({ ...editAssetData, quantity: e.target.value })}
                                  className="w-full border border-purple-300 px-1.5 py-0.5 rounded text-sm text-right focus:ring-2 focus:ring-purple-400 outline-none"
                                />
                              ) : (
                                <div className="font-mono font-semibold text-gray-700">{asset.principal}</div>
                              )}
                            </div>

                            <div className="bg-white border border-purple-100 px-2 py-1 rounded">
                              <div className="text-[11px] text-gray-500">{t('assetValue')}</div>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.001"
                                  value={editAssetData.value}
                                  onChange={(e) => setEditAssetData({ ...editAssetData, value: e.target.value })}
                                  className="w-full border border-purple-300 px-1.5 py-0.5 rounded text-sm text-right focus:ring-2 focus:ring-purple-400 outline-none"
                                />
                              ) : (
                                <div className="font-mono font-semibold text-purple-600">{(asset.rate || 0).toFixed(3)}m</div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-white border border-purple-100 px-2 py-1 rounded">
                              <div className="text-[11px] text-gray-500">{t('dailyProfit')}</div>
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="0.001"
                                  value={editAssetData.dailyProfit}
                                  onChange={(e) => setEditAssetData({ ...editAssetData, dailyProfit: e.target.value })}
                                  className="w-full border border-purple-300 px-1.5 py-0.5 rounded text-sm text-right focus:ring-2 focus:ring-purple-400 outline-none"
                                />
                              ) : (
                                <div className="font-mono font-semibold text-green-600">{(assetMeta.dailyProfit || 0).toFixed(3)}m</div>
                              )}
                            </div>

                            <div className="bg-white border border-purple-100 px-2 py-1 rounded">
                              <div className="text-[11px] text-gray-500">{t('operatorName')}</div>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editAssetData.operatorName}
                                  onChange={(e) => setEditAssetData({ ...editAssetData, operatorName: e.target.value })}
                                  className="w-full border border-purple-300 px-1.5 py-0.5 rounded text-sm focus:ring-2 focus:ring-purple-400 outline-none"
                                />
                              ) : (
                                <div className="font-semibold text-gray-700">{assetMeta.operatorName || '-'}</div>
                              )}
                            </div>
                          </div>

                          <div className="text-xs text-gray-500 pt-1 border-t border-purple-100">
                            {t('applicant')}: <span className="font-medium text-gray-700">{asset.created_by || '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('dailyProfit')}</label>
                    <input
                      type="number"
                      required
                      step="0.001"
                      value={newAssetData.dailyProfit}
                      onChange={(e) => setNewAssetData({ ...newAssetData, dailyProfit: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                      placeholder={t('dailyProfitPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('operatorName')}</label>
                    <input
                      type="text"
                      required
                      value={newAssetData.operatorName}
                      onChange={(e) => setNewAssetData({ ...newAssetData, operatorName: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none"
                      placeholder={t('operatorNamePlaceholder')}
                    />
                  </div>
                  {!isAdmin && (
                    <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2">
                      {t('requiresAdminApproval')}
                    </div>
                  )}
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
      if (!window.confirm(String(t('confirmDeleteSettlement')).replace('{count}', settleIds[settleId].length))) return;
      
      try {
        for (const tx of settleIds[settleId]) {
          await supabase.from('transactions').delete().eq('id', tx.id);
        }
        alert(t('deleteSuccess'));
        setInterestManageModal(false);
      } catch (e) {
        alert(`${t('deleteFailed')}: ${e.message}`);
      }
    };
    
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white shadow-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-4">
            <h3 className="font-bold text-xl text-gray-800">{t('interestSettlementManageTitle')}</h3>
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
                        <span className="text-sm font-semibold text-gray-700">{t('settlementPrefix')} #{idx + 1}</span>
                        <span className="text-xs text-gray-500">{t('settlementIdLabel')}: {sid}</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>⏰ {t('settlementTime')}: {time}</div>
                        <div>📊 {t('settlementCountLabel')}: {records.length}</div>
                        <div className="flex gap-4">
                          <span className="text-green-600">💰 {t('incomeLabel')}: +{totalIncome.toFixed(3)}m</span>
                          <span className="text-red-600">💸 {t('expenseLabel')}: -{totalExpense.toFixed(3)}m</span>
                          <span className="font-semibold text-purple-600">{t('netProfitLabel')}: {(totalIncome - totalExpense).toFixed(3)}m</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSettlement(sid)}
                      className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded transition-colors text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      {t('delete')}
                    </button>
                  </div>
                </div>
              );
            })}
            {Object.keys(settleIds).length === 0 && (
              <div className="text-center text-gray-400 py-8">{t('noSettlementRecords')}</div>
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
                {t('fundPageTitle')}
              </h2>
              <p className="text-orange-100 font-medium">{t('fundPageSubtitle')}</p>
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
          {/* 账户概览 - 参考个人账户设计 */}
          <div className="bg-white border border-green-200 shadow-sm p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左侧：基金账户信息 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-base">{t('fundAccountTitle')}</span>
                  </div>
                  <div className="flex items-center gap-2 justify-end">
                    <div className="text-base font-semibold text-gray-900">{formatMoney(calculateFundBalance())}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="w-full h-10 px-3 border border-green-200 bg-green-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">{t('fundBalanceLabel')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(calculateFundBalance())}</span>
                  </div>
                  <div className="w-full h-10 px-3 border border-green-200 bg-green-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Wallet className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">{t('bankBalanceLabel')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(calculateIdleCash())}</span>
                  </div>
                  <div className="w-full h-10 px-3 border border-purple-200 bg-purple-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Activity className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">{t('totalProfitLabel')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{formatMoney(calculateFundProfit())}</span>
                  </div>
                  <div className="w-full h-10 px-3 border border-blue-200 bg-blue-50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Activity className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-xs text-gray-600 whitespace-nowrap">{t('yieldRateLabel')}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">{calculateFundYieldPercent().toFixed(2)}%</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">{t('fundStatsHint')}</p>
              </div>
              {/* 右侧：管理员公告栏 */}
              <div className="border-l border-green-200 pl-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <MessageSquare className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-base">{t('announcement')}</span>
                  </div>
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setIsEditingFundAnnouncement(true);
                        setFundAnnouncementInput(fundAnnouncement.content);
                      }}
                      className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                    >
                      {t('editShort')}
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
                      placeholder={t('announcementPlaceholder')}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateFundAnnouncement}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {t('save')}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingFundAnnouncement(false);
                          setFundAnnouncementInput('');
                        }}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 text-sm font-medium transition-colors"
                      >
                        {t('cancel')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 p-4 min-h-[120px]">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {fundAnnouncement.content || t('announcementPlaceholder')}
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
                      <span className="font-semibold text-base">{t('fundTransferTitle')}</span>
                    </div>
                    <button
                      onClick={handleSettleFundDividends}
                      className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 text-sm font-medium transition-colors"
                    >
                      {t('settleDividends')}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => { setTransferModal(true); setTransferType('in'); }}
                      className="bg-gradient-to-r from-green-100 to-green-200 hover:from-green-200 hover:to-green-300 text-green-700 px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 border border-green-300 shadow-sm hover:shadow-md"
                    >
                      <ArrowDownRight className="w-4 h-4" />
                      {t('transferBankToFund')}
                    </button>
                    <button
                      onClick={() => { setTransferModal(true); setTransferType('out'); }}
                      className="bg-gradient-to-r from-teal-100 to-teal-200 hover:from-teal-200 hover:to-teal-300 text-teal-700 px-4 py-3 font-bold transition-all flex items-center justify-center gap-2 border border-teal-300 shadow-sm hover:shadow-md"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                      {t('transferFundToBank')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-green-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Lock className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-base">{t('fundTransferTitle')}</span>
                    </div>
                  </div>
                  <div className="text-center py-6">
                    <Lock className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">{t('permissionDeniedAdminOnly')}</p>
                    <p className="text-gray-400 text-xs mt-1">{t('fundTransferPermissionHint')}</p>
                  </div>
                </div>
              )}
            </div>

            <div>
              {/* 基金操作 */}
              <div className="bg-white border border-green-200 shadow-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-gray-700">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-base">{t('fundActionsTitle')}</span>
                  </div>
                  {currentUser?.role !== 'admin' && (
                    <div className="text-xs text-gray-500">{t('requiresAdminApproval')}</div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="h-10 w-full border border-blue-200 bg-blue-50 flex items-center justify-center gap-2 px-3">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">{t('subscribedPrincipal')}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundNetSubscribed())}</span>
                  </div>
                  <div className="h-10 w-full border border-purple-200 bg-purple-50 flex items-center justify-center gap-2 px-3">
                    <Activity className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">{t('estimatedProfit')}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundEstimatedProfit())}</span>
                  </div>
                  <div className="h-10 w-full border border-green-200 bg-green-50 flex items-center justify-center gap-2 px-3">
                    <Wallet className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">{t('fundBalanceLabel')}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatMoney(calculatePersonalFundBalance())}</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => openFundUserModal('subscribe')}
                    className="h-10 bg-gradient-to-r from-emerald-100 to-green-100 hover:from-emerald-200 hover:to-green-200 text-green-700 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-green-200"
                  >
                    <PlusCircle className="w-4 h-4" />
                    {t('subscribeFund')}
                  </button>
                  <button
                    onClick={() => openFundUserModal('redeem')}
                    className="h-10 bg-gradient-to-r from-blue-100 to-sky-100 hover:from-blue-200 hover:to-sky-200 text-blue-700 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-blue-200"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {t('redeemFund')}
                  </button>
                  <button
                    onClick={() => openFundUserModal('dividend_withdraw')}
                    className="h-10 bg-gradient-to-r from-purple-100 to-fuchsia-100 hover:from-purple-200 hover:to-fuchsia-200 text-purple-700 px-3 text-sm font-semibold transition-all flex items-center justify-center gap-2 border border-purple-200"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {t('withdrawDividend')}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 交易记录 */}
          <div className="bg-white border border-green-200 shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-700">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-base">{t('fundTransactionsTitle')}</span>
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
                        {t('deleteSelected')} ({selectedTransactions.size})
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
                      {showBatchDelete ? t('doneSelect') : t('batchSelect')}
                    </button>
                    <button
                      onClick={() => setAddFundTxModal(true)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      {t('addRecord')}
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
                  {t('profitLossRecords')}
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
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-32 whitespace-nowrap">{t('time')}</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-20 whitespace-nowrap">{t('type')}</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs w-24 whitespace-nowrap">{t('amount')}</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs whitespace-nowrap">{t('remarkLabel')}</th>
                        {canEditFundTransactions() && (
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs w-24">{t('actions')}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {fundTransactions.filter(tx => ['fund_profit', 'fund_loss'].includes(tx.type)).length === 0 ? (
                        <tr>
                          <td colSpan={canEditFundTransactions() ? (showBatchDelete ? "6" : "5") : "4"} className="text-center py-6 text-gray-400 text-xs">{t('noProfitLossRecords')}</td>
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
                                  {tx.type === 'fund_profit' ? t('profit') : t('loss')}
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
                                      {t('editShort')}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFundTx(tx.id)}
                                      className="inline-flex items-center justify-center whitespace-nowrap bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-xs font-medium transition-colors"
                                    >
                                      {t('delete')}
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
                  {t('bankFundRecords')}
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
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-32 whitespace-nowrap">{t('time')}</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs w-20 whitespace-nowrap">{t('type')}</th>
                        <th className="text-right py-2 px-3 font-semibold text-gray-700 text-xs w-24 whitespace-nowrap">{t('amount')}</th>
                        <th className="text-left py-2 px-3 font-semibold text-gray-700 text-xs whitespace-nowrap">{t('remarkLabel')}</th>
                        {canEditFundTransactions() && (
                          <th className="text-center py-2 px-3 font-semibold text-gray-700 text-xs w-24">{t('actions')}</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {fundTransactions.filter(tx => tx.type === 'bank_fund').length === 0 ? (
                        <tr>
                          <td colSpan={canEditFundTransactions() ? (showBatchDelete ? "6" : "5") : "4"} className="text-center py-6 text-gray-400 text-xs">{t('noBankFundRecords')}</td>
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
                                  {tx.principal > 0 ? t('transferIn') : t('transferOut')}
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
                                      {t('edit')}
                                    </button>
                                    <button
                                      onClick={() => handleDeleteFundTx(tx.id)}
                                      className="inline-flex items-center justify-center whitespace-nowrap bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 text-xs font-medium transition-colors"
                                    >
                                      {t('delete')}
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
                {transferType === 'in' ? t('transferBankToFund') : t('transferFundToBank')}
              </h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('transferAmountLabel')}</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full border-2 border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  placeholder={t('transferAmountPlaceholder')}
                />
              </div>
              
              <div className="mb-6 p-4 bg-green-50">
                <p className="text-sm text-gray-600">
                  {transferType === 'in' ? 
                    String(t('transferHintIn')).replace('{amount}', formatMoney(calculateIdleCash())) :
                    String(t('transferHintOut')).replace('{amount}', formatMoney(calculateFundBalance()))
                  }
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => { setTransferModal(false); setTransferAmount(''); setTransferType(''); }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleFundTransfer}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  {t('confirmTransfer')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 添加基金交易记录弹窗 */}
        {addFundTxModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full animate-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">{t('addFundTx')}</h3>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('recordType')}</label>
                <select
                  value={newFundTxData.type}
                  onChange={(e) => setNewFundTxData({...newFundTxData, type: e.target.value})}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                >
                  <option value="fund_profit">{t('fundProfit')}</option>
                  <option value="fund_loss">{t('fundLoss')}</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('amountM')}</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={newFundTxData.amount}
                  onChange={(e) => setNewFundTxData({...newFundTxData, amount: e.target.value})}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  placeholder={t('amountPlaceholder01')}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('remarkLabel')}</label>
                <textarea
                  value={newFundTxData.remark}
                  onChange={(e) => setNewFundTxData({...newFundTxData, remark: e.target.value})}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none"
                  rows={3}
                  placeholder={t('remarkPlaceholderOptional')}
                />
              </div>
              
              <div className="mb-6 p-4 bg-green-50">
                <p className="text-sm text-gray-600">
                  {newFundTxData.type === 'fund_profit' ? 
                    `${t('willIncreaseFundProfit')} ${formatMoney(parseFloat(newFundTxData.amount) || 0)}` :
                    `${t('willRecordFundLoss')} ${formatMoney(parseFloat(newFundTxData.amount) || 0)}`
                  }
                </p>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleCancelAddFundTx}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleAddFundTx}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  {t('confirmAdd')}
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
                  {fundUserAction === 'subscribe' ? t('fundSubscribeRequest') : fundUserAction === 'redeem' ? t('fundRedeemRequest') : t('fundDividendWithdrawRequest')}
                </h3>
                <button onClick={() => setFundUserModal(false)}>
                  <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('amountM')}</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.001"
                  value={fundUserAmount}
                  onChange={(e) => setFundUserAmount(e.target.value)}
                  className="w-full border border-green-200 px-4 py-3 focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none"
                  placeholder={t('amountPlaceholder0100')}
                />
              </div>

              <div className="mb-6 p-4 bg-green-50 border border-green-200">
                <p className="text-sm text-gray-600">
                  {t('submitWillEnterApproval')}
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setFundUserModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={submitFundUserRequest}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  {t('submitRequest')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 管理利息记录弹窗 */}
        {interestManageModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white shadow-2xl p-8 max-w-md w-full animate-in">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">{t('manageInterestTitle')}</h3>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => setInterestManageModal(false)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleInterestManage}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-4 py-3 font-bold transition-all"
                >
                  {t('confirm')}
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
    <div className="min-h-screen bg-[#FFFEF9] text-gray-800 p-4 md:p-8 font-sans" style={{ zoom: '90%' }}>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-green-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent animate-gradient">{t('loginTitle')}</span> {t('loginSubtitle')}
              <span className="relative overflow-hidden border border-emerald-400 text-emerald-950 text-xs px-2 py-1 font-bold whitespace-nowrap bg-gradient-to-r from-emerald-200 via-emerald-100 to-emerald-200 shadow-[0_0_18px_rgba(16,185,129,0.35)] animate-pulse">
                琉璃主权资本
              </span>
            </h1>
            <p className="text-slate-500 mt-1 text-sm">{t('currentUser')}: <span className="font-bold">{currentUser.username}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                 className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 font-medium transition-colors border border-green-200 text-sm"
               >
                 {language === 'zh' ? 'EN' : t('langChinese')}
               </button>
               <div className={`px-4 py-2 ${stats.netCashFlow >= -0.001 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  <div className="font-bold text-lg">
                    {t('netCashFlow')}: {stats.netCashFlow > 0 ? '+' : ''}{formatMoney(stats.netCashFlow)} {t('perWeek')}
                  </div>
                  <div className="text-xs font-medium mt-0.5 opacity-90">
                    {t('settleCountdownLabel')}: {settleCountdown || '--'}
                  </div>
                </div>
             </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"><LogOut className="w-4 h-4" /> {t('logout')}</button>
          </div>
        </div>

        

        {/* 管理员审批 - 已移至账单页面 */}
        {currentPage !== 'loans' && isAdmin && pendingTx && pendingTx.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 p-4 flex items-center justify-between">
            <span className="text-amber-800 font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4"/> {t('pendingApproval')} ({pendingTx.length})
            </span>
            <button onClick={() => setCurrentPage('loans')} className="text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 font-medium transition-colors">
              {language === 'zh' ? '前往账单页审批 →' : 'Go to Bills to Approve →'}
            </button>
          </div>
        )}

        {/* 操作栏 */}
        <div className="bg-white p-4 border border-green-200 shadow-sm flex flex-wrap gap-4 items-center">
            <span className="font-bold text-gray-700 mr-2 flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400"/> {t('operations')}:</span>
            <Btn
              icon={PlusCircle}
              label={currentPage === 'loans' ? t('backToBank') : (language === 'zh' ? '账单' : 'Bills')}
              onClick={() => setCurrentPage(currentPage === 'loans' ? 'bank' : 'loans')}
              color="green"
            />
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <Btn icon={MessageSquare} label={t('forum')} onClick={() => setCurrentPage('forum')} color="red" className="px-8" />
            <button onClick={() => setCurrentPage('liuli')} className="bg-gradient-to-r from-indigo-100 to-purple-100 hover:from-indigo-200 hover:to-purple-200 text-indigo-700 px-8 py-2 font-bold transition-all flex items-center gap-2 border border-indigo-200">
              <Activity className="w-4 h-4" />
              琉璃
            </button>
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
              {t('bankFund')}
            </button>
            <button onClick={() => setCurrentPage('bonds')} className="bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-800 px-8 py-2 font-bold transition-all flex items-center gap-2 border border-amber-300">
              <TrendingUp className="w-4 h-4" />
              {t('bankBonds')}
            </button>
            {isAdmin && <Btn icon={AlertCircle} label={t('forceSettle')} onClick={handleForceSettleInterest} color="red" />}
            {isAdmin && <button
              onClick={() => setInterestManageModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              <Trash2 className="w-4 h-4" />
              {t('manageInterestRecords')}
            </button>}
        </div>

        {/* 统计卡片 */}
        {currentPage !== 'loans' && (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <StatCard title={t('totalAssets')} value={formatMoney(stats.totalAssets)} subtext={''} icon={<ArrowUpRight className="text-green-600" />} />
          <StatCard title={t('totalLiabilities')} value={formatMoney(stats.totalLoans)} subtext={''} icon={<ArrowDownLeft className="text-red-500" />} />
          <StatCard title={t('idleFunds')} value={formatMoney(stats.idleCash)} subtext={t('availableBalance')} icon={<Wallet className="text-yellow-500" />} />
          <StatCard title={t('totalAssetValue')} value={formatMoney(stats.bankAssetsValue)} subtext={t('realEstate')} icon={<Wallet className="text-purple-600" />} />
          <StatCard title={t('interestPool')} value={formatMoney(stats.interestPool)} subtext={t('weeklyNetInterest')} icon={<Activity className="text-purple-600" />} />
          <StatCard title={t('approvalQueue')} value={pendingTx.length} subtext={t('pendingItems')} icon={<Shield className="text-blue-600" />} />
        </div>
        )}

        {currentPage !== 'loans' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white border border-green-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Wallet className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-base">{t('personalBalance')}</span>
                  {currentUserRole === 'liuli_member' && (
                    <span className="px-2 py-0.5 text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200">
                      {t('roleLiuliMember')}
                    </span>
                  )}
                </div>
                <div className="text-right leading-tight">
                  <div className="text-[10px] text-gray-500">{language === 'zh' ? '余额' : 'Balance'}</div>
                  <div className="text-base font-bold text-gray-900">{formatMoney(stats.personalTotalBalance)}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-1.5 mt-1">
                {/* 注资列 */}
                <div className="flex flex-col gap-1">
                  <div className="border border-blue-200 bg-blue-50 flex items-center justify-between px-2 py-2.5 gap-1 min-w-0">
                    <div className="flex items-center gap-1 text-blue-600 shrink-0">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-gray-500 whitespace-nowrap">{t('injectionShort')}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 truncate">{formatMoney(stats.injectionBalance)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => openModal('injection')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 text-[11px] font-medium transition-all flex items-center justify-center gap-1 border border-blue-200 min-w-0">
                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t('injection')}</span>
                    </button>
                    <button onClick={() => openModal('withdraw_inj')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 text-[11px] font-medium transition-all flex items-center justify-center gap-1 border border-blue-200 min-w-0">
                      <MinusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t('withdrawInj')}</span>
                    </button>
                  </div>
                </div>
                {/* 存款列 */}
                <div className="flex flex-col gap-1">
                  <div className="border border-emerald-200 bg-emerald-50 flex items-center justify-between px-2 py-2.5 gap-1 min-w-0">
                    <div className="flex items-center gap-1 text-emerald-600 shrink-0">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-gray-500 whitespace-nowrap">{t('depositShort')}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 truncate">{formatMoney(stats.depositBalance)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => openModal('deposit')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 text-[11px] font-medium transition-all flex items-center justify-center gap-1 border border-emerald-200 min-w-0">
                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t('deposit')}</span>
                    </button>
                    <button onClick={() => openModal('withdraw_dep')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 text-[11px] font-medium transition-all flex items-center justify-center gap-1 border border-emerald-200 min-w-0">
                      <MinusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{t('withdrawDep')}</span>
                    </button>
                  </div>
                </div>
                {/* 基金列 */}
                <div className="flex flex-col gap-1">
                  <div className="border border-sky-200 bg-sky-50 flex items-center justify-between px-2 py-2.5 gap-1 min-w-0">
                    <div className="flex items-center gap-1 text-sky-600 shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-gray-500 whitespace-nowrap">{t('fundShort')}</span>
                    </div>
                    <span className="text-xs font-bold text-gray-800 truncate">{formatMoney(calculatePersonalFundBalance())}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1">
                    <button onClick={() => openModal('loan')} className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 text-[11px] font-medium transition-all flex items-center justify-center gap-1 border border-orange-200 min-w-0">
                      <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{language === 'zh' ? '贷款' : 'Loan'}</span>
                    </button>
                    {currentUserRole === 'liuli_member' && (
                      <button onClick={() => setCurrentPage('loans')} className="bg-red-50 hover:bg-red-100 text-red-700 py-2 text-[11px] font-medium transition-all flex items-center justify-center gap-1 border border-red-200 min-w-0">
                        <CheckSquare className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{language === 'zh' ? '账单' : 'Bills'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-500">{t('injectionAndDeposit')}</p>
              {isAdmin && (
                <div className="mt-3">
                  <button
                    onClick={() => setAccountListModalOpen(true)}
                    className="px-3 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold transition-colors"
                  >
                    {t('openAccountList')}
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-green-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <MessageSquare className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-base">{t('announcement')}</span>
                </div>
                <button
                  onClick={() => {
                    setIsEditingBankAnnouncement(true);
                    setBankAnnouncementInput(bankAnnouncement.content || '');
                  }}
                  className="text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                >
                  {t('editShort')}
                </button>
              </div>

              {isEditingBankAnnouncement ? (
                <div className="space-y-3">
                  <textarea
                    value={bankAnnouncementInput}
                    onChange={(e) => setBankAnnouncementInput(e.target.value)}
                    className="w-full border border-green-200 px-3 py-2 text-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none resize-none"
                    rows={8}
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
                <div className="bg-green-50 border border-green-200 p-4 min-h-[178px]">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {bankAnnouncement.content || t('noAnnouncement')}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 项目人员招募 + 分类发言区 */}
        {currentPage !== 'loans' && (
          <div className="grid grid-cols-2 gap-4">

            {/* 左：项目人员招募 */}
            <div className="bg-white border border-purple-200 shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-semibold text-base">{language === 'zh' ? '项目人员招募' : 'Project Recruitment'}</span>
                  {recruitmentPosts.length > 0 && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 font-medium">{recruitmentPosts.length}</span>
                  )}
                </div>
                <button
                  onClick={() => setIsAddingRecruitment(true)}
                  className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  {language === 'zh' ? '发布招募' : 'Post'}
                </button>
              </div>

              {isAddingRecruitment && (
                <div className="mb-4 p-3 border border-purple-200 bg-purple-50 space-y-2">
                  <input
                    type="text"
                    placeholder={language === 'zh' ? '董事名 *' : 'Director Name *'}
                    value={recruitmentForm.title}
                    onChange={e => setRecruitmentForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full border border-purple-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                  />
                  <textarea
                    placeholder={language === 'zh' ? '项目招聘描述' : 'Project Recruitment Description'}
                    value={recruitmentForm.description}
                    onChange={e => setRecruitmentForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full border border-purple-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-300 outline-none resize-none"
                  />
                  <input
                    type="text"
                    placeholder={language === 'zh' ? 'QQ' : 'QQ'}
                    value={recruitmentForm.contact}
                    onChange={e => setRecruitmentForm(f => ({ ...f, contact: e.target.value }))}
                    className="w-full border border-purple-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-purple-300 outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddRecruitmentPost}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 text-sm font-medium transition-colors"
                    >
                      {language === 'zh' ? '发布' : 'Publish'}
                    </button>
                    <button
                      onClick={() => { setIsAddingRecruitment(false); setRecruitmentForm({ title: '', description: '', contact: '' }); }}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-1.5 text-sm transition-colors"
                    >
                      {language === 'zh' ? '取消' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}

              {recruitmentPosts.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {language === 'zh' ? '暂无招募信息' : 'No recruitment posts yet'}
                </div>
              ) : (
                <div className="space-y-2">
                  {recruitmentPosts.map(post => (
                    <div key={post.id} className="border border-purple-100 bg-purple-50 p-3 relative">
                      {(isAdmin || post.postedBy === currentUser?.username) && (
                        <button
                          onClick={() => handleDeleteRecruitmentPost(post.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <div className="font-semibold text-purple-800 text-sm pr-5">{post.title}</div>
                      {post.description && (
                        <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{post.description}</p>
                      )}
                      {post.contact && (
                        <div className="mt-2 text-xs text-purple-600 font-medium">
                          {language === 'zh' ? '联系：' : 'Contact: '}{post.contact}
                        </div>
                      )}
                      <div className="mt-2 text-[10px] text-gray-400">{post.postedBy} · {post.postedAt}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右：分类发言区 */}
            <div className="bg-white border border-blue-200 shadow-sm p-4 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-base">{language === 'zh' ? '分类发言区' : 'Discussion Board'}</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => setIsManagingCategories(v => !v)}
                    className="text-xs text-blue-500 hover:text-blue-700 font-medium transition-colors"
                  >
                    {isManagingCategories ? (language === 'zh' ? '完成' : 'Done') : (language === 'zh' ? '管理分类' : 'Manage')}
                  </button>
                )}
              </div>

              {/* 管理分类区 (admin only) */}
              {isAdmin && isManagingCategories && (
                <div className="mb-3 p-2 border border-blue-100 bg-blue-50 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCategoryInput}
                      onChange={e => setNewCategoryInput(e.target.value)}
                      placeholder={language === 'zh' ? '新分类名称' : 'New category name'}
                      className="flex-1 border border-blue-200 px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-blue-300"
                      onKeyDown={e => e.key === 'Enter' && handleAddSpeechCategory()}
                    />
                    <button
                      onClick={handleAddSpeechCategory}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-medium transition-colors"
                    >
                      {language === 'zh' ? '添加' : 'Add'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {speechData.categories.map(cat => (
                      <div key={cat} className="flex items-center gap-1 bg-white border border-blue-200 px-2 py-0.5 text-xs text-blue-700">
                        <span>{cat}</span>
                        <button onClick={() => handleDeleteSpeechCategory(cat)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 分类 Tabs */}
              <div className="flex gap-1 mb-3 flex-wrap">
                {speechData.categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveSpeechCategory(cat)}
                    className={`px-3 py-1 text-xs font-medium transition-colors border ${
                      activeSpeechCategory === cat
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 发言输入框 */}
              {currentUser && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={speechInput}
                    onChange={e => setSpeechInput(e.target.value)}
                    placeholder={language === 'zh' ? `在「${activeSpeechCategory}」中发言…` : `Post in "${activeSpeechCategory}"…`}
                    className="flex-1 border border-blue-200 px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-blue-300"
                    onKeyDown={e => e.key === 'Enter' && handleAddSpeechPost()}
                  />
                  <button
                    onClick={handleAddSpeechPost}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 text-sm font-medium transition-colors"
                  >
                    {language === 'zh' ? '发送' : 'Send'}
                  </button>
                </div>
              )}

              {/* 帖子列表 */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-64">
                {speechData.posts.filter(p => p.category === activeSpeechCategory).length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    {language === 'zh' ? '暂无发言' : 'No posts yet'}
                  </div>
                ) : (
                  [...speechData.posts.filter(p => p.category === activeSpeechCategory)].reverse().map(post => (
                    <div key={post.id} className="border border-blue-100 bg-blue-50 px-3 py-2 relative group">
                      {(isAdmin || post.author === currentUser?.username) && (
                        <button
                          onClick={() => handleDeleteSpeechPost(post.id)}
                          className="absolute top-1.5 right-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                      <p className="text-sm text-gray-800 pr-4">{post.content}</p>
                      <div className="mt-1 text-[10px] text-gray-400">{post.author} · {post.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {currentPage === 'loans' && (
          <div className="bg-white border border-blue-200 shadow-sm p-4">
            <h3 className="text-lg font-bold text-blue-800">{language === 'zh' ? '贷款账单中心' : 'Loan Ledger Center'}</h3>
            <p className="text-xs text-gray-500 mt-1">{language === 'zh' ? '贷款 / 注资 / 撤资 / 存款 / 取款账单' : 'Loan / Injection / Withdrawal / Deposit ledgers'}</p>
          </div>
        )}

        {/* 账单页 - 管理员审批中心（左右两栏） */}
        {currentPage === 'loans' && isAdmin && (() => {
          const colorMap = {
            orange:  { border:'border-orange-200',  bg:'bg-orange-50',  badge:'bg-orange-100 text-orange-700',  title:'text-orange-800' },
            red:     { border:'border-red-200',     bg:'bg-red-50',     badge:'bg-red-100 text-red-700',        title:'text-red-800' },
            blue:    { border:'border-blue-200',    bg:'bg-blue-50',    badge:'bg-blue-100 text-blue-700',      title:'text-blue-800' },
            emerald: { border:'border-emerald-200', bg:'bg-emerald-50', badge:'bg-emerald-100 text-emerald-700',title:'text-emerald-800' },
            amber:   { border:'border-amber-200',   bg:'bg-amber-50',   badge:'bg-amber-100 text-amber-700',    title:'text-amber-800' },
            teal:    { border:'border-teal-200',    bg:'bg-teal-50',    badge:'bg-teal-100 text-teal-700',      title:'text-teal-800' },
            purple:  { border:'border-purple-200',  bg:'bg-purple-50',  badge:'bg-purple-100 text-purple-700',  title:'text-purple-800' },
            gray:    { border:'border-gray-200',    bg:'bg-gray-50',    badge:'bg-gray-100 text-gray-700',      title:'text-gray-800' },
          };

          const leftCats = [
            { key:'repay', label: language==='zh'?'还款申请':'Repayment',   types:['loan_repay_request'],             color:'orange' },
            { key:'loan',  label: language==='zh'?'贷款':'Loan',             types:['loan'],                           color:'red' },
            { key:'dep',   label: language==='zh'?'存款 / 取款':'Deposit',   types:['deposit','withdraw_dep'],         color:'emerald' },
            { key:'inj',   label: language==='zh'?'注资 / 撤资':'Injection', types:['injection','withdraw_inj'],       color:'blue' },
          ];
          const rightCats = [
            { key:'bond',  label: language==='zh'?'债券申购':'Bond',         types:['bond_subscribe'],                 color:'amber' },
            { key:'fund',  label: language==='zh'?'基金操作':'Fund',         types:['fund_subscribe','fund_redeem','fund_dividend_withdraw','fund_profit_withdraw'], color:'teal' },
            { key:'asset', label: language==='zh'?'其他投资':'Other',        types:['bank_asset'],                     color:'purple' },
          ];
          const knownTypes = [...leftCats, ...rightCats].flatMap(c => c.types);
          const otherItems = pendingTx.filter(tx => !knownTypes.includes(tx.type));
          if (otherItems.length > 0) rightCats.push({ key:'other', label: language==='zh'?'其他':'Other', types: otherItems.map(tx=>tx.type), color:'gray' });

          const leftCount  = leftCats.reduce((s,c)  => s + pendingTx.filter(tx => c.types.includes(tx.type)).length, 0);
          const rightCount = rightCats.reduce((s,c) => s + pendingTx.filter(tx => c.types.includes(tx.type)).length, 0);

          const renderCard = (tx, c) => (
            <div key={tx.id} className="bg-white border border-gray-100 p-3 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${c.badge}`}>{getLocalizedTypeLabel(tx.type || 'unknown', language)}</span>
                  <span className="font-semibold text-sm text-gray-800">{tx.client || t('unknown')}</span>
                  <span className="text-sm font-bold text-gray-900">{formatMoney(tx.principal || 0)}</span>
                  {tx.type === 'withdraw_dep' && (
                    <span className="text-xs text-gray-400">({(tx.product_type||'normal')==='risk'?t('riskDeposit'):(tx.product_type||'normal')==='risk5'?t('riskDeposit5'):t('normalDeposit')})</span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 flex gap-2 flex-wrap">
                  <span>{t('applicantLabel')}: <span className="text-gray-600 font-medium">{tx.created_by||t('unknown')}</span></span>
                  {tx.timestamp && <span>{tx.timestamp.split(' ')[0]}</span>}
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => handleCRUD('approve', tx.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold rounded transition-colors">
                  <CheckCircle className="w-3 h-3"/> {language==='zh'?'批准':'OK'}
                </button>
                <button onClick={() => handleCRUD('reject', tx.id)} className="flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded transition-colors">
                  <XCircle className="w-3 h-3"/> {language==='zh'?'拒绝':'No'}
                </button>
              </div>
            </div>
          );

          const renderColumn = (cats, count, colTitle) => (
            <div className="bg-white border border-amber-200 shadow-sm p-5 space-y-4 flex-1 min-w-0">
              <h4 className="text-base font-bold text-amber-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4"/>
                {colTitle}
                {count > 0 && <span className="ml-1 px-2 py-0.5 text-xs bg-amber-100 text-amber-700 rounded-full font-bold">{count}</span>}
              </h4>
              {count === 0
                ? <p className="text-xs text-gray-400 py-4 text-center">{language==='zh'?'暂无待审批':'No pending items'}</p>
                : cats.map(cat => {
                    const items = pendingTx.filter(tx => cat.types.includes(tx.type));
                    if (!items.length) return null;
                    const c = colorMap[cat.color] || colorMap.gray;
                    return (
                      <div key={cat.key} className={`border ${c.border} ${c.bg} p-3 space-y-2`}>
                        <div className={`text-xs font-bold ${c.title} flex items-center gap-2`}>
                          <span className={`px-2 py-0.5 rounded ${c.badge}`}>{cat.label}</span>
                          <span className="text-gray-400 font-normal">{items.length} {language==='zh'?'条':'items'}</span>
                        </div>
                        <div className="space-y-1.5">{items.map(tx => renderCard(tx, c))}</div>
                      </div>
                    );
                  })
              }
            </div>
          );

          return (
            <div className="space-y-2">
              <div className="text-sm font-bold text-amber-800 flex items-center gap-2 px-1">
                <AlertCircle className="w-4 h-4"/> {language==='zh'?'待审批中心':'Approval Center'} ({pendingTx.length})
              </div>
              <div className="flex gap-4 items-start">
                {renderColumn(leftCats,  leftCount,  language==='zh'?'贷款 · 存取款 · 注资':'Loans & Deposits')}
                {renderColumn(rightCats, rightCount, language==='zh'?'基金 · 债券 · 投资':'Fund & Bonds & Assets')}
              </div>
            </div>
          );
        })()}

        {/* 表格区 */}
        {currentPage === 'loans' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {currentPage === 'loans' && (
           <TableSection title={t('loanAssets')} color="red" icon={ArrowUpRight}
             data={isAdmin ? displayTx.filter(tx => tx.type === 'loan') : transactions.filter(tx => tx.type === 'loan' && tx.created_by === currentUser?.username)}
             isAdmin={isAdmin} onEdit={isAdmin ? (tx) => openModal('loan', tx) : null} onDelete={isAdmin ? (id) => handleCRUD('delete', id) : null} onRepay={isAdmin ? (id) => {if(window.confirm(t('confirmRepayLoan'))) handleCRUD('repay', id)} : null}
             onUserRepay={!isAdmin ? handleUserRepayLoan : null}
             pendingRepayLoanIds={!isAdmin ? new Set(transactions.filter(tx => tx.type === 'loan_repay_request' && tx.status === 'pending').map(tx => { const m = (tx.remark||'').match(/loan_id:([^\s]+)/); return m ? m[1] : null; }).filter(Boolean)) : null}
             language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel}
             interestRecords={transactions.filter(tx => tx.status === 'approved' && tx.type === 'interest_income')} applyInterest={true} />
           )}
           
           <div className="space-y-6">
             {/* 个人账户 */}
             {currentPage !== 'loans' && (
              <div className="bg-white border border-green-200 rounded-lg shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Wallet className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-base">{t('personalBalance')}</span>
                    {currentUserRole === 'liuli_member' && (
                      <span className="px-2 py-0.5 text-xs font-bold text-purple-700 bg-purple-100 border border-purple-200">
                        {t('roleLiuliMember')}
                      </span>
                    )}
                  </div>
                  <div className="text-right leading-tight">
                    <div className="text-[10px] text-gray-500">{language === 'zh' ? '余额' : 'Balance'}</div>
                    <div className="text-base font-bold text-gray-900">{formatMoney(stats.personalTotalBalance)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  <div className="border border-blue-200 bg-blue-50 flex flex-col items-center justify-center py-2.5 gap-0.5">
                    <div className="flex items-center gap-1 text-blue-600">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-gray-500">{t('injectionShort')}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{formatMoney(stats.injectionBalance)}</span>
                  </div>
                  <div className="border border-emerald-200 bg-emerald-50 flex flex-col items-center justify-center py-2.5 gap-0.5">
                    <div className="flex items-center gap-1 text-emerald-600">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-gray-500">{t('depositShort')}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{formatMoney(stats.depositBalance)}</span>
                  </div>
                  <div className="border border-sky-200 bg-sky-50 flex flex-col items-center justify-center py-2.5 gap-0.5">
                    <div className="flex items-center gap-1 text-sky-600">
                      <TrendingUp className="w-3.5 h-3.5" />
                      <span className="text-[11px] text-gray-500">{t('fundShort')}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{formatMoney(calculatePersonalFundBalance())}</span>
                  </div>
                </div>
                <div className={`mt-3 grid gap-2 ${currentUserRole === 'liuli_member' ? 'grid-cols-5' : 'grid-cols-4'}`}>
                  {currentUserRole === 'liuli_member' && (
                    <button onClick={() => setCurrentPage('loans')} className="bg-red-50 hover:bg-red-100 text-red-700 py-2 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border border-red-200 rounded">
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{language === 'zh' ? '账单' : 'Bills'}</span>
                    </button>
                  )}
                  <button onClick={() => openModal('injection')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border border-blue-200 rounded">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('injection')}</span>
                  </button>
                  <button onClick={() => openModal('withdraw_inj')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border border-blue-200 rounded">
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>{t('withdrawInj')}</span>
                  </button>
                  <button onClick={() => openModal('deposit')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border border-emerald-200 rounded">
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>{t('deposit')}</span>
                  </button>
                  <button onClick={() => openModal('withdraw_dep')} className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 text-xs font-medium transition-all flex flex-col items-center justify-center gap-0.5 border border-emerald-200 rounded">
                    <MinusCircle className="w-3.5 h-3.5" />
                    <span>{t('withdrawDep')}</span>
                  </button>
                </div>
                <p className="mt-3 text-xs text-gray-500">{t('injectionAndDeposit')}</p>
                {isAdmin && (
                  <div className="mt-3">
                    <button
                      onClick={() => setAccountListModalOpen(true)}
                     className="px-3 py-2 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold transition-colors"
                   >
                     {t('openAccountList')}
                   </button>
                 </div>
               )}
              </div>
              )}

             {currentPage === 'loans' && (
             <TableSection title={`${t('injectionAccount')} - ${t('injection')}`} color="orange" icon={ArrowDownLeft} 
              data={isAdmin ? injectionDataForTable : transactions.filter(tx => tx.type === 'injection' && tx.created_by === currentUser?.username)}
              isAdmin={isAdmin}
              onEdit={isAdmin ? (tx) => openModal(tx.type, tx) : null}
              onDelete={isAdmin ? (id) => handleCRUD('delete', id) : null}
              onDeleteAll={null}
              onManageGroup={null}
              onAggregatedEdit={null}
              onAggregatedDelete={null}
              language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} 
              interestRecords={injectionInterestExpense} applyInterest={true} />
             )}
              
              {currentPage === 'loans' && (
              <TableSection title={`${t('injectionAccount')} - ${t('withdrawInj')}`} color="orange" icon={ArrowDownLeft} 
                data={isAdmin ? displayTx.filter(tx => tx.type === 'withdraw_inj') : transactions.filter(tx => tx.type === 'withdraw_inj' && tx.created_by === currentUser?.username)}
               isAdmin={isAdmin} onEdit={(tx) => openModal(tx.type, tx)} onDelete={(id) => handleCRUD('delete', id)} onDeleteAll={() => handleCRUD('deleteAll', 'withdraw_inj')} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} applyInterest={false} />
              )}
             
             {/* 存款账户总余额 - 已按需求移除显示 */}

              {currentPage === 'loans' && (
              <TableSection title={`${t('depositAccount')} - ${t('deposit')}`} color="blue" icon={Wallet}
              data={isAdmin ? depositDataForTable : transactions.filter(tx => tx.type === 'deposit' && tx.created_by === currentUser?.username)}
              isAdmin={isAdmin}
              onEdit={isAdmin ? (tx) => openModal(tx.type, tx) : null}
              onDelete={isAdmin ? (id) => handleCRUD('delete', id) : null}
              onDeleteAll={null}
              onManageGroup={null}
              onAggregatedEdit={null}
              onAggregatedDelete={null}
              language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} 
              interestRecords={depositInterestExpense} applyInterest={true} />
              )}
              
              {currentPage === 'loans' && (
              <TableSection title={`${t('depositAccount')} - ${t('withdrawDep')}`} color="blue" icon={Wallet}
                data={isAdmin ? displayTx.filter(tx => tx.type === 'withdraw_dep') : transactions.filter(tx => tx.type === 'withdraw_dep' && tx.created_by === currentUser?.username)}
               isAdmin={isAdmin} onEdit={(tx) => openModal(tx.type, tx)} onDelete={(id) => handleCRUD('delete', id)} onDeleteAll={() => handleCRUD('deleteAll', 'withdraw_dep')} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} applyInterest={false} />
              )}
           </div>
        </div>
        )}

        {/* Modal */}
        {accountListModalOpen && isAdmin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white border-2 border-indigo-200 shadow-2xl max-w-2xl w-full p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-indigo-100 pb-3">
                <h3 className="text-xl font-bold text-gray-900">{t('accountList')}</h3>
                <button
                  onClick={() => {
                    setAccountListModalOpen(false);
                    setAccountSearch('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t('searchByName')}</label>
                <input
                  type="text"
                  value={accountSearch}
                  onChange={(e) => setAccountSearch(e.target.value)}
                  placeholder={t('searchAccountPlaceholder')}
                  className="w-full border border-indigo-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
                />
              </div>

              <div className="max-h-[420px] overflow-y-auto border border-indigo-100">
                {accountUsersFiltered.length === 0 ? (
                  <div className="p-6 text-sm text-gray-500 text-center">{t('noAccountsFound')}</div>
                ) : (
                  <div className="divide-y divide-indigo-50">
                    {accountUsersFiltered.map((u) => {
                      const role = u.role || 'user';
                      const canToggleMember = role === 'user' || role === 'liuli_member';
                      const isLiuliMember = role === 'liuli_member';
                      return (
                        <div key={u.id || u.username} className="p-3 flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate">{u.username || '-'}</div>
                            <div className="text-xs text-gray-500 mt-1">{t(getRoleDisplayKey(role))}</div>
                          </div>
                          <div className="shrink-0">
                            {canToggleMember ? (
                              <button
                                onClick={() => handleToggleLiuliMember(u)}
                                disabled={updatingMemberUserId === u.id}
                                className={`px-3 py-1.5 text-xs font-semibold border transition-colors ${
                                  isLiuliMember
                                    ? 'border-red-200 bg-red-50 hover:bg-red-100 text-red-700'
                                    : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                } disabled:opacity-60 disabled:cursor-not-allowed`}
                              >
                                {isLiuliMember ? t('revokeLiuliMember') : t('grantLiuliMember')}
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {forceSettleConfirmStep > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white border-2 border-green-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 transition-all hover:border-green-300 hover:shadow-green-200/50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">{t('forceSettle')}</h3>
                  <p className="text-sm text-gray-500 mt-1">{t('manualSettle')}</p>
                </div>
                <button onClick={cancelForceSettleConfirm} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded hover:bg-gray-100">
                  <X className="w-6 h-6"/>
                </button>
              </div>

              <p className="text-sm text-gray-700">
                {forceSettleConfirmStep === 1 ? t('forceSettleConfirm1') : t('forceSettleConfirm2')}
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={cancelForceSettleConfirm}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={confirmForceSettleInterest}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold transition-colors"
                >
                  {t('confirm')}
                </button>
              </div>
            </div>
          </div>
        )}

        {modalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                <div className="bg-white border-2 border-green-200 shadow-2xl max-w-md w-full p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200 transition-all hover:border-green-300 hover:shadow-green-200/50">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-xl text-gray-900">{editId ? t('edit') : t('create')}</h3>
                            <p className="text-sm text-gray-500 mt-1">{getLocalizedTypeLabel(modalType, language)}</p>
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
                                onChange={e => {
                                  const nextClient = e.target.value;
                                  if (modalType === 'deposit' && isAdmin && formData.product_type === 'risk') {
                                    const nextTarget = getUserByName(String(nextClient || '').trim());
                                    if (!isLiuliEligibleUser(nextTarget)) {
                                      setShowRiskEligibilityHint(false);
                                      setFormData({ ...formData, client: nextClient, product_type: 'risk5', rate: '5' });
                                      return;
                                    }
                                  }
                                  if (modalType === 'deposit') setShowRiskEligibilityHint(false);
                                  setFormData({ ...formData, client: nextClient });
                                }} 
                                className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all hover:border-green-300" 
                                placeholder={t('clientPlaceholderText')}
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
                                if (newType === 'risk' && !canSelectRiskDeposit) {
                                  setShowRiskEligibilityHint(true);
                                  return;
                                }
                                setShowRiskEligibilityHint(false);
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
                            {showRiskEligibilityHint && (
                              <p className="text-xs text-red-700 mt-2 bg-red-50 border border-red-200 p-2 font-semibold">{t('liuliMemberRequired')}</p>
                            )}
                            {formData.product_type === 'risk' && (
                              <p className="text-xs text-red-700 mt-2 bg-red-50 border border-red-200 p-2 font-semibold">{t('riskNote')}</p>
                            )}
                            {formData.product_type === 'risk5' && (
                              <p className="text-xs text-orange-700 mt-2 bg-orange-50 border border-orange-200 p-2">{t('riskNote5')}</p>
                            )}
                          </div>
                        )}

                        {/* 产品类型选择 - 取款 */}
                        {modalType === 'withdraw_dep' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('productType')}</label>
                            <select 
                              required 
                              value={formData.product_type} 
                              onChange={e => {
                                const newType = e.target.value;
                                setFormData({
                                  ...formData, 
                                  product_type: newType
                                });
                              }} 
                              className="w-full border-2 border-green-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all hover:border-green-300"
                            >
                              <option value="normal">{t('normalDeposit')}</option>
                              <option value="risk">{t('riskDeposit')}</option>
                              <option value="risk5">{t('riskDeposit5')}</option>
                            </select>
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
                            <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2">{t('fixedRateHint')}</p>
                          </div>
                        )}
                        {modalType === 'deposit' && (
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">{t('rateLabel')}</label>
                            <input
                                type="number"
                                disabled
                                value={formData.rate}
                                className="w-full border-2 border-green-200 px-3 py-2.5 outline-none bg-gray-100 cursor-not-allowed text-gray-500"
                            />
                            <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2">{language === 'zh' ? '利率由产品类型决定，不可手动修改' : 'Rate is determined by product type and cannot be changed manually'}</p>
                          </div>
                        )}
                        {!['injection', 'withdrawal', 'withdraw_dep', 'withdraw_inj', 'deposit'].includes(modalType) && (
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

const TableSection = ({ title, color, icon: Icon, data, isAdmin, onEdit, onDelete, onRepay, onUserRepay, pendingRepayLoanIds, onDeleteAll, onManageGroup, onAggregatedEdit, onAggregatedDelete, language, t, getLocalizedTypeLabel, interestRecords = [], applyInterest = true }) => {
  // 使用单个state管理所有行的展开状态
  const [openActionsId, setOpenActionsId] = React.useState(null);
  const [editingCell, setEditingCell] = React.useState(null); // { id, field, value }
  const containerRef = React.useRef(null);
  const tableRef = React.useRef(null);
  const [tableScale, setTableScale] = React.useState(1);
  const [scaledHeight, setScaledHeight] = React.useState(null);
  const hasActions = Boolean((isAdmin && (onEdit || onDelete || onManageGroup || onRepay || onAggregatedDelete)) || onUserRepay);
  
  const calculateWeeklyInterest = (principal, rate) => {
    return parseFloat((parseFloat(principal || 0) * parseFloat(rate || 0) / 100).toFixed(4));
  };

  React.useLayoutEffect(() => {
    const el = containerRef.current;
    const tbl = tableRef.current;
    if (!el || !tbl) return;

    const compute = () => {
      const containerWidth = el.clientWidth;
      const tableWidth = tbl.scrollWidth;
      if (!containerWidth || !tableWidth) return;

      const scale = Math.min(1, containerWidth / tableWidth);
      setTableScale(scale);

      const h = tbl.scrollHeight;
      setScaledHeight(h ? Math.ceil(h * scale) : null);
    };

    compute();

    const ro = new ResizeObserver(() => compute());
    ro.observe(el);
    ro.observe(tbl);

    window.addEventListener('resize', compute);
    return () => {
      window.removeEventListener('resize', compute);
      ro.disconnect();
    };
  }, [data.length, isAdmin, language]);
  
  const handleCellEdit = async (rowId, field, newValue) => {
    try {
      const numValue = parseFloat(newValue);
      if (isNaN(numValue) || numValue < 0) {
        alert(t('invalidNumber'));
        setEditingCell(null);
        return;
      }
      
      if (field === 'settlement_count') {
        // 对于利息次数，存储在备注字段中
        const { error } = await supabase
          .from('transactions')
          .update({ remark: `${t('interestCountPrefix')}:${Math.round(numValue)}` })
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
      alert(t('updateFailed') + ': ' + e.message);
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
              {t('deleteAll')}
            </button>
          )}
        </div>
      </div>

      <div ref={containerRef} className="overflow-hidden">
        <div style={{ height: scaledHeight ?? undefined }}>
          <div style={{ transform: `scale(${tableScale})`, transformOrigin: '0 0' }}>
            <table ref={tableRef} className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('status')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('type')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('clientLabel')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('productType')}</th>
              <th className="px-1.5 py-1.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{t('amountLabel')}</th>
              <th className="px-1.5 py-1.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{t('weeklyInterestLabel')}</th>
              <th className="px-1.5 py-1.5 text-right text-xs font-semibold text-gray-500 whitespace-nowrap">{t('cyclesLabel')}</th>
              <th className="px-1.5 py-1.5 text-left text-xs font-semibold text-gray-500 whitespace-nowrap">{t('dateLabel')}</th>
              {hasActions && <th className="px-1.5 py-1.5 text-center text-xs font-semibold text-gray-500 whitespace-nowrap">{t('actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row) => {
              const isAggregatedRow = Array.isArray(row.source_ids) && row.source_ids.length > 0;
              const isInterestRecord = ['interest_income', 'interest_expense'].includes(row.type);
              const isIncome = row.type === 'interest_income';
              const weeklyInterest = applyInterest && !isInterestRecord && !row.type.includes('withdraw')
                ? calculateWeeklyInterest(row.principal, row.rate)
                : 0;
              const aggregatedAccrued = parseFloat(row.accrued_sum || 0);
              const aggregatedWeekly = parseFloat(row.weekly_sum || 0);

              const productTypeLabel = getProductTypeLabel(row);

              const rowTime = row.timestamp ? new Date(row.timestamp) : null;
              // 先尝试从 remark 中解析 settlement_count，如果没有则计算
              let cyclesForRow = 0;
              const interestPrefix = `${t('interestCountPrefix')}:`;
              if (isAggregatedRow && aggregatedWeekly > 0) {
                cyclesForRow = parseFloat((aggregatedAccrued / aggregatedWeekly).toFixed(2));
              } else if (row.remark && row.remark.includes(interestPrefix)) {
                const match = row.remark.match(new RegExp(`${t('interestCountPrefix')}:\\s*(\\d+)`));
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
                  : (parseFloat(row.principal || 0) + (isAggregatedRow ? aggregatedAccrued : (weeklyInterest * cyclesForRow))));

              const showActions = openActionsId === row.id;
              
              // 判断是否正在编辑金额单元格
              const isEditingPrincipal = editingCell?.id === row.id && editingCell?.field === 'principal';
              const isEditingCycles = editingCell?.id === row.id && editingCell?.field === 'settlement_count';
              
              return (
                <tr key={row.id} className={`hover:bg-gray-50 text-xs ${isInterestRecord ? (isIncome ? 'bg-green-50' : 'bg-orange-50') : ''}`}>
                  <td className="px-1.5 py-1.5 whitespace-nowrap">{row.status === 'pending' ? <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-xs">{t('pending')}</span> : row.status === 'rejected' ? <span className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">{t('rejected')}</span> : <span className="text-green-600 bg-green-50 px-1 py-0.5 rounded text-xs">{t('effective')}</span>}</td>
                  <td className={`px-1.5 py-1.5 font-bold whitespace-nowrap ${isIncome ? 'text-green-700' : 'text-orange-700'}`}>{getLocalizedTypeLabel(row.type, language)}</td>
                  <td className="px-1.5 py-1.5 font-medium whitespace-nowrap">{row.client}</td>
                  <td className="px-1.5 py-1.5 text-xs whitespace-nowrap"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded inline-block text-xs">{productTypeLabel}</span></td>
                  <td className={`px-1.5 py-1.5 text-right font-mono font-bold whitespace-nowrap ${isIncome ? 'text-green-600' : (row.type.includes('withdraw') ? 'text-red-600' : 'text-gray-800')}`}>
                    {isAdmin && !isInterestRecord ? (
                      isEditingPrincipal ? (
                        <input
                          type="number"
                          step="0.001"
                          defaultValue={row.principal}
                          onBlur={(e) => {
                            if (isAggregatedRow && onAggregatedEdit) return onAggregatedEdit(row, 'principal', e.target.value);
                            return handleCellEdit(row.id, 'principal', e.target.value);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              if (isAggregatedRow && onAggregatedEdit) return onAggregatedEdit(row, 'principal', e.target.value);
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
                          title={t('clickToEdit')}
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
                          onBlur={(e) => {
                            if (isAggregatedRow && onAggregatedEdit) return onAggregatedEdit(row, 'settlement_count', e.target.value);
                            return handleCellEdit(row.id, 'settlement_count', e.target.value);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              if (isAggregatedRow && onAggregatedEdit) return onAggregatedEdit(row, 'settlement_count', e.target.value);
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
                          title={t('clickToEdit')}
                        >
                          {cyclesForRow}
                        </span>
                      )
                    ) : (
                      <span>{cyclesForRow}</span>
                    )}
                  </td>
                  <td className="px-1.5 py-1.5 text-xs text-gray-500 whitespace-nowrap">{row.timestamp ? row.timestamp.split(' ')[0] : '-'}</td>
                  {hasActions && <td className="px-1.5 py-1.5 text-center relative">
                    {onUserRepay && row.type === 'loan' ? (
                      pendingRepayLoanIds?.has(row.id)
                        ? <span className="text-xs text-gray-400 italic px-2">{t('repayPending')}</span>
                        : <button onClick={() => onUserRepay(row.id)} className="px-2 py-1 text-xs bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 font-medium rounded">
                            {t('repay')}
                          </button>
                    ) : (
                    <div className="relative inline-block">
                      <button onClick={() => setOpenActionsId(showActions ? null : row.id)} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200" title={t('actions')}>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                      </button>
                      {showActions && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                          {isAggregatedRow && onManageGroup ? (
                            <button onClick={() => { onManageGroup(row); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-indigo-600 flex items-center gap-2">
                              <Edit className="w-3.5 h-3.5" /> {t('editShort')}
                            </button>
                          ) : (
                            onEdit && <button onClick={() => { onEdit(row); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-indigo-600 flex items-center gap-2">
                              <Edit className="w-3.5 h-3.5" /> {t('editShort')}
                            </button>
                          )}
                          {onRepay && row.type === 'loan' && <button onClick={() => { onRepay(row.id); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-blue-600">
                            {t('repay')}
                          </button>}
                          {!isAggregatedRow && onDelete && (
                            <button onClick={() => { onDelete(row.id); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">
                              <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                            </button>
                          )}
                          {isAggregatedRow && onAggregatedDelete && (
                            <button onClick={() => { onAggregatedDelete(row); setOpenActionsId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">
                              <Trash2 className="w-3.5 h-3.5" /> {t('delete')}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    )}
                  </td>}
                </tr>
              );
            })}
            {data.length === 0 && <tr><td colSpan={hasActions ? "9" : "8"} className="px-6 py-4 text-center text-gray-400">{t('noData')}</td></tr>}
          </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

// ReplyItem 组件 - 递归渲染评论和嵌套回复
const ReplyItem = ({ reply, postId, currentUser, isAdmin, language, t, replyingTo, setReplyingTo, onDelete, depth = 0, expandedReplies, setExpandedReplies }) => {
  const [replyContent, setReplyContent] = React.useState('');
  const tFn = t || ((key) => translations[language || 'zh']?.[key] || translations['zh']?.[key] || key);
  
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
      
      if (!posts) throw new Error(tFn('postNotFound'));
      
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
            <span className="text-xs text-gray-400">{new Date(reply.timestamp).toLocaleString(language === 'zh' ? 'zh-CN' : 'en-US')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setReplyingTo({ postId, replyId: reply.id })}
              className="text-xs text-gray-500 hover:text-indigo-600 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5 inline" /> {tFn('reply')}
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
                    {isExpanded ? tFn('collapse') : tFn('viewFull')}
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
              placeholder={tFn('replyPlaceholder')}
              className="flex-1 border border-green-200 px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleReplySubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1"
            >
              <Send className="w-3.5 h-3.5" /> {tFn('reply')}
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
              language={language}
              t={t}
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
const AppWithErrorBoundary = () => {
  const savedLang = (() => {
    try {
      return sessionStorage.getItem('language') || localStorage.getItem('language') || 'zh';
    } catch {
      return 'zh';
    }
  })();
  const t = (key) => {
    try {
      return translations[savedLang]?.[key] || translations['zh']?.[key] || key;
    } catch {
      return key;
    }
  };
  return (
    <ErrorBoundary t={t}>
      <App />
    </ErrorBoundary>
  );
};

export default AppWithErrorBoundary;
