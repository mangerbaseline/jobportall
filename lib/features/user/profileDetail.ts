import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface JobData {
  id: string;
  title: string;
  vacancy: number;
  location: string;
  salary: number | null;
  createdAt: string;
  company?: { id: string; name: string } | null;
  _count: {
    applications: number;
  };
}

interface PostJobPayload {
  title: string;
  description: string;
  location: string;
  salary: string;
  vacancy: string;
  companyId?: string;
}

interface ApplicationData {
  id: string;
  status: string;
  createdAt: string;
  employer: {
    name: string;
    companyName: string | null;
  };
  job: {
    id: string;
    title: string;
    location: string;
    salary: string;
  };
}

interface UserDetailData {
  name: string;
  companyName: string;
  companies: [
    {
      id: string;
      name: string;
      description: string;
      logoUrl: string;
      website: string;
    },
  ];
  role: string;
  personal?: any;
  professional?: any;
  employed: boolean;
  verified: boolean;
  savedJobs: any;
  jobs: JobData[];
  applications: ApplicationData[];
  _count: {
    jobs: number;
    applications: number;
  };
}

interface UserDetailState {
  data: UserDetailData | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserDetailState = {
  data: null,
  loading: true,
  error: null,
};

// Thunk
export const fetchUserDetail = createAsyncThunk<UserDetailData, string>(
  "userDetail/fetchUserDetail",
  async (userId, { rejectWithValue }) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const result = await res.json();

      if (result.success) {
        return result.data as UserDetailData;
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// Thunk – post a new job and return the created JobData
export const postJob = createAsyncThunk<JobData, PostJobPayload>(
  "userDetail/postJob",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await fetch("/api/job/create", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || result.error || "Failed to post job");
      }

      return result.job as JobData;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

const userDetailSlice = createSlice({
  name: "userDetail",
  initialState,
  reducers: {
    clearUserDetail: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(postJob.fulfilled, (state, action) => {
        if (state.data) {
          state.data.jobs = [action.payload, ...state.data.jobs];
          state.data._count.jobs += 1;
        }
      });
  },
});

export const { clearUserDetail } = userDetailSlice.actions;
export default userDetailSlice.reducer;
