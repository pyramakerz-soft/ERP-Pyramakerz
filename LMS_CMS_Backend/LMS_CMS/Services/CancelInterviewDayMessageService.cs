using AutoMapper;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains.RegisterationModule;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Services
{
    public class CancelInterviewDayMessageService
    {
        private readonly DbContextFactoryService _dbContextFactory;
        private readonly SendNotificationService _sendNotificationService;

        public CancelInterviewDayMessageService(DbContextFactoryService dbContextFactory, SendNotificationService sendNotificationService)
        {
            _dbContextFactory = dbContextFactory;
            _sendNotificationService = sendNotificationService;
        }
        public async void CancelInterviewDayMessage(long interviewID, HttpContext httpContext)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(httpContext);

            InterviewTime interviewTime = Unit_Of_Work.interviewTime_Repository.First_Or_Default(d=>d.IsDeleted != true && d.ID == interviewID);

            List<RegisterationFormInterview> registerationFormInterviews = await Unit_Of_Work.registerationFormInterview_Repository.Select_All_With_IncludesById<RegisterationFormInterview>(
                    f => f.IsDeleted != true && f.InterviewTimeID == interviewID && f.InterviewStateID == 1 && 
                    (f.RegisterationFormParent.RegisterationFormStateID == 1 || f.RegisterationFormParent.RegisterationFormStateID == 4)
                    && f.RegisterationFormParent.ParentID != null,
                    query => query.Include(emp => emp.RegisterationFormParent)
                    );

            var message = $"Your interview that you requested on {interviewTime.Date} from {interviewTime.FromTime} to {interviewTime.ToTime} has been canceled.";
            var domainName = httpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            if (registerationFormInterviews != null && registerationFormInterviews.Count != 0)
            {
                foreach (var item in registerationFormInterviews)
                {
                    Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == item.RegisterationFormParent.ParentID);
                    if(parent != null)
                    {
                        await _sendNotificationService.SendNotificationAsync(Unit_Of_Work, message, null, 3, parent.ID, domainName);
                    }
                }
            } 
        }
    }
}
