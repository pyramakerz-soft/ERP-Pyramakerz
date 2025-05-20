using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Migrations;
using static System.Runtime.InteropServices.JavaScript.JSType;

#nullable disable

namespace LMS_CMS_DAL.Migrations.LMS_CMS_
{
    /// <inheritdoc />
    public partial class AddTaxUnitTypesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InventoryMaster_TaxReceivers_TaxReceiverId",
                table: "InventoryMaster");

            migrationBuilder.DropTable(
                name: "TaxReceivers");

            migrationBuilder.DropIndex(
                name: "IX_InventoryMaster_TaxReceiverId",
                table: "InventoryMaster");

            migrationBuilder.DropColumn(
                name: "TaxReceiverId",
                table: "InventoryMaster");

            migrationBuilder.CreateTable(
                name: "TaxUnitType",
                columns: table => new
                {
                    ID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    desc_en = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    desc_ar = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxUnitType", x => x.ID);
                });

            migrationBuilder.InsertData(
                table: "TaxUnitType",
                columns: new[] { "ID", "code", "desc_en", "desc_ar" },
                values: new object[,]
                {
                    {
                        1,
                        "2Z",
                        "Millivolt ( mV )",
                        ""
                    },
                    {
                        2,
                        "4K",
                        "Milliampere ( mA )",
                        ""
                    },
                    {
                        3,
                        "4O",
                        "Microfarad ( microF )",
                        ""
                    },
                    {
                        4, 
                        "A87",
                        "Gigaohm ( GOhm )",
                        ""
                    },
                    {
                        5,
                        "A93",
                        "Gram/Cubic meter ( g/m3 )",
                        ""
                    },
                    {
                        6,
                        "A94",
                        "Gram/cubic centimeter ( g/cm3 )",
                        ""
                    },
                    {
                            7,
                        "AMP",
                        "Ampere ( A )",
                        ""
                    },
                    {
                        8,
                        "ANN",
                        "Years ( yr )",
                        ""
                    },
                    {
                        9,
                        "B22",
                        "Kiloampere ( kA )",
                        ""
                    },
                    {
                        10,
                        "B49",
                        "Kiloohm ( kOhm )",
                        ""
                    },
                    {
                        11,
                        "B75",
                        "Megohm ( MOhm )",
                        ""
                    },
                    {
                        12,
                        "B78",
                        "Megavolt ( MV )",
                        ""
                    },
                    {
                        13,
                        "B84",
                        "Microampere ( microA )",
                        ""
                    },
                    {
                        14,
                        "BAR",
                        "bar ( bar )",
                        ""
                    },
                    {
                        15,
                        "BBL",
                        "Barrel (oil 42 gal.)",
                        "برميل"
                    },
                    {
                        16,
                    "BG",
                    "Bag ( Bag )",
                    ""
                    },
                    {
                        17,
                    "BO",
                    "Bottle ( Bt. )",
                    ""
                    },
                    {
                        18,
                    "BOX",
                    "Box",
                    "صندوق"
                    },
                    {
                        19,
                    "C10",
                    "Millifarad ( mF )",
                    ""
                    },
                    {
                        20,
                    "C39",
                    "Nanoampere ( nA )",
                    ""
                    },
                    {
                        21,
                    "C41",
                    "Nanofarad ( nF )",
                    ""
                    },
                    {
                        22,
                    "C45",
                    "Nanometer ( nm )",
                    ""
                    },
                    {
                        23,
                    "C62",
                    "Activity unit ( AU )",
                    ""
                    },
                    {
                        24,
                    "CA",
                    "Canister ( Can )",
                    ""
                    },
                    {
                        25,
                    "CMK",
                    "Square centimeter ( cm2 )",
                    ""
                    },
                    {
                        26,
                    "CMQ",
                    "Cubic centimeter ( cm3 )",
                    ""
                    },
                    {
                        27,
                    "CMT",
                    "Centimeter ( cm )",
                    ""
                    },
                    {
                        28,
                    "CS",
                    "Case ( Case )",
                    ""
                    },
                    {
                        29,
                    "CT",
                    "Carton ( Car )",
                    ""
                    },
                    {
                        30,
                    "CTL",
                    "Centiliter ( Cl )",
                    ""
                    },
                    {
                        31,
                    "D10",
                    "Siemens per meter ( S/m )",
                    ""
                    },
                    {
                        32,
                    "D33",
                    "Tesla ( D )",
                    ""
                    },
                    {
                        33,
                    "D41",
                    "Ton/Cubic meter ( t/m3 )",
                    ""
                    },
                    {
                        34,
                    "DAY",
                    "Days ( d )",
                    ""
                    },
                    {
                        35,
                    "DMT",
                    "Decimeter ( dm )",
                    ""
                    },
                    {
                        36,
                    "DRM",
                    "DRUM",
                    "أسطوانة"
                    },
                    {
                        37,
                    "EA",
                    "each (ST) ( ST )",
                    ""
                    },
                    {
                        38,
                    "FAR",
                    "Farad ( F )",
                    ""
                    },
                    {
                        39,
                    "FOT",
                    "Foot ( Foot )",
                    ""
                    },
                    {
                        40,
                    "FTK",
                    "Square foot ( ft2 )",
                    ""
                    },
                    {
                        41,
                    "FTQ",
                    "Cubic foot ( ft3 )",
                    ""
                    },
                    {
                        42,
                    "G42",
                    "Microsiemens per centimeter ( microS/cm )",
                    ""
                    },
                    {
                        43,
                    "GL",
                    "Gram/liter ( g/l )",
                    ""
                    },
                    {
                        44,
                    "GLL",
                    "gallon ( gal )",
                    ""
                    },
                    {
                        45,
                    "GM",
                    "Gram/square meter ( g/m2 )",
                    ""
                    },
                    {
                        46,
                    "GPT",
                    "Gallon per thousand",
                    "جالون/الف"
                    },
                    {
                        47,
                    "GRM",
                    "Gram ( g )",
                    ""
                    },
                    {
                        48,
                    "H63",
                    "Milligram/Square centimeter ( mg/cm2 )",
                    ""
                    },
                    {
                        49,
                    "HHP",
                    "Hydraulic Horse Power",
                    "قوة حصان هيدروليكي"
                    },
                    {
                        50,
                    "HLT",
                    "Hectoliter ( hl )",
                    ""
                    },
                    {
                        51,
                    "HTZ",
                    "Hertz (1/second) ( Hz )",
                    ""
                    },
                    {
                        52,
                    "HUR",
                    "Hours ( hrs )",
                    ""
                    },
                    {
                        53,
                    "IE",
                    "Number of Persons ( PRS )",
                    ""
                    },
                    {
                        54,
                    "INH",
                    "Inch ( “” )",
                    ""
                    },
                    {
                        55,
                    "INK",
                    "Square inch ( Inch2 )",
                    ""
                    },
                    {
                        56,
                    "JOB",
                    "JOB",
                    "وظيفة"
                    },
                    {
                        57,
                    "KGM",
                    "Kilogram ( KG )",
                    ""
                    },
                    {
                        58,
                    "KHZ",
                    "Kilohertz ( kHz )",
                    ""
                    },
                    {
                        59,
                    "KMH",
                    "Kilometer/hour ( km/h )",
                    ""
                    },
                    {
                        60,
                    "KMK",
                    "Square kilometer ( km2 )",
                    ""
                    },
                    {
                        61,
                    "KMQ",
                    "Kilogram/cubic meter ( kg/m3 )",
                    ""
                    },
                    {
                        62,
                    "KMT",
                    "Kilometer ( km )",
                    ""
                    },
                    {
                        63,
                    "KSM",
                    "Kilogram/Square meter ( kg/m2 )",
                    ""
                    },
                    {
                        64,
                    "KVT",
                    "Kilovolt ( kV )",
                    ""
                    },
                    {
                        65,
                    "KWT",
                    "Kilowatt ( KW )",
                    ""
                    },
                    {
                        66,
                    "LB",
                    "pounds ",
                    "رطل"
                    },
                    {
                        67,
                    "LTR",
                    "Liter ( l )",
                    ""
                    },
                    {
                        68,
                    "LVL",
                    "Level",
                    "مستوي"
                    },
                    {
                        69,
                    "M",
                    "Meter ( m )",
                    ""
                    },
                    {
                        70,
                    "MAN",
                    "Man",
                    "رجل"
                    },
                    {
                        71,
                    "MAW",
                    "Megawatt ( VA )",
                    ""
                    },
                    {
                        72,
                    "MGM",
                    "Milligram ( mg )",
                    ""
                    },
                    {
                        73,
                    "MHZ",
                    "Megahertz ( MHz )",
                    ""
                    },
                    {
                        74,
                    "MIN",
                    "Minute ( min )",
                    ""
                    },
                    {
                        75,
                    "MMK",
                    "Square millimeter ( mm2 )",
                    ""
                    },
                    {
                        76,
                    "MMQ",
                    "Cubic millimeter ( mm3 )",
                    ""
                    },
                    {
                        77,
                    "MMT",
                    "Millimeter ( mm )",
                    ""
                    },
                    {
                        78,
                    "MON",
                    "Months ( Months )",
                    ""
                    },
                    {
                        79,
                    "MTK",
                    "Square meter ( m2 )",
                    ""
                    },
                    {
                        80,
                    "MTQ",
                    "Cubic meter ( m3 )",
                    ""
                    },
                    {
                        81,
                    "OHM",
                    "Ohm ( Ohm )",
                    ""
                    },
                    {
                        82,
                    "ONZ",
                    "Ounce ( oz )",
                    ""
                    },
                    {
                        83,
                    "PAL",
                    "Pascal ( Pa )",
                    ""
                    },
                    {
                        84,
                    "PF",
                    "Pallet ( PAL )",
                    ""
                    },
                    {
                        85,
                    "PK",
                    "Pack ( PAK )",
                    ""
                    },
                    {
                        86,
                    "SK",
                    "Sack",
                    "كيس"
                    },
                    {
                        87,
                    "SMI",
                    "Mile ( mile )",
                    ""
                    },
                    {
                        88,
                    "ST",
                    "Ton (short,2000 lb)",
                    "طن (قصير,2000)"
                    },
                    {
                        89,
                    "TNE",
                    "Tonne ( t )",
                    ""
                    },
                    {
                        90,
                    "TON",
                    "Ton (metric)",
                    "طن (متري)"
                    },
                    {
                        91,
                    "VLT",
                    "Volt ( V )",
                    ""
                    },
                    {
                        92,
                    "WEE",
                    "Weeks ( Weeks )",
                    ""
                    },
                    {
                        93,
                    "WTT",
                    "Watt ( W )",
                    ""
                    },
                    {
                        94,
                    "X03",
                    "Meter/Hour ( m/h )",
                    ""
                    },
                    {
                        95,
                    "YDQ",
                    "Cubic yard ( yd3 )",
                    ""
                    },
                    {
                        96,
                    "YRD",
                    "Yards ( yd )",
                    ""
                    },
                    {
                        97,
                    "NMP",
                    "Number of packs",
                    ""
                    },
                    {
                        98,
                    "ST",
                    "Sheet",
                    ""
                    },
                    {
                        99,
                    "5I",
                    "Standard cubic foot",
                    ""
                    },
                    {
                        100,
                    "AE",
                    "Ampere per metre",
                    ""
                    },
                    {
                        101,
                    "B4",
                    "Barrel, Imperial",
                    ""
                    },
                    {
                        102,
                    "BB",
                    "Base box",
                    ""
                    },
                    {
                        103,
                    "BD",
                    "Board",
                    ""
                    },
                    {
                        104,
                    "BE",
                    "Bundle",
                    ""
                    },
                    {
                        105,
                    "BK",
                    "Basket",
                    ""
                    },
                    {
                        106,
                    "BL",
                    "Bale",
                    ""
                    },
                    {
                        107,
                    "CH",
                    "Container",
                    ""
                    },
                    {
                        108,
                    "CR",
                    "Crate",
                    ""
                    },
                    {
                        109,
                    "DAA",
                    "Decare",
                    ""
                    },
                    {
                        110,
                    "DTN",
                    "Decitonne",
                    ""
                    },
                    {
                        111,
                    "DZN",
                    "Dozen",
                    ""
                    },
                    {
                        112,
                    "FP",
                    "Pound per square foot",
                    ""
                    },
                    {
                        113,
                    "HMT",
                    "Hectometre",
                    ""
                    },
                    {
                        114,
                    "INQ",
                    "Cubic inch",
                    ""
                    },
                    {
                        115,
                    "KG",
                    "Keg",
                    ""
                    },
                    {
                        116,
                    "KTM",
                    "Kilometre",
                    ""
                    },
                    {
                        117,
                    "LO",
                    "Lot [unit of procurement]",
                    ""
                    },
                    {
                        118,
                    "MLT",
                    "Millilitre",
                    ""
                    },
                    {
                        119,
                    "MT",
                    "Mat",
                    ""
                    },
                    {
                        120,
                    "NA",
                    "Milligram per kilogram",
                    ""
                    },
                    {
                        121,
                    "NAR",
                    "Number of articles",
                    ""
                    },
                    {
                        122,
                    "NC",
                    "Car",
                    ""
                    },
                    {
                        123,
                    "NE",
                    "Net litre",
                    ""
                    },
                    {
                        124,
                    "NPL",
                    "Number of parcels",
                    ""
                    },
                    {
                        125,
                    "NV",
                    "Vehicle",
                    ""
                    },
                    {
                        126,
                    "PA",
                    "Packet",
                    ""
                    },
                    {
                        127,
                    "PG",
                    "Plate",
                    ""
                    },
                    {
                        128,
                    "PL",
                    "Pail",
                    ""
                    },
                    {
                        129,
                    "PR",
                    "Pair",
                    ""
                    },
                    {
                        130,
                    "PT",
                    "Pint (US)",
                    ""
                    },
                    {
                        131,
                    "RL",
                    "Reel",
                    ""
                    },
                    {
                        132,
                    "RO",
                    "Roll",
                    ""
                    },
                    {
                        133,
                    "SET",
                    "Set",
                    ""
                    },
                    {
                        134,
                    "STK",
                    "Stick, Cigarette ",
                    ""
                    },
                    {
                        135,
                    "T3",
                    "Thousand piece",
                    ""
                    },
                    {
                        136,
                    "TC",
                    "Truckload",
                    ""
                    },
                    {
                        137,
                    "TK",
                    "Tank, rectangular",
                    ""
                    },
                    {
                        138,
                    "TN",
                    "Tin",
                    ""
                    },
                    {
                        139,
                    "TTS",
                    "Ten thousand sticks",
                    ""
                    },
                    {
                        140,
                    "UC",
                    "Telecommunication port ",
                    ""
                    },
                    {
                        141,
                    "VI",
                    "Vial",
                    ""
                    },
                    {
                        142,
                    "VQ",
                    "Bulk",
                    ""
                    },
                    {
                        143,
                    "YDK",
                    "Square yard",
                    ""
                    },
                    {
                        144,
                    "Z3",
                    "Cask",
                    ""
                    }

                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TaxUnitType");

            migrationBuilder.AddColumn<string>(
                name: "TaxReceiverId",
                table: "InventoryMaster",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TaxReceivers",
                columns: table => new
                {
                    ID = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DeletedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    InsertedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    TypeID = table.Column<int>(type: "int", nullable: true),
                    UpdatedByUserId = table.Column<long>(type: "bigint", nullable: true),
                    ActivityCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AdditionalInfo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BuildingNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CountryID = table.Column<long>(type: "bigint", nullable: true),
                    DeletedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DeletedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    Floor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Governate = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    InsertedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    InsertedByOctaId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: true),
                    LandMark = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PostalCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RegionCity = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Room = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Street = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UpdatedByOctaId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxReceivers", x => x.ID);
                    table.ForeignKey(
                        name: "FK_TaxReceivers_Employee_DeletedByUserId",
                        column: x => x.DeletedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxReceivers_Employee_InsertedByUserId",
                        column: x => x.InsertedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxReceivers_Employee_UpdatedByUserId",
                        column: x => x.UpdatedByUserId,
                        principalTable: "Employee",
                        principalColumn: "ID");
                    table.ForeignKey(
                        name: "FK_TaxReceivers_TaxCustomer_TypeID",
                        column: x => x.TypeID,
                        principalTable: "TaxCustomer",
                        principalColumn: "ID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_InventoryMaster_TaxReceiverId",
                table: "InventoryMaster",
                column: "TaxReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_DeletedByUserId",
                table: "TaxReceivers",
                column: "DeletedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_InsertedByUserId",
                table: "TaxReceivers",
                column: "InsertedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_TypeID",
                table: "TaxReceivers",
                column: "TypeID");

            migrationBuilder.CreateIndex(
                name: "IX_TaxReceivers_UpdatedByUserId",
                table: "TaxReceivers",
                column: "UpdatedByUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_InventoryMaster_TaxReceivers_TaxReceiverId",
                table: "InventoryMaster",
                column: "TaxReceiverId",
                principalTable: "TaxReceivers",
                principalColumn: "ID");
        }
    }
}
