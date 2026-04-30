import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface InterviewCandidateInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface InterviewJobInfo {
  id: string;
  title: string;
}

export interface InterviewApplicationInfo {
  id: string;
  user: InterviewCandidateInfo;
  job: InterviewJobInfo;
}

export interface InterviewData {
  id: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  location: string | null;
  notes: string | null;
  application: InterviewApplicationInfo;
}

interface InterviewState {
  interviews: InterviewData[];
  loading: boolean;
  error: string | null;
  updating: boolean;
  updateError: string | null;
}

const initialState: InterviewState = {
  interviews: [],
  loading: false,
  error: null,
  updating: false,
  updateError: null,
};

export const fetchInterviews = createAsyncThunk<
  InterviewData[],
  { date: string },
  { rejectValue: string }
>("employer/fetchInterviews", async ({ date }, thunkAPI) => {
  try {
    const response = await fetch(`/api/employer/interviews?date=${date}`);
    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(data.error || "Failed to fetch interviews");
    }

    return data.data as InterviewData[];
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Something went wrong");
  }
});

export const updateInterview = createAsyncThunk<
  InterviewData,
  { interviewId: string; status: InterviewData["status"]; notes?: string },
  { rejectValue: string }
>("employer/updateInterview", async ({ interviewId, status, notes }, thunkAPI) => {
  try {
    const response = await fetch("/api/employer/interviews/update", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ interviewId, status, notes }),
    });
    const data = await response.json();

    if (!response.ok) {
      return thunkAPI.rejectWithValue(data.error || "Failed to update interview");
    }

    console.log("[updateInterview] API response data:", data);

    return data.data as InterviewData;
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Something went wrong");
  }
});

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    clearInterviews: (state) => {
      state.interviews = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInterviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterviews.fulfilled, (state, action) => {
        state.loading = false;
        state.interviews = action.payload;
      })
      .addCase(fetchInterviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to load interviews";
      })
      // updateInterview
      .addCase(updateInterview.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateInterview.fulfilled, (state, action) => {
        state.updating = false;
        console.log("[updateInterview.fulfilled] payload:", action.payload);
        console.log("[updateInterview.fulfilled] current interviews ids:", state.interviews.map(i => i.id));
        const idx = state.interviews.findIndex((i) => i.id === action.payload.id);
        console.log("[updateInterview.fulfilled] matched index:", idx);
        if (idx !== -1) {
          state.interviews[idx].status = action.payload.status;
          state.interviews[idx].notes = action.payload.notes ?? null;
        }
      })
      .addCase(updateInterview.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Failed to update interview";
      });
  },
});

export const { clearInterviews } = interviewSlice.actions;
export default interviewSlice.reducer;
