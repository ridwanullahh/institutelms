import { SchemaDefinition } from './sdk';

export const platformSchemas: Record<string, SchemaDefinition> = {
  users: {
    required: ['email', 'firstName', 'lastName', 'role'],
    types: {
      id: 'string',
      uid: 'string',
      email: 'string',
      password: 'string',
      firstName: 'string',
      lastName: 'string',
      role: 'string',
      avatar: 'string',
      bio: 'string',
      phone: 'string',
      address: 'string',
      dateOfBirth: 'string',
      gender: 'string',
      nationality: 'string',
      emergencyContact: 'object',
      academicInfo: 'object',
      financialInfo: 'object',
      preferences: 'object',
      status: 'string',
      verified: 'boolean',
      lastLogin: 'string',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      role: 'student',
      preferences: {
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        notifications: {
          email: true,
          push: true,
          sms: false
        }
      },
      status: 'active',
      verified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  courses: {
    required: ['title', 'code', 'instructorId', 'category', 'level', 'credits'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      description: 'string',
      code: 'string',
      instructorId: 'string',
      instructorName: 'string',
      category: 'string',
      department: 'string',
      level: 'string',
      credits: 'number',
      duration: 'number',
      maxStudents: 'number',
      currentEnrollment: 'number',
      prerequisites: 'array',
      corequisites: 'array',
      learningObjectives: 'array',
      syllabus: 'array',
      schedule: 'array',
      assessmentStructure: 'object',
      resources: 'array',
      thumbnail: 'string',
      tags: 'array',
      price: 'number',
      currency: 'string',
      language: 'string',
      difficulty: 'string',
      rating: 'number',
      reviewCount: 'number',
      status: 'string',
      startDate: 'date',
      endDate: 'date',
      enrollmentDeadline: 'date',
      forumId: 'string',
      studyGroupId: 'string',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      currentEnrollment: 0,
      prerequisites: [],
      corequisites: [],
      learningObjectives: [],
      syllabus: [],
      schedule: [],
      resources: [],
      tags: [],
      price: 0,
      currency: 'USD',
      language: 'en',
      difficulty: 'beginner',
      rating: 0,
      reviewCount: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  lessons: {
    required: ['title', 'courseId', 'content', 'contentType'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      moduleId: 'string',
      title: 'string',
      description: 'string',
      content: 'string',
      contentType: 'string',
      duration: 'number',
      order: 'number',
      videoUrl: 'string',
      videoTranscript: 'string',
      resources: 'array',
      quiz: 'object',
      assignment: 'object',
      prerequisites: 'array',
      learningObjectives: 'array',
      tags: 'array',
      difficulty: 'string',
      isPreview: 'boolean',
      published: 'boolean',
      interactiveElements: 'array',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      contentType: 'text',
      duration: 0,
      order: 0,
      resources: [],
      prerequisites: [],
      learningObjectives: [],
      tags: [],
      difficulty: 'easy',
      isPreview: false,
      published: false,
      interactiveElements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  enrollments: {
    required: ['studentId', 'courseId'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      courseId: 'string',
      enrolledAt: 'date',
      status: 'string',
      progress: 'number',
      grade: 'number',
      letterGrade: 'string',
      completedLessons: 'array',
      completedAssignments: 'array',
      completedQuizzes: 'array',
      lastAccessedAt: 'date',
      certificateIssued: 'boolean',
      certificateUrl: 'string',
      withdrawalReason: 'string',
      withdrawalDate: 'date',
      refundAmount: 'number',
      refundStatus: 'string'
    },
    defaults: {
      status: 'active',
      progress: 0,
      completedLessons: [],
      completedAssignments: [],
      completedQuizzes: [],
      certificateIssued: false,
      enrolledAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString()
    }
  },

  transcripts: {
    required: ['studentId', 'academicYear'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      academicYear: 'string',
      semester: 'string',
      courses: 'array',
      gpa: 'number',
      cumulativeGPA: 'number',
      totalCredits: 'number',
      cumulativeCredits: 'number',
      academicStanding: 'string',
      honors: 'array',
      degreeProgress: 'object',
      isOfficial: 'boolean',
      issuedAt: 'date',
      issuedBy: 'string',
      verificationCode: 'string'
    },
    defaults: {
      gpa: 0,
      cumulativeGPA: 0,
      totalCredits: 0,
      cumulativeCredits: 0,
      academicStanding: 'good',
      honors: [],
      isOfficial: false,
      verificationCode: crypto.randomUUID(),
      issuedAt: new Date().toISOString()
    }
  },

  degreePlans: {
    required: ['studentId', 'degreeType', 'major'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      degreeType: 'string',
      major: 'string',
      minor: 'string',
      concentration: 'string',
      requiredCourses: 'array',
      electiveCourses: 'array',
      completedCourses: 'array',
      plannedCourses: 'array',
      totalCreditsRequired: 'number',
      creditsCompleted: 'number',
      expectedGraduation: 'date',
      advisorId: 'string',
      status: 'string',
      lastUpdated: 'date'
    },
    defaults: {
      requiredCourses: [],
      electiveCourses: [],
      completedCourses: [],
      plannedCourses: [],
      totalCreditsRequired: 120,
      creditsCompleted: 0,
      status: 'active',
      lastUpdated: new Date().toISOString()
    }
  },

  creditTransfers: {
    required: ['studentId', 'fromInstitution', 'courseName'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      fromInstitution: 'string',
      courseName: 'string',
      courseCode: 'string',
      credits: 'number',
      grade: 'string',
      equivalentCourseId: 'string',
      equivalentCourseName: 'string',
      status: 'string',
      evaluatedBy: 'string',
      evaluatedAt: 'date',
      documents: 'array',
      notes: 'string'
    },
    defaults: {
      status: 'pending',
      documents: [],
      evaluatedAt: new Date().toISOString()
    }
  },

  tuitionRecords: {
    required: ['studentId', 'academicYear', 'semester'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      academicYear: 'string',
      semester: 'string',
      tuitionAmount: 'number',
      fees: 'array',
      totalAmount: 'number',
      paidAmount: 'number',
      balance: 'number',
      dueDate: 'date',
      status: 'string',
      paymentPlan: 'object',
      transactions: 'array'
    },
    defaults: {
      tuitionAmount: 0,
      fees: [],
      totalAmount: 0,
      paidAmount: 0,
      balance: 0,
      status: 'pending',
      transactions: []
    }
  },

  financialAid: {
    required: ['studentId', 'aidType', 'amount'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      aidType: 'string',
      amount: 'number',
      source: 'string',
      academicYear: 'string',
      semester: 'string',
      status: 'string',
      requirements: 'array',
      disbursements: 'array',
      conditions: 'array',
      renewalCriteria: 'object',
      applicationDate: 'date',
      awardDate: 'date'
    },
    defaults: {
      status: 'pending',
      requirements: [],
      disbursements: [],
      conditions: [],
      applicationDate: new Date().toISOString()
    }
  },

  payments: {
    required: ['studentId', 'amount', 'type'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      amount: 'number',
      type: 'string',
      method: 'string',
      status: 'string',
      transactionId: 'string',
      reference: 'string',
      description: 'string',
      dueDate: 'date',
      paidDate: 'date',
      refundAmount: 'number',
      refundDate: 'date',
      metadata: 'object'
    },
    defaults: {
      status: 'pending',
      metadata: {},
      paidDate: new Date().toISOString()
    }
  },

  accreditationReports: {
    required: ['reportType', 'academicYear'],
    types: {
      id: 'string',
      uid: 'string',
      reportType: 'string',
      academicYear: 'string',
      data: 'object',
      metrics: 'object',
      compliance: 'object',
      recommendations: 'array',
      status: 'string',
      submittedBy: 'string',
      submittedAt: 'date',
      reviewedBy: 'string',
      reviewedAt: 'date'
    },
    defaults: {
      data: {},
      metrics: {},
      compliance: {},
      recommendations: [],
      status: 'draft',
      submittedAt: new Date().toISOString()
    }
  },

  retentionAnalytics: {
    required: ['cohort', 'academicYear'],
    types: {
      id: 'string',
      uid: 'string',
      cohort: 'string',
      academicYear: 'string',
      totalStudents: 'number',
      retainedStudents: 'number',
      retentionRate: 'number',
      dropoutReasons: 'array',
      interventions: 'array',
      riskFactors: 'array',
      successFactors: 'array',
      demographics: 'object',
      calculatedAt: 'date'
    },
    defaults: {
      totalStudents: 0,
      retainedStudents: 0,
      retentionRate: 0,
      dropoutReasons: [],
      interventions: [],
      riskFactors: [],
      successFactors: [],
      demographics: {},
      calculatedAt: new Date().toISOString()
    }
  },

  facultyPerformance: {
    required: ['facultyId', 'academicYear'],
    types: {
      id: 'string',
      uid: 'string',
      facultyId: 'string',
      academicYear: 'string',
      teachingLoad: 'number',
      studentEvaluations: 'object',
      courseCompletionRates: 'object',
      researchOutput: 'array',
      serviceActivities: 'array',
      professionalDevelopment: 'array',
      overallRating: 'number',
      goals: 'array',
      achievements: 'array',
      evaluatedBy: 'string',
      evaluatedAt: 'date'
    },
    defaults: {
      teachingLoad: 0,
      studentEvaluations: {},
      courseCompletionRates: {},
      researchOutput: [],
      serviceActivities: [],
      professionalDevelopment: [],
      overallRating: 0,
      goals: [],
      achievements: [],
      evaluatedAt: new Date().toISOString()
    }
  },

  resourceUtilization: {
    required: ['resourceType', 'period'],
    types: {
      id: 'string',
      uid: 'string',
      resourceType: 'string',
      resourceId: 'string',
      period: 'string',
      utilizationRate: 'number',
      capacity: 'number',
      actualUsage: 'number',
      peakUsage: 'number',
      efficiency: 'number',
      cost: 'number',
      revenue: 'number',
      roi: 'number',
      recommendations: 'array',
      calculatedAt: 'date'
    },
    defaults: {
      utilizationRate: 0,
      capacity: 0,
      actualUsage: 0,
      peakUsage: 0,
      efficiency: 0,
      cost: 0,
      revenue: 0,
      roi: 0,
      recommendations: [],
      calculatedAt: new Date().toISOString()
    }
  },

  libraryResources: {
    required: ['title', 'type', 'isbn'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      author: 'string',
      type: 'string',
      isbn: 'string',
      publisher: 'string',
      publicationDate: 'date',
      category: 'string',
      subjects: 'array',
      description: 'string',
      location: 'string',
      status: 'string',
      digitalUrl: 'string',
      accessLevel: 'string',
      checkoutHistory: 'array',
      reservations: 'array',
      reviews: 'array',
      rating: 'number',
      addedBy: 'string',
      addedAt: 'date'
    },
    defaults: {
      subjects: [],
      status: 'available',
      accessLevel: 'public',
      checkoutHistory: [],
      reservations: [],
      reviews: [],
      rating: 0,
      addedAt: new Date().toISOString()
    }
  },

  assignments: {
    required: ['title', 'courseId', 'instructions', 'type', 'maxPoints', 'dueDate'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      lessonId: 'string',
      title: 'string',
      description: 'string',
      instructions: 'string',
      type: 'string',
      maxPoints: 'number',
      passingScore: 'number',
      timeLimit: 'number',
      attempts: 'number',
      dueDate: 'date',
      lateSubmissionPenalty: 'number',
      allowLateSubmission: 'boolean',
      rubric: 'array',
      resources: 'array',
      submissionFormat: 'array',
      plagiarismCheck: 'boolean',
      aiGradingEnabled: 'boolean',
      peerReviewEnabled: 'boolean',
      groupAssignment: 'boolean',
      maxGroupSize: 'number',
      published: 'boolean',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      type: 'essay',
      passingScore: 60,
      attempts: 1,
      lateSubmissionPenalty: 10,
      allowLateSubmission: true,
      rubric: [],
      resources: [],
      submissionFormat: ['pdf', 'doc', 'docx'],
      plagiarismCheck: true,
      aiGradingEnabled: true,
      peerReviewEnabled: false,
      groupAssignment: false,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  submissions: {
    required: ['assignmentId', 'studentId', 'content'],
    types: {
      id: 'string',
      uid: 'string',
      assignmentId: 'string',
      studentId: 'string',
      studentName: 'string',
      content: 'string',
      attachments: 'array',
      submittedAt: 'date',
      status: 'string',
      grade: 'number',
      feedback: 'string',
      rubricScores: 'array',
      plagiarismScore: 'number',
      aiAnalysis: 'object',
      gradedBy: 'string',
      gradedAt: 'date',
      attempt: 'number',
      timeSpent: 'number'
    },
    defaults: {
      attachments: [],
      status: 'submitted',
      attempt: 1,
      submittedAt: new Date().toISOString()
    }
  },

  quizzes: {
    required: ['title', 'courseId', 'questions', 'timeLimit'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      lessonId: 'string',
      title: 'string',
      description: 'string',
      instructions: 'string',
      questions: 'array',
      timeLimit: 'number',
      attempts: 'number',
      passingScore: 'number',
      randomizeQuestions: 'boolean',
      showCorrectAnswers: 'boolean',
      showScoreImmediately: 'boolean',
      availableFrom: 'date',
      availableUntil: 'date',
      published: 'boolean',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      attempts: 1,
      passingScore: 70,
      randomizeQuestions: false,
      showCorrectAnswers: true,
      showScoreImmediately: true,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  quizAttempts: {
    required: ['quizId', 'studentId'],
    types: {
      id: 'string',
      uid: 'string',
      quizId: 'string',
      studentId: 'string',
      answers: 'array',
      score: 'number',
      maxScore: 'number',
      percentage: 'number',
      timeSpent: 'number',
      startedAt: 'date',
      completedAt: 'date',
      status: 'string'
    },
    defaults: {
      answers: [],
      score: 0,
      maxScore: 0,
      percentage: 0,
      timeSpent: 0,
      status: 'in_progress',
      startedAt: new Date().toISOString()
    }
  },

  discussions: {
    required: ['title', 'content', 'courseId', 'authorId'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      authorId: 'string',
      authorName: 'string',
      authorAvatar: 'string',
      title: 'string',
      content: 'string',
      category: 'string',
      tags: 'array',
      isPinned: 'boolean',
      isLocked: 'boolean',
      views: 'number',
      likes: 'number',
      replies: 'array',
      attachments: 'array',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      category: 'general',
      tags: [],
      isPinned: false,
      isLocked: false,
      views: 0,
      likes: 0,
      replies: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  announcements: {
    required: ['title', 'content', 'authorId'],
    types: {
      id: 'string',
      uid: 'string',
      authorId: 'string',
      authorName: 'string',
      title: 'string',
      content: 'string',
      type: 'string',
      targetAudience: 'string',
      courseId: 'string',
      priority: 'string',
      scheduledFor: 'date',
      expiresAt: 'date',
      attachments: 'array',
      readBy: 'array',
      published: 'boolean',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      type: 'general',
      targetAudience: 'all',
      priority: 'medium',
      attachments: [],
      readBy: [],
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  events: {
    required: ['title', 'startDate', 'endDate', 'organizerId'],
    types: {
      id: 'string',
      uid: 'string',
      title: 'string',
      description: 'string',
      type: 'string',
      startDate: 'date',
      endDate: 'date',
      location: 'string',
      isOnline: 'boolean',
      meetingUrl: 'string',
      courseId: 'string',
      organizerId: 'string',
      attendees: 'array',
      isRecurring: 'boolean',
      recurrenceRule: 'string',
      reminders: 'array',
      status: 'string',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      type: 'event',
      isOnline: false,
      attendees: [],
      isRecurring: false,
      reminders: [],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  grades: {
    required: ['studentId', 'courseId', 'type', 'score', 'maxScore'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      courseId: 'string',
      assignmentId: 'string',
      quizId: 'string',
      type: 'string',
      score: 'number',
      maxScore: 'number',
      percentage: 'number',
      letterGrade: 'string',
      feedback: 'string',
      gradedBy: 'string',
      gradedAt: 'date',
      isExcused: 'boolean',
      isLate: 'boolean',
      latePenalty: 'number'
    },
    defaults: {
      isExcused: false,
      isLate: false,
      gradedAt: new Date().toISOString()
    }
  },

  notifications: {
    required: ['userId', 'type', 'title', 'message'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      type: 'string',
      title: 'string',
      message: 'string',
      data: 'object',
      isRead: 'boolean',
      priority: 'string',
      scheduledFor: 'date',
      expiresAt: 'date',
      createdAt: 'date'
    },
    defaults: {
      data: {},
      isRead: false,
      priority: 'medium',
      createdAt: new Date().toISOString()
    }
  },

  messages: {
    required: ['senderId', 'recipientId', 'subject', 'content'],
    types: {
      id: 'string',
      uid: 'string',
      senderId: 'string',
      senderName: 'string',
      recipientId: 'string',
      recipientName: 'string',
      subject: 'string',
      content: 'string',
      attachments: 'array',
      isRead: 'boolean',
      isStarred: 'boolean',
      isArchived: 'boolean',
      parentId: 'string',
      threadId: 'string',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      attachments: [],
      isRead: false,
      isStarred: false,
      isArchived: false,
      threadId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  analytics: {
    required: ['userId', 'event', 'timestamp'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      courseId: 'string',
      event: 'string',
      data: 'object',
      timestamp: 'date',
      sessionId: 'string',
      ipAddress: 'string',
      userAgent: 'string',
      deviceInfo: 'object'
    },
    defaults: {
      data: {},
      deviceInfo: {},
      timestamp: new Date().toISOString()
    }
  },

  liveSessions: {
    required: ['courseId', 'instructorId', 'title', 'scheduledStart', 'scheduledEnd'],
    types: {
      id: 'string',
      uid: 'string',
      courseId: 'string',
      instructorId: 'string',
      title: 'string',
      description: 'string',
      scheduledStart: 'date',
      scheduledEnd: 'date',
      actualStart: 'date',
      actualEnd: 'date',
      status: 'string',
      meetingUrl: 'string',
      recordingUrl: 'string',
      attendees: 'array',
      maxAttendees: 'number',
      isRecorded: 'boolean',
      chatEnabled: 'boolean',
      screenShareEnabled: 'boolean',
      whiteboardEnabled: 'boolean',
      pollsEnabled: 'boolean',
      breakoutRoomsEnabled: 'boolean',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      status: 'scheduled',
      attendees: [],
      maxAttendees: 100,
      isRecorded: true,
      chatEnabled: true,
      screenShareEnabled: true,
      whiteboardEnabled: true,
      pollsEnabled: true,
      breakoutRoomsEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  certificates: {
    required: ['studentId', 'courseId', 'courseName', 'studentName', 'completionDate'],
    types: {
      id: 'string',
      uid: 'string',
      studentId: 'string',
      courseId: 'string',
      courseName: 'string',
      studentName: 'string',
      instructorName: 'string',
      completionDate: 'date',
      grade: 'string',
      certificateUrl: 'string',
      verificationCode: 'string',
      issuedAt: 'date'
    },
    defaults: {
      verificationCode: crypto.randomUUID(),
      issuedAt: new Date().toISOString()
    }
  },

  studyGroups: {
    required: ['name', 'courseId', 'creatorId'],
    types: {
      id: 'string',
      uid: 'string',
      name: 'string',
      description: 'string',
      courseId: 'string',
      creatorId: 'string',
      members: 'array',
      maxMembers: 'number',
      isPrivate: 'boolean',
      meetingSchedule: 'string',
      meetingUrl: 'string',
      resources: 'array',
      discussions: 'array',
      createdAt: 'date',
      updatedAt: 'date'
    },
    defaults: {
      members: [],
      maxMembers: 10,
      isPrivate: false,
      resources: [],
      discussions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  },

  aiTutorSessions: {
    required: ['userId', 'subject', 'sessionType'],
    types: {
      id: 'string',
      uid: 'string',
      userId: 'string',
      courseId: 'string',
      messages: 'array',
      context: 'string',
      learningObjectives: 'array',
      difficulty: 'string',
      subject: 'string',
      sessionType: 'string',
      startedAt: 'date',
      endedAt: 'date',
      duration: 'number',
      satisfaction: 'number',
      feedback: 'string'
    },
    defaults: {
      messages: [],
      context: '',
      learningObjectives: [],
      difficulty: 'beginner',
      sessionType: 'general',
      startedAt: new Date().toISOString()
    }
  }
};