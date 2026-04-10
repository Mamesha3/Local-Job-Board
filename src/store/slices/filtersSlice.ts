import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FiltersState {
  searchQuery: string;
  location: string;
  category: string;
  jobType: string;
  datePosted: string;
  salaryMin: number | null;
  salaryMax: number | null;
}

const initialState: FiltersState = {
  searchQuery: '',
  location: '',
  category: '',
  jobType: '',
  datePosted: '',
  salaryMin: null,
  salaryMax: null,
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setLocation: (state, action: PayloadAction<string>) => {
      state.location = action.payload;
    },
    setCategory: (state, action: PayloadAction<string>) => {
      state.category = action.payload;
    },
    setJobType: (state, action: PayloadAction<string>) => {
      state.jobType = action.payload;
    },
    setDatePosted: (state, action: PayloadAction<string>) => {
      state.datePosted = action.payload;
    },
    setSalaryRange: (state, action: PayloadAction<{ min: number | null; max: number | null }>) => {
      state.salaryMin = action.payload.min;
      state.salaryMax = action.payload.max;
    },
    resetFilters: (state) => {
      state.searchQuery = '';
      state.location = '';
      state.category = '';
      state.jobType = '';
      state.datePosted = '';
      state.salaryMin = null;
      state.salaryMax = null;
    },
  },
});

export const { setSearchQuery, setLocation, setCategory, setJobType, setDatePosted, setSalaryRange, resetFilters } =
  filtersSlice.actions;
export default filtersSlice.reducer;
