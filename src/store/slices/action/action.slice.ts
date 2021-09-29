import { AnyAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ActionState {
  action: string;
}

// Define the initial state using that type
const initialState: ActionState = {
  action: ''
};

export const actionSlice = createSlice({
  name: 'action',
  initialState,
  reducers: {
    setAction: (state, action: PayloadAction<string>) => {
      if (state.action === action.payload) {
        state.action = `${action.payload}-1`;
      } else {
        state.action = action.payload;
      }
    }
  }
});

export const {
  setAction
} = actionSlice.actions;

export default actionSlice.reducer;
