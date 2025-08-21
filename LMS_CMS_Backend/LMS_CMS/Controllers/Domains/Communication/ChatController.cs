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
using LMS_CMS_PL.Services.FileValidations;
using System.Net;

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
        private readonly ValidTeachersForStudentService _validTeachersForStudentService;

        public ChatController(DbContextFactoryService dbContextFactory, IMapper mapper, CheckPageAccessService checkPageAccessService, FileValidationService fileValidationService, UserTreeService userTreeService, ValidTeachersForStudentService validTeachersForStudentService)
        {
            _dbContextFactory = dbContextFactory;
            this.mapper = mapper;
            _checkPageAccessService = checkPageAccessService;
            _fileValidationService = fileValidationService;
            _userTreeService = userTreeService;
            _validTeachersForStudentService = validTeachersForStudentService;
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

            long userTypeID = userTypeClaim switch
            {
                "employee" => 1,
                "student" => 2,
                "parent" => 3
            };

            if (NewMessage == null)
            {
                return BadRequest("Chat Message cannot be null");
            } 

            UserType userTypeForReceiver = Unit_Of_Work.userType_Repository.First_Or_Default(d => d.ID == NewMessage.ReceiverUserTypeID);
            if (userTypeForReceiver == null)
            {
                return BadRequest("No User Type For Receiver With this ID");
            }

            if((userTypeID == 2 || userTypeID == 3) && NewMessage.ReceiverUserTypeID != 1)
            {
                return BadRequest("You Can't send Messages to This user Type");
            }

            if ((NewMessage.Message == null || NewMessage.Message == "") && (NewMessage.ChatMessageAttachmentFiles == null || NewMessage.ChatMessageAttachmentFiles.Count == 0))
            {
                return BadRequest("You have to choose one element atleast to send (File - Message)");
            }

            foreach (var file in NewMessage.ChatMessageAttachmentFiles)
            {
                string returnFileInput = await _fileValidationService.ValidateFileWithTimeoutAsync(file);

                if (returnFileInput != null)
                {
                    return BadRequest(returnFileInput);
                }
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


            if (userTypeID == 3 && (NewMessage.StudentID == null || NewMessage.StudentID == 0))
            {
                return BadRequest("You must select a student");
            }

            if (userTypeID == 3 && NewMessage.StudentID != null)
            {
                Student student = Unit_Of_Work.student_Repository.First_Or_Default(d => d.ID == NewMessage.StudentID && d.IsDeleted != true && d.Parent_Id == userId);
                if (student == null)
                {
                    return NotFound("No Student With this ID For this parent");
                }
            }

            long studentId = 0;
            var teacherIDs = new List<long>();

            if(userTypeID == 2 || userTypeID == 3)
            {
                studentId = userTypeID == 2 ? userId : NewMessage.StudentID.Value;
                teacherIDs = await _validTeachersForStudentService.GetValidTeacherIdsForStudent(studentId, Unit_Of_Work);
            }

            if (NewMessage.ReceiverUserTypeID == 1 && (userTypeID == 2 || userTypeID == 3))
            {
                List<long> idsToRemove = new List<long>();

                foreach (long targetUserID in targetUserIds)
                {
                    Employee employee = Unit_Of_Work.employee_Repository.First_Or_Default(d => d.ID == targetUserID && d.IsDeleted != true);

                    // If can't receive message then see if he is his teacher if not then see if there are history between them if not so remove the id from the list
                    if (employee.CanReceiveMessageFromParent != true)
                    { 
                        if (teacherIDs.Count == 0 || !teacherIDs.Contains(targetUserID))
                        {
                            List<ChatMessage> chatMessages = Unit_Of_Work.chatMessage_Repository.FindBy(
                                d => (d.SenderID == userId && d.SenderUserTypeID == userTypeID && d.ReceiverID == targetUserID && d.ReceiverUserTypeID == NewMessage.ReceiverUserTypeID)||
                                     (d.SenderID == targetUserID && d.SenderUserTypeID == NewMessage.ReceiverUserTypeID && d.ReceiverID == userId && d.ReceiverUserTypeID == userTypeID)
                                );
                            if(chatMessages == null || chatMessages.Count == 0)
                            {
                                idsToRemove.Add(targetUserID);
                            }
                        }
                    } 
                }
                foreach (long idToRemove in idsToRemove)
                {
                    targetUserIds.Remove(idToRemove);
                }
            }

            // Don't message myself
            if (NewMessage.ReceiverUserTypeID == 1 && userTypeID == 1)
            {
                if (targetUserIds.Contains(userId))
                {
                    targetUserIds.Remove(userId);
                }
            }
            
            if (targetUserIds.Count == 0)
            {
                return NotFound("No Users To Text");
            }

            TimeZoneInfo cairoZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");

            foreach (long targetUserID in targetUserIds)
            {
                ChatMessage chat = new ChatMessage();
                chat.Message = NewMessage.Message;
                chat.SenderID = userId;
                chat.SenderUserTypeID = userTypeID;
                chat.ReceiverID = targetUserID;
                chat.ReceiverUserTypeID = NewMessage.ReceiverUserTypeID;
                chat.InsertedAt = TimeZoneInfo.ConvertTime(DateTime.Now, cairoZone);
                Unit_Of_Work.chatMessage_Repository.Add(chat);
    
                Unit_Of_Work.SaveChanges();
           
                if (NewMessage.ChatMessageAttachmentFiles != null && NewMessage.ChatMessageAttachmentFiles.Count == 0)
                {
                    var baseFolder = Path.Combine(Directory.GetCurrentDirectory(), "Uploads/ChatMessage");
                    var chatFolder = Path.Combine(baseFolder, chat.ID.ToString());
                    if (!Directory.Exists(chatFolder))
                    {
                        Directory.CreateDirectory(chatFolder);
                    }
                    foreach (var file in NewMessage.ChatMessageAttachmentFiles)
                    {
                        ChatMessageAttachment chatMessageAttachment = new ChatMessageAttachment();
                        chatMessageAttachment.ChatMessageID = chat.ID;

                        if (file.Length > 0)
                        {
                            var filePath = Path.Combine(chatFolder, file.FileName);
                            using (var stream = new FileStream(filePath, FileMode.Create))
                            {
                                await file.CopyToAsync(stream);
                            }
                        }
                        chatMessageAttachment.FileLink = Path.Combine("Uploads", "ChatMessage", chat.ID.ToString(), file.FileName);
                        Unit_Of_Work.chatMessageAttachment_Repository.Add(chatMessageAttachment);
                    }
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
