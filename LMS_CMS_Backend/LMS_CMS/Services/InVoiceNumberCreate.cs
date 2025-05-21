using AutoMapper;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Domains;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;

namespace LMS_CMS_PL.Services
{
    public class InVoiceNumberCreate
    {


        //public InVoiceNumberCreate(LMS_CMS_Context db)
        //{
        //    this.db = db;
        //}
        public async Task<string> GetNextInvoiceNumber(LMS_CMS_Context db, long storeId, long flagId)
        {
            var invoiceNumbers = await db.InventoryMaster
                .Where(x => x.StoreID == storeId && x.FlagId == flagId && !string.IsNullOrEmpty(x.InvoiceNumber))
                .Select(x => x.InvoiceNumber)
                .ToListAsync();

            long maxNumber = 0;

            foreach (var inv in invoiceNumbers)
            {
                if (long.TryParse(inv, out long parsedNumber))
                {
                    if (parsedNumber > maxNumber)
                    {
                        maxNumber = parsedNumber;
                    }
                }
            }

            long nextNumber = maxNumber + 1;
            return $"{nextNumber}";
        }
    }
}
