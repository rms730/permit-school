import { getSupabaseAdmin } from './supabaseAdmin';

export type NotificationType = 
  | 'seat_time_milestone'
  | 'quiz_completed'
  | 'final_passed'
  | 'subscription_activated'
  | 'certificate_issued'
  | 'guardian_consent_verified'
  | 'weekly_digest'
  | 'payment_failed'
  | 'payment_succeeded'
  | 'trial_ending'
  | 'subscription_canceled';

export interface NotificationData {
  course_id?: string;
  unit_id?: string;
  minutes?: number;
  attempt_id?: string;
  certificate_number?: string;
  student_id?: string;
  [key: string]: any;
}

/**
 * Notify a single student
 */
export async function notifyStudent(
  userId: string,
  type: NotificationType,
  data: NotificationData
): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      data
    });

  if (error) {
    console.error('Error creating notification for student:', error);
    throw error;
  }
}

/**
 * Notify all guardians linked to a student
 */
export async function notifyGuardians(
  studentId: string,
  type: NotificationType,
  data: NotificationData
): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  // Get all guardian IDs linked to this student
  const { data: guardianLinks, error: linksError } = await supabase
    .from('guardian_links')
    .select('guardian_id')
    .eq('student_id', studentId);

  if (linksError) {
    console.error('Error fetching guardian links:', linksError);
    throw linksError;
  }

  if (!guardianLinks || guardianLinks.length === 0) {
    return; // No guardians to notify
  }

  // Add student_id to data for guardian context
  const guardianData = { ...data, student_id: studentId };

  // Create notifications for all guardians
  const notifications = guardianLinks.map(link => ({
    user_id: link.guardian_id,
    type,
    data: guardianData
  }));

  const { error } = await supabase
    .from('notifications')
    .insert(notifications);

  if (error) {
    console.error('Error creating notifications for guardians:', error);
    throw error;
  }
}

/**
 * Notify both student and their guardians
 */
export async function notifyStudentAndGuardians(
  studentId: string,
  type: NotificationType,
  data: NotificationData
): Promise<void> {
  await Promise.all([
    notifyStudent(studentId, type, data),
    notifyGuardians(studentId, type, data)
  ]);
}

/**
 * Check and create seat time milestone notifications
 * This should be called after recording seat time events
 */
export async function checkSeatTimeMilestones(
  studentId: string,
  courseId: string,
  newMinutes: number
): Promise<void> {
  const supabase = getSupabaseAdmin();
  
  // Get total minutes for this student/course
  const { data: totalMinutes, error: totalError } = await supabase
    .from('seat_time_events')
    .select('ms_delta')
    .eq('student_id', studentId)
    .eq('course_id', courseId);

  if (totalError) {
    console.error('Error calculating total minutes:', totalError);
    return;
  }

  const totalMs = (totalMinutes || []).reduce((sum, event) => sum + event.ms_delta, 0);
  const totalMinutesRounded = Math.floor(totalMs / 60000);

  // Check for milestone thresholds (every 30 minutes)
  const milestoneThreshold = Math.floor(totalMinutesRounded / 30) * 30;
  
  if (milestoneThreshold > 0 && milestoneThreshold % 30 === 0) {
    // Check if we already notified for this milestone
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id')
      .eq('user_id', studentId)
      .eq('type', 'seat_time_milestone')
      .eq('data->>course_id', courseId)
      .eq('data->>minutes', milestoneThreshold.toString())
      .single();

    if (!existingNotification) {
      // Create milestone notification
      await notifyStudentAndGuardians(studentId, 'seat_time_milestone', {
        course_id: courseId,
        minutes: milestoneThreshold
      });
    }
  }
}
