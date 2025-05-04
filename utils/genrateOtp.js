let generateOTP=(count)=>{
    let otp = '';
    for(let i=0;i<count;i++){
        otp += Math.floor(Math.random()*10);
    }
    return otp;
}
export default generateOTP;