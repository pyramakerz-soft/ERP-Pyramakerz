using AutoMapper;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using LMS_CMS_BL.DTO.Communication;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.Communication;
using LMS_CMS_BL.DTO.Administration;
using Microsoft.EntityFrameworkCore;
using LMS_CMS_PL.Services.SignalR;
using LMS_CMS_PL.Services.FileValidations;

namespace LMS_CMS_PL.Controllers.Domains.Communication
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;
        private readonly UserTreeService _userTreeService;
        private readonly NotificationService _notificationService;

        public NotificationController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService, UserTreeService userTreeService, NotificationService notificationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
            _userTreeService = userTreeService;
            _notificationService = notificationService;
        }

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Notification> notifications = await Unit_Of_Work.notification_Repository.Select_All_With_IncludesById<Notification>(
                    f => f.IsDeleted != true,
                    query => query.Include(d => d.NotificationSharedTos.Where(d => d.IsDeleted != true)),
                    query => query.Include(d => d.UserType),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            if (notifications == null || notifications.Count == 0)
            {
                return NotFound();
            }

            List<NotificationGetDTO> notificationGetDTO = mapper.Map<List<NotificationGetDTO>>(notifications);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var notification in notificationGetDTO)
            {
                if (!string.IsNullOrEmpty(notification.ImageLink))
                {
                    notification.ImageLink = $"{serverUrl}{notification.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetByUserTypeID/{userTypeID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> GetByUserTypeID(long userTypeID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<Notification> notifications = await Unit_Of_Work.notification_Repository.Select_All_With_IncludesById<Notification>(
                    f => f.IsDeleted != true && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.NotificationSharedTos.Where(d => d.IsDeleted != true)),
                    query => query.Include(d => d.UserType),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            if (notifications == null || notifications.Count == 0)
            {
                return NotFound();
            }

            List<NotificationGetDTO> notificationGetDTO = mapper.Map<List<NotificationGetDTO>>(notifications);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var notification in notificationGetDTO)
            {
                if (!string.IsNullOrEmpty(notification.ImageLink))
                {
                    notification.ImageLink = $"{serverUrl}{notification.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            Notification notification = await Unit_Of_Work.notification_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == id,
                    query => query.Include(d => d.NotificationSharedTos.Where(d => d.IsDeleted != true)),
                    query => query.Include(d => d.UserType),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            if (notification == null)
            {
                return NotFound();
            }

            NotificationGetDTO notificationGetDTO = mapper.Map<NotificationGetDTO>(notification);
            
            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(notification.ImageLink))
            {
                notificationGetDTO.ImageLink = $"{serverUrl}{notification.ImageLink.Replace("\\", "/")}";
            } 
            
            if (notificationGetDTO.NotificationSharedTos != null && notificationGetDTO.NotificationSharedTos.Count != 0)
            {
                foreach (var notificationSharedTo in notificationGetDTO.NotificationSharedTos)
                {
                    dynamic user = notificationSharedTo.UserTypeID switch
                    {
                        1 => Unit_Of_Work.employee_Repository.First_Or_Default(emp => emp.ID == notificationSharedTo.UserID && emp.IsDeleted != true),
                        2 => Unit_Of_Work.student_Repository.First_Or_Default(stu => stu.ID == notificationSharedTo.UserID && stu.IsDeleted != true),
                        3 => Unit_Of_Work.parent_Repository.First_Or_Default(par => par.ID == notificationSharedTo.UserID && par.IsDeleted != true),
                        _ => null,
                    };

                    string? userName = user switch
                    {
                        Employee e => e.en_name, 
                        Student s => s.en_name, 
                        Parent p => p.en_name,  
                        _ => null
                    };

                    notificationSharedTo.UserName = userName;
                }
            } 

            return Ok(notificationGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("ByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserID()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.UserID == userId && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            notificationSharedTos = notificationSharedTos
                .OrderByDescending(d => d.InsertedAt)
                .ToList();

            List<NotificationSharedToGetDTO> notificationSharedToGetDTO = mapper.Map<List<NotificationSharedToGetDTO>>(notificationSharedTos);

            foreach (var notificationSharedTo in notificationSharedToGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(notificationSharedTo.ImageLink))
                {
                    notificationSharedTo.ImageLink = $"{serverUrl}{notificationSharedTo.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationSharedToGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("ByUserIDFirst5")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDFirst5()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.UserID == userId && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            notificationSharedTos = notificationSharedTos
                .OrderByDescending(d => d.InsertedAt)
                .Take(5)
                .ToList();

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            List<NotificationSharedToGetDTO> notificationSharedToGetDTO = mapper.Map<List<NotificationSharedToGetDTO>>(notificationSharedTos);

            foreach (var notificationSharedTo in notificationSharedToGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(notificationSharedTo.ImageLink))
                {
                    notificationSharedTo.ImageLink = $"{serverUrl}{notificationSharedTo.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(notificationSharedToGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("ByUserIDAndNotificationSharedByID/{notificationSharedID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDAndNotificationSharedByID(long notificationSharedID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            NotificationSharedTo notificationSharedTo = await Unit_Of_Work.notificationSharedTo_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.ID == notificationSharedID,
                    query => query.Include(d => d.Notification),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            if (notificationSharedTo == null)
            {
                return NotFound();
            }

            if(notificationSharedTo.UserID != userId || notificationSharedTo.UserTypeID != userTypeID)
            {
                return BadRequest();
            }

            NotificationSharedToGetDTO notificationSharedToGetDTO = mapper.Map<NotificationSharedToGetDTO>(notificationSharedTo);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(notificationSharedToGetDTO.ImageLink))
            {
                notificationSharedToGetDTO.ImageLink = $"{serverUrl}{notificationSharedToGetDTO.ImageLink.Replace("\\", "/")}";
            }

            notificationSharedTo.SeenOrNot = true;
            notificationSharedTo.NotifiedOrNot = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            notificationSharedTo.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone); 
            Unit_Of_Work.notificationSharedTo_Repository.Update(notificationSharedTo);
            
            Unit_Of_Work.SaveChanges();
             
            return Ok(notificationSharedToGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("GetNotNotifiedYetByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> GetNotNotifiedYetByUserID()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            } 
            else if(userTypeClaim == "student")
            {
                userTypeID= 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && !f.NotifiedOrNot && f.UserID == userId && f.UserTypeID == userTypeID,
                    query => query.Include(d => d.Notification),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

            notificationSharedTos = notificationSharedTos
                .OrderByDescending(d => d.InsertedAt) 
                .ToList();

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            List<NotificationSharedToGetDTO> notificationSharedToGetDTO = mapper.Map<List<NotificationSharedToGetDTO>>(notificationSharedTos);

            foreach (var notificationSharedTo in notificationSharedToGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(notificationSharedTo.ImageLink))
                {
                    notificationSharedTo.ImageLink = $"{serverUrl}{notificationSharedTo.ImageLink.Replace("\\", "/")}";
                }
            } 

            return Ok(notificationSharedToGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////
        
        [HttpGet("UnSeenNotificationCount")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult UnSeenNotificationCount()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            } 
            else if(userTypeClaim == "student")
            {
                userTypeID= 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = Unit_Of_Work.notificationSharedTo_Repository.FindBy(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && !f.SeenOrNot && f.UserID == userId && f.UserTypeID == userTypeID);

            return Ok(notificationSharedTos.Count);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("LinkOpened/{notificationSharedToID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult LinkOpened(long notificationSharedToID)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            NotificationSharedTo notificationSharedTo = Unit_Of_Work.notificationSharedTo_Repository.First_Or_Default(
                    f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.ID == notificationSharedToID);
             
            if (notificationSharedTo == null)
            {
                return NotFound();
            }

            notificationSharedTo.NotifiedOrNot = true;
            notificationSharedTo.IsLinkOpened = true;
            notificationSharedTo.SeenOrNot = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            notificationSharedTo.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.notificationSharedTo_Repository.Update(notificationSharedTo);
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("DismissAll")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> DismissAllAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            List<NotificationSharedTo> notificationSharedTos = await Unit_Of_Work.notificationSharedTo_Repository.Select_All_With_IncludesById<NotificationSharedTo>(
                     f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.UserID == userId && f.UserTypeID == userTypeID,
                     query => query.Include(d => d.Notification));

            if (notificationSharedTos == null || notificationSharedTos.Count == 0)
            {
                return NotFound();
            }

            foreach (var item in notificationSharedTos)
            {
                if (item.Notification.IsAllowDismiss == true || (item.Notification.IsAllowDismiss == false && item.IsLinkOpened == true))
                {
                    item.NotifiedOrNot = true;
                    TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                    item.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    Unit_Of_Work.notificationSharedTo_Repository.Update(item);
                }
            }
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("DismissOne/{notificationSharedToId}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult DismissOne(long notificationSharedToId)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            long userTypeID = 0;
            if (userTypeClaim == "employee")
            {
                userTypeID = 1;
            }
            else if (userTypeClaim == "student")
            {
                userTypeID = 2;
            }
            else if (userTypeClaim == "parent")
            {
                userTypeID = 3;
            }

            NotificationSharedTo notificationSharedTo = Unit_Of_Work.notificationSharedTo_Repository.First_Or_Default(
                     f => f.IsDeleted != true && f.Notification.IsDeleted != true && f.UserID == userId && f.UserTypeID == userTypeID && f.ID == notificationSharedToId);

            if (notificationSharedTo == null)
            {
                return NotFound();
            }

            notificationSharedTo.NotifiedOrNot = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            notificationSharedTo.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.notificationSharedTo_Repository.Update(notificationSharedTo); 
            
            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee" },
           pages: new[] { "Notification" }
        )]
        public async Task<IActionResult> AddAsync(NotificationAddDTO NewNotification)
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

            if (NewNotification == null)
            {
                return BadRequest("Notification cannot be null");
            }

            UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewNotification.UserTypeID);
            if (userType == null)
            {
                return BadRequest("No User Type With this ID");
            }

            if(NewNotification.ImageFile == null && NewNotification.Text == null && NewNotification.Link == null)
            {
                return BadRequest("You have to choose one element atleast to appear");
            }
            if(NewNotification.Link == null || NewNotification.Link == "")
            {
                NewNotification.IsAllowDismiss = true;
            }
             
            List<long> targetUserIds;
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, NewNotification.UserTypeID, NewNotification.UserFilters);
                if(NewNotification.UserTypeID == 1)
                {
                    targetUserIds = targetUserIds.Where(id => id != userId).ToList();
                }
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }


            if (NewNotification.ImageFile != null)
            {
                string returnFileInput = await _fileImageValidationService.ValidateImageFileAsync(NewNotification.ImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            Notification notification = mapper.Map<Notification>(NewNotification);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            notification.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                notification.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                notification.InsertedByUserId = userId;
            }

            Unit_Of_Work.notification_Repository.Add(notification);
            Unit_Of_Work.SaveChanges();

            if(NewNotification.ImageFile != null)
            { 
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Notification");
                var subjectFolder = Path.Combine(baseFolder, notification.ID.ToString());
                if (!Directory.Exists(subjectFolder))
                {
                    Directory.CreateDirectory(subjectFolder);
                }
                
                if (NewNotification.ImageFile.Length > 0)
                {
                    var filePath = Path.Combine(subjectFolder, NewNotification.ImageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewNotification.ImageFile.CopyToAsync(stream);
                    }
                }

                notification.ImageLink = Path.Combine("Uploads", "Notification", notification.ID.ToString(), NewNotification.ImageFile.FileName);
                Unit_Of_Work.notification_Repository.Update(notification); 
            }

            foreach (long userID in targetUserIds)
            {
                NotificationSharedTo notificationSharedTo = new NotificationSharedTo();
                notificationSharedTo.NotificationID = notification.ID;
                notificationSharedTo.UserTypeID = NewNotification.UserTypeID;
                notificationSharedTo.UserID = userID;
                notificationSharedTo.NotifiedOrNot = false;
                notificationSharedTo.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    notificationSharedTo.InsertedByOctaId = userId;
                }
                else if (userTypeClaim == "employee")
                {
                    notificationSharedTo.InsertedByUserId = userId;
                }

                Unit_Of_Work.notificationSharedTo_Repository.Add(notificationSharedTo);
            }
            Unit_Of_Work.SaveChanges();

            foreach (var userID in targetUserIds)
            {
                var sharedTo = await Unit_Of_Work.notificationSharedTo_Repository.FindByIncludesAsync(n => n.NotificationID == notification.ID && n.UserID == userID,
                    query => query.Include(d => d.Notification),
                    query => query.Include(d => d.InsertedByEmployee)
                    );

                if (sharedTo != null)
                {
                    var notificationDTO = mapper.Map<NotificationSharedToGetDTO>(sharedTo);

                    string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                    if (!string.IsNullOrEmpty(notificationDTO.ImageLink))
                    {
                        notificationDTO.ImageLink = $"{serverUrl}{notificationDTO.ImageLink.Replace("\\", "/")}";
                    }
                     
                    await _notificationService.PushRealTimeNotification(userID, NewNotification.UserTypeID, notificationDTO, domainName); 
                }
            } 

            Unit_Of_Work.SaveChanges();
            return Ok();  
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpDelete("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowDelete: 1,
            pages: new[] { "Notification" }
        )]
        public IActionResult Delete(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userClaims = HttpContext.User.Claims;
            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (id == 0)
            {
                return BadRequest("Enter Notification ID");
            }

            Notification notification = Unit_Of_Work.notification_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (notification == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Notification", roleId, userId, notification);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            notification.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            notification.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                notification.DeletedByOctaId = userId;
                if (notification.DeletedByUserId != null)
                {
                    notification.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                notification.DeletedByUserId = userId;
                if (notification.DeletedByOctaId != null)
                {
                    notification.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.notification_Repository.Update(notification);

            List<NotificationSharedTo> notificationSharedTos = Unit_Of_Work.notificationSharedTo_Repository.FindBy(d => d.NotificationID == id && d.IsDeleted != true);
            if (notificationSharedTos != null && notificationSharedTos.Count > 0)
            {
                foreach (var notificationSharedTo in notificationSharedTos)
                {
                    notificationSharedTo.IsDeleted = true;
                    notificationSharedTo.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        notificationSharedTo.DeletedByOctaId = userId;
                        if (notificationSharedTo.DeletedByUserId != null)
                        {
                            notificationSharedTo.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        notificationSharedTo.DeletedByUserId = userId;
                        if (notificationSharedTo.DeletedByOctaId != null)
                        {
                            notificationSharedTo.DeletedByOctaId = null;
                        }
                    }
                    Unit_Of_Work.notificationSharedTo_Repository.Update(notificationSharedTo);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
