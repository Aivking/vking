import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Wallet, LogOut, Shield, CheckCircle, XCircle, 
  AlertCircle, Trash2, Edit, Lock, ArrowUpRight, ArrowDownLeft, Settings, PlusCircle, MinusCircle, X, MessageSquare, Send, ThumbsUp
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// 1. Supabase 配置
// ==========================================

let isConfigured = true;
let deployMode = 'standalone';

// 事务类型中文映射
const typeLabels = {
  'loan': '贷款',
  'injection': '注资',
  'withdraw_inj': '撤资',
  'deposit': '存款',
  'withdraw_dep': '取款',
  'interest_income': '利息收入',
  'interest_expense': '利息支出'
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
    totalAssets: '总资产 (贷款)',
    totalLiabilities: '总负债 (注资+存款)',
    idleFunds: '闲置资金',
    interestPool: '利息池',
    approvalQueue: '审批队列',
    approved: '已审核通过',
    availableBalance: '可用余额',
    weeklyNetInterest: '周净利息',
    pendingItems: '笔待处理',
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
    riskDeposit: '风险理财 (9%/周)',
    riskNote: '风险理财只保本不保利息',
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
    totalAssets: 'Total Assets (Loans)',
    totalLiabilities: 'Total Liabilities (Inj+Dep)',
    idleFunds: 'Idle Funds',
    interestPool: 'Interest Pool',
    approvalQueue: 'Approval Queue',
    approved: 'Approved',
    availableBalance: 'Available Balance',
    weeklyNetInterest: 'Weekly Net Interest',
    pendingItems: 'Pending',
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
      'interest_expense': 'Interest Expense'
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
  
  // 公告栏 State
  const [announcement, setAnnouncement] = useState({ id: '', content: '' });
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');
  
  // 论坛 State
  const [currentPage, setCurrentPage] = useState('bank'); // 'bank' or 'forum'
  const [expandedPosts, setExpandedPosts] = useState(new Set()); // 展开的帖子ID
  const [expandedReplies, setExpandedReplies] = useState(new Set()); // 展开的评论ID
  const [posts, setPosts] = useState([]);
  const [newPostModal, setNewPostModal] = useState(false);
  const [newPostData, setNewPostData] = useState({ title: '', content: '' });
  const [replyingTo, setReplyingTo] = useState(null); // { postId, replyId } or postId
  const [replyContent, setReplyContent] = useState('');

  // 翻译函数
  const t = (key) => {
    try {
      return translations[language]?.[key] || key;
    } catch (e) {
      console.error('Translation error:', e, 'key:', key, 'language:', language);
      return key;
    }
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
        // 每周三自动结算利息，不检查重复
        await autoSettleInterest();
      }
    };

    checkAndSettleInterest();
  }, [currentUser, transactions]);

  // --- 数据同步监听 ---
  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

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
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!txError && txData) {
          setTransactions(txData);
        }

        // 获取用户数据
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*');

        if (!usersError && usersData) {
          setRegisteredUsers(usersData);
          if (usersData.length === 0) seedAdminUser();
        }

        // 获取公告数据
        const { data: announcementData, error: announcementError } = await supabase
          .from('announcements')
          .select('*')
          .limit(1);

        if (!announcementError && announcementData && announcementData.length > 0) {
          setAnnouncement(announcementData[0]);
        } else {
          // 创建默认公告
          await supabase.from('announcements').insert({
            title: '公告',
            content: '欢迎使用 EUU 超级投行系统'
          });
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

  // --- 更新公告 ---
  const handleUpdateAnnouncement = async () => {
    if (!announcement.id || !announcementInput.trim()) return;
    try {
      await supabase
        .from('announcements')
        .update({
          content: announcementInput,
          updated_at: new Date().toISOString()
        })
        .eq('id', announcement.id);
      setIsEditingAnnouncement(false);
      setAnnouncementInput('');
    } catch (e) {
      console.error('更新公告失败:', e);
    }
  };

  // --- 论坛功能 ---
  // 获取帖子列表
  useEffect(() => {
    if (currentPage === 'forum') {
      fetchPosts();
    }
  }, [currentPage]);

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
          const availableDep = deposits + depInterest - withdrawnDep;
          
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
        const updateData = {
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: currentUser.username,
          approved_at: new Date().toLocaleString('zh-CN', { hour12: false })
        };
        
        // 如果是拒绝，记录拒绝时间
        if (action === 'reject') {
          updateData.rejected_at = new Date().toISOString();
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

    const totalLiabilities = (injections.p - wInj.p) + (deposits.p - wDep.p);
    const totalRevenue = loans.i;
    const totalExpense = (injections.i - wInj.i) + (deposits.i - wDep.i);

    // 计算利息池 (每周净利息，利率已按周计)
    const interestPool = (totalRevenue - totalExpense);

    // 计算个人注资和存款账户的总余额（包括用户自己的所有记录和已批准的他人记录）
    const userTransactions = transactions.filter(tx => 
      tx.created_by === currentUser?.username || tx.status === 'approved'
    );
    const calcPersonal = (types) => userTransactions
      .filter(tx => types.includes(tx.type))
      .reduce((acc, cur) => ({
        p: acc.p + (parseFloat(cur.principal) || 0),
        i: acc.i + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100)
      }), { p: 0, i: 0 });
    
    const personalInjections = calcPersonal(['injection']);
    const personalDeposits = calcPersonal(['deposit']);
    const personalWInj = calcPersonal(['withdraw_inj']);
    const personalWDep = calcPersonal(['withdraw_dep']);
    
    // 统计已结算的利息支出（注资和存款分别统计）
    const injectionSettledInterest = approved
      .filter(tx => tx.type === 'interest_expense' && tx.client === '注资利息支出')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    
    const depositSettledInterest = approved
      .filter(tx => tx.type === 'interest_expense' && tx.client === '存款利息支出')
      .reduce((sum, tx) => sum + (parseFloat(tx.principal) || 0), 0);
    
    const injectionBalance = (personalInjections.p - personalWInj.p) + injectionSettledInterest;
    const depositBalance = (personalDeposits.p - personalWDep.p) + depositSettledInterest;

    return {
      loanPrincipal: loans.p,
      liabilities: totalLiabilities,
      netCashFlow: totalRevenue - totalExpense,
      idleCash: totalLiabilities - loans.p,
      interestPool: interestPool,
      injectionBalance: injectionBalance,
      depositBalance: depositBalance
    };
  }, [transactions, currentUser]);

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
  const pendingTx = transactions.filter(tx => tx.status === 'pending');
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
                className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors border border-green-200 flex items-center gap-2"
              >
                <ArrowDownLeft className="w-4 h-4" /> {t('backToBank')}
              </button>
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                <MessageSquare className="text-indigo-600" />
                <span className="text-indigo-600">{t('forum')}</span>
              </h1>
            </div>
            <button
              onClick={() => setNewPostModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> {t('newPost')}
            </button>
          </div>

          {/* 帖子列表 */}
          <div className="space-y-4">
            {posts.length === 0 ? (
              <div className="bg-white rounded-xl p-12 text-center border border-green-200">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-400 text-lg">{t('noPostsYet')}</p>
              </div>
            ) : (
              posts.map(post => (
                <div key={post.id} className="bg-white rounded-xl border border-green-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
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
                          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                        />
                        <button
                          onClick={() => handleReply(post.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <h3 className="font-bold text-xl text-gray-800">{t('newPost')}</h3>
                  <button onClick={() => setNewPostModal(false)}>
                    <X className="w-6 h-6 text-gray-400 hover:text-gray-600" />
                  </button>
                </div>
                <form onSubmit={handleCreatePost} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('postTitle')}</label>
                    <input
                      type="text"
                      required
                      value={newPostData.title}
                      onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="请输入标题..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">{t('postContent')}</label>
                    <textarea
                      required
                      value={newPostData.content}
                      onChange={(e) => setNewPostData({ ...newPostData, content: e.target.value })}
                      rows={6}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                      placeholder="写下你想说的..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors"
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
    if (withdrawType) {
      const withdrawn = txList.filter(tx => tx.type === withdrawType && tx.status === 'approved');
      withdrawn.forEach(w => {
        const user = w.created_by || 'unknown';
        if (userBalances[user]) {
          userBalances[user].userBalanceTotal -= parseFloat(w.principal) || 0;
        }
      });
    }
    
    // 将净余额更新到 principal 中供显示
    return Object.values(userBalances).map(item => ({
      ...item,
      principal: item.userBalanceTotal,
      isNetBalance: true // 标记为净余额数据
    })).filter(item => item.principal > 0); // 只显示余额 > 0 的用户
  };

  return (
    <div className="min-h-screen bg-[#FFFEF9] text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-green-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-clip-text text-transparent animate-gradient">{t('loginTitle')}</span> {t('loginSubtitle')}
              {isAdmin && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">ADMIN</span>}
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

        {/* 公告栏 */}
        <div className="bg-green-50 shadow-sm p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-green-100 p-2 border border-green-200">
                <Activity className="w-6 h-6 text-green-700" />
              </div>
              {isEditingAnnouncement ? (
                <input 
                  type="text" 
                  value={announcementInput} 
                  onChange={(e) => setAnnouncementInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUpdateAnnouncement()}
                  className="flex-1 px-4 py-2 rounded-lg border-2 border-green-200 bg-white text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green-400"
                  placeholder={t('announcementPlaceholder')}
                  autoFocus
                />
              ) : (
                <p className="text-green-900 text-lg font-bold flex-1">{announcement.content || t('noAnnouncement')}</p>
              )}
            </div>
            {isAdmin && (
              <div className="flex gap-2 ml-4">
                {isEditingAnnouncement ? (
                  <>
                    <button 
                      onClick={handleUpdateAnnouncement}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> {t('save')}
                    </button>
                    <button 
                      onClick={() => { setIsEditingAnnouncement(false); setAnnouncementInput(''); }}
                      className="bg-white text-green-700 px-4 py-2 rounded-lg font-bold border border-green-200 hover:bg-green-50 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> {t('cancel')}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => { setIsEditingAnnouncement(true); setAnnouncementInput(announcement.content || ''); }}
                    className="bg-white text-green-700 px-4 py-2 rounded-lg font-bold border border-green-200 hover:bg-green-50 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" /> {t('editAnnouncement')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 管理员审批 */}
        {isAdmin && pendingTx.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2 mb-4"><AlertCircle className="w-5 h-5"/> {t('pendingApproval')} ({pendingTx.length})</h3>
             <div className="grid gap-3">
                {pendingTx.map(tx => {
                  const getProductTypeLabel = (tx) => {
                    if (tx.type === 'deposit') {
                      return tx.product_type === 'risk' ? t('riskDeposit') : t('normalDeposit');
                    } else if (tx.type === 'loan') {
                      return tx.product_type === 'stable' ? t('stableLoan') : t('interestLoan');
                    }
                    return '';
                  };
                  const productTypeLabel = getProductTypeLabel(tx);
                  
                  return (
                  <div key={tx.id} className="bg-white p-4 rounded-lg border border-amber-100 flex justify-between items-center">
                     <div>
                        <span className="font-bold mr-2">[{getLocalizedTypeLabel(tx.type)}]</span> 
                        {tx.client} - {formatMoney(tx.principal)}
                        {productTypeLabel && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{productTypeLabel}</span>}
                        <span className="text-xs text-gray-500 block">{t('applicant')}: {tx.created_by}</span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleCRUD('approve', tx.id)} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><CheckCircle className="w-4 h-4"/></button>
                        <button onClick={() => handleCRUD('reject', tx.id)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><XCircle className="w-4 h-4"/></button>
                     </div>
                  </div>
                  );
                })}
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
            <Btn icon={PlusCircle} label={t('deposit')} onClick={() => openModal('deposit')} color="purple" />
            <Btn icon={MinusCircle} label={t('withdrawDep')} onClick={() => openModal('withdraw_dep')} color="purple" />
            {isAdmin && <div className="h-6 w-px bg-green-200 mx-2"></div>}
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <Btn icon={MessageSquare} label={t('forum')} onClick={() => setCurrentPage('forum')} color="red" className="px-8" />
            {isAdmin && <Btn icon={PlusCircle} label={`${t('manualSettle')} (${settleCountdown})`} onClick={() => autoSettleInterest()} color="amber" />}
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <StatCard title={t('totalAssets')} value={formatMoney(stats.loanPrincipal)} subtext={t('approved')} icon={<ArrowUpRight className="text-green-600" />} />
          <StatCard title={t('totalLiabilities')} value={formatMoney(stats.liabilities)} subtext={t('approved')} icon={<ArrowDownLeft className="text-red-500" />} />
          <StatCard title={t('idleFunds')} value={formatMoney(stats.idleCash)} subtext={t('availableBalance')} icon={<Wallet className="text-yellow-500" />} />
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
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="font-bold text-lg">{editId ? t('edit') : t('create')} {getLocalizedTypeLabel(modalType)}</h3>
                        <button onClick={() => setModalOpen(false)}><X className="w-6 h-6 text-gray-400"/></button>
                    </div>
                    <form onSubmit={(e) => { e.preventDefault(); handleCRUD(editId ? 'update' : 'create', editId ? { id: editId, ...formData } : { ...formData, type: modalType }); }}>
                        <label className="block text-sm font-medium mb-1">{t('clientLabel')}</label>
                        <input type="text" required disabled={!isAdmin && !editId} value={formData.client} onChange={e => setFormData({...formData, client: e.target.value})} className="w-full border rounded p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100" />
                        
                        {/* 产品类型选择 - 存款 */}
                        {modalType === 'deposit' && (
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">{t('productType')}</label>
                            <select 
                              required 
                              value={formData.product_type} 
                              onChange={e => {
                                const newType = e.target.value;
                                setFormData({
                                  ...formData, 
                                  product_type: newType,
                                  rate: newType === 'risk' ? '9' : '2.5'
                                });
                              }} 
                              className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="normal">{t('normalDeposit')}</option>
                              <option value="risk">{t('riskDeposit')}</option>
                            </select>
                            {formData.product_type === 'risk' && (
                              <p className="text-xs text-orange-600 mt-1">{t('riskNote')}</p>
                            )}
                          </div>
                        )}
                        
                        {/* 产品类型选择 - 贷款 */}
                        {modalType === 'loan' && (
                          <div className="mb-3">
                            <label className="block text-sm font-medium mb-1">{t('productType')}</label>
                            <select 
                              required 
                              value={formData.product_type} 
                              onChange={e => setFormData({...formData, product_type: e.target.value})} 
                              className="w-full border rounded p-2 outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="interest">{t('interestLoan')}</option>
                              <option value="stable">{t('stableLoan')}</option>
                            </select>
                          </div>
                        )}
                        
                        <label className="block text-sm font-medium mb-1">{t('amountLabel')}</label>
                        <input type="number" step="0.001" required value={formData.principal} onChange={e => setFormData({...formData, principal: e.target.value})} className="w-full border rounded p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500" />
                        
                        {/* 利率字段 - 注资显示固定3%禁用，其他可编辑，撤资/取款隐藏 */}
                        {modalType === 'injection' && (
                          <>
                            <label className="block text-sm font-medium mb-1">{t('rateLabel')}</label>
                            <input type="number" step="0.1" disabled value={formData.rate} className="w-full border rounded p-2 mb-3 outline-none bg-gray-100 cursor-not-allowed" />
                            <p className="text-xs text-gray-500 mb-3">固定3%，不允许更改</p>
                          </>
                        )}
                        {!['injection', 'withdrawal', 'withdraw_dep', 'withdraw_inj'].includes(modalType) && (
                          <>
                            <label className="block text-sm font-medium mb-1">{t('rateLabel')}</label>
                            <input type="number" step="0.1" required value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} className="w-full border rounded p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500" />
                          </>
                        )}
                        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">{t('submit')}</button>
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
  const calculateWeeklyInterest = (principal, rate) => {
    return parseFloat((parseFloat(principal || 0) * parseFloat(rate || 0) / 100).toFixed(4));
  };

  const getProductTypeLabel = (row) => {
    if (row.type === 'deposit') {
      return row.product_type === 'risk' ? t('riskDeposit') : t('normalDeposit');
    } else if (row.type === 'loan') {
      return row.product_type === 'stable' ? t('stableLoan') : t('interestLoan');
    }
    return '-';
  };

  return (
    <div className="bg-white shadow-sm border border-green-200 overflow-hidden">
      <div className="bg-green-50 px-6 py-4 border-b border-green-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 text-${color}-700`} /> <h2 className={`text-lg font-bold text-${color}-800`}>{title}</h2>
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
              const cyclesForRow = (applyInterest && rowTime)
                ? interestRecords.filter(r => {
                    if (!r.timestamp) return false;
                    const rt = new Date(r.timestamp);
                    return rt >= rowTime;
                  }).length
                : 0;

              const totalAmount = isInterestRecord
                ? parseFloat(row.principal || 0)
                : (row.type.includes('withdraw')
                  ? parseFloat(row.principal || 0)
                  : (parseFloat(row.principal || 0) + weeklyInterest * cyclesForRow));

              const [showActions, setShowActions] = React.useState(false);
              return (
                <tr key={row.id} className={`hover:bg-gray-50 text-xs ${isInterestRecord ? (isIncome ? 'bg-green-50' : 'bg-orange-50') : ''}`}>
                  <td className="px-1.5 py-1.5 whitespace-nowrap">{row.status === 'pending' ? <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded text-xs">{t('pending')}</span> : row.status === 'rejected' ? <span className="text-red-600 bg-red-50 px-1 py-0.5 rounded text-xs">{t('rejected')}</span> : <span className="text-green-600 bg-green-50 px-1 py-0.5 rounded text-xs">{t('effective')}</span>}</td>
                  <td className={`px-1.5 py-1.5 font-bold whitespace-nowrap ${isIncome ? 'text-green-700' : 'text-orange-700'}`}>{getLocalizedTypeLabel(row.type)}</td>
                  <td className="px-1.5 py-1.5 font-medium truncate max-w-xs">{row.client}</td>
                  <td className="px-1.5 py-1.5 text-xs whitespace-nowrap"><span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded inline-block text-xs">{productTypeLabel}</span></td>
                  <td className={`px-1.5 py-1.5 text-right font-mono font-bold whitespace-nowrap ${isIncome ? 'text-green-600' : (row.type.includes('withdraw') ? 'text-red-600' : 'text-gray-800')}`}>{isIncome ? '+' : (row.type.includes('withdraw') ? '-' : '+')}{(totalAmount || 0).toFixed(3)}m</td>
                  <td className="px-1.5 py-1.5 text-right font-mono text-xs text-purple-600 whitespace-nowrap">{isInterestRecord ? '-' : (weeklyInterest || 0).toFixed(3) + 'm'}</td>
                  <td className="px-1.5 py-1.5 text-right font-mono text-xs text-gray-600 whitespace-nowrap">{cyclesForRow}</td>
                  <td className="px-1.5 py-1.5 text-xs text-gray-500 whitespace-nowrap">{row.timestamp ? row.timestamp.split(' ')[0] : '-'}</td>
                  {isAdmin && <td className="px-1.5 py-1.5 text-center relative">
                    <div className="relative inline-block">
                      <button onClick={() => setShowActions(!showActions)} className="text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-200" title="操作">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" /></svg>
                      </button>
                      {showActions && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-lg z-10">
                          <button onClick={() => { onEdit(row); setShowActions(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 text-indigo-600 flex items-center gap-2">
                            <Edit className="w-3 h-3" /> 编辑
                          </button>
                          {onRepay && row.type === 'loan' && <button onClick={() => { onRepay(row.id); setShowActions(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-blue-50 text-blue-600">
                            还款
                          </button>}
                          <button onClick={() => { onDelete(row.id); setShowActions(false); }} className="w-full text-left px-3 py-2 text-xs hover:bg-red-50 text-red-600 flex items-center gap-2">
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
      <div className="bg-gray-50 rounded-lg p-3">
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
              className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
            <button
              onClick={handleReplySubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1"
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

export default App;
