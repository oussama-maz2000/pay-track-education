import { Injectable } from "@angular/core";
import { HttpParams } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class ParamsUtils {
  constructor() {}

  public getParams(
    page: number,
    size: number,
    filterFormParams: any
  ): HttpParams {
    let params = new HttpParams()
      .set("page", String(page))
      .set("size", String(size));

    if (filterFormParams) {
      const filterParams = filterFormParams.getRawValue();
      if (filterParams.beginDate) {
        filterParams.beginDate = filterParams.beginDate.getTime();
      }

      if (filterParams.endDate) {
        filterParams.endDate = filterParams.endDate.getTime();
      }

      if (filterParams.blockingStartDate) {
        filterParams.blockingStartDate =
          filterParams.blockingStartDate.getTime();
      }

      if (filterParams.blockingEndDate) {
        filterParams.blockingEndDate = filterParams.blockingEndDate.getTime();
      }

      Object.keys(filterParams).forEach((key) => {
        if (filterParams[key]) {
          params = params.set(key, filterParams[key]);
        }
      });
    }
    return params;
  }

  public getParamsCustomer(
    page: number,
    size: number,
    filterFormParams?: Record<string, any>
  ): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {
      page,
      size,
    };

    if (!filterFormParams) {
      return params;
    }

    const dateKeys = [
      "beginDate",
      "endDate",
      "blockingStartDate",
      "blockingEndDate",
    ];

    Object.entries(filterFormParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      // Convert Date → timestamp
      if (dateKeys.includes(key) && value instanceof Date) {
        params[key] = value.getTime();
        return;
      }

      // Accept string | number | boolean only
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        params[key] = value;
      }
    });

    return params;
  }

  public static measureExecutionTime(fn: () => void): void {
    const start = new Date().getTime();
    fn();
    const end = new Date().getTime();
  }

  public params(
    page: number,
    size: number,
    filterFormParams: any
  ): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = {
      page,
      size,
    };

    if (filterFormParams) {
      const filterParams = filterFormParams.getRawValue();

      // Conversion dates en timestamps
      ["beginDate", "endDate", "blockingStartDate", "blockingEndDate"].forEach(
        (key) => {
          if (filterParams[key] instanceof Date) {
            filterParams[key] = filterParams[key].getTime();
          }
        }
      );

      // Ajout dans l'objet params
      Object.keys(filterParams).forEach((key) => {
        const value = filterParams[key];

        if (
          value !== null &&
          value !== undefined &&
          value !== "" // on exclut les chaînes vides
        ) {
          params[key] = value;
        }
      });
    }

    return params;
  }
}
