import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Url } from "./url.entity.js";

@Entity()
export class Analytics {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: "varchar" })
    ipAddress!: string;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    accessedAt!: Date;

    @ManyToOne("Url", "analytics", { onDelete: "CASCADE" })
    url!: Url;
}