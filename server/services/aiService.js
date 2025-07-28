import axios from 'axios';

class AIService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
    this.baseURL = process.env.OPENROUTER_API_KEY 
      ? 'https://openrouter.ai/api/v1' 
      : 'https://api.openai.com/v1';
    this.model = process.env.AI_MODEL || 'openai/gpt-4o-mini';
  }

  async generateComponent(prompt, previousCode = null, chatHistory = []) {
    try {
      const systemPrompt = `You are an expert React component generator. Generate modern, functional React components with Tailwind CSS styling.

IMPORTANT RULES:
1. Return ONLY a JSON object with "jsx" and "css" properties
2. JSX should be a complete functional component that exports default
3. Use modern React hooks (useState, useEffect, etc.) when needed
4. Include TypeScript interfaces if using props
5. CSS should be Tailwind classes or custom CSS if needed
6. Make components responsive and accessible
7. Include proper error handling and loading states when appropriate
8. Do not include import statements for React or standard hooks
9. Component should be self-contained and work in isolation

Format your response as:
{
  "jsx": "export default function ComponentName() { return (<div>...</div>); }",
  "css": ".custom-class { color: red; }"
}`;

      const messages = [
        { role: 'system', content: systemPrompt }
      ];

      // Add relevant chat history (last 5 messages to keep context manageable)
      if (chatHistory.length > 0) {
        const recentHistory = chatHistory.slice(-5);
        messages.push(...recentHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })));
      }

      // Add current request
      if (previousCode) {
        messages.push({
          role: 'user',
          content: `Current component code: ${JSON.stringify(previousCode)}

User request: ${prompt}

Please modify the existing component based on the user's request.`
        });
      } else {
        messages.push({
          role: 'user',
          content: `Generate a React component: ${prompt}`
        });
      }

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...(this.baseURL.includes('openrouter') && {
              'HTTP-Referer': 'http://localhost:3000',
              'X-Title': 'Component Generator'
            })
          }
        }
      );

      const content = response.data.choices[0].message.content;
      
      // Try to extract JSON from the response
      let result;
      try {
        // Look for JSON in code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1]);
        } else {
          // Try to parse the entire content as JSON
          result = JSON.parse(content);
        }
      } catch (parseError) {
        // If JSON parsing fails, create a structured response
        console.warn('Failed to parse AI response as JSON, creating fallback structure');
        result = {
          jsx: `export default function GeneratedComponent() {
            return (
              <div className="p-4 bg-red-100 border border-red-400 rounded">
                <h2 className="text-red-800 font-bold">AI Response Parse Error</h2>
                <pre className="text-sm mt-2 text-red-700">${content.slice(0, 500)}...</pre>
              </div>
            );
          }`,
          css: ""
        };
      }

      return {
        jsx: result.jsx || '',
        css: result.css || ''
      };

    } catch (error) {
      console.error('AI Service Error:', error.response?.data || error.message);
      
      // Return fallback component on error
      return {
        jsx: `export default function ErrorComponent() {
          return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
              <h2 className="text-red-800 font-bold mb-2">AI Service Error</h2>
              <p className="text-red-700">
                Sorry, there was an error generating your component. Please try again.
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-red-600">Error Details</summary>
                <pre className="text-xs mt-1 text-red-500">${error.message}</pre>
              </details>
            </div>
          );
        }`,
        css: ""
      };
    }
  }

  async refineComponent(currentCode, refinementPrompt, chatHistory = []) {
    return this.generateComponent(refinementPrompt, currentCode, chatHistory);
  }
}

export default new AIService();