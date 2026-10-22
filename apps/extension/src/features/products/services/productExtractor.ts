
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

  function getText(...selectors: string[]): string | null {
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      const value =
        element?.getAttribute("content")?.trim() ||
        element?.getAttribute("value")?.trim() ||
        element?.textContent?.trim();

      if (value) return value;
    }

    return null;
  }

  function getJsonLdProducts(value: unknown): Record<string, unknown>[] {
    if (Array.isArray(value)) {
      return value.flatMap(getJsonLdProducts);
    }

    if (!value || typeof value !== "object") return [];

    const object = value as Record<string, unknown>;
    const type = object["@type"];

    const isProduct =
      type === "Product" ||
      (Array.isArray(type) && type.includes("Product"));

    return [
      ...(isProduct ? [object] : []),
      ...(object["@graph"] ? getJsonLdProducts(object["@graph"]) : []),
      ...(object.mainEntity ? getJsonLdProducts(object.mainEntity) : []),
    ];
  }

  function getString(value: unknown): string | null {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }

    return null;
  }

  function getImageUrl(value: unknown): string | null {
    if (typeof value === "string") return value.trim() || null;

    if (Array.isArray(value)) {
      for (const image of value) {
        const result = getImageUrl(image);
        if (result) return result;
      }
    }

    if (value && typeof value === "object") {
      const image = value as Record<string, unknown>;

      return (
        getString(image.url) ??
        getString(image.contentUrl) ??
        getString(image["@id"])
      );
    }

    return null;
  }

  function getOffers(product: Record<string, unknown> | undefined) {
    const offers = product?.offers;

    if (Array.isArray(offers)) {
      return (offers[0] ?? {}) as Record<string, unknown>;
    }

    if (offers && typeof offers === "object") {
      return offers as Record<string, unknown>;
    }

    return {};
  }

  function getPriceFromOffer(
    offer: Record<string, unknown>,
  ): unknown {
    const specification = offer.priceSpecification;

    if (Array.isArray(specification)) {
      for (const item of specification) {
        if (item && typeof item === "object") {
          const price = (item as Record<string, unknown>).price;
          if (price != null) return price;
        }
      }
    }

    if (specification && typeof specification === "object") {
      const price = (specification as Record<string, unknown>).price;
      if (price != null) return price;
    }

    return (
      offer.price ??
      offer.lowPrice ??
      offer.highPrice
    );
  }

  function getAmazonImage(): string | null {
    const image = document.querySelector<HTMLImageElement>(
      "#landingImage, #imgBlkFront, #main-image",
    );

    if (!image) return null;

    const dynamicImages = image.getAttribute("data-a-dynamic-image");

    if (dynamicImages) {
      try {
        const parsed = JSON.parse(dynamicImages) as Record<
          string,
          [number, number]
        >;

        const bestImage = Object.entries(parsed).sort(
          ([, sizeA], [, sizeB]) =>
            sizeB[0] * sizeB[1] - sizeA[0] * sizeA[1],
        )[0]?.[0];

        if (bestImage) return bestImage;
      } catch {
        // Fall back to the image element's URL.
      }
    }

    return (
      image.getAttribute("data-old-hires") ||
      image.getAttribute("src") ||
      image.getAttribute("data-src")
    );
  }

  function getCurrencyFromSymbol(value: string): string | null {
    if (value.includes("₹")) return "INR";
    if (value.includes("€")) return "EUR";
    if (value.includes("£")) return "GBP";

    // "$" alone cannot reliably distinguish USD, CAD, AUD, etc.
    return null;
  }

  const structuredProducts: Record<string, unknown>[] = [];

  for (const script of document.querySelectorAll(
    'script[type="application/ld+json"]',
  )) {
    try {
      structuredProducts.push(
        ...getJsonLdProducts(JSON.parse(script.textContent ?? "")),
      );
    } catch {
      // Ignore malformed JSON-LD.
    }
  }

  const product =
    structuredProducts.find(
      (item) => getString(item.name) && (item.offers || item.image),
    ) ?? structuredProducts[0];

  const offers = getOffers(product);

  const rawTitle =
    getString(product?.name) ??
    getMeta('meta[property="og:title"]', 'meta[name="twitter:title"]') ??
    getText("#productTitle", "h1[itemprop='name']", "h1") ??
    document.title;

  const rawImage =
    getImageUrl(product?.image) ??
    getMeta(
      'meta[property="og:image"]',
      'meta[property="og:image:secure_url"]',
      'meta[name="twitter:image"]',
      'meta[name="twitter:image:src"]',
    ) ??
    getText(
      'meta[itemprop="image"]',
      '[itemprop="image"]',
    ) ??
    getAmazonImage() ??
    getText(
      '[data-testid="product-image"] img',
      'main img[data-zoom-image]',
      'main img[itemprop="image"]',
    );

  const rawPrice =
    getPriceFromOffer(offers) ??
    getMeta(
      'meta[property="product:price:amount"]',
      'meta[property="og:price:amount"]',
      'meta[name="twitter:data1"]',
    ) ??
    getText(
      'meta[itemprop="price"]',
      '[itemprop="price"]',
      '#corePrice_feature_div .a-offscreen',
      '#corePriceDisplay_desktop_feature_div .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '.a-price .a-offscreen',
      '[data-testid="price"]',
      '[data-testid="product-price"]',
    );

  const rawCurrency =
    getString(offers.priceCurrency) ??
    getMeta(
      'meta[property="product:price:currency"]',
      'meta[property="og:price:currency"]',
      'meta[itemprop="priceCurrency"]',
    ) ??
    getText('[itemprop="priceCurrency"]');

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
    const normalized = String(rawPrice)
      .replace(/,/g, "")
      .replace(/[^\d.]/g, "");

    const parsedPrice = Number(normalized);

    if (normalized && Number.isFinite(parsedPrice) && parsedPrice >= 0) {
      price = parsedPrice;
    }
  }

  const priceText =
    typeof rawPrice === "string" ? rawPrice : "";

  const currency =
    rawCurrency?.trim() ||
    getCurrencyFromSymbol(priceText);

  const canonicalHref =
    document.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    )?.href;

  return {
    url: canonicalHref || window.location.href,
    title: rawTitle?.trim() ?? "",
    imageUrl,
    price,
    currency,
  };
}

export async function extractProductFromActiveTab(): Promise<ProductDraft> {
  const chromeApi = (
    globalThis as typeof globalThis & {
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
    }
  ).chrome;

  const [tab] = await chromeApi.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (tab?.id == null || !tab.url) {
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
