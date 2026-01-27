import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    store_id: string;

    @Column({ length: 200 })
    name: string;

    @Column({ type: 'numeric', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'int' })
    duration_minutes: number;

    @Column({ default: true })
    is_active: boolean;

}