type EmailJSConfig = {
  serviceId?: string;
  templateIdCustomer?: string;
  templateIdAdmin?: string;
  publicKey?: string;
  privateKey?: string;
  adminEmails?: string;
  configured: boolean;
  missing: {
    serviceId: boolean;
    templateIdCustomer: boolean;
    templateIdAdmin: boolean;
    publicKey: boolean;
  };
  sources: {
    serviceId?: string;
    templateIdCustomer?: string;
    templateIdAdmin?: string;
    publicKey?: string;
    privateKey?: string;
    adminEmails?: string;
  };
};

const EMAILJS_ENV_KEYS = {
  serviceId: ["EMAILJS_SERVICE_ID", "VITE_EMAILJS_SERVICE_ID"],
  templateIdCustomer: [
    "EMAILJS_TEMPLATE_ID_CUSTOMER",
    "VITE_EMAILJS_TEMPLATE_ID_CUSTOMER",
  ],
  templateIdAdmin: [
    "EMAILJS_TEMPLATE_ID_ADMIN",
    "VITE_EMAILJS_TEMPLATE_ID_ADMIN",
  ],
  publicKey: ["EMAILJS_PUBLIC_KEY", "VITE_EMAILJS_PUBLIC_KEY"],
  privateKey: ["EMAILJS_PRIVATE_KEY", "VITE_EMAILJS_PRIVATE_KEY"],
  adminEmails: ["ADMIN_EMAILS", "VITE_ADMIN_EMAILS"],
} as const;

const DEV_EMAILJS_DEFAULTS: Record<
  keyof typeof EMAILJS_ENV_KEYS | "privateKey",
  string | undefined
> = {
  serviceId: "service_kifgtn2",
  templateIdCustomer: "template_gjxblw6",
  templateIdAdmin: "template_4ft87b9",
  publicKey: "dK2FblsCDGEM8ZpPq",
  privateKey: "fsRkVV2V-5QgUXiKztym5",
  adminEmails: "dovedem2014@gmail.com,manifestcava@gmail.com",
};

function isDevEnvironment(): boolean {
  if (process.env.FORCE_DEV_EMAIL_DEFAULTS === "true") {
    return true;
  }

  const netlifyContext = (process.env.CONTEXT || "").toLowerCase();
  const nodeEnv = (process.env.NODE_ENV || "").toLowerCase();
  const netlifyLocal = process.env.NETLIFY_LOCAL === "true";

  if (netlifyLocal) {
    return true;
  }

  const isProductionContext =
    netlifyContext === "production" || netlifyContext === "branch-deploy";

  if (isProductionContext) {
    return false;
  }

  if (netlifyContext === "dev" || netlifyContext === "deploy-preview") {
    return true;
  }

  if (!nodeEnv || nodeEnv === "development" || nodeEnv === "test") {
    return true;
  }

  if (!netlifyContext) {
    return true;
  }

  return false;
}

function ensureValue<
  K extends keyof typeof EMAILJS_ENV_KEYS | "privateKey"
>(
  current: { value?: string; source?: string },
  key: K,
): { value?: string; source?: string } {
  if (current.value || !isDevEnvironment()) {
    return current;
  }

  const fallback = DEV_EMAILJS_DEFAULTS[key];
  if (!fallback) {
    return current;
  }

  return {
    value: fallback,
    source: "DEV_DEFAULT",
  };
}

function pickEnv(keys: readonly string[]): { value?: string; source?: string } {
  for (const key of keys) {
    const raw = process.env[key];
    if (typeof raw === "string" && raw.trim() !== "") {
      return { value: raw.trim(), source: key };
    }
  }
  return {};
}

export function resolveEmailJSConfig(): EmailJSConfig {
  const serviceId = ensureValue(
    pickEnv(EMAILJS_ENV_KEYS.serviceId),
    "serviceId",
  );
  const templateIdCustomer = ensureValue(
    pickEnv(EMAILJS_ENV_KEYS.templateIdCustomer),
    "templateIdCustomer",
  );
  const templateIdAdmin = ensureValue(
    pickEnv(EMAILJS_ENV_KEYS.templateIdAdmin),
    "templateIdAdmin",
  );
  const publicKey = ensureValue(
    pickEnv(EMAILJS_ENV_KEYS.publicKey),
    "publicKey",
  );
  const privateKey = ensureValue(
    pickEnv(EMAILJS_ENV_KEYS.privateKey),
    "privateKey",
  );
  const adminEmails = ensureValue(
    pickEnv(EMAILJS_ENV_KEYS.adminEmails),
    "adminEmails",
  );

  const config: EmailJSConfig = {
    serviceId: serviceId.value,
    templateIdCustomer: templateIdCustomer.value,
    templateIdAdmin: templateIdAdmin.value,
    publicKey: publicKey.value,
    privateKey: privateKey.value,
    adminEmails: adminEmails.value,
    configured: Boolean(
      serviceId.value &&
        templateIdCustomer.value &&
        templateIdAdmin.value &&
        publicKey.value
    ),
    missing: {
      serviceId: !serviceId.value,
      templateIdCustomer: !templateIdCustomer.value,
      templateIdAdmin: !templateIdAdmin.value,
      publicKey: !publicKey.value,
    },
    sources: {
      serviceId: serviceId.source,
      templateIdCustomer: templateIdCustomer.source,
      templateIdAdmin: templateIdAdmin.source,
      publicKey: publicKey.source,
      privateKey: privateKey.source,
      adminEmails: adminEmails.source,
    },
  };

  return config;
}

export function maskForLogs(value?: string): string {
  if (!value) return "NOT SET";
  if (value.length <= 4) return `${value}…`;
  return `${value.substring(0, 4)}…`;
}


