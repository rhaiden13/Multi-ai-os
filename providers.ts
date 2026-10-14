import {type ModelId} from './models';
type Entry={role:'user'|'assistant';content:string};
type Result={text:string;inputTokens:number;outputTokens:number;model:string};
const timeoutMs=45000;
async function post(url:string,headers:Record<string,string>,body:unknown){
 const response=await fetch(url,{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body),signal:AbortSignal.timeout(timeoutMs),cache:'no-store'});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(`AI provider HTTP ${response.status}`);
 return data;
}
const optional=(name:string)=>process.env[name]?.trim();
export async function generate(id:ModelId,messages:Entry[]):Promise<Result>{
 const max=Number(process.env.MAX_OUTPUT_TOKENS||1024);
 const maxTokens=Math.min(4096,Math.max(128,Number.isFinite(max)?max:1024));
 if(id==='gpt'){
  const key=optional('OPENAI_API_KEY');if(!key)throw new Error('OpenAI not configured');
  const name=optional('OPENAI_MODEL')||'gpt-4.1-mini';
  const data=await post('https://api.openai.com/v1/chat/completions',{Authorization:`Bearer ${key}`},{model:name,messages,max_completion_tokens:maxTokens});
  return {text:data.choices?.[0]?.message?.content||'',inputTokens:data.usage?.prompt_tokens||0,outputTokens:data.usage?.completion_tokens||0,model:data.model||name};
 }
 if(id==='claude'){
  const key=optional('ANTHROPIC_API_KEY');if(!key)throw new Error('Claude not configured');
  const name=optional('ANTHROPIC_MODEL')||'claude-sonnet-4-5';
  const data=await post('https://api.anthropic.com/v1/messages',{'x-api-key':key,'anthropic-version':'2023-06-01'},{model:name,max_tokens:maxTokens,messages});
  return {text:(data.content||[]).filter((p:{type:string})=>p.type==='text').map((p:{text:string})=>p.text).join('\n'),inputTokens:data.usage?.input_tokens||0,outputTokens:data.usage?.output_tokens||0,model:data.model||name};
 }
 if(id==='gemini'){
  const key=optional('GEMINI_API_KEY');if(!key)throw new Error('Gemini not configured');
  const name=optional('GEMINI_MODEL')||'gemini-2.5-flash';
  const contents=messages.map(m=>({role:m.role==='assistant'?'model':'user',parts:[{text:m.content}]}));
  const data=await post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(name)}:generateContent`,{'x-goog-api-key':key},{contents,generationConfig:{maxOutputTokens:maxTokens}});
  return {text:(data.candidates?.[0]?.content?.parts||[]).map((p:{text?:string})=>p.text||'').join(''),inputTokens:data.usageMetadata?.promptTokenCount||0,outputTokens:data.usageMetadata?.candidatesTokenCount||0,model:name};
 }
 if(id==='deepseek'){
  const key=optional('DEEPSEEK_API_KEY');if(!key)throw new Error('DeepSeek not configured');
  const name=optional('DEEPSEEK_MODEL')||'deepseek-chat';
  const data=await post('https://api.deepseek.com/chat/completions',{Authorization:`Bearer ${key}`},{model:name,messages,max_tokens:maxTokens});
  return {text:data.choices?.[0]?.message?.content||'',inputTokens:data.usage?.prompt_tokens||0,outputTokens:data.usage?.completion_tokens||0,model:data.model||name};
 }
 throw new Error('Unsupported model');
}
