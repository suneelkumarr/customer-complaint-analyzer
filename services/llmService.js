const axios = require('axios');

class LLMService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.baseURL = 'https://openrouter.ai/api/v1';
    this.model = process.env.OPENROUTER_MODEL || 'qwen/qwen3-30b-a3b:free';
    this.siteUrl = process.env.SITE_URL || 'http://localhost:3000';
    this.siteName = process.env.SITE_NAME || 'Customer Complaint Analyzer';
    
    if (!this.apiKey) {
      console.warn('⚠️  OpenRouter API key not found. Please set OPENROUTER_API_KEY in your .env file');
    }
  }

  async analyzeComplaint(message) {
    if (!this.apiKey) {
      throw new Error('API key not configured');
    }

    const prompt = this.createAnalysisPrompt(message);
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert customer service analyst. Analyze customer complaints and provide structured responses in valid JSON format only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': this.siteUrl,
            'X-Title': this.siteName,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content.trim();
      
      // Log the raw response for debugging
      console.log('📄 Raw LLM Response:', content.substring(0, 200) + (content.length > 200 ? '...' : ''));
      
      // Multiple strategies to extract JSON from the response
      let analysis;
      
      try {
        // Strategy 1: Try parsing the entire content as JSON
        analysis = JSON.parse(content);
        console.log('✅ JSON parsed successfully (Strategy 1)');
      } catch (error) {
        try {
          // Strategy 2: Extract JSON between curly braces (greedy match)
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[0]);
            console.log('✅ JSON parsed successfully (Strategy 2)');
          } else {
            throw new Error('No JSON structure found');
          }
        } catch (error2) {
          try {
            // Strategy 3: Extract JSON between ```json blocks
            const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
            if (codeBlockMatch) {
              analysis = JSON.parse(codeBlockMatch[1]);
              console.log('✅ JSON parsed successfully (Strategy 3)');
            } else {
              // Strategy 4: Look for JSON-like structure and try to parse it
              const jsonLikeMatch = content.match(/\{\s*["']?summary["']?\s*:\s*["'][^"']*["'][^}]*\}/);
              if (jsonLikeMatch) {
                analysis = JSON.parse(jsonLikeMatch[0]);
                console.log('✅ JSON parsed successfully (Strategy 4)');
              } else {
                // Strategy 5: Fallback - create structured response from text
                console.warn('⚠️  Could not extract JSON, using text parsing fallback');
                analysis = this.parseTextResponse(content);
              }
            }
          } catch (error3) {
            console.warn('⚠️  All JSON extraction failed, using text parsing fallback');
            analysis = this.parseTextResponse(content);
          }
        }
      }
      
      // Validate the response structure
      this.validateAnalysis(analysis);
      
      return analysis;
      
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error('API key authentication failed');
      } else if (error.response?.status === 429) {
        throw new Error('Rate limit exceeded');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Network error: Unable to connect to LLM service');
      } else if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON response from LLM');
      }
      
      console.error('OpenRouter API Error:', error.response?.data || error.message);
      throw new Error(`LLM analysis failed: ${error.message}`);
    }
  }

  createAnalysisPrompt(message) {
    return `
Analyze the following customer message and return ONLY a valid JSON object with the exact structure shown below.

Customer Message: "${message}"

Return this exact JSON structure (replace the values with your analysis):
{
  "summary": "Brief summary of the complaint in 1-2 sentences",
  "category": "Choose ONE: Refund Issue, Delay, Account Access, Product Issue, Billing, Technical Support, Shipping, Service Quality, Other",
  "urgency": "Choose ONE: Low, Medium, High",
  "sentiment": "Choose ONE: Positive, Neutral, Negative"
}

Classification Guidelines:
- Summary: Concise explanation of the customer's main concern
- Category: Pick the most relevant category from the list above
- Urgency: 
  * High: Immediate action needed, customer very upset, financial/security issues
  * Medium: Important but not critical, moderate frustration
  * Low: General inquiries, minor issues, positive feedback
- Sentiment: Overall emotional tone (Positive/Neutral/Negative)

CRITICAL: Return ONLY the JSON object. No explanations, no markdown, no extra text.`;
  }

  parseTextResponse(content) {
    // Fallback method to extract information from text response
    const analysis = {
      summary: '',
      category: 'Other',
      urgency: 'Medium',
      sentiment: 'Neutral'
    };

    // Extract summary (look for patterns like "Summary:" or first sentence)
    const summaryMatch = content.match(/(?:summary|Summary)[:\s]*([^.\n]*\.?)/i);
    if (summaryMatch) {
      analysis.summary = summaryMatch[1].trim();
    } else {
      // Use first sentence as summary
      const sentences = content.split(/[.!?]+/);
      analysis.summary = sentences[0]?.trim() || 'Unable to generate summary';
    }

    // Extract category
    const categories = ['Refund Issue', 'Delay', 'Account Access', 'Product Issue', 'Billing', 'Technical Support', 'Shipping', 'Service Quality'];
    for (const cat of categories) {
      if (content.toLowerCase().includes(cat.toLowerCase())) {
        analysis.category = cat;
        break;
      }
    }

    // Extract urgency
    if (content.toLowerCase().includes('high') || content.toLowerCase().includes('urgent')) {
      analysis.urgency = 'High';
    } else if (content.toLowerCase().includes('low')) {
      analysis.urgency = 'Low';
    }

    // Extract sentiment
    if (content.toLowerCase().includes('positive') || content.toLowerCase().includes('happy') || content.toLowerCase().includes('satisfied')) {
      analysis.sentiment = 'Positive';
    } else if (content.toLowerCase().includes('negative') || content.toLowerCase().includes('frustrated') || content.toLowerCase().includes('angry')) {
      analysis.sentiment = 'Negative';
    }

    return analysis;
  }

  validateAnalysis(analysis) {
    const required = ['summary', 'category', 'urgency', 'sentiment'];
    const validCategories = ['Refund Issue', 'Delay', 'Account Access', 'Product Issue', 'Billing', 'Technical Support', 'Shipping', 'Service Quality', 'Other'];
    const validUrgency = ['Low', 'Medium', 'High'];
    const validSentiment = ['Positive', 'Neutral', 'Negative'];

    // Check required fields
    for (const field of required) {
      if (!analysis[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Validate enum values
    if (!validCategories.includes(analysis.category)) {
      analysis.category = 'Other'; // Fallback for invalid category
    }
    
    if (!validUrgency.includes(analysis.urgency)) {
      analysis.urgency = 'Medium'; // Fallback for invalid urgency
    }
    
    if (!validSentiment.includes(analysis.sentiment)) {
      analysis.sentiment = 'Neutral'; // Fallback for invalid sentiment
    }

    // Ensure summary is reasonable length
    if (analysis.summary.length > 500) {
      analysis.summary = analysis.summary.substring(0, 497) + '...';
    }
  }
}

const llmService = new LLMService();

const analyzeComplaint = async (message) => {
  return await llmService.analyzeComplaint(message);
};

module.exports = { analyzeComplaint };