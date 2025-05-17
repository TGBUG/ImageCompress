# ImageCompress
基于 Node.js 的实现超高压缩比的图像压缩脚本

受到 freecompress.com 的图像压缩功能启发

使用方法：

```shell
npm install sharp commander cli-progress

node compress.js -i 输入路径 -o 输出路径 -q 质量（1-100） -t 并发线程数
```
