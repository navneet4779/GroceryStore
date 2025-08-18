const loginOtpTemplate = ({ otp }) => {
    return `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <p>Hello,</p>
    <p>You requested to log in to your Grocery Store account. Please use the following One-Time Password (OTP) to complete your login:</p>
    
    <div style="background: #fdf3d0; font-size: 22px; padding: 16px; text-align: center; font-weight: bold; border: 2px dashed #f1c40f; margin: 20px 0;">
        ${otp}
    </div>
    
    <p>This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone for your account’s security.</p>
    
    <p>Thanks,<br/>The Grocery Store Team</p>
</div>
    `;
};

export default loginOtpTemplate;
