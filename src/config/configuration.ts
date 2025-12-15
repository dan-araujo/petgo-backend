export interface IConfig {
  database: {
    host: string;
    port: number;
    user: string;
    pass: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  app: {
    port: number;
    nodeEnv: string;
    crossOrigin: string;
  };
  mail: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
}

export default (): IConfig => ({
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER || '',
    pass: process.env.DATABASE_PASS || '',
    name: process.env.DATABASE_NAME || '',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },

  app: {
    port: parseInt(process.env.APP_PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    crossOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  },

  mail: {
    host: process.env.MAIL_HOST || '',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    user: process.env.MAIL_USER || '',
    password: process.env.MAIL_PASSWORD || '',
    from: process.env.MAIL_FROM || 'noreply@petgo.com',
  },
});
