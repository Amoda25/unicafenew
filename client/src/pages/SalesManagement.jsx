import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, TrendingUp, Clock, Package, Zap, BarChart3, Users as UsersIcon,
    Plus, X, AlignLeft, Search, Bell, MessageSquare, Trash2, FileText, Download,
    Target, ArrowUpRight, Award, Flame, Tag, Percent, CheckCircle2, AlertTriangle,
    Sparkles, TrendingDown, Gift
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';
import axios from 'axios';
import SalesSidebar from '../components/SalesSidebar';

const SalesManagement = () => {
    const getInitialGoal = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const savedGoalData = localStorage.getItem('dailySalesGoal');
        if (savedGoalData) {
            try {
                const { date, goal } = JSON.parse(savedGoalData);
                if (date === todayStr) {
                    return goal;
                }
            } catch (e) {}
        }
        return 0;
    };

    const initialGoal = getInitialGoal();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [salesGoal, setSalesGoal] = useState(initialGoal); 
    const [goalInput, setGoalInput] = useState(initialGoal > 0 ? initialGoal.toString() : '');
    const [goalError, setGoalError] = useState('');
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [globalSearch, setGlobalSearch] = useState('');
    const [showDailyReport, setShowDailyReport] = useState(false);
    const [selectedReportDate, setSelectedReportDate] = useState(new Date().toISOString().split('T')[0]);
    const [inventory, setInventory] = useState([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showSuccess, setShowSuccess] = useState('');
    const [showError, setShowError] = useState('');

    const [dismissedPromotions, setDismissedPromotions] = useState(new Set());
    const [appliedPromotions, setAppliedPromotions] = useState(new Set());

    const handleApplyPromotion = async (item) => {
        try {
            // If it's a flash sale, push to backend
            if (item.type === 'flash') {
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24); // 24h from now

                await axios.post('/api/flash-deals', {
                    itemName: item.name,
                    discountPct: item.discountPct,
                    suggestion: item.suggestion,
                    expiresAt: expiresAt.toISOString()
                });
                
                alert(`⚡ Flash Deal for '${item.name}' is now LIVE on the Home page!`);
            }
            
            setAppliedPromotions(prev => new Set([...prev, item.name]));
        } catch (err) {
            console.error('Error applying promotion:', err);
            alert('Failed to apply promotion to student portal.');
        }
    };

    const [aiMessages, setAiMessages] = useState([{
        sender: 'ai',
        text: "Hello Sales Admin! I've analyzed today's data. Everything looks stable, but I recommend a small promotion for 'Snacks' to boost afternoon sales."
    }]);
    const [aiInput, setAiInput] = useState('');
    const chatContainerRef = useRef(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [aiMessages]);

    const [userFormData, setUserFormData] = useState({
        name: '',
        username: '',
        password: '',
        role: 'student'
    });
    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    const validatePassword = (pass) => {
        setPasswordRequirements({
            length: pass.length >= 8,
            uppercase: /[A-Z]/.test(pass),
            lowercase: /[a-z]/.test(pass),
            number: /[0-9]/.test(pass),
            special: /[^A-Za-z0-9]/.test(pass)
        });
    };

    useEffect(() => {
        fetchOrders();
        fetchUsers();
        fetchInventory();

        const intervalId = setInterval(() => {
            fetchOrders();
            fetchInventory();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('/api/orders/all');
            setOrders(response.data);
        } catch (err) {
            console.error('Error fetching orders:', err);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    };

    const fetchInventory = async () => {
        try {
            const response = await axios.get('/api/inventory');
            setInventory(response.data);
        } catch (err) {
            console.error('Error fetching inventory:', err);
        }
    };

    const resetForm = () => {
        setUserFormData({
            name: '',
            username: '',
            password: '',
            role: 'student'
        });
        setPasswordRequirements({
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false
        });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();

        // Password Validation
        const isPasswordValid = Object.values(passwordRequirements).every(req => req);
        if (!isPasswordValid) {
            setShowError('Invalid password! Please follow all requirements.');
            setTimeout(() => setShowError(''), 4000);
            return;
        }

        try {
            await axios.post('/api/users', userFormData);
            setShowSuccess('User registered successfully!');
            setShowUserModal(false);
            resetForm();
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            await axios.put(`/api/users/${userId}/role`, { role: newRole });
            setShowSuccess('User role updated!');
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to update role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            await axios.delete(`/api/users/${userId}`);
            setShowSuccess('User deleted successfully!');
            fetchUsers();
            setTimeout(() => setShowSuccess(''), 3000);
        } catch (err) {
            alert('Failed to delete user');
        }
    };

    const handleUpdateGoal = (e) => {
        e.preventDefault();
        const num = parseFloat(goalInput);
        if (isNaN(num) || num <= 0) {
            setGoalError('Please enter a valid target amount (e.g., 50000)');
            return;
        }
        const todayStr = new Date().toISOString().split('T')[0];
        localStorage.setItem('dailySalesGoal', JSON.stringify({ date: todayStr, goal: num }));

        setSalesGoal(num);
        setGoalError('');
        setShowSuccess('Sales target updated!');
        setTimeout(() => setShowSuccess(''), 3000);
    };

    const handleSendAiMessage = (overrideInput = null) => {
        const inputToUse = overrideInput || aiInput;
        if (!inputToUse || !inputToUse.trim()) return;

        const newMessages = [...aiMessages, { sender: 'admin', text: inputToUse }];
        setAiMessages(newMessages);

        const lowerInput = inputToUse.toLowerCase();
        let reply = "I'm not sure what you mean. Try asking about today's sales, top items, busy times, or stock levels!";

        // --- Date helpers ---
        const todayD = new Date();
        const todayStr = todayD.toISOString().split('T')[0];

        const yestD = new Date(todayD);
        yestD.setDate(yestD.getDate() - 1);
        const yestStr = yestD.toISOString().split('T')[0];

        const weekAgo = new Date(todayD);
        weekAgo.setDate(weekAgo.getDate() - 7);

        // --- Order filters ---
        const todayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === todayStr);
        const yestOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === yestStr);
        const weekOrders = orders.filter(o => new Date(o.createdAt) >= weekAgo);

        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const yestRevenue = yestOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const weekRevenue = weekOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

        // --- Data Aggregation ---
        const itemCounts = {};
        const itemRevenue = {};
        const todayItemCounts = {};
        const categoryCounts = {};
        const hourCounts = {};
        let morningSales = 0;
        let afternoonSales = 0;
        let eveningSales = 0;

        orders.forEach(order => {
            const isToday = new Date(order.createdAt).toISOString().split('T')[0] === todayStr;
            const h = new Date(order.createdAt).getHours();
            const orderTotal = order.totalAmount || 0;

            hourCounts[h] = (hourCounts[h] || 0) + 1;
            if (h < 12) morningSales += orderTotal;
            else if (h < 17) afternoonSales += orderTotal;
            else eveningSales += orderTotal;

            order.items?.forEach(item => {
                const name = item.name?.en || item.name;
                const cat = item.category || 'Meals';
                const qty = item.quantity || 1;
                const price = item.price || 0;

                itemCounts[name] = (itemCounts[name] || 0) + qty;
                itemRevenue[name] = (itemRevenue[name] || 0) + (price * qty);
                categoryCounts[cat] = (categoryCounts[cat] || 0) + qty;
                if (isToday) todayItemCounts[name] = (todayItemCounts[name] || 0) + qty;
            });
        });

        const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1] - a[1]);
        const sortedByRevenue = Object.entries(itemRevenue).sort((a, b) => b[1] - a[1]);
        const sortedTodayItems = Object.entries(todayItemCounts).sort((a, b) => b[1] - a[1]);
        const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        const sortedHours = Object.entries(hourCounts).sort((a, b) => b[1] - a[1]);

        // --- Day of Week Trend ---
        const dayOfWeekSales = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        orders.forEach(o => {
            const day = dayNames[new Date(o.createdAt).getDay()];
            dayOfWeekSales[day] += (o.totalAmount || 0);
        });
        const bestDay = Object.entries(dayOfWeekSales).sort((a, b) => b[1] - a[1])[0];

        const formatHour = (hStr) => {
            if (hStr === undefined || hStr === null) return 'N/A';
            const num = parseInt(hStr);
            const ampm = num >= 12 ? 'PM' : 'AM';
            const adjusted = num % 12 || 12;
            return `${adjusted}:00 ${ampm} – ${adjusted}:59 ${ampm}`;
        };

        const diffPct = (a, b) => b === 0 ? null : Math.round(((a - b) / b) * 100);

        const cleanInput = lowerInput.replace(/[^\w\s\u0d80-\u0dff]/gi, '');
        const matchIntent = (patterns) => patterns.some(p => new RegExp(p, 'i').test(cleanInput));

        // ─── INTENT MATCHING ──────────────────────────────────────────────────────

        // 1. Weekly Revenue Summary
        if (matchIntent(['this week', 'weekly', 'week total', 'last 7', '7 days', 'sathiya'])) {
            reply = `This week's total revenue is LKR ${weekRevenue.toLocaleString()} across ${weekOrders.length} orders. 📅`;

            // 2. Today vs Yesterday Comparison / Trend
        } else if (matchIntent(['compare', 'yesterday', 'vs yesterday', 'today vs yesterday', 'iye saha', 'iye ada', 'iye', 'trend', 'going up', 'going down', 'is it up', 'is it down', 'are sales'])) {
            const diff = todayRevenue - yestRevenue;
            const pct = diffPct(todayRevenue, yestRevenue);
            const arrow = diff >= 0 ? '📈 Up' : '📉 Down';
            const pctText = pct !== null ? ` (${Math.abs(pct)}%)` : '';
            reply = `Today: LKR ${todayRevenue.toLocaleString()} | Yesterday: LKR ${yestRevenue.toLocaleString()}. ${arrow} by LKR ${Math.abs(diff).toLocaleString()}${pctText}.`;

            // 3. Number of Orders
        } else if (matchIntent(['how many orders', 'orders today', 'order count', 'orders count', 'orders kiyada', 'ada orders', 'gaana', 'gaana kiyada', 'order gaana', 'number of orders'])) {
            reply = `You have received **${todayOrders.length}** orders today. 🛒\n(Weekly average: ~${Math.round(weekOrders.length / 7)} orders/day)`;

            // 4. Total Earnings / Revenue Today
        } else if (matchIntent(['today sales', 'today revenue', 'revenue today', 'sales today', 'today.*sales', 'today.*revenue', 'sales.*today', 'revenue.*today', 'how much.*earn', 'earn.*today', 'sales kohomada', 'ada sales', 'ada revenue', 'sales keeyada', 'ada salli', 'ada income', 'how much did we', 'total.*today', 'what.*sales'])) {
            const tip = todayRevenue < salesGoal * 0.5 && new Date().getHours() > 14
                ? '\n⚠️ Sales are below 50% of your daily goal — consider a flash promo!'
                : '';
            reply = `Today's total revenue is **LKR ${todayRevenue.toLocaleString()}** across ${todayOrders.length} orders.${tip} 💰`;

            // 4b. Sales Summary / Overview
        } else if (matchIntent(['sales summary', 'summary', 'overview', 'ada wistara', 'today summary'])) {
            const topItem = sortedTodayItems[0];
            const progress = salesGoal > 0 ? Math.round((todayRevenue / salesGoal) * 100) : 0;
            reply = `📊 **Today's Sales Summary:**\n\n` +
                    `• Total Revenue: LKR ${todayRevenue.toLocaleString()}\n` +
                    `• Orders Count: ${todayOrders.length}\n` +
                    `• Bestseller: ${topItem ? `"${topItem[0]}"` : 'None yet'}\n` +
                    `• Goal Progress: ${progress}% of LKR ${salesGoal.toLocaleString()}\n\n` +
                    `Anything else you'd like to dive into?`;

            // 5. Promotion / Slow-moving items
        } else if (matchIntent(['promote', 'promotion', 'slow moving', 'sell more of', 'aduma vikunena', 'promote karanna', 'what should i promote', 'bundle'])) {
            const worstItems = sortedItems.slice(-3).map(i => i[0]);
            const topItem = sortedItems[0]?.[0] || 'your bestseller';
            reply = worstItems.length
                ? `💡 Try bundling slow sellers like "${worstItems[0]}" or "${worstItems[1] || worstItems[0]}" with "${topItem}" to increase their visibility!`
                : 'Not enough data to suggest promotions yet.';

            // 6. Discounts
        } else if (matchIntent(['discount', 'offer', 'flash sale', 'adukaranawada', 'adukarannam'])) {
            const currentHour = new Date().getHours();
            const isQuiet = currentHour < 11 || (currentHour >= 14 && currentHour < 17);
            reply = isQuiet
                ? `✅ Yes! It's a slow hour right now. A 10–15% flash discount on drinks could boost sales quickly.`
                : `⏳ Not right now — it's peak time! Let organic demand do its work. Try discounts after 2 PM.`;

            // 7. Improvement Tips / Suggestions
        } else if (matchIntent(['improve', 'tips', 'advice', 'suggest', 'how to increase', 'salli wadi', 'sales wadi karanna', 'increase sales', 'improvement', 'recommendation'])) {
            const worstItems = sortedItems.slice(-2).map(i => i[0]).join(' and ');
            const quietestHour = sortedHours.length > 0 ? sortedHours[sortedHours.length - 1][0] : null;
            const topCat = sortedCats[0]?.[0] || 'Meals';
            reply = `Here are 3 tips:\n1️⃣ Run flash deals during your quietest hour (${formatHour(quietestHour)}).\n2️⃣ Bundle slow items like "${worstItems}" with bestsellers.\n3️⃣ Focus marketing on "${topCat}" — your top category!`;

            // 8. Least Selling Items / Low Performers
        } else if (matchIntent(['least selling', 'least popular', 'worst', 'aduma', 'lowest selling', 'not selling', 'poor performer', 'least items', 'low performers'])) {
            const leastItems = sortedItems.slice(-3).map((i, idx) => `${idx + 1}) ${i[0]} (${i[1]} sold)`).join('\n');
            reply = `Least selling items:\n${leastItems || 'No data yet.'}\n💡 Consider a bundle deal to move these!`;

            // 9. Today's Best Seller
        } else if (matchIntent(['best.*today', 'top.*today', 'most.*today', 'today.*best', 'today.*top', 'ada hondatama', 'ada.*top', 'ada wadiyenma'])) {
            const topItem = sortedTodayItems[0];
            reply = topItem
                ? `Today's top item: "${topItem[0]}" with ${topItem[1]} units sold. 🔥 Keep the stock ready!`
                : 'No sales recorded for today yet.';

            // 10. Top Selling Items (Overall, by Revenue)
        } else if (matchIntent(['performing best', 'best item', 'best items', 'top item', 'most selling', 'popular item', 'mokakda', 'hodama', 'hondama', 'wadiyenma', 'illuwm', 'top sales', 'revenue.*item', 'which item'])) {
            if (sortedByRevenue.length > 0) {
                const top3 = sortedByRevenue.slice(0, 3).map((item, idx) => {
                    const count = itemCounts[item[0]] || 0;
                    return `${idx + 1}) ${item[0]} (${count} sold, LKR ${item[1].toLocaleString()})`;
                }).join('\n');
                reply = `🏆 Top performing products:\n${top3}\nThese are your highest revenue earners!`;
            } else {
                reply = 'No item data available yet. Place some orders first!';
            }

            // 11. Sales by Category
        } else if (matchIntent(['category', 'categories', 'top category', 'type', 'varga', 'which category'])) {
            const topCat = sortedCats[0];
            const top3 = sortedCats.slice(0, 3).map(c => `${c[0]} (${c[1]})`).join(', ');
            reply = `Top categories: ${top3 || 'N/A'}. 📊 "${topCat?.[0]}" leads your menu!`;

            // 12. Time Breakdown
        } else if (matchIntent(['sales by time', 'time.*breakdown', 'time of day', 'dawasata sales', 'morning.*afternoon', 'evening.*sales'])) {
            const total = morningSales + afternoonSales + eveningSales || 1;
            const mPct = Math.round((morningSales / total) * 100);
            const aPct = Math.round((afternoonSales / total) * 100);
            const ePct = Math.round((eveningSales / total) * 100);
            reply = `Sales split:\n☀️ Morning ${mPct}%\n🌤️ Afternoon ${aPct}%\n🌙 Evening ${ePct}%`;

            // 13. Quietest / Slow Time
        } else if (matchIntent(['lowest sales', 'least busy', 'quietest', 'slow time', 'quiet hour', 'slow hours', 'adhuma sales', 'quiet time'])) {
            const lowestHour = sortedHours.length > 0 ? sortedHours[sortedHours.length - 1][0] : null;
            reply = `🕒 **Slow Hours:**\nYour quietest period is usually around **${formatHour(lowestHour)}**. 💡 This is a great time to run flash deals or "Happy Hour" promos to bring in more customers!`;

            // 14. Peak / Busiest Time
        } else if (matchIntent(['busiest', 'peak time', 'rush hour', 'busy time', 'peak ordering', 'lunch time', 'busy hours', 'wediya salli', 'busyma', 'peak hours'])) {
            const peakHour = sortedHours.length > 0 ? sortedHours[0][0] : null;
            const peakCount = sortedHours.length > 0 ? sortedHours[0][1] : 0;
            reply = `🔥 **Peak Time Insights:**\nYour busiest hour is **${formatHour(peakHour)}** with around ${peakCount} orders. \n⚡ **Tip:** Ensure extra staff are available and high-demand items are pre-prepped during this window to avoid delays!`;

            // 14b. Time Analysis Summary
        } else if (matchIntent(['time analysis', 'analysis by time', 'time report', 'hours report'])) {
            const total = morningSales + afternoonSales + eveningSales || 1;
            const mPct = Math.round((morningSales / total) * 100);
            const aPct = Math.round((afternoonSales / total) * 100);
            const ePct = Math.round((eveningSales / total) * 100);
            const peakHour = sortedHours.length > 0 ? sortedHours[0][0] : null;
            const slowHour = sortedHours.length > 0 ? sortedHours[sortedHours.length - 1][0] : null;
            
            reply = `⏰ **Complete Time Analysis:**\n\n` +
                    `• **Morning (6AM-12PM):** ${mPct}% of sales\n` +
                    `• **Afternoon (12PM-5PM):** ${aPct}% of sales\n` +
                    `• **Evening (5PM-10PM):** ${ePct}% of sales\n\n` +
                    `🚀 **Busiest Hour:** ${formatHour(peakHour)}\n` +
                    `😴 **Quietest Hour:** ${formatHour(slowHour)}`;

            // 15. Inventory / Stock Alerts
        } else if (matchIntent(['stock', 'inventory', 'low stock', 'restock', 'ingredients', 'supply', 'stok', 'stokaya'])) {
            const lowItems = inventory.filter(i => i.qty <= i.minStockThreshold);
            if (lowItems.length > 0) {
                const names = lowItems.slice(0, 3).map(i => `"${i.name}" (${i.qty} ${i.unit})`).join(', ');
                reply = `⚠️ Low stock alert! ${names}${lowItems.length > 3 ? ` and ${lowItems.length - 3} more items` : ''} need restocking soon.`;
            } else {
                reply = `✅ All inventory levels look good right now! No urgent restocking needed.`;
            }

            // 16. Customer Behavior / Top Spenders
        } else if (matchIntent(['customer', 'top customer', 'who orders', 'spender', 'frequent', 'loyal'])) {
            const customerSpend = {};
            orders.forEach(o => {
                const id = o.username || o.studentId || 'Unknown';
                customerSpend[id] = (customerSpend[id] || 0) + (o.totalAmount || 0);
            });
            const topCustomers = Object.entries(customerSpend).sort((a, b) => b[1] - a[1]).slice(0, 3);
            if (topCustomers.length > 0) {
                const list = topCustomers.map((c, i) => `${i + 1}) ${c[0]}: LKR ${c[1].toLocaleString()}`).join('\n');
                reply = `👥 Top spenders:\n${list}\nConsider a loyalty reward for them!`;
            } else {
                reply = 'No customer order data found yet.';
            }

            // 17. Trends Breakdown (Best Day, Trend)
        } else if (matchIntent(['sales trend', 'weekly trend', 'popular trends', 'best day', 'hondama dawasa', 'trend eka'])) {
            const diff = todayRevenue - yestRevenue;
            const arrow = diff >= 0 ? '📈 upwards' : '📉 slightly downwards';
            reply = `Trend Analysis:\n1️⃣ This week's trend is ${arrow} with LKR ${weekRevenue.toLocaleString()} in total sales.\n2️⃣ Highest performing day of the week is usually **${bestDay[0]}**.\n3️⃣ Top categories like "${sortedCats[0]?.[0]}" are driving the most growth!`;

        // 18. Customer Preferences
        } else if (matchIntent(['customer preferences', 'what do they like', 'preferences', 'most liked', 'popular meal', 'wadipurama kamathi'])) {
            const topItem = sortedItems[0];
            reply = topItem 
                ? `Customer Insights: Customers definitely prefer **"${topItem[0]}"** over everything else, with ${topItem[1]} total orders! 🌟`
                : 'I need more order data to determine customer preferences.';

        // 19. General Revenue / Sales (catch-all)
        } else if (matchIntent(['revenue', 'sales', 'income', 'total', 'earnings', 'how.*doing', 'performance', 'keeyada', 'salli', 'sales today', 'revenue today', 'orders today'])) {
            const diff = todayRevenue - yestRevenue;
            const arrow = diff >= 0 ? '📈' : '📉';
            const progressText = salesGoal > 0 ? ` We are at ${Math.round((todayRevenue / salesGoal) * 100)}% of our goal!` : '';
            reply = `Today's Pulse: ${arrow} LKR ${todayRevenue.toLocaleString()} Revenue | 🛒 ${todayOrders.length} Orders.${progressText}`;
        }

        setTimeout(() => {
            setAiMessages(prev => [...prev, { sender: 'ai', text: reply }]);
        }, 500);

        setAiInput('');
    };

    const handleDownloadReport = () => {
        const dayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === selectedReportDate);
        if (dayOrders.length === 0) {
            alert('No data to download for this date.');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,";
        
        // CSV Header for Summary
        csvContent += "Report Date,Total Revenue(LKR),Total Orders\n";
        
        const dayRevenue = dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        csvContent += `${selectedReportDate},${dayRevenue},${dayOrders.length}\n\n`;

        // Itemized breakdown
        csvContent += "Item Name,Quantity Sold,Total Value(LKR)\n";
        const dayItemCounts = {};
        dayOrders.forEach(o => o.items?.forEach(i => {
            const name = i.name?.en || i.name;
            const priceStr = String(i.price || 0).replace(/,/g, '');
            const price = parseFloat(priceStr);
            const qty = i.quantity || 1;
            
            if (!dayItemCounts[name]) {
                dayItemCounts[name] = { qty: 0, revenue: 0 };
            }
            dayItemCounts[name].qty += qty;
            dayItemCounts[name].revenue += price * qty;
        }));

        const sortedItems = Object.entries(dayItemCounts).sort((a, b) => b[1].qty - a[1].qty);
        sortedItems.forEach(([name, data]) => {
            // escape quotes in name just in case
            const safeName = `"${name.replace(/"/g, '""')}"`;
            csvContent += `${safeName},${data.qty},${data.revenue}\n`;
        });

        // Create link and download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Sales_Report_${selectedReportDate}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadPDF = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const dateStr = new Date(selectedReportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        const dayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === selectedReportDate);
        const dayRevenue = dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

        // Header
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59);
        doc.text("UniCafe Daily Sales Report", 14, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 116, 139);
        doc.text(`Date: ${dateStr}`, 14, 32);

        // Summary Cards (Simulator)
        doc.setDrawColor(241, 245, 249);
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(14, 40, 182, 30, 3, 3, 'FD');
        
        doc.setFontSize(10);
        doc.setTextColor(148, 163, 184);
        doc.text("TOTAL REVENUE", 20, 50);
        doc.text("TOTAL ORDERS", 80, 50);
        doc.text("AVG. ORDER VALUE", 140, 50);

        doc.setFontSize(14);
        doc.setTextColor(15, 23, 42);
        doc.text(`LKR ${dayRevenue.toLocaleString()}`, 20, 60);
        doc.text(`${dayOrders.length}`, 80, 60);
        const avg = dayOrders.length > 0 ? Math.round(dayRevenue / dayOrders.length) : 0;
        doc.text(`LKR ${avg.toLocaleString()}`, 140, 60);

        // Itemized Table
        const dayItemCounts = {};
        dayOrders.forEach(o => o.items?.forEach(i => {
            const name = i.name?.en || i.name;
            const price = parseFloat(String(i.price || 0).replace(/,/g, ''));
            const qty = i.quantity || 1;
            if (!dayItemCounts[name]) dayItemCounts[name] = { qty: 0, revenue: 0 };
            dayItemCounts[name].qty += qty;
            dayItemCounts[name].revenue += price * qty;
        }));

        const tableData = Object.entries(dayItemCounts)
            .sort((a, b) => b[1].qty - a[1].qty)
            .map(([name, data]) => [name, data.qty, `LKR ${data.revenue.toLocaleString()}`]);

        doc.autoTable({
            startY: 80,
            head: [['Item Name', 'Quantity Sold', 'Total Revenue']],
            body: tableData,
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 80 }
        });

        doc.save(`UniCafe_Sales_Report_${selectedReportDate}.pdf`);
    };

    const renderDashboardOverview = () => {
        const todayStr = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === todayStr);
        const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        const progressPercent = salesGoal > 0 ? Math.min(Math.round((todayRevenue / salesGoal) * 100), 100) : 0;
        const remainingToGoal = Math.max(salesGoal - todayRevenue, 0);

        // Calculate Real-time Peak Hour Today
        const hourCounts = {};
        todayOrders.forEach(o => {
            const h = new Date(o.createdAt).getHours();
            hourCounts[h] = (hourCounts[h] || 0) + 1;
        });
        const peakHourEntry = Object.entries(hourCounts).sort((a,b) => b[1] - a[1])[0];
        let peakHourText = 'N/A';
        if (peakHourEntry) {
             const h = parseInt(peakHourEntry[0]);
             const ampm = h >= 12 ? 'PM' : 'AM';
             const adjusted = h % 12 || 12;
             peakHourText = `${adjusted}:00 ${ampm}`;
        }

        // Calculate Real-time Hot Seller Today
        const todayItemCounts = {};
        todayOrders.forEach(o => {
            o.items?.forEach(item => {
                const name = item.name?.en || item.name;
                const qty = item.quantity || 1;
                todayItemCounts[name] = (todayItemCounts[name] || 0) + qty;
            });
        });
        const hotSellerEntry = Object.entries(todayItemCounts).sort((a,b) => b[1] - a[1])[0];
        const hotSellerName = hotSellerEntry ? hotSellerEntry[0] : 'N/A';

        // Calculate Real-time AI Prediction
        const currentHour = new Date().getHours();
        const yestD = new Date();
        yestD.setDate(yestD.getDate() - 1);
        const yestStr = yestD.toISOString().split('T')[0];
        const yestOrdersUpToNow = orders.filter(o => {
            const d = new Date(o.createdAt);
            return d.toISOString().split('T')[0] === yestStr && d.getHours() <= currentHour;
        });
        const yestRevenueUpToNow = yestOrdersUpToNow.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        
        let aiPrediction = "Stable Growth";
        if (todayRevenue === 0 && todayOrders.length === 0) {
            aiPrediction = "Awaiting Data";
        } else if (todayRevenue > yestRevenueUpToNow * 1.2) {
            aiPrediction = "High Growth 🚀";
        } else if (yestRevenueUpToNow > 0 && todayRevenue < yestRevenueUpToNow * 0.8) {
            aiPrediction = "Slowing Down 📉";
        } else if (todayRevenue > yestRevenueUpToNow) {
            aiPrediction = "Growing 📈";
        } else if (todayRevenue < yestRevenueUpToNow) {
            aiPrediction = "Slightly Down 📉";
        } else {
            aiPrediction = "Stable Growth 📊";
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.2fr', gap: '30px' }}>
                    {/* Goal Performance Card */}
                    <div className="glass" style={{
                        padding: '40px',
                        background: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <div style={{ marginBottom: '30px', flex: 1 }}>
                                    <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '5px' }}>Daily Sales Performance</h2>
                                    <p style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                                        {salesGoal > 0 ? `Tracking your LKR ${salesGoal.toLocaleString()} target` : 'Set your daily revenue target below to start tracking'}
                                    </p>
                                </div>
                                <div style={{ width: '60px', height: '60px', borderRadius: '18px', background: 'rgba(255,184,0,0.2)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Award size={32} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '40px', marginBottom: '30px' }}>
                                <div style={{ position: 'relative', width: '150px', height: '150px' }}>
                                    <svg width="150" height="150" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                                        <circle cx="50" cy="50" r="45" fill="none" stroke="#FFB800" strokeWidth="10"
                                            strokeDasharray={`${progressPercent * 2.82} 282`}
                                            transform="rotate(-90 50 50)"
                                            strokeLinecap="round"
                                            style={{ transition: 'stroke-dasharray 1s ease-out' }}
                                        />
                                        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="18" fontWeight="800">{progressPercent}%</text>
                                    </svg>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', marginBottom: '5px' }}>Current Revenue</div>
                                        <div style={{ fontSize: '2.5rem', fontWeight: 900 }}>LKR {todayRevenue.toLocaleString()}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '20px' }}>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Orders</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{todayOrders.length}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Gap to Goal</div>
                                            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: salesGoal === 0 ? '#94a3b8' : remainingToGoal === 0 ? '#10b981' : '#f87171' }}>
                                                {salesGoal === 0 ? 'Not Set' : remainingToGoal === 0 ? 'Goal Met!' : `LKR ${remainingToGoal.toLocaleString()}`}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Background Decor */}
                        <div style={{ position: 'absolute', bottom: '-20px', right: '-20px', color: 'rgba(255,184,0,0.05)' }}>
                            <TrendingUp size={200} />
                        </div>
                    </div>

                    {/* Goal Settings Form */}
                    <div className="glass" style={{ padding: '30px', background: 'var(--latte-card)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Target size={20} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Goal Settings</h3>
                        </div>

                        <form onSubmit={handleUpdateGoal} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>DAILY REVENUE TARGET (LKR)</label>
                                <input
                                    type="text"
                                    value={goalInput}
                                    onChange={(e) => setGoalInput(e.target.value)}
                                    placeholder="Enter target amount..."
                                    style={{
                                        width: '100%',
                                        padding: '16px',
                                        borderRadius: '16px',
                                        border: goalError ? '2px solid #ef4444' : '1px solid #e2e8f0',
                                        fontSize: '1.1rem',
                                        fontWeight: 800,
                                        outline: 'none',
                                        background: '#f8fafc'
                                    }}
                                />
                                {goalError && <p style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, marginTop: '8px' }}>{goalError}</p>}
                            </div>

                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                Set a realistic goal for your canteen to help the AI better analyze peak hour spikes and inventory needs.
                            </p>

                            <div style={{ marginTop: 'auto', display: 'flex', gap: '15px' }}>
                                <button type="submit" className="btn-premium" style={{ flex: 1, padding: '16px' }}>
                                    Save Target Parameters
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setSalesGoal(0);
                                        setGoalInput('');
                                        localStorage.removeItem('dailySalesGoal');
                                        setShowSuccess('Sales target reset!');
                                        setTimeout(() => setShowSuccess(''), 3000);
                                    }}
                                    style={{
                                        padding: '16px 24px',
                                        borderRadius: '16px',
                                        border: '2px solid #e2e8f0',
                                        background: 'transparent',
                                        color: '#64748b',
                                        fontSize: '1rem',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.borderColor = '#ef4444';
                                        e.currentTarget.style.color = '#ef4444';
                                        e.currentTarget.style.background = '#fef2f2';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.borderColor = '#e2e8f0';
                                        e.currentTarget.style.color = '#64748b';
                                        e.currentTarget.style.background = 'transparent';
                                    }}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Dashboard Quick Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                    <div className="glass" style={{ padding: '25px', background: 'var(--latte-card)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>PEAK HOUR TODAY</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{peakHourText}</div>
                        </div>
                    </div>
                    <div className="glass" style={{ padding: '25px', background: 'var(--latte-card)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#fff7ed', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Flame size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>HOT SELLER</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>
                                {hotSellerName}
                            </div>
                        </div>
                    </div>
                    <div className="glass" style={{ padding: '25px', background: 'var(--latte-card)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '15px', background: '#eef2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Zap size={24} />
                        </div>
                        <div>
                            <div style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>AI PREDICTION</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 900 }}>{aiPrediction}</div>
                        </div>
                    </div>
                </div>

            </div>
        );
    };

    // --- ANALYTICS PROCESSING DATA ---
    const getAnalyticsData = () => {
        // 1. Weekly Area Chart Data (Last 7 Days)
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                name: days[d.getDay()],
                dateStr: d.toISOString().split('T')[0],
                revenue: 0,
                orderCount: 0
            };
        });

        orders.forEach(order => {
            const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
            const dayBucket = last7Days.find(d => d.dateStr === orderDate);
            if (dayBucket) {
                dayBucket.revenue += order.totalAmount || 0;
                dayBucket.orderCount += 1;
            }
        });

        // 2. Category Pie Chart Data
        const categories = { 'Meals': 0, 'Drinks': 0, 'Snacks': 0 };
        orders.forEach(order => {
            order.items?.forEach(item => {
                const category = item.category || 'Meals';
                if (categories.hasOwnProperty(category)) {
                    categories[category] += item.quantity || 1;
                } else {
                    categories['Meals'] += item.quantity || 1;
                }
            });
        });

        const totalItemsOrdered = Object.values(categories).reduce((a, b) => a + b, 0) || 1;
        const pieData = Object.entries(categories).map(([name, val]) => ({
            name,
            value: Math.round((val / totalItemsOrdered) * 100)
        }));

        // 3. Popular Items (Top 4)
        const itemCounts = {};
        orders.forEach(order => {
            order.items?.forEach(item => {
                const name = item.name?.en || item.name;
                itemCounts[name] = (itemCounts[name] || 0) + (item.quantity || 1);
            });
        });

        const totalUnits = Object.values(itemCounts).reduce((a, b) => a + b, 0) || 1;
        const popularItems = Object.entries(itemCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 4)
            .map(([name, count]) => ({
                name,
                percent: Math.round((count / totalUnits) * 100),
                color: name.toLowerCase().includes('burger') ? '#ff9f43' :
                    name.toLowerCase().includes('latte') ? '#a855f7' : '#06b6d4'
            }));

        return { last7Days, pieData, popularItems };
    };

    const analytics = getAnalyticsData();

    const renderAnalytics = () => {
        // Filter orders for the last 7 days to show "Recent" top customers
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const recentOrders = orders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);

        const topCustomers = Object.values(recentOrders.reduce((acc, order) => {
            // Check multiple potential ID fields since different order types might use different keys
            const identifier = order.studentId || order.username || order.userId || order.customerName || order._id || 'Unknown';
            
            if (!acc[identifier]) {
                const user = users.find(u => u.studentId === identifier || u._id === identifier || u.name === identifier || u.username === identifier);
                acc[identifier] = {
                    name: user?.name || (identifier !== 'Unknown' ? identifier : 'Guest Customer'),
                    studentId: user?.studentId || (identifier !== 'Unknown' && identifier.toLowerCase().startsWith('it') ? identifier : ''),
                    role: user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Customer',
                    totalSpend: 0
                };
            }
            acc[identifier].totalSpend += order.totalAmount || 0;
            return acc;
        }, {}))
            .sort((a, b) => b.totalSpend - a.totalSpend)
            .slice(0, 4);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {/* AI Assistant Insight Section */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px', marginBottom: '30px' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass"
                        style={{
                            padding: '40px',
                            background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                            borderRadius: '32px',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '30px',
                            boxShadow: '0 20px 50px rgba(139, 92, 246, 0.08)',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    width: '64px', height: '64px',
                                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                    borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 10px 20px rgba(139, 92, 246, 0.3)'
                                }}>
                                    <BarChart3 size={32} color="white" />
                                </div>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 900, color: '#1e293b' }}>UniCafé Sales AI</h3>
                                    <p style={{ margin: '5px 0 0', color: '#64748b', fontWeight: 500 }}>Intelligent revenue insights</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="date"
                                        value={selectedReportDate}
                                        onChange={(e) => {
                                            setSelectedReportDate(e.target.value);
                                            setShowDailyReport(true);
                                        }}
                                        onClick={() => setShowDailyReport(true)}
                                        style={{
                                            padding: '8px 15px',
                                            borderRadius: '12px',
                                            border: '1px solid rgba(139, 92, 246, 0.2)',
                                            background: 'var(--latte-card)',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            color: '#1e293b',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                                        }}
                                    />
                                </div>
                                <motion.span 
                                    whileHover={{ scale: 1.05, background: '#d1fae5' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowDailyReport(true)}
                                    style={{ 
                                        padding: '8px 20px', 
                                        borderRadius: '12px', 
                                        background: '#ecfdf5', 
                                        color: '#059669', 
                                        fontSize: '0.8rem', 
                                        fontWeight: 700, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: '8px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                                    AI Tracking On
                                </motion.span>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '40px', alignItems: 'center' }}>
                            {/* Chat Interface */}
                            <div style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '28px', border: '1px solid #e2e8f0', padding: '30px', height: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div
                                    ref={chatContainerRef}
                                    style={{ flex: 1, maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}
                                >
                                    {aiMessages.map((msg, idx) => (
                                        <div key={idx} style={{
                                            alignSelf: msg.sender === 'ai' ? 'flex-start' : 'flex-end',
                                            background: msg.sender === 'ai' ? '#f8fafc' : '#8b5cf6',
                                            color: msg.sender === 'ai' ? '#1e293b' : 'white',
                                            padding: '12px 18px',
                                            borderRadius: msg.sender === 'ai' ? '18px 18px 18px 0' : '18px 18px 0 18px',
                                            fontSize: '0.9rem',
                                            border: msg.sender === 'ai' ? '1px solid #f1f5f9' : 'none',
                                            boxSizing: 'border-box',
                                            maxWidth: '90%',
                                            whiteSpace: 'pre-line',
                                            lineHeight: '1.5'
                                        }}>
                                            {msg.text}
                                        </div>
                                    ))}
                                </div>
                                {/* Quick Suggestion Chips */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '5px' }}>
                                    {[
                                        { label: "Today sales?", query: "Today sales?" },
                                        { label: "Revenue today?", query: "Revenue today?" },
                                        { label: "Orders count?", query: "Orders count?" },
                                        { label: "Sales summary?", query: "Sales summary?" },
                                        { label: "Top items?", query: "Best items?" },
                                        { label: "Peak time?", query: "Peak time?" },
                                        { label: "Low stock?", query: "Stock levels?" },
                                        { label: "Improvement?", query: "Improve sales?" }
                                    ].map((btn, i) => (
                                        <motion.button
                                            key={i}
                                            whileHover={{ scale: 1.05, backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                setAiInput(btn.query);
                                                // Trigger send after state update
                                                setTimeout(() => {
                                                    handleSendAiMessage(btn.query);
                                                }, 0);
                                            }}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '10px',
                                                background: 'rgba(139, 92, 246, 0.05)',
                                                color: '#8b5cf6',
                                                border: '1px solid rgba(139, 92, 246, 0.1)',
                                                fontSize: '0.72rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {btn.label}
                                        </motion.button>
                                    ))}
                                </div>

                                <div style={{ position: 'relative' }}>
                                    <Zap size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                                    <input
                                        type="text"
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' ? handleSendAiMessage() : null}
                                        placeholder="Ask AI for revenue forecast..."
                                        style={{
                                            width: '100%',
                                            padding: '16px 60px 16px 50px',
                                            borderRadius: '20px',
                                            border: '1px solid #cbd5e1',
                                            background: 'var(--latte-card)',
                                            fontSize: '0.95rem',
                                            fontWeight: 500,
                                            outline: 'none',
                                            transition: 'all 0.3s',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                                            boxSizing: 'border-box'
                                        }}
                                    />
                                    <div
                                        onClick={() => handleSendAiMessage()}
                                        style={{
                                            position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                            width: '44px', height: '44px', borderRadius: '16px',
                                            background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px', marginBottom: '30px' }}>
                    <div className="glass" style={{ padding: '30px', background: 'var(--latte-card)', borderRadius: '24px', border: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Revenue & Orders</h4>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <span style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>Revenue</span>
                                <span style={{ padding: '6px 16px', borderRadius: '99px', border: '1px solid #06b6d4', fontSize: '0.75rem', fontWeight: 700, color: '#06b6d4' }}>Orders</span>
                            </div>
                        </div>
                        <div style={{ flex: 1, minHeight: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analytics.last7Days}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ff9f43" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#ff9f43" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorOrd" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#ff9f43" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="orderCount" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorOrd)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', background: 'var(--latte-card)', borderRadius: '24px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Sales by Category</h4>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', fontSize: '1rem', fontWeight: 800, color: '#1f2937' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}><span>60%</span><span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>Meals</span></div>
                            <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}><span>35%</span><span style={{ color: '#94a3b8', fontWeight: 600, fontSize: '0.75rem' }}>Drinks</span></div>
                        </div>
                        <div style={{ flex: 1, minHeight: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={105} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={6}>
                                        <Cell fill="#ff9f43" />
                                        <Cell fill="#06b6d4" />
                                        <Cell fill="#e2e8f0" />
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', fontSize: '0.8rem', fontWeight: 600, color: '#64748b', marginTop: '10px' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff9f43' }} /> Meals 60%</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#06b6d4' }} /> Drinks 35%</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: 10, height: 10, borderRadius: '50%', background: '#e2e8f0' }} /> Snacks 5%</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '30px' }}>
                    <div className="glass" style={{ padding: '30px', background: 'var(--latte-card)', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
                        <h4 style={{ margin: '0 0 30px', fontSize: '1.2rem', fontWeight: 800 }}>Popular Items</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            {analytics.popularItems.length === 0 ? (
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic', textAlign: 'center' }}>No sales data for items yet.</p>
                            ) : analytics.popularItems.map((item, i) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>
                                        <span>{item.name}</span>
                                        <span style={{ color: '#94a3b8' }}>{item.percent}%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                                        <div style={{ width: `${item.percent}%`, height: '100%', background: item.color, borderRadius: '99px' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass" style={{ padding: '30px', background: 'var(--latte-card)', borderRadius: '24px', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Recent Top Customers</h4>
                            <button style={{ background: 'none', border: 'none', color: '#ff9f43', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}>View All</button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {topCustomers.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontWeight: 600 }}>No order data available</div>
                            ) : topCustomers.map((user, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderRadius: '16px', border: '1px solid #f8fafc', background: '#fafafa', transition: 'all 0.2s', cursor: 'pointer' }} onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'} onMouseOut={(e) => e.currentTarget.style.background = '#fafafa'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div>
                                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8' }}>
                                                {user.studentId ? <span style={{ color: '#6366f1' }}>{user.studentId}</span> : ''}
                                                {user.studentId ? ' • ' : ''}
                                                {user.role}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                                        <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>LKR {user.totalSpend.toLocaleString()}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#ff9f43' }}>Total Value</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderUserManager = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>User Management <span style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: 500 }}>({users.length} users)</span></h3>
                <button onClick={() => setShowUserModal(true)} className="btn-premium" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px' }}>
                    <Plus size={18} /> Add New User
                </button>
            </div>

            <div style={{ padding: '32px', borderRadius: '24px', background: 'var(--latte-card)', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Student IT Number</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Role</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Registered date</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.filter(user => (user.name?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (user.username?.toLowerCase() || '').includes(globalSearch.toLowerCase()) || (user.role?.toLowerCase() || '').includes(globalSearch.toLowerCase())).map((user) => (
                                <tr key={user._id} style={{ background: '#f8fafc', borderRadius: '12px' }}>
                                    <td style={{ padding: '16px', fontWeight: 700, color: 'var(--text-main)' }}>{user.username}</td>
                                    <td style={{ padding: '16px' }}>{user.name}</td>
                                    <td style={{ padding: '16px' }}>
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                            style={{
                                                padding: '6px 12px',
                                                borderRadius: '8px',
                                                fontSize: '0.8rem',
                                                fontWeight: 700,
                                                background: user.role === 'admin' ? 'rgba(139, 92, 246, 0.1)' : (user.role === 'staff' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)'),
                                                color: user.role === 'admin' ? '#8b5cf6' : (user.role === 'staff' ? '#f59e0b' : '#3b82f6'),
                                                textTransform: 'capitalize',
                                                border: '1px solid currentColor',
                                                cursor: 'pointer',
                                                outline: 'none',
                                            }}
                                        >
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button onClick={() => handleDeleteUser(user._id)} className="glass" style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', marginLeft: 'auto' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderInvoiceHistory = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '15px', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FileText size={24} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Invoice History</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', fontWeight: 500 }}>Manage and track all generated invoices</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                        <input 
                            type="text" 
                            placeholder="Search invoices..." 
                            value={globalSearch}
                            onChange={(e) => setGlobalSearch(e.target.value)}
                            style={{
                                padding: '12px 16px 12px 45px',
                                borderRadius: '12px',
                                border: '1px solid #e2e8f0',
                                width: '300px',
                                fontSize: '0.9rem',
                                outline: 'none'
                            }}
                        />
                    </div>
                </div>
            </div>

            <div style={{ padding: '32px', borderRadius: '24px', background: 'var(--latte-card)', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                        <thead>
                            <tr style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Order ID</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Date & Time</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Customer</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Items</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Amount</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Order Status</th>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Payment Status</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders
                                .filter(order => 
                                    order._id.toLowerCase().includes(globalSearch.toLowerCase()) ||
                                    (order.username || '').toLowerCase().includes(globalSearch.toLowerCase()) ||
                                    (order.customerName || '').toLowerCase().includes(globalSearch.toLowerCase())
                                )
                                .map((order) => (
                                <tr key={order._id} style={{ background: '#f8fafc', borderRadius: '12px', transition: 'transform 0.2s' }}>
                                    <td style={{ padding: '16px', fontWeight: 800, color: '#1e293b', fontSize: '0.85rem' }}>
                                        #{order._id.slice(-8).toUpperCase()}
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b', fontSize: '0.9rem' }}>
                                        <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(order.createdAt).toLocaleTimeString()}</div>
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ fontWeight: 700, color: '#1e293b' }}>{order.username || order.customerName || 'Guest'}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{order.studentId || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '16px', color: '#64748b' }}>
                                        <span style={{ fontWeight: 700, color: '#3b82f6' }}>{order.items?.length || 0}</span> items
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 800, color: '#0f172a' }}>
                                        LKR {(order.totalAmount || 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        {(() => {
                                            const status = (order.status || 'placed').toLowerCase();
                                            let config = { label: '🟡 Placed', bg: '#fffbeb', color: '#f59e0b' };
                                            
                                            if (['preparing', 'process', 'cookd', 'ready'].includes(status)) config = { label: '🔵 Preparing', bg: '#eff6ff', color: '#3b82f6' };
                                            else if (status === 'completed' || status === 'picked-up') config = { label: '🟢 Completed', bg: '#ecfdf5', color: '#10b981' };
                                            else if (status === 'cancelled') config = { label: '🔴 Cancelled', bg: '#fef2f2', color: '#ef4444' };

                                            return (
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '8px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 800,
                                                    background: config.bg,
                                                    color: config.color,
                                                    textTransform: 'uppercase',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    {config.label}
                                                </span>
                                            );
                                        })()}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            fontSize: '0.75rem',
                                            fontWeight: 800,
                                            background: (order.status === 'completed' || order.status === 'picked-up') ? '#ecfdf5' : '#fff7ed',
                                            color: (order.status === 'completed' || order.status === 'picked-up') ? '#10b981' : '#f97316',
                                            textTransform: 'uppercase'
                                        }}>
                                            {(order.status === 'completed' || order.status === 'picked-up') ? 'Paid' : 'Pending'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <button 
                                            onClick={() => {
                                                setSelectedReportDate(new Date(order.createdAt).toISOString().split('T')[0]);
                                                setShowDailyReport(true);
                                            }}
                                            className="glass" 
                                            style={{ 
                                                padding: '8px 16px', 
                                                borderRadius: '10px', 
                                                fontSize: '0.8rem', 
                                                fontWeight: 700, 
                                                color: '#3b82f6', 
                                                border: '1px solid rgba(59, 130, 246, 0.2)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            View Report
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-page)', color: '#111827' }}>
            <SalesSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', padding: '20px' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                        >
                            {activeTab === 'dashboard' && renderDashboardOverview()}
                            {activeTab === 'analytics' && renderAnalytics()}
                            {activeTab === 'invoices' && renderInvoiceHistory()}
                            {activeTab === 'users' && renderUserManager()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            <AnimatePresence>
                {showDailyReport && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowDailyReport(false)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(8px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass"
                            style={{ width: '100%', maxWidth: '800px', background: 'white', borderRadius: '32px', position: 'relative', zIndex: 1, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
                        >
                            <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', padding: '40px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: 60, height: 60, borderRadius: '20px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <FileText size={32} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 900 }}>Daily Sales Report</h2>
                                        <p style={{ margin: '5px 0 0', opacity: 0.7, fontWeight: 500 }}>{new Date(selectedReportDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <button onClick={handleDownloadReport} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '15px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color: 'white', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                        <Download size={18} />
                                        Download CSV
                                    </button>
                                    <button onClick={() => setShowDailyReport(false)} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', width: 44, height: 44, borderRadius: '15px', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; e.currentTarget.style.transform = 'translateY(-1px)'; }} onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            <div style={{ padding: '40px' }}>
                                {(() => {
                                    const dayOrders = orders.filter(o => new Date(o.createdAt).toISOString().split('T')[0] === selectedReportDate);
                                    const dayRevenue = dayOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
                                    const avgOrderVal = dayOrders.length > 0 ? Math.round(dayRevenue / dayOrders.length) : 0;

                                    const dayItemCounts = {};
                                    dayOrders.forEach(o => o.items?.forEach(i => {
                                        const name = i.name?.en || i.name;
                                        dayItemCounts[name] = (dayItemCounts[name] || 0) + (i.quantity || 1);
                                    }));
                                    const dayTopItems = Object.entries(dayItemCounts)
                                        .sort((a, b) => b[1] - a[1])
                                        .slice(0, 3)
                                        .map(([name, sales]) => ({ name, sales, revenue: orders.find(o => o.items.some(k => (k.name?.en || k.name) === name))?.items.find(k => (k.name?.en || k.name) === name)?.price * sales || 0 }));

                                    return (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' }}>
                                                <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Revenue</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LKR {dayRevenue.toLocaleString()}</div>
                                                </div>
                                                <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Total Orders</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{dayOrders.length}</div>
                                                </div>
                                                <div style={{ padding: '25px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Avg. Order</div>
                                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>LKR {avgOrderVal.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '20px' }}>Top Selling Items Today</h4>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                                {dayTopItems.length === 0 ? (
                                                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '10px' }}>No sales recorded for this date.</p>
                                                ) : dayTopItems.map((item, i) => (
                                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 25px', borderRadius: '18px', background: '#ffffff', border: '1px solid #f1f5f9' }}>
                                                        <span style={{ fontWeight: 700, color: '#1e293b' }}>{item.name}</span>
                                                        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                                                            <span style={{ color: '#94a3b8', fontSize: '0.9rem', fontWeight: 600 }}>{item.sales} sold</span>
                                                            <span style={{ fontWeight: 800, color: '#10b981' }}>LKR {item.revenue.toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}

                                <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
                                    <button onClick={handleDownloadPDF} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#ff9f43', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        <Download size={18} /> Download Detailed PDF
                                    </button>
                                    <button onClick={() => setShowDailyReport(false)} style={{ flex: 1, padding: '16px', borderRadius: '16px', background: '#f1f5f9', color: '#64748b', border: 'none', fontWeight: 800, cursor: 'pointer' }}>
                                        Dismiss Report
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showUserModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowUserModal(false); resetForm(); }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 1001 }} />
                        <div style={{ position: 'fixed', top: 0, left: '280px', right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1002, pointerEvents: 'none', padding: '20px' }}>
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} style={{ pointerEvents: 'auto', width: '100%', maxWidth: '500px', background: 'white', borderRadius: '24px', padding: '2.5rem', zIndex: 1002, border: '1px solid #f1f5f9', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>Add New User</h2>
                                    <X onClick={() => { setShowUserModal(false); resetForm(); }} style={{ cursor: 'pointer', color: 'var(--text-main)' }} />
                                </div>
                                <form onSubmit={handleAddUser}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                                        <input required value={userFormData.name} onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="e.g. John Doe" />
                                    </div>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Student/Staff ID (Username)</label>
                                        <input required value={userFormData.username} onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="e.g. IT2100000" />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                                            <input required type="password" value={userFormData.password} onChange={(e) => { setUserFormData({ ...userFormData, password: e.target.value }); validatePassword(e.target.value); }} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }} placeholder="********" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
                                            <select value={userFormData.role} onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'white', border: '1px solid var(--glass-border)', color: 'var(--text-main)' }}>
                                                <option value="student">Student</option>
                                                <option value="staff">Staff</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '12px',
                                        marginBottom: '1.5rem',
                                        fontSize: '0.75rem',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <p style={{ fontWeight: 700, margin: '0 0 0.5rem 0', color: 'var(--text-secondary)' }}>Password Requirements:</p>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                            {[
                                                { key: 'length', text: '8+ Characters' },
                                                { key: 'uppercase', text: 'Uppercase Letter' },
                                                { key: 'lowercase', text: 'Lowercase Letter' },
                                                { key: 'number', text: 'At least one Number' },
                                                { key: 'special', text: 'Special Character' }
                                            ].map(req => (
                                                <div key={req.key} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    color: passwordRequirements[req.key] ? '#10b981' : '#fca5a5',
                                                    fontWeight: passwordRequirements[req.key] ? 700 : 500,
                                                    transition: 'all 0.3s ease'
                                                }}>
                                                    <div style={{
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                        background: passwordRequirements[req.key] ? '#10b981' : '#fca5a5'
                                                    }} />
                                                    {req.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-premium" style={{ width: '100%', padding: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                                        <Save size={20} /> Create User
                                    </button>
                                </form>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>

            {showSuccess && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#10b981', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)' }}
                >
                    {showSuccess}
                </motion.div>
            )}

            {showError && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ position: 'fixed', bottom: '40px', right: '40px', background: '#ef4444', padding: '16px 25px', borderRadius: '16px', color: 'white', fontWeight: 700, zIndex: 3000, boxShadow: '0 10px 30px rgba(239, 68, 68, 0.3)' }}
                >
                    {showError}
                </motion.div>
            )}
        </div>
    );
};

export default SalesManagement;
