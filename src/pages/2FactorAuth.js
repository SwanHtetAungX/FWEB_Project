// Import Necessary Libraries
import React, { useState } from "react";
import { Card, Form, Input, Button, Upload, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { MailOutlined, LockOutlined, CodeOutlined } from "@ant-design/icons";
import Logo from "../components/Logo"; // Import custom Logo component
import axios from "axios";

function Auth2Factor() {
 
  const navigate = useNavigate();
  const userId = sessionStorage.getItem("userId");
  console.log(userId);

  const onFinish = async (values) => {
    try{
    const response = await axios.post(
      "http://localhost:5050/members/verify-2fa",
      {
        userId: userId,
        twoFactorCode:parseInt(values.twoFactorCode, 10)
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check the status of the response
    if (response.status === 200) {
      message.success("2FA Verification Successful!");
      navigate("/members");
    } else {
      message.error("Invalid or expired 2FA code");}
    }catch (error) {
        console.error('Error during 2FA verification:', error);
        message.error(error.response ? error.response.data.message : "An error occurred during 2FA verification.");
      }
  };

  // Render the Login component UI
  return (
    <Card style={{ width: 400, margin: "auto" }}>
      {/* Logo and Welcome Message */}
      <div style={{ marginBottom: "1.5em" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "0.5em",
          }}
        >
          <Logo />
        </div>
        <div style={{ textAlign: "center" }}>
          Please Enter the 2FA Code Sent To Your Email
        </div>
      </div>

      <Form onFinish={onFinish} scrollToFirstError>
        <Form.Item
          name="twoFactorCode"
          rules={[
            {
              required: true,
              message: "Please input the 2-Factor Authenication code!",
            },
          ]}
        >
          <Input
            id="2factor-field"
            prefix={<CodeOutlined className="site-form-item-icon" />}
            placeholder="Enter the 2FA code"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Verify
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

// Export the Login component
export default Auth2Factor;
