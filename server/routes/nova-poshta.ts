import type { RequestHandler } from "express";

// Nova Poshta API
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

const NOVAPOST_API_BASE_URL =
  process.env.NOVAPOST_API_BASE_URL ||
  "https://api-stage.novapost.pl/v.1.0/divisions";

// Search settlements (cities) with fallback to getCities
export const searchSettlements: RequestHandler = async (req, res) => {
  try {
    // Try multiple environment variable names for compatibility
    const apiKey = process.env.NOVA_POSHTA_API_KEY || process.env.VITE_NOVA_POSHTA_API_KEY || "";
    const cityName = String(req.query.cityName || "").trim();
    
    // Debug logging for API key access
    console.log('Nova Poshta API Key check:', {
      hasEnvVar: !!process.env.NOVA_POSHTA_API_KEY,
      hasViteVar: !!process.env.VITE_NOVA_POSHTA_API_KEY,
      keyLength: apiKey.length,
      keyPreview: apiKey ? `${apiKey.substring(0, 4)}...` : 'missing',
      env: process.env.NODE_ENV || 'unknown'
    });
    
    if (!cityName) {
      return res.json({ data: [] });
    }

    const bodySearch = {
      apiKey: apiKey || "",
      modelName: "Address",
      calledMethod: "searchSettlements",
      methodProperties: {
        CityName: cityName,
        Limit: 50,
        Page: 1
      }
    };

    const resp = await fetch(NP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodySearch)
    });

    const json = await resp.json();

    if (json.success && json.data) {
      return res.json({ success: true, data: json.data });
    }

    // Fallback to getCities when searchSettlements fails
    const bodyCities = {
      apiKey: apiKey || "",
      modelName: "Address",
      calledMethod: "getCities",
      methodProperties: {
        FindByString: cityName,
        Page: 1
      }
    };

    const resp2 = await fetch(NP_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyCities)
    });
    const json2 = await resp2.json();

    if (json2.success && Array.isArray(json2.data)) {
      // Map to the same shape as Addresses
      const mapped = json2.data.map((c: any) => ({
        Present: c.Description,
        Description: c.Description,
        MainDescription: c.AreaDescription,
        Ref: c.Ref,
      }));
      return res.json({ success: true, data: [{ Addresses: mapped }] });
    }

    console.error("Nova Poshta API error:", json, json2);
    return res.status(500).json({ error: json.errors?.[0] || json2.errors?.[0] || "Failed to search settlements" });
  } catch (e: any) {
    console.error("searchSettlements error", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch settlements" });
  }
};

// Get warehouses for a city
export const getWarehouses: RequestHandler = async (req, res) => {
  try {
    const apiKey =
      process.env.NOVA_POSHTA_API_KEY ||
      process.env.VITE_NOVA_POSHTA_API_KEY ||
      "";
    const cityRef = String(req.query.cityRef || "").trim();
    const type = String(req.query.type || "").trim();
    const warehouseNumberParam =
      (req.query.number ||
        req.query.warehouseNumber ||
        req.query.postomatNumber ||
        "")?.toString().trim() || "";

    if (!cityRef) {
      return res.json({ data: [] });
    }

    const limit = 500;
    const maxPages = 20;
    const allWarehouses: any[] = [];
    const fetchedSources: string[] = [];

    if (apiKey) {
      try {
        const fetchPage = async (page: number) => {
          const body = {
            apiKey: apiKey || "",
            modelName: "AddressGeneral",
            calledMethod: "getWarehouses",
            methodProperties: {
              SettlementRef: cityRef,
              Limit: limit,
              Page: page,
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

          allWarehouses.push(...json.data);
          return json;
        };

        const firstPage = await fetchPage(1);

        let totalCount = 0;
        const info = firstPage.info || firstPage.Info || {};
        const totalCountRaw =
          info?.totalCount ??
          info?.TotalCount ??
          info?.count ??
          info?.Count ??
          info?.total_count;
        if (typeof totalCountRaw === "string") {
          totalCount = parseInt(totalCountRaw, 10);
        } else if (typeof totalCountRaw === "number") {
          totalCount = totalCountRaw;
        }

        let fetchedCount = allWarehouses.length;
        let page = 2;

        while (
          page <= maxPages &&
          ((Number.isFinite(totalCount) && totalCount > fetchedCount) ||
            (!Number.isFinite(totalCount) &&
              fetchedCount === (page - 1) * limit))
        ) {
          const nextPage = await fetchPage(page);
          fetchedCount = allWarehouses.length;

          if (!Number.isFinite(totalCount) && nextPage.data.length < limit) {
            break;
          }

          page += 1;
        }

        if (
          Number.isFinite(totalCount) &&
          totalCount > 0 &&
          allWarehouses.length < totalCount
        ) {
          console.warn(
            `Expected ${totalCount} warehouses but fetched ${allWarehouses.length} (cityRef: ${cityRef})`
          );
        }

        fetchedSources.push("nova-poshta");
      } catch (npErr) {
        console.error("Failed to fetch Nova Poshta warehouses:", npErr);
      }
    } else {
      console.warn(
        "NOVA_POSHTA_API_KEY not configured; skipping legacy warehouses fetch."
      );
    }

    const warehouseMap = new Map<string, any>();
    const normalizeNumber = (value: any) =>
      String(value || "")
        .replace(/[^\d]/g, "")
        .trim();

    for (const wh of allWarehouses) {
      const ref =
        String(wh.Ref || "").trim() ||
        String(wh.Number || "").trim() ||
        String(wh.SiteKey || "").trim() ||
        `${String(wh.Description || "").trim()}-${String(
          wh.ShortAddress || ""
        ).trim()}`;
      warehouseMap.set(ref, wh);
    }

    const existingNumbers = new Set<string>();
    for (const wh of warehouseMap.values()) {
      const normalized = normalizeNumber(
        wh.Number ||
          wh.PostomatNumber ||
          wh.SiteKey ||
          wh.Description ||
          wh.ShortAddress ||
          wh.Ref
      );
      if (normalized) {
        existingNumbers.add(normalized);
      }
    }

    const novapostResults: any[] = [];
    const shouldFetchNovapost =
      type === "postomat" || type === "" || !type || !req.query.type;

    if (shouldFetchNovapost) {
      const novapostApiKey =
        process.env.NOVAPOST_API_KEY || process.env.NOVAPOST_API_TOKEN || "";
      if (!novapostApiKey) {
        console.warn(
          "NOVAPOST_API_KEY not configured; skipping Novapost divisions fetch."
        );
      } else {
        const countryCodesRaw =
          (req.query.countryCode || req.query.countryCodes || "UA")
            .toString()
            .trim() || "UA";
        const countryCodes = countryCodesRaw
          .split(",")
          .map((c) => c.trim().toUpperCase())
          .filter(Boolean);

        const cityNameParam =
          (req.query.cityName || req.query.city || "")?.toString().trim() || "";

        const divisionCategoriesParam =
          (req.query.divisionCategory || req.query.divisionCategories || "")
            ?.toString()
            .trim() || "";

        const pageLimit = 200;
        let pageDiv = 1;
        let hasMoreDivisions = true;

        const acceptLanguageHeader =
          req.headers["accept-language"] ||
          req.headers["Accept-Language"] ||
          "uk";

        const fetchDivisionsPage = async (page: number) => {
          const params = new URLSearchParams();
          (countryCodes.length ? countryCodes : ["UA"]).forEach((code) =>
            params.append("countryCodes[]", code)
          );
          const categories =
            divisionCategoriesParam !== ""
              ? divisionCategoriesParam.split(",").map((v) => v.trim())
              : ["Postomat"];
          categories
            .filter(Boolean)
            .forEach((category) =>
              params.append("divisionCategories[]", category)
            );

          params.append("limit", String(pageLimit));
          params.append("page", String(page));

          if (cityNameParam) {
            const normalizedCity =
              cityNameParam.includes("*") || cityNameParam.includes("%")
                ? cityNameParam
                : `*${cityNameParam}*`;
            params.append("name", normalizedCity);
          }

          const response = await fetch(
            `${NOVAPOST_API_BASE_URL}?${params.toString()}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${novapostApiKey}`,
                "Accept-Language": Array.isArray(acceptLanguageHeader)
                  ? acceptLanguageHeader[0]
                  : acceptLanguageHeader,
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
            console.warn(
              "Novapost divisions response is not an array. Payload:",
              json
            );
            return [];
          }

          return divisions;
        };

        try {
          while (hasMoreDivisions && pageDiv <= 100) {
            const divisionsPage = await fetchDivisionsPage(pageDiv);
            if (divisionsPage.length === 0) {
              hasMoreDivisions = false;
            } else {
              novapostResults.push(
                ...divisionsPage.map((division: any) => ({
                  _source: "novapost",
                  division,
                }))
              );
              if (divisionsPage.length < pageLimit) {
                hasMoreDivisions = false;
              } else {
                pageDiv += 1;
              }
            }
          }
        } catch (err) {
          console.error("Failed to fetch Novapost divisions:", err);
        }
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
        Description:
          division?.name || division?.shortName || `Postomat ${number || ""}`.trim(),
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
        IsLimitedAccess:
          division?.prohibitedIssuance || division?.prohibitedSending || false,
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
        const normalizedNumber = normalizeNumber(
          mapped.Number ||
            mapped.SiteKey ||
            mapped.Description ||
            mapped.ShortAddress ||
            mapped.Ref
        );
        if (normalizedNumber && existingNumbers.has(normalizedNumber)) {
          continue;
        }
        if (normalizedNumber) {
          existingNumbers.add(normalizedNumber);
        }
        warehouseMap.set(mapped.Ref, mapped);
      }
    }

    const uniqueWarehouses = Array.from(warehouseMap.values());

    const isPostomatWarehouse = (wh: any) => {
      const typeOfWarehouse = String(wh.TypeOfWarehouse || "").trim();
      if (typeOfWarehouse === "9") {
        return true;
      }

      const warehouseIndex = String(wh.Number || wh.SiteKey || "")
        .trim()
        .toLowerCase();
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

    if (type === "postomat" && filteredData.length === 0) {
      console.warn(
        `No postomats detected for cityRef ${cityRef}. Returning all warehouses as fallback.`
      );
      return res.json({ status: "200", data: uniqueWarehouses });
    }

    const sortedData = filteredData.sort((a: any, b: any) => {
      const descA = String(a.Description || "");
      const descB = String(b.Description || "");
      return descA.localeCompare(descB, "uk", {
        numeric: true,
        sensitivity: "base",
      });
    });

    let finalData = sortedData;

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

      const matched = sortedData.filter(matchesNumber);

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

    return res.json({ status: "200", data: finalData });
  } catch (e: any) {
    console.error("getWarehouses error", e);
    return res.status(500).json({ error: e?.message || "Failed to fetch warehouses" });
  }
};


