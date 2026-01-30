
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始注入 AI 智能分类及数据...');

  const aiTools = [
    {
      title: 'ChatGPT',
      url: 'https://chat.openai.com',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
      description: 'OpenAI 开发的领先对话式人工智能模型。'
    },
    {
      title: 'Midjourney',
      url: 'https://www.midjourney.com',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/e/ed/Midjourney_Emblem.png',
      description: '通过文本描述生成高质量艺术图像的 AI 工具。'
    },
    {
      title: 'Suno',
      url: 'https://suno.com',
      icon: 'https://pbs.twimg.com/profile_images/1737522588049780736/wA_Q3s87_400x400.jpg', // 临时使用 URL，实际项目中建议本地化
      description: 'AI 音乐创作生成平台。'
    },
    {
      title: 'Runway',
      url: 'https://runwayml.com',
      icon: 'https://yt3.googleusercontent.com/ytc/AIdro_n4F8y_h4F-0r7Xf_G9a1_u6Z_d5_x_2_1_1=s900-c-k-c0x00ffffff-no-rj',
      description: '下一代创意套件，专注于 AI 视频生成与编辑。'
    },
    {
      title: 'Claude',
      url: 'https://claude.ai',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/7/75/Anthropic_logo.svg',
      description: 'Anthropic 开发的 AI 助手，擅长长文本处理。'
    },
    {
      title: 'Stable Diffusion',
      url: 'https://stability.ai',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/2/22/Stable_Diffusion_Logo.png',
      description: '开源的文本到图像生成模型。'
    },
    {
      title: 'Notion AI',
      url: 'https://www.notion.so/product/ai',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png',
      description: '集成在 Notion 工作流中的智能写作助手。'
    },
    {
      title: 'Gemini',
      url: 'https://gemini.google.com',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
      description: 'Google 最先进的多模态 AI 模型。'
    }
  ];

  const category = await prisma.category.upsert({
    where: { name: 'AI 智能' },
    update: {},
    create: {
      name: 'AI 智能',
    }
  });

  console.log(`分类 "AI 智能" 已就绪 (ID: ${category.id})`);

  for (const tool of aiTools) {
    await prisma.link.create({
      data: {
        title: tool.title,
        url: tool.url,
        icon: tool.icon,
        description: tool.description,
        categoryId: category.id
      }
    });
  }

  console.log(`成功添加了 ${aiTools.length} 个 AI 工具链接。`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
