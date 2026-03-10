const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const PORT = 3001;

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'ysk-42378c66684f47519ac61619f0d1b3ae'; // 请替换为你的DeepSeek API密钥
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 模拟数据库存储朋友圈内容
let moments = [
  {
    id: 1,
    user: '我',
    avatar: '💚',
    content: 'party 4 life 🎉 新单灵感爆棚 #brat',
    images: ['📸1', '📸2', '📸3'],
    time: '刚刚',
    likes: 104,
    comments: [
      { name: 'A.G. Cook', content: '太charli了！！' },
      { name: 'SOPHIE', content: '🔥🔥🔥' },
      { name: 'George', content: '什么时候发？' }
    ]
  },
  {
    id: 2,
    user: 'Caroline',
    avatar: '🎧',
    content: '和Charli在录音室玩到凌晨  <3',
    images: ['🎛️', '🎙️'],
    time: '昨天 23:14',
    likes: 67,
    comments: [
      { name: '我', content: '下次叫我！！' },
      { name: 'Rina', content: '好想加入' }
    ]
  },
  {
    id: 3,
    user: 'A.G. Cook',
    avatar: '🎹',
    content: '新专辑的制作进展顺利，期待和大家见面！',
    images: ['🎵', '🎚️'],
    time: '2小时前',
    likes: 45,
    comments: [
      { name: '我', content: '迫不及待了！' },
      { name: 'SOPHIE', content: '听起来很棒' }
    ]
  },
  {
    id: 4,
    user: 'SOPHIE',
    avatar: '🔮',
    content: '在工作室做了一些新的音效，感觉很特别',
    images: [],
    time: '4小时前',
    likes: 89,
    comments: [
      { name: '我', content: '求合作！' },
      { name: 'Caroline', content: '想听！' }
    ]
  },
  {
    id: 5,
    user: 'George',
    avatar: '🎸',
    content: '刚刚看了Charli的彩排，太震撼了！',
    images: ['🎤', '🎪'],
    time: '昨天',
    likes: 63,
    comments: [
      { name: '我', content: '谢谢支持！' },
      { name: 'Caroline', content: '我也想去看' }
    ]
  }
];

// 获取朋友圈列表
app.get('/api/moments', (req, res) => {
  res.json({ success: true, data: moments });
});

// 生成朋友圈内容
app.post('/api/generate-post', async (req, res) => {
  const { prompt } = req.body;
  
  try {
    const response = await axios.post(DEEPSEEK_API_URL, {
      model: 'deepseek-chat',
      messages: [
        {
          role: 'system',
          content: '你是Charli XCX，一个流行歌手。请根据用户的提示生成一条朋友圈内容，风格要符合你的个性：活泼、前卫、充满创意。可以包含emoji和话题标签。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const generatedContent = response.data.choices[0].message.content;
    res.json({ success: true, content: generatedContent });
  } catch (error) {
    console.error('DeepSeek API error:', error.message);
    res.json({ success: false, error: '生成内容失败，请稍后再试' });
  }
});

// 发布朋友圈
app.post('/api/post-moment', (req, res) => {
  const { content, images, user, avatar } = req.body;
  
  const newMoment = {
    id: moments.length + 1,
    user: user || '我',
    avatar: avatar || '💚',
    content,
    images: images || [],
    time: '刚刚',
    likes: 0,
    comments: []
  };
  
  moments.unshift(newMoment);
  res.json({ success: true, data: newMoment });
});

// 自动发帖功能
function autoPost() {
  const users = [
    { name: '我', avatar: '💚' },
    { name: 'Caroline', avatar: '🎧' },
    { name: 'A.G. Cook', avatar: '🎹' },
    { name: 'SOPHIE', avatar: '🔮' },
    { name: 'George', avatar: '🎸' }
  ];
  
  const contents = [
    '今天的音乐创作很顺利！#music #创作',
    '和朋友们一起度过了美好的一天 😊',
    '新的灵感来了，准备开始新的项目！',
    '工作室的新设备到了，迫不及待想试试',
    '感谢所有支持我的人，爱你们！',
    '今天天气真好，适合出去走走',
    '刚刚完成了一个重要的项目，感觉很有成就感',
    '分享一首最近喜欢的歌，大家可以去听听',
    '准备开始新的巡演计划，期待见到大家！',
    '在录音室工作到很晚，但很值得'
  ];
  
  // 随机选择用户和内容
  const randomUser = users[Math.floor(Math.random() * users.length)];
  const randomContent = contents[Math.floor(Math.random() * contents.length)];
  
  const newMoment = {
    id: moments.length + 1,
    user: randomUser.name,
    avatar: randomUser.avatar,
    content: randomContent,
    images: [],
    time: '刚刚',
    likes: 0,
    comments: []
  };
  
  moments.unshift(newMoment);
  console.log(`自动发布帖子: ${randomUser.name} - ${randomContent}`);
}

// 启动自动发帖（每2分钟发一次）
setInterval(autoPost, 2 * 60 * 1000);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Open http://localhost:${PORT}/msc.html to view the app`);
  console.log('自动发帖功能已启动，每2分钟发布一条帖子');
});
