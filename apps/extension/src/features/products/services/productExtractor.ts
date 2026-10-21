
import type { ProductDraft } from "../types";

function extractProductFromPage(): ProductDraft {
  function getMeta(...selectors: string[]): string | null {
    for (const selector of selectors) {
      const element = document.querySelector<HTMLMetaElement>(selector);
      const value = element?.content?.trim();

      if (value) return value;
    }

    return null;
  }

  function getJsonLdProducts(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value)) {
      return value.flatMap(getJsonLdProducts);
    }

    if (!value || typeof value !== "object") {
      return [];
    }

    const object = value as Record<string, unknown>;
    const type = object["@type"];

    const isProduct =
      type === "Product" ||
      (Array.isArray(type) && type.includes("Product"));

    const ownProduct = isProduct ? [object] : [];
    const graphProducts = object["@graph"]
      ? getJsonLdProducts(object["@graph"])
      : [];

    return [...ownProduct, ...graphProducts];
  }

  let structuredProducts: Record<string, unknown>[] = [];

  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      const parsed: unknown = JSON.parse(script.textContent ?? "");
      structuredProducts.push(...getJsonLdProducts(parsed));
    } catch {
      // Ignore invalid JSON-LD and continue extracting.
    }
  }

  const product = structuredProducts[0];

  const offers = Array.isArray(product?.offers)
    ? product.offers[0] as Record<string, unknown> | undefined
    : product?.offers && typeof product.offers === "object"
      ? product.offers as Record<string, unknown>
      : undefined;

  const rawTitle =
    (typeof product?.name === "string" ? product.name : null) ??
    getMeta('meta[property="og:title"]', 'meta[name="twitter:title"]') ??
    document.querySelector("h1")?.textContent?.trim() ??
    document.title;

  const rawImage =
    (typeof product?.image === "string" ? product.image : null) ??
    (Array.isArray(product?.image) && typeof product.image[0] === "string"
      ? product.image[0]
      : null) ??
    getMeta('meta[property="og:image"]', 'meta[name="twitter:image"]');

  const rawPrice =
    offers?.price ??
    (offers?.priceSpecification &&
    typeof offers.priceSpecification === "object"
      ? (offers.priceSpecification as Record<string, unknown>).price
      : undefined) ??
    getMeta(
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[itemprop="price"]',
    );

  const rawCurrency =
    (typeof offers?.priceCurrency === "string"
      ? offers.priceCurrency
      : null) ??
    getMeta(
      'meta[property="product:price:currency"]',
      'meta[property="og:price:currency"]',
      'meta[itemprop="priceCurrency"]',
    );

  let imageUrl: string | null = null;

  if (rawImage) {
    try {
      imageUrl = new URL(rawImage, document.baseURI).href;
    } catch {
      imageUrl = null;
    }
  }

  let price: number | null = null;

  if (typeof rawPrice === "number" || typeof rawPrice === "string") {
    const parsedPrice = Number(String(rawPrice).replace(/,/g, ""));

    if (Number.isFinite(parsedPrice) && parsedPrice >= 0) {
      price = parsedPrice;
    }
  }

  const canonicalHref =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href;

  return {
    url: canonicalHref || window.location.href,
    title: rawTitle?.trim() ?? "",
    imageUrl,
    price,
    currency: rawCurrency?.trim() || null,
  };
}

export async function extractProductFromActiveTab(): Promise<ProductDraft> {
  const chromeApi = (globalThis as typeof globalThis & {
    chrome: {
      tabs: {
        query(options: {
          active: boolean;
          currentWindow: boolean;
        }): Promise<Array<{ id?: number; url?: string }>>;
      };
      scripting: {
        executeScript(options: {
          target: { tabId: number };
          func: () => ProductDraft;
        }): Promise<Array<{ result?: ProductDraft }>>;
      };
    };
  }).chrome;

  const [tab] = await chromeApi.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!tab?.id || !tab.url) {
    throw new Error("Could not access the active tab.");
  }

  if (!/^https?:\/\//i.test(tab.url)) {
    throw new Error(
      "Open a shopping website first. Browser internal pages cannot be captured.",
    );
  }

  const results = await chromeApi.scripting.executeScript({
    target: { tabId: tab.id },
    func: extractProductFromPage,
  });

  const product = results[0]?.result;

  if (!product || !product.title || !product.url) {
    throw new Error(
      "Could not detect product details on this page. Try entering them manually.",
    );
  }

  return product;
}
