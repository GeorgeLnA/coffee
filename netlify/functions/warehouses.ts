import type { Handler } from "@netlify/functions";

// Nova Poshta API
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";
const NOVAPOST_API_BASE_URL =
  process.env.NOVAPOST_API_BASE_URL ||
  "https://api-stage.novapost.pl/v.1.0/divisions";

/**
 * Netlify serverless function for Nova Poshta warehouses
 * GET /api/warehouses?cityRef=...&type=...
 */
export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
      body: "",
    };
  }

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // Get API key from environment
    const apiKey = process.env.NOVA_POSHTA_API_KEY || process.env.VITE_NOVA_POSHTA_API_KEY || "";
    const cityRef = (event.queryStringParameters?.cityRef || "").trim();
    const type = (event.queryStringParameters?.type || "").trim(); // "postomat" or "department"
    const warehouseNumberParam =
      (event.queryStringParameters?.number ||
        event.queryStringParameters?.warehouseNumber ||
        "").trim();
    
    // Debug logging
    console.log('Nova Poshta Warehouses API:', {
      hasEnvVar: !!process.env.NOVA_POSHTA_API_KEY,
      hasViteVar: !!process.env.VITE_NOVA_POSHTA_API_KEY,
      keyLength: apiKey.length,
      cityRef,
      type,
    });
    
    const pageParamRaw =
      event.queryStringParameters?.page ||
      event.queryStringParameters?.pageNumber ||
      event.queryStringParameters?.p ||
      "";
    let requestedPage = parseInt(String(pageParamRaw || "1"), 10);
    if (!Number.isFinite(requestedPage) || requestedPage < 1) {
      requestedPage = 1;
    }

    const pageSizeParamRaw =
      event.queryStringParameters?.pageSize ||
      event.queryStringParameters?.perPage ||
      event.queryStringParameters?.limit ||
      "";
    let requestedPageSize = parseInt(String(pageSizeParamRaw || "100"), 10);
    if (!Number.isFinite(requestedPageSize) || requestedPageSize <= 0) {
      requestedPageSize = 100;
    }
    requestedPageSize = Math.min(Math.max(requestedPageSize, 25), 500);

    console.log('Warehouse pagination params:', {
      requestedPage,
      requestedPageSize,
    });

    if (!cityRef) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: "200",
          success: true,
          data: [],
          meta: {
            total: 0,
            returned: 0,
            page: requestedPage,
            pageSize: requestedPageSize,
            totalPages: 1,
            hasMore: false,
            nextPage: null,
            prevPage: null,
            rawCount: 0,
            uniqueCount: 0,
            sources: [],
            novaPoshtaPagesFetched: 0,
            fallbackToAllWarehouses: false,
          },
        }),
      };
    }

    const fetchedSources: string[] = [];
    const warehouseMap = new Map<string, any>();
    const addWarehouseToMap = (wh: any) => {
      const ref =
        String(wh.Ref || "").trim() ||
        String(wh.Number || "").trim() ||
        String(wh.SiteKey || "").trim() ||
        `${String(wh.Description || "").trim()}-${String(
          wh.ShortAddress || ""
        ).trim()}`;
      if (ref) {
        warehouseMap.set(ref, wh);
      }
    };

    const normalizeNumber = (value: any) =>
      String(value || "")
        .replace(/[^\d]/g, "")
        .trim();

    const fetchNovaPoshtaPage = async (
      pageNumber: number,
      limit: number
    ): Promise<{ data: any[]; total: number | null }> => {
      const body = {
        apiKey: apiKey || "",
        modelName: "AddressGeneral",
        calledMethod: "getWarehouses",
        methodProperties: {
          SettlementRef: cityRef,
          Limit: limit,
          Page: pageNumber,
        },
      };

      const resp = await fetch(NP_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        throw new Error(`Nova Poshta responded with status ${resp.status}`);
      }

      const json = await resp.json();

      if (!json?.success || !Array.isArray(json?.data)) {
        throw new Error(json?.errors?.[0] || "Failed to fetch warehouses");
      }

      const info = json.info || json.Info || {};
      const totalCountRaw =
        info?.totalCount ??
        info?.TotalCount ??
        info?.count ??
        info?.Count ??
        info?.total_count;
      let total: number | null = null;
      if (typeof totalCountRaw === "string") {
        total = parseInt(totalCountRaw, 10);
      } else if (typeof totalCountRaw === "number") {
        total = totalCountRaw;
      }

      return { data: json.data, total };
    };

    const fetchNovapostPage = async (
      pageNumber: number,
      limit: number,
      params: URLSearchParams,
      authHeader: string
    ): Promise<{ divisions: any[]; total: number | null }> => {
      params.set("page", String(pageNumber));
      params.set("limit", String(limit));

      const response = await fetch(
        `${NOVAPOST_API_BASE_URL}?${params.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authHeader}`,
            "Accept-Language":
              event.headers?.["accept-language"] ||
              event.headers?.["Accept-Language"] ||
              "uk",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Novapost divisions responded with status ${response.status}`
        );
      }

      const json = await response.json();

      const divisions = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json?.items)
        ? json.items
        : Array.isArray(json)
        ? json
        : [];

      if (!Array.isArray(divisions)) {
        console.warn("Novapost response is not an array", json);
        return { divisions: [], total: null };
      }

      const totalRaw =
        json?.meta?.total ??
        json?.meta?.Total ??
        json?.total ??
        json?.Total ??
        null;
      let total: number | null = null;
      if (typeof totalRaw === "string") {
        total = parseInt(totalRaw, 10);
      } else if (typeof totalRaw === "number") {
        total = totalRaw;
      }

      return { divisions, total };
    };
 
    let novaPoshtaPagesFetched = 0;
    let novaPoshtaTotal: number | null = null;
    let novaPoshtaHasMore = false;
    let novaPoshtaReturned = 0;

    if (apiKey && type !== "postomat") {
      try {
        const { data, total } = await fetchNovaPoshtaPage(
          requestedPage,
          requestedPageSize
        );
        novaPoshtaPagesFetched = 1;
        novaPoshtaReturned = data.length;
        if (total != null) {
          novaPoshtaTotal = total;
          novaPoshtaHasMore = requestedPage * requestedPageSize < total;
        } else {
          novaPoshtaHasMore = data.length === requestedPageSize;
        }

        if (data.length > 0) {
          fetchedSources.push("nova-poshta");
          data.forEach(addWarehouseToMap);
        }

        console.log(
          `Nova Poshta page ${requestedPage} count: ${data.length}, total reported: ${total ?? 'unknown'}`
        );
      } catch (npErr) {
        console.error("Failed to fetch Nova Poshta warehouses:", npErr);
      }
    } else if (type !== "postomat") {
      console.warn(
        "NOVA_POSHTА_API_KEY not configured; skipping Nova Poshta warehouse fetch."
      );
    }

    const novapostResults: any[] = [];
    let novapostTotal: number | null = null;
    let novapostHasMore = false;
    let novapostReturned = 0;

    const shouldFetchNovapost =
      type === "postomat" || type === "" || !type || !event.queryStringParameters?.type;
 
     if (shouldFetchNovapost) {
       const novapostApiKey =
         process.env.NOVAPOST_API_KEY || process.env.NOVAPOST_API_TOKEN || "";
       if (!novapostApiKey) {
         console.warn(
           "NOVAPOST_API_KEY not configured; skipping Novapost divisions fetch."
         );
       } else {
        const countryCodesRaw =
          event.queryStringParameters?.countryCode ||
          event.queryStringParameters?.country ||
          "UA";
        const countryCodes = countryCodesRaw
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean);

        const cityNameParam =
          (event.queryStringParameters?.cityName ||
            event.queryStringParameters?.city ||
            "").trim();

        const divisionCategoriesParam =
          (event.queryStringParameters?.divisionCategory ||
            event.queryStringParameters?.divisionCategories ||
            "").trim();

        const baseParams = new URLSearchParams();
        (countryCodes.length ? countryCodes : ["UA"]).forEach((code) =>
          baseParams.append("countryCodes[]", code)
        );
        const categories =
          divisionCategoriesParam !== ""
            ? divisionCategoriesParam.split(",").map((v) => v.trim())
            : ["Postomat"];
        categories
          .filter(Boolean)
          .forEach((category) =>
            baseParams.append("divisionCategories[]", category)
          );

        if (cityNameParam) {
          const normalizedCity =
            cityNameParam.includes("*") || cityNameParam.includes("%")
              ? cityNameParam
              : `*${cityNameParam}*`;
          baseParams.append("name", normalizedCity);
        }

        let attempt = 0;
        let retry = true;

        while (retry && attempt < 2) {
          attempt += 1;
          retry = false;
          try {
            const { divisions, total } = await fetchNovapostPage(
              requestedPage,
              requestedPageSize,
              new URLSearchParams(baseParams),
              novapostApiKey
            );

            novapostReturned = divisions.length;
            if (total != null) {
              novapostTotal = total;
              novapostHasMore =
                requestedPage * requestedPageSize < total;
            } else {
              novapostHasMore = divisions.length === requestedPageSize;
            }

            if (divisions.length > 0) {
              fetchedSources.push("novapost");
              divisions.forEach((division: any) =>
                novapostResults.push({ division })
              );
              console.log(
                `Novapost page ${requestedPage} count: ${divisions.length}, total reported: ${total ?? 'unknown'} (attempt ${attempt})`
              );
            } else if (attempt === 1) {
              console.warn(
                `Novapost returned 0 results for page ${requestedPage}. Retrying once...`
              );
              retry = true;
            }
          } catch (novapostErr) {
            console.error("Failed to fetch Novapost divisions:", novapostErr);
            break;
          }
        }
      }
    }

    if (type === "postomat" && novapostReturned === 0 && apiKey) {
      try {
        const { data, total } = await fetchNovaPoshtaPage(
          requestedPage,
          requestedPageSize
        );
        novaPoshtaPagesFetched = 1;
        novaPoshtaReturned = data.length;
        if (total != null) {
          novaPoshtaTotal = total;
          novaPoshtaHasMore = requestedPage * requestedPageSize < total;
        } else {
          novaPoshtaHasMore = data.length === requestedPageSize;
        }

        if (data.length > 0) {
          fetchedSources.push("nova-poshta-fallback");
          data.forEach(addWarehouseToMap);
        }

        console.warn(
          `Novapost returned no results; using Nova Poshta fallback page ${requestedPage} (${data.length} entries)`
        );
      } catch (fallbackErr) {
        console.error("Nova Poshta fallback failed:", fallbackErr);
      }
    }

    const mapDivisionToWarehouse = (division: any) => {
      const divisionId = division?.id ?? division?.Id ?? division?.divisionId;
      const number =
        division?.number ||
        division?.Number ||
        division?.DivisionNumber ||
        division?.terminalNumber ||
        division?.terminal_code ||
        null;

      const baseRef =
        division?.ref ||
        division?.Ref ||
        divisionId ||
        number ||
        division?.guid ||
        division?.uuid ||
        `${division?.countryCode || "XX"}-${division?.name || Date.now()}`;
      const safeRef = String(baseRef)
        .toLowerCase()
        .replace(/[^a-z0-9_-]+/g, "-")
        .replace(/-{2,}/g, "-")
        .replace(/^-|-$/g, "");
      const ref = `novapost-${safeRef || Math.random().toString(36).slice(2)}`;

      return {
        Ref: ref,
        Number: number,
        SiteKey: ref,
        Description: division?.name || division?.shortName || `Postomat ${number || ""}`.trim(),
        DescriptionUk:
          division?.nameUk || division?.name_uk || division?.name || "",
        DescriptionRu:
          division?.nameRu || division?.name_ru || division?.name || "",
        ShortAddress:
          division?.address ||
          division?.shortAddress ||
          division?.settlement?.name ||
          "",
        Address: division?.address || "",
        AddressDescription: division?.address || "",
        CityDescription: division?.settlement?.name || "",
        SettlementDescription: division?.settlement?.name || "",
        WarehouseType: division?.divisionCategory || "Postomat",
        CategoryOfWarehouse: division?.divisionCategory || "Postomat",
        Longitude: division?.longitude || null,
        Latitude: division?.latitude || null,
        WarehouseStatus: division?.status || "",
        IsLimitedAccess: division?.prohibitedIssuance || division?.prohibitedSending || false,
        ReceivingLimitationsOnDimensions:
          division?.receivingLimitationsOnDimensions || null,
        ReceivingLimitationsOnDimensionsString:
          division?.receivingLimitationsOnDimensions
            ? JSON.stringify(division?.receivingLimitationsOnDimensions)
            : null,
        Schedule: division?.workSchedule || [],
        Source: "novapost",
      };
    };

    if (novapostResults.length > 0) {
      for (const record of novapostResults) {
        const division = record?.division || record;
        if (!division) continue;
        const mapped = mapDivisionToWarehouse(division);
        if (!mapped?.Ref) continue;
        warehouseMap.set(mapped.Ref, mapped);
      }
    }

    const uniqueWarehouses = Array.from(warehouseMap.values());
    const rawCount = novaPoshtaReturned + novapostReturned;
    const uniqueCount = uniqueWarehouses.length;

    console.log(
      `Raw warehouse count: ${rawCount}, unique warehouse count: ${uniqueCount}, sources: ${JSON.stringify(fetchedSources)}`
    );
    console.log(
      `Fetched ${uniqueCount} unique warehouses (raw ${rawCount}) for city ${cityRef} (type: ${type || "all"})`
    );

    const isPostomatWarehouse = (wh: any) => {
      const typeOfWarehouse = String(wh.TypeOfWarehouse || "").trim();
      if (typeOfWarehouse === "9") {
        return true;
      }

      const warehouseIndex = String(wh.Number || wh.SiteKey || "").trim();
      if (warehouseIndex.startsWith("9") && warehouseIndex.length >= 3) {
        return true;
      }

      const branchAddress = [wh.CityDescription, wh.SettlementDescription]
        .map((v: any) => String(v || "").toLowerCase())
        .filter(Boolean)
        .join(" ");

      const textParts = [
        branchAddress,
        wh.CategoryOfWarehouse,
        wh.CategoryOfWarehouseDescription,
        wh.CategoryOfWarehouseDescriptionRu,
        wh.CategoryOfWarehouseDescriptionUk,
        wh.CategoryOfWarehouseDescriptionUa,
        wh.WarehouseType,
        wh.WarehouseTypeDescription,
        wh.WarehouseTypeDescriptionRu,
        wh.WarehouseTypeDescriptionUk,
        wh.WarehouseTypeDescriptionUa,
        wh.PostomatDescription,
        wh.Description,
        wh.DescriptionRu,
        wh.DescriptionUk,
        wh.ShortAddress,
        wh.ShortAddressRu,
        wh.ShortAddressUk,
        wh.Address,
        wh.AddressDescription,
        wh.PhysicalAddress,
      ]
        .map((v: any) => String(v || "").toLowerCase())
        .filter(Boolean);

      const keywords = [
        "поштомат",
        "почтомат",
        "постомат",
        "пошт",
        "poshtomat",
        "postomat",
        "parcel locker",
        "locker",
        "automated parcel terminal",
        "parcel terminal",
      ];
      const containsKeyword = textParts.some((part) =>
        keywords.some((keyword) => part.includes(keyword))
      );

      return containsKeyword;
    };

    const filteredData = (() => {
      if (type === "postomat") {
        return uniqueWarehouses.filter(isPostomatWarehouse);
      }
      if (type === "department") {
        return uniqueWarehouses.filter((wh: any) => !isPostomatWarehouse(wh));
      }
      return uniqueWarehouses;
    })();
    console.log(`Filtered data count for type "${type || "all"}":`, filteredData.length);

    let finalData = filteredData;

    if (warehouseNumberParam) {
      const normalizedQuery = normalizeNumber(warehouseNumberParam);

      const matchesNumber = (wh: any) => {
        const candidates = [
          wh.Number,
          wh.PostomatNumber,
          wh.PostomatIndex,
          wh.SiteKey,
          wh.WarehouseIndex,
          wh.Ref,
          wh.PostomatDescription,
          wh.Description,
          wh.ShortAddress,
          wh.Address,
        ]
          .map(normalizeNumber)
          .filter(Boolean);

        if (candidates.includes(normalizedQuery)) {
          return true;
        }

        const textFields = [
          wh.Description,
          wh.PostomatDescription,
          wh.ShortAddress,
          wh.Address,
          wh.DescriptionRu,
          wh.DescriptionUk,
          wh.ShortAddressRu,
          wh.ShortAddressUk,
        ]
          .map((v: any) => String(v || "").toLowerCase())
          .filter(Boolean);

        return textFields.some((text) =>
          text.includes(warehouseNumberParam.toLowerCase())
        );
      };

      const matched = finalData.filter(matchesNumber);

      if (matched.length === 0) {
        console.warn(
          `No warehouses found for number ${warehouseNumberParam} (cityRef: ${cityRef})`
        );
      } else {
        console.log(
          `Filtered ${matched.length} warehouse(s) for number ${warehouseNumberParam}`
        );
        finalData = matched;
      }
    }

    console.log(
      `Final data count before pagination: ${finalData.length} (cityRef: ${cityRef}, type: ${type || "all"})`
    );

    const paginatedData = finalData;
    const returnedCount = paginatedData.length;

    const totalFromNovaPoshta =
      typeof novaPoshtaTotal === "number" ? novaPoshtaTotal : null;
    const totalFromNovapost =
      typeof novapostTotal === "number" ? novapostTotal : null;

    let totalAvailable: number;
    let hasMore = false;

    if (type === "postomat") {
      totalAvailable = totalFromNovapost ?? totalFromNovaPoshta ?? uniqueCount;
      hasMore =
        (totalFromNovapost != null && novapostHasMore) ||
        (totalFromNovapost == null && novaPoshtaHasMore);
    } else if (type === "department") {
      totalAvailable = totalFromNovaPoshta ?? uniqueCount;
      hasMore = novaPoshtaHasMore;
    } else {
      const totals: number[] = [];
      if (totalFromNovaPoshta != null) totals.push(totalFromNovaPoshta);
      if (totalFromNovapost != null) totals.push(totalFromNovapost);
      totalAvailable =
        totals.length > 0
          ? totals.reduce((acc, value) => acc + value, 0)
          : uniqueCount;
      hasMore =
        (totalFromNovaPoshta != null && novaPoshtaHasMore) ||
        (totalFromNovapost != null && novapostHasMore);
    }

    if (totalAvailable < returnedCount) {
      totalAvailable = returnedCount;
    }

    if (!hasMore) {
      const impliedHasMore =
        totalAvailable > 0
          ? requestedPage * requestedPageSize < totalAvailable
          : returnedCount === requestedPageSize;
      hasMore = impliedHasMore;
    }

    const totalPages =
      totalAvailable > 0
        ? Math.max(1, Math.ceil(totalAvailable / requestedPageSize))
        : 1;

    const nextPage = hasMore ? requestedPage + 1 : null;
    const prevPage = requestedPage > 1 ? requestedPage - 1 : null;

    console.log(
      `Returning ${returnedCount} warehouses for page ${requestedPage}/${totalPages}. hasMore=${hasMore}`
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: "200",
        success: true,
        data: paginatedData,
        meta: {
          total: totalAvailable,
          returned: returnedCount,
          page: requestedPage,
          pageSize: requestedPageSize,
          totalPages,
          hasMore,
          nextPage,
          prevPage,
          rawCount,
          uniqueCount,
          sources: fetchedSources,
          novaPoshtaPagesFetched,
          fallbackToAllWarehouses: false,
        },
      }),
    };
  } catch (error: any) {
    console.error("Error in warehouses function:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        status: "500",
        success: false,
        message: error.message || "Internal Server Error",
      }),
    };
  }
};