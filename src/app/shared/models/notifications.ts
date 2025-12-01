import { Order } from "./order";
import { User } from "./user";

export interface Notifications {
    notificationId: number;
    order:Order;
    user: User;
    message: string;
    createdAt: string;
    status: 'READ' | 'UNREAD';
}
