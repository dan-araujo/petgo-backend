export default () => ({
    database: {
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT || '5432', 10),
        user: process.env.DATABASE_USER,
        pass: process.env.DATABASE_PASS,
        name: process.env.DATABASE_NAME,
    },

    jwt: {
        secret: process.env.JWT_SECRET,
        expiresIn: '7d',
    },

    app: {
        port: parseInt(process.env.APP_PORT || '3000', 10),
        nodeEnv: process.env.NODE_ENV || 'development',
        crossOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    },

    mail: {
        host: process.env.MAIL_HOST,
        port: parseInt(process.env.MAIL_PORT || '587', 10),
        user: process.env.MAIL_USER,
        password: process.env.MAIL_PASSWORD,
        from: process.env.MAIL_FROM || 'noreply@petgo.com',
    },
});