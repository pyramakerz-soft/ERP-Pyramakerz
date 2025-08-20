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
        private readonly FileValidationService _fileValidationService;
        private readonly UserTreeService _userTreeService;

        public ChatController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, UserTreeService userTreeService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _userTreeService = userTreeService;
        }

        //////////////////////////////////////////////////////////////////////////////////////////

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

            if (userTypeForSender.ID == 1)
            {
                Employee emp = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewMessage.SenderID);
                if (emp == null)
                {
                    return BadRequest("No Sender With this ID");
                }
            }
            else if (userTypeForSender.ID == 2)
            {
                Student stu = Unit_Of_Work.student_Repository.First_Or_Default(d => d.IsDeleted != true && d.ID == NewMessage.SenderID);
                if (stu == null)
                {
                    return BadRequest("No Sender With this ID");
                }
            }
            else if (userTypeForSender.ID == 3)
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

            if((NewMessage.SenderUserTypeID == 2 || NewMessage.SenderUserTypeID == 3) && NewMessage.ReceiverUserTypeID != 1)
            {
                return BadRequest("You Can't send Messages to This user Type");
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

            if (targetUserIds.Count == 0)
            {
                return NotFound("No Users To Text");
            }

            foreach (var file in NewMessage.ChatMessageAttachmentFiles)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(file);

                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
            }

            // If Student Or Parent ==> Make Sure To Send Message To Employees that Receives Messages Or The Student Teachers - CoTeachers
            // Note ==> if Parent make sure that atleast the teacher is one for his student Or In the remedial

            // If Employee ==> can Send To any student and parent

            ChatMessage chatMessage = mapper.Map<ChatMessage>(NewMessage);
            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            chatMessage.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);

            foreach (long userID in targetUserIds)
            {
                ChatMessage chat = chatMessage;
                chat.ReceiverID = userID;
                Unit_Of_Work.chatMessage_Repository.Add(chat);
            }

            Unit_Of_Work.SaveChanges();

            if (NewMessage.ChatMessageAttachmentFiles != null && NewMessage.ChatMessageAttachmentFiles.Count == 0)
            {
                var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/ChatMessage");
                var chatFolder = Path.Combine(baseFolder, chatMessage.ID.ToString());
                if (!Directory.Exists(chatFolder))
                {
                    Directory.CreateDirectory(chatFolder);
                }
                foreach (var file in NewMessage.ChatMessageAttachmentFiles)
                {
                    ChatMessageAttachment chatMessageAttachment = new ChatMessageAttachment();
                    chatMessageAttachment.ChatMessageID = chatMessage.ID;

                    if (file.Length > 0)
                    {
                        var filePath = Path.Combine(chatFolder, file.FileName);
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }
                    }
                    chatMessageAttachment.FileLink = Path.Combine("Uploads", "ChatMessage", chatMessage.ID.ToString(), file.FileName);
                    Unit_Of_Work.chatMessageAttachment_Repository.Add(chatMessageAttachment);
                }
            }

            Unit_Of_Work.SaveChanges();

            return Ok();
        }

        //////////////////////////////////////////////////////////////////////////////////////////

        [HttpPost("Forward")]
        [Authorize_Endpoint_(
           allowedTypes: new[] { "octa", "employee", "parent", "student" }
        )]
        public async Task<IActionResult> Forward(ChatForwardDTO ForwardedMessage)
        {
            return Ok();
        }
    }
}
