export interface Tariff {
  id?: number;
  date: string;
  updated_at?: Date;
  warehouse_name: string;
  geo_name: string;
  box_delivery_base?: number | null;
  box_delivery_coef_expr?: number | null;
  box_delivery_liter?: number | null;
  box_delivery_marketplace_base?: number | null;
  box_delivery_marketplace_coef_expr?: number | null;
  box_delivery_marketplace_liter?: number | null;
  box_storage_base?: number | null;
  box_storage_coef_expr?: number | null;
  box_storage_liter?: number | null;
  dt_next_box?: string | null;
  dt_till_max?: string | null;
}

export interface WildberriesRealTariffResponse {
  response: {
    data: {
      dtNextBox: string;
      dtTillMax: string;
      warehouseList: Array<{
        boxDeliveryBase: string;
        boxDeliveryCoefExpr: string;
        boxDeliveryLiter: string;
        boxDeliveryMarketplaceBase: string;
        boxDeliveryMarketplaceCoefExpr: string;
        boxDeliveryMarketplaceLiter: string;
        boxStorageBase: string;
        boxStorageCoefExpr: string;
        boxStorageLiter: string;
        geoName: string;
        warehouseName: string;
      }>;
    };
  };
}

export interface GoogleSheetsRow {
  warehouse_name: string;
  box_delivery_base?: number | null;
  box_delivery_coef_expr?: number | null;
  box_delivery_liter?: number | null;
  box_delivery_marketplace_base?: number | null;
  box_delivery_marketplace_coef_expr?: number | null;
  box_delivery_marketplace_liter?: number | null;
  box_storage_base?: number | null;
  box_storage_coef_expr?: number | null;
  box_storage_liter?: number | null;
}