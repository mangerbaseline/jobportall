import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

interface JobData {
  id: string;
  title: string;
  vacancy: number;
  location: string;
  salary: string;
  createdAt: string;
  _count: {
    applications: number;
  };
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
      });
  },
});

export const { clearUserDetail } = userDetailSlice.actions;
export default userDetailSlice.reducer;
