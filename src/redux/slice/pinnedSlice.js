// pinnedSlice.js or meetingSlice.js
import {createSlice} from "react-redux"
const initialState = {
    pinnedParticipants: [],
    // other state properties
  };
  
  const meetingSlice = createSlice({
    name: 'meeting',
    initialState,
    reducers: {
      pinParticipant: (state, action) => {
        if (!state.pinnedParticipants.includes(action.payload)) {
          state.pinnedParticipants.push(action.payload);
        }
      },
      unpinParticipant: (state, action) => {
        state.pinnedParticipants = state.pinnedParticipants.filter(
          id => id !== action.payload
        );
      },
    },
  });
  
  export const { pinParticipant, unpinParticipant } = meetingSlice.actions;
  export default meetingSlice.reducer;
  