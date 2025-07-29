using AutoMapper;
using LMS_CMS_BL.DTO.Administration;
using LMS_CMS_BL.DTO.LMS;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using LMS_CMS_DAL.Models.Domains.Administration;
using LMS_CMS_DAL.Models.Domains.LMS;
using LMS_CMS_PL.Attribute;
using LMS_CMS_PL.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LMS_CMS_PL.Controllers.Domains.LMS
{
    [Route("api/with-domain/[controller]")]
    [ApiController]
    [Authorize]
    public class DiscussionRoomController : ControllerBase
    {
        private readonly DbContextFactoryService _dbContextFactory;
        IMapper mapper;
        private readonly CheckPageAccessService _checkPageAccessService;
        private readonly FileImageValidationService _fileImageValidationService;

        public DiscussionRoomController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileImageValidationService fileImageValidationService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileImageValidationService = fileImageValidationService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Discussion Room" }
        )]
        public async Task<IActionResult> GetAsync()
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            List<DiscussionRoom> discussionRooms = await Unit_Of_Work.discussionRoom_Repository.Select_All_With_IncludesById<DiscussionRoom>(
                    f => f.IsDeleted != true,
                    query => query.Include(d => d.DiscussionRoomStudentClassrooms.Where(d => d.IsDeleted != true))
                    );

            if (discussionRooms == null || discussionRooms.Count == 0)
            {
                return NotFound();
            }

            List<DiscussionRoomGetDTO> discussionRoomGetDTO = mapper.Map<List<DiscussionRoomGetDTO>>(discussionRooms);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            foreach (var discussionRoom in discussionRoomGetDTO)
            {
                if (!string.IsNullOrEmpty(discussionRoom.ImageLink))
                {
                    discussionRoom.ImageLink = $"{serverUrl}{discussionRoom.ImageLink.Replace("\\", "/")}";
                }
            }

            return Ok(discussionRoomGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Discussion Room" }
        )]
        public async Task<IActionResult> GetByID(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DiscussionRoom discussionRoom = await Unit_Of_Work.discussionRoom_Repository.FindByIncludesAsync(
                d => d.IsDeleted != true && d.ID == id,
                query => query.Include(d => d.DiscussionRoomStudentClassrooms.Where(d => d.IsDeleted != true))
                );

            if (discussionRoom == null)
            {
                return NotFound();
            }

            DiscussionRoomGetDTO discussionRoomGetDTO = mapper.Map<DiscussionRoomGetDTO>(discussionRoom);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(discussionRoom.ImageLink))
            {
                discussionRoomGetDTO.ImageLink = $"{serverUrl}{discussionRoomGetDTO.ImageLink.Replace("\\", "/")}";
            }

            return Ok(discussionRoomGetDTO);
        }


        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpGet("ByIdWithoutInclude/{id}")]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            pages: new[] { "Discussion Room" }
        )]
        public async Task<IActionResult> GetByIdWithoutInclude(long id)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            DiscussionRoom discussionRoom = Unit_Of_Work.discussionRoom_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == id);

            if (discussionRoom == null)
            {
                return NotFound();
            }

            DiscussionRoomGetDTO discussionRoomGetDTO = mapper.Map<DiscussionRoomGetDTO>(discussionRoom);

            string serverUrl = $"{Request.Scheme}://{Request.Host}/";
            if (!string.IsNullOrEmpty(discussionRoom.ImageLink))
            {
                discussionRoomGetDTO.ImageLink = $"{serverUrl}{discussionRoomGetDTO.ImageLink.Replace("\\", "/")}";
            }

            return Ok(discussionRoomGetDTO);
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost]
        [Authorize_Endpoint_(
              allowedTypes: new[] { "octa", "employee" },
              pages: new[] { "Discussion Room" }
        )]
        public async Task<IActionResult> AddAsync([FromForm] DiscussionRoomAdd NewDiscussionRoom)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (NewDiscussionRoom == null)
            {
                return BadRequest("Discussion Room cannot be null");
            }

            if (NewDiscussionRoom.StartDate > NewDiscussionRoom.EndDate)
            {
                return BadRequest("Start date must be before end date.");
            }

            DiscussionRoom discussionRoom = mapper.Map<DiscussionRoom>(NewDiscussionRoom);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            discussionRoom.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                discussionRoom.InsertedByOctaId = userId;
            }
            else if (userTypeClaim == "employee")
            {
                discussionRoom.InsertedByUserId = userId;
            }
             
            Unit_Of_Work.discussionRoom_Repository.Add(discussionRoom);
            Unit_Of_Work.SaveChanges();

            if(NewDiscussionRoom.ImageFile != null)
            {
                string returnFileInput = _fileImageValidationService.ValidateImageFile(NewDiscussionRoom.ImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }

                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/DiscussionRoom"); 
                var discussionRoomFolder = Path.Combine(baseFolder, discussionRoom.ID.ToString()); 
                if (!Directory.Exists(discussionRoomFolder))
                {
                    Directory.CreateDirectory(discussionRoomFolder);
                }

                if (NewDiscussionRoom.ImageFile.Length > 0)
                {
                    var filePath = Path.Combine(discussionRoomFolder, NewDiscussionRoom.ImageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await NewDiscussionRoom.ImageFile.CopyToAsync(stream);
                    }
                } 

                discussionRoom.ImageLink = Path.Combine("Uploads", "DiscussionRoom", discussionRoom.ID.ToString(), NewDiscussionRoom.ImageFile.FileName);
                Unit_Of_Work.discussionRoom_Repository.Update(discussionRoom);
            }


            foreach (long studentClassID in NewDiscussionRoom.StudentClassrooms)
            {
                StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(g => g.ID == studentClassID);
                if (studentClassroom != null)
                {
                    DiscussionRoomStudentClassroom discussionRoomStudentClassroom = new DiscussionRoomStudentClassroom();
                    discussionRoomStudentClassroom.DiscussionRoomID = discussionRoom.ID;
                    discussionRoomStudentClassroom.StudentClassroomID = studentClassID;
                    discussionRoomStudentClassroom.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        discussionRoomStudentClassroom.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        discussionRoomStudentClassroom.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.discussionRoomStudentClassroom_Repository.Add(discussionRoomStudentClassroom);
                }

            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPut]
        [Authorize_Endpoint_(
            allowedTypes: new[] { "octa", "employee" },
            allowEdit: 1,
            pages: new[] { "Discussion Room" }
        )]
        public async Task<IActionResult> Edit([FromForm] DiscussionRoomPutDTO EditDiscussionRoom)
        {
            UOW Unit_Of_Work = _dbContextFactory.CreateOneDbContext(HttpContext);

            var userIdClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "id")?.Value;
            long.TryParse(userIdClaim, out long userId);
            var userTypeClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "type")?.Value;
            var userRoleClaim = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "http://schemas.microsoft.com/ws/2008/06/identity/claims/role")?.Value;
            long.TryParse(userRoleClaim, out long roleId);

            if (userIdClaim == null || userTypeClaim == null)
            {
                return Unauthorized("User ID or Type claim not found.");
            }

            if (EditDiscussionRoom == null)
            {
                return BadRequest("Discussion Room cannot be null");
            }

            DiscussionRoom discussionRoomExists = Unit_Of_Work.discussionRoom_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == EditDiscussionRoom.ID);

            if (discussionRoomExists == null)
            {
                return NotFound();
            }

            if (EditDiscussionRoom.StartDate > EditDiscussionRoom.EndDate)
            {
                return BadRequest("Start date must be before end date.");
            }

            if (EditDiscussionRoom.ImageFile != null)
            {
                string returnFileInput = _fileImageValidationService.ValidateImageFile(EditDiscussionRoom.ImageFile);
                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            string imageLinkExists = discussionRoomExists.ImageLink;

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfEditPageAvailable(Unit_Of_Work, "Discussion Room", roleId, userId, discussionRoomExists);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            if (EditDiscussionRoom.ImageFile != null)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/DiscussionRoom");
                var discussionRoomFolder = Path.Combine(baseFolder, EditDiscussionRoom.ID.ToString());

                if (System.IO.File.Exists(discussionRoomFolder))
                {
                    System.IO.File.Delete(discussionRoomFolder); // Delete the old file
                }

                if (Directory.Exists(discussionRoomFolder))
                {
                    Directory.Delete(discussionRoomFolder, true);
                }

                if (!Directory.Exists(discussionRoomFolder))
                {
                    Directory.CreateDirectory(discussionRoomFolder);
                }

                if (EditDiscussionRoom.ImageFile.Length > 0)
                {
                    var filePath = Path.Combine(discussionRoomFolder, EditDiscussionRoom.ImageFile.FileName);
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        await EditDiscussionRoom.ImageFile.CopyToAsync(stream);
                    }
                }

                EditDiscussionRoom.ImageLink = Path.Combine("Uploads", "DiscussionRoom", EditDiscussionRoom.ID.ToString(), EditDiscussionRoom.ImageFile.FileName);
            }
            else
            {
                EditDiscussionRoom.ImageLink = imageLinkExists;
            }

            mapper.Map(EditDiscussionRoom, discussionRoomExists);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            discussionRoomExists.UpdatedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                discussionRoomExists.UpdatedByOctaId = userId;
                if (discussionRoomExists.UpdatedByUserId != null)
                {
                    discussionRoomExists.UpdatedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                discussionRoomExists.UpdatedByUserId = userId;
                if (discussionRoomExists.UpdatedByOctaId != null)
                {
                    discussionRoomExists.UpdatedByOctaId = null;
                }
            }

            Unit_Of_Work.discussionRoom_Repository.Update(discussionRoomExists);

            List<DiscussionRoomStudentClassroom> discussionRoomStudentClassrooms = Unit_Of_Work.discussionRoomStudentClassroom_Repository.FindBy(d => d.DiscussionRoomID == EditDiscussionRoom.ID && d.IsDeleted != true);
            List<long> existingStudentClassroomIDs = discussionRoomStudentClassrooms.Select(a => a.StudentClassroomID).ToList();

            var studentClassroomIDsToAdd = EditDiscussionRoom.StudentClassrooms.Except(existingStudentClassroomIDs).ToList();
            var studentClassroomIDsToRemove = existingStudentClassroomIDs.Except(EditDiscussionRoom.StudentClassrooms).ToList();

            foreach (long studentClassID in studentClassroomIDsToRemove)
            {
                var discussionRoomStudentClassroom = discussionRoomStudentClassrooms.FirstOrDefault(a => a.StudentClassroomID == studentClassID);
                discussionRoomStudentClassroom.IsDeleted = true;
                discussionRoomStudentClassroom.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                if (userTypeClaim == "octa")
                {
                    discussionRoomStudentClassroom.DeletedByOctaId = userId;
                    if (discussionRoomStudentClassroom.DeletedByUserId != null)
                    {
                        discussionRoomStudentClassroom.DeletedByUserId = null;
                    }
                }
                else if (userTypeClaim == "employee")
                {
                    discussionRoomStudentClassroom.DeletedByUserId = userId;
                    if (discussionRoomStudentClassroom.DeletedByOctaId != null)
                    {
                        discussionRoomStudentClassroom.DeletedByOctaId = null;
                    }
                }

                Unit_Of_Work.discussionRoomStudentClassroom_Repository.Update(discussionRoomStudentClassroom);
            }

            foreach (long studentClassID in studentClassroomIDsToAdd)
            {
                StudentClassroom studentClassroom = Unit_Of_Work.studentClassroom_Repository.First_Or_Default(g => g.ID == studentClassID);
                if (studentClassroom != null)
                {
                    DiscussionRoomStudentClassroom discussionRoomStudentClassroom = new DiscussionRoomStudentClassroom
                    {
                        DiscussionRoomID = EditDiscussionRoom.ID,
                        StudentClassroomID = studentClassID,
                        InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone)
                    };

                    if (userTypeClaim == "octa")
                    {
                        discussionRoomStudentClassroom.InsertedByOctaId = userId;
                    }
                    else if (userTypeClaim == "employee")
                    {
                        discussionRoomStudentClassroom.InsertedByUserId = userId;
                    }

                    Unit_Of_Work.discussionRoomStudentClassroom_Repository.Add(discussionRoomStudentClassroom);
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
            pages: new[] { "Discussion Room" }
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
                return BadRequest("Enter Discussion Room ID");
            }

            DiscussionRoom discussionRoom = Unit_Of_Work.discussionRoom_Repository.First_Or_Default(t => t.IsDeleted != true && t.ID == id);

            if (discussionRoom == null)
            {
                return NotFound();
            }

            if (userTypeClaim == "employee")
            {
                IActionResult? accessCheck = _checkPageAccessService.CheckIfDeletePageAvailable(Unit_Of_Work, "Discussion Room", roleId, userId, discussionRoom);
                if (accessCheck != null)
                {
                    return accessCheck;
                }
            }

            discussionRoom.IsDeleted = true;
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            discussionRoom.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
            if (userTypeClaim == "octa")
            {
                discussionRoom.DeletedByOctaId = userId;
                if (discussionRoom.DeletedByUserId != null)
                {
                    discussionRoom.DeletedByUserId = null;
                }
            }
            else if (userTypeClaim == "employee")
            {
                discussionRoom.DeletedByUserId = userId;
                if (discussionRoom.DeletedByOctaId != null)
                {
                    discussionRoom.DeletedByOctaId = null;
                }
            }

            Unit_Of_Work.discussionRoom_Repository.Update(discussionRoom);

            List<DiscussionRoomStudentClassroom> discussionRoomStudentClassrooms = Unit_Of_Work.discussionRoomStudentClassroom_Repository.FindBy(d => d.DiscussionRoomID == id && d.IsDeleted != true);
            if (discussionRoomStudentClassrooms != null && discussionRoomStudentClassrooms.Count > 0)
            {
                foreach (var discussionRoomStudentClassroom in discussionRoomStudentClassrooms)
                {
                    discussionRoomStudentClassroom.IsDeleted = true;
                    discussionRoomStudentClassroom.DeletedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                    if (userTypeClaim == "octa")
                    {
                        discussionRoomStudentClassroom.DeletedByOctaId = userId;
                        if (discussionRoomStudentClassroom.DeletedByUserId != null)
                        {
                            discussionRoomStudentClassroom.DeletedByUserId = null;
                        }
                    }
                    else if (userTypeClaim == "employee")
                    {
                        discussionRoomStudentClassroom.DeletedByUserId = userId;
                        if (discussionRoomStudentClassroom.DeletedByOctaId != null)
                        {
                            discussionRoomStudentClassroom.DeletedByOctaId = null;
                        }
                    }
                    Unit_Of_Work.discussionRoomStudentClassroom_Repository.Update(discussionRoomStudentClassroom);
                }
            }

            Unit_Of_Work.SaveChanges();
            return Ok();
        }
    }
}
