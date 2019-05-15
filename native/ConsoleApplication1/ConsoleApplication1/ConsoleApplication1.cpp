// ConsoleApplication1.cpp : 此文件包含 "main" 函数。程序执行将在此处开始并结束。
//

#include <iostream>
#include <windows.h>
#include <ctime>
#include <ratio>
#include <chrono>

using namespace std;
using namespace std::chrono;

int SX = 1600, SY = 900;

BYTE* arr = (BYTE*)malloc(4 * SX * SY);

BYTE* ScreenData = 0;
int ScreenX = SX;
int ScreenY = SY;


void screenshot(POINT a, POINT b)
{

	// copy screen to bitmap
	HDC     hScreen = GetDC(NULL);
	HDC     hDC = CreateCompatibleDC(hScreen);
	HBITMAP hBitmap = CreateCompatibleBitmap(hScreen, abs(b.x - a.x), abs(b.y - a.y));
	HGDIOBJ old_obj = SelectObject(hDC, hBitmap);
	BOOL    bRet = BitBlt(hDC, 0, 0, abs(b.x - a.x), abs(b.y - a.y), hScreen, a.x, a.y, SRCCOPY);
	// get hbitmap pixel data
	ScreenX = GetDeviceCaps(hScreen, HORZRES);
	ScreenY = GetDeviceCaps(hScreen, VERTRES);
	
	BITMAPINFOHEADER bmi = { 0 };
	bmi.biSize = sizeof(BITMAPINFOHEADER);
	bmi.biPlanes = 1;
	bmi.biBitCount = 32;
	bmi.biWidth = ScreenX;
	bmi.biHeight = -ScreenY;
	bmi.biCompression = BI_RGB;
	bmi.biSizeImage = 0;
	bmi.biXPelsPerMeter = 0;
	bmi.biYPelsPerMeter = 0;
	bmi.biClrUsed = 0;
	bmi.biClrImportant = 0;
	
	ScreenData = (BYTE*)malloc(4 * ScreenX * ScreenY);
	// data include rgba stored in ScreenData
	GetDIBits(hDC, hBitmap, 0, ScreenY, ScreenData, (BITMAPINFO*)& bmi, DIB_RGB_COLORS);


	//for (int i = 0; i < ScreenX * ScreenY * 4; i++) {
		//arr[i] = ScreenData[i];
			//std::cout << (unsigned int)ScreenData[0] << std::endl;
			//std::cout << (unsigned int)ScreenData[1] << std::endl;
			//std::cout << (unsigned int)ScreenData[2] << std::endl;
			//std::cout << (unsigned int)ScreenData[3] << std::endl;

			//DWORD pixel = GetPixel(hDC, i, j);
			//unsigned int r = GetRValue(pixel);
			//unsigned int g = GetGValue(pixel);
			//unsigned int b1 = GetBValue(pixel);
			//std::cout << "red: " << r << std::endl;
			//std::cout << "green: " << g << std::endl;
			//std::cout << "blue: " << b1 << std::endl;
		//}
	//}

	// save bitmap to clipboard
	//OpenClipboard(NULL); 
	//EmptyClipboard();
	//SetClipboardData(CF_BITMAP, hBitmap);
	//CloseClipboard();

	// clean up
	SelectObject(hDC, old_obj);
	DeleteDC(hDC);
	ReleaseDC(NULL, hScreen);
	DeleteObject(hBitmap);
}

int main()
{
	POINT a, b;
	a.x = 0;
	a.y = 0;
	
	b.x = SX;
	b.y = SY;

	//int(*a)[1080] = new int[1920][1080];
	high_resolution_clock::time_point t1 = high_resolution_clock::now();
	//for (int i = 0; i < 1000; i++) {
		screenshot(a, b);
	//}
	//for (int k = 0; k < 24; k++) {
	//	for (int i = 0; i < 1920; i++) {
	//		for (int j = 0; j < 1080; j++) {
	//			a[i][j] = 1;
	//			a[i][j] = 2;
	//			a[i][j] = 3;
	//			a[i][j] = 4;
	//			a[i][j] = 5;
	//		}
	//	}
	//
	//}

	//std::cout << "printing out 1000 stars...\n";
	//for (int i = 0; i < 1000; ++i) std::cout << "*";
	//std::cout << std::endl;

	high_resolution_clock::time_point t2 = high_resolution_clock::now();

	duration<double> time_span = duration_cast<duration<double>>(t2 - t1);

	std::cout << "It took me " << time_span.count() << " seconds.";
	std::cout << std::endl;
}
// 运行程序: Ctrl + F5 或调试 >“开始执行(不调试)”菜单
// 调试程序: F5 或调试 >“开始调试”菜单

// 入门提示: 
//   1. 使用解决方案资源管理器窗口添加/管理文件
//   2. 使用团队资源管理器窗口连接到源代码管理
//   3. 使用输出窗口查看生成输出和其他消息
//   4. 使用错误列表窗口查看错误
//   5. 转到“项目”>“添加新项”以创建新的代码文件，或转到“项目”>“添加现有项”以将现有代码文件添加到项目
//   6. 将来，若要再次打开此项目，请转到“文件”>“打开”>“项目”并选择 .sln 文件
