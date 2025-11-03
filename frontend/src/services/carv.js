import { Carv } from '@carv/sdk'

export class CarvService {
  constructor() {
    this.carv = new Carv({
      network: 'testnet',
      // apiKey: 'YOUR_CARV_API_KEY'
    })
  }

  async getWalletActivity(address) {
    try {
      const activity = await this.carv.getWalletActivity(address)
      return this.formatActivityData(activity)
    } catch (error) {
      console.error('Error fetching wallet activity:', error)
      return []
    }
  }

  async getUserIdentity(address) {
    try {
      const identity = await this.carv.getIdentity(address)
      return identity
    } catch (error) {
      console.error('Error fetching user identity:', error)
      return null
    }
  }

  async getTransactionHistory(address) {
    try {
      const transactions = await this.carv.getTransactions(address)
      return transactions
    } catch (error) {
      console.error('Error fetching transactions:', error)
      return []
    }
  }

  formatActivityData(activity) {
    // تنسيق بيانات النشاط للعرض
    return activity.map(item => ({
      type: item.type,
      timestamp: item.timestamp,
      amount: item.amount,
      description: this.getActivityDescription(item.type),
      platform: item.platform || 'Carv Network'
    }))
  }

  getActivityDescription(type) {
    const descriptions = {
      'transfer': 'Token Transfer',
      'swap': 'Token Swap',
      'nft_mint': 'NFT Minted',
      'nft_transfer': 'NFT Transferred',
      'contract_interaction': 'Smart Contract Interaction',
      'staking': 'Tokens Staked',
      'governance': 'Governance Participation'
    }
    return descriptions[type] || 'Unknown Activity'
  }

  // دالة لمحاكاة الذكاء الاصطناعي
  async analyzeUserBehavior(address) {
    const activity = await this.getWalletActivity(address)
    
    const analysis = {
      riskScore: this.calculateRiskScore(activity),
      behaviorPattern: this.identifyBehaviorPattern(activity),
      recommendations: this.generateRecommendations(activity),
      trustLevel: this.calculateTrustLevel(activity)
    }

    return analysis
  }

  calculateRiskScore(activity) {
    if (activity.length === 0) return 0
    // محاكاة تحليل المخاطر
    const recentActivities = activity.filter(a => 
      Date.now() - new Date(a.timestamp).getTime() < 24 * 60 * 60 * 1000
    )
    return Math.min(100, recentActivities.length * 5)
  }

  identifyBehaviorPattern(activity) {
    const patterns = []
    
    if (activity.length > 10) patterns.push('Highly Active')
    if (activity.some(a => a.type === 'nft_mint')) patterns.push('NFT Enthusiast')
    if (activity.some(a => a.type === 'governance')) patterns.push('Governance Participant')
    
    return patterns.length > 0 ? patterns : ['Normal User']
  }

  generateRecommendations(activity) {
    const recommendations = []
    
    if (activity.length < 5) {
      recommendations.push('Try exploring more dApps on Carv')
    }
    
    if (!activity.some(a => a.type === 'nft_mint')) {
      recommendations.push('Consider minting your first NFT')
    }
    
    if (!activity.some(a => a.type === 'staking')) {
      recommendations.push('Start staking to earn rewards')
    }
    
    return recommendations.length > 0 ? recommendations : ['Keep up the great activity!']
  }

  calculateTrustLevel(activity) {
    const score = this.calculateRiskScore(activity)
    if (score < 20) return 'High'
    if (score < 50) return 'Medium'
    return 'Low'
  }
}
