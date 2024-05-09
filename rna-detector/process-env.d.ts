declare module "process" {
  declare global {
    namespace NodeJS {
      interface ProcessEnv {
        [key: string]: string | undefined;

        APP_MODE: "local" | "remote";
        DATABASE_URL: string;
        REDIS_HOST: string;
        REDIS_PORT: string;
        MAMBA_BIN: string;
        SNAKEMAKE_ENV: string;

        NEXT_PUBLIC_APP_URL: string;
      }
    }
  }
}
