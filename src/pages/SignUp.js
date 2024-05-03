// Import React, useState, axios, and React Router components
import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

// Import Ant Design components, icons, and Logo component
import Logo from "../components/Logo";
import { Form, Input, Button, Card, Tabs, Upload, message } from "antd";
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  CodeOutlined,
  QuestionCircleOutlined,
  UploadOutlined,
} from "@ant-design/icons";

// Destructure Tabs to get TabPane
const { TabPane } = Tabs;

// SignUpForm Component Definition
const SignUpForm = () => {
  // State variables for uploaded file URL and form instances
  const [fileS3Url, setFileS3Url] = useState("");
  const [formMain] = Form.useForm();
  const [formSub] = Form.useForm();

  // React Router hook for navigation
  const navigate = useNavigate();

  // Function to handle form submission
  const onFinish = async (values, formType) => {
    try {
      // Initialize variables based on form type
      let role = "";
      let approvalStatus = "";
      let reason = "";
      let password = "";
      if (formType === "main") {
        role = "Main Committee";
        approvalStatus = "Approved";
        password = values.password;
        reason = "";
      } else if (formType === "sub") {
        role = "Sub Committee";
        approvalStatus = "Pending";
        reason = values.reasonsForJoining;
        password = "N.A";
      }

      // Check secret code for Main Committee registration
      if (formType === "main" && values.secretCode !== "ITSIGMainCom") {
        message.error("Invalid secret code. Please try again.");
        return;
      }

      // Prepare data to send to the server
      const dataToSend = {
        name: values.name,
        email: values.email,
        profileImg: fileS3Url,
        password: password,
        approvalStatus: approvalStatus,
        role: role,
        reason: reason,
        joinedDate: new Date().toISOString().slice(0, 10),
      };

      // Send a POST request to the server to register a new member
      const response = await fetch("http://localhost:5050/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      // Handle errors during registration
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message === "Email already taken") {
          message.error("Email already taken. Please use a different email.");
          return;
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      // Handle successful registration
      const responseData = await response.json();
      console.log("Server response:", responseData);
      if (formType === "main") {
        const username = responseData.username;
        message.success(`Signed Up Successfully! Welcome ${username}`);
        sessionStorage.setItem("userId", responseData.id);
        navigate("/login");
      } else if (formType === "sub") {
        message.success("Sub Committee member added successfully");
      }
    } catch (error) {
      // Handle errors during the registration process
      console.error("Error during member registration:", error);
      message.error("Error during member registration. Please try again.");
    }
  };

  // Function to normalize file data for Ant Design Upload component
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Function to handle file upload before submitting the form
  const beforeUpload = async (file) => {
    try {
      // Fetch pre-signed URL for S3 upload
      const response = await axios.get(
        `https://h4pln1et19.execute-api.us-east-1.amazonaws.com/default/getPresignedUrl?fileType=${
          file.type.split("/")[1]
        }`
      );

      // Extract S3 URL from the response
      const uploadURL = response.data.uploadURL;
      const S3Url = uploadURL.split("?")[0];

      // Set the fileS3Url state variable
      setFileS3Url(S3Url);

      // Upload the file to S3
      const result = await fetch(uploadURL, {
        method: "PUT",
        body: file,
      });

      // Handle errors during file upload
      if (!result.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
      }

      // Return false to prevent further processing by Ant Design Upload
      return false;
    } catch (error) {
      // Handle errors during the file upload process
      console.error("Error uploading file:", error);
      message.error("Error uploading file. Please try again.");
      return false;
    }
  };

  // Render the SignUpForm component UI
  return (
    <Card style={{ width: 400, margin: "auto" }}>
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
      {/* Tabs for Main Committee and Sub Committee registration */}
      <Tabs defaultActiveKey="main" centered>
        {/* Main Committee Registration Tab */}
        <TabPane tab="Main Committee" key="main">
          {/* Main Committee Registration Form */}
          <Form
            form={formMain}
            name="main-committee"
            onFinish={(values) => onFinish(values, "main")}
            scrollToFirstError
          >
            {/* Full Name Input */}
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your full name!",
                },
              ]}
            >
              <Input
                id="sign-up-main-name"
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Enter your full name"
              />
            </Form.Item>
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
                id="sign-up-main-email"
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
                id="sign-up-main-password"
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Enter password"
              />
            </Form.Item>
            {/* Confirm Password Input */}
            <Form.Item
              name="confirm"
              dependencies={["password"]}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: "Please confirm your password!",
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(
                        "The two passwords that you entered do not match!"
                      )
                    );
                  },
                }),
              ]}
            >
              <Input.Password
              id="sign-up-main-re-password"
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="Re-enter password"
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
                id="sign-up-main-code"
                prefix={<CodeOutlined className="site-form-item-icon" />}
                placeholder="Enter secret code"
              />
            </Form.Item>
            {/* Upload Profile Image Input */}
            <Form.Item
              name="upload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="logo"
                listType="picture"
                beforeUpload={beforeUpload}
              >
                <Button>
                  <UploadOutlined /> Click to upload
                </Button>
              </Upload>
            </Form.Item>
            {/* Sign Up Button */}
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                id="submit-main"
                style={{ width: "100%" }}
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
        {/* Sub Committee Registration Tab */}
        <TabPane tab="Sub Committee" key="sub">
          {/* Sub Committee Registration Form */}
          <Form
            form={formSub}
            name="sub-committee"
            onFinish={(values) => onFinish(values, "sub")}
            scrollToFirstError
          >
            {/* Full Name Input */}
            <Form.Item
              name="name"
              rules={[
                {
                  required: true,
                  message: "Please input your full name!",
                },
              ]}
            >
              <Input
                id="sign-up-sub-name"
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="Enter your full name"
              />
            </Form.Item>
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
                id="sign-up-sub-email"
                prefix={<MailOutlined className="site-form-item-icon" />}
                placeholder="Enter school Email"
              />
            </Form.Item>
            {/* Reasons for Joining Input */}
            <Form.Item
              name="reasonsForJoining"
              rules={[
                {
                  required: true,
                  message: "Please provide reasons for joining!",
                },
              ]}
            >
              <Input.TextArea
                prefix={
                  <QuestionCircleOutlined className="site-form-item-icon" />
                }
                id="sign-up-sub-reason"
                placeholder="Reasons for joining"
                rows={4}
              />
            </Form.Item>
            {/* Upload Profile Image Input */}
            <Form.Item
              name="upload"
              valuePropName="fileList"
              getValueFromEvent={normFile}
            >
              <Upload
                name="logo"
                listType="picture"
                beforeUpload={beforeUpload}
              >
                <Button>
                  <UploadOutlined /> Click to upload
                </Button>
              </Upload>
            </Form.Item>
            {/* Sign Up Button */}
            <Form.Item>
              <Button
              id="submit-sub"
                type="primary"
                htmlType="submit"
                style={{ width: "100%" }}
              >
                Sign Up
              </Button>
            </Form.Item>
          </Form>
        </TabPane>
      </Tabs>
      {/* Link to Sign In page */}
      <div style={{ textAlign: "center", marginTop: "1em" }}>
        Already a member?<Link to="login"> Sign In</Link>
      </div>
    </Card>
  );
};

// Export the SignUpForm component
export default SignUpForm;
