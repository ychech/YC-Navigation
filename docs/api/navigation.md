# 导航 API

## 获取链接列表

```http
GET /api/links
```

### 查询参数

| 参数 | 类型 | 说明 |
|------|------|------|
| `category` | string | 按分类筛选 |
| `search` | string | 搜索关键词 |

### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Figma",
      "url": "https://figma.com",
      "description": "设计协作工具",
      "icon": "/icons/figma.svg",
      "categoryId": "design",
      "clickCount": 128,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## 获取单个链接

```http
GET /api/links/:id
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "1",
    "title": "Figma",
    "url": "https://figma.com",
    "description": "设计协作工具",
    "icon": "/icons/figma.svg",
    "categoryId": "design",
    "clickCount": 128
  }
}
```

## 记录点击

```http
POST /api/links/:id/click
```

### 响应示例

```json
{
  "success": true,
  "message": "点击已记录"
}
```
