export interface User {
  id: string;
  name: string;
  role: string;
  loading?: boolean;
}

export interface LoginUser {
  success: boolean;
  message?: string;
  user?: {
    id: string;
    name: string;
    role: string;
    email: string;
  };
  error?: string;
}

export interface CounterState {
  value: number;
}

export interface UserData {
  name: string;
  role: string;
  personal?: {
    avatar?: string;
  };
  _count: {
    jobs: number;
    applications: number;
  };
  jobs: [
    {
      id: string;
      title: string;
      vacancy: number;
      location: string;
      salary: string;
      createdAt: Date;
      _count: {
        application: number;
      };
    },
  ];
}

//Used in
export interface UsersShow {
  id: string;
  name: string;
  email: string;
  role: Roles;
  createdAt: string;
  _count: {
    jobs: string;
    applications: string;
  };
}

enum Roles {
  USER,
  ADMIN,
  EMPLOYER,
}
