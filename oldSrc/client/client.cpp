/**
 * client.cpp
 * Jonathan Stoeber
 *
 * Connects to server and sends hostname
 *
 */
#define WIN32_LEAN_AND_MEAN

#include <windows.h>
#include <winsock2.h>
#include <ws2tcpip.h>
#include <stdlib.h>
#include <stdio.h>
#include <WinCrypt.h>
#include <sstream>
#include "md5.h"

// Need to link with Ws2_32.lib, Mswsock.lib, and Advapi32.lib
#pragma comment (lib, "Ws2_32.lib")
#pragma comment (lib, "Mswsock.lib")
#pragma comment (lib, "AdvApi32.lib")

using namespace std;

#define DEFAULT_BUFLEN 512
#define DEFAULT_PORT "3490"

int WINAPI wWinMain(HINSTANCE hInstance, HINSTANCE hPrevInstance, PWSTR pCmdLine, int nCmdShow)
{
    WSADATA wsaData;
    SOCKET ConnectSocket = INVALID_SOCKET;
    struct addrinfo *result = NULL,
                    *ptr = NULL,
                    hints;
	char sendbuf[DEFAULT_BUFLEN];
    int iResult;

	// session key data
	HCRYPTPROV hCryptCtx = NULL;
	unsigned char rand_serv[64];
	unsigned char rand_data[32];
	unsigned char concat_data[128];
	stringstream ss, session_key;
	string reply;

    // Initialize Winsock
    iResult = WSAStartup(MAKEWORD(2,2), &wsaData);
    if(iResult != 0)
	{
        printf("WSAStartup failed with error: %d\n", iResult);
        return 1;
    }

    ZeroMemory(&hints, sizeof(hints));
    hints.ai_family = AF_UNSPEC;
    hints.ai_socktype = SOCK_STREAM;
    hints.ai_protocol = IPPROTO_TCP;

    // Resolve the server address and port
    iResult = getaddrinfo("lakesidelibrary.tcnj.edu", DEFAULT_PORT, &hints, &result);
    if(iResult != 0)
	{
        printf("getaddrinfo failed with error: %d\n", iResult);
        WSACleanup();
        return 1;
    }

    // Attempt to connect to an address until one succeeds
    for(ptr = result; ptr != NULL; ptr = ptr->ai_next)
	{
        // Create a SOCKET for connecting to server
        ConnectSocket = socket(ptr->ai_family, ptr->ai_socktype, ptr->ai_protocol);
        if(ConnectSocket == INVALID_SOCKET)
		{
            printf("socket failed with error: %ld\n", WSAGetLastError());
            WSACleanup();
            return 1;
        }

        // Connect to server.
        iResult = connect(ConnectSocket, ptr->ai_addr, (int)ptr->ai_addrlen);
        if(iResult == SOCKET_ERROR)
		{
            closesocket(ConnectSocket);
            ConnectSocket = INVALID_SOCKET;
            continue;
        }
        break;
    }

    freeaddrinfo(result);

    if(ConnectSocket == INVALID_SOCKET)
	{
        printf("Unable to connect to server!\n");
        WSACleanup();
        return 1;
    }

	// added for security
	// generate session key
	// generate random data
	CryptAcquireContext(&hCryptCtx, NULL, MS_DEF_PROV, PROV_RSA_FULL, CRYPT_VERIFYCONTEXT);
	CryptGenRandom(hCryptCtx, 32, rand_data);
	CryptReleaseContext(hCryptCtx, 0);
	rand_data[31] = '\0';
	send(ConnectSocket, (char*)rand_data, strlen((char*)rand_data), 0);
	printf("client: sent rand data\n");

	// read data from server
	recv(ConnectSocket, (char*)rand_serv, 64, 0);

	// concat data with password
	concat_data[0] = '\0';
	strcat((char*)concat_data, "tcnjlibraryapp");
	strcat((char*)concat_data, (char*)rand_data);
	strcat((char*)concat_data, (char*)rand_serv);
	
	ss << concat_data;
	session_key << md5(ss.str());

	cout << session_key.str() << endl;

	// send key to server
	send(ConnectSocket, session_key.str().c_str(), strlen(session_key.str().c_str())+1, 0);

	// wait for reply
	rand_serv[0] = '\0';
	memset(rand_serv, '\0', 64);
	recv(ConnectSocket, (char*)rand_serv, 64, 0);
	ss.str("");
	ss << rand_serv;
	reply = ss.str();
	cout << "reply was: " << reply << endl;
	if(reply.compare("ERR") == 0)
	{
		cout << "error detected" << endl;
		closesocket(ConnectSocket);
		WSACleanup();

		// restart client
		STARTUPINFO si;
		PROCESS_INFORMATION pi;
		ZeroMemory( &si, sizeof(si) );
		si.cb = sizeof(si);
		ZeroMemory( &pi, sizeof(pi) );

		CreateProcess(
			NULL,		// No module name (use command line)
			"client.exe",	// Command line
			NULL,		// Process handle not inheritable
			NULL,		// Thread handle not inheritable
			FALSE,		// Set handle inheritance to FALSE
			0,			// No creation flags
			NULL,		// Use parent's environment block
			NULL,		// Use parent's starting directory 
			&si,		// Pointer to STARTUPINFO structure
			&pi			// Pointer to PROCESS_INFORMATION structure
		);
		CloseHandle(pi.hProcess);
		CloseHandle(pi.hThread);
		return 1;
	}
	// end security code

	// get the host name
	gethostname(sendbuf, DEFAULT_BUFLEN);
	printf("%s\n", sendbuf);
    // Send an initial buffer
    iResult = send(ConnectSocket, sendbuf, (int)strlen(sendbuf), 0);
    if (iResult == SOCKET_ERROR) {
        printf("send failed with error: %d\n", WSAGetLastError());
        closesocket(ConnectSocket);
        WSACleanup();
        return 1;
    }
	
    // shutdown the connection since no more data will be sent
    iResult = shutdown(ConnectSocket, SD_SEND);
    if (iResult == SOCKET_ERROR) {
        printf("shutdown failed with error: %d\n", WSAGetLastError());
        closesocket(ConnectSocket);
        WSACleanup();
        return 1;
    }

    // cleanup
    closesocket(ConnectSocket);
    WSACleanup();

    return 0;
}