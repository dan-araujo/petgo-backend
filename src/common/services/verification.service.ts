import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MailgunEmailService } from './mailgun-email.service';

@Injectable()
export class VerificationService {
  private readonly CODE_EXPIRATIONS_MINUTES = 15;

  constructor(private readonly mailgunEmailService: MailgunEmailService) { }

  async sendVerificationEmail(email: string, userName: string, code: string): Promise<void> {
    const html = this.mailgunEmailService.getEmailTemplate(code, userName);
    await this.mailgunEmailService.sendEmail(
      email,
      'Código de Verificação - PetGo',
      html,
    );
  }

  async verifyEmail(repo: Repository<any>, email: string, code: string): Promise<boolean> {
    console.log(`🔍 Tentando verificar email: ${email} com código: ${code}`);

    // Busca NOVAMENTE do banco (sempre fresco)
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      console.log('❌ Usuário não encontrado');
      return false;
    }

    console.log(`Código no banco: ${user.verification_code}`);
    console.log(`Código enviado: ${code}`);
    console.log(`Tipo do código no banco: ${typeof user.verification_code}`);
    console.log(`Tipo do código enviado: ${typeof code}`);

    const codigoIguais = String(user.verification_code) === String(code);

    if (!codigoIguais) {
      console.log('❌ Código incorreto');
      return false;
    }

    // Verifica se expirou
    if (!user.code_expires_at) {
      console.log('❌ Código não existe ou foi expirado');
      return false;
    }

    if (new Date() > new Date(user.code_expires_at)) {
      console.log('❌ Código expirou');
      return false;
    }

    // ✅ Marca como verificado
    console.log('✅ Código válido! Marcando usuário como ativo...');
    await repo.update(user.id, {
      status: 'active',
      verification_code: null,
      code_expires_at: null,
    });

    console.log('✅ Usuário verificado com sucesso!');
    return true;
  }

  async resendVerificationCode(repo: Repository<any>, email: string): Promise<void> {
    const user = await repo.findOne({ where: { email } });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Regenera o código
    const newCode = this.generateCode();
    const expiresAt = new Date(Date.now() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000);

    // Envia o email
    await this.sendVerificationEmail(email, user.name, newCode);

    // Atualiza no banco
    await repo.update(user.id, {
      verification_code: newCode,
      code_expires_at: expiresAt,
      last_code_send_at: new Date(),
    });
  }

  async handleOnLogin(repo: Repository<any>, user: any): Promise<any> {
    const isVerified = user.status === 'active';

    if (!isVerified) {
      // Envia código automaticamente no login
      const code = this.generateCode();
      const expiresAt = new Date(Date.now() + this.CODE_EXPIRATIONS_MINUTES * 60 * 1000);

      await this.sendVerificationEmail(user.email, user.name, code);

      await repo.update(user.id, {
        verification_code: code,
        code_expires_at: expiresAt,
        last_code_send_at: new Date(),
      });

      return {
        shouldContinueLogin: false,
        response: {
          status: 'pending_code',
          message: 'Seu email precisa ser verificado. Código enviado!',
          email: user.email,
        },
      };
    }

    return {
      shouldContinueLogin: true,
      response: { status: 'success' },
    };
  }

   generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
