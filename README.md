# Airsend
 data transfer tool for iOS to Windows

AirSend是一个用于iOS向Windows传输文件的工具，如果想要使用它传输文件，你需要自己手动将electron源码文件编译成exe文件。

安装Node.js，进入源码文件夹，依次执行以下命令：

` npm install `

` npm run epack `

你会在/release/Airsend-win32-x64/中找到AirSend.exe，运行即可。

然后你需要在iOS设备上安装[AirSend](https://www.icloud.com/shortcuts/7a24b2547d274fdf82c2a89cc73e4bbf)捷径，接下来你就可以通过捷径向Windows设备传输文件了。注意，这需要将两个设备连接至同一个局域网。

你也可以安装[AirGet](https://www.icloud.com/shortcuts/e07a5997c01547119cb105cc30d1fc81)捷径来从获取电脑发送的文件，将电脑文件拖动到AirSend应用内即可将其共享到手机，但手机端需要手动下载。

这是一个及其简便的小工具，它尽可能地模拟了原始Airdrop的使用方式，例如从分享列表发送文件，电脑端接收文件后自动打开等等特性，希望实现一种最为简单快捷的传输方式。
