import { User } from './user.entity';
export declare class Article {
    id: number;
    title: string;
    description: string;
    publicationDate: Date;
    author: User;
}
