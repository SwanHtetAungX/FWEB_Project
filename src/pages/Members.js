// Import Necessary Libraries
import React, { useState, useEffect } from "react";
import { Table, Spin, Tag, Space, Button, message, Modal } from "antd";
import { IoMdPersonAdd } from "react-icons/io";
import { Link } from "react-router-dom";

function Members() {
  // State variables for members, approved members, pending members, loading, and member display filter
  const [members, setMembers] = useState([]);
  const [approvedMembers, setApprovedMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllMembers, setShowAllMembers] = useState(true);
  const token = localStorage.getItem("token");
  // useEffect hook to fetch members data on component mount
  useEffect(() => {
    fetchMembers();
  }, []);

  // Function to fetch members data from the server
  const fetchMembers = () => {
    fetch("http://localhost:5050/members", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        // Filter members based on approval status
        setMembers(data);
        setApprovedMembers(
          data.filter((member) => member.approvalStatus === "Approved")
        );
        setPendingMembers(
          data.filter((member) => member.approvalStatus === "Pending")
        );
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching members:", error);
        setLoading(false);
      });
  };

  // Function to handle member approval
  const handleApprove = async (record) => {
    try {
      // Send a PATCH request to update member approval status
      const response = await fetch(
        `http://localhost:5050/members/${record._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            approvalStatus: "Approved",
            name: record.name,
            email: record.email,
            role: record.role,
            profileImg: record.profileImg,
            password: record.password,
            joinedDate: record.joinedDate,
            reason: record.reason,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to approve member");
      }
      const emailResponse = await fetch("http://localhost:5050/members/send-approval-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        email: record.email,
        name: record.name,
      }),
    });

    if (!emailResponse.ok) {
      throw new Error("Failed to send approval email");
    }

      // Update the state after successful approval
      fetchMembers();

      // Display a success message
      message.success("Member approved successfully");
    } catch (error) {
      // Display an error message if something goes wrong
      console.error("Error approving member:", error);
      message.error("Failed to approve member");
    }
  };

  // Function to handle member removal
  const handleRemove = (record) => {
    // Display a confirmation modal before removal
    Modal.confirm({
      title: "Confirm Removal",
      content: `Are you sure you want to remove ${record.name}?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          // Send a DELETE request to remove the member
          const response = await fetch(
            `http://localhost:5050/members/${record._id}`,

            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
              method: "DELETE",
            }
          );

          if (!response.ok) {
            throw new Error("Failed to remove member");
          }

          // Update the state after successful removal
          fetchMembers();

          // Display a success message
          message.success("Member removed successfully");
        } catch (error) {
          // Display an error message if something goes wrong
          console.error("Error removing member:", error);
          message.error("Failed to remove member");
        }
      },
      onCancel: () => {
        // Do nothing if the user cancels the removal
      },
    });
  };

  // Columns configuration for pending members table
  const pendingMemberColumns = [
    {
      title: "Profile Image",
      dataIndex: "profileImg",
      key: "profileImg",
      render: (text, record) => (
        <div className="profile-img-container">
          <img src={record.profileImg} alt="Profile" className="profile-img" />
        </div>
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Reason For Joining", dataIndex: "reason", key: "reason" },
    {
      title: "Action",
      key: "action",
      render: (text, record) =>
        record.role === "Sub Committee" && (
          <Space size="middle">
            {/* Button to approve the pending member */}
            <Button type="primary" onClick={() => handleApprove(record)}>
              Approve
            </Button>
            {/* Button to reject/remove the pending member */}
            <Button danger onClick={() => handleRemove(record)}>
              Reject
            </Button>
          </Space>
        ),
    },
  ];

  // Columns configuration for approved members table
  const approvedMembersColumns = [
    {
      title: "Profile Image",
      dataIndex: "profileImg",
      key: "profileImg",
      render: (text, record) => (
        <div className="profile-img-container">
          <img src={record.profileImg} alt="Profile" className="profile-img" />
        </div>
      ),
    },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "Main Committee" ? "blue" : "green"}>{role}</Tag>
      ),
    },
    { title: "Date Joined", dataIndex: "joinedDate", key: "joinedDate" },
    {
      title: "Action",
      key: "action",
      render: (text, record) =>
        record.role === "Sub Committee" && (
          <Space size="middle">
            {/* Button to navigate to the member edit page */}
            <Link to={`/edit-member/${record._id}`}>
              <Button type="primary">Edit</Button>
            </Link>
            {/* Button to remove the approved member */}
            <Button danger onClick={() => handleRemove(record)}>
              Remove
            </Button>
          </Space>
        ),
    },
  ];

  // Function to handle showing all members
  const handleAllMembers = () => {
    setShowAllMembers(true);
  };

  // Function to handle showing only pending members
  const handlePendingMembers = () => {
    setShowAllMembers(false);
  };

  // Render the Members component UI
  return (
    <div className="memberPage">
      <div className="memberPage-content">
        <h2>Members</h2>
        {/* Filter buttons to toggle between all members and pending members */}
        <div className="memberPage-buttons">
          <Button
            type={showAllMembers ? "primary" : "default"}
            shape="round"
            size="large"
            onClick={handleAllMembers}
            id="all-member-button"
          >
            All Members
          </Button>
          <Button
            type={showAllMembers ? "default" : "primary"}
            shape="round"
            size="large"
            onClick={handlePendingMembers}
          >
            Pending
          </Button>
          {/* Button to add a new member */}
          <Button
            type="dashed"
            icon={<IoMdPersonAdd />}
            size="large"
            id="add-member-button"
          >
            <Link to="/add-member">Add Members</Link>
          </Button>
        </div>
        {/* Display a loading spinner while fetching data */}
        {loading ? (
          <Spin size="large" />
        ) : showAllMembers ? (
          // Display approved members table
          <Table
            dataSource={approvedMembers}
            columns={approvedMembersColumns}
            pagination={{ pageSize: 5 }}
          />
        ) : (
          // Display pending members table
          <Table dataSource={pendingMembers} columns={pendingMemberColumns} />
        )}
      </div>
    </div>
  );
}

// Export the Members component
export default Members;
