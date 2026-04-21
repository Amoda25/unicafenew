const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const TEST_USER = 'IT123456'; // Assuming this user exists or will be created

async function testNotifications() {
    try {
        console.log('--- Testing Notification System ---');

        // 1. Fetch unread count for user
        const countRes = await axios.get(`${API_URL}/notifications/${TEST_USER}/unread-count`);
        console.log('Initial unread count:', countRes.data.count);

        // 2. We need an order ID to test the status update trigger
        // Let's fetch all orders and pick one for TEST_USER
        const ordersRes = await axios.get(`${API_URL}/orders/all`);
        const userOrder = ordersRes.data.find(o => o.username === TEST_USER);

        if (userOrder) {
            console.log('Found order for user:', userOrder._id);
            
            // 3. Update order status to 'picup'
            console.log('Updating order status to picup...');
            await axios.put(`${API_URL}/orders/${userOrder._id}/status`, { status: 'picup' });

            // 4. Check unread count again
            const countAfterRes = await axios.get(`${API_URL}/notifications/${TEST_USER}/unread-count`);
            console.log('Unread count after update:', countAfterRes.data.count);

            // 5. Fetch notifications
            const notificationsRes = await axios.get(`${API_URL}/notifications/${TEST_USER}`);
            console.log('Latest notification:', notificationsRes.data[0]);

            // 6. Mark as read
            const notifId = notificationsRes.data[0]._id;
            console.log('Marking notification as read:', notifId);
            await axios.put(`${API_URL}/notifications/${notifId}/read`);

            // 7. Check count again
            const finalCountRes = await axios.get(`${API_URL}/notifications/${TEST_USER}/unread-count`);
            console.log('Final unread count:', finalCountRes.data.count);
        } else {
            console.log('No order found for user', TEST_USER, '. Please place an order first.');
        }

    } catch (err) {
        console.error('Test failed:', err.response ? err.response.data : err.message);
    }
}

testNotifications();
