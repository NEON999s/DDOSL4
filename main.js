const { execSync } = require('child_process');

// ฟังก์ชันตรวจสอบและติดตั้งโมดูล
function ensureModule(module) {
    try {
        require.resolve(module);
    } catch (e) {
        console.log(`กำลังติดตั้งโมดูล: ${module} ...`);
        execSync(`npm install ${module}`, { stdio: 'inherit' });
    }
}

// ตรวจสอบและติดตั้งโมดูลที่จำเป็น
ensureModule('axios');

const axios = require('axios');

// ฟังก์ชันสำหรับส่งคำขอเทรด
async function sendTradeRequest(ip, port, tradeId) {
    const url = `http://${ip}:${port}/trade`; // เปลี่ยน URL ตามที่คุณต้องการ
    const tradeData = {
        id: tradeId,
        amount: 1000, // ตัวอย่างจำนวนเงินที่ต้องการเทรด
    };

    try {
        const response = await axios.post(url, tradeData);
        console.log(`Trade ${tradeId} ส่งสำเร็จ:`, response.data);
    } catch (error) {
        console.error(`Trade ${tradeId} ส่งไม่สำเร็จ:`, error.message);
    }
}

// ฟังก์ชันสำหรับส่งเทรด 500,000 ครั้ง
async function sendBulkTrades(ip, port, totalTrades) {
    const promises = [];

    for (let i = 1; i <= totalTrades; i++) {
        promises.push(sendTradeRequest(ip, port, i));
    }

    // รอให้ทุกคำขอส่งเสร็จ
    await Promise.all(promises);
    console.log(`ส่ง ${totalTrades} เทรดเสร็จสิ้น`);
}

// รับ IP และ PORT จากคำสั่ง
const args = process.argv.slice(2);
if (args.length !== 2) {
    console.error('โปรดระบุ IP และ PORT เช่น: node main.js <IP> <PORT>');
    process.exit(1);
}

const ip = args[0];
const port = args[1];
const totalTrades = 500000; // จำนวนเทรดที่ต้องการส่ง

// เริ่มต้นส่งเทรด
sendBulkTrades(ip, port, totalTrades);
