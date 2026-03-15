import { prisma } from '@/lib/prisma';

export type NotificationType =
    | 'GROUP_ASSIGNED'
    | 'MEETING_SCHEDULED'
    | 'MEETING_CANCELLED'
    | 'MEETING_UPDATED'
    | 'ATTENDANCE_MARKED';

export interface CreateNotificationParams {
    userId: number;
    userRole: 'STUDENT' | 'FACULTY' | 'ADMIN';
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
}

/**
 * Emit an event to the Socket.io server (hosted on Render)
 * This replaces the old global.io approach since Socket.io runs as a separate service
 */
async function emitViaSocketServer(room: string, event: string, data: any) {
    const socketServerUrl = process.env.SOCKET_SERVER_URL || process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    const secret = process.env.SOCKET_SERVER_SECRET;

    if (!secret) {
        console.warn('SOCKET_SERVER_SECRET not set, skipping real-time notification emit');
        return;
    }

    try {
        await fetch(`${socketServerUrl}/emit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${secret}`,
            },
            body: JSON.stringify({ room, event, data }),
        });
    } catch (error) {
        console.error('Error emitting via socket server:', error);
        // Don't throw — notification is still saved in DB, just not pushed in real-time
    }
}

/**
 * Create a notification and emit it via the Socket.io server
 */
export async function createNotification(params: CreateNotificationParams) {
    const { userId, userRole, type, title, message, link } = params;

    try {
        // Create notification in database
        const notification = await prisma.notification.create({
            data: {
                user_id: userId,
                user_role: userRole,
                type,
                title,
                message,
                link: link || null,
                is_read: false
            }
        });

        // Emit via Socket.io server (on Render)
        const room = `${userRole.toLowerCase()}:${userId}`;
        await emitViaSocketServer(room, 'new-notification', notification);
        console.log(`Notification emitted to room: ${room}`);

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

/**
 * Create notifications for all students in a group when they are assigned
 */
export async function createGroupAssignmentNotifications(groupId: number, studentIds: number[]) {
    try {
        // Get group details
        const group = await prisma.project_group.findUnique({
            where: { id: groupId },
            select: { name: true, title: true }
        });

        if (!group) {
            throw new Error('Group not found');
        }

        // Create notifications for each student
        const notifications = await Promise.all(
            studentIds.map(studentId =>
                createNotification({
                    userId: studentId,
                    userRole: 'STUDENT',
                    type: 'GROUP_ASSIGNED',
                    title: 'Assigned to Project Group',
                    message: `You have been assigned to ${group.name} - ${group.title}`,
                    link: '/dashboard/student/team'
                })
            )
        );

        return notifications;
    } catch (error) {
        console.error('Error creating group assignment notifications:', error);
        throw error;
    }
}

/**
 * Create notifications for all students in a group when a meeting is scheduled
 */
export async function createMeetingNotifications(meetingId: number, groupId: number) {
    try {
        // Get meeting details
        const meeting = await prisma.project_meeting.findUnique({
            where: { id: meetingId },
            include: {
                project_group: {
                    select: { name: true }
                },
                staff: {
                    select: { name: true }
                }
            }
        });

        if (!meeting) {
            throw new Error('Meeting not found');
        }

        // Get all students in the group
        const groupMembers = await prisma.project_group_member.findMany({
            where: { group_id: groupId },
            select: { student_id: true }
        });

        const meetingDate = new Date(meeting.meeting_datetime).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        // Create notifications for each student
        const notifications = await Promise.all(
            groupMembers.map(member =>
                member.student_id ? createNotification({
                    userId: member.student_id,
                    userRole: 'STUDENT',
                    type: 'MEETING_SCHEDULED',
                    title: 'New Meeting Scheduled',
                    message: `Meeting scheduled for ${meetingDate}${meeting.location ? ` at ${meeting.location}` : ''}`,
                    link: '/dashboard/student/meetings'
                }) : Promise.resolve(null)
            )
        );

        return notifications.filter(n => n !== null);
    } catch (error) {
        console.error('Error creating meeting notifications:', error);
        throw error;
    }
}

/**
 * Emit notification to specific user via Socket.io server
 */
export async function emitToUser(userId: number, userRole: string, event: string, data: any) {
    const room = `${userRole.toLowerCase()}:${userId}`;
    await emitViaSocketServer(room, event, data);
}
