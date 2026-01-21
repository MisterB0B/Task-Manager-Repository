# LED STRINGERS TASK APP - Requirements Document

## App Overview
A cross-platform mobile task management application for LED stringing teams with role-based access control.

## User Roles

### Admin Capabilities:
- Create and manage job sites
- Create and assign tasks to users
- Manage team members and their permissions
- Assign users to specific job sites (single, multiple, or all)
- Monitor task progress in real-time
- Receive notifications when tasks are completed
- Receive notifications when tasks need supplies/time
- View and respond to task notes
- Dark/Light mode toggle

### User Capabilities:
- View assigned tasks
- Update task status (In Progress, Needs Supplies, Complete)
- Add notes to tasks explaining delays or supply needs
- Filter tasks by job site
- Dark/Light mode toggle
- Receive task assignments

## Core Features

### 1. Authentication System
- Secure login/logout
- Role-based access control (Admin/User)
- Session management
- Password protection

### 2. Job Site Management
- Create multiple job sites
- Edit job site details
- Delete job sites
- Assign users to job sites (one, multiple, or all)

### 3. Task Management
- Create tasks with:
  - Title and description
  - Assigned job site
  - Assigned user(s)
  - Due date/time
  - Priority level
  - Estimated completion time
- Task status workflow:
  - Pending → In Progress → Complete
  - Pending → Needs Supplies → Complete
- Task notes system

### 4. User Management
- Create user accounts
- Assign roles (Admin/User)
- Assign to job sites
- View user activity

### 5. Notification System
- Real-time notifications for admins
- Task completion alerts
- Supply requests alerts
- Time extension requests
- Task assignment notifications

### 6. UI/UX Features
- Dark/Light mode toggle
- Responsive design
- Intuitive navigation
- Status indicators
- Progress tracking

## Data Structure

### Users Table
- id (Primary Key)
- username
- email
- password (hashed)
- role (admin/user)
- created_at
- updated_at

### JobSites Table
- id (Primary Key)
- name
- address
- description
- created_at
- updated_at

### Tasks Table
- id (Primary Key)
- title
- description
- job_site_id (Foreign Key)
- assigned_user_id (Foreign Key)
- status (pending, in_progress, needs_supplies, complete)
- priority (low, medium, high)
- due_date
- estimated_hours
- created_at
- updated_at

### TaskNotes Table
- id (Primary Key)
- task_id (Foreign Key)
- user_id (Foreign Key)
- note_text
- note_type (status_update, supply_request, time_request)
- created_at

### UserJobSites Table
- user_id (Foreign Key)
- job_site_id (Foreign Key)
- assigned_at

## Technical Requirements

### Cross-Platform Support
- iOS (iPhone/iPad)
- Android (phones/tablets)

### Performance
- Fast task loading
- Real-time updates
- Offline capability (cached data)
- Efficient data synchronization

### Security
- Secure authentication
- Data encryption
- Role-based permissions
- Secure API endpoints