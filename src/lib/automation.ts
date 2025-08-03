import { User, Course, Assignment, Grade, Enrollment, TuitionRecord, Certificate } from './types';
import { ChutesAI } from './ai';

export interface AutomationRule {
  id: string;
  name: string;
  description: string;
  trigger: AutomationTrigger;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
  createdAt: string;
  lastExecuted?: string;
  executionCount: number;
}

export interface AutomationTrigger {
  type: 'schedule' | 'event' | 'condition';
  event?: string; // e.g., 'student_enrolled', 'assignment_submitted', 'grade_posted'
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    time: string;
    dayOfWeek?: number;
    dayOfMonth?: number;
  };
  condition?: {
    field: string;
    operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains';
    value: any;
  };
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'is_empty' | 'is_not_empty';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface AutomationAction {
  type: 'email' | 'notification' | 'update_record' | 'create_record' | 'calculate' | 'generate_report' | 'ai_action';
  parameters: Record<string, any>;
}

export class AutomationEngine {
  private rules: AutomationRule[] = [];
  private ai: ChutesAI | null = null;

  constructor(ai?: ChutesAI) {
    this.ai = ai || null;
    this.initializeDefaultRules();
  }

  private initializeDefaultRules() {
    // Automated enrollment workflow
    this.addRule({
      id: 'auto-enrollment-confirmation',
      name: 'Enrollment Confirmation',
      description: 'Send confirmation email when student enrolls in a course',
      trigger: {
        type: 'event',
        event: 'student_enrolled'
      },
      conditions: [],
      actions: [{
        type: 'email',
        parameters: {
          template: 'enrollment_confirmation',
          to: '{{student.email}}',
          subject: 'Enrollment Confirmation - {{course.title}}',
          variables: {
            studentName: '{{student.firstName}} {{student.lastName}}',
            courseName: '{{course.title}}',
            courseCode: '{{course.code}}',
            startDate: '{{course.startDate}}',
            instructor: '{{course.instructorName}}'
          }
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Grade calculation automation
    this.addRule({
      id: 'auto-grade-calculation',
      name: 'Automatic Grade Calculation',
      description: 'Calculate final grades when all assignments are submitted',
      trigger: {
        type: 'event',
        event: 'assignment_graded'
      },
      conditions: [{
        field: 'course.allAssignmentsGraded',
        operator: 'equals',
        value: true
      }],
      actions: [{
        type: 'calculate',
        parameters: {
          operation: 'weighted_average',
          field: 'finalGrade',
          weights: {
            assignments: 0.4,
            quizzes: 0.3,
            midterm: 0.15,
            final: 0.15
          }
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Transcript generation automation
    this.addRule({
      id: 'auto-transcript-generation',
      name: 'Automatic Transcript Generation',
      description: 'Generate transcript when student completes a course',
      trigger: {
        type: 'event',
        event: 'course_completed'
      },
      conditions: [{
        field: 'grade.status',
        operator: 'equals',
        value: 'final'
      }],
      actions: [{
        type: 'update_record',
        parameters: {
          table: 'transcripts',
          operation: 'upsert',
          data: {
            studentId: '{{student.id}}',
            courseId: '{{course.id}}',
            grade: '{{grade.letter}}',
            credits: '{{course.credits}}',
            semester: '{{enrollment.semester}}',
            academicYear: '{{enrollment.academicYear}}',
            completedAt: '{{now}}'
          }
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Assignment deadline reminders
    this.addRule({
      id: 'assignment-deadline-reminder',
      name: 'Assignment Deadline Reminders',
      description: 'Send reminder emails 3 days before assignment deadlines',
      trigger: {
        type: 'schedule',
        schedule: {
          frequency: 'daily',
          time: '09:00'
        }
      },
      conditions: [{
        field: 'assignment.dueDate',
        operator: 'equals',
        value: '{{date_add(now, 3, "days")}}'
      }, {
        field: 'submission.status',
        operator: 'not_equals',
        value: 'submitted',
        logicalOperator: 'AND'
      }],
      actions: [{
        type: 'email',
        parameters: {
          template: 'assignment_reminder',
          to: '{{student.email}}',
          subject: 'Assignment Due Soon - {{assignment.title}}',
          variables: {
            studentName: '{{student.firstName}}',
            assignmentTitle: '{{assignment.title}}',
            dueDate: '{{assignment.dueDate}}',
            courseName: '{{course.title}}'
          }
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Course completion certificates
    this.addRule({
      id: 'auto-certificate-generation',
      name: 'Automatic Certificate Generation',
      description: 'Generate completion certificate for passing students',
      trigger: {
        type: 'event',
        event: 'course_completed'
      },
      conditions: [{
        field: 'grade.percentage',
        operator: 'greater_than',
        value: 70
      }],
      actions: [{
        type: 'create_record',
        parameters: {
          table: 'certificates',
          data: {
            studentId: '{{student.id}}',
            courseId: '{{course.id}}',
            type: 'completion',
            title: 'Certificate of Completion',
            description: 'Successfully completed {{course.title}}',
            issuedAt: '{{now}}',
            verificationCode: '{{uuid}}',
            grade: '{{grade.letter}}',
            credits: '{{course.credits}}'
          }
        }
      }, {
        type: 'email',
        parameters: {
          template: 'certificate_issued',
          to: '{{student.email}}',
          subject: 'Certificate Issued - {{course.title}}',
          attachments: ['{{certificate.pdf}}']
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Financial aid processing
    this.addRule({
      id: 'auto-financial-aid-processing',
      name: 'Automatic Financial Aid Processing',
      description: 'Process approved financial aid applications',
      trigger: {
        type: 'event',
        event: 'financial_aid_approved'
      },
      conditions: [{
        field: 'application.status',
        operator: 'equals',
        value: 'approved'
      }],
      actions: [{
        type: 'update_record',
        parameters: {
          table: 'tuition_records',
          operation: 'update',
          where: { studentId: '{{application.studentId}}' },
          data: {
            aidAmount: '{{application.approvedAmount}}',
            balanceDue: '{{subtract(tuition.total, application.approvedAmount)}}',
            aidApplied: true,
            updatedAt: '{{now}}'
          }
        }
      }, {
        type: 'email',
        parameters: {
          template: 'financial_aid_applied',
          to: '{{student.email}}',
          subject: 'Financial Aid Applied to Your Account'
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Library resource management
    this.addRule({
      id: 'auto-library-overdue-notices',
      name: 'Library Overdue Notices',
      description: 'Send overdue notices for library resources',
      trigger: {
        type: 'schedule',
        schedule: {
          frequency: 'daily',
          time: '08:00'
        }
      },
      conditions: [{
        field: 'checkout.dueDate',
        operator: 'less_than',
        value: '{{now}}'
      }, {
        field: 'checkout.returned',
        operator: 'equals',
        value: false,
        logicalOperator: 'AND'
      }],
      actions: [{
        type: 'email',
        parameters: {
          template: 'library_overdue',
          to: '{{student.email}}',
          subject: 'Overdue Library Resource - {{resource.title}}'
        }
      }, {
        type: 'notification',
        parameters: {
          userId: '{{student.id}}',
          type: 'warning',
          title: 'Overdue Library Resource',
          message: 'Please return {{resource.title}} as soon as possible.'
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });

    // Academic calendar synchronization
    this.addRule({
      id: 'auto-calendar-sync',
      name: 'Academic Calendar Synchronization',
      description: 'Sync important dates to student calendars',
      trigger: {
        type: 'event',
        event: 'student_enrolled'
      },
      conditions: [],
      actions: [{
        type: 'create_record',
        parameters: {
          table: 'calendar_events',
          data: {
            userId: '{{student.id}}',
            title: '{{course.title}} - {{event.type}}',
            description: '{{event.description}}',
            startDate: '{{event.date}}',
            type: 'academic',
            courseId: '{{course.id}}'
          }
        }
      }],
      isActive: true,
      createdAt: new Date().toISOString(),
      executionCount: 0
    });
  }

  addRule(rule: Omit<AutomationRule, 'id'> & { id?: string }): string {
    const id = rule.id || this.generateId();
    const newRule: AutomationRule = {
      ...rule,
      id,
      createdAt: rule.createdAt || new Date().toISOString(),
      executionCount: rule.executionCount || 0
    };
    
    this.rules.push(newRule);
    return id;
  }

  removeRule(id: string): boolean {
    const index = this.rules.findIndex(rule => rule.id === id);
    if (index !== -1) {
      this.rules.splice(index, 1);
      return true;
    }
    return false;
  }

  updateRule(id: string, updates: Partial<AutomationRule>): boolean {
    const rule = this.rules.find(r => r.id === id);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  getRules(): AutomationRule[] {
    return [...this.rules];
  }

  getActiveRules(): AutomationRule[] {
    return this.rules.filter(rule => rule.isActive);
  }

  async executeRule(ruleId: string, context: Record<string, any>): Promise<boolean> {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule || !rule.isActive) {
      return false;
    }

    try {
      // Check conditions
      if (!this.evaluateConditions(rule.conditions, context)) {
        return false;
      }

      // Execute actions
      for (const action of rule.actions) {
        await this.executeAction(action, context);
      }

      // Update execution stats
      rule.executionCount++;
      rule.lastExecuted = new Date().toISOString();

      return true;
    } catch (error) {
      console.error(`Error executing automation rule ${ruleId}:`, error);
      return false;
    }
  }

  async triggerEvent(eventName: string, context: Record<string, any>): Promise<void> {
    const eventRules = this.getActiveRules().filter(rule => 
      rule.trigger.type === 'event' && rule.trigger.event === eventName
    );

    for (const rule of eventRules) {
      await this.executeRule(rule.id, context);
    }
  }

  async processScheduledRules(): Promise<void> {
    const now = new Date();
    const scheduledRules = this.getActiveRules().filter(rule => 
      rule.trigger.type === 'schedule'
    );

    for (const rule of scheduledRules) {
      if (this.shouldExecuteScheduledRule(rule, now)) {
        await this.executeRule(rule.id, { now: now.toISOString() });
      }
    }
  }

  private evaluateConditions(conditions: AutomationCondition[], context: Record<string, any>): boolean {
    if (conditions.length === 0) return true;

    let result = true;
    let currentLogicalOperator: 'AND' | 'OR' = 'AND';

    for (const condition of conditions) {
      const conditionResult = this.evaluateCondition(condition, context);
      
      if (currentLogicalOperator === 'AND') {
        result = result && conditionResult;
      } else {
        result = result || conditionResult;
      }

      currentLogicalOperator = condition.logicalOperator || 'AND';
    }

    return result;
  }

  private evaluateCondition(condition: AutomationCondition, context: Record<string, any>): boolean {
    const fieldValue = this.getFieldValue(condition.field, context);
    const conditionValue = this.interpolateValue(condition.value, context);

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'is_empty':
        return !fieldValue || fieldValue === '' || fieldValue === null || fieldValue === undefined;
      case 'is_not_empty':
        return fieldValue && fieldValue !== '' && fieldValue !== null && fieldValue !== undefined;
      default:
        return false;
    }
  }

  private async executeAction(action: AutomationAction, context: Record<string, any>): Promise<void> {
    switch (action.type) {
      case 'email':
        await this.sendEmail(action.parameters, context);
        break;
      case 'notification':
        await this.sendNotification(action.parameters, context);
        break;
      case 'update_record':
        await this.updateRecord(action.parameters, context);
        break;
      case 'create_record':
        await this.createRecord(action.parameters, context);
        break;
      case 'calculate':
        await this.performCalculation(action.parameters, context);
        break;
      case 'generate_report':
        await this.generateReport(action.parameters, context);
        break;
      case 'ai_action':
        await this.performAIAction(action.parameters, context);
        break;
    }
  }

  private async sendEmail(parameters: any, context: Record<string, any>): Promise<void> {
    // Email sending implementation would go here
    console.log('Sending email:', {
      to: this.interpolateValue(parameters.to, context),
      subject: this.interpolateValue(parameters.subject, context),
      template: parameters.template,
      variables: this.interpolateObject(parameters.variables || {}, context)
    });
  }

  private async sendNotification(parameters: any, context: Record<string, any>): Promise<void> {
    // Notification sending implementation would go here
    console.log('Sending notification:', {
      userId: this.interpolateValue(parameters.userId, context),
      type: parameters.type,
      title: this.interpolateValue(parameters.title, context),
      message: this.interpolateValue(parameters.message, context)
    });
  }

  private async updateRecord(parameters: any, context: Record<string, any>): Promise<void> {
    // Database update implementation would go here
    console.log('Updating record:', {
      table: parameters.table,
      operation: parameters.operation,
      where: this.interpolateObject(parameters.where || {}, context),
      data: this.interpolateObject(parameters.data, context)
    });
  }

  private async createRecord(parameters: any, context: Record<string, any>): Promise<void> {
    // Database create implementation would go here
    console.log('Creating record:', {
      table: parameters.table,
      data: this.interpolateObject(parameters.data, context)
    });
  }

  private async performCalculation(parameters: any, context: Record<string, any>): Promise<void> {
    // Calculation implementation would go here
    console.log('Performing calculation:', {
      operation: parameters.operation,
      field: parameters.field,
      weights: parameters.weights
    });
  }

  private async generateReport(parameters: any, context: Record<string, any>): Promise<void> {
    // Report generation implementation would go here
    console.log('Generating report:', parameters);
  }

  private async performAIAction(parameters: any, context: Record<string, any>): Promise<void> {
    if (!this.ai) {
      console.warn('AI service not available for automation');
      return;
    }

    // AI action implementation would go here
    console.log('Performing AI action:', parameters);
  }

  private getFieldValue(fieldPath: string, context: Record<string, any>): any {
    const parts = fieldPath.split('.');
    let value = context;
    
    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  private interpolateValue(value: any, context: Record<string, any>): any {
    if (typeof value !== 'string') return value;
    
    return value.replace(/\{\{([^}]+)\}\}/g, (match, fieldPath) => {
      const fieldValue = this.getFieldValue(fieldPath.trim(), context);
      return fieldValue !== undefined ? String(fieldValue) : match;
    });
  }

  private interpolateObject(obj: Record<string, any>, context: Record<string, any>): Record<string, any> {
    const result: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result[key] = this.interpolateObject(value, context);
      } else {
        result[key] = this.interpolateValue(value, context);
      }
    }
    
    return result;
  }

  private shouldExecuteScheduledRule(rule: AutomationRule, now: Date): boolean {
    if (!rule.trigger.schedule) return false;
    
    const schedule = rule.trigger.schedule;
    const lastExecuted = rule.lastExecuted ? new Date(rule.lastExecuted) : null;
    
    // Simple scheduling logic - would be more sophisticated in production
    switch (schedule.frequency) {
      case 'daily':
        return !lastExecuted || 
               now.getDate() !== lastExecuted.getDate() ||
               now.getMonth() !== lastExecuted.getMonth() ||
               now.getFullYear() !== lastExecuted.getFullYear();
      case 'weekly':
        return !lastExecuted || 
               (now.getTime() - lastExecuted.getTime()) >= 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return !lastExecuted ||
               now.getMonth() !== lastExecuted.getMonth() ||
               now.getFullYear() !== lastExecuted.getFullYear();
      default:
        return false;
    }
  }

  private generateId(): string {
    return 'rule_' + Math.random().toString(36).substr(2, 9);
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();
