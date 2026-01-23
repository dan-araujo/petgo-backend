import { Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Address } from '../../address/entities/address.base.entity';

@Entity('customer_addresses')
@Index(['is_default'])
export class CustomerAddress {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  address: Address;

  @Column({ type: 'varchar', length: 50, default: 'other' })
  address_label: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;
}
