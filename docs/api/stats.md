# 统计 API

## 获取统计数据

```http
GET /api/stats
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "totalLinks": 50,
    "totalCategories": 5,
    "totalClicks": 1024,
    "popularLinks": [
      {
        "id": "1",
        "title": "Figma",
        "clickCount": 128
      }
    ],
    "clicksByDay": [
      {
        "date": "2024-01-01",
        "count": 50
      }
    ]
  }
}
```

## 获取访问趋势

```http
GET /api/stats/trends
```

### 查询参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `days` | number | 天数 | 7 |

### 响应示例

```json
{
  "success": true,
  "data": {
    "labels": ["周一", "周二", "周三"],
    "datasets": [
      {
        "label": "访问量",
        "data": [100, 150, 120]
      }
    ]
  }
}
```

## 获取热门链接

```http
GET /api/stats/popular
```

### 查询参数

| 参数 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| `limit` | number | 返回数量 | 10 |

### 响应示例

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "title": "Figma",
      "url": "https://figma.com",
      "clickCount": 128,
      "category": "设计工具"
    }
  ]
}
```
