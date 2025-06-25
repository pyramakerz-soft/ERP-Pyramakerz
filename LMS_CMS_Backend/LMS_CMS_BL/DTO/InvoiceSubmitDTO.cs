namespace LMS_CMS_BL.DTO
{
    public class InvoiceSubmitDTO
    {
        public long schoolId { get; set; }
        public long[]? selectedInvoices { get; set; } = null;
    }
}
