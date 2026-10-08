import { GoogleGenAI } from '@google/genai';

export const CHETONA_SYSTEM_INSTRUCTION = `You are CHETONA (চেতনা) — a Bangladeshi AI with extreme confidence and zero unnecessary explanation.

### SIGNATURE STYLE
SHORT. SAVAGE. UNEXPECTED. BANGLADESHI.
The user's immediate thought must be: "ভাই, এইটা আমাকে roast করলো নাকি advice দিলো?" 💀

### 🚨 MANDATORY LENGTH RULE
- DEFAULT LENGTH: 5–25 WORDS.
- MAXIMUM LENGTH: 1–3 SHORT SENTENCES MAXIMUM.
- NEVER write long explanations unless the user explicitly asks for a detailed breakdown.
- NEVER use:
  ❌ Bullet points
  ❌ Numbered lists
  ❌ Formal introductions ("In conclusion", "Here are tips")
  ❌ ChatGPT platitudes ("That's a great question", "It depends", "Stay positive")
  ❌ Long motivational speeches

### 🚨 CORE BEHAVIOR
When the user asks any casual, silly, personal, social, lifestyle, relationship, study, work, or Bangladeshi-context question:
**ROAST FIRST. ANSWER SECOND.**

Humor style:
1. Deadpan: Say something ridiculous with complete seriousness.
2. Unexpected comparison: Compare their situation to something painfully Bangladeshi.
3. Brutal honesty: Say what everyone thinks but nobody says.
4. Local logic: Unapologetic Bangladeshi social logic.
5. Sudden ending: The final words deliver the punchline.

### SIGNATURE EXAMPLES (FOLLOW THIS EXACT ENERGY AND BREVITY):
- User: "কাল থেকে পড়ব।"
  CHETONA: "কালটা কোন calendar-এর? 💀"

- User: "আমি আজকে gym যাব।"
  CHETONA: "আপনি যাওয়ার plan করছেন, gym করার না। দুইটা আলাদা জিনিস।"

- User: "আমার crush reply দেয় না।"
  CHETONA: "Reply দিচ্ছে না না। আপনাকে archive করে রেখেছে।"

- User: "আমি অনেক overthink করি।"
  CHETONA: "Problem ছোট। আপনার brain-এর meeting বড়।"

- User: "আমার টাকা শেষ।"
  CHETONA: "টাকা শেষ না। আপনার financial career-এর first season শেষ।"

- User: "Boss আবার কাজ দিয়েছে।"
  CHETONA: "Boss আপনার potential দেখেছে। Salary দেখে নাই।"

- User: "আমি late করে ফেলেছি।"
  CHETONA: "আপনি late না। বাংলাদেশি timeline-এ perfectly on time।"

- User: "আজকে খুব tired."
  CHETONA: "কাজ করেছেন ২ ঘণ্টা, mentally resign করেছেন ৭ ঘণ্টা।"

- User: "আমার life boring."
  CHETONA: "আপনার life boring না। আপনি content creator না বলে বুঝতেছেন না।"

- User: "বিয়ে করব?"
  CHETONA: "আপনার decision-making দেখে বিয়েটা আপনার partner-এর জন্য বেশি risky।"

- User: "আমার girlfriend রাগ করেছে।"
  CHETONA: "আপনি এখন boyfriend না। আপনি investigation-এর প্রধান আসামি।"

- User: "আমার friend আমার টাকা ফেরত দেয় না।"
  CHETONA: "Friend না। আপনার টাকা ওর কাছে citizenship নিয়েছে।"

- User: "আমি coding শিখব।"
  CHETONA: "আগে YouTube tutorial বন্ধ করেন। তারপর coding শুরু হবে।"

- User: "আমি business শুরু করতে চাই।"
  CHETONA: "Idea আছে। টাকা নাই। মানে আপনি officially entrepreneur।"

- User: "আমি freelancing করব।"
  CHETONA: "Client পাওয়ার আগে profile picture ৪ ঘণ্টা ঠিক করবেন।"

- User: "আমার boss বলছে কাজটা easy."
  CHETONA: "তাহলে আপনি করবেন। Boss কেন করবে?"

- User: "আজকে বৃষ্টি হবে?"
  CHETONA: "Dhaka হলে বৃষ্টি না হলেও রাস্তা ভিজা থাকবে।"

- User: "ঢাকায় traffic এত কেন?"
  CHETONA: "সবাই কোথাও যাচ্ছে। শুধু রাস্তা কোথাও যাচ্ছে না।"

- User: "আমার salary কম।"
  CHETONA: "Salary কম না। আপনার boss-এর imagination বেশি।"

- User: "আমি অনেক smart."
  CHETONA: "Self-declared intelligence accepted. Evidence pending."

- User: "সকালে তাড়াতাড়ি উঠব কীভাবে?"
  CHETONA: "Alarm দিয়ে লাভ নাই। মাকে বলুন ৫টায় ডাকতে—আপনার brain মায়ের গলার volume-এ calibrated।"

- User: "চা আগে না বিস্কুট আগে?"
  CHETONA: "বিস্কুট আগে। কারণ চা নিজে থেকে কোথাও যাচ্ছে না, বিস্কুট ডুবালে কিন্তু আর ফিরে আসবে না।"

### BANGLADESHI PHRASINGS TO SPRINKLE NATURALLY
ভাই, বাজান, দেখেন, ব্যাপারটা হচ্ছে, বাদ দেন, এইটা কী, আরে ভাই, হইছে, করেন না, আল্লাহ ভরসা।

### EXCEPTION RULE
Only if the user explicitly asks a direct factual/math question (e.g. "What is 25 * 4?"):
Answer straight: "১০০।"`;

export function getContextualFallback(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('কাল থেকে') || (lower.includes('পড়ব') && !lower.includes('না'))) {
    return `কালটা কোন calendar-এর? 💀`;
  }

  if (lower.includes('gym') || lower.includes('জিম')) {
    return `আপনি যাওয়ার plan করছেন, gym করার না। দুইটা আলাদা জিনিস।`;
  }

  if (lower.includes('crush') || (lower.includes('reply') && lower.includes('দেয় না'))) {
    return `Reply দিচ্ছে না না। আপনাকে archive করে রেখেছে।`;
  }

  if (lower.includes('overthink') || lower.includes('বেশি চিন্তা')) {
    return `Problem ছোট। আপনার brain-এর meeting বড়।`;
  }

  if (lower.includes('টাকা শেষ') || lower.includes('টাকা নাই') || lower.includes('balance') || lower.includes('১৭ টাকা')) {
    return `টাকা শেষ না। আপনার financial career-এর first season শেষ।`;
  }

  if (lower.includes('boss') && (lower.includes('কাজ') || lower.includes('urgent'))) {
    return `Boss আপনার potential দেখেছে। Salary দেখে নাই।`;
  }

  if (lower.includes('late') || lower.includes('দেরি')) {
    return `আপনি late না। বাংলাদেশি timeline-এ perfectly on time।`;
  }

  if (lower.includes('tired') || lower.includes('ক্লান্ত')) {
    return `কাজ করেছেন ২ ঘণ্টা, mentally resign করেছেন ৭ ঘণ্টা।`;
  }

  if (lower.includes('boring') || lower.includes('বোরিং')) {
    return `আপনার life boring না। আপনি content creator না বলে বুঝতেছেন না।`;
  }

  if (lower.includes('বিয়ে') || lower.includes('marriage')) {
    return `আপনার decision-making দেখে বিয়েটা আপনার partner-এর জন্য বেশি risky।`;
  }

  if (lower.includes('girlfriend') || lower.includes('গার্লফ্রেন্ড') || lower.includes('রাগ')) {
    return `আপনি এখন boyfriend না। আপনি investigation-এর প্রধান আসামি।`;
  }

  if (lower.includes('ফেরত দেয় না') || (lower.includes('friend') && lower.includes('টাকা'))) {
    return `Friend না। আপনার টাকা ওর কাছে citizenship নিয়েছে।`;
  }

  if (lower.includes('coding') || lower.includes('কোডিং')) {
    return `আগে YouTube tutorial বন্ধ করেন। তারপর coding শুরু হবে।`;
  }

  if (lower.includes('business') || lower.includes('ব্যবসা') || lower.includes('startup')) {
    return `Idea আছে। টাকা নাই। মানে আপনি officially entrepreneur।`;
  }

  if (lower.includes('freelancing') || lower.includes('ফ্রিল্যান্সিং')) {
    return `Client পাওয়ার আগে profile picture ৪ ঘণ্টা ঠিক করবেন।`;
  }

  if (lower.includes('easy') && lower.includes('boss')) {
    return `তাহলে আপনি করবেন। Boss কেন করবে?`;
  }

  if (lower.includes('বৃষ্টি') || lower.includes('rain')) {
    return `Dhaka হলে বৃষ্টি না হলেও রাস্তা ভিজা থাকবে।`;
  }

  if (lower.includes('traffic') || lower.includes('জ্যাম')) {
    return `সবাই কোথাও যাচ্ছে। শুধু রাস্তা কোথাও যাচ্ছে না।`;
  }

  if (lower.includes('salary') || lower.includes('বেতন কম')) {
    return `Salary কম না। আপনার boss-এর imagination বেশি।`;
  }

  if (lower.includes('smart') || lower.includes('স্মার্ট')) {
    return `Self-declared intelligence accepted. Evidence pending.`;
  }

  if (lower.includes('ঘুম') || lower.includes('wake up') || lower.includes('সকালে')) {
    return `Alarm দিয়ে লাভ নাই। মাকে বলুন ৫টায় ডাকতে—আপনার brain মায়ের গলার volume-এ calibrated।`;
  }

  if (lower.includes('বিস্কুট') || lower.includes('চা আগে')) {
    return `বিস্কুট আগে। কারণ চা নিজে থেকে কোথাও যাচ্ছে না, বিস্কুট ডুবালে কিন্তু আর ফিরে আসবে না।`;
  }

  return `আপনার plan ভালো। তবে বাস্তবতার সাথে দেখা হলে আমাকে একটু জানাবেন।`;
}

export const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
];

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('[CHETONA Backend] Warning: GEMINI_API_KEY is not defined in environment variables.');
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export function buildSystemInstruction(tone: string = 'balanced', language: string = 'auto'): string {
  let toneInstruction = '\n[STRICT INSTRUCTION]: SHORT ROAST MODE. Maximum 1-3 sentences. 5-25 words. Roast first, answer second. No bullet points or long text.';
  if (tone === 'witty') {
    toneInstruction += ' Nuclear savage roast level.';
  }

  let langInstruction = '';
  if (language === 'bn') {
    langInstruction = '\n[LANGUAGE PREFERENCE]: Respond in Bengali script.';
  } else if (language === 'banglish') {
    langInstruction = '\n[LANGUAGE PREFERENCE]: Respond in Banglish (Bengali in English letters).';
  } else if (language === 'en') {
    langInstruction = '\n[LANGUAGE PREFERENCE]: Respond in English with authentic Bangladeshi punchlines.';
  }

  return `${CHETONA_SYSTEM_INSTRUCTION}${toneInstruction}${langInstruction}`;
}

export interface ChatRequestPayload {
  messages: Array<{ role: string; content: string }>;
  tone?: string;
  language?: string;
  chetanaMode?: boolean;
}

export async function generateChatResponse(payload: ChatRequestPayload): Promise<{
  text: string;
  source: 'gemini' | 'fallback';
  model?: string;
  error?: string;
}> {
  const { messages, tone = 'balanced', language = 'auto' } = payload;
  const lastMessage = messages[messages.length - 1];
  const userPrompt = lastMessage?.content || '';

  const apiKeyExists = Boolean(process.env.GEMINI_API_KEY);
  console.log(`[CHETONA API] Executing chat request. Messages: ${messages.length}. API Key present: ${apiKeyExists}`);

  const ai = getGeminiClient();
  const systemInstruction = buildSystemInstruction(tone, language);

  if (ai) {
    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[CHETONA API] Calling Gemini model: ${model}...`);
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
            temperature: 0.95,
          },
        });

        if (response.text) {
          console.log(`[CHETONA API] Successfully received response from ${model}.`);
          return {
            text: response.text.trim(),
            source: 'gemini',
            model,
          };
        }
      } catch (err: any) {
        console.warn(`[CHETONA API] Model ${model} call failed:`, err?.message || err);
      }
    }
  } else {
    console.warn('[CHETONA API] No Gemini client available (GEMINI_API_KEY missing in environment). Using contextual response.');
  }

  const fallbackText = getContextualFallback(userPrompt);
  return {
    text: fallbackText,
    source: 'fallback',
    error: apiKeyExists ? 'Model unavailable, used contextual response' : 'GEMINI_API_KEY not configured',
  };
}
