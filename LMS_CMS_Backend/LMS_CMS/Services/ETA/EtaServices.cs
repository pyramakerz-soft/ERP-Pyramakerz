using LMS_CMS_DAL.Models.Domains.Inventory;
using System.Text.Json.Nodes;

namespace LMS_CMS_PL.Services.ETA
{
    public static class EtaServices
    {
        public static bool GenerateInvoiceJSON(InventoryMaster master, string issuerCountry, string receiverCountry, char documentType = 'I')
        {
            string version = "1.0";

            DateTime invDate = DateTime.Parse(master.Date);
            string date = invDate.ToString("yyyy-MM-dd");
            string time = invDate.ToString("HH:mm:ss");

            string dateTime = $"{date}T{time}Z";

            decimal totalSalesAmount = GetTotalSalesAmount(master.InventoryDetails);

            var invoiceJson = new JsonObject
            {
                ["documents"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["issuer"] = new JsonObject
                        {
                            ["address"] = new JsonObject
                            {
                                ["branchID"] = master.TaxIssuer.BranchID,
                                ["country"] = issuerCountry,
                                ["governate"] = master.TaxIssuer.Governate,
                                ["regionCity"] = master.TaxIssuer.RegionCity,
                                ["street"] = master.TaxIssuer.Street,
                                ["buildingNumber"] = master.TaxIssuer.BuildingNumber,
                                ["postalCode"] = master.TaxIssuer.PostalCode,
                                ["floor"] = master.TaxIssuer.Floor,
                                ["room"] = master.TaxIssuer.Room,
                                ["landmark"] = master.TaxIssuer.LandMark,
                                ["additionalInformation"] = master.TaxIssuer.AdditionalInfo
                            },
                            ["type"] = master.TaxIssuer.TypeID,
                            ["id"] = master.TaxIssuer.ID,
                            ["name"] = master.TaxIssuer.Name
                        },
                        ["receiver"] = new JsonObject
                        {
                            ["address"] = new JsonObject
                            {
                                ["country"] = receiverCountry,
                                ["governate"] = master.TaxReceiver.Governate,
                                ["regionCity"] = master.TaxReceiver.RegionCity,
                                ["street"] = master.TaxReceiver.Street,
                                ["buildingNumber"] = master.TaxReceiver.BuildingNumber,
                                ["postalCode"] = master.TaxReceiver.PostalCode,
                                ["floor"] = master.TaxReceiver.Floor,
                                ["room"] = master.TaxReceiver.Room,
                                ["landmark"] = master.TaxReceiver.LandMark,
                                ["additionalInformation"] = master.TaxReceiver.AdditionalInfo
                            },
                            ["type"] = master.TaxReceiver.TypeID,
                            ["id"] = master.TaxReceiver.ID,
                            ["name"] = master.TaxReceiver.Name
                        },
                        ["documentType"] = documentType.ToString(),
                        ["documentTypeVersion"] = version,
                        ["dateTimeIssued"] = dateTime,
                        ["taxpayerActivityCode"] = master.TaxIssuer.ActivityCode,
                        ["internalID"] = master.InvoiceNumber,
                        ["purchaseOrderReference"] = "",
                        ["purchaseOrderDescription"] = "",
                        ["salesOrderReference"] = "",
                        ["salesOrderDescription"] = "",
                        ["proformaInvoiceNumber"] = "",
                        ["payment"] = new JsonObject
                        {
                            ["bankName"] = "",
                            ["bankAddress"] = "",
                            ["bankAccountNo"] = "",
                            ["bankAccountIBAN"] = "",
                            ["swiftCode"] = "",
                            ["terms"] = ""
                        },
                        ["delivery"] = new JsonObject
                        {
                            ["approach"] = "",
                            ["packaging"] = "",
                            ["dateValidity"] = "",
                            ["exportPort"] = "",
                            ["grossWeight"] = 0,
                            ["netWeight"] = 0,
                            ["terms"] = ""
                        },
                        ["invoiceLines"] = GenerateInvoiceLines(master.InventoryDetails),
                        ["totalDiscountAmount"] = 0,
                        ["totalSalesAmount"] = totalSalesAmount,
                        ["netAmount"] = totalSalesAmount,
                        ["taxTotals"] = new JsonArray
                        {
                            new JsonObject
                            {
                                ["taxType"] = "T1",
                                ["amount"] = 0
                            }
                        },
                        ["totalAmount"] = totalSalesAmount,
                        ["extraDiscountAmount"] = 0,
                        ["totalItemsDiscountAmount"] = 0,
                        ["signatures"] = new JsonArray
                        {
                            new JsonObject
                            {
                                ["signatureType"] = "I",
                                ["value"] = "<Signature Value>"
                            }
                        }
                    }
                }
            };

            return true;
        }

        private static JsonArray GenerateInvoiceLines(IEnumerable<InventoryDetails> items)
        {
            var array = new JsonArray();
            foreach (var item in items)
            {
                array.Add(CreateInvoiceLine(item));
            }
            return array;
        }

        private static JsonObject CreateInvoiceLine(InventoryDetails item)
        {
            //decimal total = item.TotalPrice * (decimal)item.InventoryMaster.VatPercent;
            return new JsonObject
            {
                ["description"] = $"{item.ShopItem.EnName} - {item.ShopItem.ArName}",
                ["itemType"] = item.ShopItem.ItemType,
                ["itemCode"] = item.ShopItem.BarCode,
                ["unitType"] = "EA",
                ["quantity"] = item.Quantity,
                ["internalCode"] = "IC0",
                ["salesTotal"] = item.TotalPrice,
                ["total"] = item.TotalPrice,
                ["valueDifference"] = 0.00,
                ["totalTaxableFees"] = 0,
                ["netTotal"] = item.TotalPrice,
                ["itemsDiscount"] = 0,
                ["unitValue"] = new JsonObject
                {
                    ["currencySold"] = "EGP",
                    ["amountEGP"] = item.TotalPrice
                },
                ["discount"] = new JsonObject
                {
                    ["rate"] = 0,
                    ["amount"] = 0
                },
                ["taxableItems"] = new JsonArray
                {
                    new JsonObject
                    {
                        ["taxType"] = "T1",
                        ["amount"] = 0,
                        ["subType"] = "V001",
                        ["rate"] = 0
                    }
                }
            };
        }

        private static decimal GetDiscountAmount(IEnumerable<InventoryDetails> items)
        {
            decimal total = 0;
            //foreach (var item in items)
            //{
            //    total += 
            //}
            return total;
        }

        private static decimal GetTotalSalesAmount(IEnumerable<InventoryDetails> items)
        {
            decimal total = 0;
            foreach (var item in items)
            {
                total += item.TotalPrice;
            }
            return total;
        }
    }
}
