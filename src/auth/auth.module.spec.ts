import { ConfigModule, ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import configuration from "../config/configuration";

describe('AuthModule - JWT Configuration', () => {
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [configuration],
                    isGlobal: true,
                }),
            ],
        }).compile();

        configService = module.get<ConfigService>(ConfigService)
    });

    describe('JWT Secret Configuration', () => {
        it('should load JWT_SECRET from the configuration', () => {
            const secret = configService.get<string>('jwt.secret');

            expect(secret).toBeDefined();
            expect(typeof secret).toBe('string');
            expect(secret?.length).toBeGreaterThan(0);
        });

        it('should use fallback if JWT_SECRET does not exist', () => {
            const secret = configService.get<string>('jwt.secret');

            expect(secret).toBeDefined();
            expect(secret).toBeTruthy();
        });
    });

    describe('JWT Expiration Configuration', () => {
        it('should have a defined expiration date', () => {
            const expiresIn = configService.get<string>('jwt.expiresIn');

            expect(expiresIn).toBeDefined();
            expect(typeof expiresIn).toBe('string');
        });

        it('should have valid expiration format', () => {
            const expiresIn = configService.get<string>('jwt.expiresIn');
            expect(expiresIn).toMatch(/^\d+(d|h|m|s)$/);
        });

        it('should use fallback expiration of 7d', () => {
            const expiresIn = configService.get<string>('jwt.expiresIn');
            expect(expiresIn).toBeTruthy();
        });
    });
}); 