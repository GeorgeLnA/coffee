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
  const serviceId = pickEnv(EMAILJS_ENV_KEYS.serviceId);
  const templateIdCustomer = pickEnv(EMAILJS_ENV_KEYS.templateIdCustomer);
  const templateIdAdmin = pickEnv(EMAILJS_ENV_KEYS.templateIdAdmin);
  const publicKey = pickEnv(EMAILJS_ENV_KEYS.publicKey);
  const privateKey = pickEnv(EMAILJS_ENV_KEYS.privateKey);
  const adminEmails = pickEnv(EMAILJS_ENV_KEYS.adminEmails);

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


