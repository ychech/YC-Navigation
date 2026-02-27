# 分类 API

## 获取分类列表

```http
GET /api/categories
```

### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": "design",
      "name": "设计工具",
      "icon": "Palette",
      "sort": 1,
      "linkCount": 15
    },
    {
      "id": "dev",
      "name": "开发工具",
      "icon": "Code",
      "sort": 2,
      "linkCount": 20
    }
  ]
}
```

## 获取分类详情

```http
GET /api/categories/:id
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "id": "design",
    "name": "设计工具",
    "icon": "Palette",
    "sort": 1,
    "links": [
      {
        "id": "1",
        "title": "Figma",
        "url": "https://figma.com"
      }
    ]
  }
}
```

## 图标类型

分类支持以下图标：

| 图标 | 说明 |
|------|------|
| `Palette` | 设计相关 |
| `Code` | 开发相关 |
| `Image` | 图片相关 |
| `Book` | 文档相关 |
| `Globe` | 通用链接 |
