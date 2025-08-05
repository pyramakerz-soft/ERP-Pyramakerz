using AutoMapper;
using LMS_CMS_PL.Services.SignalR;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_DAL.Models.Domains.LMS;

namespace LMS_CMS_PL.Controllers.Domains.Communication
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly FileWordPdfValidationService _fileWordPdfValidationService;
        private readonly UserTreeService _userTreeService; 

        public ChatController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService, UserTreeService userTreeService, FileWordPdfValidationService fileWordPdfValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
            _userTreeService = userTreeService; 
            _fileWordPdfValidationService = fileWordPdfValidationService;
        }

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> AddAsync(ChatAddDTO NewMessage)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);
            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewMessage == null)
            {
                return BadRequest("Chat Message cannot be null");
            }

            UserType userTypeForSender = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewMessage.SenderUserTypeID);
            if (userTypeForSender == null)
            {
                return BadRequest("No User Type For Sender With this ID");
            }

            if(userTypeForSender.ID == 1)
            {
                Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewMessage.SenderID);
                if (emp == null)
                {
                    return BadRequest("No Sender With this ID");
                }
            }else if(userTypeForSender.ID == 2)
            {
                Student stu = Unit_Of_Work.student_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewMessage.SenderID);
                if (stu == null)
                {
                    return BadRequest("No Sender With this ID");
                }
            }else if(userTypeForSender.ID == 3)
            {
                Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewMessage.SenderID);
                if (parent == null)
                {
                    return BadRequest("No Sender With this ID");
                }
            }

            UserType userTypeForReceiver = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverUserTypeID);
            if (userTypeForReceiver == null)
            {
                return BadRequest("No User Type For Receiver With this ID");
            }

            if ((NewMessage.Message == null || NewMessage.Message == "") && (NewMessage.ChatMessageAttachmentFiles == null || NewMessage.ChatMessageAttachmentFiles.Count == 0))
            {
                return BadRequest("You have to choose one element atleast to send (File - Message)");
            } 

            List<long> targetUserIds;
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, NewMessage.ReceiverUserTypeID, NewMessage.UserFilters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            if(targetUserIds.Count == 0)
            {
                return NotFound("No Users To Text");
            }

            //Notification notification = mapper.Map<Notification>(NewNotification);
            //TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            //notification.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            //if (userTypeClaim == "octa")
            //{
            //    notification.InsertedByOctaId = userId;
            //}
            //else if (userTypeClaim == "employee")
            //{
            //    notification.InsertedByUserId = userId;
            //}

            //Unit_Of_Work.notification_Repository.Add(notification);
            //Unit_Of_Work.SaveChanges();

            //if (NewNotification.ImageFile != null)
            //{
            //    string returnFileInput = _fileImageValidationService.ValidateImageFile(NewNotification.ImageFile);
            //    if (returnFileInput != null)
            //    {
            //        return BadRequest(returnFileInput);
            //    }

            //    var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Notification");
            //    var subjectFolder = Path.Combine(baseFolder, notification.ID.ToString());
            //    if (!Directory.Exists(subjectFolder))
            //    {
            //        Directory.CreateDirectory(subjectFolder);
            //    }

            //    if (NewNotification.ImageFile.Length > 0)
            //    {
            //        var filePath = Path.Combine(subjectFolder, NewNotification.ImageFile.FileName);
            //        using (var stream = new FileStream(filePath, FileMode.Create))
            //        {
            //            await NewNotification.ImageFile.CopyToAsync(stream);
            //        }
            //    }

            //    notification.ImageLink = Path.Combine("Uploads", "Notification", notification.ID.ToString(), NewNotification.ImageFile.FileName);
            //    Unit_Of_Work.notification_Repository.Update(notification);
            //}

            //foreach (long userID in targetUserIds)
            //{
            //    NotificationSharedTo notificationSharedTo = new NotificationSharedTo();
            //    notificationSharedTo.NotificationID = notification.ID;
            //    notificationSharedTo.UserTypeID = NewNotification.UserTypeID;
            //    notificationSharedTo.UserID = userID;
            //    notificationSharedTo.NotifiedOrNot = false;
            //    notificationSharedTo.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            //    if (userTypeClaim == "octa")
            //    {
            //        notificationSharedTo.InsertedByOctaId = userId;
            //    }
            //    else if (userTypeClaim == "employee")
            //    {
            //        notificationSharedTo.InsertedByUserId = userId;
            //    }

            //    Unit_Of_Work.notificationSharedTo_Repository.Add(notificationSharedTo);

            //    var notificationDTO = mapper.Map<NotificationSharedToGetDTO>(notificationSharedTo);

            //    string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            //    if (!string.IsNullOrEmpty(notificationDTO.ImageLink))
            //    {
            //        notificationDTO.ImageLink = $"{serverUrl}{notificationDTO.ImageLink.Replace("\\", "/")}";
            //    }

            //    notificationSharedTo.NotifiedOrNot = true;
            //    notificationSharedTo.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            //    Unit_Of_Work.notificationSharedTo_Repository.Update(notificationSharedTo);

            //    await _notificationService.PushRealTimeNotification(userID, NewNotification.UserTypeID, notificationDTO, domainName);
            //}

            //Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
