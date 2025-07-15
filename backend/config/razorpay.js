import Razorpay from 'razorpay';
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;     // Your Test Key ID
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET; // Your Test Key Secret

const razorpayInstance = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
});

export default razorpayInstance;
export { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET };
