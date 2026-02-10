import { Column, Entity, Index, JoinColumn, ManyToOne, OneToOne, PrimaryColumn } from 'typeorm';
import { Address } from '../../address/entities/address.base.entity';
import { Customer } from './customer.entity';

@Entity('customer_addresses')
@Index(['isDefault'])
export class CustomerAddress {
  @PrimaryColumn('uuid')
  id: string;

  @OneToOne(() => Address, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  address: Address;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => Customer)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ name: 'address_label', type: 'varchar', length: 50, default: 'other' })
  addressLabel: string;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;
}
