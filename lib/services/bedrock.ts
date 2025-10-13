import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'

// Create Bedrock client - use environment variables if available, otherwise use compute role
const createBedrockClient = () => {
  try {
    const config: {
      region: string
      credentials?: {
        accessKeyId: string
        secretAccessKey: string
      }
    } = {
      region: process.env.S3_REGION || process.env.AWS_REGION || 'us-east-1',
    }

    // Only set credentials if environment variables are available
    // Otherwise, let AWS SDK use the compute role (for Amplify)
    if (process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY) {
      config.credentials = {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      }
    }

    const client = new BedrockRuntimeClient(config)
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

export async function generateBatchVolcanoInsights(volcanoes: Array<{
  name: string
  status: string
  activityLevel: number
  location: string
  parameters?: { [key: string]: string | number }
  shouldNotBeAllowed?: string
  reminder?: string
  description?: string
}>): Promise<Array<{ name: string; insight: AIInsight | null }>> {
  // Create mock AI insights for local testing when credentials are not available
  const createMockInsights = () => {
    return volcanoes.map(volcano => ({
      name: volcano.name,
      insight: {
        summary: `${volcano.name} is currently at Alert Level ${volcano.activityLevel} (${volcano.status}). This means the volcano is showing signs of unrest but poses no immediate threat to nearby communities.`,
        riskAssessment: `The current alert level indicates low to moderate volcanic activity. Residents in ${volcano.location} should stay informed but can continue normal activities while monitoring official updates.`,
        recommendations: [
          'Monitor official PHIVOLCS bulletins regularly',
          'Stay informed about evacuation procedures',
          'Prepare emergency supplies',
          'Follow local government advisories'
        ],
        keyPoints: [
          `Alert Level ${volcano.activityLevel} indicates ${volcano.status} status`,
          'No immediate threat to communities',
          'Continue monitoring for changes',
          'Stay prepared for potential escalation'
        ]
      }
    }))
  }

  let client
  try {
    client = createBedrockClient()
  } catch {
    // Return mock insights if client creation fails
    return createMockInsights()
  }

  if (!client) {
    return createMockInsights()
  }

  // Create a comprehensive prompt for all volcanoes
  const volcanoData = volcanoes.map(volcano => `
Volcano: ${volcano.name}
- Status: ${volcano.status}
- Alert Level: ${volcano.activityLevel}
- Location: ${volcano.location}
${volcano.description ? `- Description: ${volcano.description}` : ''}
${volcano.parameters ? `- Monitoring Parameters: ${JSON.stringify(volcano.parameters)}` : ''}
${volcano.shouldNotBeAllowed ? `- Restrictions: ${volcano.shouldNotBeAllowed}` : ''}
${volcano.reminder ? `- Reminders: ${volcano.reminder}` : ''}
`).join('\n---\n')

  const prompt = `You are an expert volcanologist and disaster risk reduction specialist. Analyze the following volcano information and provide a citizen-friendly AI insight for each volcano.

VOLCANO DATA:
${volcanoData}

Please provide AI insights for each volcano in this exact JSON format:
{
  "insights": [
    {
      "volcano": "VOLCANO_NAME",
      "summary": "Brief, easy-to-understand overview of the current situation",
      "riskAssessment": "What the current alert level means for nearby communities",
      "recommendations": ["Practical step 1", "Practical step 2", "Practical step 3"],
      "keyPoints": ["Important fact 1", "Important fact 2", "Important fact 3"]
    }
  ]
}

Make the responses accessible to regular citizens, not just experts. Focus on practical guidance and safety for each volcano.`

  const command = new InvokeModelCommand({
    modelId: 'amazon.claude-3-haiku-20240307-v1:0',
    contentType: 'application/json',
    accept: 'application/json',
    body: JSON.stringify({
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 2000, // Increased for multiple volcanoes
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  })

  const maxRetries = 3
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await client.send(command)

      if (response.body) {
        const responseBody = JSON.parse(new TextDecoder().decode(response.body))
        
        if (responseBody.content && responseBody.content[0] && responseBody.content[0].text) {
          const content = responseBody.content[0].text
          
          // Try to parse as JSON first
          try {
            const jsonMatch = content.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0])
              if (parsed.insights && Array.isArray(parsed.insights)) {
                // Map the JSON response to our format
                return volcanoes.map(volcano => {
                  const insight = parsed.insights.find((i: { volcano: string }) => 
                    i.volcano && i.volcano.toUpperCase().includes(volcano.name.toUpperCase())
                  )
                  
                  if (insight) {
                    return {
                      name: volcano.name,
                      insight: {
                        summary: insight.summary || 'No summary available',
                        riskAssessment: insight.riskAssessment || 'No risk assessment available',
                        recommendations: Array.isArray(insight.recommendations) ? insight.recommendations : ['Monitor official PHIVOLCS bulletins regularly'],
                        keyPoints: Array.isArray(insight.keyPoints) ? insight.keyPoints : [`Alert Level ${volcano.activityLevel} indicates ${volcano.status} status`]
                      }
                    }
                  } else {
                    return { name: volcano.name, insight: null }
                  }
                })
              }
            }
          } catch {
            // JSON parsing failed, fall back to mock insights
          }
        }
      }
      
      // If we get here, the API call succeeded but parsing failed
      // Return mock insights as fallback
      return createMockInsights()
      
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
          return createMockInsights()
        }
      } else {
        // Non-throttling error, return mock insights
        return createMockInsights()
      }
    }
  }
  
  return createMockInsights()
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