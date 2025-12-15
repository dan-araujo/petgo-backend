# 🐾 PetGo Backend - Configuration Guide

## Arquitetura de Configuração

Todas as variáveis de ambiente são centralizadas em um único lugar:

```
src/config/
├── configuration.ts    # 🎯 Central de tudo
```

## Como Funciona

### 1. **Definir no `.env`**

```env
JWT_SECRET=sua_chave_secreta
JWT_EXPIRATION=7d
DATABASE_HOST=localhost
# ... e outros
```

### 2. **Tudo vai em `configuration.ts`**

```typescript
// src/config/configuration.ts
export interface IConfig {
  jwt: { secret: string; expiresIn: string };
  database: { host: string; port: number; /* ... */ };
  // ...
}

export default (): IConfig => ({
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback_secret',
    expiresIn: process.env.JWT_EXPIRATION || '7d',
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    // ...
  },
});
```

### 3. **Usar em qualquer módulo com `ConfigService`**

```typescript
// src/auth/auth.module.ts
import { ConfigService } from '@nestjs/config';
import { IConfig } from '../config/configuration';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiresIn'),
        },
      }),
    }),
  ],
})
export class AuthModule {}
```

## ✅ Vantagens

✔️ **Centralizado** - Todos em um lugar  
✔️ **Type-safe** - Interface `IConfig` valida tipos  
✔️ **Fallbacks** - Valores padrão se variável não existir  
✔️ **Reutilizável** - Injeta em qualquer módulo  
✔️ **Consistente** - Mesmo padrão em toda a app  

## 📋 Padrão para Novos Módulos

Se você criar um novo módulo que precisa de configuração:

### 1. Adicione em `configuration.ts`

```typescript
export interface IConfig {
  // ... existentes
  novoServico: {
    apiKey: string;
    baseUrl: string;
  };
}

export default (): IConfig => ({
  // ... existentes
  novoServico: {
    apiKey: process.env.NOVO_SERVICO_API_KEY || '',
    baseUrl: process.env.NOVO_SERVICO_BASE_URL || 'https://api.exemplo.com',
  },
});
```

### 2. Adicione no `.env.example`

```env
NOVO_SERVICO_API_KEY=sua_chave_aqui
NOVO_SERVICO_BASE_URL=https://api.exemplo.com
```

### 3. Use no seu módulo

```typescript
@Module({
  imports: [
    // ...
  ],
  providers: [
    {
      provide: 'NOVO_SERVICO_CONFIG',
      inject: [ConfigService],
      useFactory: (configService: ConfigService<IConfig>) => 
        configService.get('novoServico'),
    },
  ],
})
export class NovoServicoModule {}
```

## 🚨 Checklist para Pull Requests

Antes de fazer PR:

- [ ] Adicionou variável em `.env.example`?
- [ ] Adicionou em `configuration.ts` com tipo?
- [ ] Adicionou fallback seguro?
- [ ] Está usando `configService.get()` ao invés de `process.env`?
- [ ] O tipo está correto em `IConfig`?

## 🐛 Troubleshooting

### "Type 'string' is not assignable to type..."

✅ Use type casting quando necessário:

```typescript
const value = configService.get<string>('jwt.expiresIn') as string;
```

### "undefined is not a function"

✅ Sempre injete `ConfigService`:

```typescript
useFactory: (configService: ConfigService<IConfig>) => ({
  // configService disponível aqui
}),
inject: [ConfigService], // ← NUNCA esqueça disso!
```

### Variável não está sendo lida

✅ Verifique se:
1. Está em `configuration.ts`
2. Está em `useFactory` com `configService.get()`
3. O nome da propriedade bate exatamente
4. Seu `.env` local tem o valor

## 📚 Referências

- [NestJS Configuration](https://docs.nestjs.com/techniques/configuration)
- [ConfigModule API](https://docs.nestjs.com/modules)
