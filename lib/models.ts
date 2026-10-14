export const models=[
 {id:'gpt',name:'OpenAI GPT',maker:'OpenAI',initials:'G',color:'#70d2b1',hint:'General chat & code',env:'OPENAI_API_KEY'},
 {id:'claude',name:'Claude',maker:'Anthropic',initials:'C',color:'#e6a881',hint:'Writing & reasoning',env:'ANTHROPIC_API_KEY'},
 {id:'gemini',name:'Gemini',maker:'Google',initials:'✦',color:'#93abff',hint:'Multimodal tasks',env:'GEMINI_API_KEY'},
 {id:'deepseek',name:'DeepSeek',maker:'DeepSeek',initials:'D',color:'#8fa9ff',hint:'Code & reasoning',env:'DEEPSEEK_API_KEY'}
] as const;
export type ModelId=typeof models[number]['id'];
export function enabledModels(){return models.map(m=>({...m,available:!!process.env[m.env]}));}
