import { createSlice } from "@reduxjs/toolkit";

export const scoreSlice = createSlice({
  name: "score",
  initialState: {
    totalScore: 0,
    title: "",
  },
  reducers: {
    setScore: (state, action) => {
      return {
        ...state, 
        totalScore: action.payload.score,
        title: action.payload.title,
      };
    },
    resetScore: (state) => {
      state.totalScore = 0;
      state.title = "";
    },
  },
});

export const { setScore, resetScore } = scoreSlice.actions;
export default scoreSlice.reducer;