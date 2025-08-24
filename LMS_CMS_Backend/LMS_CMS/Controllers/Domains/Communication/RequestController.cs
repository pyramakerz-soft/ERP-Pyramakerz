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
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using LMS_CMS_PL.Services.FileValidations;

namespace LMS_CMS_PL.Controllers.Domains.Communication
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class RequestController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;
        private readonly SendNotificationService _sendNotificationService;
        private readonly RequestService _requestService;
        private readonly ValidTeachersForStudentService _validTeachersForStudentService;

        public RequestController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, SendNotificationService sendNotificationService, RequestService requestService, ValidTeachersForStudentService validTeachersForStudentService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _sendNotificationService = sendNotificationService;
            _requestService = requestService;
            _validTeachersForStudentService = validTeachersForStudentService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        private (string EnglishName, string ArabicName) GetUserNames(UOW unitOfWork, long userId, long userTypeId)
        {
            string englishName = string.Empty;
            string arabicName = string.Empty;

            switch (userTypeId)
            {
                case 1: 
                    Employee employee = unitOfWork.employee_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (employee != null)
                    {
                        englishName = employee.en_name;
                        arabicName = employee.ar_name;
                    }
                    break;

                case 2: 
                    Student student = unitOfWork.student_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (student != null)
                    {
                        englishName = student.en_name;
                        arabicName = student.ar_name;
                    }
                    break;

                case 3: 
                    Parent parent = unitOfWork.parent_Repository.First_Or_Default(d => d.ID == userId && d.IsDeleted != true);
                    if (parent != null)
                    {
                        englishName = parent.en_name;
                        arabicName = parent.ar_name;
                    }
                    break; 

                default:
                    throw new ArgumentException("Invalid user type ID");
            }

            return (englishName, arabicName);
        } 

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetSentOnesByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> GetSentOnesByUserID()
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

            List<Request> requests = await Unit_Of_Work.request_Repository.Select_All_With_IncludesById<Request>(
                    f => f.IsDeleted != true &&
                    (f.SenderID == userId && f.SenderUserTypeID == userTypeID),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType)
                    );

            if (requests == null || requests.Count == 0)
            {
                return NotFound();
            }

            requests = requests
                .OrderByDescending(d => d.InsertedAt)
                .ToList();

            List<RequestGetDTO> requestsGetDTO = mapper.Map<List<RequestGetDTO>>(requests);

            foreach (var request in requestsGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(request.FileLink))
                {
                    request.FileLink = $"{serverUrl}{request.FileLink.Replace("\\", "/")}";
                }
                 
                (request.SenderEnglishName, request.SenderArabicName) = GetUserNames(Unit_Of_Work, request.SenderID, request.SenderUserTypeID);
                (request.ReceiverEnglishName, request.ReceiverArabicName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);
                if (request.ForwardedFromID != null && request.ForwardedFromID != 0)
                {
                    (request.ForwardedFromEnglishName, request.ForwardedFromArabicName) = GetUserNames(Unit_Of_Work, request.ForwardedFromID.Value, 1);
                }
                if (request.ForwardedToID != null && request.ForwardedToID != 0)
                {
                    (request.ForwardedToEnglishName, request.ForwardedToArabicName) = GetUserNames(Unit_Of_Work, request.ForwardedToID.Value, 1);
                }
            }

            return Ok(requestsGetDTO);
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("GetReceivedOnesByUserID")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> GetReceivedOnesByUserID()
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

            List<Request> requests = await Unit_Of_Work.request_Repository.Select_All_With_IncludesById<Request>(
                    f => f.IsDeleted != true &&
                    (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType)
                    );

            if (requests == null || requests.Count == 0)
            {
                return NotFound();
            }

            requests = requests
                .OrderByDescending(d => d.InsertedAt)
                .ToList();

            List<RequestGetDTO> requestsGetDTO = mapper.Map<List<RequestGetDTO>>(requests);

            foreach (var request in requestsGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(request.FileLink))
                {
                    request.FileLink = $"{serverUrl}{request.FileLink.Replace("\\", "/")}";
                }
                 
                (request.SenderEnglishName, request.SenderArabicName) = GetUserNames(Unit_Of_Work, request.SenderID, request.SenderUserTypeID);
                (request.ReceiverEnglishName, request.ReceiverArabicName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);
                if (request.ForwardedFromID != null && request.ForwardedFromID != 0)
                {
                    (request.ForwardedFromEnglishName, request.ForwardedFromArabicName) = GetUserNames(Unit_Of_Work, request.ForwardedFromID.Value, 1);
                }
                if (request.ForwardedToID != null && request.ForwardedToID != 0)
                {
                    (request.ForwardedToEnglishName, request.ForwardedToArabicName) = GetUserNames(Unit_Of_Work, request.ForwardedToID.Value, 1);
                }
            }

            return Ok(requestsGetDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////

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

            List<Request> requests = await Unit_Of_Work.request_Repository.Select_All_With_IncludesById<Request>(
                    f => f.IsDeleted != true &&
                    (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType)
                    );

            if (requests == null || requests.Count == 0)
            {
                return NotFound();
            }

            requests = requests
                .OrderByDescending(d => d.InsertedAt)
                .Take(5)
                .ToList(); 

            List<RequestGetDTO> requestsGetDTO = mapper.Map<List<RequestGetDTO>>(requests);

            foreach (var request in requestsGetDTO)
            {
                string serverUrl = $"{Request.Scheme}://{Request.Host}/";
                if (!string.IsNullOrEmpty(request.FileLink))
                {
                    request.FileLink = $"{serverUrl}{request.FileLink.Replace("\\", "/")}";
                }

                (request.SenderEnglishName, request.SenderArabicName) = GetUserNames(Unit_Of_Work, request.SenderID, request.SenderUserTypeID);
                (request.ReceiverEnglishName, request.ReceiverArabicName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);
                if (request.ForwardedFromID != null && request.ForwardedFromID != 0)
                {
                    (request.ForwardedFromEnglishName, request.ForwardedFromArabicName) = GetUserNames(Unit_Of_Work, request.ForwardedFromID.Value, 1);
                }
                if (request.ForwardedToID != null && request.ForwardedToID != 0)
                {
                    (request.ForwardedToEnglishName, request.ForwardedToArabicName) = GetUserNames(Unit_Of_Work, request.ForwardedToID.Value, 1);
                }
            }

            return Ok(requestsGetDTO);
        }

        ////////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByUserIDAndRequestID/{requestID}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> ByUserIDAndRequestID(long requestID)
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

            Request request = await Unit_Of_Work.request_Repository.FindByIncludesAsync(
                    f => f.IsDeleted != true && f.ID == requestID &&
                    ((f.SenderID == userId && f.SenderUserTypeID == userTypeID)
                    || (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID)),
                    query => query.Include(d => d.SenderUserType),
                    query => query.Include(d => d.ReceiverUserType)
                    );

            if (request == null)
            {
                return NotFound();
            }

            RequestGetDTO requestGetDTO = mapper.Map<RequestGetDTO>(request);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(requestGetDTO.FileLink))
            {
                requestGetDTO.FileLink = $"{serverUrl}{requestGetDTO.FileLink.Replace("\\", "/")}";
            }

            (requestGetDTO.SenderEnglishName, requestGetDTO.SenderArabicName) = GetUserNames(Unit_Of_Work, requestGetDTO.SenderID, requestGetDTO.SenderUserTypeID);
            (requestGetDTO.ReceiverEnglishName, requestGetDTO.ReceiverArabicName) = GetUserNames(Unit_Of_Work, requestGetDTO.ReceiverID, requestGetDTO.ReceiverUserTypeID);
            if (requestGetDTO.ForwardedFromID != null && requestGetDTO.ForwardedFromID != 0)
            {
                (requestGetDTO.ForwardedFromEnglishName, requestGetDTO.ForwardedFromArabicName) = GetUserNames(Unit_Of_Work, requestGetDTO.ForwardedFromID.Value, 1);
            }
            if (requestGetDTO.ForwardedToID != null && requestGetDTO.ForwardedToID != 0)
            {
                (requestGetDTO.ForwardedToEnglishName, requestGetDTO.ForwardedToArabicName) = GetUserNames(Unit_Of_Work, requestGetDTO.ForwardedToID.Value, 1);
            }

            if(userId == request.ReceiverID && userTypeID == request.ReceiverUserTypeID)
            {
                request.SeenOrNot = true;
                TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                request.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                Unit_Of_Work.request_Repository.Update(request);

                Unit_Of_Work.SaveChanges();
            }

            return Ok(requestGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("UnSeenRequestCount")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public IActionResult UnSeenRequestCount()
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

            List<Request> requests = Unit_Of_Work.request_Repository.FindBy(
                    f => f.IsDeleted != true && !f.SeenOrNot && f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID);

            return Ok(requests.Count);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("Accept/{requestID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> AcceptAsync(long requestID)
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

            Request request = Unit_Of_Work.request_Repository.First_Or_Default(
                    f => f.IsDeleted != true  && f.ID == requestID 
                    && (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID));

            if (request == null)
            {
                return NotFound();
            }

            if (request.ForwardedOrNot == true)
            {
                return BadRequest("You can't Accept it after you had forwarded it");
            }

            request.SeenOrNot = true;
            request.ApprovedOrNot = true; 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            request.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.request_Repository.Update(request);
            Unit_Of_Work.SaveChanges();

            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();
            var formattedDate = request.InsertedAt?.ToString("MMMM dd, yyyy 'at' hh:mm tt");
            (var englishUserName, var arabicUserName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);

            var message = $"Your Request Has Been Accepted by {englishUserName} ({arabicUserName}) (submitted on {formattedDate})";

            await _sendNotificationService.SendNotificationAsync(Unit_Of_Work, message, request.SenderUserTypeID, request.SenderID, domainName);
            await _requestService.NotifyNewRequest(request.SenderID, request.SenderUserTypeID, domainName);
            await _requestService.NotifyNewRequest(request.ReceiverID, request.ReceiverUserTypeID, domainName);

            return Ok();
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("Decline/{requestID}")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> DeclineAsync(long requestID)
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

            Request request = Unit_Of_Work.request_Repository.First_Or_Default(
                    f => f.IsDeleted != true  && f.ID == requestID 
                    && (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID));

            if (request == null)
            {
                return NotFound();
            }

            if(request.ForwardedOrNot == true)
            {
                return BadRequest("You can't Decline it after you had forwarded it");
            }
             
            request.SeenOrNot = true;
            request.ApprovedOrNot = false; 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            request.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.request_Repository.Update(request);

            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();
            var formattedDate = request.InsertedAt?.ToString("MMMM dd, yyyy 'at' hh:mm tt"); 
            (var englishUserName, var arabicUserName) = GetUserNames(Unit_Of_Work, request.ReceiverID, request.ReceiverUserTypeID);
             
            var message = $"Your Request Has Been Declined by {englishUserName} ({arabicUserName}) (submitted on {formattedDate})";

            await _sendNotificationService.SendNotificationAsync(Unit_Of_Work, message, request.SenderUserTypeID, request.SenderID, domainName);
            await _requestService.NotifyNewRequest(request.SenderID, request.SenderUserTypeID, domainName);
            await _requestService.NotifyNewRequest(request.ReceiverID, request.ReceiverUserTypeID, domainName);

            return Ok();
        }
        
        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut("Forward")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee"}
        )]
        public async Task<IActionResult> ForwardAsync(ForwardRequestDTO forwardRequestDTO)
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

            if(userTypeID != 1)
            {
                return BadRequest("You Have no access to forward the request");
            }

            Employee employeeToForwardTo = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == forwardRequestDTO.ForwardToID && d.IsDeleted != true);
            if (employeeToForwardTo == null)
            {
                return NotFound("No Employee with this ID");
            }

            if(employeeToForwardTo.CanReceiveRequest != true)
            {
                return BadRequest("You can't request from this employee");
            }

            Request request = Unit_Of_Work.request_Repository.First_Or_Default(
                    f => f.IsDeleted != true  && f.ID == forwardRequestDTO.RequestID
                    && (f.ReceiverID == userId && f.ReceiverUserTypeID == userTypeID)
                    );

            if(request == null)
            {
                return NotFound("You Don't have a request with this ID");
            }

            if (forwardRequestDTO.ForwardToID == request.SenderID && request.SenderUserTypeID == 1)
            {
                return BadRequest("You can't send the request back to the employee");
            }

            if (request.ForwardedOrNot == true)
            {
                return BadRequest("You have already forwarded the request");
            }

            if (request == null)
            {
                return NotFound("You don't have any request with this ID");
            }
            
            if (request.ApprovedOrNot != null)
            {
                return BadRequest("You can't forward the request after you approve or decline it");
            }
            
            if (request.ReceiverID == userId && forwardRequestDTO.ForwardToID == userId)
            {
                return BadRequest("You can't forward the request to yourself");
            } 

            request.SeenOrNot = true;
            request.ForwardedOrNot = true; 
            request.ForwardedToID = forwardRequestDTO.ForwardToID; 
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            request.ForwardedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            Unit_Of_Work.request_Repository.Update(request);

            Request newRequest = new Request();
            newRequest.Message = request.Message;
            newRequest.Link = request.Link;
            newRequest.SenderID = request.SenderID;
            newRequest.SenderUserTypeID = request.SenderUserTypeID;
            newRequest.ReceiverID = forwardRequestDTO.ForwardToID;
            newRequest.ReceiverUserTypeID = request.ReceiverUserTypeID;
            newRequest.ForwardedFromID = userId;
            newRequest.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            Unit_Of_Work.request_Repository.Add(newRequest);
            Unit_Of_Work.SaveChanges();

            if (request.FileLink != null)
            {
                var normalizedFileLink = request.FileLink.Replace('\\', Path.DirectorySeparatorChar);
                 
                var originalFilePath = Path.Combine(Directory.GetCurrentDirectory(), normalizedFileLink);

                if (System.IO.File.Exists(originalFilePath))
                {
                    // Create new request folder
                    var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Request");
                    var newRequestFolder = Path.Combine(baseFolder, newRequest.ID.ToString());

                    if (!Directory.Exists(newRequestFolder))
                    {
                        Directory.CreateDirectory(newRequestFolder);
                    }

                    // Get the filename from the original path
                    var fileName = Path.GetFileName(request.FileLink);

                    // Create new file path
                    var newFilePath = Path.Combine(newRequestFolder, fileName);

                    // Copy the file
                    System.IO.File.Copy(originalFilePath, newFilePath, overwrite: true);
                     
                    newRequest.FileLink = Path.Combine("Uploads", "Request", newRequest.ID.ToString(), fileName);
                    Unit_Of_Work.request_Repository.Update(newRequest); 
                }
                else
                {
                    return BadRequest("File doesn't exists in this route");
                } 
            }

            Unit_Of_Work.SaveChanges();

            var domainName = HttpContext.Request.Headers["Domain-Name"].FirstOrDefault();

            await _requestService.NotifyNewRequest(newRequest.SenderID, newRequest.SenderUserTypeID, domainName);
            await _requestService.NotifyNewRequest(newRequest.ReceiverID, newRequest.ReceiverUserTypeID, domainName);
            await _requestService.NotifyNewRequest(userId, 1, domainName);

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
          allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> AddAsync(RequestAddDTO NewRequest)
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

            long userTypeID = userTypeClaim switch
            {
                "employee" => 1,
                "student" => 2,
                "parent" => 3
            };

            if (NewRequest == null)
            {
                return BadRequest("Request cannot be null");
            }

            UserType userType = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewRequest.ReceiverUserTypeID);
            if (userType == null)
            {
                return BadRequest("No User Type With this ID");
            }

            switch (NewRequest.ReceiverUserTypeID)
            {
                case 1:
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == NewRequest.ReceiverID && d.IsDeleted != true);
                    if (employee == null)
                    {
                        return NotFound("No Employee With this ID");
                    }
                    if(userTypeID == 1 && employee.CanReceiveRequest != true)
                    {
                        return BadRequest("You Can't Request from this user");
                    }
                    break;

                case 2:
                    Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.ID == NewRequest.ReceiverID && d.IsDeleted != true);
                    if (student == null)
                    {
                        return NotFound("No Student With this ID");
                    }
                    break;

                case 3:
                    Parent parent = Unit_Of_Work.parent_Repository.First_Or_Default(d => d.ID == NewRequest.ReceiverID && d.IsDeleted != true);
                    if (parent == null)
                    {
                        return NotFound("No Parent With this ID");
                    }
                    break;

                default:
                    throw new ArgumentException("Invalid user type ID");
            }

            if (NewRequest.ReceiverID == userId && NewRequest.ReceiverUserTypeID == userTypeID)
            {
                return BadRequest("You can't send the request to yourself");
            }

            if (NewRequest.FileFile == null && NewRequest.Message == null && NewRequest.Link == null)
            {
                return BadRequest("You have to choose one element atleast to appear");
            }

            if ((userTypeID == 2 || userTypeID == 3) && (NewRequest.ReceiverUserTypeID == 2 || NewRequest.ReceiverUserTypeID == 3))
            {
                return BadRequest("You Can't Send Requests To This User Type");
            } 

            if (NewRequest.FileFile != null)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(NewRequest.FileFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                } 
            } 

            if ((userTypeID == 2 || userTypeID == 3) && NewRequest.ReceiverUserTypeID == 1)
            {
                Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewRequest.ReceiverID);
                if (emp?.CanReceiveRequestFromParent != true)
                {
                    if (userTypeID == 3 && (NewRequest.StudentID == null || NewRequest.StudentID == 0))
                    {
                        return BadRequest("You must select a student");
                    }

                    if (userTypeID == 3 && NewRequest.StudentID != null)
                    {
                        Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.ID == NewRequest.StudentID && d.IsDeleted != true && d.Parent_Id == userId);
                        if (student == null)
                        {
                            return NotFound("No Student With this ID For this parent");
                        }
                    }

                    long studentId = userTypeID == 2 ? userId : NewRequest.StudentID.Value;
                    var teacherIDs = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(studentId, Unit_Of_Work);

                    if (teacherIDs.Count == 0 || !teacherIDs.Contains(NewRequest.ReceiverID))
                    {
                        return BadRequest("You can only send requests to your current teachers or employees that can accept requests from student or parent");
                    }
                } 
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            Request request = new Request();
            request.Message = NewRequest.Message;
            request.Link = NewRequest.Link;
            request.SenderID = userId;
            request.ReceiverID = NewRequest.ReceiverID;
            request.SenderUserTypeID = userTypeID;
            request.ReceiverUserTypeID = NewRequest.ReceiverUserTypeID;
            request.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            Unit_Of_Work.request_Repository.Add(request);
            Unit_Of_Work.SaveChanges();

            if (NewRequest.FileFile != null)
            { 
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/Request");
                var requestFolder = Path.Combine(baseFolder,request.ID.ToString());
                if (!Directory.Exists(requestFolder))
                {
                    Directory.CreateDirectory(requestFolder);
                }

                if (NewRequest.FileFile.Length > 0)
                {
                    var filePath = Path.Combine(requestFolder, NewRequest.FileFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewRequest.FileFile.CopyToAsync(stream);
                    }
                }

                request.FileLink = Path.Combine("Uploads", "Request", request.ID.ToString(), NewRequest.FileFile.FileName);
                Unit_Of_Work.request_Repository.Update(request);
            } 

            Unit_Of_Work.SaveChanges();

            await _requestService.NotifyNewRequest(request.ReceiverID, request.ReceiverUserTypeID, domainName);
            await _requestService.NotifyNewRequest(request.SenderID, request.SenderUserTypeID, domainName);

            return Ok();
        } 
    }
}
