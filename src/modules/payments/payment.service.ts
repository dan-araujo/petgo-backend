import { Injectable, InternalServerErrorException, Logger } from "@nestjs/common";

@Injectable()
export class PaymentService {
    private readonly logger = new Logger(PaymentService.name);

    async refund(transactionId: string): Promise<void> {
        this.logger.log(`Iniciando solicitação de estorno para a transação: ${transactionId}`);

        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.logger.log(`Estorno da transação ${transactionId} realizado com sucesso!`);
        } catch (error) {
            this.logger.error(`Erro ao estornar transação ${transactionId}`, error);
            throw new InternalServerErrorException('Falha na comunicação com o gateway de pagamento')
        }
    }
}