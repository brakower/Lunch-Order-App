export type MenuItem = {
  name: string;
  description?: string;
}
export type Order = {
    order_id: string;
    user_id: string;
    name: string;
    item: string;
    status: string;
    created_at: string;
    note: string | null;
  };

export type Profile = {
  user_id: string; 
  full_name: string;
  s_admin?: boolean;
}

export type ByStatus = {
  queued: Order[];
  inProgress: Order[];
  ready: Order[];
};

export type KitchenViewProps = {
  byStatus: ByStatus;
  currentUserId: string | null;
  isAdmin: boolean;
  updateStatus: (order_id: string, newStatus: ByStatus) => Promise<void>;
  deleteOrder: (order_id: string) => Promise<void>;
};