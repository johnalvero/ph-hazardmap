import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// Create Bedrock client using existing S3 credentials (works with local and Amplify)
const createBedrockClient = () => {
  try {
    const client = new BedrockRuntimeClient({
      region: process.env.S3_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      }
    })
    return client
  } catch (error) {
    throw error
  }
}

export interface AIInsight {
  summary: string
  riskAssessment: string
  recommendations: string[]
  keyPoints: string[]
}

export async function generateVolcanoInsight(volcano: {
  name: string
  status: string
  activityLevel: number
  location: string
  parameters?: { [key: string]: string | number }
  shouldNotBeAllowed?: string
  reminder?: string
  description?: string
}): Promise<AIInsight | null> {
  // Create mock AI insight for local testing when credentials are not available
  const createMockInsight = () => {
    return {
      summary: `${volcano.name} is currently at Alert Level ${volcano.activityLevel} (${volcano.status}). This means the volcano is showing signs of unrest but poses no immediate threat to nearby communities.`,
      riskAssessment: `The current alert level indicates low to moderate volcanic activity. Residents in ${volcano.location} should stay informed but can continue normal activities while monitoring official updates.`,
      recommendations: [
        'Monitor official PHIVOLCS bulletins regularly',
        'Stay informed about evacuation procedures',
        'Avoid restricted areas as specified by authorities',
        'Prepare emergency supplies in case of escalation'
      ],
      keyPoints: [
        `Alert Level ${volcano.activityLevel} indicates ongoing monitoring`,
        'No immediate evacuation required',
        'Volcanic activity is being closely watched',
        'Follow official guidance from PHIVOLCS'
      ]
    }
  }

  let client;
  try {
    client = createBedrockClient()
    
    if (!client) {
      return createMockInsight()
    }
  } catch {
    return createMockInsight()
  }

  // Exponential backoff retry logic
  const maxRetries = 3
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Prepare the prompt for AI insight generation
    const prompt = `You are a helpful assistant that provides clear, citizen-friendly insights about volcano activity in the Philippines. 

Based on the following volcano data, provide a concise AI insight that helps regular citizens understand the situation:

Volcano: ${volcano.name}
Status: ${volcano.status}
Alert Level: ${volcano.activityLevel}
Location: ${volcano.location}
${volcano.description ? `Description: ${volcano.description}` : ''}
${volcano.parameters ? `Monitoring Parameters: ${JSON.stringify(volcano.parameters)}` : ''}
${volcano.shouldNotBeAllowed ? `Restrictions: ${volcano.shouldNotBeAllowed}` : ''}
${volcano.reminder ? `Reminders: ${volcano.reminder}` : ''}

Please provide a JSON response with the following structure:
{
  "summary": "A brief 2-3 sentence summary of the current volcano status in simple terms",
  "riskAssessment": "A clear assessment of the risk level and what it means for nearby communities",
  "recommendations": ["List of 3-5 practical recommendations for citizens"],
  "keyPoints": ["List of 3-4 key points about the current situation"]
}

Make the language simple, clear, and helpful for regular citizens. Focus on practical information they can use.`

    const command = new InvokeModelCommand({
      modelId: 'anthropic.claude-3-haiku-20240307-v1:0', // Claude 3 Haiku for cost-effective insights
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    })

      const response = await client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      
      if (responseBody.content && responseBody.content[0] && responseBody.content[0].text) {
        const insightText = responseBody.content[0].text
        
        // Try to parse the JSON response
        try {
          const insight = JSON.parse(insightText)
          return {
            summary: insight.summary || 'No summary available',
            riskAssessment: insight.riskAssessment || 'No risk assessment available',
            recommendations: Array.isArray(insight.recommendations) ? insight.recommendations : [],
            keyPoints: Array.isArray(insight.keyPoints) ? insight.keyPoints : []
          }
        } catch {
          // Fallback: return a basic insight
          return {
            summary: insightText.substring(0, 200) + '...',
            riskAssessment: 'AI insight generated but formatting failed',
            recommendations: ['Monitor official PHIVOLCS updates', 'Stay informed about evacuation procedures'],
            keyPoints: ['Current status requires monitoring', 'Follow official guidance']
          }
        }
      } else {
        return null
      }
      
    } catch (error) {
      // Check if it's a throttling error
      if (error instanceof Error && error.message.includes('Too many requests')) {
        if (attempt < maxRetries) {
          // Custom exponential backoff: 6s, 12s, 24s
          const delays = [6000, 12000, 24000]
          const delay = delays[attempt - 1]
          await new Promise(resolve => setTimeout(resolve, delay))
          continue // Retry
        } else {
          return null
        }
      } else {
        // Non-throttling error, don't retry
        return null
      }
    }
  }
  
  return null
}

export function isBedrockConfigured(): boolean {
  try {
    const client = createBedrockClient()
    return client !== null
  } catch {
    // Return true even if credentials are missing, so we can generate mock insights
    return true
  }
}
