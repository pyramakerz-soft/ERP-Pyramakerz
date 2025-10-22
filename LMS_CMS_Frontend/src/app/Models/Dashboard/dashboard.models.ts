export interface TodaysData {
  studentCountInCurrentActive: number;
  classroomCountInCurrentActive: number;
  inventoryLowItemsToday: number;
}

export interface SubmissionsCount {
  notAnswered: number;
  answeredOnTime: number;
  answeredLate: number;
}

export interface RegistrationFormStateCount {
  acceptedCount: number;
  declinedCount: number;
  pending: number;
  waitingListCount: number;
}

export interface RequestStateCount {
  acceptedRequestCount: number;
  declinedRequestCount: number;
  requestPending: number;
}

export interface ShopItem {
  itemID: number;
  itemName: string;
  totalQuantitySold: number;
}

export interface CategoryRanking {
  categoryID: number;
  categoryName: string;
  totalCategoryCount: number;
  shopItem: ShopItem;
}

export interface CategoryRankings {
  totalOrders: number;
  categoryRanking: CategoryRanking[];
}

export interface DashboardData {
  followUpCount: number;
  feesAmount: number;
  submissionsCount: SubmissionsCount;
  registrationFormStateCount: RegistrationFormStateCount;
  requestStateCount: RequestStateCount;
  totalSalaries: number;
  inventoryPurchase: { [key: string]: number };
  inventorySales: { [key: string]: number };
  categoryRankings: CategoryRankings;
}

export interface DashboardParams {
  year: number;
  month?: number;
}