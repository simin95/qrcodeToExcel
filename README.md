此工程 实现了 扫二维码生成excel表格 的 功能  create by simin in 20190314   version - 0.0.1

## 版本更新
20190315 v0.0.2：增加备注信息功能
20190314 v0.0.1: 增加README.md

注意：getUserMedia 方法在部署后需要 使用https 协议的支持
在linux 上配置ssh：`openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`
在linux 上设置以https 方式启动 http-server: `http-server -S -C cert.pem -o`
