export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          name: string | null;
          photo_url: string | null;
          birth_date: string | null;
          death_date: string | null;
          bio: string | null;
          father_id: string | null;
          mother_id: string | null;
          spouse_id: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          photo_url?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          bio?: string | null;
          father_id?: string | null;
          mother_id?: string | null;
          spouse_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          photo_url?: string | null;
          birth_date?: string | null;
          death_date?: string | null;
          bio?: string | null;
          father_id?: string | null;
          mother_id?: string | null;
          spouse_id?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_date: string;
          location: string | null;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_date: string;
          location?: string | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_date?: string;
          location?: string | null;
          created_by?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          id: string;
          role: "admin" | "secretary" | "treasurer";
          created_at: string;
        };
        Insert: {
          id: string;
          role?: "admin" | "secretary" | "treasurer";
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: "admin" | "secretary" | "treasurer";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_users_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          target_id: string | null;
          changes: object | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          target_id?: string | null;
          changes?: object | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          target_id?: string | null;
          changes?: object | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_user_id_by_email: {
        Args: { email: string };
        Returns: string;
      };
      list_admin_users_with_email: {
        Args: Record<string, never>;
        Returns: {
          id: string;
          role: "admin" | "secretary" | "treasurer";
          created_at: string;
          email: string;
        }[];
      };
    };
  };
};
