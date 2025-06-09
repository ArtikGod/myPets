import { User } from '../../auth/entities/user.entity';
export declare class Article {
    id: number;
    title: string;
    description: string;
    publicationDate: Date;
    author: User;
}
