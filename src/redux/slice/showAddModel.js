import { createSlice } from "@reduxjs/toolkit";

let slice=createSlice({
    name:"showAddModel",
    initialState:{
        showAddModel:false
    },
    reducers:{
        setShowAddModel(state){
            state.showAddModel=!state.showAddModel
        }
    }
})
export const {setShowAddModel}=slice.actions;
export default slice.reducer;