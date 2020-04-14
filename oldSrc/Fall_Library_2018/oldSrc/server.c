/**
 * server.c
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <arpa/inet.h>
#include <sys/wait.h>
#include <signal.h>
#include <openssl/md5.h>

#define PORT "3490"  // the port users will be connecting to

#define BACKLOG 10	 // how many pending connections queue will hold

void csprng(char buf[], int buflen)
{
    FILE *f; 
    f = fopen("/dev/urandom", "r");
    fread(buf, 1, buflen, f); 
    return;
}

void sigchld_handler(int s)
{
	while(waitpid(-1, NULL, WNOHANG) > 0);
}

// get sockaddr, IPv4 or IPv6:
void *get_in_addr(struct sockaddr *sa)
{
	if(sa->sa_family == AF_INET)
		return &(((struct sockaddr_in*)sa)->sin_addr);
	return &(((struct sockaddr_in6*)sa)->sin6_addr);
}

int main(void)
{
	int sockfd, new_fd;  // listen on sock_fd, new connection on new_fd
	struct addrinfo hints, *servinfo, *p;
	struct sockaddr_storage their_addr; // connector's address information
	socklen_t sin_size;
	struct sigaction sa;
	int yes=1;
	char s[INET6_ADDRSTRLEN];
	int rv;

	memset(&hints, 0, sizeof hints);
	hints.ai_family = AF_UNSPEC;
	hints.ai_socktype = SOCK_STREAM;
	hints.ai_flags = AI_PASSIVE; // use my IP

	if((rv = getaddrinfo(NULL, PORT, &hints, &servinfo)) != 0)
	{
		fprintf(stderr, "getaddrinfo: %s\n", gai_strerror(rv));
		return 1;
	}

	// loop through all the results and bind to the first we can
	for(p = servinfo; p != NULL; p = p->ai_next)
	{
		if((sockfd = socket(p->ai_family, p->ai_socktype, p->ai_protocol)) == -1)
		{
			perror("server: socket");
			continue;
		}

		if(setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &yes, sizeof(int)) == -1)
		{
			perror("server: setsockopt");
			exit(1);
		}

		if(bind(sockfd, p->ai_addr, p->ai_addrlen) == -1)
		{
			close(sockfd);
			perror("server: bind");
			continue;
		}

		break;
	}

	if(p == NULL)
	{
		fprintf(stderr, "server: failed to bind\n");
		return 2;
	}

	freeaddrinfo(servinfo); // all done with this structure

	if(listen(sockfd, BACKLOG) == -1)
	{
		perror("listen");
		exit(1);
	}

	sa.sa_handler = sigchld_handler; // reap all dead processes
	sigemptyset(&sa.sa_mask);
	sa.sa_flags = SA_RESTART;
	if(sigaction(SIGCHLD, &sa, NULL) == -1)
	{
		perror("sigaction");
		exit(1);
	}

	printf("server: waiting for connections...\n");

	while(1)
	{  // main accept() loop
		sin_size = sizeof their_addr;
		new_fd = accept(sockfd, (struct sockaddr *)&their_addr, &sin_size);
		if(new_fd == -1)
		{
			perror("accept");
			continue;
		}

		inet_ntop(their_addr.ss_family, get_in_addr((struct sockaddr *)&their_addr), s, sizeof s);
		printf("server: got connection from %s\n", s);

		
		if(!fork())
		{ // this is the child process
			close(sockfd); // child doesn't need the listener

			// generate session key
			// buffer for random client data
			unsigned char rand_cli[64];
			if(recv(new_fd, rand_cli, 64, 0) == -1)
				perror("recv");
			printf("server: got random data\n");

			// generate random data to send
			unsigned char rand_serv[32];
			csprng(rand_serv, 32);
			rand_serv[31] = '\0';
			send(new_fd, rand_serv, 32, 0);
			printf("server: sent random data\n");

			// concat data with password
			unsigned char concat_data[128];
			concat_data[0] = '\0';
			strcat(concat_data, "tcnjlibraryapp");
			strcat(concat_data, rand_cli);
			strcat(concat_data, rand_serv);

			// generate hash
			unsigned char hash[MD5_DIGEST_LENGTH];
			MD5(concat_data, strlen(concat_data), hash);

			// convert hash to hex string
			unsigned char session_key[40];
			session_key[0] = '\0';
			unsigned char temp[10];
			temp[0] = '\0';
			int i;
			for(i = 0; i < MD5_DIGEST_LENGTH; i++)
			{
				sprintf(temp, "%02x", hash[i]);
				strcat(session_key, temp);
			}
			session_key[32] = '\0';
			printf("server: session key: %s\n", session_key);
			printf("server: key length %d\n", strlen(session_key));

			// get key from client
			unsigned char session_key_client[40];
			if(recv(new_fd, session_key_client, 40, 0)  == -1)
				perror("server: recv");
			session_key_client[strlen(session_key)] = '\0';
			printf("server: client key: %s\n", session_key_client);

			// compare keys
			if(strcmp(session_key, session_key_client) == 0)
			{
				printf("server: keys match\n");
				// tell client to send data
				send(new_fd, "OK", strlen("OK"), 0);
				// get hostname of client
				char client_hostname[256];
				if(recv(new_fd, client_hostname, 256, 0) == -1)
					perror("server: recv");

				printf("server: client = %s\n", client_hostname);
				close(new_fd);
				execlp("/home/acct4/stoebej1/research/src/update.php", "update.php", client_hostname, (char *) 0);
				exit(0);
			}
			else
			{
				printf("server: no match\n");
				send(new_fd, "ERR", strlen("ERR"), 0);
			}

			close(new_fd);
			exit(0);
		}

		close(new_fd);  // parent doesn't need this
	}

	return 0;
}
