import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Artistic Nav',
  description: '专为设计师和创意工作者打造的极简导航网站',
  base: '/',
  ignoreDeadLinks: true,
  
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/getting-started' },
      { text: 'API', link: '/api/' },
      { 
        text: '部署', 
        items: [
          { text: '快速开始', link: '/deploy/quick-start' },
          { text: '部署指南', link: '/deploy/' },
          { text: '安全加固', link: '/deploy/security' }
        ]
      }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '开始',
          items: [
            { text: '简介', link: '/guide/' },
            { text: '快速开始', link: '/guide/getting-started' },
            { text: '环境配置', link: '/guide/configuration' }
          ]
        },
        {
          text: '功能',
          items: [
            { text: '导航管理', link: '/guide/navigation' },
            { text: '后台系统', link: '/guide/admin' },
            { text: '画廊展示', link: '/guide/gallery' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API 文档',
          items: [
            { text: '概述', link: '/api/' },
            { text: '导航 API', link: '/api/navigation' },
            { text: '分类 API', link: '/api/category' },
            { text: '统计 API', link: '/api/stats' }
          ]
        }
      ],
      '/deploy/': [
        {
          text: '快速部署',
          items: [
            { text: '3分钟部署', link: '/deploy/quick-start' }
          ]
        },
        {
          text: '部署方式',
          items: [
            { text: '部署概述', link: '/deploy/' },
            { text: 'Docker 部署', link: '/deploy/docker' },
            { text: 'PM2 部署', link: '/deploy/pm2' },
            { text: 'Vercel 部署', link: '/deploy/vercel' }
          ]
        },
        {
          text: '安全',
          items: [
            { text: '安全加固', link: '/deploy/security' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/ychech/YC-Navigation' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2024 Artistic Nav'
    },

    search: {
      provider: 'local'
    },

    outline: {
      label: '页面导航'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题'
  },

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#5c6bc0' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'zh-CN' }],
    ['meta', { name: 'og:title', content: 'Artistic Nav 文档' }],
    ['meta', { name: 'og:description', content: '专为设计师和创意工作者打造的极简导航网站' }]
  ],

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  }
})
