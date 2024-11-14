import { serve } from "bun";
import { file } from "bun";

const server = serve({
    port: 3000,
    async fetch(req) {
        const url = new URL(req.url);
        
        // 处理首页请求
        if (url.pathname === "/") {
            return new Response(await file("public/index.html").text(), {
                headers: { "Content-Type": "text/html" },
            });
        }
        
        // 处理 JavaScript 文件请求
        if (url.pathname === "/index.js") {
            return new Response(await file("index.js").text(), {
                headers: { "Content-Type": "application/javascript" },
            });
        }
        
        // 处理监控数据上报
        if (url.pathname === "/api/activity-log" && req.method === "POST") {
            const data = await req.json();
            console.log("收到监控数据：", data);
            return new Response(JSON.stringify({ status: "success" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        return new Response("404 Not Found", { status: 404 });
    },
});

console.log(`服务器运行在 http://localhost:${server.port}`);