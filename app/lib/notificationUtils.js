import { connectToDB } from './utils';
import { User, Announcements, Notification } from './models';

export async function sendAnnouncementNotifications(announcementId) {
  try {
    await connectToDB();
    
    // Get the announcement
    const announcement = await Announcements.findById(announcementId);
    if (!announcement) {
      return { success: false, message: "Announcement not found" };
    }
    
    // Get all beneficiaries with phone numbers
    const beneficiaries = await User.find({ phone: { $exists: true, $ne: "" } });
    
    if (beneficiaries.length === 0) {
      return { success: false, message: "No beneficiaries with phone numbers found" };
    }
    
    // Prepare the message
    const title = announcement.title;
    const messageContent = announcement.desc.substring(0, 160) + (announcement.desc.length > 160 ? '...' : '');
    
    // Create notification records for each beneficiary
    const notifications = beneficiaries.map(beneficiary => ({
      recipientId: beneficiary._id,
      recipientName: beneficiary.name || beneficiary.fullName || beneficiary.username,
      recipientPhone: beneficiary.phone,
      announcementId: announcement._id,
      title: title,
      message: messageContent,
      status: 'sent', // Simulate successful sending
      createdAt: new Date()
    }));
    
    // Save all notifications
    await Notification.insertMany(notifications);
    
    return {
      success: true,
      message: `Notifications sent to ${notifications.length} beneficiaries`,
      sentCount: notifications.length
    };
  } catch (error) {
    console.error('Error sending notifications:', error);
    return { success: false, message: error.message };
  }
}