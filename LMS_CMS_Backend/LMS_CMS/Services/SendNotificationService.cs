using AutoMapper;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using LMS_CMS_PL.Services.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace LMS_CMS_PL.Services
{
    public class SendNotificationService
    {
        private readonly NotificationService _notificationService;
        IMapper mapper;

        public SendNotificationService(NotificationService notificationService, IMapper mapper)
        { 
            _notificationService = notificationService;
            this.mapper = mapper;
        }

        public async Task SendNotificationAsync(UOW Unit_Of_Work, string txt, string? link, long userTypeID, long userID, string domainName)
        {
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            Notification notification = new Notification();
            notification.Text = txt;
            notification.Link = link;
            notification.IsAllowDismiss = true;
            notification.UserTypeID = userTypeID;

            notification.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            Unit_Of_Work.notification_Repository.Add(notification);

            Unit_Of_Work.SaveChanges();

            NotificationSharedTo notificationSharedTo = new NotificationSharedTo();
            notificationSharedTo.UserID = userID;
            notificationSharedTo.UserTypeID = userTypeID;
            notificationSharedTo.NotificationID = notification.ID;

            notificationSharedTo.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            Unit_Of_Work.notificationSharedTo_Repository.Add(notificationSharedTo);

            Unit_Of_Work.SaveChanges();
             
            NotificationSharedTo sharedTo = await Unit_Of_Work.notificationSharedTo_Repository.FindByIncludesAsync(n => n.NotificationID == notification.ID && n.UserID == userID && n.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification)
            );

            if (sharedTo != null)
            {
                var notificationDTO = mapper.Map<NotificationSharedToGetDTO>(sharedTo);

                await _notificationService.PushRealTimeNotification(userID, userTypeID, notificationDTO, domainName);
            }
        }
    }
}
