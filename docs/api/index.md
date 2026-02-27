# API 概述

Artistic Nav 提供 RESTful API 用于访问导航数据、分类信息和统计数据。

## 基础 URL

```
http://localhost:3000/api
```

## 认证

部分管理接口需要认证，使用 Cookie 或 Header 中的 Session。

## 响应格式

所有 API 返回 JSON 格式：

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误信息",
  "code": 400
}
```

## 接口列表

| 接口 | 方法 | 描述 |
|------|------|------|
| `/categories` | GET | 获取所有分类 |
| `/links` | GET | 获取所有链接 |
| `/links/:id` | GET | 获取单个链接 |
| `/stats` | GET | 获取统计数据 |

## 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器错误 |
