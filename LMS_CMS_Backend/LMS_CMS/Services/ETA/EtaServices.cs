using LMS_CMS_DAL.Models.Domains.Inventory;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Org.BouncyCastle.Asn1.Ess;
using Org.BouncyCastle.Asn1;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json.Nodes;
using Net.Pkcs11Interop.HighLevelAPI;
using System.Net;
using LMS_CMS_DAL.Models.Domains.ETA;
using LMS_CMS_BL.UOW;
using LMS_CMS_DAL.Models.Octa;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using LMS_CMS_DAL.Models.Domains.LMS;

namespace LMS_CMS_PL.Services.ETA
{
    public static class EtaServices
    {
        private static string DllLibPath = "eps2003csp11.dll";
        private static string TokenPin = "";
        private static string apiBaseUrl = "https://api.invoicing.eta.gov.eg";
        private static string idSrvBaseUrl = "https://id.eta.gov.eg";
        private static string access_token = "";


        public static async void GetToken(int myTokenPinId, long schoolId, UOW unitOfWork)
        {
            EtaToken etaToken = await unitOfWork.etaToken_Repository.FindByIncludesAsync(x => x.ID == myTokenPinId, query => query.Include(x => x.EtaTokenType));
            TokenPin = etaToken.PIN;

                //TokenPin
                switch (etaToken.EtaTokenTypeID)
                {
                    case 1:
                        DllLibPath = "eps2003csp11.dll";
                        break;
                    case 2:
                        DllLibPath = "SignatureP11.dll";
                        break;
                }
            //}
        }

        public static bool GenerateJsonInvoice(InventoryMaster master, UOW unitOfWork, IConfiguration config, string dateTime)
        {
            string invoices = string.Empty;

            if (master.FlagId == 11)
                invoices = Path.Combine(Directory.GetCurrentDirectory(), "Invoices/JSONInvoices");

            if (master.FlagId == 12)
                invoices = Path.Combine(Directory.GetCurrentDirectory(), "Invoices/JSONCredits");

            if (!Directory.Exists(invoices))
            {
                Directory.CreateDirectory(invoices);
            }

            char invoiceType = 'I';

            if (master.FlagId == 12)
                invoiceType = 'C';

            TaxIssuer taxIssuer = unitOfWork.taxIssuer_Repository.Select_All().FirstOrDefault();

            string version = config.GetValue<string>("ETAVersion");

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
                                ["branchID"] = taxIssuer.BranchID,
                                ["country"] =  taxIssuer.CountryCode,
                                ["governate"] = taxIssuer.Governate,
                                ["regionCity"] = taxIssuer.RegionCity,
                                ["street"] = taxIssuer.Street,
                                ["buildingNumber"] = taxIssuer.BuildingNumber,
                                ["postalCode"] = taxIssuer.PostalCode,
                                ["floor"] = taxIssuer.Floor,
                                ["room"] = taxIssuer.Room,
                                ["landmark"] = taxIssuer.LandMark,
                                ["additionalInformation"] = taxIssuer.AdditionalInfo
                            },
                            ["type"] = taxIssuer.TypeID,
                            ["id"] = taxIssuer.ID,
                            ["name"] = taxIssuer.Name
                        },
                        ["receiver"] = new JsonObject
                        {
                            ["address"] = new JsonObject
                            {
                                ["country"] =  master.Student.CountryCode,
                                ["governate"] = master.Student.Governate,
                                ["regionCity"] = master.Student.RegionCity,
                                ["street"] = master.Student.Street,
                                ["buildingNumber"] = master.Student.BuildingNumber,
                                ["postalCode"] = master.Student.PostalCode,
                                ["floor"] = master.Student.Floor,
                                ["room"] = master.Student.Room,
                                ["landmark"] = master.Student.LandMark,
                                ["additionalInformation"] = master.Student.AdditionalInfo
                            },
                            ["type"] = master.Student.TypeID,
                            ["id"] = master.StudentID,
                            ["name"] = master.Student.ar_name
                        },
                        ["documentType"] = invoiceType.ToString(),
                        ["documentTypeVersion"] = version,
                        ["dateTimeIssued"] = dateTime,
                        ["taxpayerActivityCode"] = taxIssuer.ActivityCode,
                        ["internalID"] = master.StoreID + "_" + master.FlagId + "_" + master.InvoiceNumber,
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
                        ["taxTotals"] = "",
                        ["totalAmount"] = totalSalesAmount,
                        ["extraDiscountAmount"] = 0,
                        ["totalItemsDiscountAmount"] = 0,
                    }
                }
            };

            string serialize0 = Serialize(JObject.Parse(invoiceJson.ToJsonString()));
            string signWithCMS0 = SignWithCMS(Encoding.UTF8.GetBytes(serialize0), unitOfWork);

            if (string.IsNullOrEmpty(signWithCMS0))
            {
                return false;
            }

            string json = invoiceJson.ToJsonString();

            string signedJson = "{\"documents\": [" + json.Substring(0, json.Length - 1) + ",\"signatures\": [{\"signatureType\": \"I\",\"value\": \"" + signWithCMS0 + "\"}]}]}";

            File.WriteAllText(Path.Combine(invoices, $"{master.StoreID}_{master.FlagId}_{master.InvoiceNumber}.json"), JsonObject.Parse(signedJson)?.ToJsonString((new JsonSerializerOptions
            {
                WriteIndented = true
            })));

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
            return new JsonObject
            {
                ["description"] = $"{item.ShopItem.EnName} - {item.ShopItem.ArName}",
                ["itemType"] = item.ShopItem.ItemCode.StartsWith("EG")? "EGS": "GS1",
                ["itemCode"] = item.ShopItem.ItemCode,
                ["unitType"] = item.ShopItem.UnitType,
                ["quantity"] = item.Quantity,
                ["internalCode"] = item.ID,
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
                }
            };
        }

        public static List<Country> GetCountries(UOW unitofWork)
        {
            List<Country> countries = unitofWork.country_Repository.Select_All();
            return countries;
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

        public static string Serialize(JObject request)
        {
            return SerializeToken(request);
        }

        public static string SerializeToken(JToken request)
        {
            string serialized = "";

            if (request.Parent == null)
            {
                return SerializeToken(request.First);
            }
            else
            {
                if (request.Type == JTokenType.Property)
                {
                    string name = ((JProperty)request).Name.ToUpper();
                    serialized += "\"" + name + "\"";

                    foreach (var prop in request)
                    {
                        switch (prop.Type)
                        {
                            case JTokenType.Object:
                                serialized += SerializeToken(prop);
                                break;
                            case JTokenType.Boolean:
                            case JTokenType.Integer:
                                serialized += "\"" + prop.Value<string>() + "\"";
                                break;
                            case JTokenType.Float:
                                serialized += name == "RATE"
                                    ? "\"" + Dec2(prop.Value<string>()) + "\""
                                    : "\"" + Dec5(prop.Value<string>()) + "\"";
                                break;
                            case JTokenType.Date:
                                serialized += "\"" + ToStrDateTimeFormated(prop.Value<DateTime>()).Replace(" ", "T") + "Z\"";
                                break;
                            case JTokenType.String:
                                serialized += JsonConvert.ToString(prop.Value<string>());
                                break;
                            case JTokenType.Array:
                                foreach (var item in prop.Children())
                                {
                                    serialized += "\"" + ((JProperty)request).Name.ToUpper() + "\"";
                                    if (item.HasValues)
                                    {
                                        serialized += SerializeToken(item);
                                    }
                                    else
                                    {
                                        serialized += "\"" + item.Value<string>() + "\"";
                                    }
                                }
                                break;
                        }
                    }
                }
            }

            if (request.Type == JTokenType.Object)
            {
                foreach (var prop in request.Children())
                {
                    if (prop.Type == JTokenType.Object || prop.Type == JTokenType.Property)
                    {
                        serialized += SerializeToken(prop);
                    }
                }
            }

            return serialized;
        }

        public static string ToStrDateTimeFormated(DateTime dd)
        {
            return dd.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public static string Login(UOW unitOfWork, long schoolId)
        {
            School school = unitOfWork.school_Repository.Select_By_Id(schoolId);

            if (school == null)
                return "School not found";

            string clientId = school.ClientID;
            string clientSecret = school.SecretNumber1;
            string clientSecret2 = school.SecretNumber2;
            try
            {
                var outgoingQueryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
                outgoingQueryString.Add("grant_type", "client_credentials");
                outgoingQueryString.Add("client_id", clientId);
                outgoingQueryString.Add("client_secret", clientSecret);
                outgoingQueryString.Add("scope", "InvoicingAPI");

                byte[] jsonDataBytes = Encoding.ASCII.GetBytes(outgoingQueryString.ToString());

                string result = PostRequest(new Uri(idSrvBaseUrl + "/connect/token"), jsonDataBytes, "application/x-www-form-urlencoded", "POST");

                var json = JsonConvert.DeserializeObject<dynamic>(result);
                access_token = json.access_token;

                return access_token;
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static string PostRequest(Uri uri, byte[] jsonDataBytes, string contentType, string method, string? accessToken = "")
        {
            try
            {
                ServicePointManager.Expect100Continue = true;
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;

                string response;
                WebRequest request = WebRequest.Create(uri);
                request.ContentLength = jsonDataBytes.Length;
                request.ContentType = contentType;
                request.Method = method;
                request.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + accessToken);

                using (Stream requestStream = request.GetRequestStream())
                {
                    requestStream.Write(jsonDataBytes, 0, jsonDataBytes.Length);
                    requestStream.Close();

                    using (Stream responseStream = request.GetResponse().GetResponseStream())
                    using (StreamReader reader = new StreamReader(responseStream))
                    {
                        response = reader.ReadToEnd();
                    }
                }
                return response;
            }
            catch (Exception ex)
            {
                return "ex.Message";
            }
        }

        public static string PostRequest(Uri uri, string jsonData, string contentType, string method, string? accessToken = "")
        {
            try
            {
                string response;
                WebRequest request = WebRequest.Create(uri);
                request.ContentLength = System.Text.Encoding.UTF8.GetByteCount(jsonData);
                request.ContentType = contentType;
                request.Method = method;
                request.Headers.Add(HttpRequestHeader.Authorization, "Bearer " + accessToken);

                using (StreamWriter requestStream = new StreamWriter(request.GetRequestStream()))
                {
                    requestStream.Write(jsonData);
                }

                using (HttpWebResponse httpResponse = (HttpWebResponse)request.GetResponse())
                using (StreamReader streamReader = new StreamReader(httpResponse.GetResponseStream()))
                {
                    response = streamReader.ReadToEnd();
                }

                return response;
            }
            catch (Exception ex)
            {
                //bm.ShowMSG(ex.Message);
                return "";
            }
        }

        private static string Dec2(string value)
        {
            return string.Format("{0:0.00}", Convert.ToDecimal(value));
        }

        private static string Dec5(string value)
        {
            return string.Format("{0:0.00000}", Convert.ToDecimal(value));
        }

        private static string SignWithCMS(byte[] data, UOW unitOfWork)
        {
            try
            {
                var factories = new Pkcs11InteropFactories();
                var pkcs11Library = factories.Pkcs11LibraryFactory.LoadPkcs11Library(factories, DllLibPath, Net.Pkcs11Interop.Common.AppType.MultiThreaded);

                var slot = pkcs11Library.GetSlotList(Net.Pkcs11Interop.Common.SlotsType.WithTokenPresent).FirstOrDefault();
                if (slot == null)
                {
                    return "No slots found";
                }

                var session = slot.OpenSession(Net.Pkcs11Interop.Common.SessionType.ReadWrite);
                try
                {
                    session.Login(Net.Pkcs11Interop.Common.CKU.CKU_USER, Encoding.UTF8.GetBytes(TokenPin));
                }
                catch { }

                var certAttributes = new List<IObjectAttribute>
                {
                    session.Factories.ObjectAttributeFactory.Create(Net.Pkcs11Interop.Common.CKA.CKA_CLASS, Net.Pkcs11Interop.Common.CKO.CKO_CERTIFICATE),
                    session.Factories.ObjectAttributeFactory.Create(Net.Pkcs11Interop.Common.CKA.CKA_TOKEN, true),
                    session.Factories.ObjectAttributeFactory.Create(Net.Pkcs11Interop.Common.CKA.CKA_CERTIFICATE_TYPE, Net.Pkcs11Interop.Common.CKC.CKC_X_509)
                };

                var certificate = session.FindAllObjects(certAttributes).FirstOrDefault();
                if (certificate == null)
                {
                    return "Certificate not found";
                }

                var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
                store.Open(OpenFlags.MaxAllowed);

                var foundCerts = new X509Certificate2Collection();
                var certsIssuerNames = unitOfWork.certificatesIssuerName_Repository.FindBy(x => x.IsDeleted != true);

                foreach (var cert in certsIssuerNames)
                {
                    foundCerts = store.Certificates.Find(X509FindType.FindByIssuerName, cert.Name, true);
                    if (foundCerts.Count > 0) break;
                }

                if (foundCerts.Count == 0)
                {
                    return "No Device Detected";
                }

                var certForSigning = foundCerts[0];
                store.Close();

                var content = new ContentInfo(new Oid("1.2.840.113549.1.7.5"), data);
                var cms = new SignedCms(content, true);

                var bouncyCertificate = new EssCertIDv2(
                    new Org.BouncyCastle.Asn1.X509.AlgorithmIdentifier(new DerObjectIdentifier("1.2.840.113549.1.9.16.2.47")),
                    HashBytes(certForSigning.RawData)
                );
                var signerCertV2 = new SigningCertificateV2(new[] { bouncyCertificate });

                var signer = new CmsSigner(certForSigning)
                {
                    DigestAlgorithm = new Oid("2.16.840.1.101.3.4.2.1")
                };
                signer.SignedAttributes.Add(new Pkcs9SigningTime(DateTime.UtcNow));
                signer.SignedAttributes.Add(new AsnEncodedData(
                    new Oid("1.2.840.113549.1.9.16.2.47"),
                    signerCertV2.GetEncoded()
                ));

                cms.ComputeSignature(signer);
                var output = cms.Encode();
                return Convert.ToBase64String(output);
            }
            catch (Exception ex)
            {
                return ex.Message;
            }
        }

        public static byte[] HashBytes(byte[] input)
        {
            using (var sha = SHA256.Create())
            {
                return sha.ComputeHash(input);
            }
        }
    }

}
