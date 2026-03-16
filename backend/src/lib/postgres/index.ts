import 'reflect-metadata';
import * as path from 'node:path';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';

dotenv.config({ path: path.resolve(process.cwd(), '..', '.env'), quiet: true });

interface PostgresVariablesMapping {
  POSTGRES_HOST?: string;
  POSTGRES_PORT?: string;
  POSTGRES_USER?: string;
  POSTGRES_PASSWORD?: string;
  POSTGRES_DB?: string;
}

function ensureVariables(
  mapping?: PostgresVariablesMapping,
): Record<keyof PostgresVariablesMapping, string> {
  const keys: (keyof PostgresVariablesMapping)[] = [
    'POSTGRES_HOST',
    'POSTGRES_PORT',
    'POSTGRES_USER',
    'POSTGRES_PASSWORD',
    'POSTGRES_DB',
  ];
  const missingKeys = keys.filter(
    (key) => !process.env[key] || process.env[key]?.length === 0,
  );

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required Postgres environment variables: ${missingKeys.join(', ')}`,
    );
  }

  return keys.reduce(
    (acc, key) => {
      acc[key] = process.env[key] as string;
      return acc;
    },
    {} as Record<keyof PostgresVariablesMapping, string>,
  );
}

interface SetupOptions {
  environment?: PostgresVariablesMapping;
}

export function setupPostgresDataSource(options?: SetupOptions): DataSource {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';
  const envVars = ensureVariables(options?.environment);
  const isTsRuntime =
    __filename.endsWith('.ts') ||
    process.argv.some((a) => a.includes('ts-node')) ||
    process.env.TS_NODE === 'true';
  const ext = isTsRuntime ? 'ts' : 'js';

  const dataSource = new DataSource({
    database: envVars.POSTGRES_DB,
    host: 'postgres',
    password: envVars.POSTGRES_PASSWORD,
    port: 5432,
    type: 'postgres',
    username: envVars.POSTGRES_USER,

    entities: [path.join(__dirname, '..', '..', '**', `*.entity.${ext}`)],
    migrations: [
      path.join(__dirname, '..', '..', 'db', 'migrations', `*.${ext}`),
    ],

    logging: NODE_ENV === 'development',
    synchronize: false,
  });

  return dataSource;
}

export function setupPostgresTypeOrmConfig(
  options?: SetupOptions,
): TypeOrmModuleOptions {
  const NODE_ENV = process.env.NODE_ENV ?? 'development';

  return {
    ...setupPostgresDataSource(options).options,

    autoLoadEntities: false,
    logging:
      NODE_ENV === 'production'
        ? ['error', 'migration', 'warn']
        : ['error', 'log', 'migration', 'warn'],
    migrationsRun: true,
    migrationsTransactionMode: 'all',
  };
}
