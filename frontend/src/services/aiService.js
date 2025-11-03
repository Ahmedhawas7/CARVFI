import axios from 'axios';

class AIService {
  constructor() {
    this.conversationHistory = new Map();
    this.userContext = new Map();
  }

  // محاكاة ذكاء اصطناعي متقدم مع ذاكرة وتعلم
  async generateAIResponse(userMessage, userAddress, conversationId = 'default') {
    try {
      // إذا مافيش history للمستخدم، ننشئ واحد جديد
      if (!this.conversationHistory.has(userAddress)) {
        this.conversationHistory.set(userAddress, []);
        this.userContext.set(userAddress, {
          interests: [],
          expertise: 'beginner',
          lastTopics: [],
          personality: 'friendly'
        });
      }

      const history = this.conversationHistory.get(userAddress);
      const context = this.userContext.get(userAddress);

      // تحديث context المستخدم بناءً على الرسالة
      this.updateUserContext(userMessage, context);

      // توليد رد ذكي بناءً على التاريخ والسياق
      const response = await this.createSmartResponse(userMessage, history, context, userAddress);
      
      // حفظ المحادثة في التاريخ
      history.push({
        user: userMessage,
        ai: response,
        timestamp: Date.now()
      });

      // حفظ فقط آخر 10 رسائل
      if (history.length > 10) {
        history.shift();
      }

      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  updateUserContext(message, context) {
    const lowerMessage = message.toLowerCase();
    
    // اكتشاف اهتمامات المستخدم
    const interests = {
      'nft': 'NFTs',
      'defi': 'DeFi',
      'staking': 'Staking',
      'governance': 'Governance',
      'web3': 'Web3',
      'blockchain': 'Blockchain',
      'token': 'Tokens',
      'dao': 'DAOs',
      'metaverse': 'Metaverse',
      'gamefi': 'GameFi'
    };

    // إضافة الاهتمامات الجديدة
    Object.keys(interests).forEach(key => {
      if (lowerMessage.includes(key) && !context.interests.includes(interests[key])) {
        context.interests.push(interests[key]);
      }
    });

    // تحديث آخر المواضيع
    context.lastTopics.push(message.substring(0, 50));
    if (context.lastTopics.length > 5) {
      context.lastTopics.shift();
    }

    // تحديد مستوى الخبرة
    const expertKeywords = ['smart contract', 'solidity', 'vyper', 'web3.js', 'ethers.js', 'rust', 'move'];
    const beginnerKeywords = ['what is', 'how to', 'explain', 'help me', 'new to'];
    
    if (expertKeywords.some(keyword => lowerMessage.includes(keyword))) {
      context.expertise = 'expert';
    } else if (beginnerKeywords.some(keyword => lowerMessage.includes(keyword))) {
      context.expertise = 'beginner';
    }
  }

  async createSmartResponse(userMessage, history, context, userAddress) {
    const lowerMessage = userMessage.toLowerCase();
    
    // نظام الردود الذكية مع ذاكرة
    const responses = {
      // تحيات
      greeting: [
        "Hello there! I see you're interested in {interests}. How can I assist you with your Web3 journey today?",
        "Welcome back! {lastTopic} was quite interesting. What would you like to explore today?",
        "Hey! Based on our chat, I think you'd love learning about {suggestion}. Want to dive in?"
      ],

      // Web3 concepts
      web3: [
        "Web3 represents the decentralized internet - built on blockchain, owned by users. It's like the internet but you actually own your data and digital assets!",
        "The evolution from Web2 to Web3 is massive! We're moving from company-owned platforms to user-owned networks. Exciting times!",
        "Web3 encompasses DeFi, NFTs, DAOs, and more. It's all about decentralization and user sovereignty."
      ],

      // CARVFi specific
      carvfi: [
        "CARVFi is your gateway to Social FI! We combine social interactions with DeFi rewards on the Carv network.",
        "On CARVFi, you earn points for being active - chatting, updating your profile, connecting wallets, and more!",
        "The more you engage with CARVFi, the more you earn. It's social networking meets decentralized finance!"
      ],

      // Technical topics
      technical: [
        "That's a great technical question! For {expertise} level, I'd recommend {resource} to get started.",
        "Technical concepts can be challenging. Let me break this down for your {expertise} level...",
        "Based on your previous questions, I think you're ready for more advanced topics like {advancedTopic}!"
      ],

      // Personalization
      personal: [
        "I remember you asked about {lastTopic}. Here's some more info that might help...",
        "Since you're interested in {interests}, you might want to explore {relatedTopic}!",
        "Your journey in {primaryInterest} is impressive! Here's what I suggest next..."
      ]
    };

    // اختيار نوع الرد بناءً على المحادثة
    let responseType = 'general';
    
    if (this.isGreeting(lowerMessage)) responseType = 'greeting';
    else if (lowerMessage.includes('carvfi')) responseType = 'carvfi';
    else if (lowerMessage.includes('web3') || lowerMessage.includes('blockchain')) responseType = 'web3';
    else if (this.isTechnical(lowerMessage)) responseType = 'technical';
    else if (this.canPersonalize(history, context)) responseType = 'personal';

    // إنشاء رد مخصص
    return this.buildPersonalizedResponse(responseType, responses, context, history, userMessage);
  }

  isGreeting(message) {
    return /^(hi|hello|hey|greetings|good morning|good afternoon)/.test(message);
  }

  isTechnical(message) {
    const techKeywords = ['smart contract', 'solidity', 'blockchain', 'tokenomics', 'consensus', 'gas fee'];
    return techKeywords.some(keyword => message.includes(keyword));
  }

  canPersonalize(history, context) {
    return history.length > 2 && context.interests.length > 0;
  }

  buildPersonalizedResponse(type, responses, context, history, userMessage) {
    const templates = responses[type];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // استبدال المتغيرات في القالب
    let response = template
      .replace('{interests}', context.interests.length > 0 ? 
        context.interests.slice(0, 2).join(' and ') : 'Web3')
      .replace('{lastTopic}', context.lastTopics.length > 0 ? 
        `"${context.lastTopics[context.lastTopics.length - 1]}"` : 'blockchain')
      .replace('{expertise}', context.expertise)
      .replace('{primaryInterest}', context.interests[0] || 'Web3');

    // إضافة اقتراحات مخصصة
    if (type === 'greeting' || type === 'personal') {
      response += this.addPersonalizedSuggestions(context);
    }

    // إضافة معلومات تعليمية إذا كان المستخدم مبتدئ
    if (context.expertise === 'beginner' && this.isEducational(userMessage)) {
      response += this.addEducationalContent(userMessage);
    }

    return response;
  }

  addPersonalizedSuggestions(context) {
    const suggestions = {
      'NFTs': ' exploring NFT collections on CARVFi',
      'DeFi': ' trying out our DeFi features',
      'Staking': ' learning about staking rewards',
      'Governance': ' participating in community governance',
      'Web3': ' diving deeper into Web3 concepts'
    };

    const userInterest = context.interests[0] || 'Web3';
    return `\n\n💡 **Suggestion**: Since you like ${userInterest}, consider${suggestions[userInterest] || ' exploring our social features'}!`;
  }

  addEducationalContent(message) {
    const educationalResources = {
      'nft': '\n\n🎨 **NFT Basics**: NFTs are unique digital assets on blockchain. Each is one-of-a-kind!',
      'defi': '\n\n💰 **DeFi Explained**: Decentralized Finance lets you trade, lend, borrow without intermediaries.',
      'staking': '\n\n🔒 **Staking 101**: Lock your tokens to support the network and earn rewards.',
      'web3': '\n\n🌐 **Web3 Vision**: An internet owned by users, not corporations. You control your data!'
    };

    for (const [key, value] of Object.entries(educationalResources)) {
      if (message.toLowerCase().includes(key)) {
        return value;
      }
    }

    return '';
  }

  isEducational(message) {
    const eduKeywords = ['what is', 'explain', 'how does', 'tell me about'];
    return eduKeywords.some(keyword => message.toLowerCase().includes(keyword));
  }

  getFallbackResponse(message) {
    const fallbacks = [
      "That's an interesting question! I'm constantly learning about Web3 and CARVFi. Could you rephrase that?",
      "I'm still developing my knowledge in this area. Let me connect you with our community resources!",
      "Great question! While I work on improving, check out our documentation for detailed answers.",
      "I'm excited to learn with you! Could you ask that in a different way?"
    ];
    
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }

  // الحصول على تاريخ المحادثة
  getConversationHistory(userAddress) {
    return this.conversationHistory.get(userAddress) || [];
  }

  // مسح تاريخ محادثة معينة
  clearConversationHistory(userAddress) {
    this.conversationHistory.delete(userAddress);
    this.userContext.delete(userAddress);
  }
}

export default new AIService();
