import axios from 'axios';
let url="https://elearning-ndyp.onrender.com/api/"; 
// Create an Axios instance with a base URL
const api = axios.create({
  baseURL: url,  // Replace with your base URL
  headers: {
    'Content-Type': 'application/json',
  },
}); 
export {api}
