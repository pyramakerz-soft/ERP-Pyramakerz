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
    public class RequestController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileValidationService _fileValidationService;
        private readonly UserTreeService _userTreeService; 

        public RequestController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, UserTreeService userTreeService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _userTreeService = userTreeService; 
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

            if (NewRequest.FileFile == null && NewRequest.Message == null && NewRequest.Link == null)
            {
                return BadRequest("You have to choose one element atleast to appear");
            }
             
            List<long> targetUserIds;
            try
            {
                targetUserIds = _userTreeService.GetUsersAccordingToTree(Unit_Of_Work, NewRequest.ReceiverUserTypeID, NewRequest.UserFilters);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }

            if(targetUserIds.Count == 0)
            {
                return NotFound("No Users To Request From");
            }

            if (NewRequest.FileFile != null)
            {
                string returnFileInput = _fileValidationService.ValidateFile(NewRequest.FileFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }

            }

            if ((userTypeID == 2 || userTypeID == 3) && (NewRequest.ReceiverUserTypeID == 2 || NewRequest.ReceiverUserTypeID == 3))
            {
                return BadRequest("You Can't Send Requests To This User Type");
            }

            foreach (long receiverID in targetUserIds)
            {
                if (userTypeID == 1 && NewRequest.ReceiverUserTypeID == 1)
                {
                    Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == receiverID);
                    if (emp.CanReceiveRequest != true)
                    {
                        return BadRequest("You Can't Request From One Of Your Selected Users");
                    }
                } else if (userTypeID == 2 && NewRequest.ReceiverUserTypeID == 1)
                {

                } else if (userTypeID == 3 && NewRequest.ReceiverUserTypeID == 1)
                {

                }
            }
            
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long receiverID in targetUserIds)
            {  
                Request request = new Request();
                request.Message = NewRequest.Message;
                request.Link = NewRequest.Link;
                request.SenderID = userId;
                request.ReceiverID = receiverID;
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
            }

            Unit_Of_Work.SaveChanges();

            // run the function that counts the number of the Requests not seen  

            return Ok();
        }
    }
}
