export interface IConfig {
  database: {
    url: string;
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
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/petgo',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
