import { PrismaClient } from "@prisma/client";

type GlobalPrisma = {
  prisma?: PrismaClient;
  prismaPromise?: Promise<PrismaClient>;
};

const globalForPrisma = globalThis as unknown as GlobalPrisma;

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, "").split("?")[0],
  };
}

function getGcpCredentials() {
  const client_email = process.env.GCS_CLIENT_EMAIL?.trim();
  const private_key = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!client_email || !private_key) return undefined;
  return {
    client_email,
    private_key,
    ...(process.env.GCS_PROJECT_ID
      ? { project_id: process.env.GCS_PROJECT_ID.trim() }
      : {}),
  };
}

async function createPrismaClient() {
  const instanceConnectionName = process.env.INSTANCE_CONNECTION_NAME?.trim();
  const log =
    process.env.NODE_ENV === "development"
      ? (["error", "warn"] as const)
      : (["error"] as const);

  // Local / IP autorizada: conexión TCP normal vía DATABASE_URL
  if (!instanceConnectionName) {
    return new PrismaClient({ log: [...log] });
  }

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL es obligatorio con INSTANCE_CONNECTION_NAME.");
  }

  const { AuthTypes, Connector, IpAddressTypes } = await import(
    "@google-cloud/cloud-sql-connector"
  );
  const { Pool } = await import("pg");
  const { PrismaPg } = await import("@prisma/adapter-pg");

  const credentials = getGcpCredentials();
  const connector = new Connector(credentials ? { credentials } : undefined);
  const clientOpts = await connector.getOptions({
    instanceConnectionName,
    ipType: IpAddressTypes.PUBLIC,
    authType: AuthTypes.PASSWORD,
  });

  const db = parseDatabaseUrl(process.env.DATABASE_URL);
  const pool = new Pool({
    ...clientOpts,
    user: db.user,
    password: db.password,
    database: db.database,
    max: 1,
  });

  return new PrismaClient({
    adapter: new PrismaPg(pool),
    log: [...log],
  });
}

/** Cliente Prisma. En Netlify usa Cloud SQL Connector si hay INSTANCE_CONNECTION_NAME. */
export function getPrisma() {
  if (globalForPrisma.prisma) {
    return Promise.resolve(globalForPrisma.prisma);
  }
  if (!globalForPrisma.prismaPromise) {
    globalForPrisma.prismaPromise = createPrismaClient().then((client) => {
      globalForPrisma.prisma = client;
      return client;
    });
  }
  return globalForPrisma.prismaPromise;
}
