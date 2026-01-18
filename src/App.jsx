import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Wallet, LogOut, Shield, CheckCircle, XCircle, 
  AlertCircle, Trash2, Edit, Lock, ArrowUpRight, ArrowDownLeft, Settings, PlusCircle, MinusCircle, X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, query 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';

// ==========================================
// 1. 智能环境配置 (Smart Configuration)
// ==========================================

let db, auth;
let isConfigured = false;
let deployMode = 'standalone';

// 初始化 Firebase 配置
const initFirebase = () => {
  try {
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    // 验证所有必需的配置
    const requiredFields = Object.values(firebaseConfig);
    if (requiredFields.some(val => !val)) {
      throw new Error('Firebase 配置不完整');
    }

    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isConfigured = true;
    deployMode = 'standalone';
  } catch (e) {
    console.error("Firebase Init Error:", e);
    isConfigured = false;
  }
};

initFirebase();

// 获取 Firestore 集合引用
const getCollectionRef = (collName) => {
  return collection(db, collName);
};

// 获取文档引用
const getDocRef = (id) => {
  return doc(db, 'transactions', id);
};

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

// 多语言翻译
const translations = {
  zh: {
    // 登录页
    loginTitle: 'EUU',
    loginSubtitle: '超级投行',
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
    time: '时间',
    actions: '操作',
    pending: '待审',
    rejected: '已拒绝',
    effective: '生效',
    noData: '暂无数据',
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
    loginSubtitle: 'Super Investment Bank',
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
  const [formData, setFormData] = useState({ client: '', principal: '', rate: '' });
  const [editId, setEditId] = useState(null);
  const [nextSettleTime, setNextSettleTime] = useState('');
  const [settleCountdown, setSettleCountdown] = useState('');
  
  // 公告栏 State
  const [announcement, setAnnouncement] = useState({ id: '', content: '' });
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [announcementInput, setAnnouncementInput] = useState('');

  // 翻译函数
  const t = (key) => {
    try {
      return translations[language]?.[key] || key;
    } catch (e) {
      console.error('Translation error:', e, 'key:', key, 'language:', language);
      return key;
    }
  };
  const getLocalizedTypeLabel = (type) => {
    try {
      return translations[language]?.typeLabels?.[type] || type;
    } catch (e) {
      console.error('Type label error:', e, 'type:', type);
      return type;
    }
  }; 

  // --- 初始化 Firebase Auth ---
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Auth Error:", error);
        setConnectionStatus('error');
      }
    };

    initAuth();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        setConnectionStatus('connected');
      } else {
        setFirebaseUser(null);
      }
    });

    return () => unsubscribe();
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
      if (!currentUser || !db) return;
      
      const now = new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
      const dayOfWeek = now.getDay(); // 0=周日，3=周三
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // 周三中午12点（检查是否在12:00-12:02分钟内）
      if (dayOfWeek === 3 && hours === 12 && minutes >= 0 && minutes <= 2) {
        // 检查本周是否已经结算过（查看今天是否有利息结算记录）
        const today = new Date(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }));
        const todayStr = today.toLocaleDateString('zh-CN');
        const hasSettledToday = transactions.some(t => 
          (t.type === 'interest_income' || t.type === 'interest_expense') && 
          t.createdBy === 'System' &&
          t.timestamp.includes(todayStr)
        );
        
        if (!hasSettledToday) {
          await autoSettleInterest();
        }
      }
    };

    checkAndSettleInterest();
  }, [currentUser, transactions]);

  // --- 数据同步监听 ---
  useEffect(() => {
    if (!firebaseUser || !db) {
      setLoading(false);
      return;
    }

    // 监听交易
    const txQuery = query(getCollectionRef('transactions'));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''));
      setTransactions(data);
      setLoading(false);
    }, (err) => {
      console.error("Tx Sync Error", err);
      setLoading(false);
    });

    // 监听用户
    const userQuery = query(getCollectionRef('users'));
    const unsubUsers = onSnapshot(userQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegisteredUsers(data);
      if (data.length === 0) seedAdminUser();
    });

    // 监听公告
    const announcementQuery = query(getCollectionRef('announcements'));
    const unsubAnnouncement = onSnapshot(announcementQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (data.length > 0) {
        setAnnouncement(data[0]);
      } else {
        // 创建默认公告
        addDoc(getCollectionRef('announcements'), { content: '欢迎使用 EUU 超级投行系统' });
      }
    });

    const savedUser = sessionStorage.getItem('current_bank_user_v2');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    return () => { 
      unsubTx(); 
      unsubUsers();
      unsubAnnouncement(); 
    };
  }, [firebaseUser]);

  const seedAdminUser = async () => {
    try {
      await addDoc(getCollectionRef('users'), {
        username: 'EUU', 
        password: 'vkinga79', 
        role: 'admin', 
        createdAt: new Date().toISOString()
      });
    } catch (e) { 
      console.error("Seeding admin failed:", e); 
    }
  };

  // --- 更新公告 ---
  const handleUpdateAnnouncement = async () => {
    if (!announcement.id || !announcementInput.trim()) return;
    try {
      await updateDoc(doc(db, 'announcements', announcement.id), {
        content: announcementInput,
        updatedAt: new Date().toISOString()
      });
      setIsEditingAnnouncement(false);
      setAnnouncementInput('');
    } catch (e) {
      console.error('更新公告失败:', e);
    }
  };

  // --- 自动结算利息 ---
  const autoSettleInterest = async () => {
    try {
      const approved = transactions.filter(t => t.status === 'approved');
      
      // 计算各类型利息
      const calc = (types) => approved
        .filter(t => types.includes(t.type))
        .reduce((acc, cur) => ({
          // 周利息 = 本金 * 周利率%
          total: acc.total + ((parseFloat(cur.principal) || 0) * (parseFloat(cur.rate) || 0) / 100)
        }), { total: 0 });

      const loanInterest = calc(['loan']).total;
      const injectionInterest = calc(['injection']).total;
      const depositInterest = calc(['deposit']).total;

      // 生成利息结算记录
      if (loanInterest > 0) {
        await addDoc(getCollectionRef('transactions'), {
          type: 'interest_income',
          client: '利息收入',
          principal: loanInterest,
          rate: 0,
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          createdBy: 'System',
          creatorId: 'system',
          status: 'approved',
          remark: '本周贷款利息自动结算'
        });
      }

      if (injectionInterest + depositInterest > 0) {
        await addDoc(getCollectionRef('transactions'), {
          type: 'interest_expense',
          client: '利息支出',
          principal: injectionInterest + depositInterest,
          rate: 0,
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          createdBy: 'System',
          creatorId: 'system',
          status: 'approved',
          remark: '本周注资和存款利息自动结算'
        });
      }

      console.log('✅ 自动结算利息成功');
    } catch (e) {
      console.error("自动结算利息失败:", e);
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
        createdAt: new Date().toISOString() 
      };
      const docRef = await addDoc(getCollectionRef('users'), newUser);
      const userWithId = { ...newUser, id: docRef.id };
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
        const newItem = {
          ...payload,
          timestamp: new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }),
          createdBy: currentUser.username,
          creatorId: currentUser.id || 'unknown',
          status: currentUser.role === 'admin' ? 'approved' : 'pending' 
        };
        await addDoc(getCollectionRef('transactions'), newItem);
        setModalOpen(false);
        setFormData({ client: '', principal: '', rate: '' });
      } else if (action === 'update') {
        const { id, ...data } = payload;
        await updateDoc(getDocRef(id), { 
          ...data, 
          lastEditedBy: currentUser.username, 
          lastEditedAt: new Date().toLocaleString('zh-CN', { hour12: false })
        });
        setModalOpen(false);
        setFormData({ client: '', principal: '', rate: '' });
      } else if (action === 'delete') {
        if (!window.confirm('确认从服务器永久删除此记录？')) return;
        await deleteDoc(getDocRef(payload));
      } else if (action === 'approve' || action === 'reject') {
        await updateDoc(getDocRef(payload), { 
          status: action === 'approve' ? 'approved' : 'rejected', 
          approvedBy: currentUser.username,
          approvedAt: new Date().toLocaleString('zh-CN', { hour12: false })
        });
      }
    } catch (e) {
      alert("操作失败: " + e.message);
    }
  };

  const openModal = (type, editItem = null) => {
    setModalType(type);
    if (editItem) {
      setEditId(editItem.id);
      setFormData({ client: editItem.client, principal: editItem.principal, rate: editItem.rate });
    } else {
      setEditId(null);
      setFormData({ 
        client: currentUser.role === 'admin' ? '' : currentUser.username, 
        principal: '', 
        rate: type === 'deposit' ? '2.5' : '3.0' 
      });
    }
    setModalOpen(true);
  };

  // --- 统计 ---
  const stats = useMemo(() => {
    const approved = transactions.filter(t => t.status === 'approved');
    
    const calc = (types) => approved
      .filter(t => types.includes(t.type))
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

    return {
      loanPrincipal: loans.p,
      liabilities: totalLiabilities,
      netCashFlow: totalRevenue - totalExpense,
      idleCash: totalLiabilities - loans.p,
      interestPool: interestPool
    };
  }, [transactions]);

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
          <p className="mb-4">检测到您正在独立环境 (如 Vercel) 运行此应用，但尚未配置 Firebase 环境变量。</p>
          
          <div className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto mb-6 text-sm font-mono">
            <p className="text-slate-500 mb-2"># 请在 Vercel 项目设置 → Environment Variables 中添加以下变量：</p>
            <p>VITE_FIREBASE_API_KEY=...</p>
            <p>VITE_FIREBASE_AUTH_DOMAIN=...</p>
            <p>VITE_FIREBASE_PROJECT_ID=...</p>
            <p>VITE_FIREBASE_STORAGE_BUCKET=...</p>
            <p>VITE_FIREBASE_MESSAGING_SENDER_ID=...</p>
            <p>VITE_FIREBASE_APP_ID=...</p>
          </div>
          <p className="text-sm text-gray-600">配置完成后，请在 Vercel 中重新部署 (Redeploy)。</p>
        </div>
      </div>
    );
  }

  // --- 渲染：登录页 ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="absolute top-4 right-4">
          <button 
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors border border-white/20"
          >
            {language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>
        <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-300">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-600 mb-2">{t('loginTitle')}</h1>
            <p className="text-xl text-slate-600 font-semibold">{t('loginSubtitle')}</p>
            <p className="text-slate-500 mt-3 text-sm flex items-center justify-center gap-2">
               <span className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'}`}></span>
               {connectionStatus === 'connected' ? t('serverConnected') : connectionStatus === 'connecting' ? t('connecting') : t('connectionFailed')}
            </p>
          </div>
          <form onSubmit={authMode === 'login' ? handleLogin : handleRegister} className="space-y-4">
            <input type="text" required placeholder={t('accountPlaceholder')} value={authInput.username} onChange={e => setAuthInput({...authInput, username: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            <input type="password" required placeholder={t('passwordPlaceholder')} value={authInput.password} onChange={e => setAuthInput({...authInput, password: e.target.value})} className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none" />
            {authError && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2"><AlertCircle className="w-4 h-4"/>{authError}</div>}
            <button disabled={connectionStatus !== 'connected'} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg">{authMode === 'login' ? t('loginButton') : t('registerButton')}</button>
          </form>
          <div className="mt-6 text-center text-sm"><button onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }} className="text-indigo-600 hover:underline font-medium">{authMode === 'login' ? t('noAccount') : t('backToLogin')}</button></div>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';
  const pendingTx = transactions.filter(t => t.status === 'pending');
  const displayTx = isAdmin ? transactions : transactions.filter(t => t.creatorId === currentUser.id);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-green-200">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
              <span className="text-blue-600 text-4xl font-bold">{t('loginTitle')}</span> {t('loginSubtitle')}
              {isAdmin && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-bold">ADMIN</span>}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">{t('currentUser')}: <span className="font-bold">{currentUser.username}</span></p>
          </div>
          <div className="flex flex-col items-end gap-2 mt-4 md:mt-0">
             <div className="flex items-center gap-3">
               <button 
                 onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
                 className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg font-medium transition-colors border border-green-200 text-sm"
               >
                 {language === 'zh' ? 'EN' : '中文'}
               </button>
               <div className={`px-4 py-2 rounded-lg font-bold text-lg ${stats.netCashFlow >= -0.001 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {t('netCashFlow')}: {stats.netCashFlow > 0 ? '+' : ''}{formatMoney(stats.netCashFlow)} {t('perWeek')}
                </div>
             </div>
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1"><LogOut className="w-4 h-4" /> {t('logout')}</button>
          </div>
        </div>

        {/* 公告栏 */}
        <div className="bg-gradient-to-r from-green-50 via-green-100 to-green-50 rounded-xl shadow-sm p-4 border-2 border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="bg-green-100 p-2 rounded-lg border border-green-200">
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
                {pendingTx.map(t => (
                  <div key={t.id} className="bg-white p-4 rounded-lg border border-amber-100 flex justify-between items-center">
                     <div>
                        <span className="font-bold mr-2">[{getLocalizedTypeLabel(t.type)}]</span> {t.client} - {formatMoney(t.principal)}
                        <span className="text-xs text-gray-500 block">{t('applicant')}: {t.createdBy}</span>
                     </div>
                     <div className="flex gap-2">
                        <button onClick={() => handleCRUD('approve', t.id)} className="p-2 bg-green-100 text-green-700 rounded hover:bg-green-200"><CheckCircle className="w-4 h-4"/></button>
                        <button onClick={() => handleCRUD('reject', t.id)} className="p-2 bg-red-100 text-red-700 rounded hover:bg-red-200"><XCircle className="w-4 h-4"/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {/* 操作栏 */}
        <div className="bg-white p-4 rounded-xl border border-green-200 shadow-sm flex flex-wrap gap-4 items-center">
            <span className="font-bold text-gray-700 mr-2 flex items-center gap-2"><Lock className="w-4 h-4 text-gray-400"/> {t('operations')}:</span>
            <Btn icon={PlusCircle} label={t('loan')} onClick={() => openModal('loan')} color="green" />
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <Btn icon={PlusCircle} label={t('injection')} onClick={() => openModal('injection')} color="blue" />
            <Btn icon={MinusCircle} label={t('withdrawInj')} onClick={() => openModal('withdraw_inj')} color="blue" />
            <div className="h-6 w-px bg-green-200 mx-2"></div>
            <Btn icon={PlusCircle} label={t('deposit')} onClick={() => openModal('deposit')} color="purple" />
            <Btn icon={MinusCircle} label={t('withdrawDep')} onClick={() => openModal('withdraw_dep')} color="purple" />
            {isAdmin && <div className="h-6 w-px bg-green-200 mx-2"></div>}
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
             data={displayTx.filter(t => t.type === 'loan')} 
             isAdmin={isAdmin} onEdit={(t) => openModal('loan', t)} onDelete={(id) => handleCRUD('delete', id)} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} />
           
           <div className="space-y-6">
             <TableSection title={t('injectionAccount')} color="orange" icon={ArrowDownLeft} 
               data={displayTx.filter(t => ['injection', 'withdraw_inj'].includes(t.type))} 
               isAdmin={isAdmin} onEdit={(t) => openModal(t.type, t)} onDelete={(id) => handleCRUD('delete', id)} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} />
             
             <TableSection title={t('depositAccount')} color="blue" icon={Wallet} 
               data={displayTx.filter(t => ['deposit', 'withdraw_dep'].includes(t.type))} 
               isAdmin={isAdmin} onEdit={(t) => openModal(t.type, t)} onDelete={(id) => handleCRUD('delete', id)} language={language} t={t} getLocalizedTypeLabel={getLocalizedTypeLabel} />
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
                        <label className="block text-sm font-medium mb-1">{t('amountLabel')}</label>
                        <input type="number" step="0.001" required value={formData.principal} onChange={e => setFormData({...formData, principal: e.target.value})} className="w-full border rounded p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500" />
                        <label className="block text-sm font-medium mb-1">{t('rateLabel')}</label>
                        <input type="number" step="0.1" required value={formData.rate} onChange={e => setFormData({...formData, rate: e.target.value})} className="w-full border rounded p-2 mb-3 outline-none focus:ring-2 focus:ring-blue-500" />
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
const Btn = ({ icon: Icon, label, onClick, color }) => (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2 bg-${color}-50 text-${color}-700 hover:bg-${color}-100 rounded-lg font-medium border border-${color}-200 transition-colors`}>
        <Icon className="w-4 h-4" /> {label}
    </button>
);

const StatCard = ({ title, value, subtext, icon }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200 flex flex-col justify-between h-32">
        <div className="flex justify-between items-start"><h3 className="text-sm font-medium text-gray-500 uppercase">{title}</h3><div className="p-2 bg-gray-50 rounded-lg">{icon}</div></div>
        <div><div className="text-2xl font-bold text-gray-900">{value}</div><div className="text-xs font-medium text-gray-500 mt-1">{subtext}</div></div>
    </div>
);

const TableSection = ({ title, color, icon: Icon, data, isAdmin, onEdit, onDelete, language, t, getLocalizedTypeLabel }) => {
    const calculateWeeklyInterest = (principal, rate) => {
      return (parseFloat(principal || 0) * parseFloat(rate || 0) / 100).toFixed(4);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-green-200 overflow-hidden">
            <div className={`bg-${color}-50 px-6 py-4 border-b border-green-200 flex items-center gap-2`}>
                <Icon className={`w-5 h-5 text-${color}-700`} /> <h2 className={`text-lg font-bold text-${color}-800`}>{title}</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 font-medium"><tr><th className="px-4 py-3">{t('status')}</th><th className="px-4 py-3">{t('type')}</th><th className="px-4 py-3">{t('client')}</th><th className="px-4 py-3 text-right">{t('amount')}</th><th className="px-4 py-3 text-right">{t('interestPerWeek')}</th><th className="px-4 py-3">{t('time')}</th><th className="px-4 py-3 text-right">{t('actions')}</th></tr></thead>
                    <tbody className="divide-y divide-green-100">
                        {data.map(row => {
                            const weeklyInterest = calculateWeeklyInterest(row.principal, row.rate);
                            return (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">{row.status === 'pending' ? <span className="text-amber-600 bg-amber-50 px-2 py-1 rounded text-xs">{t('pending')}</span> : row.status === 'rejected' ? <span className="text-red-600 bg-red-50 px-2 py-1 rounded text-xs">{t('rejected')}</span> : <span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs">{t('effective')}</span>}</td>
                                    <td className="px-4 py-3 font-medium text-blue-600">{getLocalizedTypeLabel(row.type)}</td>
                                    <td className="px-4 py-3 font-medium">{row.client}</td>
                                    <td className={`px-4 py-3 text-right font-mono font-bold ${row.type.includes('withdraw') ? 'text-red-600' : 'text-gray-800'}`}>{row.type.includes('withdraw') ? '-' : '+'}{parseFloat(row.principal).toFixed(3)}m</td>
                                    <td className="px-4 py-3 text-right font-mono text-xs text-purple-600">{weeklyInterest}m</td>
                                    <td className="px-4 py-3 text-xs text-gray-500">{row.timestamp ? row.timestamp.split(' ')[0] : '-'}</td>
                                    <td className="px-4 py-3 text-right">
                                        {isAdmin ? (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => onEdit(row)} className="text-indigo-500 hover:text-indigo-700"><Edit className="w-4 h-4"/></button>
                                                <button onClick={() => onDelete(row.id)} className="text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4"/></button>
                                            </div>
                                        ) : <span className="text-gray-300">-</span>}
                                    </td>
                                </tr>
                            );
                        })}
                        {data.length === 0 && <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-400">{t('noData')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default App;
