# cf-worker-dyn-sig (中文)
*English see below*
这个项目利用 Cloudflare Workers 为论坛动态生成图片签名档。它是项目 [xhboke/IP](https://github.com/xhboke/IP) 的 TypeScript 重构版。你可以在这里预览其功能：[ahaigege.com/sig](https://ahaigege.com/sig)。

## 部署

要部署此项目，你需要一个 Cloudflare 账户。拥有账户后，请按照以下步骤操作：

1. Fork 并克隆该仓库：
    ```bash
    git clone https://github.com/yourusername/cf-worker-dyn-sig.git
    ```
2. 进入项目目录：
    ```bash
    cd cf-worker-dyn-sig
    ```
3. 使用 Wrangler 部署：
    ```bash
    wrangler deploy
    ```
    *注意: `wrangler publish` 命令将很快被弃用。*
4. 按照屏幕上的说明进行登录（如果需要）。
5. 享受！

## 使用

部署后，当访问在 Cloudflare 仪表板中设置的路由时，worker 将动态生成签名图片。

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 许可证

该项目是根据 MIT 许可证授权的。有关详细信息，请参阅 LICENSE 文件。

# cf-worker-dyn-sig (EN)

This project leverages Cloudflare Workers to generate dynamic signature images for bulletin board systems (BBS). It is a TypeScript rework of the project found at [xhboke/IP](https://github.com/xhboke/IP). You can preview its functionality at: [ahaigege.com/sig](https://ahaigege.com/sig).

## Deployment

To deploy this project, you need a Cloudflare account. Once you have an account, follow these steps:

1. Fork and clone the repository:
    ```bash
    git clone https://github.com/yourusername/cf-worker-dyn-sig.git
    ```
2. Navigate into the project directory:
    ```bash
    cd cf-worker-dyn-sig
    ```
3. Deploy using Wrangler:
    ```bash
    wrangler deploy
    ```
    *Note: The `wrangler publish` command will be deprecated soon.*
4. Follow the on-screen instructions to log in if needed.
5. Enjoy!

## Usage

Once deployed, the worker will generate dynamic signature images when the route set in cloudflare dashboard is visited.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

