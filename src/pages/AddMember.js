// Import nessary Libraries and Components
import React, { useState } from "react";
import { Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";


const MyForm = () => {
  // State variable for S3 file URL
  const [fileS3Url, setFileS3Url] = useState("");

  // Callback function when form is submitted
  const onFinish = async (values) => {
    try {
      // Prepare data to be sent in the POST request
      const dataToSend = {
        name: values.name,
        email: values.email,
        profileImg: fileS3Url,
        role: "Sub Committee", 
        password: "N.A",
        approvalStatus: "Approved",
        secretCode: "N.A",
        joinedDate: new Date().toISOString().slice(0, 10),
      };

      // Send POST request to add a new member
      const response = await fetch("http://localhost:5050/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse and log the server response
      const responseData = await response.json();
      console.log("Server response:", responseData);
      // Display success message
      message.success("Member added successfully");
    } catch (error) {
      // Log and display error message if adding member fails
      console.error("Error adding member:", error);
      message.error("Error adding member. Please try again.");
    }
  };

  // Normalize file function for Ant Design Upload
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  // Function to handle file upload before submitting the form
  const beforeUpload = async (file) => {
    try {
      // Fetch pre-signed URL from AWS Lambda function
      const response = await axios.get(
        `https://h4pln1et19.execute-api.us-east-1.amazonaws.com/default/getPresignedUrl?fileType=${
          file.type.split("/")[1]
        }`
      );
      const uploadURL = response.data.uploadURL;
      const S3Url = uploadURL.split("?")[0];

      // Set the S3Url in the component state
      setFileS3Url(S3Url);

      // Upload file to S3
      const result = await fetch(uploadURL, {
        method: "PUT",
        body: file,
      });

      if (!result.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
      }

      return false;
    } catch (error) {
      // Log and display error message if file upload fails
      console.error("Error uploading file:", error);
      message.error("Error uploading file. Please try again.");
      return false;
    }
  };

  // Render the MyForm component UI
  return (
    <div className="addMember">
      <h2 style={{ textAlign: "center", color: "white", marginBottom: "50px" }}>
        Add A New Member
      </h2>
      {/* Form for adding a new member */}
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        onFinish={onFinish}
        autoComplete="off"
      >
        {/* Input field for entering the name */}
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input your name!" }]}
          style={{ marginBottom: "40px" }}
        >
          <Input style={{ width: "400px" }} />
        </Form.Item>

        {/* Input field for entering the email */}
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            {
              type: "email",
              message: "Please enter a valid email address!",
            },
          ]}
          style={{ marginBottom: "40px" }}
        >
          <Input style={{ width: "400px" }} />
        </Form.Item>

        {/* Upload.Dragger component for uploading a profile image */}
        <Form.Item
          label="Image"
          name="profileImg"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          extra={
            <p style={{ color: "#ffffff" }}>
              You can only upload JPG/PNG file.
            </p>
          }
        >
          <Upload.Dragger
            beforeUpload={beforeUpload}
            listType="picture-card"
            style={{ width: "400px", height: "1000px" }}
          >
            <div style={{ opacity: "0.5" }}>
              
              <UploadOutlined
                style={{
                  color: "white",
                  fontSize: "30px",
                  marginTop: "40px",
                }}
              />
              <p
                className="ant-upload-text"
                style={{ height: "100px", color: "white" }}
              >
                Browse or drag file
              </p>
            </div>
          </Upload.Dragger>
        </Form.Item>

        {/* Submit button */}
        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

// Export the MyForm component
export default MyForm;
