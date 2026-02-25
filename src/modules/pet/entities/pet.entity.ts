import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { PetSize, PetSpecies } from "../../../common/enums/pets.enum";
import { Customer } from "../../customer/entities/customer.entity";
import { Appointment } from "../../appointment/entities/appointment.entity";

@Entity('pets')
export class Pet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'customer_id', type: 'uuid' })
    customerId: string;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'enum', enum: PetSpecies })
    species: PetSpecies;

    @Column({ length: 100, nullable: true })
    breed?: string;

    @Column({ type: 'enum', enum: PetSize })
    size: PetSize;

    @Column({ name: 'photo_url', type: 'varchar', length: 500, nullable: true })
    photoUrl?: string;

    @Column({ type: 'text', nullable: true })
    notes?: string;

    @ManyToOne(() => Customer, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'customer_id' })
    customer: Customer;

    @OneToMany(() => Appointment, appointment => appointment.pet)
    appointments: Appointment[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
    deletedAt: Date;
}
