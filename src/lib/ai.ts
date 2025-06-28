interface ChutesAIConfig {
  apiKey: string;
  baseUrl?: string;
}

interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class ChutesAI {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ChutesAIConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://llm.chutes.ai/v1';
  }

  async chat(messages: AIMessage[], options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {}): Promise<AIResponse> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: options.model || 'deepseek-ai/DeepSeek-V3-0324',
        messages,
        stream: options.stream || false,
        max_tokens: options.maxTokens || 2048,
        temperature: options.temperature || 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      content: data.choices[0]?.message?.content || '',
      usage: data.usage,
    };
  }

  async generateContent(prompt: string, context?: string): Promise<string> {
    const messages: AIMessage[] = [
      {
        role: 'system',
        content: 'You are an advanced AI educational assistant with expertise in all academic subjects. Provide comprehensive, accurate, and pedagogically sound responses. Always structure your answers clearly and include examples when helpful.'
      }
    ];

    if (context) {
      messages.push({
        role: 'system',
        content: `Context: ${context}`
      });
    }

    messages.push({
      role: 'user',
      content: prompt
    });

    const response = await this.chat(messages);
    return response.content;
  }

  async generateCourseContent(courseTitle: string, level: string, objectives: string[]): Promise<{
    syllabus: any[];
    lessons: any[];
    assessments: any[];
  }> {
    const prompt = `
      Create comprehensive course content for: "${courseTitle}"
      Level: ${level}
      Learning Objectives: ${objectives.join(', ')}
      
      Generate:
      1. A detailed 12-week syllabus with weekly topics and activities
      2. 5 sample lesson outlines with learning objectives and content structure
      3. 3 assessment ideas (assignments, quizzes, projects) with rubrics
      
      Format as JSON with syllabus, lessons, and assessments arrays.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        syllabus: [],
        lessons: [],
        assessments: []
      };
    }
  }

  async gradeAssignment(assignment: string, studentResponse: string, rubric?: any): Promise<{
    score: number;
    percentage: number;
    letterGrade: string;
    feedback: string;
    rubricScores: any[];
    suggestions: string[];
    strengths: string[];
    improvements: string[];
  }> {
    const prompt = `
      Grade this assignment submission:
      
      Assignment: ${assignment}
      Student Response: ${studentResponse}
      ${rubric ? `Rubric: ${JSON.stringify(rubric)}` : ''}
      
      Provide detailed grading with:
      1. Numerical score and percentage
      2. Letter grade (A-F scale)
      3. Comprehensive feedback
      4. Rubric breakdown if provided
      5. Specific suggestions for improvement
      6. Identified strengths
      7. Areas needing improvement
      
      Format as JSON with all fields.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      const result = JSON.parse(response);
      return {
        score: result.score || 0,
        percentage: result.percentage || 0,
        letterGrade: result.letterGrade || 'F',
        feedback: result.feedback || 'Unable to provide feedback',
        rubricScores: result.rubricScores || [],
        suggestions: result.suggestions || [],
        strengths: result.strengths || [],
        improvements: result.improvements || []
      };
    } catch {
      return {
        score: 0,
        percentage: 0,
        letterGrade: 'F',
        feedback: 'Unable to process grading automatically',
        rubricScores: [],
        suggestions: ['Please review with instructor'],
        strengths: [],
        improvements: []
      };
    }
  }

  async createQuiz(topic: string, difficulty: 'easy' | 'medium' | 'hard', questionCount: number = 10): Promise<{
    questions: Array<{
      id: string;
      type: string;
      question: string;
      options?: string[];
      correctAnswer: string | string[];
      explanation: string;
      points: number;
      difficulty: string;
      tags: string[];
    }>;
  }> {
    const prompt = `
      Create a comprehensive ${difficulty} level quiz about "${topic}" with ${questionCount} questions.
      
      Include variety of question types:
      - Multiple choice (4 options each)
      - True/False
      - Short answer
      - Fill in the blank
      
      For each question, provide:
      - Unique ID
      - Question type
      - Question text
      - Options (for multiple choice)
      - Correct answer(s)
      - Detailed explanation
      - Point value (1-5 based on difficulty)
      - Difficulty level
      - Relevant tags
      
      Format as JSON with questions array.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      const result = JSON.parse(response);
      return {
        questions: result.questions.map((q: any, index: number) => ({
          id: crypto.randomUUID(),
          type: q.type || 'multiple_choice',
          question: q.question || `Question ${index + 1}`,
          options: q.options || [],
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          points: q.points || 1,
          difficulty: q.difficulty || difficulty,
          tags: q.tags || [topic]
        }))
      };
    } catch {
      return {
        questions: [{
          id: crypto.randomUUID(),
          type: 'multiple_choice',
          question: 'Sample question could not be generated',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswer: 'Option A',
          explanation: 'Please try again',
          points: 1,
          difficulty: difficulty,
          tags: [topic]
        }]
      };
    }
  }

  async generateStudyPlan(goals: string, timeframe: string, currentLevel: string, subjects: string[]): Promise<{
    plan: Array<{
      week: number;
      title: string;
      objectives: string[];
      topics: string[];
      activities: string[];
      resources: string[];
      assessments: string[];
      timeAllocation: Record<string, number>;
    }>;
    milestones: Array<{
      week: number;
      title: string;
      description: string;
      criteria: string[];
    }>;
  }> {
    const prompt = `
      Create a comprehensive personalized study plan:
      
      Goals: ${goals}
      Timeframe: ${timeframe}
      Current Level: ${currentLevel}
      Subjects: ${subjects.join(', ')}
      
      Generate a detailed week-by-week study plan with:
      1. Weekly objectives and topics
      2. Specific learning activities
      3. Recommended resources
      4. Assessment checkpoints
      5. Time allocation per subject
      6. Major milestones and criteria
      
      Format as JSON with plan and milestones arrays.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        plan: [{
          week: 1,
          title: 'Getting Started',
          objectives: ['Establish study routine', 'Review fundamentals'],
          topics: ['Foundation concepts'],
          activities: ['Read course materials', 'Complete practice exercises'],
          resources: ['Course textbook', 'Online resources'],
          assessments: ['Self-assessment quiz'],
          timeAllocation: { study: 10, practice: 5, review: 2 }
        }],
        milestones: [{
          week: 4,
          title: 'First Milestone',
          description: 'Complete foundation phase',
          criteria: ['Pass assessment', 'Demonstrate understanding']
        }]
      };
    }
  }

  async detectPlagiarism(text: string, sources: string[] = []): Promise<{
    score: number;
    risk: 'low' | 'medium' | 'high';
    matches: Array<{
      source: string;
      similarity: number;
      excerpt: string;
      startIndex: number;
      endIndex: number;
    }>;
    analysis: {
      originalityScore: number;
      commonPhrases: string[];
      suspiciousPatterns: string[];
      recommendations: string[];
    };
  }> {
    const prompt = `
      Analyze this text for potential plagiarism and originality:
      
      Text: ${text}
      ${sources.length > 0 ? `Known Sources: ${sources.join('\n')}` : ''}
      
      Provide:
      1. Plagiarism risk score (0-100)
      2. Risk level (low/medium/high)
      3. Specific matches if found
      4. Originality analysis
      5. Common phrases that might be problematic
      6. Suspicious patterns
      7. Recommendations for improvement
      
      Format as JSON with all fields.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      const result = JSON.parse(response);
      return {
        score: result.score || 0,
        risk: result.risk || 'low',
        matches: result.matches || [],
        analysis: result.analysis || {
          originalityScore: 100,
          commonPhrases: [],
          suspiciousPatterns: [],
          recommendations: []
        }
      };
    } catch {
      return {
        score: 0,
        risk: 'low',
        matches: [],
        analysis: {
          originalityScore: 100,
          commonPhrases: [],
          suspiciousPatterns: [],
          recommendations: ['Unable to analyze automatically']
        }
      };
    }
  }

  async generateLessonPlan(topic: string, duration: number, level: string, objectives: string[]): Promise<{
    title: string;
    overview: string;
    objectives: string[];
    materials: string[];
    activities: Array<{
      name: string;
      duration: number;
      description: string;
      type: string;
    }>;
    assessment: {
      formative: string[];
      summative: string[];
    };
    homework: string[];
    resources: string[];
  }> {
    const prompt = `
      Create a detailed lesson plan for:
      
      Topic: ${topic}
      Duration: ${duration} minutes
      Level: ${level}
      Learning Objectives: ${objectives.join(', ')}
      
      Include:
      1. Lesson title and overview
      2. Detailed learning objectives
      3. Required materials
      4. Step-by-step activities with timing
      5. Assessment strategies (formative and summative)
      6. Homework assignments
      7. Additional resources
      
      Format as JSON with all sections.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        title: topic,
        overview: 'Lesson plan could not be generated automatically',
        objectives: objectives,
        materials: ['Course materials'],
        activities: [{
          name: 'Introduction',
          duration: 10,
          description: 'Introduce the topic',
          type: 'lecture'
        }],
        assessment: {
          formative: ['Class discussion'],
          summative: ['Quiz']
        },
        homework: ['Review materials'],
        resources: ['Course textbook']
      };
    }
  }

  async provideFeedback(studentWork: string, assignmentCriteria: string): Promise<{
    overallFeedback: string;
    strengths: string[];
    improvements: string[];
    specificComments: Array<{
      section: string;
      comment: string;
      suggestion: string;
    }>;
    grade: {
      score: number;
      justification: string;
    };
  }> {
    const prompt = `
      Provide comprehensive feedback on this student work:
      
      Student Work: ${studentWork}
      Assignment Criteria: ${assignmentCriteria}
      
      Provide:
      1. Overall constructive feedback
      2. Specific strengths identified
      3. Areas for improvement
      4. Section-by-section comments with suggestions
      5. Suggested grade with justification
      
      Format as JSON with all sections.
    `;

    const response = await this.generateContent(prompt);
    
    try {
      return JSON.parse(response);
    } catch {
      return {
        overallFeedback: 'Unable to provide detailed feedback automatically',
        strengths: ['Submission completed'],
        improvements: ['Please review with instructor'],
        specificComments: [],
        grade: {
          score: 0,
          justification: 'Manual review required'
        }
      };
    }
  }
}

export default ChutesAI;
export type { AIMessage, AIResponse, ChutesAIConfig };