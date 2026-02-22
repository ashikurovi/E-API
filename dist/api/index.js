"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
const path_1 = require("path");
async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(204).end();
        return;
    }
    const distPath = (0, path_1.join)(__dirname, '..', 'dist');
    const { getApp } = require((0, path_1.join)(distPath, 'get-app.js'));
    const app = await getApp();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
}
//# sourceMappingURL=index.js.map