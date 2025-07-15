import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Analytics } from "./analytics.entity.js";

@Entity()
export class Url {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 2048 })
    originalUrl!: string;

    @Column({ unique: true })
    shortUrl!: string;

    @Column({ type: "varchar", length: 20, unique: true, nullable: true })
    alias!: string | null;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    createdAt!: Date;

    @Column({ type: "timestamp", nullable: true })
    expiresAt!: Date | null;

    @Column({ default: 0 })
    clickCount!: number;

   @OneToMany("Analytics", "url")
    analytics!: Analytics[];   
}