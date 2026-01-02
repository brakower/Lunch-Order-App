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