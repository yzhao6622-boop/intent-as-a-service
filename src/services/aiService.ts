import dotenv from 'dotenv';
import axios from 'axios';
import { dbAll, dbRun, dbGet } from '../db/schema';
import { AIConversation, Intent, VerificationRecord } from '../types';

// 确保环境变量已加载
dotenv.config();

// 火山方舟API配置
const ARK_API_KEY = process.env.ARK_API_KEY || '';
const ARK_ACCESS_KEY = process.env.ARK_ACCESS_KEY || '';
const ARK_SECRET_KEY = process.env.ARK_SECRET_KEY || '';
const ARK_MODEL_ID = process.env.ARK_MODEL_ID || '';
const ARK_API_BASE_URL = process.env.ARK_API_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3';

// 检查配置
if (!ARK_API_KEY && !ARK_ACCESS_KEY) {
  console.warn('警告: 未配置ARK_API_KEY或ARK_ACCESS_KEY，API调用将失败');
}

// 创建axios实例（不设置默认Authorization，在每次请求时动态设置）
const arkClient = axios.create({
  baseURL: ARK_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 调用火山方舟API
 */
async function callArkAPI(messages: any[], options: {
  temperature?: number;
  response_format?: { type: string };
} = {}) {
  try {
    // 准备请求头 - 尝试多种认证方式
    const headers: any = {
      'Content-Type': 'application/json',
    };

    // 尝试不同的认证方式
    if (ARK_API_KEY) {
      // 方式1: Bearer Token
      headers['Authorization'] = `Bearer ${ARK_API_KEY}`;
    } else if (ARK_ACCESS_KEY) {
      // 方式2: 使用Access Key
      headers['Authorization'] = `Bearer ${ARK_ACCESS_KEY}`;
    }

    // 调试信息（仅开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.log('API调用信息:', {
        url: `${ARK_API_BASE_URL}/chat/completions`,
        model: ARK_MODEL_ID,
        hasApiKey: !!ARK_API_KEY,
        apiKeyLength: ARK_API_KEY?.length || 0,
        hasAuthHeader: !!headers['Authorization'],
      });
    }

    const response = await arkClient.post('/chat/completions', {
      model: ARK_MODEL_ID,
      messages,
      temperature: options.temperature || 0.7,
      ...(options.response_format && { response_format: options.response_format }),
    }, {
      headers,
    });

    return response.data;
  } catch (error: any) {
    const errorData = error.response?.data;
    const errorMessage = errorData?.error?.message || error.message;
    
    console.error('火山方舟API调用失败:', {
      status: error.response?.status,
      data: errorData,
      message: errorMessage,
    });
    
    // 提供更详细的错误提示
    if (errorMessage?.includes('API key') || errorMessage?.includes('AK/SK') || errorMessage?.includes('invalid')) {
      throw new Error(
        `API认证失败: ${errorMessage}\n` +
        `请检查:\n` +
        `1. ARK_API_KEY 是否正确配置\n` +
        `2. 或者配置 ARK_ACCESS_KEY 和 ARK_SECRET_KEY\n` +
        `3. API密钥是否有效且有权限\n` +
        `4. 模型ID (ARK_MODEL_ID) 是否正确`
      );
    }
    
    throw new Error(`API调用失败: ${errorMessage}`);
  }
}

/**
 * 意图挖掘：从用户输入推理真实意图
 */
export async function mineIntent(userInput: string, conversationHistory?: AIConversation[]): Promise<{
  title: string;
  description: string;
  category: string;
  time_window_days: number;
  credibility_indicators: string[];
}> {
  const systemPrompt = `你是一个专业的意图挖掘专家。你的任务是分析用户的真实意图，而不是表面的需求。

请从用户的输入中识别：
1. 真实意图（不是模糊的想法，而是具体的行动计划）
2. 意图类别（职业转型/医疗决策/大额消费/关系决策/学习成长等）
3. 合理的时间窗口（天）
4. 可信度指标（用户表现出的决心、准备程度、行动迹象）

返回JSON格式：
{
  "title": "意图标题",
  "description": "详细描述",
  "category": "类别",
  "time_window_days": 90,
  "credibility_indicators": ["指标1", "指标2"]
}`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  if (conversationHistory && conversationHistory.length > 0) {
    conversationHistory.slice(-10).forEach(msg => {
      messages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      });
    });
  }

  messages.push({ role: 'user', content: userInput });

  try {
    const response = await callArkAPI(messages, {
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI返回的内容为空');
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError: any) {
      console.error('JSON解析失败，原始内容:', content);
      throw new Error(`AI返回格式错误: ${parseError.message}`);
    }

    // 验证必需字段
    if (!result.title || !result.description || !result.category) {
      console.error('AI返回数据缺少必需字段:', result);
      throw new Error('AI返回的数据不完整，缺少必需字段');
    }

    return result;
  } catch (error: any) {
    console.error('mineIntent失败:', error);
    throw error;
  }
}

/**
 * 意图验证：判断用户是否真的要做这件事
 */
export async function verifyIntent(intentId: number): Promise<{
  passed: boolean;
  credibility_score: number;
  analysis: string;
  concerns: string[];
}> {
  // 获取意图信息
  const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
  if (!intent) {
    throw new Error('意图不存在');
  }

  // 获取最近的验证记录
  const recentVerifications = await dbAll(
    'SELECT * FROM verification_records WHERE intent_id = ? ORDER BY created_at DESC LIMIT 5',
    [intentId]
  ) as VerificationRecord[];

  // 获取最近的对话
  const recentConversations = await dbAll(
    'SELECT * FROM ai_conversations WHERE intent_id = ? ORDER BY created_at DESC LIMIT 10',
    [intentId]
  ) as AIConversation[];

  // 获取进展记录
  const progressRecords = await dbAll(
    'SELECT * FROM intent_progress WHERE intent_id = ? ORDER BY created_at DESC LIMIT 5',
    [intentId]
  );

  const systemPrompt = `你是一个严格的意图审计员。你的任务是验证用户是否真的在执行他们的意图，而不是仅仅停留在想法层面。

意图信息：
标题：${intent.title}
描述：${intent.description}
时间窗口：${intent.time_window_days}天
当前阶段：${intent.stage}

请分析：
1. 用户是否表现出真实的行动迹象？
2. 是否有拖延、犹豫、偏航的迹象？
3. 可信度评分（0-100）
4. 需要关注的担忧点

返回JSON格式：
{
  "passed": true/false,
  "credibility_score": 75,
  "analysis": "详细分析",
  "concerns": ["担忧1", "担忧2"]
}`;

  const context = `
最近验证记录：${JSON.stringify(recentVerifications)}
最近对话：${JSON.stringify(recentConversations)}
进展记录：${JSON.stringify(progressRecords)}
`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: context },
  ];

  const response = await callArkAPI(messages, {
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}

/**
 * 意图演进追踪：判断意图是否从A阶段进入B阶段
 */
export async function trackIntentEvolution(intentId: number): Promise<{
  current_stage: string;
  progress_percentage: number;
  next_milestone: string;
  recommendations: string[];
}> {
  const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
  const stages = await dbAll(
    'SELECT * FROM intent_stages WHERE intent_id = ? ORDER BY stage_order',
    [intentId]
  );
  const progressRecords = await dbAll(
    'SELECT * FROM intent_progress WHERE intent_id = ? ORDER BY created_at DESC LIMIT 10',
    [intentId]
  );

  const systemPrompt = `分析意图的演进情况，判断当前处于哪个阶段，并提供下一步建议。

意图：${intent.title}
阶段拆解：${JSON.stringify(stages)}
进展记录：${JSON.stringify(progressRecords)}

返回JSON格式：
{
  "current_stage": "阶段名称",
  "progress_percentage": 45,
  "next_milestone": "下一个里程碑",
  "recommendations": ["建议1", "建议2"]
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  const response = await callArkAPI(messages, {
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}

/**
 * AI对话：作为意图审计员与用户对话
 */
export async function chatWithAI(intentId: number, userMessage: string): Promise<string> {
  // 获取意图信息
  const intent = await dbGet('SELECT * FROM intents WHERE id = ?', [intentId]) as Intent;
  
  // 获取历史对话
  const history = await dbAll(
    'SELECT * FROM ai_conversations WHERE intent_id = ? ORDER BY created_at DESC LIMIT 20',
    [intentId]
  ) as AIConversation[];

  const systemPrompt = `你是一个严格的意图审计员和进展见证者。你的角色是：

1. 反复质疑用户的动机，确保他们真的要做这件事
2. 捕捉犹豫、拖延、偏航的迹象
3. 动态调整"真实意图"的定义
4. 提供支持但不让用户感到被冒犯

当前意图：${intent.title}
描述：${intent.description}

你的语气应该是：专业、质疑但支持、直接但不刻薄。`;

  const messages: any[] = [
    { role: 'system', content: systemPrompt },
  ];

  // 添加历史对话（倒序，因为查询是倒序的）
  history.reverse().forEach(msg => {
    messages.push({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    });
  });

  messages.push({ role: 'user', content: userMessage });

  const response = await callArkAPI(messages, {
    temperature: 0.8,
  });

  const aiResponse = response.choices[0].message.content || '';

  // 保存对话记录
  await dbRun(
    'INSERT INTO ai_conversations (intent_id, role, content) VALUES (?, ?, ?)',
    [intentId, 'user', userMessage]
  );
  await dbRun(
    'INSERT INTO ai_conversations (intent_id, role, content) VALUES (?, ?, ?)',
    [intentId, 'assistant', aiResponse]
  );

  return aiResponse;
}

/**
 * 生成意图阶段拆解
 */
export async function generateIntentStages(intent: Intent): Promise<{
  stages: Array<{
    stage_name: string;
    stage_order: number;
    description: string;
    verification_points: string;
  }>;
}> {
  const systemPrompt = `为一个意图生成详细的阶段拆解。

意图：${intent.title}
描述：${intent.description}
时间窗口：${intent.time_window_days}天

请将意图拆解为3-6个阶段，每个阶段包含：
- 阶段名称
- 阶段描述
- 验证点（如何验证用户真的在执行这个阶段）

返回JSON格式：
{
  "stages": [
    {
      "stage_name": "阶段1名称",
      "stage_order": 1,
      "description": "阶段描述",
      "verification_points": "验证点1,验证点2"
    }
  ]
}`;

  const messages = [
    { role: 'system', content: systemPrompt },
  ];

  const response = await callArkAPI(messages, {
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(response.choices[0].message.content || '{}');
  return result;
}
