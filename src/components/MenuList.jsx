// Import necessary modules and components
import React from "react";
import { Menu, Modal } from "antd";
import { FaUserGroup } from "react-icons/fa6";
import { FaClipboardList, FaCalendarAlt } from "react-icons/fa";
import { MdEvent, MdAnnouncement, MdAccountCircle } from "react-icons/md";
import { IoLogOut } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";


function MenuList({ darkTheme }) {
  // Initialize React Router navigation
  const navigate = useNavigate();

  // Logout Function: Handles user logout by clearing session storage and navigating to '/'
  const Logout = () => {
    Modal.confirm({
      title: "Confirm Removal",
      content: "Are you sure you want to Log Out?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: () => {
        // Clear session storage
        sessionStorage.clear();
        localStorage.clear()
        // Navigate user to '/'
        navigate("/");
      },
      onCancel: () => {},
    });
  };

  // Render the menu with links to different sections 
  return (
    <Menu
      theme={darkTheme ? "dark" : "light"}
      mode="inline"
      className="menu-bar"
    >
      <Menu.Item key="member" icon={<FaUserGroup />}>
        <Link to="/members">Member</Link>
      </Menu.Item>

      <Menu.SubMenu key="event" icon={<MdEvent />} title="Event">
        <Menu.Item key="add-event">
          <Link to="/events/add">Add Event</Link>
        </Menu.Item>

        <Menu.Item key="manage-event">
          <Link to="/events/manage">Manage Event</Link>
        </Menu.Item>
      </Menu.SubMenu>

      <Menu.Item key="attendance" icon={<FaClipboardList />}>
        <Link to="/attendance">Attendance</Link>
      </Menu.Item>

      <Menu.Item key="eventCalendar" icon={<FaCalendarAlt />}>
        <Link to="/event-calendar">Event Calendar</Link>
      </Menu.Item>

      <Menu.Item key="announcement" icon={<MdAnnouncement />}>
        <Link to="/announcement">Announcement</Link>
      </Menu.Item>

      <Menu.Item key="account" icon={<MdAccountCircle />}>
        <Link to="/account">Account</Link>
      </Menu.Item>

      <Menu.Item key="log-out" icon={<IoLogOut />} onClick={Logout}>
        Log Out
      </Menu.Item>
      
    </Menu>
  );
}

// Export the MenuList component for use in other parts of the application
export default MenuList;
