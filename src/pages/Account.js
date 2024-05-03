// Import necessary library and components
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Form, Input, Button, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

// Account Component Definition
function Account() {
  // State variables for S3 file URL, member data, and form
  const [fileS3Url, setFileS3Url] = useState("");
  const [memberData, setMemberData] = useState(null);
  const [form] = Form.useForm();
  const token = localStorage.getItem("token");

  // Retrieve user ID from session storage
  const id = sessionStorage.getItem('userId');
  console.log(id);

  // Callback function when form is submitted
  const onFinish = async (values) => {
    try {
      let updatedProfileImg = fileS3Url;

      if (!updatedProfileImg) {
        updatedProfileImg = memberData?.profileImg || "";
      }

      // Prepare data to be sent in the PATCH request
      const dataToSend = {
        name: values.name,
        email: values.email,
        profileImg: updatedProfileImg,
        role: "Main Committee", 
        password: memberData.password,
        approvalStatus: "Approved",
      };

      // Send PATCH request to update member information
      const response = await fetch(`http://localhost:5050/members/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
      message.success("Member Updated successfully");
    } catch (error) {
      // Log and display error message if updating member fails
      console.error("Error Updating member:", error);
      message.error("Error Updating member. Please try again.");
    }
  };

  // Normalize file function for  Upload
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
        `https://h4pln1et19.execute-api.us-east-1.amazonaws.com/default/getPresignedUrl?fileType=${file.type.split("/")[1]}`
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

  // Fetch member data based on user ID 
  useEffect(() => {
    async function getMemberById() {
      try {
        const response = await fetch(`http://localhost:5050/members/${id}`,
      {headers: {
          "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
      });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();
        // Set member data and populate form fields
        setMemberData(data);
        form.setFieldsValue({
          name: data.name,
          email: data.email,
        });
      } catch (error) {
        // Log error if fetching member data fails
        console.error("Error fetching member data:", error);
      }
    }

    // Call the getMemberById function
    getMemberById();
  }, [id]);

  // Render the Account component UI
  return (
    <div className="editMember">
      <h2 style={{ textAlign: "center", color: "white", marginBottom: "50px" }}>
        Account Details
      </h2>

      {/*  Form for updating account information */}
      <Form
        name="basic"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        initialValues={memberData}
        form={form}
        onFinish={onFinish}
        autoComplete="off"
      >
        <Form.Item style={{ marginLeft: "285px", marginBottom: "20px" }}>
          {/* Display the existing profile image */}
          <img src={memberData?.profileImg} id="edit-image-preview" alt="Profile" />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please input your name!" }]}
          style={{ marginBottom: "40px" }}
        >
          {/* Input field for updating the name */}
          <Input style={{ width: "400px" }} />
        </Form.Item>

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
          {/* Input field for updating the email */}
          <Input style={{ width: "400px" }} />
        </Form.Item>

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
          {/* Upload.Dragger component for updating the profile image */}
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

        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
         
          <Button type="primary" htmlType="submit">
            Update
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

// Export the Account 
export default Account;
