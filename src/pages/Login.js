// Import Necessary Libraries
import React, { useState } from "react";
import { Card, Form, Input, Button, Upload, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { MailOutlined, LockOutlined, CodeOutlined } from "@ant-design/icons";
import Logo from "../components/Logo"; // Import custom Logo component
import axios from "axios";

function Login() {
  // Initialize form and navigate from React Router
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // Callback function when the form is submitted
  const onFinish = async (values) => {
    // Validate the secret code
    if (values.secretCode !== "ITSIGMainCom") {
      message.error("Invalid secret code");
      return;
    }

    // Send a POST request to the server for login
    try{
    const response = await axios.post(
      "http://localhost:5050/members/login",
      values
    );
    console.log(response);

    // Check the status of the response
    if (response.status === 200) {
      localStorage.setItem("token", response.data.token);
      sessionStorage.setItem("userId",response.data.userId)
      message.success("Verfication Code Will Be Sent To Your Email!");
      navigate("/verify2fa");
    } else {
      message.error("Invalid email or password");
    }} catch (error) {
      console.error('Error during Login:', error);
      message.error(error.response ? error.response.data.message : "An error occurred during Login");
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
          Welcome to Information Technology Student Interest Group
        </div>
      </div>

      {/* Login Form */}
      <Form
        form={form}
        name="main-committee"
        onFinish={onFinish}
        scrollToFirstError
      >
        {/* Email Input */}
        <Form.Item
          name="email"
          rules={[
            {
              type: "email",
              message: "The input is not valid E-mail!",
            },
            {
              required: true,
              message: "Please input your school E-mail!",
            },
          ]}
        >
          <Input
            id="login-email"
            prefix={<MailOutlined className="site-form-item-icon" />}
            placeholder="Enter school Email"
          />
        </Form.Item>

        {/* Password Input */}
        <Form.Item
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
          hasFeedback
        >
          <Input.Password
          id="login-password"
            prefix={<LockOutlined className="site-form-item-icon" />}
            placeholder="Enter password"
          />
        </Form.Item>

        {/* Secret Code Input */}
        <Form.Item
          name="secretCode"
          rules={[
            {
              required: true,
              message: "Please input the secret code!",
            },
          ]}
        >
          <Input
            id="login-secret"
            prefix={<CodeOutlined className="site-form-item-icon" />}
            placeholder="Enter secret code"
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
            Login
          </Button>
        </Form.Item>
      </Form>

      {/* Signup Link */}
      <div style={{ textAlign: "center", marginTop: "1em" }}>
        Not a member?<Link to="/"> Sign Up</Link>
      </div>
    </Card>
  );
}

// Export the Login component
export default Login;
