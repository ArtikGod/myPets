import axios from 'axios';
import { Tariff, WildberriesRealTariffResponse } from '../types/tariff';
import { API, LOG, FORMAT, HTTP, NUMBERS, STRINGS } from '../constants/constants';

export class WildberriesService {
  private apiUrl: string;
  private apiToken: string;

  constructor() {
    this.apiUrl = process.env.WB_API_URL || API.WILDBERRIES.TARIFFS_URL;
    this.apiToken = process.env.WB_API_TOKEN || '';
  }

  async fetchTariffs(): Promise<Tariff[]> {
    const currentDate = new Date().toISOString().split(FORMAT.DATE.ISO_DATE_ONLY)[NUMBERS.FIRST_INDEX];
    const urlWithDate = `${this.apiUrl}?${API.WILDBERRIES.PARAMS.DATE_PARAM}=${currentDate}`;
    
    try {
      const startTime = Date.now();
      
      const response = await axios.get<WildberriesRealTariffResponse>(urlWithDate, {
        headers: {
          [HTTP.HEADERS.AUTHORIZATION]: this.apiToken ? `${API.WILDBERRIES.HEADERS.AUTHORIZATION} ${this.apiToken}` : undefined,
          [HTTP.HEADERS.CONTENT_TYPE]: API.WILDBERRIES.HEADERS.CONTENT_TYPE
        }
      });

      const endTime = Date.now();
      if (response.data && response.data.response && response.data.response.data) {
        const transformedData = this.transformApiResponse(response.data);
        return transformedData;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] ${LOG.WB.FETCH_ERROR}`, {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      if (error.response) {
        console.error(`[${new Date().toISOString()}] ${LOG.WB.HTTP_ERROR(error.response.status, error.response.statusText)}`);
        console.error(`[${new Date().toISOString()}] ${LOG.WB.ERROR_BODY}`, JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === HTTP.STATUS.BAD_REQUEST) {
          console.error(`[${new Date().toISOString()}] ${LOG.WB.BAD_REQUEST_REASONS}`);
          console.error(`[${new Date().toISOString()}] ${LOG.WB.BAD_REQUEST_DATE_FORMAT}`);
          console.error(`[${new Date().toISOString()}] ${LOG.WB.BAD_REQUEST_MISSING_PARAM}`);
          console.error(`[${new Date().toISOString()}] ${LOG.WB.BAD_REQUEST_INVALID_TOKEN}`);
        } else if (error.response.status === HTTP.STATUS.UNAUTHORIZED) {
          console.error(`[${new Date().toISOString()}] ${LOG.WB.UNAUTHORIZED_ERROR}`);
        } else if (error.response.status === HTTP.STATUS.TOO_MANY_REQUESTS) {
          console.error(`[${new Date().toISOString()}] ${LOG.WB.RATE_LIMIT_ERROR}`);
        }
      } else if (error.request) {
        console.error(`[${new Date().toISOString()}] ${LOG.WB.NETWORK_ERROR}`);
      } else {
        console.error(`[${new Date().toISOString()}] ${LOG.WB.CONFIG_ERROR}`, error.message);
      }
      
      throw new Error(LOG.WB.API_ERROR);
    }
  }

  private transformApiResponse(data: WildberriesRealTariffResponse): Tariff[] {
    const currentDate = new Date().toISOString().split(FORMAT.DATE.ISO_DATE_ONLY)[NUMBERS.FIRST_INDEX];

    if (!data.response?.data?.warehouseList) {
      return [];
    }

    const warehouses = data.response.data.warehouseList;
    const activeWarehouses = warehouses.filter(warehouse =>
      warehouse.boxDeliveryBase &&
      warehouse.boxDeliveryBase !== STRINGS.DASH &&
      warehouse.boxStorageBase !== undefined
    );

    return activeWarehouses.map(warehouse => {
      const deliveryBase = this.parseDecimal(warehouse.boxDeliveryBase);
      const deliveryLiter = this.parseDecimal(warehouse.boxDeliveryLiter);
      const storageBase = this.parseDecimal(warehouse.boxStorageBase);
      const storageLiter = this.parseDecimal(warehouse.boxStorageLiter);

      const tariff: Tariff = {
        date: currentDate,
        warehouse_name: warehouse.warehouseName,
        geo_name: warehouse.geoName,
        box_delivery_base: this.parseDecimal(warehouse.boxDeliveryBase),
        box_delivery_coef_expr: this.parseDecimal(warehouse.boxDeliveryCoefExpr),
        box_delivery_liter: this.parseDecimal(warehouse.boxDeliveryLiter),
        box_delivery_marketplace_base: this.parseDecimal(warehouse.boxDeliveryMarketplaceBase),
        box_delivery_marketplace_coef_expr: this.parseDecimal(warehouse.boxDeliveryMarketplaceCoefExpr),
        box_delivery_marketplace_liter: this.parseDecimal(warehouse.boxDeliveryMarketplaceLiter),
        box_storage_base: this.parseDecimal(warehouse.boxStorageBase),
        box_storage_coef_expr: this.parseDecimal(warehouse.boxStorageCoefExpr),
        box_storage_liter: this.parseDecimal(warehouse.boxStorageLiter),
        dt_next_box: data.response.data.dtNextBox || null,
        dt_till_max: data.response.data.dtTillMax || null
      };

      return tariff;
    });
  }

  private parseDecimal(value: string): number | null {
    if (!value || value === STRINGS.DASH) {
      return null;
    }
    
    const cleanValue = value.replace(FORMAT.DATE.DECIMAL_SEPARATOR, FORMAT.DATE.DECIMAL_REPLACEMENT);
    const parsed = parseFloat(cleanValue);
    
    return isNaN(parsed) ? null : parsed;
  }

  async fetchRawResponse(): Promise<any> {
    const currentDate = new Date().toISOString().split(FORMAT.DATE.ISO_DATE_ONLY)[NUMBERS.FIRST_INDEX];
    const urlWithDate = `${this.apiUrl}?${API.WILDBERRIES.PARAMS.DATE_PARAM}=${currentDate}`;
    
    try {
      const response = await axios.get(urlWithDate, {
        headers: {
          [HTTP.HEADERS.AUTHORIZATION]: this.apiToken ? `${API.WILDBERRIES.HEADERS.AUTHORIZATION} ${this.apiToken}` : undefined,
          [HTTP.HEADERS.CONTENT_TYPE]: API.WILDBERRIES.HEADERS.CONTENT_TYPE
        }
      });

      return {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      };
    } catch (error: any) {
      console.error(`[${new Date().toISOString()}] ${LOG.WB.RAW_RESPONSE_ERROR}`, error.message);
      throw error;
    }
  }
}
