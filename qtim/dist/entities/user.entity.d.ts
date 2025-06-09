import { Article } from './article.entity';
export declare class User {
    id: number;
    email: string;
    password: string;
    name: string;
    articles: Article[];
}
